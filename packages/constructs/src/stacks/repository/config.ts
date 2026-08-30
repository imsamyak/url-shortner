import type { RepositoryProps } from "aws-cdk-lib/aws-ecr";

export interface ContainerRepositoryConfig {
  readonly id: string;
  readonly repository: RepositoryProps;
}

export type RepositoryStackConfig = readonly ContainerRepositoryConfig[];
