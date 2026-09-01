import { CfnOutput, Fn, type Stack } from "aws-cdk-lib";
import {
  Table,
  type GlobalSecondaryIndexProps,
  type ITable,
  type LocalSecondaryIndexProps,
  type TableProps,
} from "aws-cdk-lib/aws-dynamodb";

export interface DynamoDbTableConfig {
  readonly namespace: string;
  readonly props: TableProps;
  readonly gsis?: readonly GlobalSecondaryIndexProps[];
  readonly lsis?: readonly LocalSecondaryIndexProps[];
}

/** Builds one DynamoDB table and exports the identifiers needed by consumers. */
export function buildDynamoDbTable(
  stack: Stack,
  id: string,
  config: DynamoDbTableConfig,
): Table {
  const { namespace, props, gsis = [], lsis = [] } = config;

  const table = new Table(stack, id, props);

  gsis.forEach((index) => {
    table.addGlobalSecondaryIndex(index);
  });

  lsis.forEach((index) => {
    table.addLocalSecondaryIndex(index);
  });

  new CfnOutput(stack, `${id}-name`, {
    value: table.tableName,
    exportName: `${namespace}-table-name`,
  });

  new CfnOutput(stack, `${id}-arn`, {
    value: table.tableArn,
    exportName: `${namespace}-table-arn`,
  });

  return table;
}

/** Imports a DynamoDB table from another CloudFormation stack's exports. */
export function getDynamoDbTable(
  stack: Stack,
  id: string,
  namespace: string,
): ITable {
  return Table.fromTableAttributes(stack, id, {
    tableArn: Fn.importValue(`${namespace}-table-arn`),
  });
}
