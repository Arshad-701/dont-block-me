"use client";

import { useEffect, useRef } from "react";

// AdSterra / Monetag banner ad component.
// Uses direct script injection via useEffect (runs client-side only,
// works reliably on both dev + Vercel production — no iframe/srcDoc issues).

type AdSize = "300x250" | "468x60" | "160x300" | "320x50" | "728x90" | "160x600";

const AD_CONFIG: Record<
  AdSize,
  { key: string; width: number; height: number }
> = {
  "300x250": { key: "31a2bbd1bf1f900b59c96b440b518132", width: 300, height: 250 },
  "468x60": { key: "40d77e141018b21ed763b84cdedaafee", width: 468, height: 60 },
  "160x300": { key: "f83d3b043e1e10333dc856e1a8be2b19", width: 160, height: 300 },
  "320x50": { key: "f2810b30720c276117ca97e74504200c", width: 320, height: 50 },
  "728x90": { key: "cb59749757389e90f79dfc37783786e0", width: 728, height: 90 },
  "160x600": { key: "f78563361aac4e1d3435094ac4a20af5", width: 160, height: 600 },
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Clear any previous ad content
    container.innerHTML = "";

    // 1) Set atOptions (the ad config the external script reads)
    const optsScript = document.createElement("script");
    optsScript.text = `atOptions = {'key':'${config.key}','format':'iframe','height':${config.height},'width':${config.width},'params':{}};`;
    container.appendChild(optsScript);

    // 2) Load the external ad script (creates an iframe inside the container)
    const adScript = document.createElement("script");
    adScript.src = `https://bicea.org/22/${config.key}`;
    adScript.async = true;
    container.appendChild(adScript);

    // Cleanup on unmount
    return () => {
      container.innerHTML = "";
    };
  }, [config.key, config.height, config.width]);

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
        {/* ad scripts injected here by useEffect */}
        <div ref={ref} className="h-full w-full" />
      </div>
    </div>
  );
}
