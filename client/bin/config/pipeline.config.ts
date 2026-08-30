import type { PipelineStackConfig } from "@app/constructs";
import { Duration } from "aws-cdk-lib";
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  ComputeType,
  LinuxBuildImage,
} from "aws-cdk-lib/aws-codebuild";
import type { IDistribution } from "aws-cdk-lib/aws-cloudfront";
import { PipelineType } from "aws-cdk-lib/aws-codepipeline";
import {
  InstanceTagSet,
  ServerDeploymentConfig,
} from "aws-cdk-lib/aws-codedeploy";
import type { IRepository } from "aws-cdk-lib/aws-ecr";

import { clientDeploymentConfig } from "./deployment.config.js";

export function createPipelineConfig(
  repository: IRepository,
  distribution: IDistribution,
): PipelineStackConfig {
  return {
    pipeline: {
      pipelineName: `${clientDeploymentConfig.namespace}-client`,
      pipelineType: PipelineType.V2,
      restartExecutionOnUpdate: true,
      crossAccountKeys: false,
    },
    source: {
      action: {
        actionName: "Source",
        connectionArn: clientDeploymentConfig.connectionArn,
        owner: clientDeploymentConfig.githubOwner,
        repo: clientDeploymentConfig.githubRepository,
        branch: clientDeploymentConfig.githubBranch,
        triggerOnPush: false,
      },
      pushFilter: {
        branchesIncludes: [clientDeploymentConfig.githubBranch],
        filePathsIncludes: [
          "client/**",
          "packages/**",
          "package.json",
          "pnpm-lock.yaml",
          "pnpm-workspace.yaml",
        ],
      },
    },
    build: {
      project: {
        projectName: `${clientDeploymentConfig.namespace}-client-build`,
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
                "docker build --pull -f client/Dockerfile -t \"$IMAGE_URI\" .",
                "docker push \"$IMAGE_URI\"",
                "docker tag \"$IMAGE_URI\" \"$REPOSITORY_URI:current\"",
                "docker push \"$REPOSITORY_URI:current\"",
                "mkdir -p client-deploy/deploy",
                "cp client/bin/assets/appspec.yml client-deploy/appspec.yml",
                "cp client/bin/assets/*.sh client-deploy/deploy/",
                "chmod +x client-deploy/deploy/*.sh",
                "printf 'IMAGE_URI=%s\\n' \"$IMAGE_URI\" > client-deploy/image.env",
              ],
            },
          },
          artifacts: {
            "base-directory": "client-deploy",
            files: ["**/*"],
          },
        }),
      },
      action: { actionName: "BuildClient" },
      pushRepositories: [repository],
    },
    deploy: {
      application: {
        applicationName: `${clientDeploymentConfig.namespace}-client`,
      },
      deploymentGroup: {
        deploymentGroupName: `${clientDeploymentConfig.namespace}-client`,
        ec2InstanceTags: new InstanceTagSet({
          [clientDeploymentConfig.deploymentTagKey]: [
            clientDeploymentConfig.deploymentTagValue,
          ],
        }),
        deploymentConfig: ServerDeploymentConfig.HALF_AT_A_TIME,
        autoRollback: {
          failedDeployment: true,
          stoppedDeployment: true,
        },
      },
      action: { actionName: "DeployClient" },
    },
    postDeploy: {
      project: {
        projectName: `${clientDeploymentConfig.namespace}-invalidate-cdn`,
        environment: {
          buildImage: LinuxBuildImage.STANDARD_7_0,
          environmentVariables: {
            DISTRIBUTION_ID: {
              type: BuildEnvironmentVariableType.PLAINTEXT,
              value: distribution.distributionId,
            },
          },
        },
        buildSpec: BuildSpec.fromObject({
          version: "0.2",
          phases: {
            build: {
              commands: [
                "aws cloudfront create-invalidation --distribution-id \"$DISTRIBUTION_ID\" --paths '/*'",
              ],
            },
          },
        }),
      },
      action: { actionName: "InvalidateCdn" },
      invalidateDistributions: [distribution],
    },
  };
}
