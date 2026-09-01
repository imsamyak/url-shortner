import { Stack, type StackProps } from "aws-cdk-lib";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

import {
  buildApplicationLoadBalancer,
  buildAutoScalingGroup,
  getDynamoDbTable,
  getEcrRepository,
  getLogGroup,
  getVpc,
} from "@app/infra-core/constructs.js";

import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";
import type ServerComputeConfig from "../types/compute-config.js";

export interface ComputeStackProps extends StackProps {
  readonly namespace: string;
  readonly config: ServerComputeConfig;
}

/** 
 * Owns the private, auto-scaled Express container fleet and internal ALB. 
 * This stack is responsible for the actual runtime of the application server.
 */
export class ComputeStack extends Stack {
  
  /**
   * Static factory method to build the stack.
   * This encapsulates the configuration fetching logic (getComputeConfig)
   * so the caller doesn't have to wire it up manually.
   */
  public static build(
    scope: Construct,
    ctx: StackContext,
  ): ComputeStack {
    const config = loadConfig(ctx.env, "compute", ctx.namespace);
    return new ComputeStack(scope, ctx.id, {
      namespace: ctx.namespace,
      config,
    });
  }

  private constructor(
    scope: Construct,
    id: string,
    props: ComputeStackProps,
  ) {
    const { namespace, config, ...stackProps } = props;

    super(scope, id, {
      ...stackProps,
      stackName: namespace,
      description: "Private auto-scaled Express container service",
    });

    const { deployment, imports } = config;

    // --- Cross-Stack Imports ---
    // We import these resources from other stacks (like the core platform)
    // using CloudFormation 'Fn.importValue' under the hood. 
    const vpc = getVpc(
      this,
      imports.vpc.id,
      imports.vpc.namespace,
    );

    const table = getDynamoDbTable(
      this,
      imports.table.id,
      imports.table.namespace,
    );

    const logGroup = getLogGroup(
      this,
      imports.logGroup.id,
      imports.logGroup.namespace,
    );

    const repository = getEcrRepository(
      this,
      imports.repository.id,
      imports.repository.namespace,
    );

    // --- Core Resources ---
    // Create the Auto Scaling Group (ASG) which launches our EC2 instances.
    const autoScalingGroup = buildAutoScalingGroup(this, "server", {
      namespace,
      vpc,
      props: config.autoScalingGroup,
      pullRepositories: [repository],
      cpuTargetUtilizationPercent: config.cpuTargetUtilizationPercent,
      instanceTags: config.instanceTags,
    });

    // Create the internal Application Load Balancer to route traffic to the ASG.
    buildApplicationLoadBalancer(this, "server", {
      namespace,
      vpc,
      ...config.loadBalancer,
      targets: [autoScalingGroup],
    });

    // --- IAM Permissions ---
    // Grant the EC2 instances permission to read/write to the DynamoDB table
    table.grantReadWriteData(autoScalingGroup.role);
    
    // Grant the EC2 instances permission to stream logs to CloudWatch
    logGroup.grantWrite(autoScalingGroup.role);
    
    // Attach the SSM Managed Policy so we can use Session Manager to SSH into instances
    autoScalingGroup.role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
    );

    // Import the secret containing our runtime environment variables
    const runtimeSecret = Secret.fromSecretNameV2(
      this,
      "runtime-secret",
      deployment.runtimeSecretName,
    );

    // Grant the EC2 instances permission to read the secret on boot
    runtimeSecret.grantRead(autoScalingGroup.role);
  }
}
