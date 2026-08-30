import { Stack } from "aws-cdk-lib";
import type { Table } from "aws-cdk-lib/aws-dynamodb";
import type { Construct } from "constructs";

import type { StackOptions } from "../../core/index.js";
import type { DataStackConfig } from "./config.js";
import { buildDynamoDbTables } from "./utils/index.js";

export class DataStack extends Stack {
  public readonly tables: Readonly<Record<string, Table>>;

  constructor(
    scope: Construct,
    id: string,
    options: StackOptions<DataStackConfig>,
  ) {
    const { namespace, config, ...stackProps } = options;

    super(scope, id, stackProps);

    this.tables = buildDynamoDbTables(this, namespace, config);
  }
}
