import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { TOTAL_QUESTIONS, QUESTION_POOL } from "@/lib/quiz-data";

const CreateQuizSchema = z.object({
  creatorName: z.string().min(1).max(15),
  creatorGender: z.enum(["male", "female"]),
  language: z.string().max(8).default("en"),
  // the 10 pool-question indices that form this quiz
  questionSelection: z
    .array(z.number().int().min(0).max(QUESTION_POOL.length - 1))
    .length(TOTAL_QUESTIONS),
  // the creator's selected option index for each of the 10 questions (0-3)
  answers: z.array(z.number().int().min(0).max(3)).length(TOTAL_QUESTIONS),
});

// POST /api/quiz - create a new quiz
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateQuizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { creatorName, creatorGender, language, questionSelection, answers } =
      parsed.data;

    const quiz = await db.quiz.create({
      data: {
        creatorName: creatorName.trim(),
        creatorGender,
        language,
        questions: JSON.stringify(questionSelection),
        answers: JSON.stringify(answers),
      },
      select: {
        id: true,
        creatorName: true,
        creatorGender: true,
        language: true,
      },
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Create quiz error:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}

// GET /api/quiz?id=xxx - fetch a quiz for the friend solver / scoreboard
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
        questions: true,
        answers: true,
        createdAt: true,
      },
    });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json({
      quiz: {
        ...quiz,
        // the 10 pool-question indices that form this quiz (default to 0..9 for
        // quizzes created before the pool field existed)
        questions: JSON.parse(quiz.questions ?? "[0,1,2,3,4,5,6,7,8,9]"),
        answers: JSON.parse(quiz.answers),
      },
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
