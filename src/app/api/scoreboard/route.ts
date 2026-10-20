import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/scoreboard?id=xxx - fetch all responses for a quiz
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing quiz id" }, { status: 400 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        creatorName: true,
        creatorGender: true,
        language: true,
        createdAt: true,
        responses: {
          orderBy: { score: "desc" },
          select: {
            id: true,
            friendName: true,
            score: true,
            createdAt: true,
          },
        },
      },
    });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Scoreboard error:", error);
    return NextResponse.json({ error: "Failed to fetch scoreboard" }, { status: 500 });
  }
}
