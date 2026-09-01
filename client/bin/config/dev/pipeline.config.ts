import type { PipelineConfig } from "@app/infra-core/constructs.js";
import { Duration, Fn } from "aws-cdk-lib";
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

import { getDeploymentConfig } from "./deployment.config.js";

import type ClientPipelineConfig from "../../types/pipeline-config.js";

/** Builds Nuxt Docker deployment and CDN invalidation configuration. */
export function getPipelineConfig(namespace: string): ClientPipelineConfig {
  const deployment = getDeploymentConfig(namespace);
  const repositoryUri = Fn.importValue(
    `${deployment.repositoryNamespace}-client-repository-uri`,
  );
  const distributionId = Fn.importValue(
    `${deployment.cdnNamespace}-client-distribution-id`,
  );

  return {
    deployment,
    repository: {
      id: "client",
      namespace: deployment.repositoryNamespace,
    },
    distributionId,
    computeRoleArn: Fn.importValue(
      `${deployment.computeNamespace}-client-instance-role-arn`,
    ),
    pipeline: {
      pipeline: {
        pipelineName: namespace,
        pipelineType: PipelineType.V2,
        restartExecutionOnUpdate: true,
        crossAccountKeys: false,
      },
      source: {
        action: {
          actionName: "Source",
          connectionArn: deployment.connectionArn,
          owner: deployment.githubOwner,
          repo: deployment.githubRepository,
          branch: deployment.githubBranch,
          triggerOnPush: false,
        },
        pushFilter: {
          branchesIncludes: [deployment.githubBranch],
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
          projectName: `${deployment.serviceNamespace}-build`,
          timeout: Duration.minutes(30),
          environment: {
            buildImage: LinuxBuildImage.STANDARD_7_0,
            computeType: ComputeType.SMALL,
            privileged: true,
            environmentVariables: {
              REPOSITORY_URI: {
                type: BuildEnvironmentVariableType.PLAINTEXT,
                value: repositoryUri,
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
      },
      deploy: {
        application: {
          applicationName: deployment.serviceNamespace,
        },
        deploymentGroup: {
          deploymentGroupName: deployment.serviceNamespace,
          ec2InstanceTags: new InstanceTagSet({
            [deployment.deploymentTagKey]: [deployment.deploymentTagValue],
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
          projectName: `${deployment.serviceNamespace}-invalidate-cdn`,
          environment: {
            buildImage: LinuxBuildImage.STANDARD_7_0,
            environmentVariables: {
              DISTRIBUTION_ID: {
                type: BuildEnvironmentVariableType.PLAINTEXT,
                value: distributionId,
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
      },
    },
  };
}

export default getPipelineConfig;
