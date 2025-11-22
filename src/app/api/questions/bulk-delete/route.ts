// src/app/api/questions/bulk-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/Question";
import mongoose from "mongoose";
import { z } from "zod";

const BodySchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

function isValidObjectId(id?: string) {
  return !!id && mongoose.Types.ObjectId.isValid(id);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json({ error: issue.message }, { status: 400 });
    }

    const ids = parsed.data.ids;
    // Validate ids
    const invalid = ids.filter((i) => !isValidObjectId(i));
    if (invalid.length) {
      return NextResponse.json({ error: "One or more invalid ids", invalid }, { status: 400 });
    }

    const objectIds = ids.map((i) => new mongoose.Types.ObjectId(i));

    const result = await QuestionModel.deleteMany({ _id: { $in: objectIds } });

    // result.deletedCount exists on success
    return NextResponse.json({ deletedCount: result.deletedCount ?? 0 }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/questions/bulk-delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
