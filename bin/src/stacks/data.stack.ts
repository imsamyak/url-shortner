import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DataStackProps extends StackProps {
  realm: string;
  environment: string;
  service: string;
  name: string;
  region?: string;
  [key: string]: any;
}

export class DataStack extends Stack {
  public readonly urlShortnerTable: Table;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    this.urlShortnerTable = new Table(this, 'UrlShortnerTable', {
      tableName: 'URL_SHORTNER_TABLE',
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.urlShortnerTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'gsi1pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'gsi1sk',
        type: AttributeType.STRING,
      },
      readCapacity: 5,
      writeCapacity: 5,
    });

    new CfnOutput(this, 'DataStackName', {
      value: id,
    });

    new CfnOutput(this, 'UrlShortnerTableName', {
      value: this.urlShortnerTable.tableName,
    });
  }
}

export default DataStack;
