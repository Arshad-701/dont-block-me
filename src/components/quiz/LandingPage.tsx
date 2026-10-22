"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, PenLine, Share2, Trophy, Sparkles, Heart, Info } from "lucide-react";
import { Logo } from "./AppHeader";
import { LanguageDropdown } from "./LanguageDropdown";
import { SoundToggle } from "./SoundToggle";
import { AdBanner } from "./AdBanner";
import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";
import { playWhoosh } from "@/lib/sounds";

export function LandingPage() {
  const router = useRouter();
  const lang = useQuizStore((s) => s.lang);
  const setStep = useQuizStore((s) => s.setStep);
  const resetCreator = useQuizStore((s) => s.resetCreator);
  const tr = t(lang);

  const startCreate = () => {
    playWhoosh();
    resetCreator();
    setStep("create");
    router.push("/?page=create");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* top bar with logo + language */}
      <header className="flex items-center justify-between px-4 pt-4">
        <div className="scale-95">
          <Logo size="md" />
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <LanguageDropdown />
        </div>
      </header>

      {/* 728x90 leaderboard — desktop only (hidden on mobile for clean UX) */}
      <AdBanner size="728x90" className="hidden md:flex" />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
        {/* Hero card */}
        <section className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-white bg-white/90 p-6 shadow-xl shadow-pink-200/50 animate-pop-in">
          {/* decorations */}
          <Heart className="absolute right-4 top-4 h-7 w-7 fill-pink-300 text-pink-300 animate-bounce-soft" />
          <Sparkles className="absolute left-4 top-8 h-5 w-5 text-amber-300 animate-twinkle" />
          <span className="absolute bottom-3 left-3 text-lg animate-float-slow">☁️</span>
          <span className="absolute bottom-10 right-8 text-sm animate-twinkle">✨</span>

          {/* hero illustration */}
          <div className="mx-auto mb-4 flex max-w-[220px] items-center justify-center">
            <img
              src="/bears-hero.png"
              alt="Two cute bears on their phones"
              className="w-full drop-shadow-lg"
            />
          </div>

          <h1 className="text-center text-2xl font-extrabold leading-tight text-slate-800">
            {tr.createYourQuiz} <span className="text-pink-500">{tr.and}</span>{" "}
            <span className="marker-highlight">{tr.block}</span>{" "}
            {tr.blockYourFakeFriends.replace(tr.block + " ", "")}
          </h1>

          <div className="mx-auto my-4 h-1 w-32 rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-400" />

          <button
            onClick={startCreate}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-sky-300 transition hover:scale-[1.02] active:scale-95"
          >
            {tr.createQuiz}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 transition group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </section>

        {/* How to play */}
        <section className="mt-6">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-2xl font-extrabold lowercase text-slate-800">
              {tr.howToPlay}
            </h2>
          </div>
          <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-fuchsia-500">
            {tr.howToPlaySub}
            <Info className="h-4 w-4" />
          </p>

          <div className="space-y-3">
            <StepCard
              num="1"
              icon={<PenLine className="h-5 w-5 text-white" />}
              iconBg="bg-gradient-to-br from-amber-400 to-orange-500"
              title={tr.stepCreateTitle}
              desc={tr.stepCreateDesc}
            />
            <StepCard
              num="2"
              icon={<Share2 className="h-5 w-5 text-white" />}
              iconBg="bg-gradient-to-br from-violet-400 to-purple-600"
              title={tr.stepShareTitle}
              desc={tr.stepShareDesc}
            />
            <StepCard
              num="3"
              icon={<Trophy className="h-5 w-5 text-white" />}
              iconBg="bg-gradient-to-br from-yellow-400 to-amber-500"
              title={tr.stepFindTitle}
              desc={tr.stepFindDesc}
            />
          </div>
        </section>

        {/* Ad slot */}
        <AdBanner size="300x250" />

        <p className="mt-5 text-center text-xs font-medium text-slate-500">
          {tr.footerNote}
        </p>
      </main>

      <footer className="px-4 pb-5 text-center text-[11px] text-slate-400">
        © 2026 Don&apos;t Block Me · Friendship Dare Quiz
      </footer>
    </div>
  );
}

function StepCard({
  num,
  icon,
  iconBg,
  title,
  desc,
}: {
  num: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border-l-4 border-pink-300 bg-white/90 p-4 shadow-md shadow-black/5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-md`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-extrabold tracking-wide text-slate-800">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>
      </div>
      <span className="ml-auto text-2xl font-extrabold text-slate-200">{num}</span>
    </div>
  );
}
