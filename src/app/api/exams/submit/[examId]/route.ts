import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import "@/models/Exam";
import "@/models/Question";
import "@/models/ExamAssignment";
import "@/models/ExamResult";

import Exam from "@/models/Exam";
import ExamAssignment from "@/models/ExamAssignment";
import ExamResult from "@/models/ExamResult";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

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
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const studentId = decoded.id;

    // ✅ get submitted answers and optional timeTaken
    const body = await req.json();
    const answers: Record<string, string> = body.answers || {};
    const clientTimeTaken = body.timeTaken; // seconds from client

    // ✅ verify assignment exists and not already completed
    const assignment: any = await ExamAssignment.findOne({ studentId, examId });
    if (!assignment) {
      return NextResponse.json(
        { error: "Exam not assigned" },
        { status: 403 }
      );
    }

    if (assignment.status === "completed") {
      return NextResponse.json(
        { error: "Exam already submitted" },
        { status: 400 }
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
    let correctAnswers = 0;
    let wrongAnswers = 0;
    const review: any[] = [];
    const answerRecords: any[] = [];

    exam.questions.forEach((q: any) => {
      const selected = answers[q._id];
      const correctOption = q.options.find((o: any) => o.isCorrect);
      const correctId = correctOption?._id.toString();

      const selectedOption = q.options.find(
        (o: any) => o._id.toString() === selected
      );

      const isCorrect = selected && correctId && selected === correctId;
      if (isCorrect) {
        score++;
        correctAnswers++;
      } else if (selected) {
        wrongAnswers++;
      }

      review.push({
        qid: q._id.toString(),
        question: q.text,
        selectedText: selectedOption?.text || "Not answered",
        correctText: correctOption?.text || "",
        correct: !!isCorrect,
      });

      answerRecords.push({
        questionId: q._id,
        selectedOptionId: selected ? new mongoose.Types.ObjectId(selected) : null,
        correctOptionId: correctOption?._id || null,
        isCorrect: !!isCorrect,
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
    // 💾 UPSERT EXAM RESULT
    // -----------------------------
    const completedAt = assignment.completedAt || new Date();
    const startedAt = assignment.startedAt || completedAt;
    
    // Use client provided time if available, otherwise fallback to date diff
    // Also cap it at exam duration just in case
    let timeTakenSeconds = 0;
    if (typeof clientTimeTaken === 'number') {
        timeTakenSeconds = clientTimeTaken;
    } else {
        timeTakenSeconds = Math.max(
          0,
          Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)
        );
    }

    await ExamResult.findOneAndUpdate(
      { examId, studentId },
      {
        examId,
        studentId,
        score,
        totalQuestions: total,
        percentage,
        result: passed ? "pass" : "fail",
        correctAnswers,
        wrongAnswers,
        startedAt,
        completedAt,
        timeTakenSeconds,
        answers: answerRecords,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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
