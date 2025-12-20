import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/services';
import { authenticate } from '@/lib/middleware/auth';

// GET /api/organizations
export async function GET(request: NextRequest) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');

    const organizations = await organizationService.getAll({
      owner: owner || undefined,
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined
    });

    return NextResponse.json(
      {
        success: true,
        data: organizations,
        count: organizations.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations
export async function POST(request: NextRequest) {
  try {
    const userIdOrError = authenticate(request);
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const body = await request.json();

    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const organization = await organizationService.create({
      name: body.name,
      description: body.description,
      owner: userId,
      industry: body.industry,
      company_size: body.company_size,
      website: body.website
    });

    return NextResponse.json(
      {
        success: true,
        data: organization,
        message: 'Organization created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
