import type {
  ApplicationLoadBalancerConfig,
  AutoScalingGroupConfig,
} from "@app/infra-core/constructs.js";

import type ServerDeploymentConfig from "./deployment-config.js";

export interface CloudFormationImportConfig {
  readonly id: string;
  readonly namespace: string;
}

export interface ServerComputeConfig {
  readonly deployment: ServerDeploymentConfig;
  readonly imports: {
    readonly vpc: CloudFormationImportConfig;
    readonly table: CloudFormationImportConfig;
    readonly logGroup: CloudFormationImportConfig;
    readonly repository: CloudFormationImportConfig;
  };
  readonly autoScalingGroup: AutoScalingGroupConfig["props"];
  readonly cpuTargetUtilizationPercent: number;
  readonly instanceTags: Readonly<Record<string, string>>;
  readonly loadBalancer: Omit<
    ApplicationLoadBalancerConfig,
    "namespace" | "vpc" | "targets"
  >;
}

export interface ServerRuntimeResources {
  readonly tableName: string;
  readonly repositoryName: string;
  readonly repositoryUri: string;
  readonly logGroupName: string;
}

export default ServerComputeConfig;
