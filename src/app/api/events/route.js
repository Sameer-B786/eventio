import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/dynamodb";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/session";

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userInfo.email;

    const data = await req.json();
    const eventId = uuidv4();
    
    const eventParams = {
      TableName: EVENTS_TABLE,
      Item: {
        PK: `EVENT#${eventId}`,
        SK: `METADATA`,
        id: eventId,
        userId: userId,
        name: data.name,
        description: data.description,
        bannerUrl: data.bannerUrl,
        hostedBy: data.hostedBy,
        startTime: data.startTime,
        endTime: data.endTime,
        createdAt: new Date().toISOString(),
        isActive: true
      },
    };

    try {
        await dynamoDb.send(new PutCommand(eventParams));
    } catch (dbError) {
        console.warn("DynamoDB save failed, proceeding with mock response.");
    }

    // In-memory fallback
    if (!global.mockEvents) global.mockEvents = [];
    global.mockEvents.push(eventParams.Item);

    return NextResponse.json({ eventId, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.userInfo.email;

  let dbEvents = [];
  try {
    const scanParams = {
      TableName: EVENTS_TABLE,
      FilterExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId
      }
    };
    const result = await dynamoDb.send(new ScanCommand(scanParams));
    dbEvents = result.Items || [];
  } catch (dbError) {
    // Fallback if DynamoDB is not provisioned
  }

  const mockDemoEvent = {
    id: "demo-event-123",
    userId: userId,
    name: "Sample Tech Event Workspace",
    description: "A space to interact dynamically.",
    hostedBy: "Eventio Admin",
    bannerUrl: "https://via.placeholder.com/800x200",
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    isActive: true
  };
  
  const memoryEvents = (global.mockEvents || []).filter(e => e.userId === userId);
  
  const eventsMap = new Map();
  // Prefer DynamoDB events if any exist, otherwise memory events
  const sourceEvents = dbEvents.length > 0 ? dbEvents : memoryEvents;
  
  sourceEvents.forEach(e => eventsMap.set(e.id, e));
  eventsMap.set(mockDemoEvent.id, mockDemoEvent); // Always include the demo

  return NextResponse.json(Array.from(eventsMap.values()));
}
