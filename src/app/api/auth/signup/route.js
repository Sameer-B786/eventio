import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, SignUpCommand, AdminConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';

function calculateSecretHash(username, clientId) {
  const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
  if (!CLIENT_SECRET || !clientId) return undefined;
  return crypto
    .createHmac('SHA256', CLIENT_SECRET)
    .update(username + clientId)
    .digest('base64');
}

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain || !(emailDomain.endsWith('.com') || emailDomain.endsWith('.in'))) {
      return NextResponse.json({ error: 'Only .com and .in email domains are allowed' }, { status: 400 });
    }

    const REGION = process.env.COGNITO_REGION || 'ap-south-1';
    const client = new CognitoIdentityProviderClient({ 
      region: REGION,
      credentials: process.env.EVENTIO_AWS_ACCESS_KEY_ID ? { accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY } : undefined
    });
    
    const clientId = process.env.COGNITO_CLIENT_ID;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (!clientId) {
      console.error('CRITICAL: COGNITO_CLIENT_ID environment variable is missing.');
      return NextResponse.json({ error: 'Server configuration error: Missing Cognito Client ID.' }, { status: 500 });
    }

    // Generate a unique UUID for the Cognito Username so users don't have to provide one
    const generatedUsername = crypto.randomUUID();
    const secretHash = calculateSecretHash(generatedUsername, clientId);

    const userAttributes = [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'name',
        Value: name,
      },
      {
        Name: 'updated_at',
        Value: Math.floor(Date.now() / 1000).toString(),
      }
    ];

    const command = new SignUpCommand({
      ClientId: clientId,
      Username: generatedUsername,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: userAttributes,
    });

    const response = await client.send(command);

    // Auto-confirm the user so no verification code is needed
    if (!userPoolId) {
      throw new Error("Server configuration error: COGNITO_USER_POOL_ID is missing in the environment variables.");
    }
    
    if (!process.env.EVENTIO_AWS_ACCESS_KEY_ID) {
      throw new Error("Server configuration error: EVENTIO_AWS_ACCESS_KEY_ID is missing in the environment variables.");
    }

    const confirmCommand = new AdminConfirmSignUpCommand({
      UserPoolId: userPoolId,
      Username: generatedUsername,
    });
    await client.send(confirmCommand);

    return NextResponse.json({ 
      success: true, 
      userConfirmed: response.UserConfirmed,
      username: generatedUsername
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    let message = 'An error occurred during sign up';
    if (error.name === 'UsernameExistsException' || error.name === 'AliasExistsException') {
      message = 'An account with the email already exists.';
    } else if (error.name === 'InvalidPasswordException') {
      message = 'Password does not meet requirements';
    } else if (error.name === 'InvalidParameterException') {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
