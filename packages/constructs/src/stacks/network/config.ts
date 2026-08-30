import type { VpcProps } from "aws-cdk-lib/aws-ec2";

export interface NetworkVpcConfig {
  readonly id: string;
  readonly vpc: VpcProps;
}

export type NetworkStackConfig = readonly NetworkVpcConfig[];
