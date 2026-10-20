import type { Metadata } from "next";
import { db } from "@/lib/db";
import { QuizApp } from "@/components/quiz/QuizApp";

// Force dynamic rendering so searchParams + per-quiz OG metadata are fresh
export const dynamic = "force-dynamic";

type Params = {
  page?: string;
  quiz?: string;
};

// Dynamic SEO/OG metadata per quiz for maximum social click-through
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Params>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const quizId = sp?.quiz;

  // Default landing metadata
  const base: Metadata = {
    title: "Don't Block Me - Find your Fake Friends | Friendship Dare Quiz 2026",
    description:
      "Create your friendship dare quiz 2026, share with friends and find your fake friends online. The ultimate 'how well do you know me' quiz and fake friend finder. Block your fake friends quiz!",
    keywords: [
      "Friendship dare quiz 2026",
      "How well do you know me quiz",
      "Fake friend finder online",
      "Block your fake friends quiz",
    ],
    openGraph: {
      title: "Don't Block Me - Find your Fake Friends",
      description:
        "Create your friendship dare quiz, share with friends and find your fake friends! How well do your friends know you?",
      images: [{ url: "/bears-hero.png", width: 1024, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Don't Block Me - Find your Fake Friends",
      description:
        "Create your friendship dare quiz, share with friends and find your fake friends!",
    },
  };

  if (!quizId) return base;

  // Try to fetch the quiz for per-creator OG metadata
  try {
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { creatorName: true, creatorGender: true },
    });
    if (!quiz) return base;

    const name = quiz.creatorName;

    if (sp.page === "scoreboard") {
      return {
        ...base,
        title: `${name}'s Scoreboard - Who knows ${name} best? | Don't Block Me`,
        description: `See who knows ${name} best! Check the friendship dare quiz scoreboard and find your fake friends. ${name}'s friends have spoken — are they real or fake?`,
        openGraph: {
          title: `🏆 Who knows ${name} best? Take the challenge!`,
          description: `Check ${name}'s friendship dare quiz scoreboard and find your fake friends!`,
          images: [{ url: quiz.creatorGender === "male" ? "/bear-male.png" : "/bear-female.png", width: 1024, height: 1024 }],
        },
        twitter: {
          card: "summary_large_image",
          title: `Who knows ${name} best? 🏆`,
          description: `Check ${name}'s friendship dare quiz scoreboard!`,
        },
      };
    }

    // friend solving the quiz (the shared link) — highest CTR variant
    return {
      ...base,
      title: `Can you score 10/10 on ${name}'s Friendship Quiz? | Don't Block Me`,
      description: `${name} challenged you! 😎 Take the friendship dare quiz and find out if you're a real or fake friend. How well do you know ${name}? Block your fake friends quiz 2026.`,
      keywords: [
        "Friendship dare quiz 2026",
        "How well do you know me quiz",
        "Fake friend finder online",
        "Block your fake friends quiz",
        `${name} quiz`,
      ],
      openGraph: {
        title: `😎 ${name} dared you! Can you score 10/10?`,
        description: `Take ${name}'s friendship dare quiz and find out if you're a real or fake friend! 💕`,
        images: [{ url: quiz.creatorGender === "male" ? "/bear-male.png" : "/bear-female.png", width: 1024, height: 1024 }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} dared you! 😎 Can you score 10/10?`,
        description: `Take ${name}'s friendship dare quiz and find out if you're a real or fake friend!`,
      },
    };
  } catch {
    return base;
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  await searchParams; // ensure params are read (keeps it dynamic)
  return <QuizApp />;
}
