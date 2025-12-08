import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Question from "@/models/Question";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "teacher")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get unique categories from questions
    const categories = await Question.distinct('category');
    
    // Filter out empty/null categories and sort
    const filteredCategories = categories
      .filter((cat: any) => cat && cat.trim() !== '')
      .sort();

    return NextResponse.json({ categories: filteredCategories }, { status: 200 });
  } catch (error: any) {
    console.error("CATEGORIES API ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
