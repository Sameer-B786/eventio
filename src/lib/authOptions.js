import CredentialsProvider from "next-auth/providers/credentials";
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';
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

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Cognito",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password are required');
        }

        const client = new CognitoIdentityProviderClient({ 
          region: REGION,
          credentials: {
            accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY,
          }
        });
        
        const secretHash = calculateSecretHash(credentials.username);

        const command = new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: CLIENT_ID,
          AuthParameters: {
            USERNAME: credentials.username,
            PASSWORD: credentials.password,
            ...(secretHash && { SECRET_HASH: secretHash }),
          },
        });

        try {
          const response = await client.send(command);
          
          if (!response.AuthenticationResult) {
            throw new Error('Authentication challenge required');
          }

          const { IdToken } = response.AuthenticationResult;
          const decoded = decodeJwt(IdToken);
          
          return {
            id: credentials.username,
            name: decoded.name || decoded.email?.split('@')[0] || credentials.username,
            email: decoded.email,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          if (error.name === 'UserNotFoundException' || error.name === 'NotAuthorizedException') {
            throw new Error('Invalid credentials');
          }
          if (error.name === 'UserNotConfirmedException') {
            throw new Error('User is not confirmed');
          }
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.COGNITO_CLIENT_SECRET || "fallback_secret_for_development_only_123",
};
