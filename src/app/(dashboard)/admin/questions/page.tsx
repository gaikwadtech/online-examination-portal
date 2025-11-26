// src/app/(dashboard)/admin/questions/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import BulkUploadExcel from "./BulkUploadExcel";
import { useRouter } from "next/navigation";

/**
 * QuestionsPage - top-level component that switches between:
 * - choose view (cards)
 * - single question form
 * - bulk upload (imported)
 * - update/manage questions (table with edit/delete)
 */
export default function QuestionsPage() {
  // add "update" to the allowed views
  const [view, setView] = useState<"choose" | "single" | "bulk" | "update">(
    "choose"
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {view === "choose" ? (
          // note: onShowAll is removed — we now have three cards including Update
          <ChooseQuestionAdd onSelect={(v) => setView(v)} />
        ) : view === "single" ? (
          <SingleQuestionManagement onBack={() => setView("choose")} />
        ) : view === "bulk" ? (
          <BulkUploadExcel onBack={() => setView("choose")} />
        ) : (
          // Update / Manage Questions
          <UpdateQuestions onBack={() => setView("choose")} />
        )}
      </div>
    </div>
  );
}

/* -------------------------
   ChooseQuestionAdd + Card
   ------------------------- */

function ChooseQuestionAdd({
  onSelect,
}: {
  // allow "update" now
  onSelect: (v: "single" | "bulk" | "update") => void;
}) {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
          <p className="text-gray-800 mt-1">
            Manage your question bank and categories
          </p>
        </div>
        <div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-pink-600 text-white px-4 py-2 rounded shadow"
            aria-label="Back to Dashboard"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-8 border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Choose Question Addition Method
          </h2>
          <p className="text-gray-800 mt-1">Select how you want to add questions</p>
        </div>

        {/* THREE cards now: single | bulk | update */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            onClick={() => onSelect("single")}
            title="Add Single Question"
            subtitle="Create individual questions with custom categories and options"
            icon={
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">
                +
              </div>
            }
          />

          <Card
            onClick={() => onSelect("bulk")}
            title="Bulk Upload"
            subtitle="Upload multiple questions at once using Excel template"
            icon={
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                ↓
              </div>
            }
          />

          <Card
            onClick={() => onSelect("update")}
            title="Update / Manage Questions"
            subtitle="Search, edit or delete existing questions"
            icon={
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                ⚙
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left border-2 border-dashed border-gray-200 rounded-lg p-6 hover:shadow transition flex items-start gap-4 bg-white"
      aria-label={title}
      title={title}
    >
      <div>{icon}</div>
      <div className="flex-1">
        <div className="font-semibold text-lg text-gray-900">{title}</div>
        <div className="text-sm text-gray-800 mt-1">{subtitle}</div>
      </div>
    </button>
  );
}

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
};

/* -------------------------
   UpdateQuestions Component
   (your component — unchanged from your latest working code)
   ------------------------- */

