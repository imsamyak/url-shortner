import { QueryCommandOutput } from "@aws-sdk/client-dynamodb";

export const toPaginated = <T>(output: QueryCommandOutput) => {
  const items = (output.Items ?? []) as T[];
  const cursor = output.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(output.LastEvaluatedKey)).toString("base64")
    : undefined;
  return { items, cursor };
};

export const parseCursor = (cursor?: string | null) => {
  if (!cursor) return undefined;
  return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
};
