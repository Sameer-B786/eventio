import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, InitiateAuthCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
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
    const loginIdentifier = email;

    if (!loginIdentifier || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const client = new CognitoIdentityProviderClient({ 
      region: REGION,
      credentials: process.env.EVENTIO_AWS_ACCESS_KEY_ID ? { accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY } : undefined
    });

    let actualUsername = loginIdentifier;

    if (loginIdentifier.includes('@') && process.env.COGNITO_USER_POOL_ID && process.env.EVENTIO_AWS_ACCESS_KEY_ID) {
      try {
        const listCommand = new ListUsersCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Filter: `email = "${loginIdentifier}"`
        });
        const usersRes = await client.send(listCommand);
        if (usersRes.Users && usersRes.Users.length > 0) {
          const confirmedUsers = usersRes.Users.filter(u => u.UserStatus === 'CONFIRMED');
          if (confirmedUsers.length > 0) {
            confirmedUsers.sort((a, b) => new Date(b.UserCreateDate) - new Date(a.UserCreateDate));
            actualUsername = confirmedUsers[0].Username;
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

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: actualUsername,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await client.send(command);

    if (response.AuthenticationResult) {
      const idToken = response.AuthenticationResult.IdToken;
      const decoded = decodeJwt(idToken);
      
      const sessionString = await createSession({
        userInfo: {
          email: decoded.email,
          name: decoded.name || decoded.email?.split('@')[0],
        }
      });

      const responseObj = NextResponse.json({ success: true });
      const isProd = process.env.NODE_ENV === "production";
      const secureFlag = isProd ? "Secure;" : "";
      
      responseObj.headers.append(
        'Set-Cookie', 
        `session=${sessionString}; Path=/; HttpOnly; SameSite=Lax; ${secureFlag} Max-Age=2592000`
      );
      
      return responseObj;
    }

    return NextResponse.json({ error: 'Authentication challenge required' }, { status: 400 });
  } catch (error) {
    console.error('Login error:', error);
    let message = 'An error occurred during login: ' + error.message;
    if (error.name === 'NotAuthorizedException') {
      message = 'Incorrect email or password';
    } else if (error.name === 'UserNotFoundException') {
      message = 'User does not exist';
    } else if (error.name === 'UserNotConfirmedException') {
      message = 'Your account setup is incomplete. Please sign up again.';
    }
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
