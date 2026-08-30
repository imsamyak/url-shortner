import type { Construct } from "constructs";
import type { StackProps } from "aws-cdk-lib";

import {
  buildStackNamespace,
  type StackContext,
} from "../../core/index.js";
import type { CdnStackConfig } from "./config.js";
import { CdnStack } from "./stack.js";

export function buildCdnStack(
  scope: Construct,
  context: StackContext,
  config: CdnStackConfig,
  props: StackProps = {},
): CdnStack {
  const namespace = buildStackNamespace(context);

  return new CdnStack(scope, `${namespace}-cdn`, {
    ...props,
    namespace,
    config,
  });
}

export * from "./config.js";
export * from "./stack.js";
