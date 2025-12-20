import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services';
import { authenticate } from '@/lib/middleware/auth';

// GET /api/users - List all users (for searching/inviting)
export async function GET(request: NextRequest) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');

    const users = await userService.getAll({
      search: search || undefined,
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined
    });

    return NextResponse.json(
      {
        success: true,
        data: users,
        count: users.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
