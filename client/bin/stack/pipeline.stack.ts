import { Stack, type StackProps } from "aws-cdk-lib";
import { Role } from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

import {
  buildPipeline,
  getEcrRepository,
} from "@app/infra-core/constructs.js";

import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";
import type ClientPipelineConfig from "../types/pipeline-config.js";

export interface PipelineStackProps extends StackProps {
  readonly namespace: string;
  readonly config: ClientPipelineConfig;
}

/** Owns the Nuxt Docker pipeline and post-deploy CDN invalidation. */
export class PipelineStack extends Stack {
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
      description: "Docker delivery pipeline for the Nuxt service",
    });

    const repository = getEcrRepository(
      this,
      config.repository.id,
      config.repository.namespace,
    );
    const resources = buildPipeline(this, "client", {
      namespace,
      ...config.pipeline,
      build: {
        ...config.pipeline.build,
        pushRepositories: [repository],
      },
      postDeploy: {
        ...config.pipeline.postDeploy,
        invalidateDistributionIds: [config.distributionId],
      },
    });
    const computeRole = Role.fromRoleArn(
      this,
      "compute-instance-role",
      config.computeRoleArn,
      { mutable: true },
    );

    resources.pipeline.artifactBucket.grantRead(computeRole);
  }
}
