"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, RotateCcw, Trophy } from "lucide-react";
import { AppHeader } from "./AppHeader";
import { ProgressBar } from "./ProgressBar";
import { AdBanner } from "./AdBanner";
import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/lib/quiz-data";
import { toast } from "sonner";

type QuizInfo = {
  id: string;
  creatorName: string;
  creatorGender: string;
  language: string;
};

export function FriendQuiz({ quizId }: { quizId: string }) {
  const router = useRouter();
  const lang = useQuizStore((s) => s.lang);
  const setLang = useQuizStore((s) => s.setLang);
  const tr = t(lang);
  const friendName = useQuizStore((s) => s.friendName);
  const setFriendName = useQuizStore((s) => s.setFriendName);
  const friendAnswers = useQuizStore((s) => s.friendAnswers);
  const setFriendAnswer = useQuizStore((s) => s.setFriendAnswer);
  const friendCurrent = useQuizStore((s) => s.friendCurrent);
  const setFriendCurrent = useQuizStore((s) => s.setFriendCurrent);
  const friendScore = useQuizStore((s) => s.friendScore);
  const setFriendScore = useQuizStore((s) => s.setFriendScore);
  const setStep = useQuizStore((s) => s.setStep);

  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"name" | "questions" | "result">("name");
  const [submitting, setSubmitting] = useState(false);

  // fetch quiz
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/quiz?id=${quizId}`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          toast.error("Quiz not found");
          router.push("/");
          return;
        }
        setQuiz(data.quiz);
        if (data.quiz.language) setLang(data.quiz.language);
      } catch {
        toast.error("Could not load quiz");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [quizId]);

  const startQuiz = () => {
    if (friendName.trim().length > 0) {
      setPhase("questions");
      setFriendCurrent(0);
    }
  };

  const question = QUESTIONS[friendCurrent];
  const selected = friendAnswers[friendCurrent];
  const isLast = friendCurrent === TOTAL_QUESTIONS - 1;

  const choose = (optIdx: number) => {
    setFriendAnswer(friendCurrent, optIdx);
    if (!isLast) setTimeout(() => setFriendCurrent(friendCurrent + 1), 280);
  };

  const next = () => {
    if (isLast) void submit();
    else setFriendCurrent(friendCurrent + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          friendName,
          answers: friendAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFriendScore(data.response.score);
      setPhase("result");
    } catch {
      toast.error("Could not submit your answers");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <img src="/bear-female.png" alt="" className="h-24 w-24 animate-bounce-soft" />
        <p className="flex items-center gap-2 font-bold text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> loading your dare…
        </p>
      </div>
    );
  }

  if (!quiz) return null;

  const creatorName = quiz.creatorName;
  const title = question?.title.replace("{name}", creatorName);

  // ----- RESULT -----
  if (phase === "result" && friendScore !== null) {
    return (
      <FriendResult
        quizId={quizId}
        creatorName={creatorName}
        score={friendScore}
        tr={tr}
        onRetake={() => {
          setFriendScore(null);
          setFriendCurrent(0);
          // reset answers
          for (let i = 0; i < TOTAL_QUESTIONS; i++) setFriendAnswer(i, -1);
          setPhase("name");
        }}
        onScores={() => {
          setStep("scoreboard");
          router.push(`/?page=scoreboard&quiz=${quizId}`);
        }}
      />
    );
  }

  // ----- NAME -----
  if (phase === "name") {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
          <div className="flex flex-1 flex-col items-center justify-center py-6 animate-pop-in">
            <div className="relative mb-3">
              <img
                src={quiz.creatorGender === "male" ? "/bear-male.png" : "/bear-female.png"}
                alt="creator bear"
                className="h-32 w-32 drop-shadow-lg animate-wiggle"
              />
              <span className="absolute -right-1 top-4 text-xl text-pink-300">💕</span>
            </div>

            <div className="relative mx-auto mb-5 max-w-xs rounded-3xl bg-pink-100 px-5 py-3 text-center shadow-md">
              <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-pink-100" />
              <p className="text-base font-bold text-slate-800">{tr.friendEnterName}</p>
              <p className="mt-1 text-sm font-semibold text-fuchsia-500">
                {tr.letsSeeHowWell} <span className="underline decoration-wavy decoration-pink-400">{creatorName}</span>!
              </p>
              <p className="mt-1 text-xs font-bold text-sky-500">{tr.canYouScore}</p>
            </div>

            <input
              autoFocus
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value.slice(0, 15))}
              onKeyDown={(e) => e.key === "Enter" && startQuiz()}
              placeholder={tr.enterName}
              className="w-full rounded-2xl border-4 border-sky-400 bg-white px-4 py-4 pr-16 text-lg font-bold text-slate-800 outline-none shadow-lg shadow-sky-200/50 placeholder:font-medium placeholder:text-slate-300"
            />
            <span className="-mt-3 mr-2 self-end text-xs font-semibold text-slate-400">
              {friendName.length}/15
            </span>

            <button
              onClick={startQuiz}
              disabled={friendName.trim().length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-sky-300 transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tr.continueBtn}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
          <AdBanner />
        </main>
      </div>
    );
  }

  // ----- QUESTIONS -----
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="px-1 pb-2 pt-1">
        <ProgressBar current={friendCurrent} />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-4">
        <div key={friendCurrent} className="flex flex-1 flex-col animate-pop-in">
          <p className="mb-3 text-center text-sm font-bold text-slate-500">
            {tr.letsSeeHowWell} <span className="text-fuchsia-500">{creatorName}</span>
          </p>
          <div className="relative mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-md ring-1 ring-black/5">
              {question.emoji}
            </span>
            <h2 className="text-xl font-extrabold leading-tight text-slate-800">
              {title}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const active = selected === idx;
              return (
                <button
                  key={idx}
                  onClick={() => choose(idx)}
                  className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl p-4 shadow-md ring-1 transition hover:scale-[1.03] active:scale-95 ${
                    active
                      ? "bg-gradient-to-br from-pink-500 to-fuchsia-500 text-white ring-pink-300 scale-[1.02] shadow-lg shadow-pink-300"
                      : "bg-white text-slate-700 ring-black/5"
                  }`}
                >
                  {active && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/30">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${opt.color} text-4xl shadow-inner`}>
                    {opt.emoji}
                  </span>
                  <span className="text-sm font-bold">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* floating continue */}
        <div className="sticky bottom-0 z-30 -mx-4 mt-3 bg-gradient-to-t from-sky-50 to-transparent px-4 pb-2 pt-3">
          <button
            onClick={next}
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-sky-300 transition hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {tr.continueBtn}
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 transition group-hover:translate-x-1">
                  {isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </span>
              </>
            )}
          </button>
        </div>

        <AdBanner />
      </main>
    </div>
  );
}

