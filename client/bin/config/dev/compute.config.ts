import { readFileSync } from "node:fs";

import { Duration, Fn } from "aws-cdk-lib";
import {
  AdditionalHealthCheckType,
  HealthChecks,
} from "aws-cdk-lib/aws-autoscaling";
import {
  InstanceType,
  MachineImage,
  SubnetType,
  UserData,
} from "aws-cdk-lib/aws-ec2";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";

import { getDeploymentConfig } from "./deployment.config.js";

import type {
  ClientRuntimeResources,
} from "../../types/compute-config.js";
import type ClientDeploymentConfig from "../../types/deployment-config.js";
import ClientComputeConfig from "../../types/compute-config.js";

const bootstrapTemplate = readFileSync(
  new URL("../../assets/bootstrap.sh", import.meta.url),
  "utf8",
);

function getUserData(
  deployment: ClientDeploymentConfig,
  resources: ClientRuntimeResources,
): UserData {
  const replacements: Readonly<Record<string, string | number>> = {
    AWS_REGION: deployment.awsRegion,
    PORT: deployment.port,
    API_URL: resources.apiUrl,
    REPOSITORY_NAME: resources.repositoryName,
    REPOSITORY_URI: resources.repositoryUri,
    LOG_GROUP_NAME: resources.logGroupName,
  };
  const script = Object.entries(replacements).reduce(
    (content, [name, value]) =>
      content.replaceAll(`{{${name}}}`, String(value)),
    bootstrapTemplate,
  );
  const unresolvedPlaceholder = /\{\{[A-Z0-9_]+\}\}/.exec(script)?.[0];

  if (unresolvedPlaceholder) {
    throw new Error(
      `Missing bootstrap replacement for ${unresolvedPlaceholder}`,
    );
  }

  return UserData.custom(script);
}

/** Builds the scaled Nuxt fleet and public load-balancer configuration. */
export function getComputeConfig(namespace: string): ClientComputeConfig {
  const deployment = getDeploymentConfig(namespace);
  const resources: ClientRuntimeResources = {
    apiUrl: Fn.join("", [
      "http://",
      Fn.importValue(
        `${deployment.serverComputeNamespace}-server-alb-dns`,
      ),
      "/api/v1",
    ]),
    repositoryName: Fn.importValue(
      `${deployment.repositoryNamespace}-client-repository-name`,
    ),
    repositoryUri: Fn.importValue(
      `${deployment.repositoryNamespace}-client-repository-uri`,
    ),
    logGroupName: Fn.importValue(
      `${deployment.platformNamespace}-observability-application-logs-log-group-name`,
    ),
  };

  return {
    deployment,
    imports: {
      vpc: {
        id: "platform-vpc",
        namespace: `${deployment.platformNamespace}-network`,
      },
      logGroup: {
        id: "application-logs",
        namespace: `${deployment.platformNamespace}-observability`,
      },
      repository: {
        id: "client",
        namespace: deployment.repositoryNamespace,
      },
      serverLoadBalancer: {
        id: "server",
        namespace: deployment.serverComputeNamespace,
      },
    },
    autoScalingGroup: {
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      instanceType: new InstanceType(deployment.instanceType),
      machineImage: MachineImage.latestAmazonLinux2023(),
      minCapacity: deployment.minCapacity,
      maxCapacity: deployment.maxCapacity,
      healthChecks: HealthChecks.withAdditionalChecks({
        additionalTypes: [AdditionalHealthCheckType.ELB],
        gracePeriod: Duration.minutes(5),
      }),
      userData: getUserData(deployment, resources),
    },
    cpuTargetUtilizationPercent: 60,
    instanceTags: {
      [deployment.deploymentTagKey]: deployment.deploymentTagValue,
    },
    loadBalancer: {
      props: {
        internetFacing: true,
        vpcSubnets: { subnetType: SubnetType.PUBLIC },
      },
      listener: {
        port: 80,
        protocol: ApplicationProtocol.HTTP,
        open: true,
      },
      targetGroup: {
        port: deployment.port,
        protocol: ApplicationProtocol.HTTP,
        healthCheck: {
          path: "/",
          healthyHttpCodes: "200-399",
          interval: Duration.seconds(30),
        },
        deregistrationDelay: Duration.seconds(30),
      },
    },
  };
}

export default getComputeConfig;
