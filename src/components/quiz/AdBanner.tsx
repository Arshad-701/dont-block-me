"use client";

import Script from "next/script";

// 300x250 banner ad slot (AdSterra / Monetag via bicea.org).
// Properly styled: centered white card with shadow, border, and "Ad" label.
export function AdBanner({ variant = "bottom" }: { variant?: "bottom" | "inline" }) {
  return (
    <div
      className={`flex w-full justify-center px-3 ${
        variant === "bottom" ? "mt-3" : "my-3"
      }`}
      aria-label="advertisement"
    >
      <div
        className="relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5"
        style={{ width: 300, height: 250, maxWidth: "100%" }}
      >
        {/* "Ad" transparency label */}
        <span className="pointer-events-none absolute left-2 top-1.5 z-10 rounded bg-black/40 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/80">
          Ad
        </span>

        {/* atOptions must be set before the external script loads */}
        <Script
          id="adsterra-banner-opts"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              atOptions = {
                'key' : '31a2bbd1bf1f900b59c96b440b518132',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
              };
            `,
          }}
        />
        <Script
          src="https://bicea.org/22/31a2bbd1bf1f900b59c96b440b518132"
          strategy="lazyOnload"
        />
      </div>
    </div>
  );
}
