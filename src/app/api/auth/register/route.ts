import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/auth/users';
import { hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { UserRegistrationData } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body: UserRegistrationData = await request.json();

    // Validate required fields
    if (!body.username || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 6 characters long'
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await userStorage.findByEmail(body.email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const existingUserByUsername = await userStorage.findByUsername(
      body.username
    );
    if (existingUserByUsername) {
      return NextResponse.json(
        { success: false, error: 'User with this username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    // Create new user
    const newUser = await userStorage.create({
      username: body.username,
      email: body.email,
      password: hashedPassword,
      role: body.role || 'user',
      createdAt: new Date()
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const safeUser = userStorage.toSafeUser(newUser);

    return NextResponse.json(
      {
        success: true,
        token,
        user: safeUser,
        message: 'User registered successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
