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

import {
  getDeploymentConfig
} from "./deployment.config.js";

import type {
  ServerComputeConfig,
  ServerRuntimeResources,
} from "../../types/compute-config.js";
import ServerDeploymentConfig from "@bin/types/deployment-config.js";

const bootstrapTemplate = readFileSync(
  new URL("../../assets/bootstrap.sh", import.meta.url),
  "utf8",
);

function getUserData(
  deployment: ServerDeploymentConfig,
  resources: ServerRuntimeResources,
): UserData {
  const replacements: Readonly<Record<string, string | number>> = {
    AWS_REGION: deployment.awsRegion,
    PORT: deployment.port,
    DYNAMODB_TABLE_NAME: resources.tableName,
    RUNTIME_SECRET_ID: deployment.runtimeSecretName,
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

/** Builds the private Express fleet and internal load-balancer configuration. */
export function getComputeConfig(
  namespace: string,
): ServerComputeConfig {
  const deployment = getDeploymentConfig(namespace);
  const resources: ServerRuntimeResources = {
    tableName: Fn.importValue(
      `${deployment.platformNamespace}-data-table-name`,
    ),
    repositoryName: Fn.importValue(
      `${deployment.repositoryNamespace}-server-repository-name`,
    ),
    repositoryUri: Fn.importValue(
      `${deployment.repositoryNamespace}-server-repository-uri`,
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
      table: {
        id: "platform-table",
        namespace: `${deployment.platformNamespace}-data`,
      },
      logGroup: {
        id: "application-logs",
        namespace: `${deployment.platformNamespace}-observability`,
      },
      repository: {
        id: "server",
        namespace: deployment.repositoryNamespace,
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
      exportSecurityGroupId: true,
      props: {
        internetFacing: false,
        vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      },
      listener: {
        port: 80,
        protocol: ApplicationProtocol.HTTP,
        open: false,
      },
      targetGroup: {
        port: deployment.port,
        protocol: ApplicationProtocol.HTTP,
        healthCheck: {
          path: "/health",
          healthyHttpCodes: "200",
          interval: Duration.seconds(30),
        },
        deregistrationDelay: Duration.seconds(30),
      },
    },
  };
}

export default getComputeConfig;
