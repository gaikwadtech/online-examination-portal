// models/Question.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOption {
  _id?: mongoose.Types.ObjectId;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  category: string;
  text: string;
  options: IOption[];
  createdAt: Date;
}

const OptionSchema = new Schema<IOption>(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, required: true, default: false },
  },
  { _id: true } // create an _id for each option
);

const QuestionSchema = new Schema<IQuestion>(
  {
    category: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    options: { type: [OptionSchema], required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  {
    // do not auto-populate virtuals etc
  }
);

// Compound unique index: prevents duplicate (category + text)
QuestionSchema.index({ category: 1, text: 1 }, { unique: true, name: "unique_category_text" });

/**
 * On dev HMR, avoid compiling model multiple times.
 * Use mongoose.models[<name>] if already registered.
 */
const QuestionModel: Model<IQuestion> =
  (mongoose.models.Question as Model<IQuestion>) || mongoose.model<IQuestion>("Question", QuestionSchema);

export default QuestionModel;
