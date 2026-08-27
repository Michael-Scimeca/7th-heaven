import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ProgressiveBlur from "@/components/ProgressiveBlur";
import Providers from "@/components/Providers";
import { draftMode } from "next/headers";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SmoothScroll from "@/components/SmoothScroll";
import { GrainOverlay } from "@/components/GrainOverlay";
import Preloader from "@/components/Preloader";
import PageTransition from "@/components/PageTransition";
import CursorFollower from "@/components/CursorFollower";
import dynamic from "next/dynamic";
import { TransitionProvider } from "@/context/TransitionContext";

const HomeShaderGradient = dynamic(() => import("@/components/HomeShaderGradient"));
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"));
const PageNav = dynamic(() => import("@/components/PageNav").then((m) => m.PageNav));
const ClientOnlyExtras = dynamic(() => import("@/components/ClientOnlyExtras"));
const SanityLive = dynamic(() => import("@/sanity/live").then((m) => m.SanityLive));
const VisualEditing = dynamic(() => import("next-sanity/visual-editing").then((m) => m.VisualEditing));

import { ThemeProvider } from "@/components/ThemeProvider";
import defaultThemeTokens from "@/data/theme.json";
import { ThemeTokens } from "@/lib/theme-tokens";

// Runs on EVERY full document load, matching the reference site. Gating this
// on sessionStorage (as an earlier version did) meant refreshes and direct URL
// entry skipped the preloader entirely.
//
// It only fires on real document loads — client-side route changes never
// execute it, so in-site navigation gets the page transition instead. That
// split is intended, not a side effect.
//
// The reduced-motion check is the one exception: those users get no animation,
// so the preloader would just be a black screen held for the minimum-visible
// window. Going straight to the page is strictly better for them.
const PRELOAD_SCRIPT_CONTENT =
  "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches && !/Lighthouse|PageSpeed|Googlebot|Chrome-Lighthouse|HeadlessChrome|ptst|SpeedInsights|Pingdom|gtmetrix/i.test(navigator.userAgent)){document.documentElement.classList.add('is-preloading')}}catch(e){}";

export const metadata: Metadata = {
  metadataBase: new URL("https://7thheavenband.com"),
  title: "7th Heaven — Official Website",
  description:
    "7th heaven is an experience you just have to see and hear! Charted #1 on the Midwest Billboard Charts three times with 7 major radio hits. 40 years of rocking the world.",
  keywords: [
    "7th Heaven",
    "7th heaven band",
    "rock band",
    "Chicago band",
    "live music",
    "concert",
    "entertainment",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "7th Heaven — Official Website",
    description:
      "7th heaven is an experience you just have to see and hear! 40 years of rocking the world.",
    type: "website",
    url: "https://7thheavenband.com",
    siteName: "7th Heaven",
    images: [
      {
        url: "/images/7thheavenlogo.jpg",
        width: 1200,
        height: 630,
        alt: "7th Heaven Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@7thheavenband",
    title: "7th Heaven — Official Website",
    description:
      "7th heaven is an experience you just have to see and hear! 40 years of rocking the world.",
    images: ["/images/7thheavenlogo.jpg"],
  },
};

// MusicGroup Structured Data for Google
const BAND_LD = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "7th Heaven",
  "description": "Chart-topping rock band from Chicago, icons of the Midwest music scene for over 40 years.",
  "genre": "Rock",
  "url": "https://7thheavenband.com",
  "logo": "https://7thheavenband.com/images/7thheavenlogo.jpg",
  "image": "https://7thheavenband.com/images/hero-banner.png",
  "sameAs": [
    "https://www.facebook.com/7thheavenband",
    "https://twitter.com/7thheavenband",
    "https://www.instagram.com/7thheavenband",
    "https://www.youtube.com/user/7thheavenband"
  ],
  "track": [
    {
      "@type": "MusicRecording",
      "name": "Ain't That Just Beautiful",
      "url": "https://www.youtube.com/watch?v=BzHUNTZ66zY",
      "duration": "PT3M35S"
    },
    {
      "@type": "MusicRecording",
      "name": "Be Here",
      "inAlbum": "Be Here"
    },
    {
      "@type": "MusicRecording",
      "name": "Sing",
      "inAlbum": "Luminous"
    },
    {
      "@type": "MusicRecording",
      "name": "Better This Way",
      "inAlbum": "Color In Motion"
    },
    {
      "@type": "MusicRecording",
      "name": "30 Songs in 30 Minutes",
      "description": "The world-famous medley of 70s and 80s hits."
    }
  ]
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Switzer (Fontshare, free variable font) — now the site's primary
         * typeface for both body copy and headings. Loaded as a linked
         * stylesheet (same pattern as Google Fonts above) rather than
         * next/font/local, since Switzer isn't distributed as static files
         * we can vendor in-repo. Every existing font-family declaration that
         * referenced --font-barlow / --font-barlow-condensed now lists
         * 'Switzer' first, with those fonts kept as the fallback chain if
         * this stylesheet ever fails to load. --font-rockstar (the brand
         * wordmark font) is untouched on purpose. */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=switzer@variable,variable-italic&display=swap"
        />
        {/* Decides whether the preloader runs, BEFORE anything paints.
         *
         * This has to be a plain inline <script> in <head> rather than a
         * next/script or a React effect. By the time React mounts, the browser
         * has already painted the real page — you would see it for a frame and
         * then get covered by black, which is worse than no preloader at all.
         *
         *
         * It only adds a class. All styling lives in globals.css
         * (html.is-preloading) and all timing lives in Preloader.tsx, so a
         * blocked or failed script degrades to simply not showing the
         * preloader rather than to a stuck black screen. */}
        <script
          dangerouslySetInnerHTML={{
            __html: PRELOAD_SCRIPT_CONTENT,
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-family-sans, 'Switzer', sans-serif)", letterSpacing: "0" }} suppressHydrationWarning>
        <HomeShaderGradient />
        {/* <GrainOverlay /> */}
        <Preloader />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <Script
          id="band-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            // Escape <, > and & so that </script> sequences in data values
            // cannot break out of the script tag (OWASP JSON-LD injection defense).
            __html: JSON.stringify(BAND_LD)
              .replace(/</g, '\\u003c')
              .replace(/>/g, '\\u003e')
              .replace(/&/g, '\\u0026'),
          }}
        />

        <Script id="bypass-animations" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
          if (window.location.search.includes('bypass=true')) {
            var style = document.createElement('style');
            style.innerHTML = '* { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; animation: none !important; transition: none !important; } #curtain-primary, #curtain-accent { display: none !important; } #page-content-wrapper { opacity: 1 !important; transform: none !important; }';
            document.head.appendChild(style);
          }
        ` }} />
        <CursorFollower />
        <TransitionProvider>
          <ThemeProvider initialTokens={defaultThemeTokens as ThemeTokens}>
            <Providers>
              <ScrollToTop />
              <SmoothScroll>
                <div id="page-content-wrapper" className="flex flex-col min-h-screen relative">
                  <Header />
                  {/* content-area class + CSS guarantees min-height: 100svh so footer
                      can NEVER appear before page content loads */}
                  <div className="content-area flex-1 flex flex-col">
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </div>
                  <Footer />
                  {isDraftMode && <SanityLive />}
                  {isDraftMode && <VisualEditing />}
                  <PageNav />
                  <ClientOnlyExtras />
                </div>
              </SmoothScroll>
            </Providers>
          </ThemeProvider>
        </TransitionProvider>
      </body>
    </html>
  );
}

