import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const CreateQuizSchema = z.object({
  creatorName: z.string().min(1).max(15),
  creatorGender: z.enum(["male", "female"]),
  language: z.string().max(8).default("en"),
  answers: z.array(z.number().int().min(0).max(3)).length(10),
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
    const { creatorName, creatorGender, language, answers } = parsed.data;

    const quiz = await db.quiz.create({
      data: {
        creatorName: creatorName.trim(),
        creatorGender,
        language,
        answers: JSON.stringify(answers),
      },
      select: { id: true, creatorName: true, creatorGender: true, language: true },
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
        answers: JSON.parse(quiz.answers),
      },
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
