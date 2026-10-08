import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { dynamoDb } from "./dynamodb";
import { QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE_NAME || "Eventio-Connections";
const ENDPOINT = process.env.EVENTIO_AWS_WSS_CONNECTION_URL;

// Initialize the API Gateway Management client
const apigwClient = new ApiGatewayManagementApiClient({
  region: process.env.AWS_REGION || "ap-south-1",
  endpoint: ENDPOINT,
  credentials: process.env.EVENTIO_AWS_ACCESS_KEY_ID ? { accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY } : undefined,
});

/**
 * Broadcasts a JSON message to all connected clients in a specific event room.
 * @param {string} eventId 
 * @param {string} eventType e.g., "new-message", "poll-vote"
 * @param {object} payload 
 */
export async function broadcastToEvent(eventId, eventType, payload) {
  if (!ENDPOINT) {
    console.warn("AWS_WSS_CONNECTION_URL is missing. Skipping WebSocket broadcast.");
    return;
  }

  try {
    // 1. Fetch all connection IDs for this eventId from DynamoDB using GSI
    const queryParams = {
      TableName: CONNECTIONS_TABLE,
      IndexName: "eventId-index",
      KeyConditionExpression: "eventId = :eid",
      ExpressionAttributeValues: {
        ":eid": eventId
      }
    };
    
    const result = await dynamoDb.send(new QueryCommand(queryParams));
    const connections = result.Items || [];

    if (connections.length === 0) return;

    // 2. Prepare the payload buffer
    const messageData = Buffer.from(JSON.stringify({ event: eventType, data: payload }));

    // 3. Send to all connections concurrently
    const postCalls = connections.map(async (conn) => {
      try {
        await apigwClient.send(new PostToConnectionCommand({
          ConnectionId: conn.connectionId,
          Data: messageData
        }));
      } catch (e) {
        // If the connection is stale/gone, delete it from DynamoDB
        if (e.$metadata?.httpStatusCode === 410) {
          await dynamoDb.send(new DeleteCommand({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId: conn.connectionId }
          }));
        } else {
          console.error(`Failed to send to ${conn.connectionId}:`, e);
        }
      }
    });

    await Promise.all(postCalls);

  } catch (error) {
    console.error("Error broadcasting WebSocket message:", error);
  }
}
