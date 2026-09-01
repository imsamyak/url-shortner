export default interface ClientDeploymentConfig {
  readonly serviceNamespace: string;
  readonly platformNamespace: string;
  readonly serverComputeNamespace: string;
  readonly repositoryNamespace: string;
  readonly computeNamespace: string;
  readonly cdnNamespace: string;
  readonly awsRegion: string;
  readonly port: number;
  readonly instanceType: string;
  readonly minCapacity: number;
  readonly maxCapacity: number;
  readonly deploymentTagKey: string;
  readonly deploymentTagValue: string;
  readonly connectionArn: string;
  readonly githubOwner: string;
  readonly githubRepository: string;
  readonly githubBranch: string;
  readonly rateLimitPerFiveMinutes: number;
}
