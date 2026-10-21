import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { TOTAL_QUESTIONS } from "@/lib/quiz-data";

const SubmitResponseSchema = z.object({
  quizId: z.string().min(1),
  friendName: z.string().min(1).max(15),
  // friend's selected option index for each of the 10 questions (0-3; friend must answer all)
  answers: z.array(z.number().int().min(0).max(3)).length(TOTAL_QUESTIONS),
});

// POST /api/response - submit a friend's answers and compute score
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SubmitResponseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { quizId, friendName, answers } = parsed.data;

    const quiz = await db.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const creatorAnswers: number[] = JSON.parse(quiz.answers);

    // compute score
    let score = 0;
    for (let i = 0; i < creatorAnswers.length; i++) {
      if (creatorAnswers[i] === answers[i]) score++;
    }

    const response = await db.response.create({
      data: {
        quizId,
        friendName: friendName.trim(),
        answers: JSON.stringify(answers),
        score,
      },
      select: { id: true, friendName: true, score: true },
    });

    return NextResponse.json({ response, totalQuestions: creatorAnswers.length });
  } catch (error) {
    console.error("Submit response error:", error);
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
  }
}
