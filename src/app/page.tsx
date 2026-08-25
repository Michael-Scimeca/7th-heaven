import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { ARTIST_LOGOS, PRESS_LOGOS } from "@/components/LogoTicker";
const LogoTicker = nextDynamic(() => import("@/components/LogoTicker"));

const HeroVideoPlayer = nextDynamic(() => import("@/components/HeroVideoPlayer"));
const HeroLiveThumbs = nextDynamic(() => import("@/components/HeroLiveThumbs"));
const BioParallaxSlider = nextDynamic(() => import("@/components/BioParallaxSlider"));
const HomeVideoShowcase = nextDynamic(() => import("@/components/HomeVideoShowcase"));
const SlideupSection = nextDynamic(() => import("@/components/SlideupSection"));
const HomeMerch = nextDynamic(() => import("@/components/HomeMerch"));
const AudioPlayerSection = nextDynamic(() => import("@/components/AudioPlayer"));
const HomeNewsSection = nextDynamic(() => import("@/components/HomeNewsSection"));
const HomeDataLoader = nextDynamic(() => import("@/components/HomeDataLoader"));

import LazySection from "@/components/LazySection";
import LiveStatusSign from "@/components/LiveStatusSign";

// Fully static page — no server-side data fetching
// All dynamic data (shows, announcements) is loaded client-side by HomeDataLoader
// This guarantees <50ms TTFB from Netlify's Edge CDN on every request
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "7th Heaven — Official Band Website",
  description: "7th Heaven is a chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of unforgettable live performances.",
};

export default function Home() {
  return (
    <div id="home-page">
      <LiveStatusSign />

      {/* ====== HERO (Full 100vh Viewport Height) ====== */}
      <section
        className="relative w-full h-[100dvh] max-h-[100dvh] p-0 m-0 overflow-hidden morph-pick"
        data-pick-label="Play Music"
        id="hero"
        style={{
          marginLeft: "calc(-1 * var(--page-padding-x))",
          marginRight: "calc(-1 * var(--page-padding-x))",
          width: "calc(100% + 2 * var(--page-padding-x))",
        }}
      >
        <h1 className="sr-only">7th Heaven — Official Band Website</h1>
        <div id="hero-card" className="relative w-full h-full max-h-[100dvh] overflow-hidden bg-transparent flex flex-col justify-between p-0 m-0 morph-pick" data-pick-label="Play Music">
          <HeroVideoPlayer>
            <HeroLiveThumbs />
          </HeroVideoPlayer>
        </div>
      </section>

      {/* Announcement banner + Tour list + Band Bio + ProximityNotify — loaded client-side after paint */}
      <HomeDataLoader />

      {/* ====== FEATURED VIDEO SHOWCASE ====== */}
      <LazySection fallbackHeight="500px">
        <HomeVideoShowcase />
      </LazySection>

      {/* ====== SLIDEUP STACK SECTION ====== */}
      <LazySection fallbackHeight="600px">
        <SlideupSection />
      </LazySection>

      {/* ====== SHARED THE STAGE WITH / AS SEEN ON ====== */}
      <LazySection fallbackHeight="180px" id="logos" className="relative w-full py-section-fluid">
        <div className="container mx-auto px-4 mb-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-[#1a1726]/90 border border-white/15 px-4 py-1.5 rounded-xl shadow-lg mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#d946ef] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-white/95">
              WHO WE&apos;VE PLAYED WITH &amp; WHERE WE&apos;VE BEEN FEATURED
            </span>
          </div>
          <p className="text-[13px] font-medium text-white/60 max-w-lg leading-relaxed">
            Shared stages with legendary artists &amp; featured across major national networks, press, and broadcasts.
          </p>
        </div>

        <LogoTicker items={ARTIST_LOGOS} direction="left" />
        <LogoTicker items={PRESS_LOGOS} direction="right" />
      </LazySection>

      {/* ====== LATEST BAND NEWS ====== */}
      <LazySection fallbackHeight="400px">
        <HomeNewsSection />
      </LazySection>

      {/* ====== MERCH QUICK SHOP (Shopify) ====== */}
      <LazySection fallbackHeight="400px">
        <HomeMerch />
      </LazySection>

      {/* ====== MUSIC / AUDIO PLAYER SECTION ====== */}
      <LazySection fallbackHeight="600px" id="music" className="relative w-full min-h-[600px] py-section-fluid overflow-visible">
        <AudioPlayerSection />
      </LazySection>
    </div>
  );
}
