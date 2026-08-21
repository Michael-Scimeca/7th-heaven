import type { NextConfig } from "next";
import path from "path";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt", "*.lhr.life", "*.tunnelmole.net", "10.0.0.189", "localhost:3000"],
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "framer-motion",
      "date-fns",
      "three",
      "@react-three/drei",
      "lenis",
      "smooothy",
    ],
  },
  turbopack: {},
  serverExternalPackages: ["@tensorflow/tfjs"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "next/dist/client/polyfills": path.resolve(__dirname, "src/lib/empty-polyfill.js"),
        "next/dist/compiled/babel/polyfill": path.resolve(__dirname, "src/lib/empty-polyfill.js"),
      };
    }
    config.externals = [...(config.externals || []), "@tensorflow/tfjs"];
    return config;
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@tensorflow/**',
      'node_modules/nsfwjs/**',
      'node_modules/sanity/**',
      'node_modules/@sanity/**',
      'node_modules/puppeteer/**',
      'node_modules/puppeteer-core/**',
      'node_modules/@puppeteer/**',
      'node_modules/three/**',
      'node_modules/@react-three/**',
      'node_modules/three-stdlib/**',
      'node_modules/stats-gl/**',
      'node_modules/vitest/**',
      'node_modules/@vitest/**',
      'node_modules/leaflet/**',
      'node_modules/react-leaflet/**',
      'node_modules/swiper/**',
      'node_modules/lottie-web/**',
      'node_modules/hls.js/**',
      'node_modules/@sentry/**',
      'node_modules/@sentry-internal/**',
      'node_modules/@opentelemetry/**',
      'node_modules/@electric-sql/**',
      'node_modules/@mediapipe/**',
      'node_modules/lucide-react/**',
    ],
    '/*': [
      'node_modules/@tensorflow/**',
      'node_modules/nsfwjs/**',
      'node_modules/sanity/**',
      'node_modules/@sanity/**',
      'node_modules/puppeteer/**',
      'node_modules/puppeteer-core/**',
      'node_modules/@puppeteer/**',
      'node_modules/three/**',
      'node_modules/@react-three/**',
      'node_modules/three-stdlib/**',
      'node_modules/stats-gl/**',
      'node_modules/vitest/**',
      'node_modules/@vitest/**',
      'node_modules/leaflet/**',
      'node_modules/react-leaflet/**',
      'node_modules/swiper/**',
      'node_modules/lottie-web/**',
      'node_modules/hls.js/**',
      'node_modules/@sentry/**',
      'node_modules/@sentry-internal/**',
      'node_modules/@opentelemetry/**',
      'node_modules/@electric-sql/**',
      'node_modules/@mediapipe/**',
      'node_modules/lucide-react/**',
    ],
    '/**/*': [
      'node_modules/@tensorflow/**',
      'node_modules/nsfwjs/**',
      'node_modules/sanity/**',
      'node_modules/@sanity/**',
      'node_modules/puppeteer/**',
      'node_modules/puppeteer-core/**',
      'node_modules/@puppeteer/**',
      'node_modules/three/**',
      'node_modules/@react-three/**',
      'node_modules/three-stdlib/**',
      'node_modules/stats-gl/**',
      'node_modules/vitest/**',
      'node_modules/@vitest/**',
      'node_modules/leaflet/**',
      'node_modules/react-leaflet/**',
      'node_modules/swiper/**',
      'node_modules/lottie-web/**',
      'node_modules/hls.js/**',
      'node_modules/@sentry/**',
      'node_modules/@sentry-internal/**',
      'node_modules/@opentelemetry/**',
      'node_modules/@electric-sql/**',
      'node_modules/@mediapipe/**',
      'node_modules/lucide-react/**',
    ],
    '/api/**/*': [
      'node_modules/@tensorflow/**',
      'node_modules/nsfwjs/**',
      'node_modules/sanity/**',
      'node_modules/@sanity/**',
      'node_modules/puppeteer/**',
      'node_modules/puppeteer-core/**',
      'node_modules/@puppeteer/**',
      'node_modules/three/**',
      'node_modules/@react-three/**',
      'node_modules/three-stdlib/**',
      'node_modules/stats-gl/**',
      'node_modules/vitest/**',
      'node_modules/@vitest/**',
      'node_modules/leaflet/**',
      'node_modules/react-leaflet/**',
      'node_modules/swiper/**',
      'node_modules/lottie-web/**',
      'node_modules/hls.js/**',
      'node_modules/@sentry/**',
      'node_modules/@sentry-internal/**',
      'node_modules/@opentelemetry/**',
      'node_modules/@electric-sql/**',
      'node_modules/@mediapipe/**',
      'node_modules/lucide-react/**',
    ],
  },
  images: {
    minimumCacheTTL: 31536000,
    formats: ["image/avif", "image/webp"],
    imageSizes: [16, 32, 48, 64, 96, 128, 220, 256, 384, 480],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
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
      // Scripts — self + inline (needed for Next.js) + trusted CDNs + YouTube API + Google Maps
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://www.googletagmanager.com https://cdn.sanity.io https://www.youtube.com https://s.ytimg.com https://maps.googleapis.com",
      // Styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images — allow data URIs for generated OG images + Google Maps tiles/icons
      "img-src 'self' data: blob: https://api.qrserver.com https://cdn.sanity.io https://lh3.googleusercontent.com https://7thheavenband.com https://www.7thheavenband.com https://cdn.shopify.com https://img.youtube.com https://i.ytimg.com https://*.basemaps.cartocdn.com https://upload.wikimedia.org https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.googleusercontent.com",
      // Connect — Supabase, LiveKit, Sanity, Upstash, YouTube, Google Maps
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.livekit.cloud wss://*.livekit.cloud https://*.sanity.io https://*.upstash.io https://hcaptcha.com https://www.googletagmanager.com https://*.myshopify.com https://www.youtube.com https://*.googlevideo.com https://*.googleapis.com https://*.google.com https://*.gstatic.com https://www.google-analytics.com",
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
      // ── Caching / Expires headers for /public ──
      // Next.js only sets far-future Cache-Control on /_next/static automatically;
      // adding explicit Expires headers ensures compliance with YSlow/GTmetrix audits.
      {
        source: "/api/audio",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Expires", value: "Thu, 31 Dec 2037 23:59:59 GMT" },
        ],
      },
      {
        source: "/(Fonts|audio|movie|lottie|objects)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Expires", value: "Thu, 31 Dec 2037 23:59:59 GMT" },
        ],
      },
      {
        source: "/(images|assets|sitemap-screenshots)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Expires", value: "Thu, 31 Dec 2037 23:59:59 GMT" },
        ],
      },
      {
        source: "/(uploads|data)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/:path*.(ico|svg|jpg|jpeg|png|gif|webp|avif|woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Expires", value: "Thu, 31 Dec 2037 23:59:59 GMT" },
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
