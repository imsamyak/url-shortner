const {
  AWS_REGION = "local",
  AWS_ACCESS_KEY_ID = "dummy",
  AWS_SECRET_ACCESS_KEY = "dummy",
  CLOUDWATCH_ENABLED = "false",
  CLOUDWATCH_LOG_GROUP = "/aws/app/logs",
  CLOUDWATCH_LOG_STREAM = "app-stream",
} = process.env;

export default {
  enabled: CLOUDWATCH_ENABLED === "true",
  region: AWS_REGION,
  logGroupName: CLOUDWATCH_LOG_GROUP,
  logStreamName: CLOUDWATCH_LOG_STREAM,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
} as const;
