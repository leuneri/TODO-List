import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';

export class TodoInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DDB table to store the tasks
    const table = new ddb.Table(this, "Tasks", {
      partitionKey: { name: "task_id", type: ddb.AttributeType.STRING }, 
      billingMode: ddb.BillingMode.PAY_PER_REQUEST, // Billing method
      timeToLiveAttribute: "ttl", // delete after a period of time for space
    });

    // Add GSI based on user_id
    table.addGlobalSecondaryIndex({
      indexName: "user-index",
      partitionKey: { name: "user_id", type: ddb.AttributeType.STRING },
      sortKey: { name: "created_time", type: ddb.AttributeType.NUMBER },
    });

    // Create Lambda function for the API -> use handler on table
    const api = new lambda.Function(this, "API", {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset("../api"), // Where function code lives to upload to lambda
      handler: "todo.handler", // todo is file name, handler is function name
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Create a URL so we can access the function on the browser
    const functionUrl = api.addFunctionUrl({ // Reference lambda resource -> api
      authType: lambda.FunctionUrlAuthType.NONE, // No authentication
      cors: { // Cross-Origin Resource Sharing -> allows diff browsers to use API
        allowedOrigins: ["*"],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ["*"],
      },
    })

    // Output the API function url
    new CfnOutput(this, "APIUrl", {
      value: functionUrl.url,
    });

    // Give Lambda permission to read/write to the table
    table.grantReadWriteData(api);
  }
}
