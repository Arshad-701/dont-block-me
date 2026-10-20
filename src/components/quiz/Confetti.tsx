"use client";

import { useMemo } from "react";

type ConfettiProps = {
  /** number of pieces */
  count?: number;
  /** color palette */
  colors?: string[];
  /** emoji pieces (mixed with color squares). leave empty for shapes only */
  emojis?: string[];
  /** key to retrigger animation */
  burstKey?: string | number;
};

const DEFAULT_COLORS = [
  "#ff6bcb",
  "#3ab0ff",
  "#ffd23f",
  "#a06bff",
  "#48d6a8",
  "#ff8e72",
];

const DEFAULT_EMOJIS = ["💕", "✨", "⭐", "🎉", "💖", "🌟", "🧡"];

// Lightweight CSS confetti. Pieces fall + rotate + sway with random delays.
export function Confetti({
  count = 40,
  colors = DEFAULT_COLORS,
  emojis = DEFAULT_EMOJIS,
  burstKey,
}: ConfettiProps) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 0.6;
      const duration = 2.4 + Math.random() * 1.8;
      const size = 8 + Math.random() * 10;
      const drift = (Math.random() - 0.5) * 160;
      const rotate = Math.random() * 720 - 360;
      const isEmoji = Math.random() > 0.45;
      const emoji = emojis[i % emojis.length];
      const color = colors[i % colors.length];
      const swayDur = 1.6 + Math.random() * 1.4;
      return { left, delay, duration, size, drift, rotate, isEmoji, emoji, color, swayDur, i };
    });
    // re-generate when burstKey changes
  }, [burstKey, count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.i}
          className="absolute top-[-20px] block"
          style={{
            left: `${p.left}%`,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        >
          {p.isEmoji ? (
            <span
              className="block"
              style={{
                fontSize: `${p.size + 6}px`,
                animation: `confetti-sway ${p.swayDur}s ease-in-out ${p.delay}s infinite alternate`,
              }}
            >
              {p.emoji}
            </span>
          ) : (
            <span
              className="block rounded-sm"
              style={{
                width: `${p.size}px`,
                height: `${p.size * 0.6}px`,
                background: p.color,
                ["--drift" as string]: `${p.drift}px`,
                ["--rot" as string]: `${p.rotate}deg`,
                animation: `confetti-sway ${p.swayDur}s ease-in-out ${p.delay}s infinite alternate`,
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}
