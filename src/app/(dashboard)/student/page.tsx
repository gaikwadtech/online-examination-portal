'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function StudentDashboardPage() {
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    rank: 0 // Placeholder
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/assignments');
        const data = await res.json();
        if (res.ok) {
          const assignments = data.assignments || [];
          const upcoming = assignments.filter((a: any) => a.status === 'pending').length;
          const completed = assignments.filter((a: any) => a.status === 'completed').length;
          setStats(prev => ({ ...prev, upcoming, completed }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-black">Student Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Welcome! Check your exams, results, and performance analysis.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-black">Upcoming Exam</h2>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {isLoading ? <Loader2 className="animate-spin inline" size={24} /> : stats.upcoming}
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-black">Results Published</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">
             {isLoading ? <Loader2 className="animate-spin inline" size={24} /> : stats.completed}
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-black">Performance Rank</h2>
          <p className="mt-2 text-3xl font-bold text-purple-600">#7</p>
        </div>

      </div>
    </div>
  );
}