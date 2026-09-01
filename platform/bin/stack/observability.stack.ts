import { Stack, type StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";

import {
  buildDashboard,
  buildLogGroup,
  buildSnsTopic,
} from "@app/infra-core/constructs.js";

import type ObservabilityStackConfig from "../types/observability-config.js";
import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";

export interface ObservabilityStackProps extends StackProps {
  readonly namespace: string;
  readonly config: ObservabilityStackConfig;
}

/** Owns monitoring resources shared by every application service. */
export class ObservabilityStack extends Stack {
  public static build(scope: Construct, ctx: StackContext, props?: StackProps) {
    const config = loadConfig(ctx.env, "observability", ctx.namespace);

    return new ObservabilityStack(scope, ctx.id, {
      ...props,
      namespace: ctx.namespace,
      config,
    });
  }

  public constructor(
    scope: Construct,
    id: string,
    props: ObservabilityStackProps,
  ) {
    const { namespace, config, ...stackProps } = props;

    super(scope, id, {
      ...stackProps,
      stackName: namespace,
      description: "Shared observability infrastructure for all services",
    });

    buildDashboard(this, "dashboard", {
      namespace,
      props: config.dashboard,
    });

    buildLogGroup(this, "application-logs", {
      namespace,
      props: config.applicationLogs,
    });

    buildSnsTopic(this, "alarms", {
      namespace,
      props: config.alarmTopic,
    });
  }
}
