"use client";

import Script from "next/script";

// 300x250 banner ad slot (AdSterra / Monetag via bicea.org).
// Renders an iframe ad at every placement where <AdBanner /> is used.
export function AdBanner({ variant = "bottom" }: { variant?: "bottom" | "inline" }) {
  return (
    <div
      className={`flex w-full justify-center ${variant === "bottom" ? "mt-2" : "my-3"}`}
      aria-label="advertisement"
    >
      <div
        className="overflow-hidden rounded-2xl bg-slate-100 shadow-md"
        style={{ width: 300, height: 250, maxWidth: "100%" }}
      >
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
