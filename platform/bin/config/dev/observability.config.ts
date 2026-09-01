import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { PeriodOverride } from "aws-cdk-lib/aws-cloudwatch";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import ObservabilityConfig from "../../types/observability-config.js";


/** Builds shared monitoring configuration for the complete environment. */
export function getObservabilityConfig(
  namespace: string,
): ObservabilityConfig {
  return {
    dashboard: {
      dashboardName: `${namespace}-dashboard`,
      defaultInterval: Duration.hours(6),
      periodOverride: PeriodOverride.AUTO,
    },
    applicationLogs: {
      logGroupName: `/url-shortner/${namespace.toLowerCase()}/application`,
      retention: RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.RETAIN,
    },
    alarmTopic: {
      topicName: `${namespace}-alarms`,
      displayName: "UrlShortner environment alarms",
      enforceSSL: true,
    },
  };
}

export default getObservabilityConfig;