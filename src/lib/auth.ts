import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? 'swiftbus-dev-secret';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: string;   // e.g. "U2024001234"
  dbId: number;     // numeric PK in users table
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Admin emails that get the admin role on registration */
export const ADMIN_EMAILS = new Set([
  'ezedinmoh1@gmail.com',
]);

export function generateUserId(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  return `U${year}${rand}`;
}
