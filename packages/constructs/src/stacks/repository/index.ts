import type { Construct } from "constructs";
import type { StackProps } from "aws-cdk-lib";

import {
  buildStackNamespace,
  type StackContext,
} from "../../core/index.js";
import type { RepositoryStackConfig } from "./config.js";
import { RepositoryStack } from "./stack.js";

export function buildRepositoryStack(
  scope: Construct,
  context: StackContext,
  config: RepositoryStackConfig,
  props: StackProps = {},
): RepositoryStack {
  const namespace = buildStackNamespace(context);

  return new RepositoryStack(scope, `${namespace}-repository`, {
    ...props,
    namespace,
    config,
  });
}

export * from "./config.js";
export * from "./stack.js";
