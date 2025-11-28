import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ExamModel from "@/models/Exam";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Optional: Try to get user ID for createdBy, but don't block if fails (matching lenient pattern)
        let userId = null;
        try {
            const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
            if (token) {
                const decoded = await verifyToken(token);
                if (decoded) {
                    userId = decoded.id;
                }
            }
        } catch (e) {
            // Ignore token errors, just proceed without userId
        }

        const body = await req.json();
        const { title, category, duration, passPercentage, questions } = body;

        // Basic validation
        if (!title || !category || !duration || !passPercentage || !questions || questions.length === 0) {
            return NextResponse.json(
                { message: "Please provide all required fields and at least one question." },
                { status: 400 }
            );
        }

        const newExam = new ExamModel({
            title,
            category,
            duration,
            passPercentage,
            questions,
            createdBy: userId, // Might be null, which is allowed now
        });

        await newExam.save();

        return NextResponse.json(
            { message: "Exam created successfully", exam: newExam },
            { status: 201 }
        );
    } catch (err: any) {
        console.error("POST /api/exams error:", err);
        return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const exams = await ExamModel.find().sort({ createdAt: -1 });
        return NextResponse.json({ exams }, { status: 200 });
    } catch (err: any) {
        console.error("GET /api/exams error:", err);
        return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
    }
}
