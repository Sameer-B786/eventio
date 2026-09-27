import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSession } from "@/lib/session";

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";
export const dynamic = 'force-dynamic';

// GET /api/events/all
// Publicly fetch all events (for the "Explore Events" section)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scanParams = {
      TableName: EVENTS_TABLE,
    };
    const result = await dynamoDb.send(new ScanCommand(scanParams));
    let dbEvents = result.Items || [];

    const nowMs = Date.now();
    
    // Filter out expired events
    dbEvents = dbEvents.filter(e => {
      if (!e.endTime) return true;
      const expireTimeMs = new Date(e.endTime).getTime() + 2 * 60 * 60 * 1000;
      return nowMs < expireTimeMs;
    });

    const formattedEvents = dbEvents.map(e => ({
      ...e,
      id: e.eventId 
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("DynamoDB Scan Error:", error);
    return NextResponse.json({ error: "Failed to fetch all events" }, { status: 500 });
  }
}
