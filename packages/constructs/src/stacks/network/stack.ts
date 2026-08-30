import { Stack } from "aws-cdk-lib";
import type { Vpc } from "aws-cdk-lib/aws-ec2";
import type { Construct } from "constructs";

import type { StackOptions } from "../../core/index.js";
import type { NetworkStackConfig } from "./config.js";
import { buildVpcs } from "./utils/index.js";

export class NetworkStack extends Stack {
  public readonly vpcs: Readonly<Record<string, Vpc>>;

  constructor(
    scope: Construct,
    id: string,
    options: StackOptions<NetworkStackConfig>,
  ) {
    const { namespace, config, ...stackProps } = options;

    super(scope, id, stackProps);

    this.vpcs = buildVpcs(this, namespace, config);
  }
}
