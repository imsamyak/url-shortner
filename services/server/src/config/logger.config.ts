import LoadEnv from "@app/utils/loadEnv";
import { z } from "zod";

const level = LoadEnv.of("LOG_LEVEL", z.string().default("info")).get();
const isLocal = LoadEnv.of("NODE_ENV", z.string().default("local")).get() === "local";

const loggerConfig = {
  name: 'server',
  level,
  pretty: isLocal
} as const;

export default loggerConfig;
