# Client infrastructure

This CDK application owns infrastructure specific to the Nuxt service. Every
stack follows the shared composition pattern: the static `build` method calls
`getXConfig(namespace)`, passes `namespace` and `config` through stack props,
and leaves the private constructor responsible only for resource composition.

## Stacks

- `RepositoryStack` owns the retained ECR repository for Nuxt images.
- `ComputeStack` imports the platform VPC and log group, creates a private
  Auto Scaling Group and public ALB, and grants Nuxt access to the internal
  Express ALB.
- `FirewallStack` applies AWS managed rules and viewer-IP rate limiting.
- `CdnStack` places CloudFront in front of the Nuxt ALB, disables caching for
  dynamic requests, and caches `/_nuxt/*` assets.
- `PipelineStack` builds and publishes the Docker image, deploys it with
  CodeDeploy, and invalidates CloudFront after a successful rollout.

The client does not recreate platform or server resources. It imports them
through stable CloudFormation exports.

## Prerequisites

Deploy the matching platform stacks and the server compute stack first. The
CodeConnections connection must also exist and be authorized before the first
pipeline execution.

Optional synthesis settings include `APP_ENV`, `CLIENT_INSTANCE_TYPE`,
`CLIENT_MIN_CAPACITY`, `CLIENT_MAX_CAPACITY`, `CLIENT_RATE_LIMIT`,
`GITHUB_OWNER`, `GITHUB_REPOSITORY`, `GITHUB_BRANCH`, and
`CODESTAR_CONNECTION_ARN`.

## Validation

```sh
pnpm --filter client infra:typecheck
pnpm --filter client infra:synth
pnpm --filter client infra:diff
```

Deployment is intentionally explicit through `pnpm --filter client
infra:deploy` and is never run by builds or tests.
