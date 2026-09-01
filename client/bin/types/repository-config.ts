import type { RepositoryProps } from "aws-cdk-lib/aws-ecr";

export default interface RepositoryConfig {
  readonly repository: RepositoryProps;
}
