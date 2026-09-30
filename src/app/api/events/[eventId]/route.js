import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/dynamodb";
import { GetCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSession } from "@/lib/session";

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    
    // We use a Scan here because any user can view the event to register, 
    // but the Partition Key is the creator's userId.
    const { Items } = await dynamoDb.send(new ScanCommand({
      TableName: EVENTS_TABLE,
      FilterExpression: "eventId = :eid",
      ExpressionAttributeValues: {
        ":eid": eventId
      }
    }));
    
    if (Items && Items.length > 0) {
      const Item = Items[0];
      const isHost = Item.userId === session.userInfo.email;
      return NextResponse.json({ ...Item, id: Item.eventId, isHost });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching single event:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userInfo.email;
    const { eventId } = await params;

    await dynamoDb.send(new DeleteCommand({
      TableName: EVENTS_TABLE,
      Key: {
        userId: userId,
        eventId: eventId
      }
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
