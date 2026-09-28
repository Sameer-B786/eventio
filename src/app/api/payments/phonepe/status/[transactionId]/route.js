import { NextResponse } from 'next/server';
import { dynamoDb } from '@/lib/dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE_NAME || 'Eventio-Transactions';

export async function GET(req, { params }) {
  try {
    const { transactionId } = await params;
    
    // We check our database first (which is updated by the webhook)
    const res = await dynamoDb.send(new GetCommand({
      TableName: TRANSACTIONS_TABLE,
      Key: { transactionId }
    }));

    if (!res.Item) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ status: res.Item.status });
  } catch (error) {
    console.error("Status check failed", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
