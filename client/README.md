# Client

Nuxt SSR application for creating, managing, and resolving shortened URLs. Its
Nitro server is the public application layer and calls the private Express API.

## Development

```sh
pnpm install --frozen-lockfile
pnpm --filter client dev
```

The client runs at `http://localhost:3000`. Override the default API endpoint
with `NUXT_PUBLIC_API_URL` when Express is not running on localhost.

Set `NUXT_HEALTH_CHECK_URL` to a backend health endpoint when the API host can
sleep while idle. During SSR, Nuxt calls this private URL before rendering,
deduplicates concurrent wake-ups, and waits five minutes after a successful
check before calling it again. Health-check failures are logged without failing
the page render.

`nuxt.config.ts` is the client's only environment boundary. Nuxt application
and Nitro code consume its runtime config with the auto-imported
`useRuntimeConfig()` helper, so no separate config imports are needed.

## Production

```sh
pnpm --filter client build
pnpm --filter client preview
docker build -f client/Dockerfile -t url-shortener-client .
```

The Docker image contains only Nitro's standalone `.output` directory, runs as
the non-root `node` user, and exposes a health check on port 3000.

In AWS, CloudFront fronts the public Nuxt load balancer. Nuxt instances run in
private subnets and reach Express through its internal load balancer.
