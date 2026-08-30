import type { ComputeStackConfig } from "@app/constructs";
import { Duration } from "aws-cdk-lib";
import {
  AdditionalHealthCheckType,
  HealthChecks,
} from "aws-cdk-lib/aws-autoscaling";
import {
  InstanceType,
  MachineImage,
  SubnetType,
  UserData,
  type IVpc,
} from "aws-cdk-lib/aws-ec2";
import type { IRepository } from "aws-cdk-lib/aws-ecr";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";

import { clientDeploymentConfig } from "./deployment.config.js";
import { serverInfrastructure } from "./server.config.js";

function createClientUserData(repository: IRepository): UserData {
  const userData = UserData.forLinux();
  const region = clientDeploymentConfig.awsRegion;

  userData.addCommands(
    "dnf install -y docker ruby wget",
    "systemctl enable --now docker",
    `wget -q https://aws-codedeploy-${region}.s3.${region}.amazonaws.com/latest/install -O /tmp/codedeploy-install`,
    "chmod +x /tmp/codedeploy-install",
    "/tmp/codedeploy-install auto",
    "systemctl enable --now codedeploy-agent",
    "mkdir -p /etc/url-shortener",
    "cat > /etc/url-shortener/client.env <<'ENVIRONMENT'",
    "NODE_ENV=production",
    "HOST=0.0.0.0",
    `PORT=${clientDeploymentConfig.port}`,
    `AWS_REGION=${region}`,
    `NUXT_PUBLIC_API_URL=${serverInfrastructure.baseUrl}`,
    "ENVIRONMENT",
    "cat > /etc/url-shortener/client-deployment.env <<'DEPLOYMENT'",
    `AWS_REGION=${region}`,
    `REPOSITORY_NAME=${repository.repositoryName}`,
    `REPOSITORY_URI=${repository.repositoryUri}`,
    "DEPLOYMENT",
    "cat > /usr/local/bin/start-current-url-shortener-client <<'BOOTSTRAP'",
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "source /etc/url-shortener/client-deployment.env",
    "IMAGE_URI=\"$REPOSITORY_URI:current\"",
    "aws ecr describe-images --region \"$AWS_REGION\" --repository-name \"$REPOSITORY_NAME\" --image-ids imageTag=current >/dev/null",
    "REGISTRY_URI=\"${REPOSITORY_URI%/*}\"",
    "aws ecr get-login-password --region \"$AWS_REGION\" | docker login --username AWS --password-stdin \"$REGISTRY_URI\"",
    "docker pull \"$IMAGE_URI\"",
    "docker rm --force url-shortener-client 2>/dev/null || true",
    `docker run --detach --name url-shortener-client --restart unless-stopped --env-file /etc/url-shortener/client.env --publish ${clientDeploymentConfig.port}:${clientDeploymentConfig.port} "$IMAGE_URI"`,
    "BOOTSTRAP",
    "chmod +x /usr/local/bin/start-current-url-shortener-client",
    "/usr/local/bin/start-current-url-shortener-client || true",
  );

  return userData;
}

export function createComputeConfig(
  vpc: IVpc,
  repository: IRepository,
): ComputeStackConfig {
  return [
    {
      id: "client",
      vpc,
      pullRepositories: [repository],
      autoScalingGroup: {
        vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        instanceType: new InstanceType(clientDeploymentConfig.instanceType),
        machineImage: MachineImage.latestAmazonLinux2023(),
        minCapacity: clientDeploymentConfig.minCapacity,
        maxCapacity: Math.max(
          clientDeploymentConfig.maxCapacity,
          clientDeploymentConfig.minCapacity,
        ),
        healthChecks: HealthChecks.withAdditionalChecks({
          additionalTypes: [AdditionalHealthCheckType.ELB],
          gracePeriod: Duration.minutes(5),
        }),
        userData: createClientUserData(repository),
      },
      loadBalancer: {
        loadBalancer: {
          internetFacing: true,
          vpcSubnets: { subnetType: SubnetType.PUBLIC },
        },
        listener: {
          port: 80,
          protocol: ApplicationProtocol.HTTP,
          open: true,
        },
        targetGroup: {
          port: clientDeploymentConfig.port,
          protocol: ApplicationProtocol.HTTP,
          healthCheck: {
            path: "/",
            healthyHttpCodes: "200-399",
            interval: Duration.seconds(30),
          },
          deregistrationDelay: Duration.seconds(30),
        },
      },
    },
  ];
}
