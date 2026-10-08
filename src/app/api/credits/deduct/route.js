import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { dynamoDb } from '@/lib/dynamodb';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

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
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Atomic deduction: deduct credits AND log transaction
      await dynamoDb.send(new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: USERS_TABLE,
              Key: { userId: session.userInfo.email },
              UpdateExpression: "SET credits = credits - :amount",
              ConditionExpression: "attribute_exists(credits) AND credits >= :amount",
              ExpressionAttributeValues: {
                ":amount": amount
              }
            }
          },
          {
            Put: {
              TableName: process.env.TRANSACTIONS_TABLE_NAME || 'Eventio-Transactions',
              Item: {
                transactionId: transactionId,
                userId: session.userInfo.email,
                bundleSize: -amount,
                amount: 0, // No monetary value spent
                status: 'USAGE',
                createdAt: Date.now()
              }
            }
          }
        ]
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
