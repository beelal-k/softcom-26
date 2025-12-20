import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/lib/services/invitation-service';
import { teamService, userService } from '@/lib/services';
import { authenticate } from '@/lib/middleware/auth';

// POST /api/invitations/[token]/accept
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { token } = await params;
    const isValid = await invitationService.isValid(token);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invitation is invalid or expired' },
        { status: 400 }
      );
    }

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

    const team = await teamService.addMember(invitation.teamId.toString(), {
      userId: userId,
      role: invitation.role,
      addedBy: invitation.invitedBy.toString()
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Failed to add user to team' },
        { status: 500 }
      );
    }

    await invitationService.accept(token);

    return NextResponse.json(
      {
        success: true,
        data: team,
        message: 'Invitation accepted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

