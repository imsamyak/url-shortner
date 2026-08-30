# Build from the repository root: docker build -f services/server/Dockerfile -t url-shortener-server .
FROM node:22-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY services services
COPY packages packages

# Native modules are built in the same Debian family used by the runtime image.
RUN pnpm install --filter server... --frozen-lockfile

RUN pnpm --filter server... --if-present build \
  && pnpm --filter server deploy --prod --legacy /release

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV APP_ENV=production

# JWT_SECRET and cloud credentials are deliberately supplied only at runtime.

WORKDIR /app

RUN apt-get update \
  && apt-get install --no-install-recommends -y tini \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /release ./

# The pruned release contains production dependencies but no compiler toolchain.
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/index.js"]
