import { SignJWT, jwtVerify } from 'jose';
import { IUser } from '@/models/User';

// 1. Get and encode the secret
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
  }
  // We must encode the secret for jose
  return new TextEncoder().encode(secret);
}

/**
 * Creates a new JWT token for a user. (Now async)
 */
export async function createToken(user: IUser) {
  const payload = {
    id: user._id,
    role: user.role,
  };
  
  const secret = getJwtSecret();
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
    
  return token;
}

/**
 * Verifies a JWT token. (Now async)
 */
export async function verifyToken(token: string) {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload; // Will return { id, role, iat, exp }
  } catch (error) {
    // Token is invalid (e.g., expired, wrong signature)
    return null;
  }
}