"use client";

// AdSterra / Monetag banner ad component.
// Each ad loads from a real HTML file (/ads/300x250.html etc.) inside an
// <iframe src="..."> — this works reliably on Vercel production (unlike
// srcDoc which can fail to hydrate in production builds).

type AdSize = "300x250" | "468x60" | "160x300" | "320x50" | "728x90" | "160x600";

const AD_CONFIG: Record<AdSize, { src: string; width: number; height: number }> = {
  "300x250": { src: "/ads/300x250.html", width: 300, height: 250 },
  "468x60": { src: "/ads/468x60.html", width: 468, height: 60 },
  "160x300": { src: "/ads/160x300.html", width: 160, height: 300 },
  "320x50": { src: "/ads/320x50.html", width: 320, height: 50 },
  "728x90": { src: "/ads/728x90.html", width: 728, height: 90 },
  "160x600": { src: "/ads/160x600.html", width: 160, height: 600 },
};

export function AdBanner({
  size = "300x250",
  variant = "bottom",
  className = "",
}: {
  size?: AdSize;
  variant?: "bottom" | "inline";
  className?: string;
}) {
  const config = AD_CONFIG[size];
  return (
    <div
      className={`flex w-full justify-center px-3 ${
        variant === "bottom" ? "mt-3" : "my-2"
      } ${className}`}
      aria-label="advertisement"
    >
      <div
        className="relative overflow-hidden rounded-xl bg-white/90 shadow-md ring-1 ring-black/5"
        style={{ width: config.width, height: config.height, maxWidth: "100%" }}
      >
        <span className="pointer-events-none absolute left-1.5 top-1 z-10 rounded bg-black/40 px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider text-white/80">
          Ad
        </span>
        <iframe
          src={config.src}
          width={config.width}
          height={config.height}
          style={{ border: "none", display: "block", maxWidth: "100%" }}
          title="advertisement"
          loading="lazy"
        />
      </div>
    </div>
  );
}
