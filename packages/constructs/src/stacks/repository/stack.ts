import { Stack } from "aws-cdk-lib";
import type { Repository } from "aws-cdk-lib/aws-ecr";
import type { Construct } from "constructs";

import type { StackOptions } from "../../core/index.js";
import type { RepositoryStackConfig } from "./config.js";
import { buildRepositories } from "./utils/index.js";

export class RepositoryStack extends Stack {
  public readonly repositories: Readonly<Record<string, Repository>>;

  constructor(
    scope: Construct,
    id: string,
    options: StackOptions<RepositoryStackConfig>,
  ) {
    const { namespace, config, ...stackProps } = options;

    super(scope, id, stackProps);

    this.repositories = buildRepositories(this, namespace, config);
  }
}