// Friend result screen
function FriendResult({
  quizId,
  creatorName,
  score,
  tr,
  onRetake,
  onScores,
}: {
  quizId: string;
  creatorName: string;
  score: number;
  tr: ReturnType<typeof t>;
  onRetake: () => void;
  onScores: () => void;
}) {
  const pct = score / TOTAL_QUESTIONS;
  let msg = tr.resultLow;
  let bear = "/bear-female.png";
  if (pct === 1) {
    msg = tr.resultPerfect;
    bear = "/bear-trophy.png";
  } else if (pct >= 0.7) {
    msg = tr.resultGreat;
    bear = "/bear-male.png";
  } else if (pct >= 0.4) {
    msg = tr.resultGood;
    bear = "/bear-female.png";
  } else if (pct <= 0.2) {
    msg = tr.resultFake;
    bear = "/bear-male.png";
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?quiz=${quizId}`
      : "";
  const shareText = `I scored ${score}/${TOTAL_QUESTIONS} on ${creatorName}'s friendship dare quiz! 😎 Are we real or fake friends? Take it: ${shareUrl}`;

  const shareScore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Don't Block Me", text: shareText, url: shareUrl });
      } catch {
        /* cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success(tr.copied);
      } catch {
        /* */
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
        <div className="relative mt-2 overflow-hidden rounded-[2rem] border-4 border-white bg-white/90 p-6 text-center shadow-xl shadow-pink-200/50 animate-pop-in">
          <span className="absolute right-4 top-4 text-2xl animate-twinkle">✨</span>
          <span className="absolute left-4 top-8 text-xl">🎉</span>
          <img src={bear} alt="" className="mx-auto h-32 w-32 drop-shadow-lg animate-bounce-soft" />
          <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
            {tr.yourScore}
          </p>
          <p className="my-1 text-6xl font-extrabold">
            <span className="bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
              {score}
            </span>
            <span className="text-slate-300">/{TOTAL_QUESTIONS}</span>
          </p>
          {/* score rings */}
          <div className="mx-auto mb-3 flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${i < score ? "bg-pink-500" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <p className="text-base font-bold text-slate-700">{msg}</p>
        </div>

        <button
          onClick={shareScore}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-pink-300 transition hover:scale-[1.02] active:scale-95"
        >
          {tr.shareMyScore}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={onRetake}
            className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-md ring-1 ring-black/5 transition hover:scale-[1.02] active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            {tr.tryAgain}
          </button>
          <button
            onClick={onScores}
            className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-md ring-1 ring-black/5 transition hover:scale-[1.02] active:scale-95"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            {tr.checkScores}
          </button>
        </div>

        <AdBanner />
      </main>
    </div>
  );
}
