import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { userStorage } from '@/lib/auth/users';
import { hashPassword } from '@/lib/auth/password';
import { UserRegistrationData } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body: UserRegistrationData = await request.json();

    // Validate required fields
    if (!body.username || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 6 characters)
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserByEmail = await userStorage.findByEmail(body.email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const existingUserByUsername = await userStorage.findByUsername(
      body.username
    );
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'User with this username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    // Create new user
    const newUser = await userStorage.create({
      id: uuidv4(),
      username: body.username,
      email: body.email,
      password: hashedPassword,
      role: body.role || 'user', // Default role is 'user'
      createdAt: new Date()
    });

    // Return user without password
    const safeUser = userStorage.toSafeUser(newUser);

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: safeUser
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
