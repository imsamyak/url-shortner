import LoadEnv from "@app/utils/loadEnv";
import { z } from "zod";

const endpoint = LoadEnv.of("DYNAMODB_ENDPOINT", z.string().optional()).get();
const region = LoadEnv.of("AWS_REGION", z.string().default("us-west-2")).get();
const tableName = LoadEnv.of(
  "DYNAMODB_TABLE_NAME",
  z.string().default("dev-urlshortner-data-table"),
).get();

const dbConfig = {
  endpoint,
  region,
  tableName,
} as const;

export default dbConfig;
