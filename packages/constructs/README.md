# `@app/constructs`

Reusable AWS CDK stack builders. This package owns resource composition, while
each service owns the concrete configuration passed from its `bin/config`
directory.

## Design

- A builder derives the stack namespace from the service context.
- A stack owns and exposes the resources it creates.
- A config mirrors the relevant AWS CDK props instead of inventing a second API.
- Multi-resource configs are arrays. Their required `id` is the CDK construct
  identifier and the key used by the stack's exposed resource map.
- Index files contain named exports only. Internal resource-building utilities
  stay private to their stack.

## Available stacks

| Builder | Config | Exposed resources |
| --- | --- | --- |
| `buildNetworkStack` | `NetworkStackConfig` | `stack.vpcs[id]` |
| `buildRepositoryStack` | `RepositoryStackConfig` | `stack.repositories[id]` |
| `buildDataStack` | `DataStackConfig` | `stack.tables[id]` |
| `buildComputeStack` | `ComputeStackConfig` | `stack.services[id]` |
| `buildCdnStack` | `CdnStackConfig` | `stack.distributions[id]` |
| `buildFirewallStack` | `FirewallStackConfig` | `stack.firewalls[id]` |
| `buildPipelineStack` | `PipelineStackConfig` | Pipeline, build, and deploy resources |

There is deliberately no infrastructure pipeline construct. Infrastructure can
be synthesized, diffed, and deployed through service-owned commands or a future
deployment workflow without coupling that workflow to the reusable constructs.

## Data example

`DataStackConfig` defines all tables owned by one service:

```ts
import type { DataStackConfig } from "@app/constructs";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";

export const dataConfig: DataStackConfig = [
  {
    id: "redirects",
    table: {
      tableName: "example-redirects",
      partitionKey: { name: "pk" },
      sortKey: { name: "sk" },
      timeToLiveAttribute: "ttl",
      billingMode: BillingMode.PAY_PER_REQUEST,
    },
    gsis: [
      {
        indexName: "GSI1",
        partitionKey: { name: "gsi1pk" },
        sortKey: { name: "gsi1sk" },
      },
    ],
  },
];
```

Normal `TableProps`, `GlobalSecondaryIndexProps`, and
`LocalSecondaryIndexProps` remain available. DynamoDB key `name` is required;
key `type` is optional and defaults to `AttributeType.STRING`.
