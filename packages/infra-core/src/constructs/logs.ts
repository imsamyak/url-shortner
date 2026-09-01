import { CfnOutput, Fn, type Stack } from "aws-cdk-lib";
import {
  LogGroup,
  type ILogGroup,
  type LogGroupProps,
} from "aws-cdk-lib/aws-logs";

export interface LogGroupConfig {
  readonly namespace: string;
  readonly props: LogGroupProps;
}

/** Builds one CloudWatch log group and exports its identifiers. */
export function buildLogGroup(
  stack: Stack,
  id: string,
  config: LogGroupConfig,
): LogGroup {
  const { namespace, props } = config;
  const logGroup = new LogGroup(stack, id, props);

  new CfnOutput(stack, `${id}-name`, {
    value: logGroup.logGroupName,
    exportName: `${namespace}-${id}-log-group-name`,
  });

  new CfnOutput(stack, `${id}-arn`, {
    value: logGroup.logGroupArn,
    exportName: `${namespace}-${id}-log-group-arn`,
  });

  return logGroup;
}

/** Imports a log group from another CloudFormation stack's exports. */
export function getLogGroup(
  stack: Stack,
  id: string,
  namespace: string,
): ILogGroup {
  return LogGroup.fromLogGroupArn(
    stack,
    `imported-${id}`,
    Fn.importValue(`${namespace}-${id}-log-group-arn`),
  );
}
