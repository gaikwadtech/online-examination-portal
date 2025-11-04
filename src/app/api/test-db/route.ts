import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // (Assuming your db connection file is at /lib/dbConnect.ts)

export async function GET() {
  try {
    await dbConnect();
    // If connection is successful
    return NextResponse.json({ message: 'Success: Database connected' }, { status: 200 });
  } catch (error) {
    // If connection fails
    console.error('Database connection error:', error);
    return NextResponse.json({ message: 'Error: Failed to connect to database' }, { status: 500 });
  }
}