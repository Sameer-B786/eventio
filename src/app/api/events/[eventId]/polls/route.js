import { NextResponse } from "next/server";
import { broadcastToEvent } from "@/lib/awsWebsocket";
import { v4 as uuidv4 } from "uuid";

// In-memory store for demo
export const pollsStore = {}; 

export async function GET(req, { params }) {
  const { eventId } = await params;
  
  if (eventId === "demo-event-123" && !pollsStore[eventId]) {
    pollsStore[eventId] = [
      { id: "p1", eventId, question: "Which framework are you most excited about?", options: [{ text: "Next.js", votes: 12 }, { text: "SvelteKit", votes: 5 }, { text: "Remix", votes: 3 }], createdAt: new Date().toISOString() }
    ];
  }

  const eventPolls = pollsStore[eventId] || [];
  // Return sorted by newest first
  return NextResponse.json([...eventPolls].reverse());
}

export async function POST(req, { params }) {
  try {
    const { eventId } = await params;
    const { question, options } = await req.json();
    const pollId = uuidv4();
    
    const newPoll = {
      id: pollId,
      eventId,
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      createdAt: new Date().toISOString(),
    };

    try {
      const { dynamoDb } = await import("@/lib/dynamodb");
      const { PutCommand } = await import("@aws-sdk/lib-dynamodb");
      const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";
      
      const pollParams = {
        TableName: EVENTS_TABLE,
        Item: {
          PK: `EVENT#${eventId}`,
          SK: `POLL#${pollId}`,
          ...newPoll
        }
      };
      await dynamoDb.send(new PutCommand(pollParams));
    } catch (dbError) {
      console.warn("Failed to save poll to DynamoDB, relying on memory store.", dbError.message);
    }

    if (!pollsStore[eventId]) pollsStore[eventId] = [];
    pollsStore[eventId].push(newPoll);

    // Broadcast new poll
    await broadcastToEvent(eventId, "new-poll", newPoll);

    return NextResponse.json(newPoll, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
