import { CfnOutput } from "aws-cdk-lib";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { Vpc, type IVpc } from "aws-cdk-lib/aws-ec2";
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationTargetGroup,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import type { Construct } from "constructs";

import type { ComputeServiceConfig, ComputeStackConfig } from "../config.js";

/**
 * Encapsulates the AWS CDK resources created for a single compute service.
 */
export interface ComputeServiceResources {
  /** The Auto Scaling Group managing the compute instances. */
  readonly autoScalingGroup: AutoScalingGroup;
  /** The Application Load Balancer routing traffic to the service, if configured. */
  readonly loadBalancer?: ApplicationLoadBalancer;
  /** The listener attached to the load balancer, if configured. */
  readonly listener?: ApplicationListener;
  /** The target group routing traffic from the listener to the ASG, if configured. */
  readonly targetGroup?: ApplicationTargetGroup;
}

/**
 * Resolves the VPC to use for the compute service.
 * If the config provides VPC attributes, it imports the VPC. Otherwise, it uses the provided VPC object.
 *
 * @param scope The parent CDK construct.
 * @param config The configuration for the compute service containing VPC details.
 * @returns The resolved IVpc instance.
 */
function resolveVpc(
  scope: Construct,
  config: ComputeServiceConfig,
): IVpc {
  if ("attributes" in config.vpc) {
    return Vpc.fromVpcAttributes(
      scope,
      `imported-vpc-${config.vpc.id}`,
      config.vpc.attributes,
    );
  }

  return config.vpc;
}

/**
 * Provisions a single compute service including an Auto Scaling Group and an optional Application Load Balancer.
 *
 * @param scope The parent CDK construct.
 * @param namespace The unique namespace for the stack, used for naming resources and exports.
 * @param config The configuration specifying how to build the compute service.
 * @returns The resources created for this compute service.
 */
function buildService(
  scope: Construct,
  namespace: string,
  config: ComputeServiceConfig,
): ComputeServiceResources {
  // Resolve the VPC where the compute instances will reside
  const vpc = resolveVpc(scope, config);

  // Provision the Auto Scaling Group (ASG) based on the provided configuration
  const autoScalingGroup = new AutoScalingGroup(scope, `asg-${config.id}`, {
    ...config.autoScalingGroup,
    vpc,
  });

  // Grant the ASG instances permission to pull from the specified ECR repositories
  config.pullRepositories?.forEach((repository) => {
    repository.grantPull(autoScalingGroup.role);
  });

  // Export the ASG name for cross-stack reference
  new CfnOutput(scope, `${config.id}-asg-name`, {
    value: autoScalingGroup.autoScalingGroupName,
    exportName: `${namespace}-${config.id}-asg-name`,
  });

  // If no load balancer is configured, return just the ASG
  if (!config.loadBalancer) {
    return { autoScalingGroup };
  }

  // Provision the Application Load Balancer (ALB) for the service
  const loadBalancer = new ApplicationLoadBalancer(
    scope,
    `alb-${config.id}`,
    {
      ...config.loadBalancer.loadBalancer,
      vpc,
    },
  );

  // Add a listener to the ALB to process incoming requests
  const listener = loadBalancer.addListener(
    `listener-${config.id}`,
    config.loadBalancer.listener,
  );

  // Attach the ASG to the listener via a Target Group
  const targetGroup = listener.addTargets(`targets-${config.id}`, {
    ...config.loadBalancer.targetGroup,
    targets: [autoScalingGroup],
  });

  // Export the ALB ARN and DNS name for cross-stack reference and DNS configuration
  new CfnOutput(scope, `${config.id}-alb-arn`, {
    value: loadBalancer.loadBalancerArn,
    exportName: `${namespace}-${config.id}-alb-arn`,
  });

  new CfnOutput(scope, `${config.id}-alb-dns`, {
    value: loadBalancer.loadBalancerDnsName,
    exportName: `${namespace}-${config.id}-alb-dns`,
  });

  // Export all security group IDs attached to the ALB for cross-stack security group rules
  loadBalancer.connections.securityGroups.forEach((securityGroup, index) => {
    new CfnOutput(scope, `${config.id}-alb-sg-${index + 1}-id`, {
      value: securityGroup.securityGroupId,
      exportName: `${namespace}-${config.id}-alb-sg-${index + 1}-id`,
    });
  });

  return { autoScalingGroup, loadBalancer, listener, targetGroup };
}

/**
 * Builds all compute services defined in the stack configuration.
 *
 * @param scope The parent CDK construct (typically the ComputeStack).
 * @param namespace The unique namespace for the stack.
 * @param config The array of compute service configurations.
 * @returns A record mapping service IDs to their provisioned resources.
 */
export function buildComputeServices(
  scope: Construct,
  namespace: string,
  config: ComputeStackConfig,
): Readonly<Record<string, ComputeServiceResources>> {
  const services: Record<string, ComputeServiceResources> = {};

  // Iterate over each service configuration and provision it
  for (const service of config) {
    // Ensure that each service has a unique ID to prevent resource naming collisions
    if (services[service.id]) {
      throw new Error(`Duplicate compute service id: ${service.id}`);
    }

    services[service.id] = buildService(scope, namespace, service);
  }

  return services;
}
