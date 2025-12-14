// src/app/api/admin/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/Question";

/**
 * GET /api/admin/questions?q=&category=&page=1&pageSize=10
 * returns { data: QuestionDTO[], total }
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const category = (url.searchParams.get("category") || "").trim();
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(url.searchParams.get("pageSize") || "10", 10)));

    const filter: any = {};
    if (q) filter.text = { $regex: q, $options: "i" };
    if (category) filter.category = category;

    const total = await QuestionModel.countDocuments(filter);
    const docs = await QuestionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
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

    return NextResponse.json({ data, total }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/admin/questions error:", err);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }
}

/**
 * POST /api/admin/questions
 * Creates a new question
 * Body: { category, question, options: string[], correctIndex: number }
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const { category, question, options, correctIndex } = body;

    // Basic Validation
    if (!category || !question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Invalid payload. required: category, question, options[]" },
        { status: 400 }
      );
    }

    // Map options to schema format
    const formattedOptions = options.map((text: string, idx: number) => ({
      text,
      isCorrect: idx === correctIndex,
    }));

    // Ensure at least one correct option if correctIndex was valid
    if (!formattedOptions.some((o: any) => o.isCorrect)) {
      return NextResponse.json(
        { error: "Invalid correctIndex provided" },
        { status: 400 }
      );
    }

    // Create
    const newQ = await QuestionModel.create({
      category,
      text: question,
      options: formattedOptions,
    });

    return NextResponse.json(
      { message: "Created successfully", data: newQ },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/questions error:", err);
    // Duplicate key error
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "A question with this text already exists in this category." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Failed to create question" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/questions
 * Bulk delete questions
 * Body: { ids: string[] }
 */
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload. required: ids[]" },
        { status: 400 }
      );
    }

    const res = await QuestionModel.deleteMany({ _id: { $in: ids } });

    return NextResponse.json(
      { message: `Deleted ${res.deletedCount} questions`, count: res.deletedCount },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("DELETE /api/admin/questions error:", err);
    return NextResponse.json(
      { error: "Failed to delete questions" },
      { status: 500 }
    );
  }
}
