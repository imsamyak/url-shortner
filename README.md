# URL Shortener

A pnpm workspace containing a Nuxt application, an Express API, end-to-end
tests, and AWS CDK infrastructure.

## Architecture

```text
Internet
   |
CloudFront
   |
Public application load balancer
   |
Nuxt Auto Scaling Group (private subnets, 2-8 instances)
   |
Internal application load balancer + WAF rate limit
   |
Express Auto Scaling Group (private subnets, 2-6 instances)
   |
DynamoDB
```

Nuxt and Express share one two-AZ VPC. Only Nuxt is publicly reachable.
Express accepts traffic from the Nuxt instances through its internal load
balancer. Client and server releases use separate CodePipeline, CodeBuild, and
rolling CodeDeploy workflows.

## Workspace

| Directory | Purpose |
| --- | --- |
| `client` | Nuxt SSR application, server-side API facade, and client-owned CDK stacks/assets in `client/bin` |
| `services/server` | Express API, DynamoDB repositories, tests, and server-owned infrastructure config |
| `packages` | Shared error, type, utility, and reusable AWS stack packages |

## Local development

Requirements:

- Node.js 22 or later
- pnpm through Corepack
- Docker only when running DynamoDB Local or building images

Install dependencies:

```sh
corepack enable
pnpm install --frozen-lockfile
```

Start DynamoDB Local:

```sh
docker compose up -d dynamodb-local
```

Create `services/server/.env` containing secrets only:

```dotenv
JWT_SECRET=replace-with-at-least-32-random-characters
```

The complete local template is in `services/server/.env.example`; the client
template is in `client/.env.example`. Express keeps non-secret settings in typed
`services/server/src/config/<environment>` folders. Its `loadConfig()` function
selects `APP_ENV` and defaults to `local`. Nuxt keeps its framework-native
configuration boundary in `client/nuxt.config.ts`.

Run the applications in separate terminals:

```sh
pnpm --filter server dev
pnpm --filter client dev
```

The client runs at `http://localhost:3000`; the API runs at
`http://localhost:4000`.

## Builds and tests

```sh
pnpm --filter client build
pnpm run build:server
pnpm --filter server test
```

## Containers

Build from the repository root because both Dockerfiles consume the workspace
lockfile:

```sh
docker build -f client/Dockerfile -t url-shortener-client .
docker build -f services/server/Dockerfile -t url-shortener-server .
```

Runtime secrets are not stored in either image. Supply `JWT_SECRET` and AWS
credentials or an instance role when the server container starts. Non-secret
server settings come from the selected config folder. Supply
`NUXT_PUBLIC_API_URL` to Nuxt.

## Expiring redirects

Redirect records retain `expiresAt` as a UTC string for the API. When a record
is written, the repository derives a parallel `ttl` value in Unix epoch seconds.
DynamoDB TTL is configured against `ttl`; deletion is asynchronous and may
happen after the exact expiration time. Existing records need a `ttl` backfill.

## Infrastructure

Client infrastructure lives in `client/bin` and currently owns the shared VPC,
Nuxt ECR repository, auto-scaled fleet, public load balancer, CDN, WAF, and
application pipeline. Express imports the Nuxt-owned VPC and owns its ECR,
DynamoDB, private fleet, internal load balancer, WAF, and application pipeline
configuration in `services/server/bin`. `@app/infra-core` provides the reusable,
parameterized stack implementations.

Validate the server template with `pnpm --filter server infra:synth`. Deployment
remains an explicit operation and is not part of builds or tests.
