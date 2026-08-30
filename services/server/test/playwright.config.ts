import { defineConfig } from "@playwright/test";
import os from "node:os";
import path from "node:path";

const port = 4100;
const baseURL = `http://127.0.0.1:${port}`;
const testSecret = "server-e2e-jwt-secret-at-least-32-characters";

process.env.APP_ENV = "test";
process.env.JWT_SECRET = testSecret;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: path.join(os.tmpdir(), "app-server-playwright"),
  preserveOutput: "never",
  use: {
    baseURL,
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
  webServer: {
    command: "pnpm exec tsx e2e/support/server.ts",
    url: `${baseURL}/health`,
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      APP_ENV: "test",
      JWT_SECRET: testSecret,
    },
  },
});
