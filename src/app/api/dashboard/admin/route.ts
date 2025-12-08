import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import User from "@/models/User";
import Exam from "@/models/Exam";
import ExamAssignment from "@/models/ExamAssignment";
import ExamResult from "@/models/ExamResult";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // check auth token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "teacher")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Basic stats
    const totalStudents = await User.countDocuments({ role: "student" });
    const upcomingExams = await Exam.countDocuments({ isActive: true });
    const categories = await Exam.distinct("category");
    const activeCourses = categories.length;

    // completion rate = completed assignments / total assignments
    const totalAssignments = await ExamAssignment.countDocuments();
    const completedAssignments = await ExamAssignment.countDocuments({ status: "completed" });
    const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // average score from ExamResult percentage
    const avgAgg = await ExamResult.aggregate([
      { $group: { _id: null, avg: { $avg: "$percentage" } } },
    ]);
    const avgScore = avgAgg && avgAgg[0] && avgAgg[0].avg ? Math.round(avgAgg[0].avg) : 0;

    // Performance data: last 6 months - exams completed and unique students per month
    const now = new Date();
    const performanceData: Array<any> = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const examsCount = await ExamResult.countDocuments({ createdAt: { $gte: start, $lt: end } });
      const studentsRes = await ExamResult.distinct("studentId", { createdAt: { $gte: start, $lt: end } });

      performanceData.push({
        month: start.toLocaleString("default", { month: "short" }),
        students: studentsRes.length,
        exams: examsCount,
      });
    }

    // Recent activity: latest results
    const recentResults = await ExamResult.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({ path: "examId", select: "title" })
      .lean();

    const recentActivity = recentResults.map((r: any, idx: number) => ({
      id: idx + 1,
      type: "result",
      title: `Result: ${r.examId?.title || "Exam"} - ${r.percentage?.toFixed ? Number(r.percentage).toFixed(0) : r.percentage}%`,
      time: r.completedAt ? new Date(r.completedAt).toLocaleString() : new Date(r.createdAt).toLocaleString(),
      icon: "Activity",
    }));

    // Upcoming exams details (active exams)
    const upcoming = await Exam.find({ isActive: true }).limit(10).lean();
    const upcomingExamsArr = await Promise.all(
      upcoming.map(async (ex: any) => {
        const assigned = await ExamAssignment.countDocuments({ examId: ex._id });
        return {
          id: ex._id?.toString(),
          title: ex.title,
          date: ex.createdAt ? new Date(ex.createdAt).toLocaleDateString() : "TBD",
          students: assigned,
          status: ex.isActive ? "upcoming" : "inactive",
        };
      })
    );

    // Subject distribution: count exams by category
    const examsByCategory = await Exam.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const totalExams = examsByCategory.reduce((s: number, e: any) => s + (e.count || 0), 0) || 1;
    const subjectDistribution = examsByCategory.map((e: any, i: number) => ({
      name: e._id,
      value: Math.round(((e.count || 0) / totalExams) * 100),
      color: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"][i % 4],
    }));

    const payload = {
      stats: {
        totalStudents,
        upcomingExams,
        pendingAnalysis: 0,
        activeCourses,
        completionRate,
        avgScore,
      },
      performanceData,
      recentActivity,
      upcomingExams: upcomingExamsArr,
      subjectDistribution,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error('/api/dashboard/admin error', err);
    return NextResponse.json({ error: `Failed to load dashboard data: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }
}
