import type { StackContext } from "@app/constructs";
import type { StackProps } from "aws-cdk-lib";

/** Nuxt owns the shared application network and all client-facing stacks. */
export const clientStackContext: StackContext = {
  realm: "global",
  name: "url-shortener-client",
  env: process.env.DEPLOY_ENV ?? "dev",
};

export const clientStackProps: StackProps = {
  awsEnv: {
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
    account: process.env.CDK_DEFAULT_ACCOUNT ?? "123456789012",
  },
};
