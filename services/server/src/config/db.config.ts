import LoadEnv from "@app/utils/LoadEnv";
import { z } from "zod";

const endpoint = LoadEnv.of("DYNAMODB_ENDPOINT", z.string().optional()).get();
const region = LoadEnv.of("AWS_REGION", z.string().default("us-east-1")).get();
const tableName = LoadEnv.of(
  "DYNAMODB_TABLE_NAME",
  z.string().default("url_shortner_table"),
).get();

const dbConfig = {
  endpoint,
  region,
  tableName,
} as const;

export default dbConfig;
