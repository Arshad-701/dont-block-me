"use client";

import { ArrowRight } from "lucide-react";

// Responsive banner / native ad placement placeholder.
// Replace the inner markup with your AdSterra / Monetag ad code in production.
export function AdBanner({ variant = "bottom" }: { variant?: "bottom" | "inline" }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-slate-900 text-white shadow-lg ${
        variant === "bottom" ? "mt-2" : "my-3"
      }`}
      aria-label="advertisement"
    >
      <div className="flex items-center justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-300/70">
            Ad · 300×250
          </p>
          <p className="truncate text-sm font-bold text-sky-300">
            Your AdSterra / Monetag banner here
          </p>
          <p className="truncate text-xs text-slate-300">
            Popunder &amp; native ad slot — place your script in layout head
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
