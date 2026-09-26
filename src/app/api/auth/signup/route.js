import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
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
    const { email, password, username, phoneNo } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 });
    }

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain || !(emailDomain.endsWith('.com') || emailDomain.endsWith('.in'))) {
      return NextResponse.json({ error: 'Only .com and .in email domains are allowed' }, { status: 400 });
    }

    const client = new CognitoIdentityProviderClient({ region: REGION });
    // Generate a unique username (UUID) because Cognito rejects emails in the Username field if email alias is enabled
    // We'll store their provided username as preferred_username
    const generatedUsername = crypto.randomUUID();
    const secretHash = calculateSecretHash(generatedUsername);

    const userAttributes = [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'preferred_username',
        Value: username,
      }
    ];

    if (phoneNo) {
      userAttributes.push({
        Name: 'phone_number',
        Value: phoneNo.startsWith('+') ? phoneNo : `+91${phoneNo.replace(/\D/g, '')}` // fallback assumption
      });
    }

    userAttributes.push({
      Name: 'updated_at',
      Value: Math.floor(Date.now() / 1000).toString(),
    });

    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
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
      message = 'An account with this email already exists';
    } else if (error.name === 'InvalidPasswordException') {
      message = 'Password does not meet requirements';
    } else if (error.name === 'InvalidParameterException') {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
