'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye } from 'lucide-react';

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Exam History</h1>
        <p className="text-sm text-gray-600">All completed exams and results</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center shadow">
          <p className="text-lg text-gray-700">No exam history found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Exam</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">% </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Result</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.examId} className="border-t">
                  <td className="px-4 py-3 text-sm text-gray-800">{h.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(h.completedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{h.score} / {h.totalQuestions}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{Math.round(h.percentage)}%</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${h.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {h.result.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/student/result/${h.examId}`)}
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
