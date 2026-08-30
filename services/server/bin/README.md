# Server infrastructure

This folder owns the concrete configuration and composition for the Express
service. `@app/constructs` supplies the reusable stack implementations.

The CDK app creates:

- The Nuxt-owned VPC and its two private subnets through CloudFormation imports.
- An ECR repository for the Express Docker image.
- The DynamoDB single table, GSI, TTL, retention, and recovery settings.
- A private Express Auto Scaling Group with at least two instances.
- An internal Application Load Balancer with `/health` target checks.
- CPU target tracking that can scale the server fleet to six instances by default.
- A regional WAF with AWS common rules and an IP rate limit.
- A CodeConnections, CodeBuild, ECR, and CodeDeploy application pipeline.

The internal load balancer has no public route. Its listener security group is
not opened to the whole VPC; the Nuxt infrastructure grants only the Nuxt
instance security group access.

## Runtime secret

Production instances import one existing Secrets Manager JSON secret named
`global-url-shortener-server-<env>/runtime` by default. At minimum it must contain:

```json
{
  "JWT_SECRET": "replace-with-at-least-32-random-characters"
}
```

Set `SERVER_RUNTIME_SECRET_NAME` while synthesizing to reference another secret.
The secret is read by the EC2 role and materialized only on the instance for the
Docker process; it is not included in the image or CloudFormation template.

## Deployment configuration

These optional, non-secret environment variables control synthesis:

| Variable | Default |
| --- | --- |
| `DEPLOY_ENV` | `dev` |
| `SERVER_INSTANCE_TYPE` | `t3.micro` |
| `SERVER_MIN_CAPACITY` | `2` |
| `SERVER_MAX_CAPACITY` | `6` |
| `SERVER_RATE_LIMIT` | `1000` requests per five minutes per IP |
| `GITHUB_OWNER` | `imsamyak` |
| `GITHUB_REPOSITORY` | `url-shortner` |
| `GITHUB_BRANCH` | `main` |
| `CODESTAR_CONNECTION_ARN` | Placeholder ARN suitable only for synthesis |

AWS CodeConnections authorization and the runtime secret are external
prerequisites before the first deployment. The Nuxt network stack must already
exist because the server imports its VPC and private-subnet exports.

## Validation

Validate the generated CloudFormation template without deploying:

```sh
pnpm --filter server infra:synth
```

Deployment is intentionally explicit and is never run as part of builds or
tests. When separately authorized, `pnpm --filter server infra:deploy` deploys
all server-owned stacks.
