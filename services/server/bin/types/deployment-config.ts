export interface ServerDeploymentConfig {
  readonly serviceNamespace: string;
  readonly platformNamespace: string;
  readonly repositoryNamespace: string;
  readonly computeNamespace: string;
  readonly awsRegion: string;
  readonly port: number;
  readonly instanceType: string;
  readonly minCapacity: number;
  readonly maxCapacity: number;
  readonly runtimeSecretName: string;
  readonly deploymentTagKey: string;
  readonly deploymentTagValue: string;
  readonly connectionArn: string;
  readonly githubOwner: string;
  readonly githubRepository: string;
  readonly githubBranch: string;
  readonly rateLimitPerFiveMinutes: number;
}

export default ServerDeploymentConfig;
