#!/usr/bin/env node
import {
  buildCdnStack,
  buildComputeStack,
  buildFirewallStack,
  buildNetworkStack,
  buildPipelineStack,
  buildRepositoryStack,
} from "@app/constructs";
import { App, Aws, Tags } from "aws-cdk-lib";
import { Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { ManagedPolicy, PolicyStatement } from "aws-cdk-lib/aws-iam";

import { createCdnConfig } from "./config/cdn.config.js";
import { createComputeConfig } from "./config/compute.config.js";
import { clientDeploymentConfig } from "./config/deployment.config.js";
import { createFirewallConfig } from "./config/firewall.config.js";
import { networkConfig } from "./config/network.config.js";
import { createPipelineConfig } from "./config/pipeline.config.js";
import { repositoryConfig } from "./config/repository.config.js";
import { serverInfrastructure } from "./config/server.config.js";
import {
  clientStackContext,
  clientStackProps,
} from "./config/stack.config.js";

const app = new App();

const networkStack = buildNetworkStack(
  app,
  clientStackContext,
  networkConfig,
  {
    ...clientStackProps,
    description: "Nuxt-owned VPC shared with backend services",
  },
);
const repositoryStack = buildRepositoryStack(
  app,
  clientStackContext,
  repositoryConfig,
  {
    ...clientStackProps,
    description: "Nuxt Docker image repository",
  },
);
const applicationVpc = networkStack.vpcs.application!;
const clientRepository = repositoryStack.repositories.client!;
const computeStack = buildComputeStack(
  app,
  clientStackContext,
  createComputeConfig(applicationVpc, clientRepository),
  {
    ...clientStackProps,
    description: "Public, auto-scaled Nuxt container fleet",
  },
);
const clientService = computeStack.services.client!;

clientService.loadBalancer!.connections.allowTo(
  clientService.autoScalingGroup,
  Port.tcp(clientDeploymentConfig.port),
  "Forward client load-balancer traffic to Nuxt",
);
clientService.autoScalingGroup.scaleOnCpuUtilization("cpu-scaling", {
  targetUtilizationPercent: 60,
});
Tags.of(clientService.autoScalingGroup).add(
  clientDeploymentConfig.deploymentTagKey,
  clientDeploymentConfig.deploymentTagValue,
  { applyToLaunchedInstances: true },
);
clientService.autoScalingGroup.role.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
);
clientService.autoScalingGroup.role.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ["s3:GetObject", "s3:GetObjectVersion"],
    resources: [`arn:${Aws.PARTITION}:s3:::*/*`],
    conditions: {
      StringEquals: { "s3:ResourceAccount": Aws.ACCOUNT_ID },
    },
  }),
);

// Express exports this security group. Only the Nuxt fleet is granted ingress.
const serverLoadBalancerSecurityGroup = SecurityGroup.fromSecurityGroupId(
  computeStack,
  "server-load-balancer-security-group",
  serverInfrastructure.loadBalancerSecurityGroupId,
  { mutable: true },
);
serverLoadBalancerSecurityGroup.connections.allowFrom(
  clientService.autoScalingGroup,
  Port.tcp(80),
  "Allow Nuxt instances to call the private Express load balancer",
);

const cdnStack = buildCdnStack(
  app,
  clientStackContext,
  createCdnConfig(clientService.loadBalancer!),
  {
    ...clientStackProps,
    description: "CloudFront distribution for the Nuxt application",
  },
);
buildFirewallStack(
  app,
  clientStackContext,
  createFirewallConfig(clientService.loadBalancer!.loadBalancerArn),
  {
    ...clientStackProps,
    description: "AWS WAF protection and rate limiting for Nuxt",
  },
);
buildPipelineStack(
  app,
  clientStackContext,
  createPipelineConfig(clientRepository, cdnStack.distributions.client!),
  {
    ...clientStackProps,
    description: "Docker delivery pipeline for the Nuxt service",
  },
);

app.synth();
