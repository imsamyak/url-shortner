import { CfnOutput, Fn, type Stack } from "aws-cdk-lib";
import {
  Repository,
  type IRepository,
  type RepositoryProps,
} from "aws-cdk-lib/aws-ecr";

export interface EcrRepositoryConfig {
  readonly namespace: string;
  readonly props: RepositoryProps;
}

/** Builds one ECR repository and exports the identifiers needed by consumers. */
export function buildEcrRepository(
  stack: Stack,
  id: string,
  config: EcrRepositoryConfig,
): Repository {
  const { namespace, props } = config;
  const repository = new Repository(stack, id, props);

  new CfnOutput(stack, `${id}-name`, {
    value: repository.repositoryName,
    exportName: `${namespace}-${id}-repository-name`,
  });

  new CfnOutput(stack, `${id}-uri`, {
    value: repository.repositoryUri,
    exportName: `${namespace}-${id}-repository-uri`,
  });

  new CfnOutput(stack, `${id}-arn`, {
    value: repository.repositoryArn,
    exportName: `${namespace}-${id}-repository-arn`,
  });

  return repository;
}

/** Imports an ECR repository from another CloudFormation stack's exports. */
export function getEcrRepository(
  stack: Stack,
  id: string,
  namespace: string,
): IRepository {
  return Repository.fromRepositoryAttributes(stack, `imported-ecr-${id}`, {
    repositoryName: Fn.importValue(
      `${namespace}-${id}-repository-name`,
    ),
    repositoryArn: Fn.importValue(`${namespace}-${id}-repository-arn`),
  });
}
