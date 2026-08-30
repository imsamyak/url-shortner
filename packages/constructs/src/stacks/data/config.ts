import type {
  Attribute,
  AttributeType,
  GlobalSecondaryIndexProps,
  LocalSecondaryIndexProps,
  TableProps,
} from "aws-cdk-lib/aws-dynamodb";

/** A DynamoDB key whose type defaults to STRING when omitted. */
export type DataKey = Omit<Attribute, "type"> & {
  readonly name: string;
  readonly type?: AttributeType;
};

export type DataTableProps = Omit<
  TableProps,
  "partitionKey" | "sortKey"
> & {
  readonly partitionKey: DataKey;
  readonly sortKey?: DataKey;
};

export type DataGsiProps = Omit<
  GlobalSecondaryIndexProps,
  "partitionKey" | "sortKey"
> & {
  readonly partitionKey: DataKey;
  readonly sortKey?: DataKey;
};

export type DataLsiProps = Omit<LocalSecondaryIndexProps, "sortKey"> & {
  readonly sortKey: DataKey;
};

/** One stable CDK construct identifier and its CDK-aligned resource props. */
export interface DataTableConfig {
  readonly id: string;
  readonly table: DataTableProps;
  readonly gsis?: readonly DataGsiProps[];
  readonly lsis?: readonly DataLsiProps[];
}

/** Every DynamoDB table owned by a single service data stack. */
export type DataStackConfig = readonly DataTableConfig[];
