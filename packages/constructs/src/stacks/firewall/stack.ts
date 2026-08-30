import { Stack } from "aws-cdk-lib";
import type { CfnWebACL } from "aws-cdk-lib/aws-wafv2";
import type { Construct } from "constructs";

import type { StackOptions } from "../../core/index.js";
import type { FirewallStackConfig } from "./config.js";
import { buildFirewalls } from "./utils/index.js";

export class FirewallStack extends Stack {
  public readonly firewalls: Readonly<Record<string, CfnWebACL>>;

  constructor(
    scope: Construct,
    id: string,
    options: StackOptions<FirewallStackConfig>,
  ) {
    const { namespace, config, ...stackProps } = options;

    super(scope, id, stackProps);

    this.firewalls = buildFirewalls(this, namespace, config);
  }
}
