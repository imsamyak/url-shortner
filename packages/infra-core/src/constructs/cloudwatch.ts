import { CfnOutput, type Stack } from "aws-cdk-lib";
import { Dashboard, type DashboardProps } from "aws-cdk-lib/aws-cloudwatch";

export interface DashboardConfig {
  readonly namespace: string;
  readonly props: DashboardProps;
}

/** Builds one CloudWatch dashboard and exports its identifiers. */
export function buildDashboard(
  stack: Stack,
  id: string,
  config: DashboardConfig,
): Dashboard {
  const { namespace, props } = config;
  const dashboard = new Dashboard(stack, id, props);

  new CfnOutput(stack, `${id}-name`, {
    value: dashboard.dashboardName,
    description: `${namespace} CloudWatch dashboard name`,
  });

  return dashboard;
}
