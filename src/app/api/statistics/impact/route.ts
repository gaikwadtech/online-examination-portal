import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ExamResult from "@/models/ExamResult";

export async function GET() {
  try {
    await dbConnect();

    // Aggregation to count the total number of answers across all exam results
    // Each ExamResult has an 'answers' array. We want the sum of the lengths of these arrays.
    const aggregation = await ExamResult.aggregate([
      {
        $project: {
          answerCount: { $size: "$answers" },
        },
      },
      {
        $group: {
          _id: null,
          totalAnswers: { $sum: "$answerCount" },
        },
      },
    ]);

    const totalAnswers = aggregation.length > 0 ? aggregation[0].totalAnswers : 0;

    // Constants based on the user's provided info/screenshots
    const QUESTIONS_PER_SHEET = 5;
    const SHEETS_PER_TREE = 8000;

    // Calculation:
    // 1. Total Sheets Used = Total Answers / Questions per Sheet
    // 2. Trees Saved = Total Sheets / Sheets per Tree
    // Note: "Trees Saved" implies we are switching to digital, so every digital sheet is a saved paper sheet.
    
    // However, the formula requested seems to be: 
    // Trees Saved = (Total Answers / 5) / 8000
    
    const sheetsSaved = totalAnswers / QUESTIONS_PER_SHEET;
    const treesSaved = sheetsSaved / SHEETS_PER_TREE;

    // To show "real" looking numbers if the db is empty or low, we could add a base number if requested, 
    // but the user asked for "accurate" so we will stick to the calculation.
    // If calculating accurately results in < 1 tree, we might want to handle decimals on the frontend.
    
    return NextResponse.json(
      {
        totalAnswers,
        questionsPerSheet: QUESTIONS_PER_SHEET,
        sheetsPerTree: SHEETS_PER_TREE,
        treesSaved: treesSaved, // Send precise number, format on frontend
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching impact stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
