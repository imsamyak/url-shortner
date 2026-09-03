# Server infrastructure

This CDK application owns infrastructure specific to the Express service. Every
stack follows the same composition pattern: its static `build` method resolves
configuration with `getXConfig(namespace)`, passes `namespace` and `config`
through stack props, and leaves the private constructor responsible only for
creating resources.

## Stacks

- `RepositoryStack` owns the retained ECR repository for Express images.
- `ComputeStack` imports the platform VPC, DynamoDB table, and application log
  group, then creates a private Auto Scaling Group and Nuxt-only internal ALB.
- `FirewallStack` associates regional WAF managed rules and IP rate limiting
  with the internal Express ALB.
- `PipelineStack` builds the Docker image, pushes versioned and `current` tags,
  and rolls it out to tagged EC2 instances through CodeDeploy.

The server does not recreate platform resources. It imports the VPC, shared
table, and observability resources through CloudFormation exports.

## Prerequisites

Deploy the matching platform environment first. Before the first server
deployment, create the CodeConnections connection and the existing Secrets
Manager JSON secret named `UrlShortner-<env>-server/runtime` by default. The
secret must contain `JWT_SECRET` with at least 32 characters.

Optional synthesis settings include `APP_ENV`, `SERVER_INSTANCE_TYPE`,
`SERVER_MIN_CAPACITY`, `SERVER_MAX_CAPACITY`, `SERVER_RATE_LIMIT`,
`SERVER_RUNTIME_SECRET_NAME`, `GITHUB_OWNER`, `GITHUB_REPOSITORY`,
`GITHUB_BRANCH`, and `CODESTAR_CONNECTION_ARN`.

## Validation

```sh
pnpm --filter server typecheck
pnpm --filter server infra:synth
pnpm --filter server infra:diff
```

Deployment remains explicit through `pnpm --filter server infra:deploy` and is
not run by builds or tests.
