
// Save this file as: src/app/api/students/route.ts

import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import User from '@/models/User';

// GET all students
export async function GET() {
  try {
    await dbConnect();
    
    // Find all users with role 'student'
    const students = await User.find({ role: 'student' })
      .select('name email phone college group accountStatus registrationDate createdAt')
      .sort({ registrationDate: -1, createdAt: -1 });
    
    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    );
  }   
} 
