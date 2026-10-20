"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trophy, Crown, Medal, ArrowRight, Share2 } from "lucide-react";
import { AppHeader } from "./AppHeader";
import { AdBanner } from "./AdBanner";
import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";
import { TOTAL_QUESTIONS } from "@/lib/quiz-data";
import { toast } from "sonner";

type Score = {
  id: string;
  friendName: string;
  score: number;
  createdAt: string;
};

export function Scoreboard({ quizId }: { quizId: string }) {
  const router = useRouter();
  const lang = useQuizStore((s) => s.lang);
  const tr = t(lang);
  const [loading, setLoading] = useState(true);
  const [creatorName, setCreatorName] = useState("");
  const [scores, setScores] = useState<Score[]>([]);

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
                <ScoreRow key={s.id} rank={i + 1} name={s.friendName} score={s.score} />
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

        <AdBanner />

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
}: {
  rank: number;
  name: string;
  score: number;
}) {
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

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-md ring-1 ring-black/5">
      {badge}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-800">{name}</p>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${ringColor}`}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-extrabold leading-none text-slate-800">{score}</p>
        <p className="text-[10px] font-bold text-slate-400">/{TOTAL_QUESTIONS}</p>
      </div>
      {pct === 1 && <Trophy className="h-4 w-4 text-amber-500" />}
    </li>
  );
}
