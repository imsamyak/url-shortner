import type { Construct } from "constructs";
import type { StackProps } from "aws-cdk-lib";

import {
  buildStackNamespace,
  type StackContext,
} from "../../core/index.js";
import type { DataStackConfig } from "./config.js";
import { DataStack } from "./stack.js";

export function buildDataStack(
  scope: Construct,
  context: StackContext,
  config: DataStackConfig,
  props: StackProps = {},
): DataStack {
  const namespace = buildStackNamespace(context);

  return new DataStack(scope, `${namespace}-data`, {
    ...props,
    namespace,
    config,
  });
}

export * from "./config.js";
export * from "./stack.js";
