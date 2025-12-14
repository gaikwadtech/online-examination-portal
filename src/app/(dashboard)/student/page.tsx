'use client';

import { useState, useEffect } from 'react';
import { 
  Loader2, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ArrowRight,
  Sparkles
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard/student', {
          method: 'GET',
          credentials: 'include',
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
        } else {
          // Fallback handled by state init
          setStats({ totalUpcoming: 0, totalAvailable: 0, totalCompleted: 0, averageScore: 0 });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
    <div className="min-h-screen bg-gray-50/30 p-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              Student Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">
              Welcome back! Here's your performance overview.
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hidden md:flex items-center gap-2 text-gray-600 font-medium">
            <Calendar size={18} className="text-indigo-500" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Upcoming Exams" 
            value={stats.totalUpcoming} 
            gradient="from-violet-600 to-indigo-600" 
            shadowColor="shadow-indigo-200"
            icon={<BookOpen className="w-6 h-6 text-white" />}
            isLoading={isLoading}
            subtitle="Ready to take"
          />
          <StatCard 
            title="Available Exams" 
            value={stats.totalAvailable} 
            gradient="from-emerald-500 to-teal-500" 
            shadowColor="shadow-emerald-200"
            icon={<Trophy className="w-6 h-6 text-white" />}
            isLoading={isLoading}
            subtitle="Not assigned yet"
          />
          <StatCard 
            title="Average Score" 
            value={`${Math.round(stats.averageScore)}%`} 
            gradient="from-pink-500 to-rose-500" 
            shadowColor="shadow-pink-200"
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            isLoading={isLoading}
            subtitle="Overall performance"
          />
        </div>

        {/* Content Split: Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-indigo-50 rounded-lg">
                    <Sparkles size={18} className="text-indigo-600" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>
              </div>
              <select className="text-sm border-gray-200 rounded-lg text-gray-500 bg-gray-50 p-2 border focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                <option>This Semester</option>
                <option>Last Semester</option>
              </select>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Side List: Upcoming Schedule */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar size={18} className="text-blue-600" />
                 </div>
                <h2 className="text-xl font-bold text-gray-900">Upcoming Schedule</h2>
            </div>
            
            <div className="space-y-4 flex-1">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" /></div>
              ) : (
                <>
                  {upcomingExams.length > 0 ? upcomingExams.map((exam) => (
                    <div key={exam.id} className="group relative overflow-hidden bg-gray-50 p-4 rounded-xl hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 cursor-pointer">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2.5 rounded-lg shadow-sm text-indigo-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                          <BookOpen size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 truncate group-hover:text-indigo-700 transition-colors">
                            {exam.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mt-1.5 gap-3">
                             <span className="flex items-center gap-1"><Clock size={12} /> {exam.duration} mins</span>
                             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                             <span>{exam.questionsCount} Qs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                        <Calendar size={32} />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">No upcoming exams</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <button className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transform hover:-translate-y-0.5">
              View Full Schedule <ArrowRight size={16} />
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, gradient, shadowColor, icon, isLoading, subtitle }: any) {
  return (
    <motion.div 
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      className={`relative overflow-hidden p-6 rounded-2xl shadow-lg ${shadowColor} bg-gradient-to-br ${gradient} text-white group hover:scale-[1.02] transition-transform duration-300`}
    >
      {/* Decorative Background Circles */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-black opacity-5 rounded-full blur-xl"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-4xl font-extrabold tracking-tight">
              {isLoading ? <Loader2 className="animate-spin text-white/50" size={32} /> : value}
            </h3>
          </div>
          {subtitle && (
            <div className="mt-4 inline-flex items-center px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
               {subtitle}
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
