import type {
  ApplicationLoadBalancerConfig,
  AutoScalingGroupConfig,
} from "@app/infra-core/constructs.js";

import type ClientDeploymentConfig from "./deployment-config.js";

export interface CloudFormationImportConfig {
  readonly id: string;
  readonly namespace: string;
}

export default interface ClientComputeConfig {
  readonly deployment: ClientDeploymentConfig;
  readonly imports: {
    readonly vpc: CloudFormationImportConfig;
    readonly logGroup: CloudFormationImportConfig;
    readonly repository: CloudFormationImportConfig;
    readonly serverLoadBalancer: CloudFormationImportConfig;
  };
  readonly autoScalingGroup: AutoScalingGroupConfig["props"];
  readonly cpuTargetUtilizationPercent: number;
  readonly instanceTags: Readonly<Record<string, string>>;
  readonly loadBalancer: Omit<
    ApplicationLoadBalancerConfig,
    "namespace" | "vpc" | "targets"
  >;
}

export interface ClientRuntimeResources {
  readonly apiUrl: string;
  readonly repositoryName: string;
  readonly repositoryUri: string;
  readonly logGroupName: string;
}
