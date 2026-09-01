import { Vpc, type IVpc, type VpcProps } from "aws-cdk-lib/aws-ec2";
import { CfnOutput, Fn, type Stack } from "aws-cdk-lib";


export function buildVpc(stack: Stack, id: string, config: {
    namespace: string,
    props: VpcProps
}) {

    const { namespace: prefix, props } = config;

    const vpc = new Vpc(stack, id, props);

    new CfnOutput(stack, "vpc-id", {
        value: vpc.vpcId,
        exportName: `${prefix}-vpc-id`,
    });

    vpc.publicSubnets.forEach((subnet, index) => {
        const position = index + 1;

        new CfnOutput(stack, `public-subnet-${position}-id`, {
            value: subnet.subnetId,
            exportName: `${prefix}-vpc-public-subnet-${position}-id`,
        });

        new CfnOutput(stack, `public-subnet-${position}-route-table-id`, {
            value: subnet.routeTable.routeTableId,
            exportName: `${prefix}-vpc-public-subnet-${position}-route-table-id`,
        });

    });

    vpc.privateSubnets.forEach((subnet, index) => {
        const position = index + 1;

        new CfnOutput(stack, `private-subnet-${position}-id`, {
            value: subnet.subnetId,
            exportName: `${prefix}-vpc-private-subnet-${position}-id`,
        });

        new CfnOutput(stack, `private-subnet-${position}-route-table-id`, {
            value: subnet.routeTable.routeTableId,
            exportName: `${prefix}-vpc-private-subnet-${position}-route-table-id`,
        });

    });

    return vpc;
}

/** Imports a VPC from another CloudFormation stack's exports. */
export function getVpc(
    stack: Stack,
    id: string,
    namespace: string,
    availabilityZoneCount = 2,
): IVpc {
    const positions = Array.from(
        { length: availabilityZoneCount },
        (_, index) => index + 1,
    );

    return Vpc.fromVpcAttributes(stack, id, {
        vpcId: Fn.importValue(`${namespace}-vpc-id`),
        availabilityZones: positions.map((position) =>
            Fn.select(position - 1, Fn.getAzs()),
        ),
        publicSubnetIds: positions.map((position) =>
            Fn.importValue(`${namespace}-vpc-public-subnet-${position}-id`),
        ),
        publicSubnetRouteTableIds: positions.map((position) =>
            Fn.importValue(
                `${namespace}-vpc-public-subnet-${position}-route-table-id`,
            ),
        ),
        privateSubnetIds: positions.map((position) =>
            Fn.importValue(`${namespace}-vpc-private-subnet-${position}-id`),
        ),
        privateSubnetRouteTableIds: positions.map((position) =>
            Fn.importValue(
                `${namespace}-vpc-private-subnet-${position}-route-table-id`,
            ),
        ),
    });
}

