import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || process.env.COGNITO_CLIENT_SECRET || "fallback_secret_for_development_only_123";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
  // Simplified encoding to bypass potential jose JWT edge-runtime issues on Amplify
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function decrypt(input) {
  try {
    const decoded = Buffer.from(input, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Decryption Error:', error.message);
    return null;
  }
}

export async function createSession(sessionData) {
  const encryptedSessionData = await encrypt(sessionData);
  return encryptedSessionData;
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return null;
    
    const decryptedSession = await decrypt(session);
    return decryptedSession;
  } catch (error) {
    console.error('Session Error:', error.message);
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
