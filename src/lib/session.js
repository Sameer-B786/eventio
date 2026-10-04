import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

// Use Cognito Client Secret as our signing key
const SECRET = new TextEncoder().encode(
  process.env.COGNITO_CLIENT_SECRET || 'fallback_secret_for_development_only_123'
);

export async function createSession({ idToken, accessToken, userInfo }) {
  const cookieStore = await cookies();
  
  // Create a 30-day persistent session token
  const token = await new SignJWT(userInfo)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
  
  cookieStore.set('eventio_session', token, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('eventio_session')?.value;
    if (!token) return null;
    
    // Verify our custom token
    const { payload } = await jwtVerify(token, SECRET);
    
    return {
      userInfo: {
        email: payload.email,
        name: payload.name,
      }
    };
  } catch (error) {
    console.error('Session Error:', error.message);
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set('eventio_session', '', {
    expires: new Date(0),
    httpOnly: true,
    path: '/',
  });
  // Clear old tokens just in case
  cookieStore.set('idToken', '', { expires: new Date(0), path: '/' });
  cookieStore.set('accessToken', '', { expires: new Date(0), path: '/' });
}
