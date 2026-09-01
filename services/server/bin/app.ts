#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { StackContext } from "@app/infra-core/utils.js";

import { ComputeStack } from "./stack/compute.stack.js";
import { FirewallStack } from "./stack/firewall.stack.js";
import { PipelineStack } from "./stack/pipeline.stack.js";
import { RepositoryStack } from "./stack/repository.stack.js";

const app = new App();

// Determine the environment (e.g., 'dev', 'prod') and construct a base context.
const env = process.env.APP_ENV ?? "dev";
const base = StackContext.builder(env, "urlshortner", "server");

/**
 * Repository Stack
 * 
 * Provisions the ECR (Elastic Container Registry) repositories for this service.
 * It is built first because the compute instances and deployment pipelines 
 * need a place to pull and push Docker images from.
 */
const repositoryStack = RepositoryStack.build(app, base.stack("repository"));

/**
 * Compute Stack
 * 
 * Provisions the Auto Scaling Group (EC2 instances) and the internal 
 * Application Load Balancer. It imports the VPC and DynamoDB table from the
 * platform core stacks using cross-stack CloudFormation imports.
 */
const computeStack = ComputeStack.build(app, base.stack("compute"));

/**
 * Firewall Stack
 * 
 * Provisions AWS WAF (Web Application Firewall) rules and rate-limiting.
 * It attaches directly to the Application Load Balancer created in the Compute Stack
 * to protect the express instances from malicious traffic.
 */
const firewallStack = FirewallStack.build(app, base.stack("firewall"));

/**
 * Pipeline Stack
 * 
 * Provisions the AWS CodePipeline and CodeDeploy configurations.
 * This sets up the CI/CD pipeline that pulls from GitHub, builds the Docker image,
 * pushes it to the ECR repository, and triggers a deployment on the EC2 instances.
 */
const pipelineStack = PipelineStack.build(app, base.stack("pipeline"));

/**
 * Stack Dependencies
 * 
 * Because the stacks share resources via CloudFormation `Fn.importValue` instead of 
 * direct object references, the CDK cannot automatically infer their deployment order.
 * We explicitly declare the dependencies here to ensure they deploy sequentially 
 * and avoid CloudFormation "resource not found" errors during `cdk deploy --all`.
 */

// Compute needs the ECR repository to exist so EC2 instances can pull the image
computeStack.addStackDependency(repositoryStack);

// Firewall needs the Application Load Balancer to exist before it can attach to it
firewallStack.addStackDependency(computeStack);

// Pipeline needs the ECR repository (to push images) and Compute (to trigger CodeDeploy)
pipelineStack.addStackDependency(repositoryStack);
pipelineStack.addStackDependency(computeStack);

// Synthesize the AWS CloudFormation templates
app.synth();
