import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,

  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt", "*.lhr.life", "*.tunnelmole.net", "10.0.0.189", "localhost:3000"],
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  turbopack: {},
  serverExternalPackages: ["@tensorflow/tfjs"],
  webpack: (config, { isServer }) => {
    config.externals = [...(config.externals || []), "@tensorflow/tfjs"];
    return config;
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@tensorflow/tfjs/**',
      'node_modules/@tensorflow/**',
      'node_modules/leaflet/**',
      'node_modules/react-leaflet/**',
      'node_modules/swiper/**',
      'node_modules/lottie-web/**',
      'public/movie/**',
      'public/demos/**',
      'public/images/**',
      'public/sitemap-screenshots/**',
      'public/uploads/**',
      'public/audio/**',
      'public/assets/**',
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "7thheavenband.com", pathname: "/**" },
      { protocol: "http", hostname: "www.7thheavenband.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
    ],
  },

  // ── Security Headers ──
  async headers() {
    const cspRules = [
      "default-src 'self'",
      // Scripts — self + inline (needed for Next.js) + trusted CDNs + YouTube API
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://www.googletagmanager.com https://cdn.sanity.io https://www.youtube.com https://s.ytimg.com",
      // Styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images — allow data URIs for generated OG images
      "img-src 'self' data: blob: https://api.qrserver.com https://cdn.sanity.io https://lh3.googleusercontent.com https://7thheavenband.com https://www.7thheavenband.com https://cdn.shopify.com https://img.youtube.com https://i.ytimg.com https://*.basemaps.cartocdn.com https://upload.wikimedia.org",
      // Connect — Supabase, LiveKit, Sanity, Upstash, YouTube
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.livekit.cloud wss://*.livekit.cloud https://*.sanity.io https://*.upstash.io https://hcaptcha.com https://www.googletagmanager.com https://*.myshopify.com https://www.youtube.com https://*.googlevideo.com",
      // Media — LiveKit streams & Google Video
      "media-src 'self' blob: https://*.livekit.cloud https://*.googlevideo.com https://www.youtube.com",
      // Frames — hCaptcha & YouTube embeds
      "frame-src 'self' https://hcaptcha.com https://newassets.hcaptcha.com https://www.youtube.com https://www.youtube-nocookie.com",
      // Workers (Next.js needs blob)
      "worker-src 'self' blob:",
      // Block all object embeds
      "object-src 'none'",
    ];

    if (process.env.NODE_ENV === "production") {
      cspRules.push("upgrade-insecure-requests");
    }

    const csp = cspRules.join("; ");

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
  // ── Redirects ──
  async redirects() {
    return [
      {
        source: "/tour",
        destination: "/#tour",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true" || process.env.NEXT_PUBLIC_ANALYZE === "true",
})(nextConfig);
