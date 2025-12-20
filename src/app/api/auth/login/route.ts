import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/auth/users';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { UserLoginData } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body: UserLoginData = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await userStorage.findByEmail(body.email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(body.password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const safeUser = userStorage.toSafeUser(user);

    return NextResponse.json(
      {
        success: true,
        token,
        user: safeUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
