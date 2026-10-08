import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';
import { createSession } from '@/lib/session';
import { decodeJwt } from 'jose';

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
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const client = new CognitoIdentityProviderClient({ 
      region: REGION,
      credentials: process.env.EVENTIO_AWS_ACCESS_KEY_ID ? { accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY } : undefined
    });
    const secretHash = calculateSecretHash(username);

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await client.send(command);

    if (response.AuthenticationResult) {
      const idToken = response.AuthenticationResult.IdToken;
      const decoded = decodeJwt(idToken);
      
      // Create session with tokens and extracted userInfo
      await createSession({
        accessToken: response.AuthenticationResult.AccessToken,
        idToken,
        userInfo: {
          email: decoded.email,
          name: decoded.name || decoded.email?.split('@')[0],
        }
      });

      return NextResponse.json({ success: true });
    }

    // Handle challenges like NEW_PASSWORD_REQUIRED if needed
    return NextResponse.json({ error: 'Authentication challenge required' }, { status: 400 });
  } catch (error) {
    console.error('Login error:', error);
    
    // Customize error messages based on Cognito exceptions
    let message = 'An error occurred during login: ' + error.message;
    if (error.name === 'NotAuthorizedException') {
      message = 'Incorrect email or password';
    } else if (error.name === 'UserNotFoundException') {
      message = 'User does not exist';
    } else if (error.name === 'UserNotConfirmedException') {
      message = 'Please confirm your email address before logging in';
    }

    return NextResponse.json({ error: message }, { status: 401 });
  }
}
