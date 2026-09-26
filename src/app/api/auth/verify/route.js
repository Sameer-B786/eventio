import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';

const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
const REGION = process.env.COGNITO_REGION || 'ap-south-1';

function calculateSecretHash(username) {
  if (!CLIENT_SECRET) return undefined;
  return crypto
    .createHmac('SHA256', CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest('base64');
}

export async function POST(request) {
  try {
    const { email, code, username } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const client = new CognitoIdentityProviderClient({ region: REGION });
    
    // We MUST use the actual UUID username if it's provided, otherwise fallback to email alias (which is buggy)
    const actualUsername = username || email;
    const secretHash = calculateSecretHash(actualUsername);

    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: actualUsername,
      ConfirmationCode: code,
      SecretHash: secretHash,
    });

    await client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verification error:', error);
    
    let message = 'An error occurred during verification';
    if (error.name === 'CodeMismatchException') {
      message = 'Invalid verification code';
    } else if (error.name === 'ExpiredCodeException') {
      message = 'Verification code has expired';
    } else if (error.name === 'NotAuthorizedException') {
      message = 'User is already confirmed or invalid';
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
