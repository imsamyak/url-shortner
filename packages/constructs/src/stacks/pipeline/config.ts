import type { PipelineProjectProps } from "aws-cdk-lib/aws-codebuild";
import type { IDistribution } from "aws-cdk-lib/aws-cloudfront";
import type {
  GitPushFilter,
  PipelineProps,
} from "aws-cdk-lib/aws-codepipeline";
import type {
  CodeBuildActionProps,
  CodeDeployServerDeployActionProps,
  CodeStarConnectionsSourceActionProps,
} from "aws-cdk-lib/aws-codepipeline-actions";
import type {
  ServerApplicationProps,
  ServerDeploymentGroupProps,
} from "aws-cdk-lib/aws-codedeploy";
import type { IRepository } from "aws-cdk-lib/aws-ecr";

export interface PipelineBuildConfig {
  readonly project: PipelineProjectProps;
  readonly action: Omit<
    CodeBuildActionProps,
    "project" | "input" | "extraInputs" | "outputs"
  >;
  readonly pushRepositories?: readonly IRepository[];
}

export interface PipelineDeployConfig {
  readonly application: ServerApplicationProps;
  readonly deploymentGroup: Omit<ServerDeploymentGroupProps, "application">;
  readonly action: Omit<
    CodeDeployServerDeployActionProps,
    "input" | "deploymentGroup"
  >;
}

export interface PipelinePostDeployConfig {
  readonly project: PipelineProjectProps;
  readonly action: Omit<
    CodeBuildActionProps,
    "project" | "input" | "extraInputs" | "outputs"
  >;
  readonly invalidateDistributions?: readonly IDistribution[];
}

export interface PipelineStackConfig {
  readonly pipeline: Omit<PipelineProps, "stages" | "triggers">;
  readonly source: {
    readonly action: Omit<CodeStarConnectionsSourceActionProps, "output">;
    readonly pushFilter?: GitPushFilter;
  };
  readonly build: PipelineBuildConfig;
  readonly deploy: PipelineDeployConfig;
  readonly postDeploy?: PipelinePostDeployConfig;
}
