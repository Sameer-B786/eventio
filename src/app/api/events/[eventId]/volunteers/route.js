import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getSession } from "@/lib/session";

const EVENTS_TABLE = process.env.EVENTS_TABLE_NAME || "Eventio-Events";

export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userInfo.email;
    const { eventId } = await params;
    const { volunteerEmail } = await req.json();

    if (!volunteerEmail) {
      return NextResponse.json({ error: "Volunteer email required" }, { status: 400 });
    }

    // Only the creator (whose userId matches the PK) can update this.
    // DynamoDB UpdateCommand will fail if the item doesn't exist for this Partition Key.
    const updateParams = {
      TableName: EVENTS_TABLE,
      Key: {
        userId: userId,
        eventId: eventId
      },
      UpdateExpression: "SET volunteers = list_append(if_not_exists(volunteers, :empty_list), :new_vol)",
      ExpressionAttributeValues: {
        ":empty_list": [],
        ":new_vol": [volunteerEmail.toLowerCase()]
      },
      ReturnValues: "ALL_NEW"
    };

    const result = await dynamoDb.send(new UpdateCommand(updateParams));

    return NextResponse.json({ success: true, volunteers: result.Attributes.volunteers });
  } catch (error) {
    console.error("Error adding volunteer:", error);
    return NextResponse.json({ error: "Server error or unauthorized" }, { status: 500 });
  }
}
