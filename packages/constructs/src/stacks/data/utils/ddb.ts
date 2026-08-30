import { CfnOutput } from "aws-cdk-lib";
import {
  AttributeType,
  Table,
  type Attribute,
} from "aws-cdk-lib/aws-dynamodb";
import type { Construct } from "constructs";

import type { DataKey, DataStackConfig } from "../config.js";

function resolveKey(key: DataKey): Attribute {
  return {
    ...key,
    type: key.type ?? AttributeType.STRING,
  };
}

export function buildDynamoDbTables(
  scope: Construct,
  namespace: string,
  config: DataStackConfig,
): Readonly<Record<string, Table>> {
  const tables: Record<string, Table> = {};

  config.forEach(({ id, table: tableConfig, gsis = [], lsis = [] }) => {
    if (tables[id]) {
      throw new Error(`Duplicate DynamoDB table id: ${id}`);
    }

    const { partitionKey, sortKey, ...tableProps } = tableConfig;
    const table = new Table(scope, `ddb-${id}`, {
      ...tableProps,
      partitionKey: resolveKey(partitionKey),
      ...(sortKey ? { sortKey: resolveKey(sortKey) } : {}),
    });

    gsis.forEach(({ partitionKey: pk, sortKey: sk, ...gsiProps }, index) => {
      table.addGlobalSecondaryIndex({
        ...gsiProps,
        partitionKey: resolveKey(pk),
        ...(sk ? { sortKey: resolveKey(sk) } : {}),
      });

      new CfnOutput(scope, `${id}-gsi-${index + 1}-name`, {
        value: gsiProps.indexName,
        exportName: `${namespace}-${id}-gsi-${index + 1}-name`,
      });
    });

    lsis.forEach(({ sortKey: sk, ...lsiProps }, index) => {
      table.addLocalSecondaryIndex({
        ...lsiProps,
        sortKey: resolveKey(sk),
      });

      new CfnOutput(scope, `${id}-lsi-${index + 1}-name`, {
        value: lsiProps.indexName,
        exportName: `${namespace}-${id}-lsi-${index + 1}-name`,
      });
    });

    new CfnOutput(scope, `${id}-table-name`, {
      value: table.tableName,
      exportName: `${namespace}-${id}-ddb-table-name`,
    });

    new CfnOutput(scope, `${id}-table-arn`, {
      value: table.tableArn,
      exportName: `${namespace}-${id}-ddb-table-arn`,
    });

    tables[id] = table;
  });

  return tables;
}
