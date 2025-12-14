import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExamAssignment extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: "assigned" | "pending" | "completed" | "submitted";
  score?: number;
  percentage?: number;
  passed?: boolean;
  startedAt?: Date;
  completedAt?: Date;
  submittedAt?: Date;
  assignedAt?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExamAssignmentSchema = new Schema<IExamAssignment>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "pending", "completed", "submitted"],
      default: "assigned",
    },
    score: { type: Number },
    percentage: { type: Number },
    passed: { type: Boolean },
    startedAt: { type: Date },
    completedAt: { type: Date },
    submittedAt: { type: Date },
    assignedAt: { type: Date },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate assignments for the same student & exam
ExamAssignmentSchema.index(
  { examId: 1, studentId: 1 },
  { unique: true, name: "unique_exam_student_assignment" }
);

const ExamAssignment: Model<IExamAssignment> =
  mongoose.models.ExamAssignment ||
  mongoose.model<IExamAssignment>("ExamAssignment", ExamAssignmentSchema);

export default ExamAssignment;
