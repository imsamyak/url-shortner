import LoadEnv from "@app/utils/loadEnv";
import { z } from "zod";

const level = LoadEnv.of("LOG_LEVEL", z.string().default("info")).get();
const isDev = LoadEnv.of("NODE_ENV", z.string().default("development")).get() === "development";

const loggerConfig = {
  name: 'server',
  level,
  pretty: true
} as const;

export default loggerConfig;
