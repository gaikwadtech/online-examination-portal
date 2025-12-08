import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

import Exam from "@/models/Exam";
import Question from "@/models/Question";
import User from "@/models/User";
import ExamAssignment from "@/models/ExamAssignment";
import { verifyToken } from "@/lib/auth";

// =========================
// GET ALL EXAMS (ADMIN)
// =========================
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    // allow both teacher and admin to manage exams
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "teacher")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const exams = await Exam.find()
      .populate("questions")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ exams }, { status: 200 });
  } catch (error: any) {
    console.error("EXAMS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

// =========================
// CREATE EXAM (ADMIN)
// =========================
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    // allow both teacher and admin to create exams
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "teacher")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, duration, passPercentage, questions, description, isActive } = body;

    if (
      !title ||
      !category ||
      duration === undefined ||
      passPercentage === undefined ||
      !questions ||
      questions.length === 0
    ) {
      return NextResponse.json(
        { error: "Title, category, duration, pass percentage and questions are required" },
        { status: 400 }
      );
    }

    const durationNum = Number(duration);
    const passPctNum = Number(passPercentage);

    if (Number.isNaN(durationNum) || durationNum <= 0) {
      return NextResponse.json({ error: "Duration must be greater than 0" }, { status: 400 });
    }

    if (Number.isNaN(passPctNum) || passPctNum < 0 || passPctNum > 100) {
      return NextResponse.json({ error: "Pass percentage must be between 0 and 100" }, { status: 400 });
    }

    // Check if questions is an array of IDs (strings) or question objects
    let questionIds: string[] = [];
    
    if (Array.isArray(questions)) {
      // Check if first element is a string (ID) or object
      if (typeof questions[0] === 'string') {
        // Array of question IDs - validate they exist
        questionIds = questions;
        
        // Validate all question IDs exist
        const existingQuestions = await Question.find({
          _id: { $in: questionIds.map(id => new mongoose.Types.ObjectId(id)) }
        });
        
        if (existingQuestions.length !== questionIds.length) {
          return NextResponse.json(
            { error: "Some question IDs are invalid or not found" },
            { status: 400 }
          );
        }
      } else {
        // Array of question objects - create new questions (legacy support)
        for (const questionData of questions) {
          const { questionText, options, correctAnswer } = questionData;
          
          if (!questionText || !options || correctAnswer === undefined) {
            return NextResponse.json(
              { error: "Invalid question format. Each question must have questionText, options, and correctAnswer" },
              { status: 400 }
            );
          }
          
          // Format options for Question model
          const formattedOptions = options.map((optionText: string, index: number) => ({
            text: optionText,
            isCorrect: index === correctAnswer
          }));

          const question = await Question.create({
            category,
            text: questionText,
            options: formattedOptions
          });

          questionIds.push((question._id as mongoose.Types.ObjectId).toString());
        }
      }
    } else {
      return NextResponse.json(
        { error: "Questions must be an array" },
        { status: 400 }
      );
    }

    // Convert decoded.id to ObjectId if valid, otherwise skip createdBy (for hardcoded admin users)
    let createdById: mongoose.Types.ObjectId | undefined = undefined;
    
    // Check if decoded.id is a valid ObjectId
    if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
      // Verify the user actually exists in the database before using the ID
      const userExists = await User.findById(decoded.id);
      if (userExists) {
        createdById = new mongoose.Types.ObjectId(decoded.id);
      } else {
        console.warn(`User with ID ${decoded.id} not found in database. Exam will be created without createdBy field.`);
      }
    } else {
      // If not a valid ObjectId (e.g., hardcoded admin ID like "admin-fixed-id-12345")
      // Skip createdBy since the schema allows it to be optional
      // This handles the case where admin users are hardcoded and not in the database
      console.log(`Skipping createdBy field for user with non-ObjectId ID: ${decoded.id}`);
    }

    // Create exam with question references
    const examData: any = {
      title,
      description: description || "",
      category,
      duration: durationNum,
      passPercentage: passPctNum,
      questions: questionIds,
      isActive: isActive !== undefined ? isActive : true,
    };
    
    // Only add createdBy if we have a valid ObjectId
    if (createdById) {
      examData.createdBy = createdById;
    }

    const newExam = await Exam.create(examData);

    // Automatically assign exam to all students
    const allStudents = await User.find({ role: 'student' });
    
    if (allStudents.length > 0) {
      const assignments = allStudents.map(student => ({
        studentId: student._id,
        examId: newExam._id,
        status: 'assigned',
        assignedAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Due in 7 days
      }));

      await ExamAssignment.insertMany(assignments);
    }

    return NextResponse.json(
      { message: "Exam created successfully", exam: newExam },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("EXAMS POST ERROR:", error);
    
    // Provide more detailed error message
    let errorMessage = "Failed to create exam";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${Object.values(error.errors || {}).map((e: any) => e.message).join(', ')}`;
    } else if (error.code === 11000) {
      errorMessage = "An exam with this title already exists";
    }
    
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    );
  }
}
