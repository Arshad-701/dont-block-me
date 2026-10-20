"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { AppHeader } from "./AppHeader";
import { AdBanner } from "./AdBanner";
import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";
import { playWhoosh } from "@/lib/sounds";

const MAX_NAME = 15;

export function NameGenderPage() {
  const router = useRouter();
  const lang = useQuizStore((s) => s.lang);
  const tr = t(lang);
  const creatorName = useQuizStore((s) => s.creatorName);
  const setCreatorName = useQuizStore((s) => s.setCreatorName);
  const creatorGender = useQuizStore((s) => s.creatorGender);
  const setCreatorGender = useQuizStore((s) => s.setCreatorGender);
  const setStep = useQuizStore((s) => s.setStep);
  const setCurrentQuestion = useQuizStore((s) => s.setCurrentQuestion);

  const [phase, setPhase] = useState<"name" | "gender">(
    creatorName ? "gender" : "name"
  );

  const goToGender = () => {
    if (creatorName.trim().length > 0) {
      playWhoosh();
      setPhase("gender");
    }
  };

  const goToCreating = () => {
    if (!creatorGender) return;
    playWhoosh();
    setCurrentQuestion(0);
    setStep("creating");
    router.push("/?page=creating");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
        {phase === "name" ? (
          <NameStep
            tr={tr}
            name={creatorName}
            onChange={(v) => setCreatorName(v.slice(0, MAX_NAME))}
            onContinue={goToGender}
          />
        ) : (
          <GenderStep
            tr={tr}
            name={creatorName}
            gender={creatorGender}
            onSelect={setCreatorGender}
            onBack={() => setPhase("name")}
            onContinue={goToCreating}
          />
        )}
        <AdBanner />
      </main>
    </div>
  );
}

function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto mb-5 max-w-xs rounded-3xl bg-pink-100 px-5 py-3 text-center shadow-md">
      <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-pink-100" />
      {children}
    </div>
  );
}

function NameStep({
  tr,
  name,
  onChange,
  onContinue,
}: {
  tr: ReturnType<typeof t>;
  name: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-6 animate-pop-in">
      {/* panda waving */}
      <div className="relative mb-2">
        <img
          src="/bear-female.png"
          alt="cute panda waving"
          className="h-32 w-32 drop-shadow-lg animate-wiggle"
        />
        <span className="absolute -right-2 top-4 text-pink-300 text-xl">💨</span>
      </div>

      <SpeechBubble>
        <p className="text-base font-bold text-slate-800">
          {tr.whatsYour}{" "}
          <span className="font-extrabold text-pink-500">{tr.name}</span>
        </p>
      </SpeechBubble>

      <div className="relative w-full">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onContinue()}
          placeholder={tr.enterName}
          className="w-full rounded-2xl border-4 border-sky-400 bg-white px-4 py-4 pr-16 text-lg font-bold text-slate-800 outline-none shadow-lg shadow-sky-200/50 placeholder:font-medium placeholder:text-slate-300"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
          {name.length}/{MAX_NAME}
        </span>
      </div>

      <button
        onClick={onContinue}
        disabled={name.trim().length === 0}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-sky-300 transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {tr.continueBtn}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>
    </div>
  );
}

function GenderStep({
  tr,
  name,
  gender,
  onSelect,
  onBack,
  onContinue,
}: {
  tr: ReturnType<typeof t>;
  name: string;
  gender: "male" | "female" | null;
  onSelect: (g: "male" | "female") => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col py-4 animate-pop-in">
      <p className="mb-1 text-center text-lg font-bold text-slate-700">
        {tr.hiName.replace("{name}", name)} 
      </p>
      <p className="mb-5 text-center text-base font-bold text-slate-700">
        {tr.chooseYour}{" "}
        <span className="relative inline-block font-extrabold text-sky-500">
          {tr.gender}
          <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-orange-400" />
        </span>
      </p>

      <div className="grid grid-cols-2 gap-4">
        <GenderCard
          active={gender === "male"}
          onClick={() => onSelect("male")}
          img="/bear-male.png"
          label={tr.male}
          ringClass="ring-sky-400"
          bgClass="from-sky-50 to-white"
        />
        <GenderCard
          active={gender === "female"}
          onClick={() => onSelect("female")}
          img="/bear-female.png"
          label={tr.female}
          ringClass="ring-pink-400"
          bgClass="from-pink-50 to-white"
        />
      </div>

      {/* sparkles */}
      <span className="mt-2 text-2xl text-violet-300 animate-twinkle">✨</span>

      <button
        onClick={onContinue}
        disabled={!gender}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-sky-300 transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {tr.continueBtn}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>
    </div>
  );
}

function GenderCard({
  active,
  onClick,
  img,
  label,
  ringClass,
  bgClass,
}: {
  active: boolean;
  onClick: () => void;
  img: string;
  label: string;
  ringClass: string;
  bgClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-3xl border-4 bg-gradient-to-b ${bgClass} p-5 shadow-md transition hover:scale-[1.03] active:scale-95 ${
        active
          ? `${ringClass} ring-4 ring-offset-1 scale-[1.02]`
          : "border-white"
      }`}
    >
      {active && (
        <span className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md`}>
          <Check className="h-4 w-4" />
        </span>
      )}
      <img src={img} alt={label} className="h-28 w-28 drop-shadow-md" />
      <span className="text-base font-extrabold text-slate-700">{label}</span>
    </button>
  );
}
