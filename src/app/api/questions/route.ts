// src/app/api/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/Question";
import mongoose from "mongoose";

/**
 * Request body:
 * {
 *  category: string,
 *  question: string,
 *  options: string[],        // at least 2 (or enforce exactly 4 if you prefer)
 *  correctIndex: number      // 0-based index
 * }
 */

const BodySchema = z.object({
  category: z.string().min(1, "category is required"),
  question: z.string().min(1, "question is required"),
  options: z
    .array(z.string().min(1, "option text cannot be empty"))
    .min(2, "At least two options are required")
    .max(20, "At most 20 options are allowed"),
  // If you want exactly 4 options, replace .min/.max with .length(4)
  correctIndex: z.number().int().nonnegative(),
});

export async function POST(req: NextRequest) {
  try {
    // ensure DB connection
    await dbConnect();

    // ---- DEBUG: print connection info so we can be sure which DB is used ----
    try {
      console.log("== QUESTIONS API DEBUG ==");
      console.log("MONGODB_URI (env):", process.env.MONGODB_URI);
      console.log("mongoose readyState:", mongoose.connection?.readyState);
      if (mongoose.connection && mongoose.connection.db) {
        console.log("Connected DB name:", mongoose.connection.db.databaseName);
      } else {
        console.log("mongoose.connection.db is not available yet");
      }
      console.log("== /QUESTIONS API DEBUG ==");
    } catch (dbgErr) {
      console.warn("Debug logging failed:", dbgErr);
    }
    // ------------------------------------------------------------------------

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);

    if (!parsed.success) {
      // Use `issues` (Zod v3+) instead of `errors`
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json({ error: firstIssue.message }, { status: 400 });
    }

    const { category, question, options, correctIndex } = parsed.data;

    if (correctIndex >= options.length) {
      return NextResponse.json({ error: "correctIndex is out of range" }, { status: 400 });
    }

    // Normalize (trim) - helps avoid accidental duplicates due to trailing spaces
    const normalizedCategory = category.trim();
    const normalizedQuestion = question.trim();

    // Prepare options subdocs
    const optionsDocs = options.map((opt, i) => ({
      text: opt.trim(),
      isCorrect: i === correctIndex,
    }));

    // Optional proactive check to give nicer 409 message before write
    const existing = await QuestionModel.findOne({
      category: normalizedCategory,
      text: normalizedQuestion,
    }).lean();

    if (existing) {
      return NextResponse.json({ error: "Question already exists in this category" }, { status: 409 });
    }

    // Create document
    const created = await QuestionModel.create({
      category: normalizedCategory,
      text: normalizedQuestion,
      options: optionsDocs,
    });

    // Debug: log created id
    try {
      console.log("Question created with id:", created._id?.toString());
    } catch (e) {
      /* ignore */
    }

    // Return created doc (converted to JSON)
    const responseData = {
      id: created._id,
      category: created.category,
      text: created.text,
      options: created.options.map((o) => ({ id: o._id, text: o.text, isCorrect: o.isCorrect })),
      createdAt: created.createdAt,
    };

    return NextResponse.json({ data: responseData }, { status: 201 });
  } catch (err: any) {
    // Mongo duplicate key error code
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Duplicate question (category + text)" }, { status: 409 });
    }

    console.error("API /api/questions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
// Add this to src/app/api/questions/route.ts (in the same file as POST)
export async function GET() {
  try {
    await dbConnect();

    const docs = await QuestionModel.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const data = docs.map((d: any) => ({
      id: d._id?.toString(),
      category: d.category,
      text: d.text,
      createdAt: d.createdAt,
      options: (d.options || []).map((o: any) => ({
        id: o._id?.toString(),
        text: o.text,
        isCorrect: !!o.isCorrect,
      })),
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/questions error:", err);
    return NextResponse.json({ error: "Could not load questions" }, { status: 500 });
  }
}
