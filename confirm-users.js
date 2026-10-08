import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new CognitoIdentityProviderClient({ 
  region: process.env.COGNITO_REGION,
  credentials: { 
    accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY 
  }
});

async function run() {
  const listCommand = new ListUsersCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
  });
  
  const res = await client.send(listCommand);
  console.log('Total users:', res.Users?.length || 0);
  for (const user of res.Users || []) {
    console.log(user.Username, user.UserStatus);
  }
}

run().catch(console.error);
