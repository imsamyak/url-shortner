import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  splitting: false,
  noExternal: [/^@app\//],
  external: ["jsonwebtoken", "jws", "safe-buffer", "validator", "bcrypt", "swagger-ui-express"],
});
