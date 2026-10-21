"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import { ArrowRight, Check, Loader2, RotateCcw, Trophy, X } from "lucide-react";
import { AppHeader } from "./AppHeader";
import { AdBanner } from "./AdBanner";
import { Confetti } from "./Confetti";
import { useQuizStore } from "@/store/quiz-store";
import { t } from "@/lib/i18n";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/lib/quiz-data";
import { toast } from "sonner";
import {
  playWhoosh,
  playSuccess,
  playFail,
  playReveal,
  playType,
  playTick,
  playKick,
  playCry,
  playCheer,
  playHighFive,
  playFanfare,
  playHeartPop,
  playCorrect,
  playWrong,
} from "@/lib/sounds";

type QuizInfo = {
  id: string;
  creatorName: string;
  creatorGender: string;
  language: string;
  // creator's selected option index per question (-1 if skipped)
  answers: number[];
};

export function FriendQuiz({ quizId }: { quizId: string }) {
  const router = useRouter();
  const lang = useQuizStore((s) => s.lang);
  const setLang = useQuizStore((s) => s.setLang);
  const tr = t(lang);
  const friendName = useQuizStore((s) => s.friendName);
  const setFriendName = useQuizStore((s) => s.setFriendName);
  const friendAnswers = useQuizStore((s) => s.friendAnswers);
  const setFriendAnswer = useQuizStore((s) => s.setFriendAnswer);
  const friendCurrent = useQuizStore((s) => s.friendCurrent);
  const setFriendCurrent = useQuizStore((s) => s.setFriendCurrent);
  const friendScore = useQuizStore((s) => s.friendScore);
  const setFriendScore = useQuizStore((s) => s.setFriendScore);
  const setStep = useQuizStore((s) => s.setStep);

  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"name" | "questions" | "result">("name");
  const [submitting, setSubmitting] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // clear any pending auto-advance on unmount
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // fetch quiz
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/quiz?id=${quizId}`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          toast.error("Quiz not found");
          router.push("/");
          return;
        }
        setQuiz(data.quiz);
        if (data.quiz.language) setLang(data.quiz.language);
      } catch {
        toast.error("Could not load quiz");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [quizId]);

  const startQuiz = () => {
    if (friendName.trim().length > 0) {
      playWhoosh();
      setPhase("questions");
      setFriendCurrent(0);
    }
  };

  const question = QUESTIONS[friendCurrent];
  const selected = friendAnswers[friendCurrent];
  const isLast = friendCurrent === TOTAL_QUESTIONS - 1;
  const correctIdx = quiz?.answers[friendCurrent] ?? -1;
  const answered = selected !== -1;

  const choose = (optIdx: number) => {
    if (answered) return; // lock once answered
    setFriendAnswer(friendCurrent, optIdx);
    // instant feedback sound
    if (optIdx === correctIdx) playCorrect();
    else playWrong();
    // auto-advance after the user sees the feedback (except last question)
    if (!isLast) {
      advanceTimer.current = setTimeout(() => {
        playWhoosh();
        setFriendCurrent(friendCurrent + 1);
      }, 1300);
    }
  };

  const next = () => {
    if (!answered) return; // must answer first
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (isLast) void submit();
    else {
      playWhoosh();
      setFriendCurrent(friendCurrent + 1);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          friendName,
          answers: friendAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFriendScore(data.response.score);
      // play reveal sound depending on score
      playReveal();
      setTimeout(() => {
        if (data.response.score / TOTAL_QUESTIONS >= 0.5) playSuccess();
        else playFail();
      }, 350);
      setPhase("result");
    } catch {
      toast.error("Could not submit your answers");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <img src="/bear-female.png" alt="" className="h-24 w-24 animate-bounce-soft" />
        <p className="flex items-center gap-2 font-bold text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> loading your dare…
        </p>
      </div>
    );
  }

  if (!quiz) return null;

  const creatorName = quiz.creatorName;
  const title = question?.title.replace("{name}", creatorName);

  // ----- RESULT -----
  if (phase === "result" && friendScore !== null) {
    return (
      <FriendResult
        quizId={quizId}
        creatorName={creatorName}
        score={friendScore}
        tr={tr}
        onRetake={() => {
          setFriendScore(null);
          setFriendCurrent(0);
          // reset answers
          for (let i = 0; i < TOTAL_QUESTIONS; i++) setFriendAnswer(i, -1);
          setPhase("name");
        }}
        onScores={() => {
          setStep("scoreboard");
          router.push(`/?page=scoreboard&quiz=${quizId}`);
        }}
      />
    );
  }

  // ----- NAME -----
  if (phase === "name") {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
          <div className="flex flex-1 flex-col items-center justify-center py-6 animate-pop-in">
            <div className="relative mb-3">
              <img
                src={quiz.creatorGender === "male" ? "/bear-male.png" : "/bear-female.png"}
                alt="creator bear"
                className="h-32 w-32 drop-shadow-lg animate-wiggle"
              />
              <span className="absolute -right-1 top-4 text-xl text-pink-300">💕</span>
            </div>

            <div className="relative mx-auto mb-5 max-w-xs rounded-3xl bg-pink-100 px-5 py-3 text-center shadow-md">
              <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-pink-100" />
              <p className="text-base font-bold text-slate-800">{tr.friendEnterName}</p>
              <p className="mt-1 text-sm font-semibold text-fuchsia-500">
                {tr.letsSeeHowWell} <span className="underline decoration-wavy decoration-pink-400">{creatorName}</span>!
              </p>
              <p className="mt-1 text-xs font-bold text-sky-500">{tr.canYouScore}</p>
            </div>

            <input
              autoFocus
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value.slice(0, 15))}
              onKeyDown={(e) => e.key === "Enter" && startQuiz()}
              placeholder={tr.enterName}
              className="w-full rounded-2xl border-4 border-sky-400 bg-white px-4 py-4 pr-16 text-lg font-bold text-slate-800 outline-none shadow-lg shadow-sky-200/50 placeholder:font-medium placeholder:text-slate-300"
            />
            <span className="-mt-3 mr-2 self-end text-xs font-semibold text-slate-400">
              {friendName.length}/15
            </span>

            <button
              onClick={startQuiz}
              disabled={friendName.trim().length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-sky-300 transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tr.continueBtn}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
          <AdBanner />
        </main>
      </div>
    );
  }

  // ----- QUESTIONS -----
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      {/* step tracker: numbered badges turn green ✓ (correct) or red ✕ (wrong) */}
      <div className="px-3 pb-2 pt-1">
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>
            {tr.question} {friendCurrent + 1} {tr.of} {TOTAL_QUESTIONS}
          </span>
          <span className="text-pink-500">
            {Math.round(((friendCurrent + 1) / TOTAL_QUESTIONS) * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
            const a = friendAnswers[i] !== -1;
            const c = a && friendAnswers[i] === (quiz?.answers[i] ?? -1);
            const isCur = i === friendCurrent;
            return (
              <div
                key={i}
                className={`flex h-7 flex-1 items-center justify-center rounded-full text-xs font-extrabold transition ${
                  c
                    ? "bg-green-500 text-white"
                    : a
                    ? "bg-red-500 text-white"
                    : isCur
                    ? "bg-sky-500 text-white ring-2 ring-sky-300"
                    : "bg-white/80 text-slate-400 ring-1 ring-black/5"
                }`}
              >
                {c ? (
                  <Check className="h-3.5 w-3.5" />
                ) : a ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-4">
        <div key={friendCurrent} className="flex flex-1 flex-col animate-pop-in">
          <p className="mb-3 text-center text-sm font-bold text-slate-500">
            {tr.letsSeeHowWell} <span className="text-fuchsia-500">{creatorName}</span>
          </p>
          <div className="relative mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-md ring-1 ring-black/5">
              {question.emoji}
            </span>
            <h2 className="text-xl font-extrabold leading-tight text-slate-800">
              {title}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const isSelected = answered && selected === idx;
              const isCorrectOpt = idx === correctIdx;
              const showCorrect = answered && isCorrectOpt; // selected-correct OR revealed
              const showWrong = answered && isSelected && !isCorrectOpt;
              const dim = answered && !isSelected && !isCorrectOpt;
              return (
                <button
                  key={idx}
                  data-sound="none"
                  onClick={() => choose(idx)}
                  className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border-2 p-4 shadow-md transition active:scale-95 ${
                    showCorrect && isSelected
                      ? "border-green-500 bg-green-100 ring-2 ring-green-300 scale-[1.02] shadow-lg shadow-green-200"
                      : showCorrect
                      ? "border-green-500 bg-green-100"
                      : showWrong
                      ? "border-red-500 bg-red-100 ring-2 ring-red-300 scale-[1.02] shadow-lg shadow-red-200"
                      : dim
                      ? "border-white bg-white opacity-50"
                      : "border-white bg-white text-slate-700 ring-black/5 hover:scale-[1.03]"
                  }`}
                >
                  {showCorrect && (
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  {showWrong && (
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md">
                      <X className="h-4 w-4" />
                    </span>
                  )}
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${opt.color} text-4xl shadow-inner ${
                      dim ? "opacity-60 grayscale" : ""
                    }`}
                  >
                    {opt.emoji}
                  </span>
                  <span className="text-sm font-bold">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* floating continue */}
        <div className="sticky bottom-0 z-30 -mx-4 mt-3 bg-gradient-to-t from-sky-50 to-transparent px-4 pb-2 pt-3">
          <button
            onClick={next}
            disabled={submitting || !answered}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-sky-300 transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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

        <AdBanner />
      </main>
    </div>
  );
}

// ===== End-game score reveal sequence (4 phases) =====
// Phase 1: typewriter dialogue · Phase 2: count-up score ·
// Phase 3: 3-tier animation · Phase 4: action buttons + scoreboard CTA
type RevealPhase = "dialogue" | "counter" | "tier" | "actions";

// Tier boundaries scale proportionally with the question count so the
// low / mid / high moods stay balanced regardless of TOTAL_QUESTIONS.
function tierOf(score: number): "low" | "mid" | "high" {
  const pct = score / TOTAL_QUESTIONS;
  if (pct < 0.5) return "low";
  if (pct < 0.85) return "mid";
  return "high";
}

function SpeechBubble({
  side,
  children,
}: {
  side: "left" | "right" | "center";
  children: ReactNode;
}) {
  return (
    <div
      className={`relative max-w-[85%] rounded-3xl bg-white px-5 py-3 shadow-xl ring-1 ring-black/5 ${
        side === "left"
          ? "rounded-bl-md"
          : side === "right"
          ? "rounded-br-md"
          : ""
      }`}
    >
      <span
        className={`absolute -bottom-2 h-4 w-4 rotate-45 bg-white ${
          side === "left"
            ? "left-6"
            : side === "right"
            ? "right-6"
            : "left-1/2 -translate-x-1/2"
        }`}
      />
      {children}
    </div>
  );
}

function SkipButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      data-sound="none"
      className="absolute right-3 top-3 z-40 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-500 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-105 active:scale-95"
    >
      {label} <span className="text-sm">⏭</span>
    </button>
  );
}

function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={`absolute fill-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.05)] ${className}`}
      aria-hidden
    >
      <path d="M16 40c-6.6 0-12-5.4-12-12 0-5.2 3.3-9.6 7.9-11.3C13.4 7.9 19 3 26 3c6.2 0 11.3 3.8 13.5 9.1.9-.2 1.9-.4 2.9-.4 6.1 0 11 4.9 11 11s-4.9 11-11 11H16z" />
    </svg>
  );
}

function Clouds() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Cloud className="left-[5%] top-[8%] w-24 animate-float-slow" />
      <Cloud className="right-[6%] top-[16%] w-28 animate-float" />
      <Cloud className="left-[34%] top-[5%] w-20 animate-float-slower" />
      <Cloud className="right-[28%] bottom-[14%] w-24 animate-float-slow opacity-80" />
    </div>
  );
}

// Two separate transparent character assets placed directly on the stage
// canvas — NO card / border / rectangular wrapper around the characters.
// Each character is a positioned motion.div container so a speech bubble can
// be anchored relative to it (directly above the head). Motion is driven by
// Framer Motion `animate` values passed per phase.
type CharMotion = {
  animate: TargetAndTransition;
  transition?: Transition;
};
function Characters({
  panda,
  bear,
  pandaBubble,
  bearBubble,
  pandaSrc = "/avatars/panda-idle.png",
  bearSrc = "/avatars/bear-idle.png",
}: {
  panda: CharMotion;
  bear: CharMotion;
  pandaBubble?: ReactNode;
  bearBubble?: ReactNode;
  pandaSrc?: string;
  bearSrc?: string;
}) {
  return (
    <>
      <motion.div
        id="panda"
        className="absolute bottom-6 left-3 sm:bottom-10 sm:left-16"
        animate={panda.animate}
        transition={panda.transition}
      >
        {pandaBubble && (
          <div className="absolute bottom-[112%] left-0 w-max max-w-[80vw]">
            {pandaBubble}
          </div>
        )}
        <img
          src={pandaSrc}
          alt="Bubu the panda"
          className="w-28 drop-shadow-lg sm:w-36"
        />
      </motion.div>
      <motion.div
        id="bear"
        className="absolute bottom-6 right-3 sm:bottom-10 sm:right-16"
        animate={bear.animate}
        transition={bear.transition}
      >
        {bearBubble && (
          <div className="absolute bottom-[112%] right-0 w-max max-w-[80vw]">
            {bearBubble}
          </div>
        )}
        <img
          src={bearSrc}
          alt="Dudu the bear"
          className="w-28 drop-shadow-lg sm:w-36"
        />
      </motion.div>
    </>
  );
}

// Rising hearts overlay for the high-tier celebration.
function HeartsBurst() {
  const hearts = Array.from({ length: 18 }).map((_, i) => ({
    left: 10 + Math.random() * 80,
    top: 30 + Math.random() * 50,
    delay: Math.random() * 1.6,
    size: 16 + Math.random() * 22,
    dur: 1.8 + Math.random() * 1.6,
    i,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.i}
          className="absolute"
          style={{
            left: `${h.left}%`,
            top: `${h.top}%`,
            fontSize: `${h.size}px`,
            animation: `heart-rise ${h.dur}s ease-in-out ${h.delay}s infinite`,
          }}
        >
          💕
        </span>
      ))}
    </div>
  );
}

// ---- Phase 1: sequential typewriter dialogue ----
function DialoguePhase({
  tr,
  onDone,
}: {
  tr: ReturnType<typeof t>;
  onDone: () => void;
}) {
  const lines = tr.dialogueLines;
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const line = lines[i] ?? "";
    let ci = 0;
    setTyped("");
    let timer: ReturnType<typeof setTimeout>;
    const typeNext = () => {
      if (ci <= line.length) {
        setTyped(line.slice(0, ci));
        if (ci > 0 && ci % 3 === 0) playType();
        ci++;
        timer = setTimeout(typeNext, 42);
      } else {
        timer = setTimeout(() => {
          if (i < lines.length - 1) setI(i + 1);
          else onDone();
        }, 1100);
      }
    };
    typeNext();
    return () => clearTimeout(timer);
  }, [i]);

  // speaker alternates: lines 0,2,4 = creator Bear (right); 1,3 = friend Panda (left)
  const bearSpeaking = i % 2 === 0;
  const pandaSpeaking = !bearSpeaking;

  // typewriter speech bubble — anchored directly above the speaking
  // character's head (bottom-[112%] of its container, left-0 / right-0),
  // with a CSS pointer arrow pointing down toward that character.
  const bubble = (
    <SpeechBubble side={bearSpeaking ? "right" : "left"}>
      <p className="text-base font-bold text-slate-800">
        {typed}
        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-slate-400 align-middle" />
      </p>
    </SpeechBubble>
  );

  return (
    <Characters
      panda={{
        // the speaking panda does a subtle floating bounce; the other sits still
        animate: pandaSpeaking ? { y: [0, -8, 0] } : { y: 0 },
        transition: pandaSpeaking
          ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4 },
      }}
      bear={{
        animate: bearSpeaking ? { y: [0, -8, 0] } : { y: 0 },
        transition: bearSpeaking
          ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4 },
      }}
      pandaBubble={pandaSpeaking ? bubble : null}
      bearBubble={bearSpeaking ? bubble : null}
    />
  );
}

// ---- Phase 2: animated count-up score counter ----
function CounterPhase({
  score,
  tr,
  onDone,
}: {
  score: number;
  tr: ReturnType<typeof t>;
  onDone: () => void;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= score) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      playTick();
      setN(n + 1);
    }, 180);
    return () => clearTimeout(t);
  }, [n, score]);

  return (
    <>
      {/* two transparent characters directly on the canvas (idle bounce) */}
      <Characters
        panda={{
          animate: { y: [0, -12, 0], rotate: [0, -2, 0] },
          transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
        }}
        bear={{
          animate: { y: [0, -10, 0], rotate: [0, 2, 0] },
          transition: { duration: 1.7, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
        }}
      />

      {/* paper score card slides down from the top */}
      <div className="absolute inset-x-0 top-[14%] z-10 flex justify-center px-6">
        <div className="w-full max-w-sm anim-slide-down text-center">
          <div className="relative mx-auto w-fit">
            <span className="block -rotate-2 rounded-md bg-amber-300 px-4 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-700 shadow-md ring-1 ring-amber-400">
              {tr.yourScore}
            </span>
          </div>
          <div className="relative mx-auto mt-1 w-fit rounded-2xl bg-white px-8 py-3 shadow-xl ring-1 ring-sky-100">
            <p className="text-5xl font-extrabold leading-none">
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                {n}
              </span>
              <span className="text-slate-300">/{TOTAL_QUESTIONS}</span>
            </p>
            <span className="absolute -left-1 top-1 text-sm animate-twinkle">✦</span>
            <span className="absolute -right-1 bottom-1 text-sm animate-twinkle">✦</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ---- Phase 3: 3-tier dynamic animations ----
function TierPhase({
  score,
  tr,
  onDone,
}: {
  score: number;
  tr: ReturnType<typeof t>;
  onDone: () => void;
}) {
  const tier = tierOf(score);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (tier === "low") {
      playKick();
      timers.push(setTimeout(playCry, 500));
    } else if (tier === "mid") {
      timers.push(setTimeout(playCheer, 700));
      timers.push(setTimeout(playHighFive, 1050));
    } else {
      playFanfare();
      [500, 1100, 1700, 2300].forEach((d) =>
        timers.push(setTimeout(playHeartPop, d))
      );
    }
    const end = setTimeout(onDone, 4200);
    timers.push(end);
    return () => timers.forEach(clearTimeout);
  }, []);

  const bubbleText =
    tier === "low" ? tr.tierLowMsg : tier === "mid" ? tr.tierMidMsg : tr.tierHighMsg;

  // Per-tier Framer Motion values (from the provided JSON spec), applied
  // directly to the transparent character containers.
  const panda =
    tier === "low"
      ? {
          // LOW: panda slides right toward the bear (mobile-safe amplitude so it
          // stays fully in-frame on small phones)
          animate: { x: [0, 60, 120] },
          transition: { duration: 1.2, times: [0, 0.5, 1], delay: 0.3, ease: "easeOut" },
        }
      : tier === "mid"
      ? {
          // MID: friendly happy jump
          animate: { y: [0, -20, 0] },
          transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
        }
      : {
          // HIGH: run together + hug
          animate: { x: [0, 80], scale: 1.1 },
          transition: { duration: 0.8, times: [0, 1], delay: 0.3, ease: "easeOut" },
        };
  const bear =
    tier === "low"
      ? {
          // LOW: bear pushed off-screen to the left (block effect); clipped by
          // the scene's overflow-hidden so it never causes horizontal scroll
          animate: { x: [0, -90, -220], rotate: [0, -15, -45], opacity: [1, 1, 0] },
          transition: { duration: 1.2, times: [0, 0.5, 1], delay: 0.5, ease: "easeIn" },
        }
      : tier === "mid"
      ? {
          animate: { y: [0, -20, 0] },
          transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 },
        }
      : {
          animate: { x: [0, -80], scale: 1.1 },
          transition: { duration: 0.8, times: [0, 1], delay: 0.3, ease: "easeOut" },
        };

  // Per-tier mood images: the character assets swap based on the score tier
  // so the panda/bear visibly change expression (idle → crying → happy → hug).
  const pandaSrc =
    tier === "low"
      ? "/avatars/panda-idle.png"
      : "/avatars/panda-happy.png";
  const bearSrc =
    tier === "low"
      ? "/avatars/bear-crying.png"
      : "/avatars/bear-happy.png";

  return (
    <>
      {tier === "high" && <HeartsBurst />}
      {tier === "high" && <Confetti burstKey={"tier" + score} count={50} />}

      {tier === "high" ? (
        // HIGH: single hugging-pair asset centered (the "hug" payoff)
        <motion.img
          src="/avatars/both-hug.png"
          alt="Bubu and Dudu hugging"
          className="absolute bottom-8 left-1/2 w-44 -translate-x-1/2 drop-shadow-lg sm:bottom-12 sm:w-52"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        />
      ) : (
        // LOW / MID: two transparent characters on the canvas; per-tier mood + motion
        <Characters
          panda={panda}
          bear={bear}
          pandaSrc={pandaSrc}
          bearSrc={bearSrc}
        />
      )}

      {/* tier speech bubble (centered above characters) */}
      <div className="absolute inset-x-0 top-[12%] z-10 flex justify-center px-6">
        <div className="flex w-full max-w-sm animate-pop-in justify-center">
          <SpeechBubble side="center">
            <p className="text-center text-base font-extrabold text-slate-800">
              {bubbleText}
            </p>
          </SpeechBubble>
        </div>
      </div>
    </>
  );
}

// ---- Phase 4: action buttons + scoreboard CTA (existing modal kept intact) ----
function ResultActions({
  quizId,
  creatorName,
  score,
  tr,
  onRetake,
  onScores,
}: {
  quizId: string;
  creatorName: string;
  score: number;
  tr: ReturnType<typeof t>;
  onRetake: () => void;
  onScores: () => void;
}) {
  const router = useRouter();
  const resetCreator = useQuizStore((s) => s.resetCreator);
  const setStep = useQuizStore((s) => s.setStep);

  const pct = score / TOTAL_QUESTIONS;
  const isLow = pct <= 0.3;
  const isPerfect = pct === 1;

  // score-specific reaction line + emoji
  let reaction = tr.resultGood;
  let reactionEmoji = "😊";
  if (isPerfect) {
    reaction = tr.resultPerfect;
    reactionEmoji = "🎉";
  } else if (pct >= 0.7) {
    reaction = tr.resultGreat;
    reactionEmoji = "💕";
  } else if (isLow) {
    reaction = tr.resultFake;
    reactionEmoji = "🚫";
  } else if (pct <= 0.4) {
    reaction = tr.resultLow;
    reactionEmoji = "🤔";
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?quiz=${quizId}`
      : "";
  const shareText = `I scored ${score}/${TOTAL_QUESTIONS} on ${creatorName}'s friendship dare quiz! ${reactionEmoji} Are we real or fake friends? Take it: ${shareUrl}`;

  const shareScore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Don't Block Me", text: shareText, url: shareUrl });
      } catch {
        /* cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success(tr.copied);
      } catch {
        /* */
      }
    }
  };

  // viral loop: friend becomes a creator
  const createOwn = () => {
    playWhoosh();
    resetCreator();
    setStep("create");
    router.push("/?page=create");
  };

  const close = () => {
    playWhoosh();
    router.push("/");
  };

  // the "block" word gets highlighted; rest of the message is plain
  const findBlock = tr.findBlockFakeFriends.split("block");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-6">
      {/* confetti for good scores */}
      {!isLow && <Confetti burstKey={quizId + score} count={isPerfect ? 60 : 36} />}

      {/* modal card */}
      <div
        className={`relative z-20 w-full max-w-md rounded-[2rem] border-4 border-white bg-white/95 p-5 text-center shadow-2xl shadow-pink-200/60 ${
          isLow ? "animate-shake" : "animate-pop-in"
        }`}
      >
        {/* close X */}
        <button
          onClick={close}
          aria-label={tr.close}
          className="absolute -right-2 -top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 text-white shadow-lg ring-4 ring-white transition hover:scale-110 active:scale-95"
        >
          <span className="text-lg font-bold">✕</span>
        </button>

        {/* score tape + notebook paper card */}
        <div className="relative mx-auto -mt-10 mb-1 w-fit">
          <span className="block -rotate-2 rounded-md bg-amber-300 px-4 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-700 shadow-md ring-1 ring-amber-400">
            {tr.yourScore}
          </span>
        </div>

        <div className="relative mx-auto mb-2 w-fit rounded-2xl bg-gradient-to-b from-sky-50 to-white px-7 py-3 shadow-inner ring-1 ring-sky-100">
          <p className="text-5xl font-extrabold leading-none">
            <span
              className={
                isLow
                  ? "bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent"
              }
            >
              {score}
            </span>
            <span className="text-slate-300">/{TOTAL_QUESTIONS}</span>
          </p>
          {/* doodles */}
          <span className="absolute -left-1 top-1 text-sm animate-twinkle">✦</span>
          <span className="absolute -right-1 bottom-1 text-sm animate-twinkle">✦</span>
          <span className="absolute right-2 top-0 text-[10px] text-pink-300">▲</span>
        </div>

        {/* logo */}
        <div className="mb-1 flex items-center justify-center gap-1.5">
          <img src="/bear-male.png" alt="" className="h-8 w-8 drop-shadow" />
          <span className="text-xl font-extrabold leading-none">
            <span className="text-slate-700">Don&apos;t</span>{" "}
            <span className="bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent">Block</span>{" "}
            <span className="text-sky-500">Me</span>
          </span>
          <img src="/bear-female.png" alt="" className="h-8 w-8 drop-shadow" />
        </div>

        {/* bears hero illustration in a phone-window */}
        <div className="relative mx-auto mb-3 max-w-[220px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-emerald-50 p-2 ring-1 ring-sky-100">
          <span className="absolute left-2 top-1 text-xs animate-twinkle">✨</span>
          <span className="absolute right-2 top-1 text-xs">💗</span>
          <img
            src="/bears-hero.png"
            alt="two bears on their phones"
            className="w-full drop-shadow-md"
          />
          {/* ground */}
          <div className="h-2 w-full rounded-b-2xl bg-emerald-200/60" />
        </div>

        {/* reaction message */}
        <p className="mb-1 text-base font-extrabold text-slate-800">
          {reactionEmoji} {reaction}
        </p>

        {/* find & block your fake friends */}
        <p className="mb-3 text-lg font-extrabold leading-tight text-slate-800">
          {findBlock[0]}
          <span className="marker-highlight">{tr.findBlockFakeFriends.includes("block") ? "block" : ""}</span>
          {findBlock.slice(1).join("block")}
        </p>

        {/* primary CTA: create your own quiz (viral loop) */}
        <button
          onClick={createOwn}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-sky-300 transition hover:scale-[1.02] active:scale-95"
        >
          {tr.createYourQuiz}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 transition group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>

        {/* secondary actions */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={shareScore}
            className="flex flex-col items-center gap-1 rounded-2xl bg-pink-50 px-2 py-2.5 text-[11px] font-bold text-pink-600 shadow-sm ring-1 ring-pink-100 transition hover:scale-105 active:scale-95"
          >
            <span className="text-base">📤</span>
            {tr.shareMyScore}
          </button>
          <button
            onClick={onScores}
            className="flex flex-col items-center gap-1 rounded-2xl bg-amber-50 px-2 py-2.5 text-[11px] font-bold text-amber-600 shadow-sm ring-1 ring-amber-100 transition hover:scale-105 active:scale-95"
          >
            <span className="text-base">🏆</span>
            {tr.checkScores}
          </button>
          <button
            onClick={onRetake}
            className="flex flex-col items-center gap-1 rounded-2xl bg-sky-50 px-2 py-2.5 text-[11px] font-bold text-sky-600 shadow-sm ring-1 ring-sky-100 transition hover:scale-105 active:scale-95"
          >
            <span className="text-base">🔁</span>
            {tr.tryAgain}
          </button>
        </div>

        <p className="mt-3 text-xs font-semibold text-slate-400">{tr.nowYourTurn}</p>
      </div>

      {/* ad slot below modal */}
      <div className="mx-auto mt-4 w-full max-w-md">
        <AdBanner />
      </div>
    </div>
  );
}

