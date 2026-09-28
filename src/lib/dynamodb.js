import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.COGNITO_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY,
  },
});

export const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
