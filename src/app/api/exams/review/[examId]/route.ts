import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import "@/models/ExamResult";
import "@/models/Exam";
import "@/models/Question";

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

    const result = await ExamResult.findOne({
      examId,
      studentId: decoded.id,
    }).lean();

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const exam: any = await Exam.findById(examId)
      .populate("questions")
      .lean();

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const answerMap = new Map<string, any>();
    (result.answers || []).forEach((a: any) => {
      answerMap.set(a.questionId.toString(), a);
    });

    const review = (exam.questions || []).map((q: any) => {
      const rec = answerMap.get(q._id.toString());
      const selectedOptionId = rec?.selectedOptionId
        ? rec.selectedOptionId.toString()
        : null;
      const correctFromResult = rec?.correctOptionId
        ? rec.correctOptionId.toString()
        : null;
      const correctFromQuestion =
        q.options?.find((o: any) => o.isCorrect)?. _id?.toString() || null;
      const correctOptionId = correctFromResult || correctFromQuestion;

      return {
        questionId: q._id.toString(),
        question: q.text,
        options: (q.options || []).map((o: any) => ({
          id: o._id.toString(),
          text: o.text,
        })),
        selectedOptionId,
        correctOptionId,
        isCorrect: !!rec?.isCorrect,
      };
    });

    return NextResponse.json(
      {
        exam: {
          id: exam._id?.toString(),
          title: exam.title,
          category: exam.category,
          duration: exam.duration,
          passPercentage: exam.passPercentage,
        },
        summary: {
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
        review,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/exams/review/[examId] error:", err);
    return NextResponse.json(
      { error: "Failed to load review" },
      { status: 500 }
    );
  }
}
