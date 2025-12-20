import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/user';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if google tokens exist (based on schema updates we need to ensure model reflects this)
    // Since mongoose schema is flexible, we can check for the field even if not typed yet, 
    // or we should update the model definition in src/lib/models/user.ts
    const isConnected = !!user.google_drive_access_token;

    return NextResponse.json({
      isConnected
    });

  } catch (error) {
    console.error('Error checking Google status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