// Orchestrator: drives the 4-phase sequence with smooth transitions.
function FriendResult({
  quizId,
  creatorName,
  score,
  tr,
  onRetake,
  onScores,
}: {
  quizId: string;
  creatorName: string;
  score: number;
  tr: ReturnType<typeof t>;
  onRetake: () => void;
  onScores: () => void;
}) {
  const [phase, setPhase] = useState<RevealPhase>("dialogue");

  const goActions = () => {
    playWhoosh();
    setPhase("actions");
  };

  if (phase === "actions") {
    return (
      <ResultActions
        quizId={quizId}
        creatorName={creatorName}
        score={score}
        tr={tr}
        onRetake={onRetake}
        onScores={onScores}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#DDEEFF]">
      {/* full-screen light-blue canvas with floating clouds */}
      <Clouds />
      <SkipButton onClick={goActions} label={tr.skipIntro} />
      {phase === "dialogue" && (
        <DialoguePhase
          tr={tr}
          onDone={() => {
            playWhoosh();
            setPhase("counter");
          }}
        />
      )}
      {phase === "counter" && (
        <CounterPhase
          score={score}
          tr={tr}
          onDone={() => {
            playWhoosh();
            setPhase("tier");
          }}
        />
      )}
      {phase === "tier" && (
        <TierPhase score={score} tr={tr} onDone={goActions} />
      )}
    </div>
  );
}
