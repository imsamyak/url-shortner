function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getServiceNamespace(stackNamespace: string): string {
  return stackNamespace.replace(/-(repository|compute|firewall|pipeline)$/, "");
}

import type ServerDeploymentConfig from "../../types/deployment-config.js";

/** Resolves non-secret deployment settings from a server stack namespace. */
export function getDeploymentConfig(
  stackNamespace: string,
): ServerDeploymentConfig {
  const serviceNamespace = getServiceNamespace(stackNamespace);

  if (!serviceNamespace.endsWith("-server")) {
    throw new Error(
      `Server namespace must end with -server: ${serviceNamespace}`,
    );
  }

  const platformNamespace = serviceNamespace.slice(0, -"-server".length);
  const awsRegion =
    process.env.CDK_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
  const awsAccount = process.env.CDK_DEFAULT_ACCOUNT ?? "123456789012";
  const minCapacity = positiveInteger(process.env.SERVER_MIN_CAPACITY, 2);

  return {
    serviceNamespace,
    platformNamespace,
    repositoryNamespace: `${serviceNamespace}-repository`,
    computeNamespace: `${serviceNamespace}-compute`,
    awsRegion,
    port: 4000,
    instanceType: process.env.SERVER_INSTANCE_TYPE ?? "t3.micro",
    minCapacity,
    maxCapacity: Math.max(
      positiveInteger(process.env.SERVER_MAX_CAPACITY, 6),
      minCapacity,
    ),
    runtimeSecretName:
      process.env.SERVER_RUNTIME_SECRET_NAME ?? `${serviceNamespace}/runtime`,
    deploymentTagKey: "Service",
    deploymentTagValue: `${serviceNamespace}-express`,
    connectionArn:
      process.env.CODESTAR_CONNECTION_ARN ??
      `arn:aws:codeconnections:${awsRegion}:${awsAccount}:connection/29b919ad-1fe2-4bf3-bb30-acf244d67c36`,
    githubOwner: process.env.GITHUB_OWNER ?? "imsamyak",
    githubRepository: process.env.GITHUB_REPOSITORY ?? "url-shortner",
    githubBranch: process.env.GITHUB_BRANCH ?? "master",
    rateLimitPerFiveMinutes: positiveInteger(
      process.env.SERVER_RATE_LIMIT,
      1_000,
    ),
  };
}

export default getDeploymentConfig;