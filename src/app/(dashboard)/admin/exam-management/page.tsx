'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Search, Filter, CheckCircle, Clock, Award, BookOpen, Loader2 } from 'lucide-react';

// --- Types ---
interface Question {
  id: string;
  text: string;
  category: string;
  type?: string;
}

export default function ExamManagementPage() {
  // --- State ---
  const [exams, setExams] = useState<any[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);

  const [examData, setExamData] = useState({
    title: '',
    category: '',
    duration: 60,
    passPercentage: 40,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // --- Effects ---
  useEffect(() => {
    fetchQuestions();
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, searchTerm]);

  // --- Data Fetching ---
  const fetchExams = async () => {
    setIsLoadingExams(true);
    try {
      const res = await fetch('/api/exams');
      const data = await res.json();
      if (res.ok) {
        setExams(data.exams || []);
      } else {
        console.error('Failed to fetch exams:', data.error);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (searchTerm) params.append('q', searchTerm);
      params.append('pageSize', '1000');

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setQuestions(data.data || []);
        // Extract unique categories if not filtering (initial load)
        if (!filterCategory && !searchTerm && categories.length === 0) {
          const uniqueCats = Array.from(new Set((data.data || []).map((q: Question) => q.category)));
          setCategories(uniqueCats as string[]);
        }
      } else {
        console.error('Failed to fetch questions:', data.error || data.message);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // keep numeric fields numeric
    if (name === 'duration' || name === 'passPercentage') {
      const numeric = Number(value);
      setExamData((prev) => ({ ...prev, [name]: isNaN(numeric) ? prev[name as keyof typeof prev] : numeric }));
    } else {
      setExamData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSaveExam = async () => {
    if (!examData.title || selectedQuestions.length === 0) return;

    setIsSaving(true);
    try {
      const payload = {
        ...examData,
        questions: selectedQuestions,
      };

      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Exam created successfully!');
        setExamData({
          title: '',
          category: '',
          duration: 60,
          passPercentage: 40,
        });
        setSelectedQuestions([]);
        setIsCreating(false);
        fetchExams(); // Refresh list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Exam Management</h1>
          <p className="text-gray-600 mt-1">Create and manage exams for your students.</p>
        </div>
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Create New Exam
          </button>
        ) : (
          <button
            onClick={() => setIsCreating(false)}
            className="flex items-center gap-2 bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
          >
            Back
          </button>
        )}
      </div>

      {isCreating ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Exam Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-500" />
                Exam Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="exam-title" className="block text-sm font-bold text-black mb-1">Exam Title</label>
                  <input
                    id="exam-title"
                    type="text"
                    name="title"
                    value={examData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Mid-Term Mathematics"
                    className="w-full px-4 py-2 rounded-lg border text-black border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="exam-category" className="block text-sm font-bold text-gray-800 mb-1">Category</label>
                  <select
                    id="exam-category"
                    name="category"
                    value={examData.category}
                    onChange={handleInputChange}
                    title="Exam category"
                    className="w-full px-4 py-2 rounded-lg border text-black border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {categories.length === 0 && <option value="General">General</option>}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="exam-duration" className="block text-sm font-bold text-gray-800 mb-1 flex items-center gap-1">
                      <Clock size={14} /> Duration (min)
                    </label>
                    <input
                      id="exam-duration"
                      type="number"
                      name="duration"
                      value={examData.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border text-black border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="exam-pass" className="block text-sm font-bold text-gray-800 mb-1 flex items-center gap-1">
                      <Award size={14} /> Pass %
                    </label>
                    <input
                      id="exam-pass"
                      type="number"
                      name="passPercentage"
                      value={examData.passPercentage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border text-black border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              <h3 className="text-indigo-900 font-medium mb-2">Summary</h3>
              <div className="flex justify-between items-center text-sm text-indigo-700 mb-1">
                <span>Selected Questions:</span>
                <span className="font-bold text-lg">{selectedQuestions.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-indigo-700">
                <span>Total Marks (Est):</span>
                <span className="font-bold text-lg">{selectedQuestions.length * 5}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveExam}
                disabled={!examData.title || selectedQuestions.length === 0 || isSaving}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'Saving...' : 'Save Exam'}
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right Column: Question Selection */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Questions</h2>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  {/* visually hidden label to give accessible name to search input */}
                  <label htmlFor="search-questions" className="sr-only">Search questions</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
                  <input
                    id="search-questions"
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search questions"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border text-black border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="relative w-48">
                  {/* visually hidden label for filter select so axe/Edge have an accessible name */}
                  <label htmlFor="filter-category" className="sr-only">Filter by category</label>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
                  <select
                    id="filter-category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    title="Filter by category"
                    aria-label="Filter questions by category"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border text-black border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingQuestions ? (
                <div className="flex justify-center items-center h-full text-indigo-500">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No questions found matching your criteria.
                </div>
              ) : (
                questions.map((q) => {
                  const isSelected = selectedQuestions.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all group ${isSelected
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleQuestionSelection(q.id);
                        }
                      }}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 bg-white'
                          }`}>
                          {isSelected && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>
                            {q.text}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                              {q.category}
                            </span>
                            {q.type && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {q.type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl text-sm text-gray-600 flex justify-between">
              <span>Showing {questions.length} questions</span>
              <span>{selectedQuestions.length} selected</span>
            </div>
          </div>
        </motion.div>
      ) : (
        // Exam List View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingExams ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : exams.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-900">No Exams Created Yet</h3>
              <p className="text-gray-600 mt-1 mb-6">Get started by creating your first exam.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus size={20} />
                Create New Exam
              </button>
            </div>
          ) : (
            exams.map((exam) => (
              <div key={exam._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium mt-1 inline-block">
                      {exam.category}
                    </span>
                  </div>
                  <div className={`p-2 rounded-full ${exam.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Award size={18} />
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-700 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span>{exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-500" />
                    <span>{exam.questions?.length || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-gray-500" />
                    <span>Pass: {exam.passPercentage}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">
                    View Results
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
