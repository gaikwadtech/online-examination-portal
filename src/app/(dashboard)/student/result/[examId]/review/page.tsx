"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ReviewPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (examId) fetchReview();
  }, [examId]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/review/${examId}`);
      const json = await res.json();
      if (res.ok) setData(json);
      else {
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
        {data.review.map((q: any, idx: number) => (
          <div key={q.questionId} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-gray-900 mb-3">{idx+1}. {q.question}</h3>
            <div className="space-y-2">
              {/* Show only selected option if correct */}
              {q.isCorrect && q.selectedOptionId && (
                <div className="p-3 border border-green-300 rounded bg-green-50">
                  <div className="flex items-center gap-3"> 
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <div className="text-gray-800">
                      {q.options.find((opt: any) => opt.id === q.selectedOptionId)?.text}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show selected (incorrect) and correct options if wrong */}
              {!q.isCorrect && (
                <>
                  {q.selectedOptionId && (
                    <div className="p-3 border border-red-300 rounded bg-red-50">
                      <div className="flex items-center gap-3"> 
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <div className="text-gray-800">
                          {q.options.find((opt: any) => opt.id === q.selectedOptionId)?.text}
                        </div>
                      </div>
                    </div>
                  )}
                  {q.correctOptionId && (
                    <div className="p-3 border border-green-300 rounded bg-green-50">
                      <div className="flex items-center gap-3"> 
                        <div className="w-3 h-3 rounded-full bg-green-600"></div>
                        <div className="text-gray-800">
                          {q.options.find((opt: any) => opt.id === q.correctOptionId)?.text}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Show not answered */}
              {!q.selectedOptionId && (
                <div className="p-3 border border-gray-300 rounded bg-gray-50">
                  <div className="text-gray-500">Not answered</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
