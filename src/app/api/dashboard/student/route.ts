import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Exam from "@/models/Exam";
import ExamAssignment from "@/models/ExamAssignment";
import { verifyToken } from "@/lib/auth";
import "@/models/Question"; // Ensure Question model is registered
import "@/models/User";     // Ensure User model is registered

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all active exams
    const exams = await Exam.find({ isActive: true })
      .populate("questions")
      .sort({ createdAt: -1 })
      .lean();

    // Get exam assignments for this student
    const assignments = await ExamAssignment.find({ 
      studentId: decoded.id,
      status: 'assigned' 
    })
    .populate('examId')
    .sort({ assignedAt: -1 })
    .lean();

    // Format upcoming exams from assignments
    const upcomingExams = assignments
      .filter((assignment: any) => assignment.examId) // Filter out null exams (deleted/orphaned)
      .map((assignment: any) => ({
        id: assignment.examId._id,
        title: assignment.examId.title,
        category: assignment.examId.category,
        duration: assignment.examId.duration,
        passPercentage: assignment.examId.passPercentage,
        assignedDate: assignment.assignedAt,
        dueDate: assignment.dueDate,
        status: assignment.status,
        questionsCount: assignment.examId.questions?.length || 0
      }));

    // Get available exams (not assigned but active)
    const availableExams = exams
      .filter((exam: any) => 
        !assignments.some((assignment: any) => 
          assignment.examId && // Check if examId exists
          assignment.examId._id.toString() === exam._id.toString()
        )
      )
      .slice(0, 5)
      .map((exam: any) => ({
        id: exam._id,
        title: exam.title,
        category: exam.category,
        duration: exam.duration,
        passPercentage: exam.passPercentage,
        questionsCount: exam.questions?.length || 0,
        status: 'available'
      }));

    // Get exam history (completed exams)
    const completedAssignments = await ExamAssignment.find({ 
      studentId: decoded.id,
      status: { $in: ['completed', 'submitted'] }
    })
    .populate('examId')
    .sort({ submittedAt: -1 })
    .limit(10)
    .lean();

    const examHistory = completedAssignments
      .filter((assignment: any) => assignment.examId) // Filter out null exams
      .map((assignment: any) => ({
        id: assignment.examId._id,
        title: assignment.examId.title,
        category: assignment.examId.category,
        submittedAt: assignment.submittedAt,
        score: assignment.score,
        percentage: assignment.percentage,
        status: assignment.status,
        passed: assignment.passed
      }));

    const studentData = {
      upcomingExams,
      availableExams,
      examHistory,
      stats: {
        totalUpcoming: upcomingExams.length,
        totalAvailable: availableExams.length,
        totalCompleted: examHistory.length,
        averageScore: examHistory.length > 0 
          ? Math.round(examHistory.reduce((sum: number, exam: any) => sum + (exam.percentage || 0), 0) / examHistory.length)
          : 0
      }
    };

    return NextResponse.json(studentData, { status: 200 });
  } catch (error: any) {
    console.error("STUDENT DASHBOARD API ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch student dashboard data" }, { status: 500 });
  }
}
