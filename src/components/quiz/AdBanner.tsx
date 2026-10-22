"use client";

// AdSterra / Monetag banner ad component.
// Each ad renders in its own isolated <iframe> so multiple ad sizes
// can coexist on the same page without atOptions conflicts.

type AdSize = "300x250" | "468x60" | "160x300" | "320x50" | "728x90" | "160x600";

const AD_CONFIG: Record<AdSize, { key: string; width: number; height: number }> = {
  "300x250": { key: "31a2bbd1bf1f900b59c96b440b518132", width: 300, height: 250 },
  "468x60": { key: "40d77e141018b21ed763b84cdedaafee", width: 468, height: 60 },
  "160x300": { key: "f83d3b043e1e10333dc856e1a8be2b19", width: 160, height: 300 },
  "320x50": { key: "f2810b30720c276117ca97e74504200c", width: 320, height: 50 },
  "728x90": { key: "cb59749757389e90f79dfc37783786e0", width: 728, height: 90 },
  "160x600": { key: "f78563361aac4e1d3435094ac4a20af5", width: 160, height: 600 },
};

function AdIframe({
  adKey,
  width,
  height,
}: {
  adKey: string;
  width: number;
  height: number;
}) {
  const html = `<html><head><style>*{margin:0;padding:0;border:0;overflow:hidden;}</style></head><body><script>atOptions={'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};</script><script src="https://bicea.org/22/${adKey}"></script></body></html>`;
  return (
    <iframe
      srcDoc={html}
      width={width}
      height={height}
      style={{ border: "none", display: "block", maxWidth: "100%" }}
      title="advertisement"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}

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
        <AdIframe adKey={config.key} width={config.width} height={config.height} />
      </div>
    </div>
  );
}
