# Server

Express API for authentication, redirect management, and redirect resolution.
Data is stored in a single-table DynamoDB design.

## Configuration

Only secrets belong in `services/server/.env`:

| Secret | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | Yes | Signs and validates tokens; minimum 32 characters |
| `AWS_ACCESS_KEY_ID` | No | AWS credential when an IAM role is unavailable |
| `AWS_SECRET_ACCESS_KEY` | No | Must be supplied with `AWS_ACCESS_KEY_ID` |

Use an EC2 role or container task role in AWS. Do not embed AWS credentials or
`JWT_SECRET` in source code or container images.

Non-secret settings live in `src/config/<environment>/index.ts`. Set `APP_ENV`
to `local`, `dev`, `test`, `staging`, or `production` when starting the process;
`loadConfig()` selects that folder. It defaults to `local` for development.
Add the real Nuxt origins to the staging and production files before deployment.

## Development

```sh
docker compose up -d dynamodb-local
pnpm run build:packages
pnpm --filter server dev
```

Copy the service-owned example, then replace its development secret:

```sh
cp services/server/.env.example services/server/.env
```

`@app/utils/loadEnv` supplies the lazy `LoadEnv` utility. `loadConfig()` uses it for
secrets, then injects them into the selected typed configuration. Reusable
packages receive typed configuration and never read process environment
variables themselves.

The API runs at `http://localhost:4000`, with health status at `/health` and
versioned endpoints under `/api/v1`.

## Production

```sh
pnpm run build:server
docker build -f services/server/Dockerfile -t url-shortener-server .
```

The image runs as a non-root user and requires `JWT_SECRET` at startup.

## DynamoDB TTL

The public redirect model keeps `expiresAt` as a UTC string. The repository adds
the numeric `ttl` attribute only to the DynamoDB `PutCommand` item. AWS expires
items based on that epoch-seconds value; `ttl` is not part of the domain model.
The API never creates or modifies the table schema; `DataStack` owns that
infrastructure lifecycle.
