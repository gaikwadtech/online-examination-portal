'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, Calendar, Trophy, Percent, CheckCircle, XCircle, FileText } from 'lucide-react';

interface HistoryItem {
  examId: string;
  title: string;
  category: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  result: 'pass' | 'fail';
  completedAt: string | Date;
}

export default function ResultPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exams/history', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || []);
      } else {
        console.error('Failed to load history', data);
      }
    } catch (err) {
      console.error('Fetch history error', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
     );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Exam History</h1>
          <p className="text-gray-500 mt-1">Track your progress and performance across all exams</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 text-indigo-700 font-medium text-sm flex items-center gap-2">
           <FileText size={18} />
           Total Exams: {history.length}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
             <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No exams completed yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm">It looks like you haven't taken any exams yet. Go to the dashboard to start your first exam!</p>
          <button 
             onClick={() => router.push('/student/exam')}
             className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-md shadow-indigo-200"
          >
            Take an Exam
          </button>
        </div>
      ) : (
        <div className="space-y-4">
           {/* Column Headers (Hidden on mobile, visible on desktop for structure) */}
           <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-sm font-medium text-gray-500">
              <div className="col-span-4">Exam Details</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-3">Performance</div>
              <div className="col-span-2 text-right">Action</div>
           </div>

           {history.map((h) => (
            <div 
              key={h.examId} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300 group grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              {/* Exam Info */}
              <div className="md:col-span-4">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{h.title}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                  {h.category}
                </span>
              </div>

              {/* Date */}
              <div className="md:col-span-3 flex items-center gap-2 text-gray-600">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{new Date(h.completedAt).toLocaleDateString()}</span>
                <span className="text-xs text-gray-400">{new Date(h.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>

              {/* Performance Stats */}
              <div className="md:col-span-3 flex items-center gap-6">
                 <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase font-semibold tracking-wider">
                       <Trophy size={14} className="text-amber-500" /> Score
                    </div>
                    <div className="font-bold text-gray-900">{h.score} <span className="text-gray-400 text-sm">/ {h.totalQuestions}</span></div>
                 </div>
                 
                 <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase font-semibold tracking-wider">
                       <Percent size={14} className="text-blue-500" /> Result
                    </div>
                     <div className={`flex items-center gap-1.5 font-bold ${h.result === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                        {h.result === 'pass' ? (
                           <CheckCircle size={16} /> 
                        ) : (
                           <XCircle size={16} />
                        )}
                        <span className="uppercase text-sm">{Math.round(h.percentage)}% {h.result}</span>
                     </div>
                 </div>
              </div>

              {/* Action */}
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={() => router.push(`/student/result/${h.examId}`)}
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm font-medium text-sm group/btn"
                >
                  View Result
                  <Eye size={16} className="text-gray-400 group-hover/btn:text-indigo-500 transition-colors" />
                </button>
              </div>
            </div>
           ))}
        </div>
      )}
    </div>
  );
}

