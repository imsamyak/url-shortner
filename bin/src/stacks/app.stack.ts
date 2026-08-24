import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface AppStackProps extends StackProps {
  realm: string;
  environment: string;
  service: string;
  name: string;
  region?: string;
  [key: string]: any;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    new CfnOutput(this, 'StackName', {
      value: id
    });

    new CfnOutput(this, 'Environment', {
      value: props.environment
    });
  }
}

export default AppStack;
