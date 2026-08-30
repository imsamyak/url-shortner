import type { Construct } from "constructs";
import type { StackProps } from "aws-cdk-lib";

import {
  buildStackNamespace,
  type StackContext,
} from "../../core/index.js";
import type { NetworkStackConfig } from "./config.js";
import { NetworkStack } from "./stack.js";

export function buildNetworkStack(
  scope: Construct,
  context: StackContext,
  config: NetworkStackConfig,
  props: StackProps = {},
): NetworkStack {
  const namespace = buildStackNamespace(context);

  return new NetworkStack(scope, `${namespace}-network`, {
    ...props,
    namespace,
    config,
  });
}

export * from "./config.js";
export * from "./stack.js";
