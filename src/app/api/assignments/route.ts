import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

// 🔥 Register all models so Mongoose knows them
import "@/models/Exam";
import "@/models/Question";
import "@/models/User";
import "@/models/ExamAssignment";

import ExamAssignment from "@/models/ExamAssignment";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Check auth token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    // Allow only teacher or admin
    if (!decoded || (decoded.role !== "teacher" && decoded.role !== "admin")) {
      console.log("Role mismatch:", decoded?.role);
      return NextResponse.json(
        {
          error: `Forbidden: role is '${decoded?.role}'. Only teachers or admins can assign exams.`,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { examId } = body;

    if (!examId) {
      return NextResponse.json(
        { message: "Exam ID is required" },
        { status: 400 }
      );
    }

    // Find all students
    const students = await User.find({ role: "student" });

    if (!students || students.length === 0) {
      return NextResponse.json(
        { message: "No students found to assign" },
        { status: 404 }
      );
    }

    // Create assignments for each student
    const assignments = students.map((student: any) => ({
      examId,
      studentId: student._id,
      status: "pending",
    }));

    // Insert many (ignore duplicate key errors)
    try {
      await ExamAssignment.insertMany(assignments, { ordered: false });
    } catch (e: any) {
      if (
        e.code !== 11000 &&
        e.writeErrors?.some((err: any) => err.code !== 11000)
      ) {
        throw e;
      }
    }

    return NextResponse.json(
      { message: `Exam assigned to ${students.length} students` },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/assignments error:", err);
    return NextResponse.json(
      { error: "Failed to assign exam" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || decoded.id;

    // If requesting for another student, ensure requester is teacher or admin
    if (
      studentId !== decoded.id &&
      decoded.role !== "teacher" &&
      decoded.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch assignments and populate exam details
    const assignments = await ExamAssignment.find({ studentId })
      .populate("examId") // <-- This needs Exam model registered
      .sort({ createdAt: -1 });

    // Filter out assignments where examId is null
    const validAssignments = assignments.filter((a: any) => a.examId);

    return NextResponse.json(
      { assignments: validAssignments },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/assignments error:", err);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
