import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
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
      credentials: process.env.EVENTIO_AWS_ACCESS_KEY_ID ? { accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY } : undefined
    });
    
    let actualUsername = email;

    if (email.includes('@') && process.env.COGNITO_USER_POOL_ID && process.env.EVENTIO_AWS_ACCESS_KEY_ID) {
      try {
        const listCommand = new ListUsersCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Filter: `email = "${email}"`
        });
        const usersRes = await client.send(listCommand);
        if (usersRes.Users && usersRes.Users.length > 0) {
          const unconfirmedUsers = usersRes.Users.filter(u => u.UserStatus === 'UNCONFIRMED');
          if (unconfirmedUsers.length > 0) {
            unconfirmedUsers.sort((a, b) => new Date(b.UserCreateDate) - new Date(a.UserCreateDate));
            actualUsername = unconfirmedUsers[0].Username;
          } else {
            usersRes.Users.sort((a, b) => new Date(b.UserCreateDate) - new Date(a.UserCreateDate));
            actualUsername = usersRes.Users[0].Username;
          }
        }
      } catch (lookupErr) {
        console.error("Email lookup failed:", lookupErr);
      }
    }

    const secretHash = calculateSecretHash(actualUsername);

    const command = new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: actualUsername,
      SecretHash: secretHash,
    });

    await client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend code error:', error);
    
    let message = 'An error occurred while resending the verification code.';
    if (error.name === 'LimitExceededException') {
      message = 'Attempt limit exceeded, please try again later.';
    } else if (error.name === 'UserNotFoundException') {
      message = 'User does not exist.';
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
