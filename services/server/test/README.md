# Server tests

All server tests live in this directory:

- `unit/` contains isolated Vitest coverage for every core service.
- `e2e/` contains Playwright API tests for every registered HTTP endpoint.
- `e2e/support/server.ts` starts the real Express application with in-memory
  repository adapters, so API tests do not require Docker, DynamoDB, or AWS.

Run the complete suite from the workspace root:

```sh
pnpm --filter server test
```

Use `test:unit`, `test:unit:watch`, `test:e2e`, or `test:e2e:ui` for an
individual workflow. Test failures are printed to the console. Playwright does
not create a `test-results` directory in the project.
