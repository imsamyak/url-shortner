function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getServiceNamespace(stackNamespace: string): string {
  return stackNamespace.replace(
    /-(repository|compute|firewall|cdn|pipeline)$/,
    "",
  );
}

import type ClientDeploymentConfig from "../../types/deployment-config.js";

/** Resolves non-secret deployment settings from a client stack namespace. */
export function getDeploymentConfig(
  stackNamespace: string,
): ClientDeploymentConfig {
  const serviceNamespace = getServiceNamespace(stackNamespace);

  if (!serviceNamespace.endsWith("-client")) {
    throw new Error(
      `Client namespace must end with -client: ${serviceNamespace}`,
    );
  }

  const platformNamespace = serviceNamespace.slice(0, -"-client".length);
  const awsRegion =
    process.env.CDK_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
  const awsAccount = process.env.CDK_DEFAULT_ACCOUNT ?? "123456789012";
  const minCapacity = positiveInteger(process.env.CLIENT_MIN_CAPACITY, 2);

  return {
    serviceNamespace,
    platformNamespace,
    serverComputeNamespace: `${platformNamespace}-server-compute`,
    repositoryNamespace: `${serviceNamespace}-repository`,
    computeNamespace: `${serviceNamespace}-compute`,
    cdnNamespace: `${serviceNamespace}-cdn`,
    awsRegion,
    port: 3000,
    instanceType: process.env.CLIENT_INSTANCE_TYPE ?? "t3.micro",
    minCapacity,
    maxCapacity: Math.max(
      positiveInteger(process.env.CLIENT_MAX_CAPACITY, 10),
      minCapacity,
    ),
    deploymentTagKey: "Service",
    deploymentTagValue: `${serviceNamespace}-nuxt`,
    connectionArn:
      process.env.CODESTAR_CONNECTION_ARN ??
      `arn:aws:codeconnections:${awsRegion}:${awsAccount}:connection/29b919ad-1fe2-4bf3-bb30-acf244d67c36`,
    githubOwner: process.env.GITHUB_OWNER ?? "imsamyak",
    githubRepository: process.env.GITHUB_REPOSITORY ?? "url-shortner",
    githubBranch: process.env.GITHUB_BRANCH ?? "master",
    rateLimitPerFiveMinutes: positiveInteger(
      process.env.CLIENT_RATE_LIMIT,
      2_000,
    ),
  };
}

export default getDeploymentConfig;
