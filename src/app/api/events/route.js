import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/dynamodb";
import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
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
    
    // Calculate TTL (2 hours after endTime) in seconds
    const endMs = new Date(data.endTime).getTime();
    const ttlSeconds = Math.floor((endMs + 2 * 60 * 60 * 1000) / 1000);

    const eventParams = {
      TableName: EVENTS_TABLE,
      Item: {
        userId: userId,       // Partition Key
        eventId: eventId,     // Sort Key
        name: data.name,
        description: data.description,
        bannerUrl: data.bannerUrl,
        hostedBy: data.hostedBy,
        startTime: data.startTime,
        endTime: data.endTime,
        createdAt: new Date().toISOString(),
        isActive: true,
        volunteers: [],       // Array of volunteer emails
        ttl: ttlSeconds       // DynamoDB TTL attribute
      },
    };

    await dynamoDb.send(new PutCommand(eventParams));

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

  try {
    const queryParams = {
      TableName: EVENTS_TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId
      }
    };
    const hostedResult = await dynamoDb.send(new QueryCommand(queryParams));
    let dbEvents = hostedResult.Items || [];

    // Also scan for events where the user is a volunteer
    const scanParams = {
      TableName: EVENTS_TABLE,
      FilterExpression: "contains(volunteers, :uid)",
      ExpressionAttributeValues: {
        ":uid": userId
      }
    };
    try {
      const volResult = await dynamoDb.send(new ScanCommand(scanParams));
      if (volResult.Items) {
        dbEvents = [...dbEvents, ...volResult.Items];
      }
    } catch (scanErr) {
      console.warn("Scan for volunteers failed or no volunteers attribute exists yet.");
    }

    const nowMs = Date.now();
    
    // Filter out events that are past their 2-hour expiration window manually
    // (DynamoDB TTL might take up to 48 hours to fully sweep, so we enforce it on read)
    dbEvents = dbEvents.filter(e => {
      if (!e.endTime) return true;
      const expireTimeMs = new Date(e.endTime).getTime() + 2 * 60 * 60 * 1000;
      return nowMs < expireTimeMs;
    });

    // Map the events to ensure frontend compatibility if it expects 'id' instead of 'eventId'
    const formattedEvents = dbEvents.map(e => ({
      ...e,
      id: e.eventId 
    }));

    return NextResponse.json(formattedEvents);
  } catch (dbError) {
    console.error("DynamoDB Query Error:", dbError);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
