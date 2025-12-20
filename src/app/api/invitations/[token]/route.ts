import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/lib/services/invitation-service';

// GET /api/invitations/[token] - Get invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invitation = await invitationService.getByToken(token);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const isValid = await invitationService.isValid(token);

    return NextResponse.json(
      {
        success: true,
        data: invitation,
        isValid
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get invitation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}

