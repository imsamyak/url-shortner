import type { DistributionProps } from "aws-cdk-lib/aws-cloudfront";

export interface CdnDistributionConfig {
  readonly id: string;
  readonly distribution: DistributionProps;
}

export type CdnStackConfig = readonly CdnDistributionConfig[];
