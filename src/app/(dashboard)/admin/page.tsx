"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Clock, 
  Activity,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ReactElement } from 'react';
import ExamCreationModal from '@/components/ExamCreationModal';
import ReportButton from '@/components/ReportButton';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    upcomingExams: 0,
    pendingAnalysis: 0,
    activeCourses: 0,
    completionRate: 0,
    avgScore: 0
  });

  const [performanceData, setPerformanceData] = useState<Array<{
    month: string;
    students: number;
    exams: number;
  }>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: number;
    type: string;
    title: string;
    time: string;
    icon: string;
  }>>([]);
  const [upcomingExams, setUpcomingExams] = useState<Array<{
    id: number;
    title: string;
    date: string;
    students: number;
    status: string;
  }>>([]);
  const [subjectDistribution, setSubjectDistribution] = useState([
    { name: 'Mathematics', value: 0, color: '#4f46e5' },
    { name: 'Science', value: 0, color: '#10b981' },
    { name: 'English', value: 0, color: '#f59e0b' },
    { name: 'History', value: 0, color: '#ef4444' },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all dashboard data from single API endpoint with credentials
      const dashboardRes = await fetch('/api/dashboard/admin', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        
        // Update all states with the fetched data
        setStats(data.stats || {
          totalStudents: 0,
          upcomingExams: 0,
          pendingAnalysis: 0,
          activeCourses: 0,
          completionRate: 0,
          avgScore: 0
        });
        setPerformanceData(data.performanceData || []);
        setRecentActivity(data.recentActivity || []);
        setUpcomingExams(data.upcomingExams || []);
        setSubjectDistribution(data.subjectDistribution || [
          { name: 'Mathematics', value: 0, color: '#4f46e5' },
          { name: 'Science', value: 0, color: '#10b981' },
          { name: 'English', value: 0, color: '#f59e0b' },
          { name: 'History', value: 0, color: '#ef4444' },
        ]);
      } else {
        const errorData = await dashboardRes.json().catch(() => ({ error: 'Unknown error' }));
        
        // Handle different error status codes
        if (dashboardRes.status === 401) {
          setError('Unauthorized: Please log in again');
          console.error('Unauthorized: Please log in again');
        } else if (dashboardRes.status === 403) {
          setError('Forbidden: You do not have permission to access this dashboard');
          console.error('Forbidden: You do not have permission to access this dashboard');
        } else {
          const errorMsg = errorData.error || 'Failed to fetch dashboard data';
          setError(errorMsg);
          console.error('Failed to fetch dashboard data:', errorMsg);
        }
        
        // Set default/empty data to prevent UI breakage
        setStats({
          totalStudents: 0,
          upcomingExams: 0,
          pendingAnalysis: 0,
          activeCourses: 0,
          completionRate: 0,
          avgScore: 0
        });
        setPerformanceData([]);
        setRecentActivity([]);
        setUpcomingExams([]);
        setSubjectDistribution([
          { name: 'Mathematics', value: 0, color: '#4f46e5' },
          { name: 'Science', value: 0, color: '#10b981' },
          { name: 'English', value: 0, color: '#f59e0b' },
          { name: 'History', value: 0, color: '#ef4444' },
        ]);
      }

    } catch (error: any) {
      const errorMsg = error?.message || 'Network error: Unable to connect to server';
      setError(errorMsg);
      console.error('Error fetching dashboard data:', error);
      
      // Set default/empty data on network errors
      setStats({
        totalStudents: 0,
        upcomingExams: 0,
        pendingAnalysis: 0,
        activeCourses: 0,
        completionRate: 0,
        avgScore: 0
      });
      setPerformanceData([]);
      setRecentActivity([]);
      setUpcomingExams([]);
      setSubjectDistribution([
        { name: 'Mathematics', value: 0, color: '#4f46e5' },
        { name: 'Science', value: 0, color: '#10b981' },
        { name: 'English', value: 0, color: '#f59e0b' },
        { name: 'History', value: 0, color: '#ef4444' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render icons based on string name
  const renderIcon = (iconName: string) => {
    const iconProps = { className: "w-4 h-4" };
    switch (iconName) {
      case 'Calendar':
        return <Calendar {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      case 'BarChart3':
        return <BarChart3 {...iconProps} />;
      case 'Activity':
        return <Activity {...iconProps} />;
      default:
        return <Activity {...iconProps} />;
    }
  };

  const handleExamCreated = () => {
    fetchDashboardData(); // Refresh dashboard data
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto p-8 space-y-8"
        >
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome back! Here's what's happening across your institution today.
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm max-w-md"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">⚠️ Error:</span>
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="mt-2 text-red-600 hover:text-red-800 underline text-xs"
                >
                  Try again
                </button>
              </motion.div>
            )}
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button aria-label="Notifications" className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-200 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button aria-label="Settings" className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 hover:border-indigo-200 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalStudents}</h3>
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" /> 12%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">+15 from last month</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Upcoming Exams</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900">{stats.upcomingExams}</h3>
                    <span className="text-xs font-medium text-orange-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> This week
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">3 scheduled today</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Analysis</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900">{stats.pendingAnalysis}</h3>
                    <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                      <ArrowDown className="w-3 h-3" /> 3 new
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Requires attention</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Score</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900">{stats.avgScore}%</h3>
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" /> 5%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Above target</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Performance Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>
                <select className="text-sm border-gray-200 rounded-md text-gray-500 bg-gray-50 p-2 border">
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
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
                      dataKey="students" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorStudents)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Subject Distribution */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Subject Distribution</h2>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {subjectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {subjectDistribution.map((subject) => (
                  <div key={subject.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></div>
                      <span className="text-gray-600">{subject.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{subject.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity & Upcoming Exams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Activity */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {renderIcon(activity.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <button aria-label="More options" className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Exams */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Exams</h2>
                <button aria-label="Add new exam" className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{exam.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {exam.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {exam.students} students
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          exam.status === 'upcoming' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {exam.status}
                        </span>
                        <button aria-label="View exam details" className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-2xl shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                <p className="text-blue-100 mt-2">Create exams, manage students, or generate reports</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowExamModal(true)}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Exam
                </button>
                <button 
                  onClick={() => router.push('/admin/student-management')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Add Students
                </button>
                <ReportButton 
                  examsList={upcomingExams.map(e => ({
                    _id: e.id ? e.id.toString() : '',
                    title: e.title,
                    date: e.date
                  }))}
                  allResults={[]}
                />
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}
      
      {/* Exam Creation Modal */}
      <ExamCreationModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        onExamCreated={handleExamCreated}
      />
    </div>
  );
}
