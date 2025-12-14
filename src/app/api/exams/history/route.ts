import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import "@/models/ExamResult";
import "@/models/Exam";

import ExamResult from "@/models/ExamResult";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const results = await ExamResult.find({ studentId: decoded.id })
      .populate({
        path: "examId",
        select: "title category duration passPercentage",
      })
      .sort({ completedAt: -1, createdAt: -1 })
      .lean();

    const history = results
      .filter((r: any) => !!r.examId)
      .map((r: any) => ({
        examId: r.examId._id?.toString(),
        title: r.examId.title,
        category: r.examId.category,
        duration: r.examId.duration,
        passPercentage: r.examId.passPercentage,
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        result: r.result,
        correctAnswers: r.correctAnswers,
        wrongAnswers: r.wrongAnswers,
        completedAt: r.completedAt || r.createdAt,
        timeTakenSeconds: r.timeTakenSeconds,
      }));

    return NextResponse.json({ history }, { status: 200 });
  } catch (err) {
    console.error("GET /api/exams/history error:", err);
    return NextResponse.json(
      { error: "Failed to load exam history" },
      { status: 500 }
    );
  }
}
