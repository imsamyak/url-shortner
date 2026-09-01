import { CfnOutput, type Stack } from "aws-cdk-lib";
import { Topic, type TopicProps } from "aws-cdk-lib/aws-sns";

export interface SnsTopicConfig {
  readonly namespace: string;
  readonly props: TopicProps;
}

/** Builds one SNS topic and exports its identifiers. */
export function buildSnsTopic(
  stack: Stack,
  id: string,
  config: SnsTopicConfig,
): Topic {
  const { namespace, props } = config;
  const topic = new Topic(stack, id, props);

  new CfnOutput(stack, `${id}-arn`, {
    value: topic.topicArn,
    description: `${namespace} SNS alarm topic ARN`,
  });

  return topic;
}
