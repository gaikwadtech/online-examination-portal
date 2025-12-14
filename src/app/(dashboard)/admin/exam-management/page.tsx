"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Save,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  Loader2,
  Users,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Calendar,
  BarChart2,
  Sliders,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  PlusCircle,
  ListChecks,
  Clock3,
  Percent,
  Type,
  BookMarked,
  FileText,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Play,
  Pause,
  Eye,
  FileQuestion,
  ListTodo,
  Timer,
  UserCheck,
  FileCheck2,
  BarChart
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Modal from "@/components/ui/Modal";

// Types
interface Question {
  _id: string;
  text: string;
  category: string;
  options: Array<{
    _id: string;
    text: string;
    isCorrect: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  category: string;
  duration: number;
  passPercentage: number;
  questions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questionCount?: number;
  assignedCount?: number;
}

export default function ExamManagementPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  // Exam form state
  const [examData, setExamData] = useState({
    title: "",
    description: "",
    category: "",
    duration: 30,
    passPercentage: 60,
    isActive: true,
  });

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  
  // Fetch questions when creating exam starts
  useEffect(() => {
    if (isCreating) {
      fetchQuestions();
    } else {
      setFilteredQuestions([]);
      setSearchTerm("");
      setFilterCategory("all");
    }
  }, [isCreating]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Exam; direction: 'asc' | 'desc' } | null>({
    key: 'createdAt',
    direction: 'desc'
  });

