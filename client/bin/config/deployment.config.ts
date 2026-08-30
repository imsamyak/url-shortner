import { buildStackNamespace } from "@app/constructs";

import { clientStackContext, clientStackProps } from "./stack.config.js";

const namespace = buildStackNamespace(clientStackContext);
const awsRegion = clientStackProps.awsEnv?.region ?? "us-east-1";
const awsAccount = clientStackProps.awsEnv?.account ?? "123456789012";

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Non-secret settings used to synthesize the Nuxt deployment. */
export const clientDeploymentConfig = {
  namespace,
  awsRegion,
  port: 3000,
  instanceType: process.env.CLIENT_INSTANCE_TYPE ?? "t3.micro",
  minCapacity: positiveInteger(process.env.CLIENT_MIN_CAPACITY, 2),
  maxCapacity: positiveInteger(process.env.CLIENT_MAX_CAPACITY, 10),
  deploymentTagKey: "Service",
  deploymentTagValue: `${namespace}-nuxt`,
  connectionArn:
    process.env.CODESTAR_CONNECTION_ARN ??
    `arn:aws:codeconnections:${awsRegion}:${awsAccount}:connection/replace-before-deploy`,
  githubOwner: process.env.GITHUB_OWNER ?? "imsamyak",
  githubRepository: process.env.GITHUB_REPOSITORY ?? "url-shortner",
  githubBranch: process.env.GITHUB_BRANCH ?? "main",
  rateLimitPerFiveMinutes: positiveInteger(
    process.env.CLIENT_RATE_LIMIT,
    2_000,
  ),
} as const;
