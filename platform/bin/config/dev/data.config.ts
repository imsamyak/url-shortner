import { RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  TableEncryption
} from "aws-cdk-lib/aws-dynamodb";
import DataConfig from "../../types/data-config.js";


/** Builds the shared single-table DynamoDB configuration. */
export function getDataConfig(namespace: string): DataConfig {
  return {
    table: {
      tableName: `${namespace}-table`,
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: "ttl",
      deletionProtection: true,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: RemovalPolicy.RETAIN,
    },
    gsis: [
      {
        indexName: "GSI1",
        partitionKey: {
          name: "gsi1pk",
          type: AttributeType.STRING,
        },
        sortKey: {
          name: "gsi1sk",
          type: AttributeType.STRING,
        },
      },
    ],
    lsis: [],
  };
}

export default getDataConfig;
