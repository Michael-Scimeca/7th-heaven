import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const tanker = localFont({
  src: "../../public/fonts/Tanker-Regular.woff2",
  variable: "--font-tanker",
  display: "swap",
  preload: true,
});

const switzer = localFont({
  src: [
    {
      path: "../../public/fonts/Switzer-Variable.woff2",
      style: "normal",
    },
    {
      path: "../../public/fonts/Switzer-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05030a" },
    { media: "(prefers-color-scheme: light)", color: "#05030a" },
  ],
};

import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ProgressiveBlur from "@/components/ProgressiveBlur";
import Providers from "@/components/Providers";
import DraftModeExtras from "@/components/DraftModeExtras";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import PageTransition from "@/components/PageTransition";
import dynamic from "next/dynamic";
import { TransitionProvider } from "@/context/TransitionContext";
import { WebGLTransitionProvider } from "@/components/WebGLNoiseTransition";

import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"));
const PageNav = dynamic(() =>
  import("@/components/PageNav").then((m) => m.PageNav),
);
const ClientOnlyExtras = dynamic(() => import("@/components/ClientOnlyExtras"));
import HomeShaderGradient from "@/components/HomeShaderGradient";

import { ThemeProvider } from "@/components/ThemeProvider";
import defaultThemeTokens from "@/data/theme.json";
import { ThemeTokens } from "@/lib/theme-tokens";
import {
  fetchSanity,
  queries,
  getMediaUrl,
  SanitySiteSettings,
} from "@/lib/sanity";

// Runs on EVERY full document load, matching the reference site.
// The reduced-motion check is the one exception: those users get no animation,
// so the preloader would just be a black screen held for the minimum-visible
// window. Going straight to the page is strictly better for them.
const PRELOAD_SCRIPT_CONTENT =
  "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches && !location.search.includes('bypass=true')){document.documentElement.classList.add('is-preloading')}}catch(e){}";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSanity<SanitySiteSettings>(queries.siteSettings);

  const title =
    settings?.seo?.metaTitle ||
    (settings?.tagline
      ? `7th Heaven — ${settings.tagline}`
      : "7th Heaven — Official Website");

  const description =
    settings?.seo?.metaDescription ||
    settings?.bioIntro ||
    "7th heaven is an experience you just have to see and hear! Charted #1 on the Midwest Billboard Charts three times with 7 major radio hits. 40 years of rocking the world.";

  const ogImageUrl = settings?.seo?.ogImage
    ? getMediaUrl(settings.seo.ogImage, "/images/logos/7thheavenlogo.jpg")
    : "/images/logos/7thheavenlogo.jpg";

  const rawSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://7thheavenband.com";
  let metadataBase: URL;
  try {
    const isProd =
      process.env.NODE_ENV === "production" ||
      process.env.CONTEXT === "production" ||
      Boolean(process.env.NETLIFY);
    if (
      isProd &&
      (rawSiteUrl.includes("localhost") || rawSiteUrl.includes("127.0.0.1"))
    ) {
      metadataBase = new URL(process.env.URL || "https://7thheavenband.com");
    } else {
      metadataBase = new URL(rawSiteUrl);
    }
  } catch {
    metadataBase = new URL("https://7thheavenband.com");
  }

  return {
    metadataBase,
    // Stop iOS Safari from auto-linking and underlining phone numbers
    formatDetection: { telephone: false },
    alternates: {
      canonical: "./",
    },
    appleWebApp: {
      capable: true,
      title: "7th Heaven",
      statusBarStyle: "black-translucent",
    },
    title,
    description,
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
        { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://7thheavenband.com",
      siteName: "7th Heaven",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "7th Heaven Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@7thheavenband",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

// MusicGroup Structured Data for Google Rich Results
const BAND_LD = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "7th Heaven",
  alternateName: ["7th Heaven Band", "7thHeaven"],
  description:
    "Chart-topping rock band from Chicago, icons of the Midwest music scene for over 40 years with 3 #1 Billboard hits and 7 major radio singles.",
  genre: ["Rock", "Pop Rock", "Hard Rock"],
  foundingDate: "1985",
  foundingLocation: {
    "@type": "Place",
    name: "Chicago, Illinois, USA",
  },
  url: "https://7thheavenband.com",
  logo: "https://7thheavenband.com/images/logos/7thheavenlogo.jpg",
  image: "https://7thheavenband.com/images/hero/hero-banner.png",
  sameAs: [
    "https://www.facebook.com/7thheavenband",
    "https://twitter.com/7thheavenband",
    "https://www.instagram.com/7thheavenband",
    "https://www.youtube.com/user/7thheavenband",
  ],
  track: [
    {
      "@type": "MusicRecording",
      name: "Ain't That Just Beautiful",
      url: "https://www.youtube.com/watch?v=BzHUNTZ66zY",
      duration: "PT3M35S",
    },
    {
      "@type": "MusicRecording",
      name: "Be Here",
      inAlbum: "Be Here",
    },
    {
      "@type": "MusicRecording",
      name: "Sing",
      inAlbum: "Luminous",
    },
    {
      "@type": "MusicRecording",
      name: "Better This Way",
      inAlbum: "Color In Motion",
    },
    {
      "@type": "MusicRecording",
      name: "30 Songs in 30 Minutes",
      description: "The world-famous medley of 70s and 80s hits.",
    },
  ],
};

// WebSite Structured Data for Google Sitelinks Search
const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "7th Heaven",
  url: "https://7thheavenband.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://7thheavenband.com/faq?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${tanker.variable} ${inter.variable} ${switzer.variable} ${anton.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preconnect"
          href="https://cdn.sanity.io"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        {/* Decides whether the preloader runs, BEFORE anything paints.
         *
         * This has to be a plain inline <script> in <head> rather than a
         * next/script or a React effect. By the time React mounts, the browser
         * has already painted the real page — you would see it for a frame and
         * then get covered by black, which is worse than no preloader at all.
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
        <script
          id="band-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Escape <,> and & so that </script> sequences in data values
            // cannot break out of the script tag (OWASP JSON-LD injection defense).
            __html: JSON.stringify(BAND_LD)
              .replace(/</g, "\\u003c")
              .replace(/>/g, "\\u003e")
              .replace(/&/g, "\\u0026"),
          }}
        />
        <script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(WEBSITE_LD)
              .replace(/</g, "\\u003c")
              .replace(/>/g, "\\u003e")
              .replace(/&/g, "\\u0026"),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Preloader />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID} />
        )}

        {process.env.NODE_ENV !== "production" && (
          <Script
            id="bypass-animations"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
 if (window.location.search.includes('bypass=true')) {
 var style = document.createElement('style');
 style.innerHTML = '* { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; animation: none !important; transition: none !important; } #curtain-primary, #curtain-accent, .preloader-overlay { display: none !important; } #page-content-wrapper { opacity: 1 !important; transform: none !important; }';
 document.head.appendChild(style);
 }
 `,
            }}
          />
        )}
        <WebGLTransitionProvider>
          <TransitionProvider>
            <ThemeProvider initialTokens={defaultThemeTokens as ThemeTokens}>
              <Providers>
                <ScrollToTop />
                <div
                  id="global-ambient-gradient"
                  className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_20%_25%,rgba(133,15,183,0.4)_0%,transparent_55%),radial-gradient(circle_at_75%_65%,rgba(97,30,189,0.35)_0%,transparent_55%),radial-gradient(circle_at_50%_35%,rgba(164,62,23,0.25)_0%,transparent_50%)]"
                />
                <SmoothScroll>
                  <HomeShaderGradient />
                  <ProgressiveBlur position="top" />
                  <div
                    id="page-content-wrapper"
                    className="relative flex min-h-screen flex-col"
                  >
                    <Header />
                    <PageTransition>{children}</PageTransition>
                    <Footer />
                    <Suspense fallback={null}>
                      <DraftModeExtras />
                    </Suspense>
                    <PageNav />
                    <ClientOnlyExtras />
                    <ServiceWorkerRegister />
                  </div>
                </SmoothScroll>
              </Providers>
            </ThemeProvider>
          </TransitionProvider>
        </WebGLTransitionProvider>
      </body>
    </html>
  );
}
