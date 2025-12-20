import { NextRequest, NextResponse } from 'next/server';
import { teamService } from '@/lib/services';
import { canManageTeam, isTeamMember } from '@/lib/utils/permissions';
import { authenticate } from '@/lib/middleware/auth';

// GET /api/teams/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { id } = await params;
    const team = await teamService.getById(id);

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is a team member or organization owner
    const isMember = await isTeamMember(userId, id);
    const canManage = await canManageTeam(userId, id);
    
    // If not a member and can't manage (not org owner), return limited info
    if (!isMember && !canManage) {
      return NextResponse.json(
        {
          success: true,
          data: {
            _id: team._id,
            name: team.name,
            description: team.description,
            organizationId: team.organizationId,
            membersCount: team.membersCount
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, data: team }, { status: 200 });
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { id } = await params;
    const body = await request.json();

    const canManage = await canManageTeam(userId, id);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const team = await teamService.update(id, {
      name: body.name,
      description: body.description,
      permissions: body.permissions
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: team,
        message: 'Team updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { id } = await params;
    const canManage = await canManageTeam(userId, id);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const deleted = await teamService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Team deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
