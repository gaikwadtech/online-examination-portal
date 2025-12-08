"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Clock, BookOpen, Target } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
}

interface ExamFormData {
  title: string;
  category: string;
  duration: number;
  passPercentage: number;
  questions: Question[];
}

interface ExamCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: () => void;
}

export default function ExamCreationModal({ isOpen, onClose, onExamCreated }: ExamCreationModalProps) {
  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    category: '',
    duration: 60,
    passPercentage: 70,
    questions: []
  });
  
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: '',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Physics', 'Chemistry', 'Biology'];

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      duration: 60,
      passPercentage: 70,
      questions: []
    });
    setNewQuestion({
      id: '',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addQuestion = () => {
    if (newQuestion.questionText.trim() && newQuestion.options.every(opt => opt.trim())) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...newQuestion, id: Date.now().toString() }]
      }));
      setNewQuestion({
        id: '',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      });
    }
  };

  const removeQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestionOption = (index: number, optionIndex: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[optionIndex] = value;
    setNewQuestion(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category || formData.questions.length === 0) {
      alert('Please fill in all required fields and add at least one question');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          duration: formData.duration,
          passPercentage: formData.passPercentage,
          questions: formData.questions.map(q => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            type: 'multiple-choice'
          }))
        }),
      });

      if (response.ok) {
        alert('Exam created successfully!');
        resetForm();
        onExamCreated();
        handleClose();
      } else {
        const error = await response.json();
        alert(`Failed to create exam: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Exam</h2>
                  <p className="text-gray-600 mt-1">Set up exam details and add questions</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Exam Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Midterm Mathematics Exam"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-1" />
                    Passing Percentage (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.passPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, passPercentage: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <BookOpen className="w-5 h-5 inline mr-2" />
                    Questions ({formData.questions.length})
                  </h3>
                </div>

                {/* Existing Questions */}
                {formData.questions.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {formData.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-700 mb-2">{question.questionText}</p>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                optIndex === question.correctAnswer
                                  ? 'bg-green-100 text-green-800 font-medium'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {optIndex === question.correctAnswer && ' ✓'}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Question */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Add New Question</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text
                      </label>
                      <textarea
                        value={newQuestion.questionText}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter your question here..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer Options
                      </label>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={newQuestion.correctAnswer === index}
                              onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="w-8 font-medium">{String.fromCharCode(65 + index)}.</span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateQuestionOption(0, index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.questions.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  Create Exam
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
