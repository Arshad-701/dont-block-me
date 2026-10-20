"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useQuizStore } from "@/store/quiz-store";
import { playTap } from "@/lib/sounds";

// Small floating sound on/off toggle.
export function SoundToggle() {
  const soundOn = useQuizStore((s) => s.soundOn);
  const setSoundOn = useQuizStore((s) => s.setSoundOn);

  return (
    <button
      onClick={() => {
        const next = !soundOn;
        setSoundOn(next);
        if (next) playTap();
      }}
      aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-105 active:scale-95"
    >
      {soundOn ? (
        <Volume2 className="h-4 w-4 text-sky-500" />
      ) : (
        <VolumeX className="h-4 w-4 text-slate-400" />
      )}
    </button>
  );
}
