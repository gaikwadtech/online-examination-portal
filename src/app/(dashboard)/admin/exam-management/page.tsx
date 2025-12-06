"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

// Types
interface Question {
  id: string;
  text: string;
  category: string;
  type?: string;
}

export default function ExamManagementPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);

  const [examData, setExamData] = useState({
    title: "",
    category: "",
    duration: 60,
    passPercentage: 40,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  // FETCH DATA
  useEffect(() => {
    fetchQuestions();
    fetchExams();
  }, [filterCategory, searchTerm]);

  const fetchExams = async () => {
    setIsLoadingExams(true);
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      if (res.ok) setExams(data.exams || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append("category", filterCategory);
      if (searchTerm) params.append("q", searchTerm);
      params.append("pageSize", "1000");

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setQuestions(data.data || []);

        if (!filterCategory && !searchTerm && categories.length === 0) {
          const uniqueCats = Array.from(
            new Set((data.data || []).map((q: Question) => q.category))
          );
          setCategories(uniqueCats as string[]);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

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
    if (!examData.title || selectedQuestions.length === 0) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...examData,
          questions: selectedQuestions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Exam created successfully!");
        setExamData({
          title: "",
          category: "",
          duration: 60,
          passPercentage: 40,
        });
        setSelectedQuestions([]);
        setIsCreating(false);
        fetchExams();
      } else {
        alert(data.message || "Error creating exam");
      }
    } catch (error) {
      console.error("Error saving exam:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignToAll = async (examId: string) => {
    if (!confirm("Assign this exam to ALL students?")) return;

    setIsAssigning(examId);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage exams for your students.
          </p>
        </div>

        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            Create New Exam
          </button>
        ) : (
          <button
            onClick={() => setIsCreating(false)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Back
          </button>
        )}
      </div>

      {/* CREATE EXAM FORM */}
      {isCreating ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* LEFT PANEL */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-600" />
                Exam Details
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-4 py-2 rounded-lg border text-gray-900 border-gray-300"
                    value={examData.title}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    className="w-full px-4 py-2 rounded-lg border text-gray-900 border-gray-300"
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
                    <label className="block text-sm font-semibold mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      className="w-full px-4 py-2 rounded-lg border text-gray-900 border-gray-300"
                      value={examData.duration}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Pass Percentage
                    </label>
                    <input
                      type="number"
                      name="passPercentage"
                      className="w-full px-4 py-2 rounded-lg border text-gray-900 border-gray-300"
                      value={examData.passPercentage}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
              <h3 className="font-semibold text-indigo-900 mb-2">Summary</h3>

              <div className="flex justify-between text-indigo-700">
                <span>Total Questions:</span>
                <span>{selectedQuestions.length}</span>
              </div>

              <div className="flex justify-between text-indigo-700">
                <span>Estimated Marks:</span>
                <span>{selectedQuestions.length * 5}</span>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={handleSaveExam}
              disabled={isSaving}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 flex justify-center items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {isSaving ? "Saving..." : "Save Exam"}
            </button>
          </div>

          {/* RIGHT PANEL – QUESTIONS */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow border flex flex-col h-[600px]">
            {/* Search & Filter */}
            <div className="p-4 border-b flex gap-4">
              <input
                type="text"
                placeholder="Search questions..."
                className="flex-1 px-3 py-2 border rounded-lg text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="w-48 px-3 py-2 border rounded-lg text-gray-900"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {questions.map((q) => {
                const isSelected = selectedQuestions.includes(q.id);

                return (
                  <div
                    key={q.id}
                    onClick={() => toggleQuestionSelection(q.id)}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-gray-900 font-medium">{q.text}</p>
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded-full inline-block mt-2">
                      {q.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        // --- EXAM LIST VIEW ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {exam.title}
                  </h3>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full inline-block mt-1">
                    {exam.category}
                  </span>
                </div>

                <div
                  className={`p-2 rounded-full ${
                    exam.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <Award size={20} />
                </div>
              </div>

              <div className="text-gray-700 space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-indigo-600" />
                  <span>{exam.duration} minutes</span>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  <span>{exam.questions?.length} Questions</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-indigo-600" />
                  <span>Pass: {exam.passPercentage}%</span>
                </div>
              </div>

              <div className="flex gap-2 border-t pt-4">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Edit
                </button>

                <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  View Results
                </button>
              </div>

              <button
                onClick={() => handleAssignToAll(exam._id)}
                disabled={isAssigning === exam._id}
                className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isAssigning === exam._id ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Users size={18} />
                )}
                {isAssigning === exam._id
                  ? "Assigning..."
                  : "Assign to All Students"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
