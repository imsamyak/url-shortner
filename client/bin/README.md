# Client infrastructure

Nuxt currently owns the application VPC and the public delivery infrastructure.
Backend services import the VPC and private-subnet exports rather than creating
their own networks.

The CDK app creates:

- A two-AZ VPC with public and private-with-egress subnets.
- An ECR repository for the Nuxt Docker image.
- A private Auto Scaling Group with at least two Nuxt instances.
- A public Application Load Balancer.
- A CloudFront distribution with optimized caching for `/_nuxt/*` assets.
- A regional WAF with common managed rules and IP rate limiting.
- A CodeConnections, CodeBuild, ECR, CodeDeploy, and CDN-invalidation pipeline.

The Nuxt instance security group is granted access to the private Express load
balancer through the server's exported security-group ID. No other VPC resource
receives that ingress rule.

`assets/` contains the CodeDeploy Docker lifecycle hooks. Concrete resource
settings live in `config/`; reusable implementations come from `@app/constructs`.

Validate the complete Nuxt graph without deploying:

```sh
pnpm --filter client infra:typecheck
pnpm --filter client infra:synth
```

The network stack must be deployed first. The server can then import it, after
which the remaining Nuxt stacks can consume the server's internal load-balancer
exports. Deployment remains an explicit, separately authorized operation.
