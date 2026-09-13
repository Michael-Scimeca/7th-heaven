import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { fetchPageContent } from "@/lib/sanity";
import { ARTIST_LOGOS, PRESS_LOGOS } from "@/components/LogoTicker";
const LogoTicker = nextDynamic(() => import("@/components/LogoTicker"));

const HeroVideoPlayer = nextDynamic(() => import("@/components/HeroVideoPlayer"));
const BioParallaxSlider = nextDynamic(() => import("@/components/BioParallaxSlider"));
const HomeVideoShowcase = nextDynamic(() => import("@/components/HomeVideoShowcase"));
const SlideupSection = nextDynamic(() => import("@/components/SlideupSection"));
const HomeMerch = nextDynamic(() => import("@/components/HomeMerch"));
const HomeNewsSection = nextDynamic(() => import("@/components/HomeNewsSection"));
const HomeDataLoader = nextDynamic(() => import("@/components/HomeDataLoader"));

const HomeLogosSection = nextDynamic(() => import("@/components/HomeLogosSection"));

import LazySection from "@/components/LazySection";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("home");
  return {
    title: content?.seo?.metaTitle || content?.title || "7th Heaven — Official Band Website",
    description:
      content?.seo?.metaDescription ||
      content?.heroSubheading ||
      "7th Heaven is a chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of unforgettable live performances.",
  };
}

export default async function Home() {
  const sanityContent = await fetchPageContent("home");

  return (
    <div id="home-page">
      {/* ====== HERO (Full 100vh Viewport Height) ====== */}
      <section
 className="relative w-full h-[100dvh] max-h-[100dvh] p-0 m-0 overflow-hidden morph-pick"
 data-pick-label="Play Music"
 id="hero"
 style={{
 marginLeft: "calc(-1 * var(--page-padding-x))",
 marginRight: "calc(-1 * var(--page-padding-x))",
 width: "calc(100% + 2 * var(--page-padding-x))",
 }}>
        <h1 className="sr-only">7th Heaven — Official Band Website</h1>
        <div id="hero-card" className="relative w-full h-full max-h-[100dvh] overflow-hidden flex flex-col justify-between p-0 m-0 morph-pick" data-pick-label="Play Music">
          <HeroVideoPlayer sanityContent={sanityContent} />
        </div>
      </section>

      {/* Announcement banner + Tour list + Band Bio + ProximityNotify — loaded client-side after paint */}
      <HomeDataLoader />

      {/* ====== FEATURED VIDEO SHOWCASE ====== */}
      <LazySection fallbackHeight="500px">
        <HomeVideoShowcase sanityContent={sanityContent} />
      </LazySection>

      {/* ====== SLIDEUP STACK SECTION ====== */}
      <LazySection fallbackHeight="600px">
        <SlideupSection sanityContent={sanityContent} />
      </LazySection>

      {/* ====== SHARED THE STAGE WITH / AS SEEN ON ====== */}
      <LazySection fallbackHeight="180px">
        <HomeLogosSection sanityContent={sanityContent} />
      </LazySection>

      {/* ====== LATEST BAND NEWS ====== */}
      <LazySection fallbackHeight="400px">
        <HomeNewsSection sanityContent={sanityContent} />
      </LazySection>

      {/* ====== MERCH QUICK SHOP (Shopify) ====== */}
      <LazySection fallbackHeight="400px">
        <HomeMerch sanityContent={sanityContent} />
      </LazySection>
    </div>
  );
}

