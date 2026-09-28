import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { IAMClient, CreateRoleCommand, PutRolePolicyCommand } from "@aws-sdk/client-iam";
import { LambdaClient, CreateFunctionCommand, AddPermissionCommand } from "@aws-sdk/client-lambda";
import { ApiGatewayV2Client, CreateApiCommand, CreateIntegrationCommand, CreateRouteCommand, CreateDeploymentCommand, CreateStageCommand } from "@aws-sdk/client-apigatewayv2";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize AWS Clients
const region = process.env.AWS_REGION || "ap-south-1";
const credentials = {
    accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
};

const ddb = new DynamoDBClient({ region, credentials });
const iam = new IAMClient({ region, credentials });
const lambda = new LambdaClient({ region, credentials });
const apigw = new ApiGatewayV2Client({ region, credentials });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("🚀 Starting AWS API Gateway WebSocket Deployment...");

    // 1. Create DynamoDB Table
    const tableName = "Eventio-Connections";
    console.log(`\n📦 1. Checking DynamoDB Table: ${tableName}`);
    try {
        await ddb.send(new DescribeTableCommand({ TableName: tableName }));
        console.log(`✅ Table ${tableName} already exists.`);
    } catch (e) {
        if (e.name === 'ResourceNotFoundException') {
            console.log(`Creating table ${tableName}...`);
            await ddb.send(new CreateTableCommand({
                TableName: tableName,
                BillingMode: "PAY_PER_REQUEST",
                AttributeDefinitions: [
                    { AttributeName: "connectionId", AttributeType: "S" },
                    { AttributeName: "eventId", AttributeType: "S" }
                ],
                KeySchema: [
                    { AttributeName: "connectionId", KeyType: "HASH" }
                ],
                GlobalSecondaryIndexes: [
                    {
                        IndexName: "eventId-index",
                        KeySchema: [{ AttributeName: "eventId", KeyType: "HASH" }],
                        Projection: { ProjectionType: "ALL" }
                    }
                ]
            }));
            console.log(`✅ Table ${tableName} created.`);
            // Wait for table to be active
            await sleep(5000);
        } else {
            throw e;
        }
    }

    // 2. Create IAM Role for Lambda
    const roleName = "EventioWebSocketLambdaRole";
    console.log(`\n🔑 2. Checking IAM Role: ${roleName}`);
    let roleArn;
    try {
        const role = await iam.send(new CreateRoleCommand({
            RoleName: roleName,
            AssumeRolePolicyDocument: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{ Effect: "Allow", Principal: { Service: "lambda.amazonaws.com" }, Action: "sts:AssumeRole" }]
            })
        }));
        roleArn = role.Role.Arn;
        
        await iam.send(new PutRolePolicyCommand({
            RoleName: roleName,
            PolicyName: "EventioWSPolicy",
            PolicyDocument: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    { Effect: "Allow", Action: ["dynamodb:*"], Resource: "*" },
                    { Effect: "Allow", Action: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"], Resource: "*" }
                ]
            })
        }));
        console.log(`✅ IAM Role created. Waiting for role to propagate (10s)...`);
        await sleep(10000);
    } catch (e) {
        if (e.name === 'EntityAlreadyExistsException') {
            console.log(`✅ IAM Role ${roleName} already exists.`);
            // Quick hack to get ARN if it exists
            const accountId = credentials.accessKeyId ? "YOUR_ACCOUNT" : ""; // Not strictly needed to parse, but let's assume we can get it from another command or just hardcode if needed
            // It's safer to just fetch it, but to keep script simple we will proceed.
            // Wait, we need the ARN for the Lambda creation! Let's get caller identity.
            const { STSClient, GetCallerIdentityCommand } = await import("@aws-sdk/client-sts");
            const sts = new STSClient({ region, credentials });
            const { Account } = await sts.send(new GetCallerIdentityCommand({}));
            roleArn = `arn:aws:iam::${Account}:role/${roleName}`;
        } else {
            throw e;
        }
    }

    // 3. Create Lambda Function ZIP
    console.log(`\n📦 3. Packaging Lambda function...`);
    const lambdaCode = `
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient({});
const TableName = "Eventio-Connections";

export const handler = async (event) => {
    const { eventType, connectionId } = event.requestContext;
    
    if (eventType === "CONNECT") {
        const eventId = event.queryStringParameters?.eventId;
        if (!eventId) return { statusCode: 400, body: "Missing eventId" };
        
        await ddb.send(new PutCommand({
            TableName,
            Item: { connectionId, eventId, connectedAt: Date.now() }
        }));
        return { statusCode: 200, body: "Connected." };
    } 
    else if (eventType === "DISCONNECT") {
        await ddb.send(new DeleteCommand({
            TableName,
            Key: { connectionId }
        }));
        return { statusCode: 200, body: "Disconnected." };
    }
    
    return { statusCode: 200, body: "OK" };
};
`;
    // We need to zip it. JSZip or adm-zip? We can just use child_process on Windows/Linux or a simple archiver.
    // Instead of zip, wait, AWS SDK requires a ZIP buffer.
    const { execSync } = await import('child_process');
    fs.writeFileSync('index.mjs', lambdaCode);
    
    console.log("Zipping using PowerShell...");
    execSync('powershell -command "Compress-Archive -Path index.mjs -DestinationPath lambda.zip -Force"');
    const zipBuffer = fs.readFileSync('lambda.zip');

    // 4. Create Lambda Function
    const funcName = "EventioWebSocketHandler";
    console.log(`\n⚡ 4. Deploying Lambda Function: ${funcName}`);
    let functionArn;
    try {
        const func = await lambda.send(new CreateFunctionCommand({
            FunctionName: funcName,
            Runtime: "nodejs20.x",
            Role: roleArn,
            Handler: "index.handler",
            Code: { ZipFile: zipBuffer }
        }));
        functionArn = func.FunctionArn;
        console.log(`✅ Lambda created.`);
    } catch (e) {
        if (e.name === 'ResourceConflictException') {
            console.log(`✅ Lambda already exists. Updating code...`);
            const { UpdateFunctionCodeCommand, GetFunctionCommand } = await import("@aws-sdk/client-lambda");
            await lambda.send(new UpdateFunctionCodeCommand({
                FunctionName: funcName,
                ZipFile: zipBuffer
            }));
            const func = await lambda.send(new GetFunctionCommand({ FunctionName: funcName }));
            functionArn = func.Configuration.FunctionArn;
        } else {
            throw e;
        }
    }

    // 5. Create API Gateway WebSocket
    console.log(`\n🌐 5. Creating API Gateway WebSocket...`);
    const api = await apigw.send(new CreateApiCommand({
        Name: "Eventio-WebSockets",
        ProtocolType: "WEBSOCKET",
        RouteSelectionExpression: "$request.body.action"
    }));
    const apiId = api.ApiId;

    const integration = await apigw.send(new CreateIntegrationCommand({
        ApiId: apiId,
        IntegrationType: "AWS_PROXY",
        IntegrationUri: "arn:aws:apigateway:" + region + ":lambda:path/2015-03-31/functions/" + functionArn + "/invocations"
    }));

    // Grant API Gateway permission to invoke Lambda
    try {
        await lambda.send(new AddPermissionCommand({
            FunctionName: funcName,
            StatementId: "apigw-invoke",
            Action: "lambda:InvokeFunction",
            Principal: "apigateway.amazonaws.com",
            SourceArn: "arn:aws:execute-api:" + region + ":*:" + apiId + "/*/*"
        }));
    } catch(e) { /* Ignore if exists */ }

    // Routes
    await apigw.send(new CreateRouteCommand({ ApiId: apiId, RouteKey: "$connect", Target: "integrations/" + integration.IntegrationId }));
    await apigw.send(new CreateRouteCommand({ ApiId: apiId, RouteKey: "$disconnect", Target: "integrations/" + integration.IntegrationId }));
    await apigw.send(new CreateRouteCommand({ ApiId: apiId, RouteKey: "$default", Target: "integrations/" + integration.IntegrationId }));

    // Deploy
    await apigw.send(new CreateStageCommand({ ApiId: apiId, StageName: "production", AutoDeploy: true }));

    console.log(`\n🎉 WebSockets Deployed Successfully!`);
    console.log(`\n-------------------------------------------------`);
    console.log(`👉 ADD THESE TO YOUR .env.local FILE:`);
    console.log(`NEXT_PUBLIC_AWS_WSS_URL=wss://${apiId}.execute-api.${region}.amazonaws.com/production`);
    console.log(`EVENTIO_AWS_WSS_CONNECTION_URL=https://${apiId}.execute-api.${region}.amazonaws.com/production`);
    console.log(`-------------------------------------------------\n`);

    // Cleanup
    fs.unlinkSync('index.mjs');
    fs.unlinkSync('lambda.zip');
}

main().catch(console.error);
