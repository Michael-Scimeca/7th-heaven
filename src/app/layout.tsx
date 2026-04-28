import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Providers from "@/components/Providers";
import { SanityLive } from "@/sanity/live";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";
import { PageNav } from "@/components/PageNav";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
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
    <html lang="en" className={`${inter.variable} ${barlowCondensed.variable}`} suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bandLd) }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-inter)", letterSpacing: "-.02em" }} suppressHydrationWarning>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <SanityLive />
          {isDraftMode && <VisualEditing />}
          
          <PageNav />
          
          {/* Global Edit Button */}
          <a
            href="/studio"
            className="fixed bottom-4 right-4 z-[999] flex items-center gap-2 px-4 py-2 bg-black/80 hover:bg-black backdrop-blur-md border border-white/20 hover:border-[var(--color-accent)] rounded-full text-white/50 hover:text-white text-[0.6rem] font-bold uppercase tracking-[0.2em] transition-all shadow-[0_5px_20px_rgba(0,0,0,0.5)] group opacity-30 hover:opacity-100"
            title="Edit Website Content (Sanity Studio)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[var(--color-accent)] transition-colors"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Edit Site
          </a>
        </Providers>
      </body>
    </html>
  );
}

