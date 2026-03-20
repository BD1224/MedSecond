import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = "secret"; // TODO: Move to process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey);

export const auth = {
  /**
   * Securely hashes a plain-text password.
   */
  hashPassword: async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  /**
   * Compares a plain-text password with its hashed version.
   */
  verifyPassword: async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
  },

  /**
   * Signs a new JWT session token.
   */
  encrypt: async (payload: any) => {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h') // Session expires in 2 hours
      .sign(key);
  },

  /**
   * Verifies and decrypts a JWT session token.
   */
  decrypt: async (input: string): Promise<any> => {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  },

  /**
   * Sets the session cookie for the user.
   */
  login: async (user: { id: string, role: string }) => {
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await auth.encrypt({ user, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true });
  },

  /**
   * Removes the session cookie (Logout).
   */
  logout: async () => {
    (await cookies()).set('session', '', { expires: new Date(0) });
  },

  /**
   * Retrieves and verifies the current session from cookies.
   */
  getSession: async () => {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    try {
      return await auth.decrypt(session);
    } catch (e) {
      return null;
    }
  },

  /**
   * Updates the current session if it exists.
   */
  updateSession: async (request: NextRequest) => {
    const session = request.cookies.get('session')?.value;
    if (!session) return;

    const parsed = await auth.decrypt(session);
    parsed.expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
      name: 'session',
      value: await auth.encrypt(parsed),
      httpOnly: true,
      expires: parsed.expires,
    });
    return res;
  },
};
