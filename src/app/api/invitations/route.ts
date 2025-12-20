import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/lib/services/invitation-service';
import { canManageTeam } from '@/lib/utils/permissions';
import { authenticate } from '@/lib/middleware/auth';

// POST /api/invitations - Send invitation
export async function POST(request: NextRequest) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const invitedBy = userIdOrError;

    const body = await request.json();

    if (!body.email || !body.teamId || !body.organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, teamId, and organizationId are required'
        },
        { status: 400 }
      );
    }

    const canManage = await canManageTeam(invitedBy, body.teamId);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const invitation = await invitationService.create({
      email: body.email,
      teamId: body.teamId,
      organizationId: body.organizationId,
      role: body.role || 'member',
      invitedBy
    });

    return NextResponse.json(
      {
        success: true,
        data: invitation,
        message: 'Invitation sent successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send invitation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

// GET /api/invitations?email=xxx or ?teamId=xxx
export async function GET(request: NextRequest) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const teamId = searchParams.get('teamId');

    let invitations;

    if (email) {
      invitations = await invitationService.getByEmail(email);
    } else if (teamId) {
      invitations = await invitationService.getByTeam(teamId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Email or teamId is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: invitations,
        count: invitations.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

