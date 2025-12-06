import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import "@/models/ExamAssignment";
import ExamAssignment from "@/models/ExamAssignment";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest, context: any) {
  try {
    await dbConnect();

    const { examId } = await context.params;
    if (!examId) {
      return NextResponse.json({ error: "Exam ID missing" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    const studentId = decoded.id;

    const assignment: any = await ExamAssignment.findOne({ studentId, examId });
    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // 🔄 Reset for retry
    assignment.status = "pending";
    assignment.score = 0;
    assignment.percentage = 0;
    assignment.passed = false;
    assignment.startedAt = null;
    assignment.completedAt = null;
    await assignment.save();

    // Redirect back to exam page
    const redirectUrl = new URL(`/student/exam/${examId}`, req.url);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Retry exam error:", err);
    return NextResponse.json(
      { error: "Failed to reset exam" },
      { status: 500 }
    );
  }
}
