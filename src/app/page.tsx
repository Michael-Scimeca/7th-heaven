import type { Metadata } from "next";
import ReactDOM from "react-dom";
import nextDynamic from "next/dynamic";
import { fetchPageContent } from "@/lib/sanity";
import HeroVideoPlayer from "@/components/HeroVideoPlayer";

const HomeVideoShowcase = nextDynamic(
  () => import("@/components/HomeVideoShowcase"),
);
const SlideupSection = nextDynamic(() => import("@/components/SlideupSection"));
const HomeNewsSection = nextDynamic(
  () => import("@/components/HomeNewsSection"),
);
const HomeDataLoader = nextDynamic(() => import("@/components/HomeDataLoader"));

const HomeLogosSection = nextDynamic(
  () => import("@/components/HomeLogosSection"),
);

import SectionHeader from "@/components/SectionHeader";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("home");
  const metaTitle =
    content?.seo?.metaTitle ||
    (content?.title && !content.title.toLowerCase().includes("home")
      ? `${content.title} — 7th Heaven`
      : "7th Heaven — Chicago's #1 Rock Band | Official Site");

  return {
    title: metaTitle,
    description:
      content?.seo?.metaDescription ||
      content?.heroSubheading ||
      "7th Heaven is a chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of unforgettable live performances.",
  };
}

export default async function Home() {
  const sanityContent = await fetchPageContent("home");

  // Preload LCP hero posters immediately in SSR HTML for zero request discovery delay
  ReactDOM.preload("/images/hero/hero-mobile-poster.webp", {
    as: "image",
    type: "image/webp",
    fetchPriority: "high",
    media: "(max-width: 1023px)",
  });
  ReactDOM.preload("/images/hero/hero-desktop-poster.webp", {
    as: "image",
    type: "image/webp",
    fetchPriority: "high",
    media: "(min-width: 1024px)",
  });

  return (
    <main id="home-page" className="page-container page-container--hero page-stack !pt-0">
      {/* ====== HERO (Viewport Height) ====== */}
      <section
        id="hero"
        aria-labelledby="hero-heading"
        className="section relative"
        data-pick-label="Play Music"
      >
        <div className="relative h-[100vh] h-[100svh] w-full">
          <div
            id="hero-card"
            className="relative flex h-full w-full flex-col justify-between pb-15"
            data-pick-label="Play Music"
          >
            <HeroVideoPlayer sanityContent={sanityContent} />
          </div>
        </div>
      </section>

      {/* Announcement banner + Tour list + Band Bio — loaded client-side after paint. */}
      <HomeDataLoader />

      {/* ====== FEATURED VIDEO SHOWCASE ====== */}
      <HomeVideoShowcase sanityContent={sanityContent} />

      {/* ====== SLIDEUP STACK SECTION ====== */}
      <SlideupSection sanityContent={sanityContent} />

      {/* ====== SHARED THE STAGE WITH / AS SEEN ON ====== */}
      <HomeLogosSection sanityContent={sanityContent} />

      {/* ====== LATEST BAND NEWS ====== */}
      <HomeNewsSection sanityContent={sanityContent} />
    </main>
  );
}
