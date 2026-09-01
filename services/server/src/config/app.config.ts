import LoadEnv from "@app/utils/loadEnv";
import { z } from "zod";

const port = LoadEnv.of("PORT", z.coerce.number().default(4000)).get();
const host = LoadEnv.of("HOST", z.string().default("0.0.0.0")).get();
const corsClients = LoadEnv.of(
  "CORS_CLIENTS",
  z.string().transform((str) => str.split(",")).default("*"),
).get();

const appConfig = {
  port,
  host,
  corsClients,
} as const;

export default appConfig;
