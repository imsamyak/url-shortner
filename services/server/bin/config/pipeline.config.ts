import type { PipelineStackConfig } from "@app/constructs";
import { Duration } from "aws-cdk-lib";
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  ComputeType,
  LinuxBuildImage,
} from "aws-cdk-lib/aws-codebuild";
import { PipelineType } from "aws-cdk-lib/aws-codepipeline";
import {
  InstanceTagSet,
  ServerDeploymentConfig,
} from "aws-cdk-lib/aws-codedeploy";
import type { IRepository } from "aws-cdk-lib/aws-ecr";

import { serverDeploymentConfig } from "./deployment.config.js";

/** Docker build, ECR publication, and tagged EC2 CodeDeploy rollout. */
export function createPipelineConfig(
  repository: IRepository,
): PipelineStackConfig {
  return {
    pipeline: {
      pipelineName: `${serverDeploymentConfig.namespace}-server`,
      pipelineType: PipelineType.V2,
      restartExecutionOnUpdate: true,
      crossAccountKeys: false,
    },
    source: {
      action: {
        actionName: "Source",
        connectionArn: serverDeploymentConfig.connectionArn,
        owner: serverDeploymentConfig.githubOwner,
        repo: serverDeploymentConfig.githubRepository,
        branch: serverDeploymentConfig.githubBranch,
        triggerOnPush: false,
      },
      pushFilter: {
        branchesIncludes: [serverDeploymentConfig.githubBranch],
        filePathsIncludes: [
          "services/server/**",
          "packages/**",
          "package.json",
          "pnpm-lock.yaml",
          "pnpm-workspace.yaml",
        ],
      },
    },
    build: {
      project: {
        projectName: `${serverDeploymentConfig.namespace}-server-build`,
        timeout: Duration.minutes(30),
        environment: {
          buildImage: LinuxBuildImage.STANDARD_7_0,
          computeType: ComputeType.SMALL,
          privileged: true,
          environmentVariables: {
            REPOSITORY_URI: {
              type: BuildEnvironmentVariableType.PLAINTEXT,
              value: repository.repositoryUri,
            },
          },
        },
        buildSpec: BuildSpec.fromObject({
          version: "0.2",
          phases: {
            build: {
              commands: [
                "REGISTRY_URI=\"${REPOSITORY_URI%/*}\"",
                "IMAGE_TAG=\"${CODEBUILD_RESOLVED_SOURCE_VERSION:-manual}-$CODEBUILD_BUILD_NUMBER\"",
                "IMAGE_URI=\"$REPOSITORY_URI:$IMAGE_TAG\"",
                "aws ecr get-login-password --region \"$AWS_DEFAULT_REGION\" | docker login --username AWS --password-stdin \"$REGISTRY_URI\"",
                "docker build --pull -f services/server/Dockerfile -t \"$IMAGE_URI\" .",
                "docker push \"$IMAGE_URI\"",
                "docker tag \"$IMAGE_URI\" \"$REPOSITORY_URI:current\"",
                "docker push \"$REPOSITORY_URI:current\"",
                "mkdir -p server-deploy/deploy",
                "cp services/server/bin/assets/appspec.yml server-deploy/appspec.yml",
                "cp services/server/bin/assets/*.sh server-deploy/deploy/",
                "chmod +x server-deploy/deploy/*.sh",
                "printf 'IMAGE_URI=%s\\n' \"$IMAGE_URI\" > server-deploy/image.env",
              ],
            },
          },
          artifacts: {
            "base-directory": "server-deploy",
            files: ["**/*"],
          },
        }),
      },
      action: { actionName: "BuildServer" },
      pushRepositories: [repository],
    },
    deploy: {
      application: {
        applicationName: `${serverDeploymentConfig.namespace}-server`,
      },
      deploymentGroup: {
        deploymentGroupName: `${serverDeploymentConfig.namespace}-server`,
        ec2InstanceTags: new InstanceTagSet({
          [serverDeploymentConfig.deploymentTagKey]: [
            serverDeploymentConfig.deploymentTagValue,
          ],
        }),
        deploymentConfig: ServerDeploymentConfig.HALF_AT_A_TIME,
        autoRollback: {
          failedDeployment: true,
          stoppedDeployment: true,
        },
      },
      action: { actionName: "DeployServer" },
    },
  };
}
