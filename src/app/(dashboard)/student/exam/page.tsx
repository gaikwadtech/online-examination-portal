"use client";

import { useState, useEffect } from "react";
import { Clock, Award, BookOpen, PlayCircle, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

interface ExamAssignment {
  _id: string;
  examId: {
    _id: string;
    title: string;
    category: string;
    duration: number;
    passPercentage: number;
    questions: string[];
  };
  status: "pending" | "completed";
  assignedAt: string;
}

export default function StudentExamsPage() {
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/assignments", {
        method: "GET",
        credentials: "include", // send cookie token
      });

      const data = await res.json();

      if (res.ok) {
        setAssignments(data.assignments || []);
      } else {
        console.error("Failed to fetch assignments:", data.error);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Exams</h1>
        <p className="text-gray-600 mt-1">View and take your assigned exams.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <h3 className="text-lg font-medium text-gray-900">No Exams Assigned</h3>
          <p className="text-gray-600 mt-1">
            You don&apos;t have any pending exams at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => {
            const exam = assignment.examId;
            if (!exam) return null; // in case exam deleted

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className="text-lg font-semibold text-gray-900 line-clamp-1"
                      title={exam.title}
                    >
                      {exam.title}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium mt-1 inline-block">
                      {exam.category}
                    </span>
                  </div>

                  <div
                    className={`p-2 rounded-full ${
                      assignment.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {assignment.status === "completed" ? (
                      <CheckCircle size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-700 mb-6 flex-1">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span>{exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-500" />
                    <span>{exam.questions?.length || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-gray-500" />
                    <span>Pass: {exam.passPercentage}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {assignment.status === "pending" ? (
                    <Link
                      href={`/student/exam/${exam._id}`} // ✅ IMPORTANT
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                    >
                      <PlayCircle size={18} />
                      Start Exam
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                    >
                      <CheckCircle size={18} />
                      Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
