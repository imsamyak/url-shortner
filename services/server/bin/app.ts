#!/usr/bin/env node
import {
  buildComputeStack,
  buildDataStack,
  buildFirewallStack,
  buildPipelineStack,
  buildRepositoryStack,
  type StackContext,
} from "@app/constructs";
import { App, Tags, type StackProps } from "aws-cdk-lib";
import { Port } from "aws-cdk-lib/aws-ec2";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

import { createComputeConfig } from "./config/compute.config.js";
import { dataConfig } from "./config/data.config.js";
import { serverDeploymentConfig } from "./config/deployment.config.js";
import { createFirewallConfig } from "./config/firewall.config.js";
import { createPipelineConfig } from "./config/pipeline.config.js";
import { repositoryConfig } from "./config/repository.config.js";
import { clientVpcConfig } from "./config/vpc.config.js";

/** Stable service identity used by every server-owned infrastructure stack. */
const context: StackContext = {
  realm: "global",
  name: "url-shortener-server",
  env: process.env.DEPLOY_ENV ?? "dev",
};

/** AWS account and region remain ordinary CDK stack props. */
const defaultProps: StackProps = {
  awsEnv: {
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
    account: process.env.CDK_DEFAULT_ACCOUNT ?? "123456789012",
  },
};

const app = new App();

/**
 * Foundational Infrastructure Stacks
 *
 * Provisions the core shared resources required by the application,
 * including ECR repositories and DynamoDB tables.
 */

// Repository Stack: Provisions ECR repositories for Docker images
const repositoryStack = buildRepositoryStack(
  app,
  context,
  repositoryConfig,
  {
    ...defaultProps,
    description: "Server Docker image repositories",
  },
);
const serverRepository = repositoryStack.repositories.server!;

// Data Stack: Provisions DynamoDB tables and other data-layer resources
const dataStack = buildDataStack(app, context, dataConfig, {
  ...defaultProps,
  description: "Server-owned DynamoDB resources",
});


/**
 * Application Compute Stack
 *
 * Provisions the auto-scaling group and internal load balancer
 * for the private Express container fleet.
 */

// Compute Stack: Provisions the auto-scaling group and internal load balancer for the Express service
const computeStack = buildComputeStack(
  app,
  context,
  createComputeConfig(clientVpcConfig, serverRepository),
  {
    ...defaultProps,
    description: "Private, auto-scaled Express container fleet",
  },
);
const serverService = computeStack.services.server!;


/**
 * Compute Networking & Scaling Config
 *
 * Configures the internal networking rules for the Express load balancer
 * and defines the CPU-based scaling policies and deployment tags for the ASG.
 */

// Keep Express private. The client stack must grant its Nuxt security group access
// to the listener without exposing this load balancer to the rest of the VPC.
serverService.loadBalancer!.connections.allowTo(
  serverService.autoScalingGroup,
  Port.tcp(serverDeploymentConfig.port),
  "Forward internal load-balancer traffic to Express",
);

// Scale out when CPU utilization hits the target threshold
serverService.autoScalingGroup.scaleOnCpuUtilization("cpu-scaling", {
  targetUtilizationPercent: 60,
});

// Tag the ASG so that CodeDeploy knows which instances to target
Tags.of(serverService.autoScalingGroup).add(
  serverDeploymentConfig.deploymentTagKey,
  serverDeploymentConfig.deploymentTagValue,
  { applyToLaunchedInstances: true },
);


/**
 * IAM Permissions & Secrets
 *
 * Grants the Express compute instances the necessary permissions to access
 * DynamoDB, Systems Manager, and runtime secrets.
 */

// Grant the compute instances permission to read and write to the DynamoDB table
dataStack.tables["url-shortener"]!.grantReadWriteData(
  serverService.autoScalingGroup.role,
);

// Allow the instances to be managed by Systems Manager (SSM)
serverService.autoScalingGroup.role.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
);

// Grant the compute instances permission to read the runtime secrets
const runtimeSecret = Secret.fromSecretNameV2(
  computeStack,
  "server-runtime-secret",
  serverDeploymentConfig.runtimeSecretName,
);
runtimeSecret.grantRead(serverService.autoScalingGroup.role);


/**
 * Security & Deployment Pipeline
 *
 * Provisions AWS WAF for load balancer protection and the CodePipeline
 * infrastructure for continuous delivery of the Express service.
 */

// Firewall Stack: Provisions AWS WAF rules to protect the load balancer
buildFirewallStack(
  app,
  context,
  createFirewallConfig(serverService.loadBalancer!.loadBalancerArn),
  {
    ...defaultProps,
    description: "AWS WAF protection and rate limiting for Express",
  },
);

// Pipeline Stack: Provisions the CodePipeline for delivering the Express service
const pipelineStack = buildPipelineStack(
  app,
  context,
  createPipelineConfig(serverRepository),
  {
    ...defaultProps,
    description: "Docker delivery pipeline for the Express service",
  },
);

// Grant CodeDeploy agents on the EC2 instances permission to download pipeline revisions
pipelineStack.pipeline.artifactBucket.grantRead(
  serverService.autoScalingGroup.role,
);


/**
 * Synthesize the App
 *
 * Compiles the CDK application into CloudFormation templates.
 */
app.synth();
