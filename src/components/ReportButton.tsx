'use client';

import React, { useState } from 'react';
import { Download, X, FileText } from 'lucide-react';
import { generateExamPDF, ExamMeta, StudentData } from '../lib/pdfUtils';

// Input Props Interfaces (Assumed shape based on common patterns, adjustable)
interface ExamOption {
  _id: string; // or string
  title: string;
  date: string; // ISO string or formatted
}

interface ResultRecord {
  examId: string;
  studentName: string;
  studentId: string;
  marksObtained: number;
  totalMarks: number;
  percentage?: number;
  status?: string;
}

interface ReportButtonProps {
  examsList: ExamOption[];
  allResults: ResultRecord[];
}

const ReportButton: React.FC<ReportButtonProps> = ({ examsList, allResults = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExamId('');
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!selectedExamId) return;

    const selectedExam = examsList.find(e => e._id === selectedExamId);
    if (!selectedExam) return;

    setIsLoading(true);

    try {
      // 1. Try to find results in props first
      let examResults = allResults.filter(r => r.examId === selectedExamId);

      // 2. If no results in props, fetch from API
      if (examResults.length === 0) {
        console.log("Fetching results for exam:", selectedExamId);
        const res = await fetch(`/api/admin/reports/exam-results/${selectedExamId}`);
        if (res.ok) {
          const data = await res.json();
          examResults = data.results || [];
        } else {
          console.error("Failed to fetch results");
        }
      }

      if (examResults.length === 0) {
        alert("No results found for this exam.");
        setIsLoading(false);
        return;
      }

      // Calculate Stats
      const totalStudents = examResults.length;
      // Handle cases where totalMarks might be 0 to avoid division by zero
      const highestScore = Math.max(...examResults.map(r => r.marksObtained));
      const totalScoreSum = examResults.reduce((sum, r) => sum + r.marksObtained, 0);
      const classAverage = totalStudents > 0 ? totalScoreSum / totalStudents : 0;

      const examMeta: ExamMeta = {
        examTitle: selectedExam.title,
        date: new Date(selectedExam.date).toLocaleDateString(),
        classAverage,
        totalStudents,
        highestScore: highestScore === -Infinity ? 0 : highestScore,
      };

      // Map to StudentData
      const studentData: StudentData[] = examResults.map(r => {
        // Use percentage from record if available, else calc
        const percentage = r.percentage !== undefined 
          ? r.percentage 
          : (r.totalMarks ? (r.marksObtained / r.totalMarks) * 100 : 0);
          
        return {
          name: r.studentName,
          studentId: r.studentId,
          score: r.marksObtained,
          percentage: percentage,
          status: (typeof r.status === 'string') ? r.status as 'Pass' | 'Fail' : (percentage >= 35 ? 'Pass' : 'Fail'),
        };
      });

      generateExamPDF(examMeta, studentData);
      handleCloseModal();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the report.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
      >
        <Download className="w-4 h-4" />
        Generate Report
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Generate Exam Report
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Exam
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="" disabled>-- Choose an exam --</option>
                  {examsList.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Select an exam to download the performance summary and student list.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={!selectedExamId || isLoading}
                className={`px-4 py-2 text-white font-medium rounded-lg flex items-center gap-2 transition-all ${
                  selectedExamId && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                   <span className="flex items-center gap-2">Processing...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;
