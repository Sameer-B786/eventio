import { NextResponse } from 'next/server';
import { generateChecksum } from '@/lib/phonepe';
import { dynamoDb } from '@/lib/dynamodb';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE_NAME || 'Eventio-Transactions';
const USERS_TABLE = process.env.USERS_TABLE_NAME || 'Eventio-Users';

export async function POST(req) {
  try {
    const rawBody = await req.json();
    const { response } = rawBody; // Base64 encoded JSON
    
    // 1. Verify Checksum
    const receivedChecksum = req.headers.get('x-verify');
    if (!receivedChecksum) {
      return NextResponse.json({ error: "Missing Signature" }, { status: 400 });
    }

    const calculatedChecksum = generateChecksum(response, ''); // For callback, endpoint is empty string
    if (calculatedChecksum !== receivedChecksum) {
      console.error("Signature mismatch", { expected: calculatedChecksum, received: receivedChecksum });
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    // 2. Decode Response
    const decodedPayload = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));
    const { merchantTransactionId, code, data } = decodedPayload;

    if (code === 'PAYMENT_SUCCESS') {
      // Fetch transaction
      const txnRes = await dynamoDb.send(new GetCommand({
        TableName: TRANSACTIONS_TABLE,
        Key: { transactionId: merchantTransactionId }
      }));
      const txn = txnRes.Item;

      if (!txn || txn.status === 'COMPLETED') {
        return NextResponse.json({ status: "ALREADY_PROCESSED" }, { status: 200 });
      }

      // Mark transaction as COMPLETED
      await dynamoDb.send(new UpdateCommand({
        TableName: TRANSACTIONS_TABLE,
        Key: { transactionId: merchantTransactionId },
        UpdateExpression: "SET #st = :st, updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#st": "status" },
        ExpressionAttributeValues: { ":st": "COMPLETED", ":updatedAt": Date.now() }
      }));

      // Atomically ADD credits to User's Wallet
      await dynamoDb.send(new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId: txn.userId },
        UpdateExpression: "SET credits = if_not_exists(credits, :start) + :bundle",
        ExpressionAttributeValues: {
          ":start": 0,
          ":bundle": txn.bundleSize
        }
      }));

      console.log(`Payment success! Added ${txn.bundleSize} credits to user ${txn.userId}`);
    } else {
      // Mark as FAILED
      await dynamoDb.send(new UpdateCommand({
        TableName: TRANSACTIONS_TABLE,
        Key: { transactionId: merchantTransactionId },
        UpdateExpression: "SET #st = :st, updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#st": "status" },
        ExpressionAttributeValues: { ":st": "FAILED", ":updatedAt": Date.now() }
      }));
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PhonePe Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
  }
}
