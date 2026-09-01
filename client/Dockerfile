# Build from the repository root: docker build -f client/Dockerfile -t url-shortener-client .
FROM node:22-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages packages
COPY client/package.json client/package.json

# Install only the client dependency graph while retaining a frozen workspace lockfile.
RUN pnpm install --filter client... --frozen-lockfile

COPY client client

RUN pnpm --filter client build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN apt-get update \
  && apt-get install --no-install-recommends -y tini \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /workspace/client/.output ./.output

# The Nitro output is standalone, so source files and build tooling stay out of the image.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["tini", "--"]
CMD ["node", ".output/server/index.mjs"]
