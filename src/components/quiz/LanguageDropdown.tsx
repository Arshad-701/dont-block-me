"use client";

import { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";
import { useQuizStore } from "@/store/quiz-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageDropdown() {
  const lang = useQuizStore((s) => s.lang);
  const setLang = useQuizStore((s) => s.setLang);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-105 active:scale-95">
          <Globe className="h-4 w-4 text-sky-500" />
          <span className="text-sm font-semibold text-slate-700">
            {current.label}
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white">
            <ChevronDown className="h-3 w-3" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[320px] w-56 overflow-y-auto rounded-2xl border-0 shadow-xl"
        alignOffset={4}
      >
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => setLang(l.code)}
            className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm focus:bg-sky-50"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{l.flag}</span>
              <span className="font-medium text-slate-700">{l.label}</span>
            </span>
            <span className="text-xs text-slate-400">{l.native}</span>
            {l.code === lang && <Check className="h-4 w-4 text-pink-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// compact top-bar version used on quiz pages
export function LanguageChip() {
  const lang = useQuizStore((s) => s.lang);
  const setLang = useQuizStore((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-105 active:scale-95">
          {current.code.toUpperCase()}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[300px] w-48 overflow-y-auto rounded-2xl border-0 shadow-xl"
      >
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => {
              setLang(l.code);
              setOpen(false);
            }}
            className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm focus:bg-sky-50"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{l.flag}</span>
              <span className="font-medium text-slate-700">{l.label}</span>
            </span>
            {l.code === lang && <Check className="h-4 w-4 text-pink-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
