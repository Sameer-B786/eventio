import { NextResponse } from "next/server";
import { broadcastToEvent } from "@/lib/awsWebsocket";
import { dynamoDb } from "@/lib/dynamodb";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/session";

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";

// Helper to find the event's Partition Key (creator's userId)
async function findEventCreatorId(eventId) {
  const { Items } = await dynamoDb.send(new ScanCommand({
    TableName: EVENTS_TABLE,
    FilterExpression: "eventId = :eid",
    ExpressionAttributeValues: { ":eid": eventId }
  }));
  return Items && Items.length > 0 ? Items[0].userId : null;
}

export async function GET(req, { params }) {
  try {
    const { eventId } = await params;
    
    const { Items } = await dynamoDb.send(new ScanCommand({
      TableName: EVENTS_TABLE,
      FilterExpression: "eventId = :eid",
      ExpressionAttributeValues: { ":eid": eventId }
    }));

    if (!Items || Items.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = Items[0];
    return NextResponse.json(event.chatMessages || []);
  } catch (error) {
    console.error("Failed to fetch messages", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId } = await params;
    const body = await req.json();

    if (!body.content || body.content.trim() === "") {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }
    
    // Retrieve the creator's ID so we can update the DynamoDB item
    const creatorId = await findEventCreatorId(eventId);
    if (!creatorId) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const message = {
      id: uuidv4(),
      eventId,
      userId: session.userInfo.email,
      userName: session.userInfo.email === creatorId ? "Host" : "Attendee",
      content: body.content.trim(),
      createdAt: new Date().toISOString(),
    };

    // Append message to the event's chatMessages list securely
    await dynamoDb.send(new UpdateCommand({
      TableName: EVENTS_TABLE,
      Key: { userId: creatorId, eventId: eventId },
      UpdateExpression: "SET chatMessages = list_append(if_not_exists(chatMessages, :empty_list), :new_msg)",
      ExpressionAttributeValues: {
        ":new_msg": [message],
        ":empty_list": []
      }
    }));

    // Broadcast using AWS API Gateway WebSockets
    await broadcastToEvent(eventId, "new-message", message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Failed to send message", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
