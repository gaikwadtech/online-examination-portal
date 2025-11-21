// src/app/(dashboard)/admin/questions/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import BulkUploadExcel from "./BulkUploadExcel";
import { useRouter } from "next/navigation";

export default function QuestionsPage() {
  // allow only the views we need: choose, single, bulk, list
  const [view, setView] = useState<"choose" | "single" | "bulk" | "list">("choose");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {view === "choose" ? (
          <ChooseQuestionAdd
            onSelect={(v) => setView(v)}
            onShowAll={() => setView("list")}
          />
        ) : view === "single" ? (
          <SingleQuestionManagement onBack={() => setView("choose")} />
        ) : view === "bulk" ? (
          <BulkUploadExcel onBack={() => setView("choose")} />
        ) : (
          <AllQuestions onBack={() => setView("choose")} />
        )}
      </div>
    </div>
  );
}

/**
 * ChooseQuestionAdd
 *
 * Note: router is used only inside this component so it exists on client side.
 * The Back to Dashboard button will navigate to /admin by default; change the path
 * in router.push(...) if your dashboard lives at a different route.
 */
function ChooseQuestionAdd({
  onSelect,
  onShowAll,
}: {
  onSelect: (v: "single" | "bulk") => void;
  onShowAll: () => void;
}) {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
          <p className="text-gray-800 mt-1">Manage your question bank and categories</p>
        </div>
        <div>
          {/* CHANGE PATH if your dashboard root differs (e.g. "/" or "/admin/dashboard") */}
          <button
            onClick={() => router.push("/admin")}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center w-full">
            <h2 className="text-xl font-semibold text-gray-900">Choose Question Addition Method</h2>
            <p className="text-gray-800 mt-1">Select how you want to add questions</p>
          </div>
          {/* "All Questions" button */}
          <div className="ml-4">
            <button
              onClick={onShowAll}
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
            >
              All Questions
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            onClick={() => onSelect("single")}
            title="Add Single Question"
            subtitle="Create individual questions with custom categories and options"
            icon={
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">+</div>
            }
          />

          <Card
            onClick={() => onSelect("bulk")}
            title="Bulk Upload"
            subtitle="Upload multiple questions at once using Excel template"
            icon={
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">↓</div>
            }
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, icon, onClick }: { title: string; subtitle: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left border-2 border-dashed border-gray-200 rounded-lg p-6 hover:shadow transition flex items-start gap-4">
      <div>{icon}</div>
      <div className="flex-1">
        <div className="font-semibold text-lg text-gray-900">{title}</div>
        <div className="text-sm text-gray-800 mt-1">{subtitle}</div>
      </div>
    </button>
  );
}

// -------------------------
// All Questions view (NEW)
// -------------------------
type QOption = { id: string; text: string; isCorrect: boolean };
type QuestionDTO = {
  id: string;
  category: string;
  text: string;
  createdAt?: string | number | Date;
  options?: QOption[];
};

function AllQuestions({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  // track expanded rows by question id
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions"); // GET
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const body = await res.json();
      const data: QuestionDTO[] = (body.data || []).map((d: any) => ({
        id: String(d.id ?? d._id ?? ""),
        category: String(d.category ?? ""),
        text: String(d.text ?? ""),
        createdAt: d.createdAt ?? d.createdAt,
        options: (d.options || []).map((o: any) => ({
          id: String(o.id ?? o._id ?? ""),
          text: String(o.text ?? ""),
          isCorrect: !!o.isCorrect,
        })),
      }));
      setQuestions(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // helper: return truncated text by words
  const truncateWords = (text: string, limit: number) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(" ");
  };

  const toggleExpand = (id: string) => {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  };

  // how many words to show before "more"
  const WORD_LIMIT = 15;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Questions</h1>
        <div className="flex gap-2">
          <button onClick={onBack} className="bg-pink-600 text-white px-3 py-2 rounded">Back to Questions</button>
          <button onClick={load} className="bg-pink-600 text-white px-3 py-2 rounded">Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading questions…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : questions.length === 0 ? (
        <div className="text-gray-600">No questions found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2 text-black text-bold">Category</th>
                <th className="p-2 text-black">Question</th>
                <th className="p-2 text-black">Options</th>
                <th className="p-2 text-black">Created</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => {
                const isExpanded = !!expanded[q.id];
                const shouldTruncate = q.text.split(/\s+/).length > WORD_LIMIT;
                const preview = truncateWords(q.text, WORD_LIMIT);

                return (
                  <tr key={q.id} className="border-b last:border-b-0 align-top">
                    <td className="p-3 align-top w-40">
                      <div className="text-sm font-semibold text-gray-900">{q.category}</div>
                    </td>

                    <td className="p-3 align-top max-w-2xl">
                      <div className="text-base text-gray-900 leading-relaxed wrap-break-word" title={q.text}>
                        {isExpanded ? (
                          // full text when expanded
                          <>
                            <div>{q.text}</div>
                            {shouldTruncate && (
                              <button
                                onClick={() => toggleExpand(q.id)}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                                aria-expanded="true"
                                aria-controls={`q-${q.id}`}
                              >
                                Show less
                              </button>
                            )}
                          </>
                        ) : (
                          // truncated preview + "more" button if needed
                          <>
                            <div id={`q-${q.id}`}>
                              {shouldTruncate ? `${preview}…` : q.text}
                            </div>
                            {shouldTruncate && (
                              <button
                                onClick={() => toggleExpand(q.id)}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                                aria-expanded="false"
                                aria-controls={`q-${q.id}`}
                              >
                                …more
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    <td className="p-3 align-top w-80">
                      <div className="flex flex-col gap-2">
                        {(q.options || []).map((o) => (
                          <div
                            key={o.id}
                            className={
                              o.isCorrect
                                ? "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-800 text-sm font-medium w-max"
                                : "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm w-max"
                            }
                          >
                            <span className="truncate max-w-md">{o.text}</span>
                            {o.isCorrect ? (
                              <span className="text-green-700 font-bold">✓</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-3 align-top">
                      <div className="text-sm text-gray-600">
                        {q.createdAt ? new Date(q.createdAt).toLocaleString() : "-"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// -------------------------
// Single Question management UI
// (same as your existing component — unchanged)
// -------------------------

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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Single Question Management</h1>
        <div className="flex gap-2">
          <button onClick={onBack} className="bg-pink-600 text-white px-3 py-2 rounded">Back to Questions</button>
          <button onClick={resetForm} className="bg-pink-600 text-white  px-3 py-2 rounded">Cancel</button>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-semibold mb-2 text-gray-900">Add New Question</h2>

          <label className="block text-sm text-gray-800 mb-1">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter question category (e.g., Mathematics, Science, etc.)"
            className="w-full border rounded px-3 py-2 mb-4 text-gray-900"
            disabled={loading}
          />

          <label className="block text-sm text-gray-800 mb-1">Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            className="w-full border rounded px-3 py-2 h-28 mb-4 text-gray-900"
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Options</label>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={correct === opt.id}
                      onChange={() => setCorrect(opt.id)}
                      disabled={loading}
                    />
                  </label>

                  <input
                    value={opt.text}
                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 border rounded px-3 py-2 text-gray-900"
                    disabled={loading}
                  />

                  <button onClick={() => removeOption(opt.id)} className="bg-red-600 text-white px-3 py-1 rounded" disabled={loading || options.length <= 2}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button onClick={addOption} className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading || options.length >= 20}>
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
          <button onClick={createQuestion} className="bg-blue-600 text-white px-5 py-2 rounded disabled:opacity-50" disabled={loading}>
            {loading ? "Saving..." : "Create Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
