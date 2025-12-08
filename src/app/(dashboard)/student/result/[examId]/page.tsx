"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

export default function ExamResultPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (examId) fetchResult();
  }, [examId]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/result/${examId}`);
      const json = await res.json();
      if (res.ok) setData(json);
      else {
        alert(json.error || 'Failed to load result');
        router.push('/student/result');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-red-600">Result not available.</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{data.title || 'Exam Result'}</h1>
          <p className="text-sm text-gray-600">{data.category}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="font-medium">{new Date(data.completedAt).toLocaleString()}</div>
        </div>
      </div>

      {/* Time Information */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Started At</div>
            <div className="font-medium">{data.startedAt ? new Date(data.startedAt).toLocaleString() : 'Not recorded'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Completed At</div>
            <div className="font-medium">{new Date(data.completedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Score</div>
          <div className="text-2xl font-bold">{data.score} / {data.totalQuestions}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Percentage</div>
          <div className="text-2xl font-bold">{Math.round(data.percentage)}%</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between">
          <div>
            <div className="text-sm text-gray-500">Result</div>
            <div className={`text-2xl font-bold ${data.result === 'pass' ? 'text-green-600' : 'text-red-600'}`}>{data.result?.toUpperCase()}</div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Time Taken: {data.timeTakenSeconds ? 
              `${Math.floor(data.timeTakenSeconds / 60)}m ${data.timeTakenSeconds % 60}s` : 
              data.startedAt ? 
                `${Math.floor((new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 60000)}m ${((new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) % 60000) / 1000}s` :
                '-'
            }
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Correct / Wrong</div>
            <div className="text-lg font-medium">{data.correctAnswers} / {data.wrongAnswers}</div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/student/result')} 
              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 font-medium"
            >
              Back
            </button>
            <button 
              onClick={() => router.push(`/student/result/${examId}/review`)} 
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium"
            >
              Review Answers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
