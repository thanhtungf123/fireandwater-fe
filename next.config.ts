import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Spec §2: every public URL ends with a trailing slash.
  trailingSlash: true,
  images: {
    // GameDistribution thumbnail hosts.
    remotePatterns: [
      { protocol: "https", hostname: "img.gamedistribution.com" },
      { protocol: "https", hostname: "**.gamedistribution.com" },
    ],
  },
};

export default nextConfig;
