"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ArrowRight, Trophy, Link2, Sparkles } from "lucide-react";
import { AppHeader } from "./AppHeader";
import { AdBanner } from "./AdBanner";
import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { playWhoosh, playPop } from "@/lib/sounds";

export function SharePage({ quizId }: { quizId: string }) {
  const router = useRouter();
  const lang = useQuizStore((s) => s.lang);
  const tr = t(lang);
  const creatorName = useQuizStore((s) => s.creatorName);
  const setStep = useQuizStore((s) => s.setStep);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?quiz=${quizId}`
      : `/?quiz=${quizId}`;

  const shareText = `Hey! ${creatorName} challenged you to a friendship dare quiz 😎 Can you score 10/10? Find out if you're a real or fake friend! ${shareUrl}`;

  const socials = [
    {
      name: "WhatsApp",
      bg: "bg-gradient-to-br from-green-400 to-green-600",
      icon: <WhatsAppIcon />,
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Instagram",
      bg: "bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400",
      icon: <InstagramIcon />,
      url: `https://www.instagram.com/`,
    },
    {
      name: "Snapchat",
      bg: "bg-gradient-to-br from-yellow-300 to-yellow-500",
      icon: <SnapchatIcon />,
      url: `https://www.snapchat.com/`,
    },
    {
      name: "Telegram",
      bg: "bg-gradient-to-br from-sky-400 to-blue-500",
      icon: <TelegramIcon />,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Facebook",
      bg: "bg-gradient-to-br from-blue-500 to-blue-700",
      icon: <FacebookIcon />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      playPop();
      toast.success(tr.copied);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy");
    }
  };

  const shareAll = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Don't Block Me",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        /* cancelled */
      }
    } else {
      copyLink();
    }
  };

  const goScores = () => {
    playWhoosh();
    setStep("scoreboard");
    router.push(`/?page=scoreboard&quiz=${quizId}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
        {/* hero */}
        <div className="relative mt-2 overflow-hidden rounded-[2rem] border-4 border-white bg-white/90 p-6 text-center shadow-xl shadow-pink-200/50 animate-pop-in">
          <Sparkles className="absolute left-3 top-3 h-5 w-5 text-amber-300 animate-twinkle" />
          <span className="absolute right-4 top-4 text-2xl">🎉</span>
          <img
            src="/bear-trophy.png"
            alt="celebrating bear"
            className="mx-auto h-28 w-28 drop-shadow-lg animate-bounce-soft"
          />
          <h1 className="text-2xl font-extrabold text-slate-800">
            {tr.yourQuizIsReady}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {tr.shareWithFriends}
          </p>
        </div>

        {/* link box */}
        <div className="mt-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            <Link2 className="h-3.5 w-3.5" />
            {tr.shareLink}
          </p>
          <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-md ring-1 ring-black/5">
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="min-w-0 flex-1 truncate bg-transparent px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
            />
            <button
              onClick={copyLink}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white shadow transition hover:scale-105 active:scale-95 ${
                copied ? "bg-green-500" : "bg-gradient-to-r from-sky-500 to-blue-600"
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? tr.copied : tr.copy}
            </button>
          </div>
        </div>

        {/* social share */}
        <div className="mt-5">
          <div className="grid grid-cols-5 gap-2.5">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center gap-1.5 ${s.bg} rounded-2xl p-2.5 shadow-md transition hover:scale-110 active:scale-95`}
                aria-label={`Share on ${s.name}`}
              >
                <span className="flex h-8 w-8 items-center justify-center text-white">
                  {s.icon}
                </span>
                <span className="text-[9px] font-bold text-white/90">{s.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* share now button */}
        <button
          onClick={shareAll}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-pink-300 transition hover:scale-[1.02] active:scale-95"
        >
          {tr.shareNow}
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* check scores */}
        <button
          onClick={goScores}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-slate-700 shadow-md ring-1 ring-black/5 transition hover:scale-[1.02] active:scale-95"
        >
          <Trophy className="h-5 w-5 text-amber-500" />
          {tr.checkScores}
          <ArrowRight className="h-4 w-4" />
        </button>

        <AdBanner size="300x250" />
      </main>
    </div>
  );
}

/* inline brand icons */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.25.7-1.45 1.34-2 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.62-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.59.85 2.04.92 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12.99 2.07 1.3 2.37 1.45.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.71.81 2 .96.3.15.5.22.56.34.07.13.07.7-.18 1.4z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
function SnapchatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12.2 21.5c-.13 0-.27 0-.4-.01a4.9 4.9 0 0 1-2.46-.74c-.4-.24-.74-.5-1.12-.78-.5-.37-.9-.5-1.4-.5-.27 0-.53.05-.78.14-.4.15-.7.18-.93.18-.6 0-.95-.4-.95-.86 0-.27.13-.5.4-.66.5-.3.95-.62 1.36-1 .5-.46.7-.96.74-1.5-.02-.16-.1-.27-.27-.36-.2-.1-.42-.18-.65-.24-.2-.06-.4-.13-.55-.2-.16-.07-.3-.18-.36-.34-.1-.25.04-.5.27-.6.2-.1.46-.12.66-.16.3-.06.5-.2.55-.45.06-.3-.06-.6-.27-.8-.4-.46-.7-.96-.9-1.5-.3-.74-.5-1.5-.55-2.3-.06-.9.04-1.8.4-2.6.3-.7.74-1.3 1.3-1.8C7.5 3.6 8.8 3 10.3 3h1.4c1.5.06 2.8.6 3.85 1.55.56.5 1 1.1 1.3 1.8.36.8.46 1.7.4 2.6-.05.8-.25 1.56-.55 2.3-.2.54-.5 1.04-.9 1.5-.2.2-.33.5-.27.8.05.25.25.4.55.45.2.04.46.06.66.16.23.1.37.35.27.6-.06.16-.2.27-.36.34-.16.07-.36.14-.55.2-.23.06-.45.14-.65.24-.17.1-.25.2-.27.36.04.54.24 1.04.74 1.5.4.38.86.7 1.36 1 .27.16.4.4.4.66 0 .46-.36.86-.95.86-.23 0-.53-.03-.93-.18-.25-.1-.5-.14-.78-.14-.5 0-.9.13-1.4.5-.38.28-.72.54-1.12.78a4.9 4.9 0 0 1-2.46.74c-.13.01-.27.01-.4.01z" />
    </svg>
  );
}
function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M21.94 4.3l-3.2 15.06c-.24 1.06-.87 1.32-1.76.82l-4.86-3.58-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.94 9-8.12c.39-.35-.08-.54-.6-.19L6.16 13.2l-4.78-1.5c-1.04-.32-1.06-1.04.22-1.54l18.7-7.2c.87-.32 1.62.19 1.34 1.34z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}