  // Loading states
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Data
  const [categories, setCategories] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    activeExams: 0,
    totalQuestions: 0,
    avgPassRate: 0,
  });

  // UI State
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);
  const [selectedExamForAction, setSelectedExamForAction] = useState<string | null>(null);
  const [examToAssign, setExamToAssign] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchExams();
    fetchQuestions();
    fetchCategories();
  }, []);

  // Update filtered exams when filters change
  useEffect(() => {
    let result = [...exams];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(exam => 
        exam.title.toLowerCase().includes(term) || 
        exam.category.toLowerCase().includes(term) ||
        exam.description?.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (filterCategory && filterCategory !== 'all') {
      result = result.filter(exam => exam.category === filterCategory);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter(exam => exam.isActive === isActive);
    }
    
    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === undefined || bVal === undefined) return 0;
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredExams(result);
  }, [exams, searchTerm, filterCategory, statusFilter, sortConfig]);

  // Refetch questions when search or filter changes (only when creating exam)
  useEffect(() => {
    if (isCreating) {
      // Debounce search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchQuestions();
      }, 300); // Wait 300ms after user stops typing
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, filterCategory, isCreating]);

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/questions/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExams = async () => {
    setIsLoadingExams(true);
    try {
      const [examsRes, statsRes] = await Promise.all([
        fetch("/api/exams"),
        fetch("/api/exams/stats")
      ]);
      
      if (examsRes.ok) {
        const data = await examsRes.json();
        // Add questionCount to each exam for display
        const examsWithCounts = data.exams.map((exam: any) => ({
          ...exam,
          questionCount: exam.questions?.length || 0
        }));
        setExams(examsWithCounts || []);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      console.error("Failed to load exams. Please try again.");
    } finally {
      setIsLoadingExams(false);
    }
  };

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory && filterCategory !== 'all' && filterCategory !== '') {
        params.append("category", filterCategory);
      }
      if (searchTerm && searchTerm.trim() !== '') {
        params.append("q", searchTerm.trim());
      }
      params.append("pageSize", "1000");

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        const fetchedQuestions = (data.data || []).map((q: any) => ({
          _id: q.id || q._id,
          text: q.text,
          category: q.category,
          options: q.options || [],
          createdAt: q.createdAt,
          updatedAt: q.updatedAt || q.createdAt,
        }));
        setQuestions(fetchedQuestions);
        // Apply client-side filtering
        let filtered = [...fetchedQuestions];
        if (filterCategory && filterCategory !== 'all' && filterCategory !== '') {
          filtered = filtered.filter(q => 
            q.category.toLowerCase() === filterCategory.toLowerCase()
          );
        }
        if (searchTerm && searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase().trim();
          filtered = filtered.filter(q => 
            q.text.toLowerCase().includes(term) ||
            q.category.toLowerCase().includes(term)
          );
        }
        setFilteredQuestions(filtered);
      } else {
        console.error("Failed to fetch questions:", data.error);
        setQuestions([]);
        setFilteredQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Apply client-side filtering when questions, search, or category changes
  useEffect(() => {
    if (isCreating && questions.length > 0) {
      let filtered = [...questions];
      
      // Apply category filter
      if (filterCategory && filterCategory !== 'all' && filterCategory !== '') {
        filtered = filtered.filter(q => 
          q.category.toLowerCase() === filterCategory.toLowerCase()
        );
      }
      
      // Apply search filter
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(q => 
          q.text.toLowerCase().includes(term) ||
          q.category.toLowerCase().includes(term)
        );
      }
      
      setFilteredQuestions(filtered);
    } else if (!isCreating) {
      setFilteredQuestions([]);
    }
  }, [questions, searchTerm, filterCategory, isCreating]);

  // Input Handling
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setExamData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSaveExam = async () => {
    if (!examData.title || !examData.title.trim()) {
      alert("Please enter an exam title");
      return;
    }
    
    if (!examData.category || examData.category.trim() === "") {
      alert("Please select a category");
      return;
    }
    
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({
          title: examData.title.trim(),
          description: examData.description?.trim() || "",
          category: examData.category,
          duration: Number(examData.duration),
          passPercentage: Number(examData.passPercentage),
          questions: selectedQuestions, // Array of question IDs
          isActive: examData.isActive !== undefined ? examData.isActive : true,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Exam created successfully!");
        setExamData({
          title: "",
          description: "",
          category: "",
          duration: 30,
          passPercentage: 60,
          isActive: true,
        });
        setSelectedQuestions([]);
        setIsCreating(false);
        setSearchTerm("");
        setFilterCategory("all");
        fetchExams();
      } else {
        const errorMsg = data.error || data.message || "Error creating exam";
        console.error("Exam creation error:", errorMsg, data);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error("Error saving exam:", error);
      alert(`Network error: ${error.message || "Failed to connect to server"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignToAll = (examId: string) => {
    setExamToAssign(examId);
  };

  const confirmAssign = async () => {
    if (!examToAssign) return;
    setIsAssigning(examToAssign);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: examToAssign }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setExamToAssign(null);
      } else {
        alert(data.error || "Failed to assign");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssigning(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg shadow-purple-100/50"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
              Exam Management
            </h1>
            <p className="text-slate-500 mt-1.5 font-medium">
              Create and manage exams for your students
            </p>
          </div>

          {!isCreating ? (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
            >
              <Plus size={20} />
              Create New Exam
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreating(false)}
              className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <X size={18} />
              Cancel
            </motion.button>
          )}
        </motion.div>

      {/* CREATE EXAM FORM */}
      {isCreating ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* LEFT PANEL */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-purple-100/30 border border-white/50">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                Exam Details
              </h2>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 bg-white/50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-slate-400"
                    placeholder="Enter exam title..."
                    value={examData.title}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 bg-white/50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    value={examData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration and Pass % */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Clock3 size={14} className="inline mr-1.5 text-teal-500" />
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 bg-white/50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      value={examData.duration}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Percent size={14} className="inline mr-1.5 text-purple-500" />
                      Pass %
                    </label>
                    <input
                      type="number"
                      name="passPercentage"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 bg-white/50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      value={examData.passPercentage}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100/50 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ListChecks size={18} className="text-purple-500" />
                Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/60 rounded-lg px-4 py-3">
                  <span className="text-slate-600 font-medium">Total Questions</span>
                  <span className="text-lg font-bold text-blue-600">{selectedQuestions.length}</span>
                </div>

                <div className="flex justify-between items-center bg-white/60 rounded-lg px-4 py-3">
                  <span className="text-slate-600 font-medium">Estimated Marks</span>
                  <span className="text-lg font-bold text-purple-600">{selectedQuestions.length * 5}</span>
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveExam}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all flex justify-center items-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {isSaving ? "Saving..." : "Save Exam"}
            </motion.button>
          </div>

          {/* RIGHT PANEL – QUESTIONS */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-purple-100/30 border border-white/50 flex flex-col h-[650px]">
            {/* Search & Filter */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white/50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className="pl-11 pr-8 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white/50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all appearance-none min-w-[180px]"
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-auto p-5 space-y-3">
              {isLoadingQuestions ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                    <Loader2 className="animate-spin text-blue-600" size={28} />
                  </div>
                  <p className="text-slate-500 font-medium">Loading questions...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-purple-50 flex items-center justify-center mx-auto mb-4">
                    <FileQuestion className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-700 text-lg">No questions found</p>
                  <p className="text-sm mt-2 text-slate-500">
                    {searchTerm || (filterCategory && filterCategory !== 'all') 
                      ? "Try adjusting your search or filter"
                      : "No questions available. Create questions first."}
                  </p>
                </div>
              ) : (
                filteredQuestions.map((q, index) => {
                  const questionId = q._id ? q._id.toString() : `question-${index}`;
                  const isSelected = selectedQuestions.includes(questionId);

                  return (
                    <motion.div
                      key={questionId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => toggleQuestionSelection(questionId)}
                      className={`p-5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? "border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md"
                          : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? "bg-blue-500" : "border-2 border-slate-300"
                        }`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 font-medium leading-relaxed">{q.text}</p>
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full mt-3 font-medium">
                            <BookMarked size={12} />
                            {q.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        // --- EXAM LIST VIEW ---
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {isLoadingExams ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                <Loader2 className="animate-spin text-blue-600" size={28} />
              </div>
              <p className="text-slate-500 font-medium">Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No exams yet</h3>
              <p className="text-slate-500">Create your first exam to get started</p>
            </div>
          ) : (
            exams.map((exam, index) => (
              <motion.div
                key={exam._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {exam.title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1.5 rounded-full mt-2 font-medium">
                      <BookMarked size={12} />
                      {exam.category}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl transition-colors ${
                      exam.isActive
                        ? "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Award size={20} />
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Clock size={16} className="text-blue-500" />
                    </div>
                    <span className="font-medium">{exam.duration} minutes</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <FileText size={16} className="text-purple-500" />
                    </div>
                    <span className="font-medium">{exam.questions?.length} Questions</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <CheckCircle size={16} className="text-teal-500" />
                    </div>
                    <span className="font-medium">Pass: {exam.passPercentage}%</span>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-slate-100 pt-5">
                  <button className="flex-1 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
                    Edit
                  </button>

                  <button className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md shadow-blue-500/20 transition-all">
                    View Results
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAssignToAll(exam._id)}
                  disabled={isAssigning === exam._id}
                  className="w-full mt-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/20 flex justify-center items-center gap-2.5 disabled:opacity-50 transition-all"
                >
                  {isAssigning === exam._id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Users size={18} />
                  )}
                  {isAssigning === exam._id
                    ? "Assigning..."
                    : "Assign to All Students"}
                </motion.button>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
      <Modal
        isOpen={!!examToAssign}
        onClose={() => setExamToAssign(null)}
        title="Assign Exam to All Students"
        description="Are you sure you want to assign this exam to ALL registered students? This will create pending attempts for everyone."
        variant="warning"
        confirmLabel="Assign to All"
        onConfirm={confirmAssign}
        isLoading={!!isAssigning}
      />
      </div>
    </div>
  );
}
