import type { RepositoryStackConfig } from "@app/constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { TagMutability } from "aws-cdk-lib/aws-ecr";

import { clientDeploymentConfig } from "./deployment.config.js";

export const repositoryConfig: RepositoryStackConfig = [
  {
    id: "client",
    repository: {
      repositoryName: `${clientDeploymentConfig.namespace}-client`,
      imageScanOnPush: true,
      imageTagMutability: TagMutability.MUTABLE,
      removalPolicy: RemovalPolicy.RETAIN,
      lifecycleRules: [
        { maxImageCount: 50, description: "Keep the latest 50 releases" },
      ],
    },
  },
];
