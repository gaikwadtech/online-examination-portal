import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await dbConnect(); // Connect to the database
    
    return NextResponse.json(
      { message: 'Success: Connected to MongoDB!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { message: 'Error: Failed to connect to MongoDB' },
      { status: 500 }
    );
  }
}