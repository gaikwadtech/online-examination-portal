// src/app/api/questions/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/Question";
import mongoose from "mongoose";
import { z } from "zod";

/**
 * Update/Delete/Get single question by id
 *
 * Notes:
 * - `params` may be a Promise in App Router route handlers — await it.
 * - Accepts PUT body:
 *   { category: string, text: string, options: { id?: string, text: string, isCorrect?: boolean }[] }
 */

const UpdateBody = z.object({
  category: z.string().min(1),
  text: z.string().min(1),
  options: z
    .array(
      z.object({
        // option id can be provided (existing option) or absent for new option
        id: z.string().optional(),
        text: z.string().min(1),
        isCorrect: z.boolean().optional(),
      })
    )
    .min(2, "At least 2 options required"),
});

async function ensureDb() {
  // your existing db connect helper
  await dbConnect();
  console.log("mongoose readyState:", mongoose.connection?.readyState);
  if (mongoose.connection && mongoose.connection.db) {
    console.log("Connected DB:", mongoose.connection.db.databaseName);
  }
}

export async function GET(req: Request, { params }: { params: any }) {
  try {
    await ensureDb();
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const doc = await QuestionModel.findById(id).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = {
      id: doc._id?.toString(),
      category: doc.category,
      text: doc.text,
      createdAt: doc.createdAt,
      options: (doc.options || []).map((o: any) => ({
        id: o._id?.toString(),
        text: o.text,
        isCorrect: !!o.isCorrect,
      })),
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/questions/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    await ensureDb();

    // params is a Promise — await it to read id
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const json = await req.json().catch(() => ({}));
    const parsed = UpdateBody.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json({ error: first.message }, { status: 400 });
    }

    const { category, text, options } = parsed.data;

    // Ensure exactly one correct option
    const correctCount = options.filter((o) => !!o.isCorrect).length;
    if (correctCount === 0) {
      return NextResponse.json({ error: "Select a correct option" }, { status: 400 });
    }
    if (correctCount > 1) {
      return NextResponse.json({ error: "Only one correct option allowed" }, { status: 400 });
    }

    // Build options subdocs: if option has id, preserve it; otherwise let Mongoose create new _id
    const optionsForSave = options.map((o) => ({
      _id: o.id ? new mongoose.Types.ObjectId(o.id) : undefined,
      text: o.text.trim(),
      isCorrect: !!o.isCorrect,
    }));

    // Normalize fields to avoid accidental duplicates (trimming)
    const normalizedCategory = category.trim();
    const normalizedText = text.trim();

    // Update document (replace category, text, options)
    const updated = await QuestionModel.findByIdAndUpdate(
      id,
      {
        category: normalizedCategory,
        text: normalizedText,
        options: optionsForSave,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const response = {
      id: updated._id?.toString(),
      category: updated.category,
      text: updated.text,
      createdAt: updated.createdAt,
      options: (updated.options || []).map((o: any) => ({
        id: o._id?.toString(),
        text: o.text,
        isCorrect: !!o.isCorrect,
      })),
    };

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/questions/[id] error:", err);
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Duplicate question (category + text)" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    await ensureDb();
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const deleted = await QuestionModel.findByIdAndDelete(id).lean();
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/questions/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
