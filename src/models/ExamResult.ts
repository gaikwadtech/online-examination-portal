import mongoose, { Schema, Document, Model } from "mongoose";

interface IAnswerRecord {
  questionId: mongoose.Types.ObjectId;
  selectedOptionId?: mongoose.Types.ObjectId | null;
  correctOptionId?: mongoose.Types.ObjectId | null;
  isCorrect: boolean;
}

export interface IExamResult extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  percentage: number;
  result: "pass" | "fail";
  correctAnswers: number;
  wrongAnswers: number;
  startedAt?: Date;
  completedAt?: Date;
  timeTakenSeconds?: number;
  answers: IAnswerRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswerRecord>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOptionId: { type: Schema.Types.ObjectId },
    correctOptionId: { type: Schema.Types.ObjectId },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const ExamResultSchema = new Schema<IExamResult>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    result: { type: String, enum: ["pass", "fail"], required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    timeTakenSeconds: { type: Number },
    answers: { type: [AnswerSchema], default: [] },
  },
  { timestamps: true }
);

// Each student should have only one saved result per exam (latest submission overwrites)
ExamResultSchema.index(
  { examId: 1, studentId: 1 },
  { unique: true, name: "unique_exam_student_result" }
);

const ExamResult: Model<IExamResult> =
  mongoose.models.ExamResult ||
  mongoose.model<IExamResult>("ExamResult", ExamResultSchema);

export default ExamResult;
