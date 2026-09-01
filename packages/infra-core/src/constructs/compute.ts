import { CfnOutput, Tags, type Stack } from "aws-cdk-lib";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import {
  AutoScalingGroup,
  type AutoScalingGroupProps,
} from "aws-cdk-lib/aws-autoscaling";
import { LaunchTemplate, SecurityGroup, KeyPair, type IVpc } from "aws-cdk-lib/aws-ec2";
import type { IRepository } from "aws-cdk-lib/aws-ecr";

export interface AutoScalingGroupConfig {
  readonly namespace: string;
  readonly vpc: IVpc;
  readonly props: Omit<AutoScalingGroupProps, "vpc">;
  readonly pullRepositories?: readonly IRepository[];
  readonly cpuTargetUtilizationPercent?: number;
  readonly instanceTags?: Readonly<Record<string, string>>;
}

/** Builds one EC2 Auto Scaling Group for an application service. */
export function buildAutoScalingGroup(
  stack: Stack,
  id: string,
  config: AutoScalingGroupConfig,
): AutoScalingGroup {
  const { machineImage, instanceType, userData, keyName, keyPair, securityGroup, ...restProps } = config.props as any;

  const role = new Role(stack, `${id}-role`, {
    assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
  });

  const sg = securityGroup ?? new SecurityGroup(stack, `${id}-sg`, {
    vpc: config.vpc,
    allowAllOutbound: true,
  });

  const launchTemplate = new LaunchTemplate(stack, `${id}-lt`, {
    machineImage,
    instanceType,
    userData,
    keyPair: keyPair ?? (keyName ? KeyPair.fromKeyPairName(stack, `${id}-keypair`, keyName) : undefined),
    securityGroup: sg,
    requireImdsv2: true,
    role,
  });

  const autoScalingGroup = new AutoScalingGroup(stack, `${id}-asg`, {
    ...restProps,
    vpc: config.vpc,
    machineImage: undefined as any,
    instanceType: undefined as any,
    userData: undefined,
    launchTemplate,
  });

  config.pullRepositories?.forEach((repository) => {
    repository.grantPull(autoScalingGroup.role);
  });

  if (config.cpuTargetUtilizationPercent !== undefined) {
    autoScalingGroup.scaleOnCpuUtilization(`${id}-cpu-scaling`, {
      targetUtilizationPercent: config.cpuTargetUtilizationPercent,
    });
  }

  Object.entries(config.instanceTags ?? {}).forEach(([key, value]) => {
    Tags.of(autoScalingGroup).add(key, value, {
      applyToLaunchedInstances: true,
    });
  });

  new CfnOutput(stack, `${id}-instance-role-arn`, {
    value: autoScalingGroup.role.roleArn,
    exportName: `${config.namespace}-${id}-instance-role-arn`,
  });

  return autoScalingGroup;
}
