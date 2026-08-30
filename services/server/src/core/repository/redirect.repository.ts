import {
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  DeleteCommand,
  GetCommandInput,
  DynamoDBDocumentClient
} from "@aws-sdk/lib-dynamodb";
import { decodeCursor } from "@app/utils/cursor";
import { toPaginated } from "@app/utils/pagination";
import {
  ForbiddenError,
  ResourceAlreadyExistsError,
  ValidationError,
} from "@app/error";

import { Redirect } from "../../domain/entity/redirect.entity";
import { RedirectItem } from "./model/redirect.model";
import client from "../../infra/db";
import logger from "../../infra/logger";
import config from "../../config";

function toTtlEpochSeconds(expiresAt?: string): number | undefined {
  if (!expiresAt) {
    return undefined;
  }

  const expiresAtMilliseconds = Date.parse(expiresAt);
  if (Number.isNaN(expiresAtMilliseconds)) {
    throw new ValidationError({
      resource: "Redirect",
      issue: "expiresAt must be a valid UTC date string"
    });
  }

  return Math.floor(expiresAtMilliseconds / 1_000);
}

class RedirectRepository {
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(config: {
    client: DynamoDBDocumentClient,
    tableName: string,
  }) {
    this.client = config.client;
    this.tableName = config.tableName;
  }
  async put(
    redirect: Omit<Redirect, "createdAt">,
    author: string,
  ): Promise<Redirect> {
    logger.debug(
      { redirect, author },
      "Redirect Repository: Putting redirect record",
    );

    const now = new Date().toISOString();
    const ttl = toTtlEpochSeconds(redirect.expiresAt);
    const item: RedirectItem = {
      pk: `REDIRECT#${redirect.id}`,
      sk: `META`,
      gsi1pk: `AUTHOR#${author}`,
      gsi1sk: `DATE#${now}`,
      ...redirect,
      author,
      createdAt: now,
    };

    const params = {
      TableName: this.tableName,
      Item: {
        ...item,
        ...(ttl === undefined ? {} : { ttl }),
      },
      ConditionExpression: "attribute_not_exists(pk)",
    };

    try {
      await this.client.send(new PutCommand(params));
    } catch (err: any) {
      if (err.name === "ConditionalCheckFailedException") {
        throw new ResourceAlreadyExistsError({
          resource: "URL",
          id: redirect.id
        });
      }

      throw err;
    }

    return {
      ...redirect,
      createdAt: item.createdAt,
    };
  }

  async get(redirectId: string): Promise<Redirect | null> {
    logger.debug(
      { redirectId },
      "Redirect Repository: Fetching redirect record",
    );

    const identifier: Pick<RedirectItem, "pk" | "sk"> = {
      pk: `REDIRECT#${redirectId}`,
      sk: "META",
    };

    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: identifier,
    };

    const data = await this.client.send(new GetCommand(params));

    if (data.Item) {
      return data.Item as Redirect;
    }

    return null;
  }

  async getByAuthor(
    author: string,
    options?: {
      cursor?: string;
      limit?: number;
      sort?: "asc" | "desc";
    },
  ): Promise<{ items: Redirect[]; cursor?: string }> {
    logger.debug(
      { author, options },
      "Redirect Repository: Query redirect records",
    );
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: "GSI1",
      KeyConditionExpression: "gsi1pk = :gsi1pk",
      ExpressionAttributeValues: {
        ":gsi1pk": `AUTHOR#${author}`,
      },
      ScanIndexForward: options?.sort !== "desc",
      Limit: options?.limit,
      ExclusiveStartKey: decodeCursor(options?.cursor),
    };

    const data = await this.client.send(new QueryCommand(params));

    return toPaginated<Redirect>(data);
  }

  async delete(redirectId: string, author: string): Promise<void> {
    logger.debug(
      { redirectId, author },
      "Redirect Repository: Deleting redirect record",
    );

    const identifier: Pick<RedirectItem, "pk" | "sk"> = {
      pk: `REDIRECT#${redirectId}`,
      sk: `META`,
    };

    const params = {
      TableName: this.tableName,
      Key: identifier,
      ConditionExpression: "author = :author",
      ExpressionAttributeValues: {
        ":author": author,
      },
    };

    try {
      await this.client.send(new DeleteCommand(params));
    } catch (err: any) {
      if (err.name === "ConditionalCheckFailedException") {
        throw new ForbiddenError({
          message: "You are not authorized to delete this redirect"
        });
      }

      throw err;
    }
  }
}

export default new RedirectRepository({
  client,
  tableName: config.db.tableName,
});
