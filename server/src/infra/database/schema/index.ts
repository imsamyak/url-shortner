const schema = {
  TableName: "URL_SHORTNER_TABLE",
  KeySchema: [
    { AttributeName: "pk", KeyType: "HASH" } as const,
    { AttributeName: "sk", KeyType: "RANGE" } as const,
  ],
  AttributeDefinitions: [
    { AttributeName: "pk", AttributeType: "S" } as const,
    { AttributeName: "sk", AttributeType: "S" } as const,
    { AttributeName: "gsi1pk", AttributeType: "S" } as const,
    { AttributeName: "gsi1sk", AttributeType: "S" } as const,
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "GSI1",
      KeySchema: [
        { AttributeName: "gsi1pk", KeyType: "HASH" } as const,
        { AttributeName: "gsi1sk", KeyType: "RANGE" } as const,
      ],
      Projection: {
        ProjectionType: "ALL",
      } as const,
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

export default schema;
