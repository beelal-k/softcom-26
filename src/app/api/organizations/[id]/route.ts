import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/services';
import { isOrganizationOwner, hasPermission } from '@/lib/utils/permissions';
import { authenticate } from '@/lib/middleware/auth';

// GET /api/organizations/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    const { id } = await params;
    const organization = await organizationService.getById(id);

    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: organization },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id]
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

    const isOwner = await isOrganizationOwner(userId, id);
    const canWrite = await hasPermission(userId, id, 'org:write');

    if (!isOwner && !canWrite) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const organization = await organizationService.update(id, {
      name: body.name,
      description: body.description
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: organization,
        message: 'Organization updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update organization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { id } = await params;
    const isOwner = await isOrganizationOwner(userId, id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Only owner can delete organization' },
        { status: 403 }
      );
    }

    const deleted = await organizationService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Organization deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
