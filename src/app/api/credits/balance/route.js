import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { dynamoDb } from '@/lib/dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const USERS_TABLE = process.env.USERS_TABLE_NAME || 'Eventio-Users';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await dynamoDb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: session.userId }
    }));

    const credits = res.Item?.credits || 0;
    return NextResponse.json({ credits });
  } catch (error) {
    console.error("Failed to fetch balance", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
