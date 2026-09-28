import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createPhonePeOrder } from '@/lib/phonepe';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDb } from '@/lib/dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE_NAME || 'Eventio-Transactions';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bundleSize } = await req.json(); // e.g., 50 credits, 100 credits
    
    // Validate bundle sizes (just to prevent arbitrary amounts if desired, but we can allow dynamic)
    const costPerCredit = 5; // 5 INR per PDF
    const amountInRupees = bundleSize * costPerCredit;
    
    if (amountInRupees <= 0) {
      return NextResponse.json({ error: "Invalid bundle size" }, { status: 400 });
    }

    const transactionId = `TXN_${uuidv4().replace(/-/g, '')}`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/idgen/billing?txn=${transactionId}`;

    // 1. Create order with PhonePe
    const phonepeResponse = await createPhonePeOrder(
      transactionId, 
      amountInRupees, 
      session.userId, 
      redirectUrl
    );

    // 2. Save Pending Transaction to DynamoDB
    await dynamoDb.send(new PutCommand({
      TableName: TRANSACTIONS_TABLE,
      Item: {
        transactionId,
        userId: session.userId,
        bundleSize,
        amount: amountInRupees,
        status: 'PENDING',
        createdAt: Date.now()
      }
    }));

    // 3. Return the redirect URL to the frontend
    const payUrl = phonepeResponse.instrumentResponse.redirectInfo.url;
    return NextResponse.json({ url: payUrl, transactionId });

  } catch (error) {
    console.error("PhonePe Create Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
