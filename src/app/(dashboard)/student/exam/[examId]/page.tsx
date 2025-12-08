"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  RotateCcw,
  Bookmark,
  CheckCircle2,
  XCircle,
  Circle,
  HelpCircle,
  User,
  BookOpen,
  Timer,
  Award,
  Target,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    // Mark question as visited when answer is selected
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
      const prevQ = exam.questions[newIndex];
      if (prevQ) {
        setVisited((prev) => ({ ...prev, [prevQ._id]: true }));
      }
    } else if (direction === 'next' && currentQuestionIndex < exam.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      const nextQ = exam.questions[newIndex];
      if (nextQ) {
        setVisited((prev) => ({ ...prev, [nextQ._id]: true }));
      }
    }
  };

  const goToQuestion = (index: number) => {
    const currentQ = exam.questions[currentQuestionIndex];
    if (currentQ) {
      setVisited((prev) => ({ ...prev, [currentQ._id]: true }));
    }
    setCurrentQuestionIndex(index);
    const targetQ = exam.questions[index];
    if (targetQ) {
      setVisited((prev) => ({ ...prev, [targetQ._id]: true }));
    }
  };

  const clearResponse = () => {
    const currentQuestion = exam.questions[currentQuestionIndex];
    if (currentQuestion) {
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestion._id];
        return newAnswers;
      });
      // Keep question as visited but mark as not-answered
      setVisited((prev) => ({ ...prev, [currentQuestion._id]: true }));
    }
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
  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-lg font-semibold text-amber-700">
                  {formattedMinutes}:{formattedSeconds}
                </span>
              </div>
              {/* Removed: Student icon and text */}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl">
            {/* Question Info Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {/* Removed: Question Type badge */}
                  <span className="text-lg font-semibold text-gray-900">
                    Question No. {currentQuestionIndex + 1}
                  </span>
                </div>
                {/* Removed: Marks information */}
              </div>
            </div>

            {/* Question Card */}
            <Card className="mb-6 shadow-lg border-0">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  {currentQuestion.options.map((opt: any, index: number) => (
                    <div
                      key={opt._id}
                      onClick={() => handleChoose(currentQuestion._id, opt._id)}
                      className={cn(
                        "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                        answers[currentQuestion._id] === opt._id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                          answers[currentQuestion._id] === opt._id
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-gray-300"
                        )}>
                          {answers[currentQuestion._id] === opt._id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-lg text-gray-900 font-medium">
                          {String.fromCharCode(65 + index)}. {opt.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => toggleMarkForReview(currentQuestion._id)}
                  className={cn(
                    "flex items-center space-x-2",
                    markedForReview[currentQuestion._id] && "bg-orange-100 border-orange-300 text-orange-700"
                  )}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{markedForReview[currentQuestion._id] ? "Marked" : "Mark for Review"}</span>
                </Button>
                <Button variant="outline" onClick={clearResponse} className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear Response</span>
                </Button>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigateQuestion('prev')}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
                <Button
                  onClick={() => navigateQuestion('next')}
                  disabled={currentQuestionIndex === exam.questions.length - 1}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4" />
                  <span>{currentQuestionIndex === exam.questions.length - 1 ? "Submit" : "Save & Next"}</span>
                  {currentQuestionIndex < exam.questions.length - 1 && <ChevronRight className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col h-full overflow-hidden">
          {/* Legend */}
          <Card className="mb-6 flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const counts = getStatusCounts();
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-semibold">
                          {counts.answered}
                        </div>
                        <span className="text-sm text-gray-700">Answered</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center text-white text-xs font-semibold">
                          {counts.notAnswered}
                        </div>
                        <span className="text-sm text-gray-700">Not Answered</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-semibold">
                          {counts.marked}
                        </div>
                        <span className="text-sm text-gray-700">Marked for Review</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-semibold">
                          {counts.notVisited}
                        </div>
                        <span className="text-sm text-gray-700">Not Visited</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-semibold">
                          {counts.answeredMarked}
                        </div>
                        <span className="text-sm text-gray-700">Answered and Marked for Review</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Question Navigation Grid */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-base font-semibold">Choose a Question</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="grid grid-cols-5 gap-4">
                {exam.questions.map((q: any, index: number) => {
                  const status = getQuestionStatus(q._id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  let bgColor = 'bg-gray-400'; // not-visited (default)
                  if (status === 'answered') bgColor = 'bg-blue-600';
                  else if (status === 'not-answered') bgColor = 'bg-pink-500';
                  else if (status === 'marked') bgColor = 'bg-orange-500';
                  else if (status === 'answered-marked') bgColor = 'bg-orange-500';
                  else if (status === 'not-visited') bgColor = 'bg-gray-400';
                  
                  return (
                    <button
                      key={q._id}
                      onClick={() => goToQuestion(index)}
                      className={cn(
                        "w-10 h-10 rounded-md flex items-center justify-center font-semibold text-white text-sm transition-all duration-200 hover:scale-110 hover:shadow-lg",
                        bgColor,
                        isCurrent && "ring-2 ring-blue-500 ring-offset-2 scale-110"
                      )}
                      title={`Question ${index + 1}: ${status.replace('-', ' ')}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
