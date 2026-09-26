import { NextResponse } from "next/server";
import { broadcastToEvent } from "@/lib/awsWebsocket";
import { v4 as uuidv4 } from "uuid";

const messagesStore = {}; // In-memory fallback for demo

export async function GET(req, { params }) {
  const { eventId } = await params;
  
  // In a real app, query DynamoDB: PK = EVENT#${eventId}, SK begins_with MSG#
  if (eventId === "demo-event-123" && !messagesStore[eventId]) {
    messagesStore[eventId] = [
      { id: "1", eventId, userId: "sys", userName: "Admin", content: "Welcome to the Annual Tech Conference 2026 Workspace! Drop your questions here.", createdAt: new Date().toISOString() },
      { id: "2", eventId, userId: "u1", userName: "Alice", content: "Hi! Check out the schedule here: https://example.com/schedule", createdAt: new Date().toISOString() }
    ];
  }
  const history = messagesStore[eventId] || [];
  return NextResponse.json(history);
}

export async function POST(req, { params }) {
  try {
    const { eventId } = await params;
    const body = await req.json();
    
    const message = {
      id: uuidv4(),
      eventId,
      userId: body.userId,
      userName: body.userName,
      content: body.content,
      createdAt: new Date().toISOString(),
    };

    // Save to DB here...
    if (!messagesStore[eventId]) messagesStore[eventId] = [];
    messagesStore[eventId].push(message);

    // Broadcast using AWS API Gateway WebSockets
    await broadcastToEvent(eventId, "new-message", message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
