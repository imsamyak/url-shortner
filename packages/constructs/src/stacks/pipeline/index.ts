import type { Construct } from "constructs";
import type { StackProps } from "aws-cdk-lib";

import {
  buildStackNamespace,
  type StackContext,
} from "../../core/index.js";
import type { PipelineStackConfig } from "./config.js";
import { PipelineStack } from "./stack.js";

export function buildPipelineStack(
  scope: Construct,
  context: StackContext,
  config: PipelineStackConfig,
  props: StackProps = {},
): PipelineStack {
  const namespace = buildStackNamespace(context);

  return new PipelineStack(scope, `${namespace}-pipeline`, {
    ...props,
    namespace,
    config,
  });
}

export * from "./config.js";
export * from "./stack.js";
