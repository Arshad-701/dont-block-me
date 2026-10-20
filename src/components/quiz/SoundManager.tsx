"use client";

import { useEffect } from "react";
import { useQuizStore } from "@/store/quiz-store";
import {
  setSoundEnabled,
  playTap,
  playSelect,
  playPop,
  playBack,
} from "@/lib/sounds";

// Mounts a global pointerdown listener that plays a tap sound on any
// button / link / [data-tap] element, unless the element opts out via
// data-sound="none", or requests a specific sound via data-sound="select|pop".
export function SoundManager() {
  const soundOn = useQuizStore((s) => s.soundOn);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!useQuizStore.getState().soundOn) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest<HTMLElement>(
        'button, a, [role="button"], [data-tap]'
      );
      if (!el) return;
      const sound = el.getAttribute("data-sound");
      if (sound === "none") return;
      if (sound === "select") {
        playSelect();
        return;
      }
      if (sound === "pop") {
        playPop();
        return;
      }
      if (sound === "back") {
        playBack();
        return;
      }
      playTap();
    };
    document.addEventListener("pointerdown", handler, { passive: true });
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  return null;
}
