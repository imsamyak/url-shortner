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

/** 
 * Owns the Express Docker image repository.
 * This is split into its own stack so that the repository (which holds data)
 * has a different lifecycle than the compute or pipeline stacks.
 */
export class RepositoryStack extends Stack {

  /**
   * Static factory method to build the Repository Stack.
   */
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
      description: "Express Docker image repository",
    });

    // Create the ECR repository and export its Name and ARN 
    // for other stacks (Compute & Pipeline) to import.
    buildEcrRepository(this, "server", {
      namespace,
      props: config.repository,
    });
  }
}
