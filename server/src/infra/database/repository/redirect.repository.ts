import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  DeleteCommand,
  GetCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { parseCursor, toPaginated } from "../utils";
import {
  ForbiddenException,
  ResourceAlreadyExistsException,
} from "../../../domain/exception";

import { Redirect } from "../../../domain/entity/redirect.entity";
import { RedirectItem } from "../model/redirect.model";

export interface RedirectRepository {
  put(redirect: Omit<Redirect, "createdAt">, author: string): Promise<Redirect>;

  get(redirectId: string): Promise<Redirect | null>;

  getByAuthor(
    author: string,
    options?: { cursor?: string; limit?: number; sort?: "asc" | "desc" },
  ): Promise<{ items: Redirect[]; cursor?: string }>;

  delete(redirectId: string, author: string): Promise<void>;
}

export default function initRedirectRepository(
  client: DynamoDBDocumentClient,
  TableName: string,
) {
  return class RedirectRepositoryImpl implements RedirectRepository {
    constructor(protected readonly logger: Logger) {}

    async put(
      redirect: Omit<Redirect, "createdAt">,
      author: string,
    ): Promise<Redirect> {
      this.logger.debug(
        { redirect, author },
        "Redirect Repository: Putting redirect record",
      );

      const now = new Date().toISOString();
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
        TableName,
        Item: item,
        ConditionExpression: "attribute_not_exists(pk)",
      };

      try {
        await client.send(new PutCommand(params));
      } catch (err: any) {
        if (err.name === "ConditionalCheckFailedException") {
          throw new ResourceAlreadyExistsException(`URL: ${redirect.id}`);
        }

        throw err;
      }

      return {
        ...redirect,
        createdAt: item.createdAt,
      };
    }

    async get(redirectId: string) {
      this.logger.debug(
        { redirectId },
        "Redirect Repository: Fetching redirect record",
      );

      const identifier: Pick<RedirectItem, "pk" | "sk"> = {
        pk: `REDIRECT#${redirectId}`,
        sk: "META",
      };

      const params: GetCommandInput = {
        TableName,
        Key: identifier,
      };

      const data = await client.send(new GetCommand(params));

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
    ) {
      this.logger.debug(
        { author, options },
        "Redirect Repository: Query redirect records",
      );
      const params: QueryCommandInput = {
        TableName,
        IndexName: "GSI1",
        KeyConditionExpression: "gsi1pk = :gsi1pk",
        ExpressionAttributeValues: {
          ":gsi1pk": `AUTHOR#${author}`,
        },
        ScanIndexForward: options?.sort !== "desc",
        Limit: options?.limit,
        ExclusiveStartKey: parseCursor(options?.cursor),
      };

      const data = await client.send(new QueryCommand(params));

      return toPaginated<Redirect>(data);
    }

    async delete(redirectId: string, author: string) {
      this.logger.debug(
        { redirectId, author },
        "Redirect Repository: Deleting redirect record",
      );

      const identifier: Pick<RedirectItem, "pk" | "sk"> = {
        pk: `REDIRECT#${redirectId}`,
        sk: `META`,
      };

      const params = {
        TableName,
        Key: identifier,
        ConditionExpression: "author = :author",
        ExpressionAttributeValues: {
          ":author": author,
        },
      };

      try {
        await client.send(new DeleteCommand(params));
      } catch (err: any) {
        if (err.name === "ConditionalCheckFailedException") {
          throw new ForbiddenException(
            "You are not authorized to delete this redirect",
          );
        }

        throw err;
      }
    }
  };
}
