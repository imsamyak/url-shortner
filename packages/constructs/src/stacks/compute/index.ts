import type { Construct } from "constructs";
import type { StackProps } from "aws-cdk-lib";

import {
  buildStackNamespace,
  type StackContext,
} from "../../core/index.js";
import type { ComputeStackConfig } from "./config.js";
import { ComputeStack } from "./stack.js";

export function buildComputeStack(
  scope: Construct,
  context: StackContext,
  config: ComputeStackConfig,
  props: StackProps = {},
): ComputeStack {
  const namespace = buildStackNamespace(context);

  return new ComputeStack(scope, `${namespace}-compute`, {
    ...props,
    namespace,
    config,
  });
}

export * from "./config.js";
export * from "./stack.js";
