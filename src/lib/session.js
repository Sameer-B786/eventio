import { cookies } from 'next/headers';
import { decodeJwt, jwtVerify, createRemoteJWKSet } from 'jose';

// Lazy-load JWKS to ensure process.env is fully initialized by Next.js
let JWKS;
function getJWKS() {
  if (!JWKS) {
    JWKS = createRemoteJWKSet(
      new URL(`https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`),
      { timeoutDuration: 15000 }
    );
  }
  return JWKS;
}

export async function createSession({ idToken, accessToken }) {
  const cookieStore = await cookies();
  const decoded = decodeJwt(idToken);
  
  cookieStore.set('idToken', idToken, {
    expires: new Date(decoded.exp * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  if (accessToken) {
    cookieStore.set('accessToken', accessToken, {
      expires: new Date(decoded.exp * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get('idToken')?.value;
    if (!idToken) return null;
    
    // Cryptographically verify the token
    const { payload } = await jwtVerify(idToken, getJWKS(), {
      issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    });
    
    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    const accessToken = cookieStore.get('accessToken')?.value;
    
    return {
      userInfo: {
        email: payload.email,
        name: payload.name || payload.email?.split('@')[0],
      },
      accessToken
    };
  } catch (error) {
    console.error('Session Error:', error.message);
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set('idToken', '', {
    expires: new Date(0),
    httpOnly: true,
    path: '/',
  });
  cookieStore.set('accessToken', '', {
    expires: new Date(0),
    httpOnly: true,
    path: '/',
  });
}
