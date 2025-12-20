import { NextRequest, NextResponse } from 'next/server';
import { teamService } from '@/lib/services';
import { authenticate } from '@/lib/middleware/auth';
import { isOrganizationOwner } from '@/lib/utils/permissions';

// GET /api/teams
export async function GET(request: NextRequest) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');

    let teams;

    if (organizationId) {
      teams = await teamService.getByOrganization(organizationId);
    } else {
      teams = await teamService.getByUser(userId);
    }

    return NextResponse.json(
      {
        success: true,
        data: teams,
        count: teams.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST /api/teams
export async function POST(request: NextRequest) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const body = await request.json();

    if (!body.name || !body.description || !body.organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, description, and organizationId are required'
        },
        { status: 400 }
      );
    }

    const isOwner = await isOrganizationOwner(userId, body.organizationId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Only organization owner can create teams' },
        { status: 403 }
      );
    }

    const team = await teamService.create({
      name: body.name,
      description: body.description,
      organizationId: body.organizationId,
      permissions: body.permissions || [],
      createdBy: userId
    });

    return NextResponse.json(
      {
        success: true,
        data: team,
        message: 'Team created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

