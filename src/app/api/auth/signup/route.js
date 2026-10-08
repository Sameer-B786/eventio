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
    const { email, password, name, captchaToken } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // CAPTCHA Verification
    if (process.env.CAPTCHA_SECRET_KEY && captchaToken) {
      const captchaRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${process.env.CAPTCHA_SECRET_KEY}&response=${captchaToken}`,
      });
      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 400 });
      }
    }

    const REGION = process.env.COGNITO_REGION || 'ap-south-1';
    const client = new CognitoIdentityProviderClient({ 
      region: REGION,
      credentials: process.env.EVENTIO_AWS_ACCESS_KEY_ID ? { accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY } : undefined
    });
    
    const clientId = process.env.COGNITO_CLIENT_ID;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    
    if (!clientId || !userPoolId || !process.env.EVENTIO_AWS_ACCESS_KEY_ID) {
      console.error('CRITICAL: Missing Cognito Environment Variables');
      return NextResponse.json({ error: 'Server configuration error: Missing AWS credentials.' }, { status: 500 });
    }

    const generatedUsername = crypto.randomUUID();
    const secretHash = calculateSecretHash(generatedUsername, clientId);

    const userAttributes = [
      { Name: 'email', Value: email },
      { Name: 'name', Value: name },
      { Name: 'updated_at', Value: Math.floor(Date.now() / 1000).toString() }
    ];

    const command = new SignUpCommand({
      ClientId: clientId,
      Username: generatedUsername,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: userAttributes,
    });

    const response = await client.send(command);

    // Auto-confirm the user since we verified they are human via CAPTCHA
    const confirmCommand = new AdminConfirmSignUpCommand({
      UserPoolId: userPoolId,
      Username: generatedUsername,
    });
    await client.send(confirmCommand);

    return NextResponse.json({ 
      success: true, 
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
