import { Stack } from "aws-cdk-lib";
import type { PipelineProject } from "aws-cdk-lib/aws-codebuild";
import type { Pipeline } from "aws-cdk-lib/aws-codepipeline";
import type {
  ServerApplication,
  ServerDeploymentGroup,
} from "aws-cdk-lib/aws-codedeploy";
import type { Construct } from "constructs";

import type { StackOptions } from "../../core/index.js";
import type { PipelineStackConfig } from "./config.js";
import { buildPipeline } from "./utils/index.js";

export class PipelineStack extends Stack {
  public readonly pipeline: Pipeline;
  public readonly buildProject: PipelineProject;
  public readonly application: ServerApplication;
  public readonly deploymentGroup: ServerDeploymentGroup;
  public readonly postDeployProject?: PipelineProject;

  constructor(
    scope: Construct,
    id: string,
    options: StackOptions<PipelineStackConfig>,
  ) {
    const { namespace, config, ...stackProps } = options;

    super(scope, id, stackProps);

    const resources = buildPipeline(this, namespace, config);

    this.pipeline = resources.pipeline;
    this.buildProject = resources.buildProject;
    this.application = resources.application;
    this.deploymentGroup = resources.deploymentGroup;
    this.postDeployProject = resources.postDeployProject;
  }
}
