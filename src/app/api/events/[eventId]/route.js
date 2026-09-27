import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/dynamodb";
import { GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getSession } from "@/lib/session";

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userInfo.email;

    const { eventId } = await params;
    
    const { Item } = await dynamoDb.send(new GetCommand({
      TableName: EVENTS_TABLE,
      Key: {
        userId: userId,
        eventId: eventId
      }
    }));
    
    if (Item) {
      return NextResponse.json({ ...Item, id: Item.eventId });
    }

    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
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