export function UpdateQuestions({ onBack }: { onBack?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // row actions
  const [editing, setEditing] = useState<QuestionDTO | null>(null);
  const [deleting, setDeleting] = useState<QuestionDTO | null>(null);
  const [multiSelect, setMultiSelect] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // load list (server should accept query, page, pageSize)
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/questions", window.location.origin);
      url.searchParams.set("q", query || "");
      url.searchParams.set("category", categoryFilter || "");
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));

      const res = await fetch(url.toString());
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `HTTP ${res.status}`);
      }
      const body = await res.json();
      // expected { data: QuestionDTO[], total: number }
      setQuestions(body.data || []);
      setTotal(body.total ?? (body.data || []).length);
    } catch (err: any) {
      setError(err?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, categoryFilter]);

  const toggleSelect = (id: string) => {
    setMultiSelect((m) => ({ ...m, [id]: !m[id] }));
  };

  const selectAllOnPage = () => {
    const newMap = { ...multiSelect };
    questions.forEach((q) => (newMap[q.id] = true));
    setMultiSelect(newMap);
  };

  const clearSelection = () => setMultiSelect({});

  const confirmBulkDelete = async () => {
    const ids = Object.keys(multiSelect).filter((k) => multiSelect[k]);
    if (!ids.length) return alert("Select at least one question to delete.");
    if (!confirm(`Delete ${ids.length} questions? This cannot be undone.`)) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/questions/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Server ${res.status}`);
      }
      // remove deleted from UI
      setQuestions((s) => s.filter((q) => !ids.includes(q.id)));
      clearSelection();
    } catch (err: any) {
      alert(err?.message || "Failed to delete selected");
    } finally {
      setIsProcessing(false);
    }
  };

  const startEdit = (q: QuestionDTO) => {
    // clone to avoid accidental mutation
    setEditing({ ...q, options: q.options.map((o) => ({ ...o })) });
  };

  const saveEdit = async (payload: QuestionDTO) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/questions/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Server ${res.status}`);
      }
      // update local list
      setQuestions((s) => s.map((q) => (q.id === payload.id ? payload : q)));
      setEditing(null);
    } catch (err: any) {
      alert(err?.message || "Failed to update question");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async (q: QuestionDTO) => {
    if (!confirm("Delete this question? This action cannot be undone.")) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/questions/${q.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Server ${res.status}`);
      }
      setQuestions((s) => s.filter((x) => x.id !== q.id));
      setDeleting(null);
    } catch (err: any) {
      alert(err?.message || "Failed to delete question");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Update / Manage Questions</h2>

        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md shadow"
              aria-label="Back to questions"
            >
              Back
            </button>
          )}

          <button
            onClick={load}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md shadow-sm"
            aria-label="Refresh questions"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          aria-label="Search question text"
          className="border border-gray-300 rounded-md px-4 py-2 flex-1 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400"
          placeholder="Search question text..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />

        <input
          aria-label="Filter by category"
          className="border border-gray-300 rounded-md px-4 py-2 w-56 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400"
          placeholder="Filter category..."
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        />

        <button
          onClick={selectAllOnPage}
          className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md"
          aria-label="Select all questions on page"
        >
          Select All
        </button>

        <button
          onClick={clearSelection}
          className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md"
          aria-label="Clear selection"
        >
          Clear
        </button>

        <button
          onClick={confirmBulkDelete}
          disabled={isProcessing}
          className={`px-4 py-2 rounded-md text-white shadow ${
            isProcessing ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
          }`}
          aria-label="Delete selected questions"
        >
          Delete Selected
        </button>
      </div>

      {/* Loading / Error / Content */}
      {loading ? (
        <div className="text-gray-700 text-lg">Loading questions…</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md font-semibold shadow">
          ❌ {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-gray-700 text-lg">No questions found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr className="text-left">
                <th className="p-3 text-gray-900 font-semibold">Sel</th>
                <th className="p-3 text-gray-900 font-semibold">Category</th>
                <th className="p-3 text-gray-900 font-semibold">Question</th>
                <th className="p-3 text-gray-900 font-semibold">Options</th>
                <th className="p-3 text-gray-900 font-semibold">Created</th>
                <th className="p-3 text-gray-900 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={`Select question ${q.id}`}
                      title={`Select question ${q.id}`}
                      checked={!!multiSelect[q.id]}
                      onChange={() => toggleSelect(q.id)}
                      className="w-4 h-4 accent-blue-600"
                    />
                  </td>

                  <td className="p-3 font-medium text-gray-900">{q.category}</td>

                  <td className="p-3 text-gray-800">
                    {q.text.length > 120 ? q.text.slice(0, 120) + "…" : q.text}
                  </td>

                  <td className="p-3">
                    <div className="flex flex-col gap-2">
                      {q.options.map((o) => (
                        <span
                          key={o.id}
                          className={`px-3 py-1 rounded-md text-sm shadow ${
                            o.isCorrect
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-gray-200 text-gray-800 border border-gray-300"
                          }`}
                        >
                          {o.text}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-3 text-gray-700">
                    {q.createdAt ? new Date(q.createdAt).toLocaleString() : "-"}
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(q)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
                        aria-label={`Edit question ${q.id}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleting(q);
                          confirmDelete(q);
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow"
                        aria-label={`Delete question ${q.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 p-3 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing {questions.length} of {total}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border rounded-md bg-yellow-400 hover:bg-yellow-600 text-white"
                aria-label="Previous page"
              >
                Prev
              </button>

              <span className="text-gray-900 font-semibold">Page {page}</span>

              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border rounded-md bg-green-600 hover:bg-green-700 text-white"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal (unchanged logic but styled) */}
      {editing && (
        <EditQuestionModal
          question={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}

/* -------------------------
   EditQuestionModal
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

  const save = () => {
    // basic validation
    if (!local.text.trim()) return alert("Question text required");
    const filled = local.options.filter((o) => o.text.trim());
    if (filled.length < 2) return alert("At least 2 options required");
    if (!local.options.some((o) => o.isCorrect)) return alert("Select a correct option");
    onSave(local);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-question-title">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6 overflow-auto max-h-[90vh] border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 id="edit-question-title" className="text-lg font-semibold text-gray-900">
            Edit Question
          </h3>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 bg-red-700 rounded hover:bg-red-400" aria-label="Close edit dialog">
              Close
            </button>
          </div>
        </div>

        <label htmlFor="edit-category" className="block text-sm mb-1 text-gray-700">
          Category
        </label>
        <input
          id="edit-category"
          value={local.category}
          onChange={(e) => setLocal({ ...local, category: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3 bg-white text-gray-900"
          aria-label="Edit category"
          placeholder="Category"
        />

        <label htmlFor="edit-question-text" className="block text-sm mb-1 text-gray-700">
          Question
        </label>
        <textarea
          id="edit-question-text"
          value={local.text}
          onChange={(e) => setLocal({ ...local, text: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3 h-28 bg-white text-gray-900"
          aria-label="Edit question text"
          placeholder="Enter the question text"
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-800">Options</label>
            <button onClick={addOption} className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700" aria-label="Add option">
              Add Option
            </button>
          </div>

          <div className="space-y-2">
            {local.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${local.id ?? "editing"}`}
                  aria-label={`Mark option ${idx + 1} as correct`}
                  title={`Mark option ${idx + 1} as correct`}
                  checked={!!opt.isCorrect}
                  onChange={() => toggleCorrect(opt.id)}
                  className="accent-blue-600"
                />
                <input
                  value={opt.text}
                  onChange={(e) => updateOptionText(opt.id, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
                  aria-label={`Option ${idx + 1} text`}
                  placeholder={`Option ${idx + 1}`}
                />
                <button onClick={() => removeOption(opt.id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" aria-label={`Remove option ${idx + 1}`}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded bg-red-600 text-white hover:bg-red-700" aria-label="Cancel editing">
            Cancel
          </button>
          <button onClick={save} disabled={isProcessing} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" aria-label="Save changes">
            {isProcessing ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   SingleQuestionManagement (unchanged core behavior)
   ------------------------- */

type Option = { id: string; text: string };

function SingleQuestionManagement({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { id: "opt1", text: "" },
    { id: "opt2", text: "" },
    { id: "opt3", text: "" },
    { id: "opt4", text: "" },
  ]);
  const [correct, setCorrect] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const addOption = () => {
    const next = { id: `opt${Date.now()}`, text: "" };
    setOptions((s) => [...s, next]);
  };

  const removeOption = (id: string) => {
    setOptions((s) => s.filter((o) => o.id !== id));
    if (correct === id) setCorrect(null);
  };

  const updateOptionText = (id: string, text: string) => {
    setOptions((s) => s.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const resetForm = () => {
    setCategory("");
    setQuestion("");
    setOptions([
      { id: "opt1", text: "" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
    ]);
    setCorrect(null);
    setMessage(null);
  };

  const createQuestion = async () => {
    setMessage(null);

    // Client-side validation
    if (!category.trim()) {
      setMessage({ type: "error", text: "Please enter a category." });
      return;
    }
    if (!question.trim()) {
      setMessage({ type: "error", text: "Please enter the question text." });
      return;
    }
    const filled = options.filter((o) => o.text.trim());
    if (filled.length < 2) {
      setMessage({ type: "error", text: "Please provide at least two options." });
      return;
    }
    if (!correct) {
      setMessage({ type: "error", text: "Please select the correct option." });
      return;
    }

    const optionsStrings = options.map((o) => o.text.trim());
    // determine correctIndex by position in options array
    const correctIndex = options.findIndex((o) => o.id === correct);

    if (correctIndex < 0 || correctIndex >= optionsStrings.length) {
      setMessage({ type: "error", text: "Selected correct option is invalid." });
      return;
    }

    const payload = {
      category: category.trim(),
      question: question.trim(),
      options: optionsStrings,
      correctIndex,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({ error: "Invalid JSON response" }));

      if (!res.ok) {
        const errText = body?.error || `Server responded ${res.status}`;
        setMessage({ type: "error", text: `Failed to create question: ${errText}` });
        setLoading(false);
        return;
      }

      // success
      setMessage({ type: "success", text: "Question created successfully." });
      // optional: show created id: body.data.id
      resetForm();
    } catch (err: any) {
      setMessage({ type: "error", text: `Network error: ${err?.message || err}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Single Question Management</h1>
        <div className="flex gap-2">
          <button onClick={onBack} className="bg-pink-600 text-white px-3 py-2 rounded shadow" aria-label="Back to questions">
            Back to Questions
          </button>
          <button onClick={resetForm} className="bg-pink-600 text-white  px-3 py-2 rounded shadow" aria-label="Cancel creation">
            Cancel
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-semibold mb-2 text-gray-900">Add New Question</h2>

          <label className="block text-sm text-gray-800 mb-1" htmlFor="single-category">
            Category
          </label>
          <input
            id="single-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter question category (e.g., Mathematics, Science, etc.)"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-gray-900 bg-white"
            disabled={loading}
            aria-label="Question category"
          />

          <label className="block text-sm text-gray-800 mb-1" htmlFor="single-question">
            Question
          </label>
          <textarea
            id="single-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            className="w-full border border-gray-300 rounded px-3 py-2 h-28 mb-4 text-gray-900 bg-white"
            disabled={loading}
            aria-label="Question text"
          />

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Options</label>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-3">
                  <label className="flex items-center gap-2" aria-label={`Select option ${idx + 1} as correct`}>
                    <input
                      type="radio"
                      name="correct-single"
                      checked={correct === opt.id}
                      onChange={() => setCorrect(opt.id)}
                      disabled={loading}
                      aria-label={`Mark option ${idx + 1} as correct`}
                      className="accent-blue-600"
                    />
                  </label>

                  <input
                    id={`single-option-${opt.id}`}
                    value={opt.text}
                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white"
                    disabled={loading}
                    aria-label={`Option ${idx + 1} text`}
                  />

                  <button
                    onClick={() => removeOption(opt.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    disabled={loading || options.length <= 2}
                    aria-label={`Remove option ${idx + 1}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button onClick={addOption} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading || options.length >= 20} aria-label="Add option">
                Add Option
              </button>
            </div>
          </div>
        </section>

        {message && (
          <div
            role="status"
            className={`p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end items-center gap-3">
          <button onClick={createQuestion} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={loading} aria-label="Create question">
            {loading ? "Saving..." : "Create Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
