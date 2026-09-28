import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { razorpayClient } from '@/lib/razorpay';
import { dynamoDb } from '@/lib/dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE_NAME || 'Eventio-Transactions';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bundleSize } = await req.json();
    const costPerCredit = 5; 
    const amountInRupees = bundleSize * costPerCredit;
    
    if (amountInRupees <= 0) {
      return NextResponse.json({ error: "Invalid bundle size" }, { status: 400 });
    }

    // 1. Create Razorpay Order
    // amount is in paise (₹1 = 100 paise)
    const options = {
      amount: amountInRupees * 100, 
      currency: "INR",
      receipt: `RCPT_${Date.now()}`
    };
    
    const order = await razorpayClient.orders.create(options);

    // 2. Save Pending Transaction to DynamoDB
    await dynamoDb.send(new PutCommand({
      TableName: TRANSACTIONS_TABLE,
      Item: {
        transactionId: order.id,
        userId: session.userId,
        bundleSize,
        amount: amountInRupees,
        status: 'PENDING',
        createdAt: Date.now()
      }
    }));

    // 3. Return the order details to the frontend
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });

  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
