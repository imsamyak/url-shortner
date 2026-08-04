const {
  DB_DYNAMO_ENDPOINT,
  AWS_REGION = "local",
  AWS_ACCESS_KEY_ID = "dummy",
  AWS_SECRET_ACCESS_KEY = "dummy",
} = process.env;

export default {
  dynamo: {
    endpoint: DB_DYNAMO_ENDPOINT,
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  },
} as const;
