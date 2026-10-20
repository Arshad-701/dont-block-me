"use client";

import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";
import { TOTAL_QUESTIONS } from "@/lib/quiz-data";

// Progress bar showing current step out of total
export function ProgressBar({
  current,
  total = TOTAL_QUESTIONS,
}: {
  current: number;
  total?: number;
}) {
  const lang = useQuizStore((s) => s.lang);
  const tr = t(lang);
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div className="w-full px-4">
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600">
        <span>
          {tr.question} {current + 1} {tr.of} {total}
        </span>
        <span className="text-pink-500">{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/80 ring-1 ring-black/5 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-pink-400 to-fuchsia-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
