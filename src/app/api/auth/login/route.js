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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // --- MOCK USER BYPASS ---
    if (email === 'mock@example.com' && password === 'mock123') {
      const mockPayload = {
        email: 'mock@example.com',
        name: 'Mock User',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // valid for 24 hours
      };
      const encodedPayload = Buffer.from(JSON.stringify(mockPayload)).toString('base64url');
      const mockIdToken = `eyJhbGciOiJub25lIn0.${encodedPayload}.`;
      
      await createSession({
        email: 'mock@example.com',
        name: 'Mock User',
        accessToken: 'mock_access_token',
        idToken: mockIdToken,
      });

      return NextResponse.json({ success: true });
    }
    // --- END MOCK USER BYPASS ---

    const client = new CognitoIdentityProviderClient({ region: REGION });
    const secretHash = calculateSecretHash(email);

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await client.send(command);

    if (response.AuthenticationResult) {
      // Decode ID token to get the user's name
      const idToken = response.AuthenticationResult.IdToken;
      const decodedIdToken = decodeJwt(idToken);
      const name = decodedIdToken.name || email.split('@')[0]; // fallback to email prefix if name is missing

      // Create session with tokens and user info
      await createSession({
        email,
        name,
        accessToken: response.AuthenticationResult.AccessToken,
        idToken,
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
