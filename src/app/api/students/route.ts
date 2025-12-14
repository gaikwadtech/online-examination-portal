
// Save this file as: src/app/api/students/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

const serializeStudent = (student: any) => ({
  _id: student._id?.toString(),
  name: student.name,
  email: student.email,
  phone: student.phone ?? "",
  college: student.college ?? "",
  group: student.group ?? "",
  accountStatus: student.accountStatus ?? "Active",
  registrationDate: student.registrationDate,
  createdAt: student.createdAt,
});

// GET all students
export async function GET() {
  try {
    await dbConnect();

    const students = await User.find({ role: "student" })
      .select("name email phone college group accountStatus registrationDate createdAt")
      .sort({ registrationDate: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      students: students.map(serializeStudent),
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST - Create a new student
export async function POST(request: Request) {
  try {
    await dbConnect();

    const {
      name,
      email,
      password,
      phone = "",
      college = "",
      group = "",
      accountStatus = "Active",
      registrationDate,
    } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      phone: phone.trim?.() || phone || "",
      college: college.trim?.() || college || "",
      group: group.trim?.() || group || "",
      accountStatus,
      registrationDate: registrationDate ? new Date(registrationDate) : new Date(),
    });

    return NextResponse.json(
      { success: true, student: serializeStudent(student) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create student" },
      { status: 500 }
    );
  }
}
