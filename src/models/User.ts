import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  phone?: string;
  college?: string;
  group?: string;
  photo?: string;
  accountStatus?: string;
  registrationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },
    // --- Profile Fields ---
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    college: {
      type: String,
      default: '',
      trim: true,
    },
    group: {
      type: String, // e.g. "Class A", "Batch 2024"
      default: '',
      trim: true,
    },
    photo: {
      type: String, // URL to the image
      default: '',
    },
    accountStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    // If you want a specific registration date separate from 'createdAt'
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Create indexes for better query performance
UserSchema.index({ email: 1 });

// Pre-save middleware to ensure registrationDate is set
UserSchema.pre('save', function(next) {
  if (!this.registrationDate) {
    this.registrationDate = new Date();
  }
  next();
});

// Prevent recompilation of model in development (Next.js Hot Reload fix)
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;