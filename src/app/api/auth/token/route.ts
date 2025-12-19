import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.name) {
      return NextResponse.json(
        { error: 'User ID and name are required' },
        { status: 400 }
      );
    }

    // Generate JWT token
    const payload = {
      sub: body.userId,
      name: body.name,
      role: body.role || 'admin'
    };

    const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });

    return NextResponse.json(
      { token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
