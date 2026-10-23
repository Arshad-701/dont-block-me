"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Trophy,
  Crown,
  Medal,
  ArrowRight,
  Share2,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { AppHeader } from "./AppHeader";
import { AdBanner } from "./AdBanner";
import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";
import { TOTAL_QUESTIONS, QUESTION_POOL } from "@/lib/quiz-data";
import { toast } from "sonner";
import { playPop } from "@/lib/sounds";

type Score = {
  id: string;
  friendName: string;
  score: number;
  answers: number[]; // friend's option index per slot
  createdAt: string;
};

export function Scoreboard({ quizId }: { quizId: string }) {
  const router = useRouter();
  const lang = useQuizStore((s) => s.lang);
  const tr = t(lang);
  const [loading, setLoading] = useState(true);
  const [creatorName, setCreatorName] = useState("");
  const [scores, setScores] = useState<Score[]>([]);
  // pool-question indices + creator's option indices (for the breakdown)
  const [questions, setQuestions] = useState<number[]>([]);
  const [creatorAnswers, setCreatorAnswers] = useState<number[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scoreboard?id=${quizId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error("Quiz not found");
        router.push("/");
        return;
      }
      setCreatorName(data.quiz.creatorName);
      setScores(data.quiz.responses);
      setQuestions(data.quiz.questions ?? []);
      setCreatorAnswers(data.quiz.answers ?? []);
    } catch {
      toast.error("Could not load scoreboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [quizId]);

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const avg =
    scores.length > 0
      ? Math.round(
          (scores.reduce((s, r) => s + r.score, 0) / scores.length) * 10
        ) / 10
      : 0;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?quiz=${quizId}`
      : "";

  const share = async () => {
    const text = `Check out who knows ${creatorName} best! 🏆 Take the quiz: ${shareUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Don't Block Me", text, url: shareUrl });
      } catch {
        /* */
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(tr.copied);
      } catch {
        /* */
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <img src="/bear-trophy.png" alt="" className="h-24 w-24 animate-bounce-soft" />
        <p className="flex items-center gap-2 font-bold text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> loading scores…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
        {/* header */}
        <div className="relative mt-2 overflow-hidden rounded-[2rem] border-4 border-white bg-white/90 p-5 text-center shadow-xl shadow-amber-200/40 animate-pop-in">
          <img
            src="/bear-trophy.png"
            alt=""
            className="mx-auto h-20 w-20 drop-shadow-lg animate-bounce-soft"
          />
          <h1 className="text-2xl font-extrabold text-slate-800">{tr.scoreboard}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {tr.friendsWhoTook}{" "}
            <span className="text-fuchsia-500">{creatorName}</span>
          </p>

          {/* stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-sky-50 p-2.5">
              <p className="text-2xl font-extrabold text-sky-500">{scores.length}</p>
              <p className="text-[10px] font-bold uppercase text-slate-400">players</p>
            </div>
            <div className="rounded-2xl bg-pink-50 p-2.5">
              <p className="text-2xl font-extrabold text-pink-500">{avg}/{TOTAL_QUESTIONS}</p>
              <p className="text-[10px] font-bold uppercase text-slate-400">avg score</p>
            </div>
          </div>
        </div>

        {/* list */}
        <div className="mt-4">
          {sorted.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-pink-200 bg-white/70 p-8 text-center">
              <p className="text-4xl">🐻</p>
              <p className="mt-2 text-sm font-bold text-slate-500">
                {tr.noScoresYet}
              </p>
              <button
                onClick={share}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
              >
                <Share2 className="h-4 w-4" />
                {tr.shareNow}
              </button>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {sorted.map((s, i) => (
                <ScoreRow
                  key={s.id}
                  rank={i + 1}
                  name={s.friendName}
                  score={s.score}
                  friendAnswers={s.answers}
                  questions={questions}
                  creatorAnswers={creatorAnswers}
                  creatorName={creatorName}
                  tr={tr}
                />
              ))}
            </ul>
          )}
        </div>

        {/* actions */}
        <button
          onClick={share}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-pink-300 transition hover:scale-[1.02] active:scale-95"
        >
          <Share2 className="h-5 w-5" />
          {tr.shareNow}
          <ArrowRight className="h-4 w-4" />
        </button>

        <AdBanner size="300x250" />

        <p className="mt-4 text-center text-xs font-medium text-slate-500">
          {tr.footerNote}
        </p>
      </main>
    </div>
  );
}

function ScoreRow({
  rank,
  name,
  score,
  friendAnswers,
  questions,
  creatorAnswers,
  creatorName,
  tr,
}: {
  rank: number;
  name: string;
  score: number;
  friendAnswers: number[];
  questions: number[];
  creatorAnswers: number[];
  creatorName: string;
  tr: ReturnType<typeof t>;
}) {
  const [open, setOpen] = useState(false);
  const pct = score / TOTAL_QUESTIONS;
  let badge;
  if (rank === 1)
    badge = (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-white shadow-md">
        <Crown className="h-5 w-5" />
      </span>
    );
  else if (rank === 2)
    badge = (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-md">
        <Medal className="h-5 w-5" />
      </span>
    );
  else if (rank === 3)
    badge = (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-amber-600 text-white shadow-md">
        <Medal className="h-5 w-5" />
      </span>
    );
  else
    badge = (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sm font-extrabold text-sky-500">
        {rank}
      </span>
    );

  const ringColor =
    pct === 1
      ? "from-amber-400 to-yellow-500"
      : pct >= 0.5
      ? "from-pink-400 to-fuchsia-500"
      : "from-slate-300 to-slate-400";

  const correctCount = friendAnswers.reduce(
    (acc, a, i) => acc + (a !== -1 && a === (creatorAnswers[i] ?? -1) ? 1 : 0),
    0
  );

  return (
    <li className="overflow-hidden rounded-2xl bg-white/90 shadow-md ring-1 ring-black/5">
      <button
        type="button"
        onClick={() => {
          playPop();
          setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-slate-50 active:scale-[0.99]"
        aria-expanded={open}
      >
        {badge}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800">{name}</p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${ringColor}`}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] font-bold text-slate-400">
            {correctCount}/{TOTAL_QUESTIONS} {tr.correctPick} ·{" "}
            <span className="text-fuchsia-400">{open ? tr.hideAnswers : tr.seeAnswers}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold leading-none text-slate-800">{score}</p>
          <p className="text-[10px] font-bold text-slate-400">/{TOTAL_QUESTIONS}</p>
        </div>
        {pct === 1 && <Trophy className="h-4 w-4 text-amber-500" />}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* per-question correct/wrong breakdown */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-3">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
            {tr.answerBreakdown}
          </p>
          <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
              const poolIdx = questions[i] ?? 0;
              const q = QUESTION_POOL[poolIdx] ?? QUESTION_POOL[0];
              const correctOpt = creatorAnswers[i] ?? -1;
              const friendOpt = friendAnswers[i] ?? -1;
              const isCorrect = friendOpt !== -1 && friendOpt === correctOpt;
              const friendChoice = q.options[friendOpt];
              const correctChoice = q.options[correctOpt];
              return (
                <li
                  key={i}
                  className={`rounded-xl border p-2 text-xs ${
                    isCorrect
                      ? "border-emerald-200 bg-emerald-50/70"
                      : "border-rose-200 bg-rose-50/70"
                  }`}
                >
                  <p className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-[10px] font-extrabold text-slate-500">
                      {i + 1}
                    </span>
                    <span className="text-base leading-none">{q.emoji}</span>
                    <span className="truncate">
                      {q.title.replace("{name}", creatorName)}
                    </span>
                  </p>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5 pl-[26px]">
                    <div
                      className={`flex items-center gap-1 rounded-lg px-1.5 py-1 ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      <span className="text-base leading-none">
                        {friendChoice?.emoji ?? "❓"}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {friendChoice?.text ?? "—"}
                      </span>
                      {isCorrect ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </div>
                    <div
                      className={`flex items-center gap-1 rounded-lg px-1.5 py-1 ${
                        isCorrect
                          ? "bg-white text-slate-500"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <span className="text-base leading-none">
                        {correctChoice?.emoji ?? "❓"}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {correctChoice?.text ?? "—"}
                      </span>
                      {!isCorrect && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </div>
                  </div>
                  {!isCorrect && (
                    <p className="mt-1 pl-[26px] text-[10px] font-bold text-slate-400">
                      <span className="text-rose-500">{tr.theirPick}:</span>{" "}
                      {friendChoice?.text ?? "—"} ·{" "}
                      <span className="text-emerald-600">{tr.correctPick}:</span>{" "}
                      {correctChoice?.text ?? "—"}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}
