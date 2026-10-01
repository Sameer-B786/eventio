import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';

function calculateSecretHash(username) {
  const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
  const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
  if (!CLIENT_SECRET) return undefined;
  return crypto
    .createHmac('SHA256', CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest('base64');
}

export async function POST(request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 });
    }

    if (username.includes(' ')) {
      return NextResponse.json({ error: 'Username cannot contain spaces' }, { status: 400 });
    }

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain || !(emailDomain.endsWith('.com') || emailDomain.endsWith('.in'))) {
      return NextResponse.json({ error: 'Only .com and .in email domains are allowed' }, { status: 400 });
    }

    const REGION = process.env.COGNITO_REGION || 'ap-south-1';
    const client = new CognitoIdentityProviderClient({ region: REGION });
    
    // Use the provided username as the Cognito Username
    const generatedUsername = username;
    const secretHash = calculateSecretHash(generatedUsername);

    const userAttributes = [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'preferred_username',
        Value: username,
      },
      {
        Name: 'name',
        Value: username, // Providing username as name to satisfy the schema requirement
      }
    ];

    userAttributes.push({
      Name: 'updated_at',
      Value: Math.floor(Date.now() / 1000).toString(),
    });

    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: generatedUsername,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: userAttributes,
    });

    const response = await client.send(command);

    return NextResponse.json({ 
      success: true, 
      userConfirmed: response.UserConfirmed,
      username: generatedUsername
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    let message = 'An error occurred during sign up';
    if (error.name === 'UsernameExistsException') {
      message = 'An account with this username already exists';
    } else if (error.name === 'InvalidPasswordException') {
      message = 'Password does not meet requirements';
    } else if (error.name === 'InvalidParameterException') {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
