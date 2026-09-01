import { ArnFormat, CfnOutput, type Stack } from "aws-cdk-lib";
import {
  PipelineProject,
  type PipelineProjectProps,
} from "aws-cdk-lib/aws-codebuild";
import {
  Artifact,
  Pipeline,
  ProviderType,
  type GitPushFilter,
  type PipelineProps,
  type TriggerProps,
} from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  CodeDeployServerDeployAction,
  CodeStarConnectionsSourceAction,
  type CodeBuildActionProps,
  type CodeDeployServerDeployActionProps,
  type CodeStarConnectionsSourceActionProps,
} from "aws-cdk-lib/aws-codepipeline-actions";
import {
  ServerApplication,
  ServerDeploymentGroup,
  type ServerApplicationProps,
  type ServerDeploymentGroupProps,
} from "aws-cdk-lib/aws-codedeploy";
import type { IRepository } from "aws-cdk-lib/aws-ecr";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export interface PipelineConfig {
  readonly namespace: string;
  readonly pipeline: Omit<PipelineProps, "stages" | "triggers">;
  readonly source: {
    readonly action: Omit<CodeStarConnectionsSourceActionProps, "output">;
    readonly pushFilter?: GitPushFilter;
  };
  readonly build: {
    readonly project: PipelineProjectProps;
    readonly action: Omit<
      CodeBuildActionProps,
      "project" | "input" | "extraInputs" | "outputs"
    >;
    readonly pushRepositories?: readonly IRepository[];
  };
  readonly deploy: {
    readonly application: ServerApplicationProps;
    readonly deploymentGroup: Omit<
      ServerDeploymentGroupProps,
      "application"
    >;
    readonly action: Omit<
      CodeDeployServerDeployActionProps,
      "input" | "deploymentGroup"
    >;
  };
  readonly postDeploy?: {
    readonly project: PipelineProjectProps;
    readonly action: Omit<
      CodeBuildActionProps,
      "project" | "input" | "extraInputs" | "outputs"
    >;
    readonly invalidateDistributionIds?: readonly string[];
  };
}

export interface PipelineResources {
  readonly pipeline: Pipeline;
  readonly buildProject: PipelineProject;
  readonly application: ServerApplication;
  readonly deploymentGroup: ServerDeploymentGroup;
  readonly postDeployProject?: PipelineProject;
}

/** Builds a source, Docker build, and EC2 CodeDeploy delivery pipeline. */
export function buildPipeline(
  stack: Stack,
  id: string,
  config: PipelineConfig,
): PipelineResources {
  const sourceOutput = new Artifact(`${id}SourceOutput`);
  const buildOutput = new Artifact(`${id}BuildOutput`);

  const sourceAction = new CodeStarConnectionsSourceAction({
    ...config.source.action,
    output: sourceOutput,
  });
  const buildProject = new PipelineProject(
    stack,
    `${id}-build-project`,
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
    stack,
    `${id}-application`,
    config.deploy.application,
  );
  const deploymentGroup = new ServerDeploymentGroup(
    stack,
    `${id}-deployment-group`,
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
      stack,
      `${id}-post-deploy-project`,
      config.postDeploy.project,
    );
    config.postDeploy.invalidateDistributionIds?.forEach((distributionId) => {
      postDeployProject!.addToRolePolicy(
        new PolicyStatement({
          actions: ["cloudfront:CreateInvalidation"],
          resources: [
            stack.formatArn({
              service: "cloudfront",
              region: "",
              resource: "distribution",
              resourceName: distributionId,
              arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
            }),
          ],
        }),
      );
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

  const pipeline = new Pipeline(stack, id, {
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

  new CfnOutput(stack, `${id}-name`, {
    value: pipeline.pipelineName,
    description: `${config.namespace} deployment pipeline name`,
  });

  return {
    pipeline,
    buildProject,
    application,
    deploymentGroup,
    ...(postDeployProject ? { postDeployProject } : {}),
  };
}
