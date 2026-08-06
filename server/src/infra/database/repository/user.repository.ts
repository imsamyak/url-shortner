import { ReturnValue } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import { User } from "../../../domain/entity/user.entity";
import {
  ResourceAlreadyExistsException,
  BadRequestException,
} from "../../../domain/exception";
import { UserItem, UserTrackerItem } from "../model/user.model";

export interface UserRepository {
  create(user: Omit<User, "createdAt">): Promise<User>;
  update(
    id: string,
    updates: Partial<Omit<User, "email" | "id">>,
  ): Promise<User>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
}

export default function initUserRepository(
  client: DynamoDBDocumentClient,
  TableName: string,
) {
  return class UserRepositoryImpl implements UserRepository {
    constructor(protected readonly logger: Logger) {}

    async create(user: User) {
      this.logger.debug(
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
              TableName,
              Item: userItem,
              ConditionExpression: "attribute_not_exists(pk)",
            },
          },
          {
            Put: {
              TableName: TableName,
              Item: trackerItem,
              ConditionExpression: "attribute_not_exists(pk)",
            },
          },
        ],
      };

      try {
        await client.send(new TransactWriteCommand(params));
      } catch (err: any) {
        if (
          err.name === "TransactionCanceledException" ||
          err.name === "ConditionalCheckFailedException"
        ) {
          throw new ResourceAlreadyExistsException(
            "User with this email already exists",
            err,
          );
        }
        throw err;
      }

      this.logger.debug({ record: userItem }, "User created successfully");
      return user;
    }

    async update(userId: string, updates: Partial<Omit<User, "email" | "id">>) {
      this.logger.debug(
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
        throw new BadRequestException("No update values provided");
      }

      const params = {
        TableName,
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

      const res = await client.send(new UpdateCommand(params));

      if (res.Attributes) {
        const user = res.Attributes as User;
        this.logger.debug(
          { userId: user.id },
          "User Repository: User updated successfully",
        );
        return user;
      }

      this.logger.error({ userId: userId }, "User Repository: User not found");
      throw new BadRequestException("User not found");
    }

    async getById(userId: string) {
      this.logger.debug(
        { userId },
        "User Repository: Getting user record by ID",
      );
      const params = {
        TableName,
        Key: {
          pk: `USER#${userId}`,
          sk: `META`,
        },
      };

      const data = await client.send(new GetCommand(params));

      if (data.Item) {
        const user = data.Item as User;
        this.logger.debug(
          { userId: user.id },
          "User Repository: User found by ID",
        );
        return user;
      }

      this.logger.debug({ userId }, "User Repository: User not found by ID");

      return null;
    }

    async getByEmail(email: string) {
      this.logger.debug(
        { email },
        "User Repository: Getting user record by email",
      );
      const params = {
        TableName,
        IndexName: "GSI1",
        KeyConditionExpression: "gsi1pk = :pk",
        ExpressionAttributeValues: {
          ":pk": `EMAIL#${email}`,
        },
      };

      const data = await client.send(new QueryCommand(params));

      if (data.Items?.[0]) {
        const user = data.Items[0] as any as User;
        this.logger.debug(
          { userId: user.id },
          "User Repository: User found by email",
        );
        return user;
      }

      this.logger.debug({ email }, "User Repository: User not found by email");
      return null;
    }
  };
}
