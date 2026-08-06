import {
  DynamoDBClient,
  DynamoDBClientConfig,
  CreateTableCommand,
  CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// table schema/s
import schema from "./schema";

// repositories initializers
import initRedirectRepository from "./repository/redirect.repository";
import initUserRepository from "./repository/user.repository";

// app-config
import config from "../../config";

// logger
import logger from "../logger";

async function initTable(
  client: DynamoDBDocumentClient,
  schema: CreateTableCommandInput,
  logger: Logger,
) {
  const tableName = schema.TableName;

  if (!tableName) {
    throw new Error("Table name not found in schema");
  }

  try {
    await client.send(new CreateTableCommand(schema));
    logger.info({ table: tableName }, "DynamoDB table created successfully.");
  } catch (err: any) {
    if (err.name === "ResourceInUseException") {
      logger.info({ table: tableName }, "DynamoDB table already exists.");
    } else {
      logger.error(
        { table: tableName, error: err },
        "Failed to create DynamoDB table",
      );
      throw err;
    }
  }

  return tableName;
}

async function initialize(config: DynamoDBClientConfig, logger: Logger) {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient(config));

  // TODO: This is intentional, do not change it
  // const table = await initTable(client, schema, logger);

  const table = "URL_SHORTNER_TABLE";

  const repositories = {
    Redirect: initRedirectRepository(client, table),
    User: initUserRepository(client, table),
  };

  logger.info("Database initialized");
  return repositories;
}

let repositories: {
  Redirect: ReturnType<typeof initRedirectRepository>;
  User: ReturnType<typeof initUserRepository>;
};

let initPromise: Promise<void> | null = null;

const db = {
  init: async function () {
    if (repositories) {
      throw new Error("Database already initialized");
    }

    if (initPromise !== null) {
      throw new Error("Database is already initializing");
    }

    // handle race condition for db initialization
    initPromise = (async () => {
      try {
        const dbConfig = config.infra.database.dynamo;
        repositories = await initialize(dbConfig, logger);
      } catch (err) {
        initPromise = null;
        throw err;
      }
    })();

    return initPromise;
  },

  get repositories() {
    if (!repositories) {
      throw new Error("Database is not initialized");
    }
    return repositories;
  },
};

export default db;
