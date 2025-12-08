import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import "@/models/Exam";
import "@/models/Question";

import Exam from "@/models/Exam";
import Question from "@/models/Question";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const totalExams = await Exam.countDocuments();
    const activeExams = await Exam.countDocuments({ isActive: true });
    const totalQuestions = await Question.countDocuments();

    // (optional) average pass rate — compute from exams
    const exams = await Exam.find().select("passPercentage").lean();
    const avgPassRate = exams.length
      ? Math.round(exams.reduce((s: any, e: any) => s + (e.passPercentage || 0), 0) / exams.length)
      : 0;

    return NextResponse.json(
      {
        totalExams,
        activeExams,
        totalQuestions,
        avgPassRate,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("/api/exams/stats error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
