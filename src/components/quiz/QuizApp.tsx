"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SkyBackground } from "./SkyBackground";
import { LandingPage } from "./LandingPage";
import { NameGenderPage } from "./NameGenderPage";
import { QuizCreator } from "./QuizCreator";
import { SharePage } from "./SharePage";
import { FriendQuiz } from "./FriendQuiz";
import { Scoreboard } from "./Scoreboard";
import { SoundManager } from "./SoundManager";
import { useQuizStore } from "@/store/quiz-store";

function RouterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const page = params.get("page");
  const quiz = params.get("quiz");
  const setStep = useQuizStore((s) => s.setStep);
  const storeQuizId = useQuizStore((s) => s.quizId);

  // keep store step in sync with URL on mount
  useEffect(() => {
    let step: ReturnType<typeof setStep> = "home";
    if (quiz && !page) step = "quiz";
    else if (page === "scoreboard" && quiz) step = "scoreboard";
    else if (page === "share" && quiz) step = "share";
    else if (page === "creating") step = "creating";
    else if (page === "create") step = "create";
    else step = "home";
    setStep(step);
  }, [page, quiz, setStep]);

  // friend took a shared link
  if (quiz && (!page || page === "quiz")) {
    return <FriendQuiz quizId={quiz} />;
  }
  if (page === "scoreboard" && quiz) {
    return <Scoreboard quizId={quiz} />;
  }
  if (page === "share" && quiz) {
    return <SharePage quizId={quiz} />;
  }
  if (page === "creating") {
    return <QuizCreator />;
  }
  if (page === "create") {
    return <NameGenderPage />;
  }
  return <LandingPage />;
}

export function QuizApp() {
  return (
    <div className="relative min-h-screen">
      <SkyBackground />
      <SoundManager />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <img src="/bear-female.png" alt="" className="h-20 w-20 animate-bounce-soft" />
          </div>
        }
      >
        <RouterInner />
      </Suspense>
    </div>
  );
}
