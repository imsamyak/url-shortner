import { CfnOutput, Fn, type Stack } from "aws-cdk-lib";
import { Port, type IConnectable, type IVpc } from "aws-cdk-lib/aws-ec2";
import {
  ApplicationLoadBalancer,
  type AddApplicationTargetsProps,
  type ApplicationListener,
  type ApplicationLoadBalancerProps,
  type ApplicationTargetGroup,
  type BaseApplicationListenerProps,
  type IApplicationLoadBalancer,
  type IApplicationLoadBalancerTarget,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface ApplicationLoadBalancerConfig {
  readonly namespace: string;
  readonly vpc: IVpc;
  readonly exportSecurityGroupId?: boolean;
  readonly props: Omit<ApplicationLoadBalancerProps, "vpc">;
  readonly listener: BaseApplicationListenerProps;
  readonly targetGroup: Omit<
    AddApplicationTargetsProps,
    "targets" | "port"
  > & {
    readonly port: number;
  };
  readonly targets: readonly (IApplicationLoadBalancerTarget & IConnectable)[];
}

export interface ApplicationLoadBalancerResources {
  readonly loadBalancer: ApplicationLoadBalancer;
  readonly listener: ApplicationListener;
  readonly targetGroup: ApplicationTargetGroup;
}

/** Builds one application load balancer, listener, and target group. */
export function buildApplicationLoadBalancer(
  stack: Stack,
  id: string,
  config: ApplicationLoadBalancerConfig,
): ApplicationLoadBalancerResources {
  const loadBalancer = new ApplicationLoadBalancer(stack, `${id}-alb`, {
    ...config.props,
    vpc: config.vpc,
  });
  const listener = loadBalancer.addListener(
    `${id}-listener`,
    config.listener,
  );
  const targetGroup = listener.addTargets(`${id}-targets`, {
    ...config.targetGroup,
    targets: [...config.targets],
  });

  config.targets.forEach((target) => {
    target.connections.allowFrom(
      loadBalancer,
      Port.tcp(config.targetGroup.port),
      `Allow ${id} load balancer traffic`,
    );
  });

  const securityGroup = loadBalancer.connections.securityGroups[0];
  if (!securityGroup) {
    throw new Error(`Load balancer security group was not created for id: ${id}`);
  }

  new CfnOutput(stack, `${id}-arn`, {
    value: loadBalancer.loadBalancerArn,
    exportName: `${config.namespace}-${id}-alb-arn`,
  });

  new CfnOutput(stack, `${id}-dns`, {
    value: loadBalancer.loadBalancerDnsName,
    exportName: `${config.namespace}-${id}-alb-dns`,
  });

  if (config.exportSecurityGroupId) {
    new CfnOutput(stack, `${id}-security-group-id`, {
      value: securityGroup.securityGroupId,
      exportName: `${config.namespace}-${id}-alb-security-group-id`,
    });
  }

  return { loadBalancer, listener, targetGroup };
}

/** Imports an application load balancer from another CloudFormation stack. */
export function getApplicationLoadBalancer(
  stack: Stack,
  id: string,
  namespace: string,
): IApplicationLoadBalancer {
  return ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(
    stack,
    `imported-${id}-alb`,
    {
      loadBalancerArn: Fn.importValue(`${namespace}-${id}-alb-arn`),
      loadBalancerDnsName: Fn.importValue(`${namespace}-${id}-alb-dns`),
      securityGroupId: Fn.importValue(
        `${namespace}-${id}-alb-security-group-id`,
      ),
    },
  );
}
