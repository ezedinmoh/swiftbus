import { cookies } from 'next/headers';
import { verifyToken, JwtPayload } from './auth';

/**
 * Get the current user's JWT payload from the cookie.
 * Use this in Server Components and Route Handlers.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Require authentication in a Server Component.
 * Returns the session payload or null (caller should redirect).
 */
export async function requireSession(): Promise<JwtPayload | null> {
  return getSession();
}
