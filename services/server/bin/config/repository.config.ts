import type { RepositoryStackConfig } from "@app/constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { TagMutability } from "aws-cdk-lib/aws-ecr";

import { serverDeploymentConfig } from "./deployment.config.js";

/** Docker image repository for immutable releases plus the mutable current tag. */
export const repositoryConfig: RepositoryStackConfig = [
  {
    id: "server",
    repository: {
      repositoryName: `${serverDeploymentConfig.namespace}-server`,
      imageScanOnPush: true,
      imageTagMutability: TagMutability.MUTABLE,
      removalPolicy: RemovalPolicy.RETAIN,
      lifecycleRules: [
        { maxImageCount: 50, description: "Keep the latest 50 releases" },
      ],
    },
  },
];
