import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/dynamodb";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
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
        userId: userId,       // Partition Key
        eventId: eventId,     // Sort Key
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
    const result = await dynamoDb.send(new QueryCommand(queryParams));
    const dbEvents = result.Items || [];

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
