import { ReturnValue } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  UpdateCommand,
  QueryCommand,
  TransactWriteCommand,
  DynamoDBDocumentClient
} from "@aws-sdk/lib-dynamodb";

import { User } from "../../domain/entity/user.entity";
import {
  ResourceAlreadyExistsError,
  ValidationError,
  ResourceNotFoundError,
} from "@app/error";
import { UserItem, UserTrackerItem } from "./model/user.model";
import client from "../../infra/db";
import logger from "../../infra/logger";
import config from "../../config";

class UserRepository {
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(config: {
    client: DynamoDBDocumentClient,
    tableName: string,
  }) {
    this.client = config.client;
    this.tableName = config.tableName;
  }
  async create(user: User): Promise<User> {
    logger.debug(
      { userId: user.id },
      "User Repository: Putting user record",
    );

    const userItem: UserItem = {
      pk: `USER#${user.id}`,
      sk: `META`,
      gsi1pk: `EMAIL#${user.email}`,
      gsi1sk: `META`,
      ...user,
      createdAt: new Date().toISOString(),
    };

    const trackerItem: UserTrackerItem = {
      pk: `EMAIL#${user.email}`,
      sk: `TRACKER`,
      userId: user.id,
    };

    const params = {
      TransactItems: [
        {
          Put: {
            TableName: this.tableName,
            Item: userItem,
            ConditionExpression: "attribute_not_exists(pk)",
          },
        },
        {
          Put: {
            TableName: this.tableName,
            Item: trackerItem,
            ConditionExpression: "attribute_not_exists(pk)",
          },
        },
      ],
    };

    try {
      await this.client.send(new TransactWriteCommand(params));
    } catch (err: any) {
      if (
        err.name === "TransactionCanceledException" ||
        err.name === "ConditionalCheckFailedException"
      ) {
        throw new ResourceAlreadyExistsError({
          resource: "User",
          id: user.email,
          options: { cause: err },
        });
      }
      throw err;
    }

    logger.debug({ record: userItem }, "User created successfully");
    return user;
  }

  async update(userId: string, updates: Partial<Omit<User, "email" | "id">>): Promise<User> {
    logger.debug(
      { userId },
      "User Repository: Updating user record in UserStore",
    );

    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    }

    if (updateExpression.length === 0) {
      throw new ValidationError({
        resource: "User Update",
        issue: "No update values provided",
      });
    }

    const params = {
      TableName: this.tableName,
      Key: {
        pk: `USER#${userId}`,
        sk: `META`,
      },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: "attribute_exists(pk)",
      ReturnValues: ReturnValue.ALL_NEW,
    };

    const res = await this.client.send(new UpdateCommand(params));

    if (res.Attributes) {
      const user = res.Attributes as User;
      logger.debug(
        { userId: user.id },
        "User Repository: User updated successfully",
      );
      return user;
    }

    logger.error({ userId: userId }, "User Repository: User not found");
    throw new ResourceNotFoundError({
      resource: "User",
      id: userId
    });
  }

  async getById(userId: string): Promise<User | null> {
    logger.debug(
      { userId },
      "User Repository: Getting user record by ID",
    );
    const params = {
      TableName: this.tableName,
      Key: {
        pk: `USER#${userId}`,
        sk: `META`,
      },
    };

    const data = await this.client.send(new GetCommand(params));

    if (data.Item) {
      const user = data.Item as User;
      logger.debug(
        { userId: user.id },
        "User Repository: User found by ID",
      );
      return user;
    }

    logger.debug({ userId }, "User Repository: User not found by ID");

    return null;
  }

  async getByEmail(email: string): Promise<User | null> {
    logger.debug(
      { email },
      "User Repository: Getting user record by email",
    );
    const params = {
      TableName: this.tableName,
      IndexName: "GSI1",
      KeyConditionExpression: "gsi1pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `EMAIL#${email}`,
      },
    };

    const data = await this.client.send(new QueryCommand(params));

    if (data.Items?.[0]) {
      const user = data.Items[0] as any as User;
      logger.debug(
        { userId: user.id },
        "User Repository: User found by email",
      );
      return user;
    }

    logger.debug({ email }, "User Repository: User not found by email");
    return null;
  }
}

export default new UserRepository({
  client,
  tableName: config.db.tableName,
});
