import { RemovalPolicy } from "aws-cdk-lib";
import {
  RepositoryEncryption,
  TagMutability,
} from "aws-cdk-lib/aws-ecr";

import type RepositoryConfig from "../../types/repository-config.js";

/** Builds the Express image repository configuration. */
export function getRepositoryConfig(namespace: string): RepositoryConfig {
  const serviceNamespace = namespace.replace(/-repository$/, "");

  return {
    repository: {
      repositoryName: serviceNamespace.toLowerCase(),
      encryption: RepositoryEncryption.AES_256,
      imageScanOnPush: true,
      imageTagMutability: TagMutability.MUTABLE,
      emptyOnDelete: false,
      removalPolicy: RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          description: "Retain the latest 50 server images",
          maxImageCount: 50,
        },
      ],
    },
  };
}

export default getRepositoryConfig