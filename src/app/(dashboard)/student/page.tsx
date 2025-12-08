'use client';

import { useState, useEffect } from 'react';
import { 
  Loader2, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart (replace with real API data later)
const performanceData = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 72 },
  { month: 'Mar', score: 85 },
  { month: 'Apr', score: 82 },
  { month: 'May', score: 90 },
  { month: 'Jun', score: 88 },
];

export default function StudentDashboardPage() {
  const [stats, setStats] = useState({
    totalUpcoming: 0,
    totalAvailable: 0,
    totalCompleted: 0,
    averageScore: 0
  });
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard/student', {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || {
            totalUpcoming: 0,
            totalAvailable: 0,
            totalCompleted: 0,
            averageScore: 0
          });
          setUpcomingExams(data.upcomingExams || []);
          setAvailableExams(data.availableExams || []);
          setExamHistory(data.examHistory || []);
        } else {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch student dashboard data:', errorData.error || 'Unknown error');
          
          // Set default/empty data to prevent UI breakage
          setStats({
            totalUpcoming: 0,
            totalAvailable: 0,
            totalCompleted: 0,
            averageScore: 0
          });
          setUpcomingExams([]);
          setAvailableExams([]);
          setExamHistory([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Set default/empty data on network errors
        setStats({
          totalUpcoming: 0,
          totalAvailable: 0,
          totalCompleted: 0,
          averageScore: 0
        });
        setUpcomingExams([]);
        setAvailableExams([]);
        setExamHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Student Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Welcome back! Here's what's happening with your studies today.
            </p>
          </div>
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hidden md:block">
            <p className="text-sm font-medium text-gray-500 px-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Upcoming Exams" 
            value={stats.totalUpcoming} 
            color="blue" 
            icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            isLoading={isLoading}
            subtitle="Ready to take"
          />
          <StatCard 
            title="Available Exams" 
            value={stats.totalAvailable} 
            color="green" 
            icon={<Trophy className="w-6 h-6 text-green-600" />}
            isLoading={isLoading}
            subtitle="Not assigned yet"
          />
          <StatCard 
            title="Average Score" 
            value={`${stats.averageScore}%`} 
            color="purple" 
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            isLoading={isLoading}
            subtitle="Overall performance"
          />
        </div>

        {/* Content Split: Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area (Takes up 2 columns) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>
              <select className="text-sm border-gray-200 rounded-md text-gray-500 bg-gray-50 p-1 border">
                <option>This Semester</option>
                <option>Last Semester</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Side List: Upcoming Schedule */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Schedule</h2>
            
            <div className="space-y-4 flex-1">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" /></div>
              ) : (
                <>
                  {upcomingExams.length > 0 ? upcomingExams.map((exam) => (
                    <div key={exam.id} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                        <Calendar size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {exam.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                           <Clock size={12} /> 
                           <span>{exam.duration} minutes</span>
                           <span>•</span>
                           <span>{exam.questionsCount} questions</span>
                        </div>
                        {exam.dueDate && (
                          <div className="text-xs text-orange-600 mt-1">
                            Due: {new Date(exam.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm">No upcoming exams scheduled</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <button className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105">
              View Full Schedule <ArrowRight size={16} />
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, color, icon, isLoading, subtitle }: any) {
  const colorStyles: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <motion.div 
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : value}
            </h3>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
      {subtitle && (
        <p className="mt-4 text-xs font-medium text-gray-400 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}