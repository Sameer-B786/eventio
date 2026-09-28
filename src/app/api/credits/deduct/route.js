import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { dynamoDb } from '@/lib/dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

const USERS_TABLE = process.env.USERS_TABLE_NAME || 'Eventio-Users';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await req.json();
    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    try {
      // Atomic deduction: only works if credits >= amount
      await dynamoDb.send(new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId: session.userInfo.email },
        UpdateExpression: "SET credits = credits - :amount",
        ConditionExpression: "attribute_exists(credits) AND credits >= :amount",
        ExpressionAttributeValues: {
          ":amount": amount
        }
      }));
      
      return NextResponse.json({ success: true });

    } catch (dbError) {
      if (dbError.name === 'ConditionalCheckFailedException') {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 402 }); // 402 Payment Required
      }
      throw dbError;
    }

  } catch (error) {
    console.error("Deduct Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
