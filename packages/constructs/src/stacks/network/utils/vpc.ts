import { CfnOutput } from "aws-cdk-lib";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import type { Construct } from "constructs";

import type { NetworkStackConfig } from "../config.js";

export function buildVpcs(
  scope: Construct,
  namespace: string,
  config: NetworkStackConfig,
): Readonly<Record<string, Vpc>> {
  const vpcs: Record<string, Vpc> = {};

  config.forEach(({ id, vpc: props }) => {
    if (vpcs[id]) {
      throw new Error(`Duplicate VPC id: ${id}`);
    }

    const vpc = new Vpc(scope, `vpc-${id}`, props);

    new CfnOutput(scope, `${id}-vpc-id`, {
      value: vpc.vpcId,
      exportName: `${namespace}-${id}-vpc-id`,
    });

    new CfnOutput(scope, `${id}-vpc-cidr`, {
      value: vpc.vpcCidrBlock,
      exportName: `${namespace}-${id}-vpc-cidr`,
    });

    vpc.publicSubnets.forEach((subnet, index) => {
      const position = index + 1;

      new CfnOutput(scope, `${id}-public-subnet-${position}-id`, {
        value: subnet.subnetId,
        exportName: `${namespace}-${id}-public-subnet-${position}-id`,
      });
      new CfnOutput(scope, `${id}-public-subnet-${position}-az`, {
        value: subnet.availabilityZone,
        exportName: `${namespace}-${id}-public-subnet-${position}-az`,
      });
      new CfnOutput(scope, `${id}-public-subnet-${position}-route-table-id`, {
        value: subnet.routeTable.routeTableId,
        exportName: `${namespace}-${id}-public-subnet-${position}-route-table-id`,
      });
    });

    vpc.privateSubnets.forEach((subnet, index) => {
      const position = index + 1;

      new CfnOutput(scope, `${id}-private-subnet-${position}-id`, {
        value: subnet.subnetId,
        exportName: `${namespace}-${id}-private-subnet-${position}-id`,
      });
      new CfnOutput(scope, `${id}-private-subnet-${position}-az`, {
        value: subnet.availabilityZone,
        exportName: `${namespace}-${id}-private-subnet-${position}-az`,
      });
      new CfnOutput(scope, `${id}-private-subnet-${position}-route-table-id`, {
        value: subnet.routeTable.routeTableId,
        exportName: `${namespace}-${id}-private-subnet-${position}-route-table-id`,
      });
    });

    vpcs[id] = vpc;
  });

  return vpcs;
}
