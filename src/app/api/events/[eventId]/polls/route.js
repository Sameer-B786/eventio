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
    const eventPolls = event.polls || [];
    // Return sorted by newest first
    return NextResponse.json([...eventPolls].reverse());
  } catch (error) {
    console.error("Failed to fetch polls", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId } = await params;
    const { question, options } = await req.json();

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: "Invalid poll data" }, { status: 400 });
    }
    
    // Only the host should be allowed to create polls. Let's enforce that!
    const creatorId = await findEventCreatorId(eventId);
    if (!creatorId) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (creatorId !== session.userInfo.email) {
      return NextResponse.json({ error: "Only the event host can create polls" }, { status: 403 });
    }

    const pollId = uuidv4();
    const newPoll = {
      id: pollId,
      eventId,
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      createdAt: new Date().toISOString(),
    };

    // Append poll to the event's polls list securely
    await dynamoDb.send(new UpdateCommand({
      TableName: EVENTS_TABLE,
      Key: { userId: creatorId, eventId: eventId },
      UpdateExpression: "SET polls = list_append(if_not_exists(polls, :empty_list), :new_poll)",
      ExpressionAttributeValues: {
        ":new_poll": [newPoll],
        ":empty_list": []
      }
    }));

    // Broadcast new poll
    await broadcastToEvent(eventId, "new-poll", newPoll);

    return NextResponse.json(newPoll, { status: 201 });
  } catch (error) {
    console.error("Failed to create poll", error);
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
