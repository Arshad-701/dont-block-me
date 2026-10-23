import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/scoreboard?id=xxx — fetch all responses for a quiz.
// Returns the quiz's stored question/answer keys + each response's answers
// so the client can render a per-friend correct/wrong breakdown.
function safeParseArr(raw: unknown, fallback: number[] = []): number[] {
  if (typeof raw !== "string") return fallback;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map((n) => Number(n)) : fallback;
  } catch {
    return fallback;
  }
}

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
        questions: true,
        answers: true,
        responses: {
          orderBy: { score: "desc" },
          select: {
            id: true,
            friendName: true,
            score: true,
            answers: true,
            createdAt: true,
          },
        },
      },
    });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // legacy quizzes default to the first 10 pool questions
    const questions = safeParseArr(quiz.questions, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const creatorAnswers = safeParseArr(quiz.answers, []);

    const responses = quiz.responses.map((r) => ({
      id: r.id,
      friendName: r.friendName,
      score: r.score,
      createdAt: r.createdAt,
      answers: safeParseArr(r.answers, []),
    }));

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        creatorName: quiz.creatorName,
        creatorGender: quiz.creatorGender,
        language: quiz.language,
        createdAt: quiz.createdAt,
        questions,
        answers: creatorAnswers,
        responses,
      },
    });
  } catch (error) {
    console.error("Scoreboard error:", error);
    return NextResponse.json({ error: "Failed to fetch scoreboard" }, { status: 500 });
  }
}
