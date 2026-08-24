import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  SecretValue,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import {
  BuildSpec,
  Cache,
  LinuxBuildImage,
  LocalCacheMode,
  PipelineProject,
} from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import {
  CodeBuildAction,
  GitHubSourceAction,
  GitHubTrigger,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface PipelineStackProps extends StackProps {
  realm: string;
  environment: string;
  service: string;
  name: string;
  region?: string;
  githubOwner?: string;
  githubRepo?: string;
  githubBranch?: string;
  githubTokenSecretName?: string;
  [key: string]: any;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const artifactBucket = new Bucket(this, 'PipelineArtifacts', {
      bucketName: `${this.stackName.toLowerCase()}`
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .concat('-artifacts'),
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const sourceOutput = new Artifact('SourceOutput');
    const clientOutput = new Artifact('ClientBuildOutput');
    const serverOutput = new Artifact('ServerBuildOutput');

    const sourceAction = new GitHubSourceAction({
      actionName: 'GitHubSource',
      owner: props.githubOwner ?? 'imsamyak',
      repo: props.githubRepo ?? 'url-shortner',
      branch: props.githubBranch ?? 'main',
      oauthToken: SecretValue.secretsManager(
        props.githubTokenSecretName ?? 'github-token'
      ),
      output: sourceOutput,
      trigger: GitHubTrigger.WEBHOOK,
    });

    const clientProject = new PipelineProject(this, 'ClientBuild', {
      projectName: `${this.stackName}-client-build`,
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
      },
      cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
      timeout: Duration.minutes(30),
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['corepack enable', 'pnpm install --frozen-lockfile'],
          },
          build: {
            commands: ['pnpm --filter client build'],
          },
        },
        artifacts: {
          'base-directory': 'client/.output',
          files: ['**/*'],
        },
      }),
    });

    const serverProject = new PipelineProject(this, 'ServerBuild', {
      projectName: `${this.stackName}-server-build`,
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
      },
      cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
      timeout: Duration.minutes(30),
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['corepack enable', 'pnpm install --frozen-lockfile'],
          },
          build: {
            commands: ['pnpm --filter server build'],
          },
        },
        artifacts: {
          'base-directory': 'server',
          files: ['dist/**/*', 'package.json'],
        },
      }),
    });

    const pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: `${this.stackName}-pipeline`,
      artifactBucket,
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'ClientBuild',
          actions: [
            new CodeBuildAction({
              actionName: 'BuildClient',
              project: clientProject,
              input: sourceOutput,
              outputs: [clientOutput],
            }),
          ],
        },
        {
          stageName: 'ServerBuild',
          actions: [
            new CodeBuildAction({
              actionName: 'BuildServer',
              project: serverProject,
              input: sourceOutput,
              outputs: [serverOutput],
            }),
          ],
        },
      ],
    });

    new CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
    });

    new CfnOutput(this, 'ClientBuildProjectName', {
      value: clientProject.projectName,
    });

    new CfnOutput(this, 'ServerBuildProjectName', {
      value: serverProject.projectName,
    });
  }
}

export default PipelineStack;
