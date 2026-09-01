import { Stack, type StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";

import { buildEcrRepository } from "@app/infra-core/constructs.js";

import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";
import type RepositoryConfig from "../types/repository-config.js";

export interface RepositoryStackProps extends StackProps {
  readonly namespace: string;
  readonly config: RepositoryConfig;
}

/** Owns the Nuxt Docker image repository. */
export class RepositoryStack extends Stack {
  public static build(
    scope: Construct,
    ctx: StackContext,
  ): RepositoryStack {
    const config = loadConfig(ctx.env, "repository", ctx.namespace);
    return new RepositoryStack(scope, ctx.id, {
      namespace: ctx.namespace,
      config,
    });
  }

  private constructor(
    scope: Construct,
    id: string,
    props: RepositoryStackProps,
  ) {
    const { namespace, config, ...stackProps } = props;

    super(scope, id, {
      ...stackProps,
      stackName: namespace,
      description: "Nuxt Docker image repository",
    });

    buildEcrRepository(this, "client", {
      namespace,
      props: config.repository,
    });
  }
}
