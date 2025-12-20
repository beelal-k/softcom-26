import { NextRequest, NextResponse } from 'next/server';
import { teamService } from '@/lib/services';
import { canManageTeam } from '@/lib/utils/permissions';
import { authenticate } from '@/lib/middleware/auth';

// POST /api/teams/[id]/members - Add member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const addedBy = userIdOrError;
    console.log('addedBy', addedBy);

    const { id } = await params;
    const body = await request.json();

    if (!body.userId || !body.role) {
      return NextResponse.json(
        { success: false, error: 'userId and role are required' },
        { status: 400 }
      );
    }

    const canManage = await canManageTeam(addedBy, id);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const team = await teamService.addMember(id, {
      userId: body.userId,
      role: body.role,
      addedBy
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
        message: 'Member added successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]/members?userId=xxx - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const removedBy = userIdOrError;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const canManage = await canManageTeam(removedBy, id);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const team = await teamService.removeMember(id, userId);

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
        message: 'Member removed successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/[id]/members - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const updatedBy = userIdOrError;

    const { id } = await params;
    const body = await request.json();

    if (!body.userId || !body.role) {
      return NextResponse.json(
        { success: false, error: 'userId and role are required' },
        { status: 400 }
      );
    }

    const canManage = await canManageTeam(updatedBy, id);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const team = await teamService.updateMemberRole(id, body.userId, body.role);

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team or member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: team,
        message: 'Member role updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update member role error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}
