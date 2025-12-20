import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth/jwt';

export function authenticate(request: NextRequest): string | NextResponse {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'No token provided' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  return payload.userId;
}
