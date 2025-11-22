// src/app/api/questions/bulk/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/Question";
import { z } from "zod";

const BulkSchema = z.object({
  questions: z
    .array(
      z.object({
        category: z.string().min(1),
        question: z.string().min(1),
        options: z.array(z.string().min(1)).min(2),
        correctIndex: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const json = await req.json();
    const parsed = BulkSchema.safeParse(json);
    if (!parsed.success) {
      // zod v3: use `issues` (not `errors`)
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json({ error: firstIssue.message }, { status: 400 });
    }

    const docs = parsed.data.questions.map((q) => ({
      category: q.category.trim(),
      text: q.question.trim(),
      options: q.options.map((opt, i) => ({ text: opt.trim(), isCorrect: i === q.correctIndex })),
      createdAt: new Date(),
    }));

    // insertMany with ordered:false => continue on errors (e.g. duplicates)
    const insertResult = await QuestionModel.insertMany(docs, { ordered: false }).catch((err) => {
      // insertMany may throw a BulkWriteError; return the error object so we can inspect it below
      return err;
    });

    // If insertMany returned an array of docs => success for all
    if (Array.isArray(insertResult)) {
      return NextResponse.json({ insertedCount: insertResult.length }, { status: 201 });
    }

    // If insertResult is an error object (BulkWriteError), attempt to extract useful info.
    const resultAny: any = insertResult;
    const insertedCount =
      resultAny?.insertedDocs?.length ?? resultAny?.result?.n ?? resultAny?.insertedCount ?? 0;

    const errors =
      (resultAny?.writeErrors || []).map((e: any) => ({
        index: e.index,
        code: e.code,
        errmsg: e.errmsg ?? e.message,
      })) || [];

    // If nothing useful found and no inserted docs, return generic success with 207 (partial) or 201.
    const status = insertedCount > 0 ? 207 : 500;
    return NextResponse.json({ insertedCount, errors }, { status });
  } catch (err: any) {
    console.error("Bulk import error:", err);
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Duplicate key error (some questions already exist)" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
