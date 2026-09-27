import { NextResponse } from "next/server";
import { broadcastToEvent } from "@/lib/awsWebsocket";
import { dynamoDb } from "@/lib/dynamodb";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getSession } from "@/lib/session";

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";

export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId, pollId } = await params;
    const { optionIndex } = await req.json();

    if (typeof optionIndex !== 'number') {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 });
    }

    // 1. Fetch the event to find its creator (PK) and the index of the poll in the list
    const { Items } = await dynamoDb.send(new ScanCommand({
      TableName: EVENTS_TABLE,
      FilterExpression: "eventId = :eid",
      ExpressionAttributeValues: { ":eid": eventId }
    }));

    if (!Items || Items.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    const event = Items[0];
    const creatorId = event.userId;
    const polls = event.polls || [];

    const pollIndex = polls.findIndex(p => p.id === pollId);
    if (pollIndex === -1) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

    const poll = polls[pollIndex];
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return NextResponse.json({ error: "Option index out of bounds" }, { status: 400 });
    }

    // 2. Atomically increment the vote count in DynamoDB
    const updateParams = {
      TableName: EVENTS_TABLE,
      Key: { userId: creatorId, eventId: eventId },
      UpdateExpression: `SET polls[${pollIndex}].options[${optionIndex}].votes = polls[${pollIndex}].options[${optionIndex}].votes + :inc`,
      ExpressionAttributeValues: { ":inc": 1 },
      ReturnValues: "ALL_NEW"
    };

    const result = await dynamoDb.send(new UpdateCommand(updateParams));
    
    // Find the updated poll object from the result
    const updatedPoll = result.Attributes.polls.find(p => p.id === pollId);

    // 3. Broadcast updated poll
    if (updatedPoll) {
      await broadcastToEvent(eventId, "poll-vote", updatedPoll);
    }

    return NextResponse.json(updatedPoll);
  } catch (error) {
    console.error("Voting error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
