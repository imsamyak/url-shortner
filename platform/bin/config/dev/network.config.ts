import { IpAddresses, SubnetType } from "aws-cdk-lib/aws-ec2";
import NetworkConfig from "../../types/network-config.js";

/** Builds the shared network configuration from its resolved stack namespace. */
export function getNetworkConfig(namespace: string): NetworkConfig {
  return {
    vpc: {
      vpcName: `${namespace}-vpc`,
      ipAddresses: IpAddresses.cidr("10.20.0.0/16"),
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: "public",
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "application",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
    }
  };
}

export default getNetworkConfig;