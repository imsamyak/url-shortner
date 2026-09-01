import { CfnOutput, type Stack } from "aws-cdk-lib";
import {
  Distribution,
  type DistributionProps,
} from "aws-cdk-lib/aws-cloudfront";

export interface CdnConfig {
  readonly namespace: string;
  readonly props: DistributionProps;
}

/** Builds one CloudFront distribution and exports its identifiers. */
export function buildCdn(
  stack: Stack,
  id: string,
  config: CdnConfig,
): Distribution {
  const distribution = new Distribution(stack, id, config.props);

  new CfnOutput(stack, `${id}-id`, {
    value: distribution.distributionId,
    exportName: `${config.namespace}-${id}-distribution-id`,
  });

  new CfnOutput(stack, `${id}-domain-name`, {
    value: distribution.distributionDomainName,
    description: `${config.namespace} CloudFront domain name`,
  });

  return distribution;
}
