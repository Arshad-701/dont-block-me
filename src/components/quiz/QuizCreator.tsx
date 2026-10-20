"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, SkipForward, Loader2, RotateCcw } from "lucide-react";
import { AppHeader } from "./AppHeader";
import { ProgressBar } from "./ProgressBar";
import { AdBanner } from "./AdBanner";
import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/lib/quiz-data";
import { toast } from "sonner";

export function QuizCreator() {
  const router = useRouter();
  const lang = useQuizStore((s) => s.lang);
  const tr = t(lang);
  const creatorName = useQuizStore((s) => s.creatorName);
  const creatorGender = useQuizStore((s) => s.creatorGender);
  const answers = useQuizStore((s) => s.answers);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const current = useQuizStore((s) => s.currentQuestion);
  const setCurrent = useQuizStore((s) => s.setCurrentQuestion);
  const setQuizId = useQuizStore((s) => s.setQuizId);
  const setStep = useQuizStore((s) => s.setStep);

  const [submitting, setSubmitting] = useState(false);

  const question = QUESTIONS[current];
  const selected = answers[current];
  const isLast = current === TOTAL_QUESTIONS - 1;

  // guard: need name + gender
  if (!creatorName || !creatorGender) {
    if (typeof window !== "undefined") router.push("/?page=create");
    return null;
  }

  const choose = (optIdx: number) => {
    setAnswer(current, optIdx);
    // auto-advance after a short delay for nice feel (except last)
    if (!isLast) {
      setTimeout(() => setCurrent(current + 1), 280);
    }
  };

  const next = () => {
    if (isLast) {
      void submit();
    } else {
      setCurrent(current + 1);
    }
  };

  const skip = () => {
    // mark as skipped (-1 stays), move on
    if (!isLast) setCurrent(current + 1);
    else void submit();
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorName,
          creatorGender,
          language: lang,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setQuizId(data.quiz.id);
      setStep("share");
      router.push(`/?page=share&quiz=${data.quiz.id}`);
    } catch (e) {
      toast.error("Could not save your quiz. Try again!");
    } finally {
      setSubmitting(false);
    }
  };

  const title = question.title.replace("{name}", creatorName);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="px-1 pb-2 pt-1">
        <ProgressBar current={current} />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-4">
        {/* question card */}
        <div key={current} className="flex flex-1 flex-col animate-pop-in">
          <div className="relative mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-md ring-1 ring-black/5">
              {question.emoji}
            </span>
            <h2 className="text-xl font-extrabold leading-tight text-slate-800">
              {title}
            </h2>
          </div>

          {/* options */}
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
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${opt.color} text-4xl shadow-inner`}
                  >
                    {opt.emoji}
                  </span>
                  <span className="text-sm font-bold">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* floating action buttons */}
        <div className="sticky bottom-0 z-30 -mx-4 mt-3 bg-gradient-to-t from-sky-50 to-transparent px-4 pb-2 pt-3">
          <div className="flex items-center gap-3">
            <button
              onClick={skip}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-md ring-1 ring-black/5 transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <SkipForward className="h-4 w-4" />
              {tr.skipQuestion}
            </button>
            <button
              onClick={next}
              disabled={submitting}
              className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-sky-300 transition hover:scale-[1.02] active:scale-95 disabled:opacity-70"
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
        </div>

        <AdBanner />

        {/* question dots */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "w-6 bg-pink-500"
                  : answers[i] !== -1
                  ? "w-2 bg-sky-400"
                  : "w-2 bg-slate-300"
              }`}
              aria-label={`go to question ${i + 1}`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
