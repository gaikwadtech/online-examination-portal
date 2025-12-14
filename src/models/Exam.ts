import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExam extends Document {
    title: string;
    category: string;
    duration: number; // in minutes
    passPercentage: number;
    questions: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
}

const ExamSchema: Schema<IExam> = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide an exam title'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Please provide an exam category'],
            trim: true,
        },
        duration: {
            type: Number,
            required: [true, 'Please provide exam duration in minutes'],
            min: 1,
        },
        passPercentage: {
            type: Number,
            required: [true, 'Please provide passing percentage'],
            min: 0,
            max: 100,
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
                required: true,
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Exam: Model<IExam> =
    mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);

export default Exam;