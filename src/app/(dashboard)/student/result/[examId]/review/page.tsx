"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function ReviewPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (examId) fetchReview();
  }, [examId]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/review/${examId}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        alert(json.error || 'Failed to load review');
        router.push('/student/result');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={36} /></div>
  );

  if (!data) return <div className="p-6 text-center">No review available.</div>;

  const totalQuestions = data.review.length;
  const totalPages = Math.ceil(totalQuestions / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentQuestions = data.review.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review: {data.exam?.title}</h1>
          <p className="text-sm text-gray-600">{data.exam?.category}</p>
        </div>
        <div>
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 font-medium"
          >
            Back
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {currentQuestions.map((q: any, idx: number) => {
          const questionNumber = startIndex + idx + 1;
          
          return (
            <div key={q.questionId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex gap-2">
                <span className="text-indigo-600 font-bold">{questionNumber}.</span> 
                {q.question}
              </h3>
              
              <div className="space-y-3">
                {q.options.map((opt: any) => {
                  const isSelected = opt.id === q.selectedOptionId;
                  const isCorrect = opt.id === q.correctOptionId;
                  
                  // Determine styling based on state
                  let containerClass = "p-3 border rounded-lg flex items-center gap-3 transition-colors ";
                  let icon = null;

                  if (isCorrect) {
                    // Correct answer (whether selected or not)
                    containerClass += "bg-green-50 border-green-200 text-green-800 font-medium";
                    icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                  } else if (isSelected && !isCorrect) {
                    // Wrong answer selected
                    containerClass += "bg-red-50 border-red-200 text-red-800";
                    icon = <XCircle className="w-5 h-5 text-red-600" />;
                  } else {
                    // Neutral option
                    containerClass += "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100";
                    icon = <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>;
                  }

                  return (
                    <div key={opt.id} className={containerClass}>
                      <div className="shrink-0">{icon}</div>
                      <div>{opt.text}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <div className="font-medium">
                   Result: {q.isCorrect ? <span className="text-green-600">Correct</span> : (q.selectedOptionId ? <span className="text-red-600">Incorrect</span> : <span className="text-orange-500">Skipped</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky bottom-4">
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <span className="text-sm font-medium text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === totalPages 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
            }`}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
