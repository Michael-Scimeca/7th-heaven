import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "7thheavenband.com", pathname: "/**" },
      { protocol: "http", hostname: "www.7thheavenband.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },

  // ── Security Headers ──
  async headers() {
    const csp = [
      "default-src 'self'",
      // Scripts — self + inline (needed for Next.js) + trusted CDNs
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://www.googletagmanager.com https://cdn.sanity.io",
      // Styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images — allow data URIs for generated OG images
      "img-src 'self' data: blob: https://cdn.sanity.io https://lh3.googleusercontent.com https://7thheavenband.com https://www.7thheavenband.com",
      // Connect — Supabase, LiveKit, Sanity, Upstash
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.livekit.cloud wss://*.livekit.cloud https://*.sanity.io https://*.upstash.io https://hcaptcha.com https://www.googletagmanager.com",
      // Media — LiveKit streams
      "media-src 'self' blob: https://*.livekit.cloud",
      // Frames — hCaptcha only
      "frame-src https://hcaptcha.com https://newassets.hcaptcha.com",
      // Workers (Next.js needs blob)
      "worker-src 'self' blob:",
      // Block all object embeds
      "object-src 'none'",
      // Upgrade insecure requests in production
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self), interest-cohort=()" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
};

export default nextConfig;
