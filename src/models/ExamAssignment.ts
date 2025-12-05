import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExamAssignment extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: "pending" | "completed";
  score?: number;
  percentage?: number;
  passed?: boolean;
  startedAt?: Date;
  completedAt?: Date;
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
      enum: ["pending", "completed"],
      default: "pending",
    },
    score: { type: Number },
    percentage: { type: Number },
    passed: { type: Boolean },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const ExamAssignment: Model<IExamAssignment> =
  mongoose.models.ExamAssignment ||
  mongoose.model<IExamAssignment>("ExamAssignment", ExamAssignmentSchema);

export default ExamAssignment;
