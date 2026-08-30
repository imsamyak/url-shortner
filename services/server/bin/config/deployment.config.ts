import { buildStackNamespace } from "@app/constructs";

import { serverStackContext, serverStackProps } from "./stack.config.js";

const namespace = buildStackNamespace(serverStackContext);
const awsRegion = serverStackProps.awsEnv?.region ?? "us-east-1";
const awsAccount = serverStackProps.awsEnv?.account ?? "123456789012";

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Non-secret deployment settings shared by the server infrastructure configs. */
export const serverDeploymentConfig = {
  namespace,
  awsRegion,
  port: 4000,
  instanceType: process.env.SERVER_INSTANCE_TYPE ?? "t3.micro",
  minCapacity: positiveInteger(process.env.SERVER_MIN_CAPACITY, 2),
  maxCapacity: positiveInteger(process.env.SERVER_MAX_CAPACITY, 6),
  runtimeSecretName:
    process.env.SERVER_RUNTIME_SECRET_NAME ?? `${namespace}/runtime`,
  deploymentTagKey: "Service",
  deploymentTagValue: `${namespace}-express`,
  connectionArn:
    process.env.CODESTAR_CONNECTION_ARN ??
    `arn:aws:codeconnections:${awsRegion}:${awsAccount}:connection/replace-before-deploy`,
  githubOwner: process.env.GITHUB_OWNER ?? "imsamyak",
  githubRepository: process.env.GITHUB_REPOSITORY ?? "url-shortner",
  githubBranch: process.env.GITHUB_BRANCH ?? "main",
  rateLimitPerFiveMinutes: positiveInteger(
    process.env.SERVER_RATE_LIMIT,
    1_000,
  ),
} as const;
