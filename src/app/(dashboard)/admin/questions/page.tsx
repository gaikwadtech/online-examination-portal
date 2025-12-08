"use client";

import React, { useEffect, useState, useCallback } from "react";
import BulkUploadExcel from "./BulkUploadExcel";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  ArrowLeft,
  X,
  Save,
  Download,
  List,
  Layers
} from "lucide-react";
import Modal from "@/components/ui/Modal";

/* -------------------------
   Types
   ------------------------- */
type QOption = { id: string; text: string; isCorrect?: boolean };
type QuestionDTO = {
  id: string;
  category: string;
  text: string;
  options: QOption[];
  createdAt?: string | number | Date;
  difficulty?: "Easy" | "Medium" | "Hard";
  type?: "MCQ" | "TrueFalse";
};

/* -------------------------
   Main Page Component
   ------------------------- */
export default function QuestionsPage() {
  const [view, setView] = useState<"list" | "single" | "bulk">("list");
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {view === "list" && <QuestionListView onNavigate={setView} />}
      {view === "single" && <SingleQuestionManagement onBack={() => setView("list")} />}
      {view === "bulk" && <BulkUploadExcel onBack={() => setView("list")} />}
    </div>
  );
}

/* -------------------------
   Sub-Components
   ------------------------- */

function QuestionListView({ onNavigate }: { onNavigate: (v: "list" | "single" | "bulk") => void }) {
  // Data State
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Interaction State
  const [hasFetched, setHasFetched] = useState(false);

  // Filter State
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit/Delete State
  const [editing, setEditing] = useState<QuestionDTO | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal State
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  
  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Fetch Categories on Mount
  useEffect(() => {
    fetch("/api/questions/categories")
      .then(res => res.json())
      .then(data => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  // Main Load Function
  const loadQuestions = useCallback(async (overrideCategory?: string) => {
    setLoading(true);
    try {
      const url = new URL("/api/questions", window.location.origin);
      url.searchParams.set("q", query || "");
      
      // Use override if provided (for Show All = empty string), else current state
      const cat = overrideCategory !== undefined ? overrideCategory : categoryFilter;
      url.searchParams.set("category", cat);
      
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", "10");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load questions");
      
      const body = await res.json();
      setQuestions(body.data || []);
      setTotal(body.total ?? (body.data || []).length);
      setHasFetched(true);
    } catch (err: any) {
      console.error(err);
      alert("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [page, query, categoryFilter]);

  // Effect: Only auto-load if we have already fetched or if the user is searching/filtering
  // We do NOT load on mount (defer to user action)
  useEffect(() => {
    if (hasFetched) {
      loadQuestions();
    }
  }, [page, hasFetched]); // removed loadQuestions dependency to avoid loops, relied on page/hasFetched

  // Determine if we should show results
  // If user hasn't clicked anything yet, questions is empty and hasFetched is false.

  const handleShowAll = () => {
    setCategoryFilter("");
    setPage(1);
    setHasFetched(true);
    loadQuestions(""); // explicit empty category
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    setCategoryFilter(newVal);
    setPage(1);
    if (newVal) {
      setHasFetched(true);
      loadQuestions(newVal);
    }
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/questions/${questionToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionToDelete));
        setTotal(prev => prev - 1);
        setQuestionToDelete(null);
      }
    } catch (error) {
      alert("Failed to delete");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (updatedQ: QuestionDTO) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/questions/${updatedQ.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedQ),
      });
      if (!res.ok) throw new Error("Update failed");
      
      setQuestions(prev => prev.map(q => q.id === updatedQ.id ? updatedQ : q));
      setEditing(null);
    } catch (error) {
      alert("Failed to update question");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length && questions.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map(q => q.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      
      const body = await res.json();
      
      if (res.ok) {
        setQuestions(prev => prev.filter(q => !selectedIds.has(q.id)));
        setTotal(prev => prev - (body.count || selectedIds.size));
        setSelectedIds(new Set());
        setShowBulkDeleteModal(false);
      } else {
        throw new Error(body.error || "Failed to delete");
      }
    } catch (error) {
      alert("Failed to delete selected questions");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           {/* Breadcrumb / Back (optional) */}

          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Question Bank</h1>
          <p className="text-slate-500 mt-1">Manage and organize your examination questions</p>
        </div>
        
        <div className="flex items-center gap-3">
           {selectedIds.size > 0 && (
             <button 
               onClick={() => setShowBulkDeleteModal(true)}
               className="flex items-center gap-2 px-4 py-2.5 border border-red-200 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-all shadow-sm animate-in fade-in"
             >
               <Trash2 className="w-4 h-4" />
               Delete ({selectedIds.size})
             </button>
           )}
           <button 
            onClick={() => onNavigate('bulk')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-slate-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Bulk Upload
          </button>
          <button 
            onClick={() => onNavigate('single')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Question
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={toggleSelectAll}
          className={`p-6 rounded-2xl shadow-sm border flex items-center justify-between hover:shadow-md transition-all cursor-pointer ${
            selectedIds.size > 0 && selectedIds.size === questions.length ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"
          }`}
        >
           <div>
             <p className="text-sm font-medium text-slate-500 mb-1">
                {questions.length > 0 && selectedIds.size === questions.length ? "Deselect All" : "Select All Loaded"}
             </p>
             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               {selectedIds.size > 0 ? `${selectedIds.size} Selected` : "Click to Select"}
             </h3>
           </div>
           <div className={`p-4 rounded-xl transition-colors ${selectedIds.size > 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
             <CheckCircle className="w-6 h-6" />
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
           <div>
             <p className="text-sm font-medium text-slate-500 mb-1">Active Subjects</p>
             <h3 className="text-3xl font-bold text-slate-800">{categories.length}</h3>
           </div>
           <div className="p-4 rounded-xl bg-purple-50">
             <BookOpen className="w-6 h-6 text-purple-600" />
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
           <div>
             <p className="text-sm font-medium text-slate-500 mb-1">System Status</p>
             <h3 className="text-lg font-bold text-slate-800 text-green-600">Active</h3>
           </div>
           <div className="p-4 rounded-xl bg-green-50">
             <CheckCircle className="w-6 h-6 text-green-600" />
           </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-10 backdrop-blur-xl bg-white/90">
        <div className="flex flex-1 gap-4 w-full">
           {/* Show All Button */}
           <button 
             onClick={handleShowAll}
             className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-medium transition-all whitespace-nowrap ${
                categoryFilter === "" && hasFetched
                  ? "bg-slate-800 text-white border-slate-800 shadow-md"
                  : "bg-white text-slate-700 border-gray-200 hover:bg-gray-50"
             }`}
           >
             <Layers className="w-4 h-4" />
             Show All Questions
           </button>

           <div className="relative group w-full max-w-xs">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={categoryFilter}
              onChange={handleCategorySelect}
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-slate-700 appearance-none cursor-pointer"
            >
              <option value="" disabled>Select a Subject...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search specific questions..." 
            value={query}
            onChange={(e) => {
               setQuery(e.target.value);
               if(e.target.value.length > 2 && hasFetched) loadQuestions();
            }}
            onKeyDown={(e) => e.key === 'Enter' && loadQuestions()}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* 4. Content Area */}
      {!hasFetched ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
           <div className="bg-blue-50 p-6 rounded-full mb-4 animate-bounce-slow">
             <BookOpen className="w-10 h-10 text-blue-500" />
           </div>
           <h2 className="text-xl font-semibold text-slate-800">Ready to Explore?</h2>
           <p className="text-slate-500 mt-2 max-w-md text-center">
             Select a specific <strong>Subject</strong> from the dropdown above or click <strong>Show All Questions</strong> to view the entire bank.
           </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p>Fetching your data...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No questions found</h3>
          <p className="text-slate-500">Try adjusting your filters or add a new question.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((q) => (
            <div 
              key={q.id} 
              className={`group bg-white rounded-xl p-6 border shadow-sm hover:shadow-lg transition-all duration-200 relative overflow-hidden ${
                selectedIds.has(q.id) ? "border-blue-300 ring-1 ring-blue-300 bg-blue-50/10" : "border-gray-100 hover:border-blue-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Checkbox */}
                <div className="pt-1">
                   <input 
                     type="checkbox"
                     checked={selectedIds.has(q.id)}
                     onChange={() => toggleSelect(q.id)}
                     className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                   />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {q.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {q.type || 'MCQ'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {q.text}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {q.options.map((opt, i) => (
                      <span 
                        key={opt.id}
                        className={`text-sm px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                          opt.isCorrect 
                            ? "bg-green-50 text-green-700 border-green-200 font-medium" 
                            : "bg-gray-50 text-slate-500 border-gray-100"
                        }`}
                      >
                         {opt.isCorrect && <CheckCircle className="w-3.5 h-3.5" />}
                         {opt.text}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditing(q)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setQuestionToDelete(q.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination - Only show if fetched */}
      {hasFetched && questions.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <p className="text-sm text-slate-500">Showing page {page}</p>
          <div className="flex gap-2">
             <button 
               onClick={() => setPage(p => Math.max(1, p - 1))}
               disabled={page === 1}
               className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50"
             >
               Previous
             </button>
             <button 
               onClick={() => setPage(p => p + 1)}
               disabled={questions.length < 10}
               className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50"
             >
               Next
             </button>
          </div>
        </div>
      )}

      {editing && (
        <EditQuestionModal 
          question={editing} 
          onClose={() => setEditing(null)} 
          onSave={handleUpdate} 
          isProcessing={isProcessing}
        />
      )}

      <Modal
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        title="Delete Question"
        description="Are you sure you want to permanently delete this question? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete Question"
        onConfirm={confirmDelete}
        isLoading={isProcessing}
      />

      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Delete Selected Questions"
        description={`Are you sure you want to permanently delete these ${selectedIds.size} questions? This action cannot be undone.`}
        variant="danger"
        confirmLabel={`Delete ${selectedIds.size} Question${selectedIds.size > 1 ? 's' : ''}`}
        onConfirm={handleBulkDelete}
        isLoading={isBulkDeleting}
      />
    </div>
  );
}

/* -------------------------
   Standalone Components (Create / Edit)
   ------------------------- */

function EditQuestionModal({
  question,
  onClose,
  onSave,
  isProcessing,
}: {
  question: QuestionDTO;
  onClose: () => void;
  onSave: (q: QuestionDTO) => Promise<void>;
  isProcessing: boolean;
}) {
  const [local, setLocal] = useState<QuestionDTO>(question);

  useEffect(() => setLocal(question), [question]);

  const updateOptionText = (id: string, text: string) => {
    setLocal((s) => ({ ...s, options: s.options.map((o) => (o.id === id ? { ...o, text } : o)) }));
  };
  const toggleCorrect = (id: string) => {
    setLocal((s) => ({ ...s, options: s.options.map((o) => ({ ...o, isCorrect: o.id === id })) }));
  };
  const addOption = () => {
    setLocal((s) => ({ ...s, options: [...s.options, { id: `opt${Date.now()}`, text: "", isCorrect: false }] }));
  };
  const removeOption = (id: string) => {
    setLocal((s) => ({ ...s, options: s.options.filter((o) => o.id !== id) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h3 className="text-xl font-bold text-slate-800">Edit Question</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-white p-1.5 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <input
              value={local.category}
              onChange={(e) => setLocal({ ...local, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Question Text</label>
             <textarea
               value={local.text}
               onChange={(e) => setLocal({ ...local, text: e.target.value })}
               className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50 focus:bg-white h-32 resize-none"
             />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-slate-700">Options</label>
              <button onClick={addOption} className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                 + Add Option
              </button>
            </div>
            <div className="space-y-3">
              {local.options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-3 group">
                   <div 
                     onClick={() => toggleCorrect(opt.id)}
                     className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                       opt.isCorrect ? "bg-green-500 border-green-500" : "border-slate-300 hover:border-blue-400"
                     }`}
                   >
                     {opt.isCorrect && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                   </div>
                   <input
                     value={opt.text}
                     onChange={(e) => updateOptionText(opt.id, e.target.value)}
                     className={`flex-1 px-3 py-2 border rounded-lg outline-none transition-all ${
                        opt.isCorrect ? "border-green-200 bg-green-50/30" : "border-gray-200 focus:border-blue-300"
                     }`}
                     placeholder={`Option ${idx + 1}`}
                   />
                   <button onClick={() => removeOption(opt.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-slate-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => onSave(local)} 
            disabled={isProcessing}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {isProcessing ? "Saving..." : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Styled Single Question Creator
function SingleQuestionManagement({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<QOption[]>([
    { id: "opt1", text: "" }, { id: "opt2", text: "" }, { id: "opt3", text: "" }, { id: "opt4", text: "" },
  ]);
  const [correct, setCorrect] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories here too? Or let user type new ones. 
  // User asked for improved color specifically here.
  
  const handleSubmit = async () => {
    if (!category || !question || !correct) return alert("Please fill all fields");
    setLoading(true);
    try {
      const correctIndex = options.findIndex(o => o.id === correct);
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          question,
          options: options.map(o => o.text),
          correctIndex
        })
      });
      if (res.ok) {
        alert("Created successfully!");
        // Reset
        setCategory(""); setQuestion(""); setCorrect(null);
        setOptions([{ id: "o1", text: "" }, { id: "o2", text: "" }, { id: "o3", text: "" }, { id: "o4", text: "" }]);
      } else {
        alert("Error creating question");
      }
    } catch(e) {
      alert("Error creating question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen flex flex-col">
       <div className="mb-8 flex items-center justify-between">
         <button onClick={onBack} className="flex items-center text-slate-500 hover:text-blue-600 transition-colors group">
           <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mr-3 group-hover:border-blue-200 transition-all">
              <ArrowLeft className="w-4 h-4" />
           </div>
           <span className="font-medium">Back to Question Bank</span>
         </button>
       </div>
       
       <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex-1 flex flex-col">
         {/* Header */}
         <div className="px-10 py-8 border-b border-gray-50 bg-gradient-to-r from-blue-600 to-blue-500">
           <h2 className="text-3xl font-bold text-white">Add New Question</h2>
           <p className="text-blue-100 mt-2 text-lg">Create comprehensive questions for your students.</p>
         </div>
         
         <div className="p-10 space-y-8 flex-1">
            {/* Subject Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Subject / Category</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                     className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white text-lg"
                     placeholder="e.g. Mathematics"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 ml-1">Group similar questions together</p>
              </div>
            </div>
            
            {/* Question Text */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Question Content</label>
              <textarea 
                 value={question}
                 onChange={(e) => setQuestion(e.target.value)}
                 className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white h-40 resize-none text-lg leading-relaxed"
                 placeholder="Type your question content here..."
              />
            </div>

            {/* Options */}
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
                 Answer Options 
                 <span className="font-normal text-slate-400 text-xs ml-2 normal-case">(Click the circle to mark correct answer)</span>
               </label>
               
               <div className="grid grid-cols-1 gap-4">
                 {options.map((opt, idx) => (
                   <div 
                     key={opt.id} 
                     className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all duration-200 group ${
                        correct === opt.id 
                          ? "border-green-500 bg-green-50/40 shadow-sm" 
                          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                     }`}
                   >
                      <div 
                        onClick={() => setCorrect(opt.id)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 transition-all transform scale-100 group-hover:scale-110 ${
                          correct === opt.id 
                            ? "border-green-500 bg-green-500 shadow-md" 
                            : "border-slate-300 bg-white group-hover:border-blue-400"
                        }`}
                      >
                         {correct === opt.id && <CheckCircle className="w-5 h-5 text-white" />}
                      </div>
                      
                      <div className="flex-1">
                        <input 
                          value={opt.text}
                          onChange={(e) => setOptions(prev => prev.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o))}
                          className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium"
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                      
                      <button 
                        onClick={() => setOptions(prev => prev.filter(o => o.id !== opt.id))} 
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove option"
                      >
                        <X className="w-5 h-5" />
                      </button>
                   </div>
                 ))}
               </div>
               
               <button 
                onClick={() => setOptions(prev => [...prev, { id: `opt${Date.now()}`, text: "" }])}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors"
               >
                 <Plus className="w-4 h-4" /> 
                 ADD ANOTHER OPTION
               </button>
            </div>
         </div>
         
         {/* Footer */}
         <div className="p-8 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-4">
           <button 
             onClick={onBack} 
             className="px-8 py-3.5 text-slate-600 font-bold hover:bg-white hover:shadow-sm hover:text-slate-800 rounded-xl transition-all"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit} 
             disabled={loading}
             className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
           >
             {loading ? "Creating Question..." : (
               <>
                 <Save className="w-5 h-5" /> 
                 Create Question
               </>
             )}
           </button>
         </div>
       </div>
    </div>
  );
}
