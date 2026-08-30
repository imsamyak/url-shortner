import { Stack } from "aws-cdk-lib";
import type { Distribution } from "aws-cdk-lib/aws-cloudfront";
import type { Construct } from "constructs";

import type { StackOptions } from "../../core/index.js";
import type { CdnStackConfig } from "./config.js";
import { buildDistributions } from "./utils/index.js";

export class CdnStack extends Stack {
  public readonly distributions: Readonly<Record<string, Distribution>>;

  constructor(
    scope: Construct,
    id: string,
    options: StackOptions<CdnStackConfig>,
  ) {
    const { namespace, config, ...stackProps } = options;

    super(scope, id, stackProps);

    this.distributions = buildDistributions(this, namespace, config);
  }
}
