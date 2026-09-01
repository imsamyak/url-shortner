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

import type ServerPipelineConfig from "../../types/pipeline-config.js";

/** Builds Docker publication and EC2 CodeDeploy pipeline configuration. */
export function getPipelineConfig(namespace: string): ServerPipelineConfig {
  const deployment = getDeploymentConfig(namespace);
  const repositoryUri = Fn.importValue(
    `${deployment.repositoryNamespace}-server-repository-uri`,
  );

  return {
    deployment,
    repository: {
      id: "server",
      namespace: deployment.repositoryNamespace,
    },
    computeRoleArn: Fn.importValue(
      `${deployment.computeNamespace}-server-instance-role-arn`,
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
                  "bash services/server/bin/assets/pipeline/build.sh",
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
        action: { actionName: "DeployServer" },
      },
    },
  };
}

export default getPipelineConfig;
