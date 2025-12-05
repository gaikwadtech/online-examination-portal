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

// POST - Create new student
export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { name, email, phone, college, group } = await request.json();
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Create new student with default password (you may want to send email for password setup)
    const newStudent = await User.create({
      name,
      email: email.toLowerCase(),
      password: 'defaultPassword123', // You should hash this or implement email verification
      role: 'student',
      phone: phone || '',
      college: college || '',
      group: group || '',
      accountStatus: 'Active',
      registrationDate: new Date(),
    });
    
    // Return student without password
    const studentResponse = {
      _id: newStudent._id,
      name: newStudent.name,
      email: newStudent.email,
      phone: newStudent.phone,
      college: newStudent.college,
      group: newStudent.group,
      accountStatus: newStudent.accountStatus,
      registrationDate: newStudent.registrationDate,
      createdAt: newStudent.createdAt,
    };
    
    return NextResponse.json({ success: true, student: studentResponse });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create student' },
      { status: 500 }
    );
  }
}