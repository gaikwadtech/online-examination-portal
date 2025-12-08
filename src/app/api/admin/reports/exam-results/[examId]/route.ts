import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ExamResult from "@/models/ExamResult";
import User from "@/models/User";
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
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "teacher")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const results = await ExamResult.find({ examId })
      .populate({
        path: "studentId",
        select: "name email studentId",
        model: User
      })
      .sort({ score: -1 })
      .lean();

    // Transform to match ResultRecord interface expected by frontend
    const formattedResults = results.map((r: any) => ({
      examId: r.examId,
      studentName: r.studentId?.name || "Unknown",
      studentId: r.studentId?.studentId || r.studentId?._id?.toString(),
      marksObtained: r.score,
      totalMarks: r.totalQuestions, // Assuming 1 mark per question for now if not available, or we can use percentage
      percentage: r.percentage,
      status: r.result === "pass" ? "Pass" : "Fail" // Or use calculation
    }));

    return NextResponse.json({ results: formattedResults }, { status: 200 });

  } catch (err) {
    console.error("GET /api/admin/reports/exam-results/[examId] error:", err);
    return NextResponse.json(
      { error: "Failed to load exam results" },
      { status: 500 }
    );
  }
}
