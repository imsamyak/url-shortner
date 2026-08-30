import { CfnOutput } from "aws-cdk-lib";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import type { Construct } from "constructs";

import type { CdnStackConfig } from "../config.js";

export function buildDistributions(
  scope: Construct,
  namespace: string,
  config: CdnStackConfig,
): Readonly<Record<string, Distribution>> {
  const distributions: Record<string, Distribution> = {};

  config.forEach(({ id, distribution: props }) => {
    if (distributions[id]) {
      throw new Error(`Duplicate CloudFront distribution id: ${id}`);
    }

    const distribution = new Distribution(scope, `cdn-${id}`, props);

    new CfnOutput(scope, `${id}-cdn-id`, {
      value: distribution.distributionId,
      exportName: `${namespace}-${id}-cdn-id`,
    });

    new CfnOutput(scope, `${id}-cdn-domain`, {
      value: distribution.distributionDomainName,
      exportName: `${namespace}-${id}-cdn-domain`,
    });

    distributions[id] = distribution;
  });

  return distributions;
}
