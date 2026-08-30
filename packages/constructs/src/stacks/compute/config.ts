import type { AutoScalingGroupProps } from "aws-cdk-lib/aws-autoscaling";
import type { IVpc, VpcAttributes } from "aws-cdk-lib/aws-ec2";
import type { IRepository } from "aws-cdk-lib/aws-ecr";
import type {
  AddApplicationTargetsProps,
  ApplicationLoadBalancerProps,
  BaseApplicationListenerProps,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";

/** Import contract used when another service owns the VPC stack. */
export interface ComputeVpcImport {
  readonly id: string;
  readonly attributes: VpcAttributes;
}

export interface ComputeServiceConfig {
  /** Stable CDK construct id and key in ComputeStack.services. */
  readonly id: string;
  readonly vpc: IVpc | ComputeVpcImport;
  readonly autoScalingGroup: Omit<AutoScalingGroupProps, "vpc">;
  readonly pullRepositories?: readonly IRepository[];
  readonly loadBalancer?: {
    readonly loadBalancer: Omit<ApplicationLoadBalancerProps, "vpc">;
    readonly listener: BaseApplicationListenerProps;
    readonly targetGroup: Omit<AddApplicationTargetsProps, "targets">;
  };
}

export type ComputeStackConfig = readonly ComputeServiceConfig[];
