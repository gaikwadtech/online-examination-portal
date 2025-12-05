import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get JWT token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode JWT
    const decoded = await verifyToken(token);

    // Only teacher or admin can access student list
    if (!decoded || (decoded.role !== "teacher" && decoded.role !== "admin")) {
      return NextResponse.json(
        { error: "Forbidden: Only teachers/admins can view students." },
        { status: 403 }
      );
    }

    // Fetch all students including registration date
    const students = await User.find({ role: "student" })
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({ students }, { status: 200 });

  } catch (err: any) {
    console.error("GET /api/students error:", err);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
