import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
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
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const client = new CognitoIdentityProviderClient({ 
      region: REGION,
      credentials: process.env.EVENTIO_AWS_ACCESS_KEY_ID ? { accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY } : undefined
    });
    
    let actualUsername = email;

    if (email.includes('@') && process.env.COGNITO_USER_POOL_ID && process.env.EVENTIO_AWS_ACCESS_KEY_ID) {
      try {
        const listCommand = new ListUsersCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Filter: `email = "${email}"`,
          Limit: 1
        });
        const usersRes = await client.send(listCommand);
        if (usersRes.Users && usersRes.Users.length > 0) {
          actualUsername = usersRes.Users[0].Username;
        }
      } catch (lookupErr) {
        console.error("Email lookup failed:", lookupErr);
      }
    }

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
    
    let message = `An error occurred during verification: ${error.name} - ${error.message}`;
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
