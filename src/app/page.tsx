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

      {/* ====== BAND BIO PARALLAX SLIDER ====== */}
      <LazySection fallbackHeight="600px">
        <section id="band" className="relative w-full bg-transparent overflow-x-clip py-0 mt-8 sm:mt-12 mb-12">
          <BioParallaxSlider />
        </section>
      </LazySection>

      {/* Announcement banner + Tour list + ProximityNotify — loaded client-side after paint */}
      <HomeDataLoader />

      {/* ====== FEATURED VIDEO SHOWCASE ====== */}
      <LazySection fallbackHeight="400px">
        <HomeVideoShowcase />
      </LazySection>

      {/* ====== SLIDEUP STACK SECTION ====== */}
      <LazySection fallbackHeight="400px">
        <SlideupSection />
      </LazySection>

      {/* ====== SHARED THE STAGE WITH / AS SEEN ON ====== */}
      <LazySection fallbackHeight="180px">
        <section id="logos" className="relative w-full py-4">
          <LogoTicker items={ARTIST_LOGOS} direction="left" />
          <LogoTicker items={PRESS_LOGOS} direction="right" />
        </section>
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
      <LazySection fallbackHeight="500px">
        <section id="music" className="relative w-full min-h-[600px] mt-0 overflow-visible">
          <AudioPlayerSection />
        </section>
      </LazySection>
    </div>
  );
}
