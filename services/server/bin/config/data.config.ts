import {
  buildStackNamespace,
  type DataStackConfig,
} from "@app/constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";

import { serverStackContext } from "./stack.config.js";

const namespace = buildStackNamespace(serverStackContext);

/** Server-owned CDK props passed to the reusable DynamoDB stack. */
export const dataConfig: DataStackConfig = [
  {
    id: "url-shortener",
    table: {
      tableName: `${namespace}-url-shortener`,
      partitionKey: { name: "pk" },
      sortKey: { name: "sk" },
      timeToLiveAttribute: "ttl",
      billingMode: BillingMode.PAY_PER_REQUEST,
      deletionProtection: true,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: RemovalPolicy.RETAIN,
    },
    gsis: [
      {
        indexName: "GSI1",
        partitionKey: { name: "gsi1pk" },
        sortKey: { name: "gsi1sk" },
      },
    ],
    lsis: [],
  },
];
