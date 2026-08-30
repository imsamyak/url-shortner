import { CfnOutput } from "aws-cdk-lib";
import { PipelineProject } from "aws-cdk-lib/aws-codebuild";
import {
  Artifact,
  Pipeline,
  ProviderType,
  type TriggerProps,
} from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  CodeDeployServerDeployAction,
  CodeStarConnectionsSourceAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import {
  ServerApplication,
  ServerDeploymentGroup,
} from "aws-cdk-lib/aws-codedeploy";
import type { Construct } from "constructs";

import type { PipelineStackConfig } from "../config.js";

export interface PipelineResources {
  readonly pipeline: Pipeline;
  readonly buildProject: PipelineProject;
  readonly application: ServerApplication;
  readonly deploymentGroup: ServerDeploymentGroup;
  readonly postDeployProject?: PipelineProject;
}

export function buildPipeline(
  scope: Construct,
  namespace: string,
  config: PipelineStackConfig,
): PipelineResources {
  const sourceOutput = new Artifact("SourceOutput");
  const buildOutput = new Artifact("BuildOutput");

  const sourceAction = new CodeStarConnectionsSourceAction({
    ...config.source.action,
    output: sourceOutput,
  });

  const buildProject = new PipelineProject(
    scope,
    "BuildProject",
    config.build.project,
  );
  config.build.pushRepositories?.forEach((repository) => {
    repository.grantPullPush(buildProject);
  });

  const buildAction = new CodeBuildAction({
    ...config.build.action,
    project: buildProject,
    input: sourceOutput,
    outputs: [buildOutput],
  });

  const application = new ServerApplication(
    scope,
    "CodeDeployApplication",
    config.deploy.application,
  );
  const deploymentGroup = new ServerDeploymentGroup(
    scope,
    "CodeDeployDeploymentGroup",
    {
      ...config.deploy.deploymentGroup,
      application,
    },
  );
  const deployAction = new CodeDeployServerDeployAction({
    ...config.deploy.action,
    input: buildOutput,
    deploymentGroup,
  });

  let postDeployProject: PipelineProject | undefined;
  let postDeployAction: CodeBuildAction | undefined;

  if (config.postDeploy) {
    postDeployProject = new PipelineProject(
      scope,
      "PostDeployProject",
      config.postDeploy.project,
    );
    config.postDeploy.invalidateDistributions?.forEach((distribution) => {
      distribution.grantCreateInvalidation(postDeployProject!);
    });
    postDeployAction = new CodeBuildAction({
      ...config.postDeploy.action,
      runOrder: config.postDeploy.action.runOrder ?? 2,
      project: postDeployProject,
      input: sourceOutput,
    });
  }

  const triggers: TriggerProps[] | undefined = config.source.pushFilter
    ? [
        {
          providerType: ProviderType.CODE_STAR_SOURCE_CONNECTION,
          gitConfiguration: {
            sourceAction,
            pushFilter: [config.source.pushFilter],
          },
        },
      ]
    : undefined;

  const pipeline = new Pipeline(scope, "Pipeline", {
    ...config.pipeline,
    stages: [
      { stageName: "Source", actions: [sourceAction] },
      { stageName: "Build", actions: [buildAction] },
      {
        stageName: "Deploy",
        actions: postDeployAction
          ? [deployAction, postDeployAction]
          : [deployAction],
      },
    ],
    ...(triggers ? { triggers } : {}),
  });

  new CfnOutput(scope, "pipeline-name", {
    value: pipeline.pipelineName,
    exportName: `${namespace}-pipeline-name`,
  });

  return {
    pipeline,
    buildProject,
    application,
    deploymentGroup,
    ...(postDeployProject ? { postDeployProject } : {}),
  };
}
