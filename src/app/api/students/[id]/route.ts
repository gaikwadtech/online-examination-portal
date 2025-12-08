// Save this file as: src/app/api/students/[id]/route.ts

import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import User from '@/models/User';

// GET single student
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const student = await User.findById(id)
      .select('name email phone college group accountStatus registrationDate createdAt');
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT - Update student
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const { name, email, phone, college, group, accountStatus } = await request.json();
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Check if email is taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: id }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    const updatedStudent = await User.findByIdAndUpdate(
      id,
      { 
        name, 
        email: email.toLowerCase(),
        phone: phone || '',
        college: college || '',
        group: group || '',
        accountStatus: accountStatus || 'Active',
      },
      { new: true }
    ).select('name email phone college group accountStatus registrationDate createdAt');
    
    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const deletedStudent = await User.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}