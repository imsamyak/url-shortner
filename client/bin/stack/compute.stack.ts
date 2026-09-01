import { Stack, type StackProps } from "aws-cdk-lib";
import { Port } from "aws-cdk-lib/aws-ec2";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

import {
  buildApplicationLoadBalancer,
  buildAutoScalingGroup,
  getApplicationLoadBalancer,
  getEcrRepository,
  getLogGroup,
  getVpc,
} from "@app/infra-core/constructs.js";

import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";
import type ClientComputeConfig from "../types/compute-config.js";

export interface ComputeStackProps extends StackProps {
  readonly namespace: string;
  readonly config: ClientComputeConfig;
}

/** Owns the private Nuxt fleet and its public application load balancer. */
export class ComputeStack extends Stack {
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
      description: "Public auto-scaled Nuxt container service",
    });

    const { imports } = config;
    const vpc = getVpc(this, imports.vpc.id, imports.vpc.namespace);
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
    const serverLoadBalancer = getApplicationLoadBalancer(
      this,
      imports.serverLoadBalancer.id,
      imports.serverLoadBalancer.namespace,
    );

    const autoScalingGroup = buildAutoScalingGroup(this, "client", {
      namespace,
      vpc,
      props: config.autoScalingGroup,
      pullRepositories: [repository],
      cpuTargetUtilizationPercent: config.cpuTargetUtilizationPercent,
      instanceTags: config.instanceTags,
    });

    buildApplicationLoadBalancer(this, "client", {
      namespace,
      vpc,
      ...config.loadBalancer,
      targets: [autoScalingGroup],
    });

    serverLoadBalancer.connections.allowFrom(
      autoScalingGroup,
      Port.tcp(80),
      "Allow Nuxt instances to call the private Express load balancer",
    );
    logGroup.grantWrite(autoScalingGroup.role);
    autoScalingGroup.role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
    );
  }
}
