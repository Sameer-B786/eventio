import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { dynamoDb } from '@/lib/dynamodb';
import { TransactWriteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE_NAME || 'Eventio-Transactions';
const USERS_TABLE = process.env.USERS_TABLE_NAME || 'Eventio-Users';

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // 1. Verify Signature
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Fetch the pending transaction
    const txnRes = await dynamoDb.send(new GetCommand({
      TableName: TRANSACTIONS_TABLE,
      Key: { transactionId: razorpay_order_id }
    }));
    const txn = txnRes.Item;

    if (!txn) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    
    if (txn.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: "Already processed" }, { status: 200 });
    }

    // 3 & 4. Atomically mark transaction as COMPLETED and ADD credits
    await dynamoDb.send(new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: TRANSACTIONS_TABLE,
            Key: { transactionId: razorpay_order_id },
            UpdateExpression: "SET #st = :st, paymentId = :pid, updatedAt = :updatedAt",
            ConditionExpression: "#st <> :st", // Prevent double credit if already COMPLETED
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { 
              ":st": "COMPLETED", 
              ":pid": razorpay_payment_id,
              ":updatedAt": Date.now() 
            }
          }
        },
        {
          Update: {
            TableName: USERS_TABLE,
            Key: { userId: txn.userId },
            UpdateExpression: "SET credits = if_not_exists(credits, :start) + :bundle",
            ExpressionAttributeValues: {
              ":start": 0,
              ":bundle": txn.bundleSize
            }
          }
        }
      ]
    }));

    console.log(`Razorpay payment verified! Added ${txn.bundleSize} credits to user ${txn.userId}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
  }
}
