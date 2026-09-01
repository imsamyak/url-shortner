import type { RepositoryProps } from "aws-cdk-lib/aws-ecr";

export interface RepositoryConfig {
  readonly repository: RepositoryProps;
}

export default RepositoryConfig;
