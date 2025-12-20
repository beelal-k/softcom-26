import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/lib/services/invitation-service';
import { userService } from '@/lib/services';
import { authenticate } from '@/lib/middleware/auth';

// POST /api/invitations/[token]/reject
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { token } = await params;
    const invitation = await invitationService.getByToken(token);
    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const user = await userService.getById(userId);
    if (!user || user.email !== invitation.email) {
      return NextResponse.json(
        { success: false, error: 'User email does not match invitation' },
        { status: 403 }
      );
    }

    const rejected = await invitationService.reject(token);
    if (!rejected) {
      return NextResponse.json(
        { success: false, error: 'Failed to reject invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Invitation rejected successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reject invitation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject invitation' },
      { status: 500 }
    );
  }
}

