# Shared Platform Infrastructure

This CDK application owns infrastructure shared by multiple application services.
Resources are separated into core, data, and observability stacks so each
resource group has an independent deployment lifecycle.

The stack uses native AWS CDK resources directly. Its only custom constructor
property is `namespace`; resource configuration is resolved internally through
`getXConfig(namespace)` functions.

## Current ownership

- One regional application VPC
- Public subnets for internet-facing load balancers
- Private subnets with egress for Nuxt and backend compute
- Stable CloudFormation exports for VPC and subnet attributes
- One DynamoDB table shared by all application services
- Composite `pk`/`sk` keys and the `GSI1` access-pattern index
- Native TTL on `ttl`, on-demand billing, point-in-time recovery, deletion
  protection, and retained data when its stack is removed
- One shared CloudWatch dashboard and application log group
- One shared SNS topic that service-owned CloudWatch alarms can notify

The VPC uses two Availability Zones and one NAT Gateway by default. Both choices
can be overridden in `bin/config/network.config.ts` before deployment.

## Commands

Set `CDK_DEFAULT_ACCOUNT`, `CDK_DEFAULT_REGION`, and optionally `APP_ENV`, then
review the generated change set before deploying:

```sh
pnpm infra:synth
pnpm infra:diff
```

Deployment is intentionally manual. Deploy the platform before any client or
service stack that imports its network exports.
