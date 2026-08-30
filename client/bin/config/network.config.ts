import type { NetworkStackConfig } from "@app/constructs";
import { IpAddresses, SubnetType } from "aws-cdk-lib/aws-ec2";

import { clientDeploymentConfig } from "./deployment.config.js";

/** Nuxt-owned VPC exported for Express and future backend services. */
export const networkConfig: NetworkStackConfig = [
  {
    id: "application",
    vpc: {
      vpcName: `${clientDeploymentConfig.namespace}-application`,
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
    },
  },
];
