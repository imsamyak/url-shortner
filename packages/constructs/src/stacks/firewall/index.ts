import type { Construct } from "constructs";
import type { StackProps } from "aws-cdk-lib";

import {
  buildStackNamespace,
  type StackContext,
} from "../../core/index.js";
import type { FirewallStackConfig } from "./config.js";
import { FirewallStack } from "./stack.js";

export function buildFirewallStack(
  scope: Construct,
  context: StackContext,
  config: FirewallStackConfig,
  props: StackProps = {},
): FirewallStack {
  const namespace = buildStackNamespace(context);

  return new FirewallStack(scope, `${namespace}-firewall`, {
    ...props,
    namespace,
    config,
  });
}

export * from "./config.js";
export * from "./stack.js";
