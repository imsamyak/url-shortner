import type {
  ComputeServiceConfig,
  ComputeStackConfig,
} from "@app/constructs";
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
} from "aws-cdk-lib/aws-ec2";
import type { IRepository } from "aws-cdk-lib/aws-ecr";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";

import { serverDeploymentConfig } from "./deployment.config.js";
import { dataConfig } from "./data.config.js";

function createServerUserData(repository: IRepository): UserData {
  const userData = UserData.forLinux();
  const region = serverDeploymentConfig.awsRegion;
  const tableName = dataConfig[0]!.table.tableName!;

  userData.addCommands(
    "dnf install -y docker ruby wget jq",
    "systemctl enable --now docker",
    `wget -q https://aws-codedeploy-${region}.s3.${region}.amazonaws.com/latest/install -O /tmp/codedeploy-install`,
    "chmod +x /tmp/codedeploy-install",
    "/tmp/codedeploy-install auto",
    "systemctl enable --now codedeploy-agent",
    "mkdir -p /etc/url-shortener",
    "cat > /etc/url-shortener/server.base.env <<'ENVIRONMENT'",
    "NODE_ENV=production",
    "HOST=0.0.0.0",
    `PORT=${serverDeploymentConfig.port}`,
    `AWS_REGION=${region}`,
    `DYNAMODB_TABLE_NAME=${tableName}`,
    "ENVIRONMENT",
    "cat > /etc/url-shortener/deployment.env <<'DEPLOYMENT'",
    `AWS_REGION=${region}`,
    `RUNTIME_SECRET_ID=${serverDeploymentConfig.runtimeSecretName}`,
    `REPOSITORY_NAME=${repository.repositoryName}`,
    `REPOSITORY_URI=${repository.repositoryUri}`,
    "DEPLOYMENT",
    "cat > /usr/local/bin/start-current-url-shortener <<'BOOTSTRAP'",
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "source /etc/url-shortener/deployment.env",
    "IMAGE_URI=\"$REPOSITORY_URI:current\"",
    "aws ecr describe-images --region \"$AWS_REGION\" --repository-name \"$REPOSITORY_NAME\" --image-ids imageTag=current >/dev/null",
    "aws secretsmanager get-secret-value --region \"$AWS_REGION\" --secret-id \"$RUNTIME_SECRET_ID\" --query SecretString --output text | jq -r 'to_entries[] | \"\\(.key)=\\(.value | tostring)\"' > /etc/url-shortener/server.secret.env",
    "cat /etc/url-shortener/server.base.env /etc/url-shortener/server.secret.env > /etc/url-shortener/server.env",
    "REGISTRY_URI=\"${REPOSITORY_URI%/*}\"",
    "aws ecr get-login-password --region \"$AWS_REGION\" | docker login --username AWS --password-stdin \"$REGISTRY_URI\"",
    "docker pull \"$IMAGE_URI\"",
    "docker rm --force url-shortener-server 2>/dev/null || true",
    `docker run --detach --name url-shortener-server --restart unless-stopped --env-file /etc/url-shortener/server.env --publish ${serverDeploymentConfig.port}:${serverDeploymentConfig.port} "$IMAGE_URI"`,
    "BOOTSTRAP",
    "chmod +x /usr/local/bin/start-current-url-shortener",
    "/usr/local/bin/start-current-url-shortener || true",
  );

  return userData;
}

/** Express fleet and its private, VPC-only application load balancer. */
export function createComputeConfig(
  vpc: ComputeServiceConfig["vpc"],
  repository: IRepository,
): ComputeStackConfig {
  return [
    {
      id: "server",
      vpc,
      pullRepositories: [repository],
      autoScalingGroup: {
        vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        instanceType: new InstanceType(serverDeploymentConfig.instanceType),
        machineImage: MachineImage.latestAmazonLinux2023(),
        minCapacity: serverDeploymentConfig.minCapacity,
        maxCapacity: Math.max(
          serverDeploymentConfig.maxCapacity,
          serverDeploymentConfig.minCapacity,
        ),
        healthChecks: HealthChecks.withAdditionalChecks({
          additionalTypes: [AdditionalHealthCheckType.ELB],
          gracePeriod: Duration.minutes(5),
        }),
        userData: createServerUserData(repository),
      },
      loadBalancer: {
        loadBalancer: {
          internetFacing: false,
          vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        },
        listener: {
          port: 80,
          protocol: ApplicationProtocol.HTTP,
          open: false,
        },
        targetGroup: {
          port: serverDeploymentConfig.port,
          protocol: ApplicationProtocol.HTTP,
          healthCheck: {
            path: "/health",
            healthyHttpCodes: "200",
            interval: Duration.seconds(30),
          },
          deregistrationDelay: Duration.seconds(30),
        },
      },
    },
  ];
}
