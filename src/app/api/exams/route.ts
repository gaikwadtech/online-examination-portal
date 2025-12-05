import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import Exam from "@/models/Exam";
import Question from "@/models/Question";

// =========================
// GET ALL EXAMS (ADMIN)
// =========================
export async function GET() {
  try {
    await dbConnect();

    const exams = await Exam.find()
      .populate("questions")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ exams }, { status: 200 });
  } catch (error: any) {
    console.error("EXAMS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

// =========================
// CREATE EXAM (ADMIN)
// =========================
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { title, category, duration, passPercentage, questions } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Title and at least one question are required" },
        { status: 400 }
      );
    }

    const newExam = await Exam.create({
      title,
      category,
      duration,
      passPercentage,
      questions,
    });

    return NextResponse.json(
      { message: "Exam created successfully", exam: newExam },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("EXAMS POST ERROR:", error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
