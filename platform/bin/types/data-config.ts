import { GlobalSecondaryIndexProps, LocalSecondaryIndexProps, TableProps } from "aws-cdk-lib/aws-dynamodb";

export interface DataStackConfig {
    readonly table: TableProps;
    readonly gsis: readonly GlobalSecondaryIndexProps[];
    readonly lsis: readonly LocalSecondaryIndexProps[];
}

export default DataStackConfig;