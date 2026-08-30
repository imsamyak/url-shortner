import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ConfigurationError } from "@app/error";
import config from "../../config";

interface DbConfig {
  endpoint?: string;
  region?: string;
}

const initDbClient = (dbConfig: DbConfig) => {
  try {
    const { endpoint, region } = dbConfig;

    const ddbClient = new DynamoDBClient({
      ...(endpoint ? { endpoint } : {}),
      region,
    });

    return DynamoDBDocumentClient.from(ddbClient);
  } catch (err: any) {
    throw new ConfigurationError({
      message: "DB client initialization failure",
      options: {
        cause: err
      }
    });
  }
};

const client = initDbClient(config.db);
export default client;
