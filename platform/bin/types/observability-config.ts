import type { DashboardProps } from "aws-cdk-lib/aws-cloudwatch";
import type { LogGroupProps } from "aws-cdk-lib/aws-logs";
import type { TopicProps } from "aws-cdk-lib/aws-sns";

export interface ObservabilityStackConfig {
    readonly dashboard: DashboardProps;
    readonly applicationLogs: LogGroupProps;
    readonly alarmTopic: TopicProps;
}

export default ObservabilityStackConfig;