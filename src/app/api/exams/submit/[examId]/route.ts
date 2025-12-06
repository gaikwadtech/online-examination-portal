import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import "@/models/Exam";
import "@/models/Question";
import "@/models/ExamAssignment";

import Exam from "@/models/Exam";
import ExamAssignment from "@/models/ExamAssignment";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest, context: any) {
  try {
    await dbConnect();

    // ✅ examId from dynamic route (Next 16: params is a Promise)
    const { examId } = await context.params;

    if (!examId) {
      return NextResponse.json({ error: "Exam ID missing" }, { status: 400 });
    }

    // ✅ auth via cookie token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    const studentId = decoded.id;

    // ✅ get submitted answers
    const body = await req.json();
    const answers: Record<string, string> = body.answers || {};

    // ✅ verify assignment exists
    const assignment: any = await ExamAssignment.findOne({ studentId, examId });
    if (!assignment) {
      return NextResponse.json(
        { error: "Exam not assigned" },
        { status: 403 }
      );
    }

    // ✅ load exam with questions + options
    const exam: any = await Exam.findById(examId).populate("questions");
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // -----------------------------
    // 🧮 SCORING + REVIEW BUILDING
    // -----------------------------
    let score = 0;
    const review: any[] = [];

    exam.questions.forEach((q: any) => {
      const selected = answers[q._id];
      const correctOption = q.options.find((o: any) => o.isCorrect);
      const correctId = correctOption?._id.toString();

      const selectedOption = q.options.find(
        (o: any) => o._id.toString() === selected
      );

      const isCorrect = selected && correctId && selected === correctId;
      if (isCorrect) score++;

      review.push({
        qid: q._id.toString(),
        question: q.text,
        selectedText: selectedOption?.text || "Not answered",
        correctText: correctOption?.text || "",
        correct: !!isCorrect,
      });
    });

    const total = exam.questions.length;
    const percentage = total > 0 ? (score / total) * 100 : 0;
    const passed = percentage >= exam.passPercentage;

    // -----------------------------
    // 💾 SAVE IN ASSIGNMENT
    // -----------------------------
    assignment.status = "completed";
    assignment.score = score;
    assignment.percentage = percentage;
    assignment.passed = passed;
    assignment.completedAt = new Date();
    await assignment.save();

    // -----------------------------
    // 📦 RESPONSE
    // -----------------------------
    return NextResponse.json(
      {
        message: "Exam submitted",
        score,
        total,
        percentage,
        passed,
        review,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Submit exam error:", err);
    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}
