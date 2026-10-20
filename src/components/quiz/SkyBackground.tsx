"use client";

// Soft pastel sky background with floating clouds and sparkles.
export function SkyBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-rose-50" />
      {/* sun glow */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />

      {/* clouds */}
      <Cloud className="left-[8%] top-[12%] h-16 w-24 animate-float-slow opacity-90" />
      <Cloud className="right-[10%] top-[22%] h-20 w-28 animate-float opacity-90" />
      <Cloud className="left-[18%] bottom-[18%] h-14 w-20 animate-float-slow opacity-80" />
      <Cloud className="right-[18%] bottom-[26%] h-16 w-24 animate-float opacity-80" />
      <Cloud className="left-[42%] top-[8%] h-12 w-16 animate-float-slower opacity-70" />

      {/* sparkles */}
      <Sparkle className="left-[22%] top-[30%]" color="text-amber-300" />
      <Sparkle className="right-[28%] top-[40%]" color="text-pink-300" />
      <Sparkle className="left-[70%] bottom-[40%]" color="text-violet-300" />
      <Sparkle className="left-[12%] bottom-[45%]" color="text-sky-300" />
    </div>
  );
}

function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={`absolute fill-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.06)] ${className}`}
      aria-hidden
    >
      <path d="M16 40c-6.6 0-12-5.4-12-12 0-5.2 3.3-9.6 7.9-11.3C13.4 7.9 19 3 26 3c6.2 0 11.3 3.8 13.5 9.1.9-.2 1.9-.4 2.9-.4 6.1 0 11 4.9 11 11s-4.9 11-11 11H16z" />
    </svg>
  );
}

function Sparkle({
  className = "",
  color = "text-amber-300",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span className={`absolute text-2xl ${color} animate-twinkle ${className}`}>
      ✦
    </span>
  );
}
