"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Timer,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export default function TakeExamPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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
        // Mark first question as visited when exam loads
        if (data.exam.questions && data.exam.questions.length > 0) {
          setVisited({ [data.exam.questions[0]._id]: true });
        }
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
  // Mark current question as visited
  // --------------------------
  useEffect(() => {
    if (exam && exam.questions && exam.questions[currentQuestionIndex]) {
      const currentQ = exam.questions[currentQuestionIndex];
      setVisited((prev) => ({ ...prev, [currentQ._id]: true }));
    }
  }, [currentQuestionIndex, exam]);

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
    setVisited((prev) => ({ ...prev, [qid]: true }));
  };

  const toggleMarkForReview = (qid: string) => {
    setMarkedForReview((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  const getQuestionStatus = (questionId: string) => {
    const hasAnswer = !!answers[questionId];
    const isMarked = !!markedForReview[questionId];
    const isVisited = !!visited[questionId];
    
    if (hasAnswer && isMarked) {
      return "answered-marked";
    } else if (hasAnswer) {
      return "answered";
    } else if (isMarked) {
      return "marked";
    } else if (isVisited) {
      return "not-answered";
    } else {
      return "not-visited";
    }
  };

  // Calculate status counts for the legend
  const getStatusCounts = () => {
    if (!exam || !exam.questions) return { answered: 0, notAnswered: 0, marked: 0, notVisited: 0, answeredMarked: 0 };
    
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let notVisited = 0;
    let answeredMarked = 0;
    
    exam.questions.forEach((q: any) => {
      const status = getQuestionStatus(q._id);
      if (status === 'answered') answered++;
      else if (status === 'not-answered') notAnswered++;
      else if (status === 'marked') marked++;
      else if (status === 'not-visited') notVisited++;
      else if (status === 'answered-marked') answeredMarked++;
    });
    
    return { answered, notAnswered, marked, notVisited, answeredMarked };
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
    const currentQ = exam.questions[currentQuestionIndex];
    if (currentQ) {
      setVisited((prev) => ({ ...prev, [currentQ._id]: true }));
    }
    
    if (direction === 'prev' && currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      // Do NOT scroll - keep the page static
      if (document.activeElement instanceof HTMLElement) (document.activeElement as HTMLElement).blur();
    } else if (direction === 'next' && currentQuestionIndex < exam.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      // Do NOT scroll - keep the page static
      if (document.activeElement instanceof HTMLElement) (document.activeElement as HTMLElement).blur();
    }
  };

  const goToQuestion = (index: number) => {
    const currentQ = exam.questions[currentQuestionIndex];
    if (currentQ) {
      setVisited((prev) => ({ ...prev, [currentQ._id]: true }));
    }
    setCurrentQuestionIndex(index);
    // Blur focused element so browser doesn't auto-scroll the focused button into view
    if (document.activeElement instanceof HTMLElement) (document.activeElement as HTMLElement).blur();
  };

  const clearResponse = () => {
    const currentQ = exam.questions[currentQuestionIndex];
    if (currentQ) {
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQ._id];
        return newAnswers;
      });
    }
  };

  // --------------------------
  // Submit Exam
  // --------------------------
  // --------------------------
  // Submit Exam
  // --------------------------
  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    
    // Calculate time taken (Duration - Remaining Timer)
    // Make sure we handle potential edge cases where timer might be off
    const totalDurationSeconds = exam ? exam.duration * 60 : 0;
    const timeTaken = Math.max(0, totalDurationSeconds - timer);

    try {
      const res = await fetch(`/api/exams/submit/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send answers AND timeTaken to the server
        body: JSON.stringify({ answers, timeTaken }),
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <Timer className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Loading Exam...</h2>
            <p className="text-gray-600">Preparing your examination environment</p>
          </div>
        </div>
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
  // RESULT SCREEN
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
  // EXAM TAKING SCREEN (STATIC LAYOUT)
  // --------------------------
  const formattedMinutes = Math.floor(timer / 60);
  const formattedSeconds = String(timer % 60).padStart(2, "0");
  const currentQuestion = exam.questions[currentQuestionIndex];
  const counts = getStatusCounts();

  return (
    // REMOVED h-screen and overflow-hidden. Use min-h-screen for full page scroll.
    <div className="flex h-screen bg-gray-50 font-sans items-start overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* LEFT: Question Area */}
      {/* REMOVED overflow-y-auto. Let it grow naturally. */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Content Container */}
        <div className="flex-1 p-4 md:p-8">
            <div className="max-w-5xl mx-auto h-full flex flex-col">
                
                {/* Question Card */}
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 flex-1 flex flex-col mb-4 mt-15">

                    <div className="mb-10 border-b border-gray-100 pb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                            Q{currentQuestionIndex + 1}. {currentQuestion.text}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        {currentQuestion.options.map((opt: any, index: number) => {
                            const isSelected = answers[currentQuestion._id] === opt._id;
                            const letter = String.fromCharCode(65 + index); // A, B, C, D
                            
                            return (
                                <div
                                    key={opt._id}
                                    onClick={() => handleChoose(currentQuestion._id, opt._id)}
                                    className={cn(
                                        "group flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                        isSelected 
                                            ? "border-indigo-600 bg-indigo-50/50" 
                                            : "border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50"
                                    )}
                                >
                                    {/* Circle Letter */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-base font-bold mr-5 shrink-0 transition-colors border",
                                        isSelected
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-gray-50 text-gray-500 border-gray-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:border-indigo-200"
                                    )}>
                                        {letter}
                                    </div>
                                    
                                    {/* Option Text */}
                                    <span className={cn(
                                        "text-gray-700 text-lg font-medium",
                                        isSelected && "text-gray-900"
                                    )}>
                                        {opt.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>

        {/* Footer (Not Fixed anymore, sits at bottom of content) */}
        <div className="shrink-0 bg-white border-t border-gray-200 pt-4 pb-8 px-4 md:px-8 shadow-sm mt-auto">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                {/* Previous Button - Left Aligned */}
                <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigateQuestion('prev')}
                    disabled={currentQuestionIndex === 0}
                    className="text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                </Button>

                {/* Right Aligned Group */}
                <div className="flex gap-4">
                    {/* Clear Response */}
                    {answers[currentQuestion._id] && (
                         <Button 
                            variant="ghost"
                            size="lg"
                            onClick={clearResponse}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 mr-2 hidden md:flex"
                        >
                            Clear
                        </Button>
                    )}

                    <Button 
                        variant="outline"
                        size="lg"
                        onClick={() => toggleMarkForReview(currentQuestion._id)}
                        className={cn(
                            "border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors",
                            markedForReview[currentQuestion._id] && "bg-amber-50 border-amber-500 font-semibold"
                        )}
                    >
                         {markedForReview[currentQuestion._id] ? "Marked" : "Mark for Review"}
                    </Button>

                    <Button 
                        size="lg"
                        onClick={() => navigateQuestion('next')}
                        disabled={currentQuestionIndex === exam.questions.length - 1}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 text-lg font-medium transition-colors shadow-sm hover:shadow-md"
                    >
                        Next
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>

      </div>

      {/* RIGHT: Sidebar - Sticky */}
      {/* Added sticky top-0 h-screen so it stays visible while scrolling the left side */}
      <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-xl sticky top-0 h-screen z-30">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <div className="bg-purple-100 p-2 rounded-lg">
                 <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">Questions</span>
        </div>

        {/* TIMER */}
        <div className="p-5 pb-0 shrink-0">
            <div className="bg-blue-500 text-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Time Remaining</span>
                <div className="text-5xl font-mono font-bold tracking-wider text-white tabular-nums drop-shadow-md">
                    {formattedMinutes}:{formattedSeconds}
                </div>
            </div>
        </div>

        {/* Sidebar Content (Scrollable Grid HIDDEN SCROLLBAR) */}
        {/* We keep overflow-y-auto here so the grid can scroll if it's huge, but hide the bar visually */}
        <div className="flex-1 overflow-y-auto p-5 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Pagination Grid */}
            <div>
                 {/* Legend */}
                 <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-100"></div>
                        <span className="text-xs text-gray-500 font-medium">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-500 font-medium">Done</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                        <span className="text-xs text-gray-500 font-medium">Marked</span>
                    </div>
                 </div>

                <div className="grid grid-cols-5 gap-3">
                    {exam.questions.map((q: any, index: number) => {
                    const status = getQuestionStatus(q._id);
                    const isCurrent = index === currentQuestionIndex;
                    
                    let buttonClass = "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300";
                    
                    if (isCurrent) {
                        buttonClass = "bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200 z-10 scale-105";
                    } else if (status === 'answered') {
                        buttonClass = "bg-green-100 text-green-700 border-green-200 font-medium";
                    } else if (status === 'marked' || status === 'answered-marked') {
                        buttonClass = "bg-amber-100 text-amber-700 border-amber-200 font-medium";
                    } 

                    return (
                        <button
                        key={q._id}
                        onClick={() => goToQuestion(index)}
                        className={cn(
                            "w-full aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200",
                            buttonClass
                        )}
                        >
                        {index + 1}
                        </button>
                    );
                    })}
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-100">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Answered</span>
                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border shadow-sm">{counts.answered}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Marked</span>
                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border shadow-sm">{counts.marked}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Remaining</span>
                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border shadow-sm">{counts.notAnswered + counts.notVisited}</span>
                </div>
            </div>

        </div>

        {/* Submit Button Area - Fixed at bottom of sidebar */}
        <div className="pt-5 pb-8 px-5 border-b border-gray-200 bg-gray-50/50 backdrop-blur-sm mt-1">
            <Button 
                onClick={handleSubmit} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg rounded-xl shadow-md transition-all hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px]"
            >
                Submit Exam
            </Button>
        </div>

      </div>
    </div>
  );
}
