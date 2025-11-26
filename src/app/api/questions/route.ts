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
