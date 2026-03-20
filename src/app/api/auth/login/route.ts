import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * Handle user login.
 * 1. Validates input presence.
 * 2. Fetches user from DB.
 * 3. Verifies password.
 * 4. Creates a secure session.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Fetch user from database
    const result = await db.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    // Check if user exists and password is correct
    if (!user || !(await auth.verifyPassword(password, user.password_hash))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create secure session (sets HTTP-only cookie)
    await auth.login({ id: user.id, role: user.role });

    return NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
