import { NextRequest, NextResponse } from 'next/server';
import { teamService } from '@/lib/services';
import { canManageTeam } from '@/lib/utils/permissions';
import { authenticate } from '@/lib/middleware/auth';

// POST /api/teams/[id]/permissions - Add permission
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { id } = await params;
    const body = await request.json();

    if (!body.permission) {
      return NextResponse.json(
        { success: false, error: 'Permission is required' },
        { status: 400 }
      );
    }

    const canManage = await canManageTeam(userId, id);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const team = await teamService.addPermission(id, body.permission);

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
        message: 'Permission added successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add permission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add permission' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]/permissions?permission=xxx - Remove permission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permission = searchParams.get('permission');

    if (!permission) {
      return NextResponse.json(
        { success: false, error: 'Permission is required' },
        { status: 400 }
      );
    }

    const canManage = await canManageTeam(userId, id);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const team = await teamService.removePermission(id, permission);

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
        message: 'Permission removed successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove permission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove permission' },
      { status: 500 }
    );
  }
}

