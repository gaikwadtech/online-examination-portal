import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import "@/models/Exam";
import "@/models/Question";
import "@/models/ExamAssignment";

import Exam from "@/models/Exam";
import ExamAssignment from "@/models/ExamAssignment";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest, context: any) {
  try {
    await dbConnect();

    const { examId } = await context.params; // ✅ FIX

    if (!examId) {
      return NextResponse.json({ error: "Exam ID missing" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = decoded.id;

    const assignment = await ExamAssignment.findOne({ studentId, examId });

    if (!assignment) {
      return NextResponse.json(
        { error: "Exam not assigned" },
        { status: 403 }
      );
    }

    if (assignment.status === "completed") {
      return NextResponse.json(
        { error: "Exam already completed" },
        { status: 400 }
      );
    }

    const exam = await Exam.findById(examId)
      .populate({
        path: "questions",
        select: "-options.isCorrect",
      })
      .lean();

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.isActive === false) {
      return NextResponse.json({ error: "Exam is inactive" }, { status: 400 });
    }

    if (!assignment.startedAt) {
      assignment.startedAt = new Date();
      await assignment.save();
    }

    return NextResponse.json({ exam }, { status: 200 });
  } catch (err) {
    console.error("Start exam error:", err);
    return NextResponse.json(
      { error: "Failed to start exam" },
      { status: 500 }
    );
  }
}
