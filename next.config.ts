import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // hide the Next.js dev indicator badge so it doesn't appear as a "logo"
  // in the corner during preview
  devIndicators: false,
};

export default nextConfig;
