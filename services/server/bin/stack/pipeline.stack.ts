import { Stack, type StackProps } from "aws-cdk-lib";
import { Role } from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

import {
  buildPipeline,
  getEcrRepository,
} from "@app/infra-core/constructs.js";

import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";
import type ServerPipelineConfig from "../types/pipeline-config.js";

export interface PipelineStackProps extends StackProps {
  readonly namespace: string;
  readonly config: ServerPipelineConfig;
}

/** 
 * Owns the Express Docker build and EC2 CodeDeploy delivery pipeline.
 * Automates CI/CD from GitHub to the EC2 instances.
 */
export class PipelineStack extends Stack {

  /**
   * Static factory method to build the Pipeline Stack.
   */
  public static build(
    scope: Construct,
    ctx: StackContext,
  ): PipelineStack {
    const config = loadConfig(ctx.env, "pipeline", ctx.namespace);
    return new PipelineStack(scope, ctx.id, {
      namespace: ctx.namespace,
      config,
    });
  }

  private constructor(
    scope: Construct,
    id: string,
    props: PipelineStackProps,
  ) {
    const { namespace, config, ...stackProps } = props;

    super(scope, id, {
      ...stackProps,
      stackName: namespace,
      description: "Docker delivery pipeline for the Express service",
    });

    // Import the ECR repository created by the Repository Stack
    // We need this so CodePipeline knows where to push the built Docker image.
    const repository = getEcrRepository(
      this,
      config.repository.id,
      config.repository.namespace,
    );

    // Build the CI/CD Pipeline (Source -> Build -> Deploy)
    const resources = buildPipeline(this, "server", {
      namespace,
      ...config.pipeline,
      build: {
        ...config.pipeline.build,
        pushRepositories: [repository], // Grant CodeBuild permission to push to ECR
      },
    });

    // Import the IAM Role attached to our EC2 instances (from the Compute stack)
    const computeRole = Role.fromRoleArn(
      this,
      "compute-instance-role",
      config.computeRoleArn,
      { mutable: true },
    );

    // Grant the EC2 instances permission to read from the CodePipeline artifact bucket
    // so that the CodeDeploy agent on the server can download the deployment bundle.
    resources.pipeline.artifactBucket.grantRead(computeRole);
  }
}
