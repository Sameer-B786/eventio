import { NextResponse } from "next/server";
import { broadcastToEvent } from "@/lib/awsWebsocket";
import { pollsStore } from "../../route";
import { dynamoDb } from "@/lib/dynamodb";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";

export async function POST(req, { params }) {
  try {
    const { eventId, pollId } = await params;
    const { optionIndex } = await req.json();

    let updatedPoll = null;

    try {
      const updateParams = {
        TableName: EVENTS_TABLE,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `POLL#${pollId}`
        },
        UpdateExpression: `SET options[${optionIndex}].votes = options[${optionIndex}].votes + :inc`,
        ExpressionAttributeValues: {
          ":inc": 1
        },
        ReturnValues: "ALL_NEW"
      };

      const result = await dynamoDb.send(new UpdateCommand(updateParams));
      updatedPoll = result.Attributes;
    } catch (dbError) {
      console.warn("DynamoDB atomic update failed, falling back to in-memory atomicity", dbError.message);
      const eventPolls = pollsStore[eventId] || [];
      const pollIndex = eventPolls.findIndex(p => p.id === pollId);
      
      if (pollIndex === -1) {
        return NextResponse.json({ error: "Poll not found" }, { status: 404 });
      }

      eventPolls[pollIndex].options[optionIndex].votes += 1;
      updatedPoll = eventPolls[pollIndex];
    }

    // Broadcast updated poll
    if (updatedPoll) {
      await broadcastToEvent(eventId, "poll-vote", updatedPoll);
    }

    return NextResponse.json(updatedPoll);
  } catch (error) {
    console.error("Voting error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
