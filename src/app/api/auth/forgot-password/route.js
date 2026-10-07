import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
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
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = new CognitoIdentityProviderClient({ 
      region: REGION,
      credentials: { accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY }
    });
    const secretHash = calculateSecretHash(email);

    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      SecretHash: secretHash,
    });

    await client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    let message = 'An error occurred during password reset request.';
    if (error.name === 'UserNotFoundException') {
      message = 'User does not exist';
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
