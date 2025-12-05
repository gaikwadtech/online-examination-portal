"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Clock } from "lucide-react";

export default function TakeExamPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  // --------------------------
  // Fetch Exam
  // --------------------------
  useEffect(() => {
    if (examId) fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const res = await fetch(`/api/exams/start/${examId}`);
      const data = await res.json();

      if (res.ok) {
        setExam(data.exam);
        setTimer(data.exam.duration * 60);
      } else {
        alert(data.error || "Exam not available");
        router.push("/student/exam");
      }
    } catch (err) {
      console.error("Fetch exam error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Timer Auto-Submit
  // --------------------------
  useEffect(() => {
    if (!timer || submitted) return;

    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, submitted]);

  // --------------------------
  // Choose Answer
  // --------------------------
  const handleChoose = (qid: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionId }));
  };

  // --------------------------
  // Submit Exam
  // --------------------------
  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    try {
      const res = await fetch(`/api/exams/submit/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || "Submit failed");
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // --------------------------
  // Loading screen
  // --------------------------
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-10 text-center text-red-600 font-semibold text-lg">
        Exam not found.
      </div>
    );
  }

  // --------------------------
  // RESULT SCREEN (Retry Removed)
  // --------------------------
  if (submitted && result) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-10">

        <h1 className="text-4xl font-extrabold text-indigo-700 text-center">
          Exam Completed
        </h1>

        {/* Score Card */}
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
          <p className="text-2xl font-bold text-gray-900">
            Score:{" "}
            <span className="text-indigo-700">{result.score}</span> /{" "}
            {result.total}
          </p>

          <p
            className={`text-2xl mt-2 font-extrabold ${
              result.passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {result.passed ? "PASSED 🎉" : "FAILED ❌"}
          </p>

          {/* Go Back Only */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.push("/student/exam")}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Review Section */}
        <h2 className="text-3xl font-bold text-gray-900">Answer Review</h2>

        <div className="space-y-6">
          {result.review.map((item: any, index: number) => (
            <div
              key={item.qid}
              className="bg-white shadow rounded-xl p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {index + 1}. {item.question}
              </h3>

              {/* USER ANSWER */}
              <p className="text-base">
                <span className="font-semibold text-gray-700">Your Answer: </span>
                <span
                  className={`font-bold ${
                    item.correct ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.selectedText || "Not answered"}
                </span>
              </p>

              {/* CORRECT ANSWER */}
              {!item.correct && (
                <p className="text-base mt-1">
                  <span className="font-semibold text-gray-700">
                    Correct Answer:
                  </span>{" "}
                  <span className="font-bold text-green-600">
                    {item.correctText}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------
  // EXAM TAKING SCREEN
  // --------------------------
  const formattedMinutes = Math.floor(timer / 60);
  const formattedSeconds = String(timer % 60).padStart(2, "0");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>

        {/* Visible Timer */}
        <div className="flex items-center gap-3 backdrop-blur-md bg-white/70 px-6 py-3 rounded-2xl shadow-lg border border-white/40">
          <Clock size={24} className="text-indigo-700 drop-shadow" />
          <span className="text-3xl font-extrabold text-indigo-800 drop-shadow">
            {formattedMinutes}:{formattedSeconds}
          </span>
        </div>
      </div>

      {/* Questions */}
      {exam.questions.map((q: any, index: number) => (
        <div key={q._id} className="p-5 bg-white rounded-lg shadow">
          <h2 className="font-semibold text-gray-900 text-lg mb-3">
            {index + 1}. {q.text}
          </h2>

          <div className="space-y-3">
            {q.options.map((opt: any) => (
              <label
                key={opt._id}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <input
                  type="radio"
                  name={`q-${q._id}`}
                  value={opt._id}
                  checked={answers[q._id] === opt._id}
                  onChange={() => handleChoose(q._id, opt._id)}
                />
                <span className="text-gray-900">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={submitted}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
      >
        Submit Exam
      </button>
    </div>
  );
}
