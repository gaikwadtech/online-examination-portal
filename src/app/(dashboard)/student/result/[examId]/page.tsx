"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, Clock, XCircle, Trophy, BarChart, Calendar, Timer } from "lucide-react";

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
      <div className="p-8 text-center text-red-600 text-lg font-medium">Result not available.</div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{data.title || 'Exam Result'}</h1>
          <p className="text-gray-500 mt-1 font-medium">{data.category}</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-gray-600 border border-gray-100">
          <Calendar size={18} className="text-indigo-500" />
          <span className="text-sm font-medium">Completed: {new Date(data.completedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-100 mb-2">
              <Trophy size={20} />
              <span className="font-medium text-sm">Total Score</span>
            </div>
            <div className="text-4xl font-bold tracking-tight">{data.score} <span className="text-xl opacity-70 fonte-normal">/ {data.totalQuestions}</span></div>
          </div>
        </div>

        {/* Percentage Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <BarChart size={20} />
              <span className="font-medium text-sm">Performance</span>
            </div>
            <div className="text-4xl font-bold tracking-tight">{Math.round(data.percentage)}%</div>
          </div>
        </div>

        {/* Result Card */}
        <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group ${data.result === 'pass' ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-green-200' : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-200'}`}>
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
          <div className="relative z-10">
             <div className="flex items-center gap-2 text-white/80 mb-2">
              {data.result === 'pass' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              <span className="font-medium text-sm">Outcome</span>
            </div>
            <div className="text-4xl font-bold tracking-tight uppercase">{data.result}</div>
          </div>
        </div>
        
         {/* Time Card */}
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="flex items-center gap-2 text-gray-500 mb-3">
              <Timer size={20} className="text-orange-500" />
              <span className="font-medium text-sm">Time Taken</span>
            </div>
            <div className="text-3xl font-bold text-gray-800 tracking-tight">
               {data.timeTakenSeconds ? 
                `${Math.floor(data.timeTakenSeconds / 60)}m ${data.timeTakenSeconds % 60}s` : 
                data.startedAt ? 
                  `${Math.floor((new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 60000)}m ${((new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) % 60000) / 1000}s` :
                  '-'
              }
            </div>
        </div>
      </div>
      
      {/* Detailed Timeline & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-gray-400" />
                Session Timeline
             </h3>
             <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 font-medium text-sm">Started</span>
                    <span className="font-semibold text-gray-900">{data.startedAt ? new Date(data.startedAt).toLocaleString() : 'N/A'}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 font-medium text-sm">Completed</span>
                    <span className="font-semibold text-gray-900">{new Date(data.completedAt).toLocaleString()}</span>
                 </div>
             </div>
          </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-4">Answer Analysis</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">{data.correctAnswers}</div>
                    <div className="text-sm font-medium text-green-800">Correct</div>
                 </div>
                 <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">{data.wrongAnswers}</div>
                    <div className="text-sm font-medium text-red-800">Incorrect</div>
                 </div>
             </div>
          </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-4 mt-4 pt-4">
         <button 
           onClick={() => router.push('/student/result')} 
           className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 shadow-sm"
         >
           Back to Exams
         </button>
         <button 
           onClick={() => router.push(`/student/result/${examId}/review`)} 
           className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 shadow-lg hover:shadow-xl hover:shadow-violet-200 transition-all duration-300 font-semibold flex items-center gap-2 transform hover:-translate-y-0.5"
         >
           Review Full Answers
           <CheckCircle size={18} />
         </button>
      </div>
    </div>
  );
}
