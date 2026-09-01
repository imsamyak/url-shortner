import type { PipelineConfig } from "@app/infra-core/constructs.js";
import type ClientDeploymentConfig from "./deployment-config.js";

type PostDeployConfig = NonNullable<PipelineConfig["postDeploy"]>;

export default interface ClientPipelineConfig {
  readonly deployment: ClientDeploymentConfig;
  readonly repository: {
    readonly id: string;
    readonly namespace: string;
  };
  readonly distributionId: string;
  readonly computeRoleArn: string;
  readonly pipeline: Omit<
    PipelineConfig,
    "namespace" | "build" | "postDeploy"
  > & {
    readonly build: Omit<PipelineConfig["build"], "pushRepositories">;
    readonly postDeploy: Omit<
      PostDeployConfig,
      "invalidateDistributionIds"
    >;
  };
}
