import { Stack, type StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";

import { buildDynamoDbTable } from "@app/infra-core/constructs.js";

import type DataStackConfig from "../types/data-config.js";
import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";

export interface DataStackProps extends StackProps {
  readonly namespace: string;
  readonly config: DataStackConfig;
}

/** Owns the DynamoDB table shared by all application services. */
export class DataStack extends Stack {
  public static build(scope: Construct, ctx: StackContext, props?: StackProps) {
    const config = loadConfig(ctx.env, "data", ctx.namespace);

    return new DataStack(scope, ctx.id, {
      ...props,
      namespace: ctx.namespace,
      config,
    });
  }

  public constructor(
    scope: Construct,
    id: string,
    props: DataStackProps,
  ) {
    const { namespace, config, ...stackProps } = props;

    super(scope, id, {
      ...stackProps,
      stackName: namespace,
      description: "Shared DynamoDB data infrastructure for all services",
    });

    buildDynamoDbTable(this, "table", {
      namespace,
      props: config.table,
      gsis: config.gsis,
      lsis: config.lsis,
    });
  }
}
