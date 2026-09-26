import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";

export async function GET(req, { params }) {
  try {
    const { eventId } = await params;
    
    try {
      const { Item } = await dynamoDb.send(new GetCommand({
        TableName: EVENTS_TABLE,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `METADATA`
        }
      }));
      
      if (Item) {
        return NextResponse.json(Item);
      }
    } catch (dbError) {
      // Ignore if table doesn't exist yet
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
