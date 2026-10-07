import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";

export async function getSession() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;
    
    return {
      userInfo: {
        email: session.user.email,
        name: session.user.name,
        id: session.user.id,
      }
    };
  } catch (error) {
    console.error('Session Error:', error.message);
    return null;
  }
}

// Stubs for backwards compatibility if needed
export async function createSession() {
  console.warn("createSession is deprecated. NextAuth handles this automatically.");
}

export async function clearSession() {
  console.warn("clearSession is deprecated. Use signOut() from next-auth/react on the client.");
}
