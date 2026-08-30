import { CfnOutput } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-ecr";
import type { Construct } from "constructs";

import type { RepositoryStackConfig } from "../config.js";

export function buildRepositories(
  scope: Construct,
  namespace: string,
  config: RepositoryStackConfig,
): Readonly<Record<string, Repository>> {
  const repositories: Record<string, Repository> = {};

  config.forEach(({ id, repository: props }) => {
    if (repositories[id]) {
      throw new Error(`Duplicate ECR repository id: ${id}`);
    }

    const repository = new Repository(scope, `ecr-${id}`, props);

    new CfnOutput(scope, `${id}-repository-uri`, {
      value: repository.repositoryUri,
      exportName: `${namespace}-${id}-ecr-uri`,
    });

    new CfnOutput(scope, `${id}-repository-arn`, {
      value: repository.repositoryArn,
      exportName: `${namespace}-${id}-ecr-arn`,
    });

    repositories[id] = repository;
  });

  return repositories;
}
