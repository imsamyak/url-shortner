import type { VpcProps } from "aws-cdk-lib/aws-ec2";

export interface NetworkStackConfig {
    vpc: VpcProps
}

export default NetworkStackConfig;