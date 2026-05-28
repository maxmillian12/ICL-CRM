import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" for self-hosted (Docker/Render). Use "export" for static Netlify.
  output: process.env.NEXT_OUTPUT === "export" ? "export" : "standalone",
  images: {
    // Allow local PNG images (ic-logo.png) and remote patterns
    unoptimized: process.env.NEXT_OUTPUT === "export",
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.neon.tech" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
