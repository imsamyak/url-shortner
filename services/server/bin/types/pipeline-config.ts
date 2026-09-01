import type { PipelineConfig } from "@app/infra-core/constructs.js";
import type ServerDeploymentConfig from "./deployment-config.js";

export interface ServerPipelineConfig {
  readonly deployment: ServerDeploymentConfig;
  readonly repository: {
    readonly id: string;
    readonly namespace: string;
  };
  readonly computeRoleArn: string;
  readonly pipeline: Omit<PipelineConfig, "namespace" | "build"> & {
    readonly build: Omit<PipelineConfig["build"], "pushRepositories">;
  };
}

export default ServerPipelineConfig;
