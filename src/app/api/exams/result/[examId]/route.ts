import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import "@/models/ExamResult";
import "@/models/Exam";

import ExamResult from "@/models/ExamResult";
import Exam from "@/models/Exam";
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
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result: any = await ExamResult.findOne({
      examId,
      studentId: decoded.id,
    }).lean();

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const exam = await Exam.findById(examId)
      .select("title category duration passPercentage")
      .lean();

    return NextResponse.json(
      {
        examId,
        title: exam?.title,
        category: exam?.category,
        duration: exam?.duration,
        passPercentage: exam?.passPercentage,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        result: result.result,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        startedAt: result.startedAt || null,
        completedAt: result.completedAt || result.createdAt,
        timeTakenSeconds: result.timeTakenSeconds ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/exams/result/[examId] error:", err);
    return NextResponse.json(
      { error: "Failed to load exam result" },
      { status: 500 }
    );
  }
}
