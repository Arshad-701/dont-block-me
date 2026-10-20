"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { LanguageChip } from "./LanguageDropdown";
import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";

// Logo with two bears
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const lang = useQuizStore((s) => s.lang);
  const tr = t(lang);
  const bearSize = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const titleSize =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
      ? "text-base"
      : "text-lg sm:text-xl";

  return (
    <div className="flex items-center gap-1.5 select-none">
      <img src="/bear-male.png" alt="" className={`${bearSize} -mr-3 drop-shadow-md`} />
      <img src="/bear-female.png" alt="" className={`${bearSize} z-10 drop-shadow-md`} />
      <div className={`${titleSize} font-extrabold leading-none tracking-tight`}>
        <span className="text-slate-800">Don&apos;t</span>{" "}
        <span className="bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm">
          Block
        </span>{" "}
        <span className="text-slate-800">Me</span>
      </div>
    </div>
  );
}

// Compact top header used on inner pages with back button + logo + language chip
export function AppHeader({ showBack = true }: { showBack?: boolean }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-3 py-3">
      {showBack ? (
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5 text-slate-700" />
        </button>
      ) : (
        <span className="w-9" />
      )}
      <div className="scale-90">
        <Logo size="sm" />
      </div>
      <LanguageChip />
    </header>
  );
}
