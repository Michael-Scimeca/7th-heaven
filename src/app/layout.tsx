import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Inter_Tight, Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Providers from "@/components/Providers";
import { SanityLive } from "@/sanity/live";
import { VisualEditing } from "next-sanity/visual-editing";

import { draftMode } from "next/headers";
import { PageNav } from "@/components/PageNav";
import ClientOnlyExtras from "@/components/ClientOnlyExtras";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollToTop from "@/components/ScrollToTop";
import { GrainOverlay } from "@/components/GrainOverlay";
import Preloader from "@/components/Preloader";
import PageTransition from "@/components/PageTransition";
import CursorFollower from "@/components/CursorFollower";
import { TransitionProvider } from "@/context/TransitionContext";

import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const rockstar = localFont({
  src: "../../public/Fonts/Rockstar-ExtraBold.otf",
  variable: "--font-rockstar",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

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
    icon: "/favicon.ico",
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isDraftMode } = await draftMode();
  // MusicGroup Structured Data for Google
  const bandLd = {
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

  return (
    <html lang="en" className={`${inter.variable} ${rockstar.variable} ${barlowCondensed.variable} ${barlow.variable}`} suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("7h_theme");if(t){document.documentElement.setAttribute("data-theme",t)}else{document.documentElement.setAttribute("data-theme","light")}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${interTight.variable} ${rockstar.variable} ${barlowCondensed.variable} ${barlow.variable} preloading`} style={{ fontFamily: "var(--font-barlow)", letterSpacing: "0" }} suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <Script
          id="band-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bandLd) }}
        />
        {/* Preloader check script */}
        <Script
          id="preloader-check"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem("7h_preloader_shown")==="true"){document.body.classList.remove("preloading")}}catch(e){}` }}
        />

        <Script id="bypass-animations" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          if (window.location.search.includes('bypass=true')) {
            var style = document.createElement('style');
            style.innerHTML = '* { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; animation: none !important; transition: none !important; } #curtain-primary, #curtain-accent { display: none !important; } #page-content-wrapper { opacity: 1 !important; transform: none !important; }';
            document.head.appendChild(style);
          }
        ` }} />
        <GrainOverlay />
        <Preloader />
        <CursorFollower />
        <TransitionProvider>
          <Providers>
            <ScrollToTop />
            <SmoothScroll>
              <div id="page-content-wrapper" className="flex flex-col min-h-screen">
                <Header />
                {/* content-area class + CSS guarantees min-height: 100svh so footer
                    can NEVER appear before page content loads */}
                <div className="content-area flex-1 flex flex-col">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </div>
                <Footer />
                <SanityLive />
                {isDraftMode && <VisualEditing />}
                <PageNav />
                <ClientOnlyExtras />
              </div>
            </SmoothScroll>
          </Providers>
        </TransitionProvider>
      </body>
    </html>
  );
}

