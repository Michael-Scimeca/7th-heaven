import type { Metadata } from "next";
import ReactDOM from "react-dom";
import nextDynamic from "next/dynamic";
import { fetchPageContent } from "@/lib/sanity";
import HeroVideoPlayer from "@/components/HeroVideoPlayer";

// const HomeVideoShowcase = nextDynamic(
//   () => import("@/components/HomeVideoShowcase"),
// );
// const SlideupSection = nextDynamic(() => import("@/components/SlideupSection"));
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
  const title =
    content?.seo?.metaTitle ||
    (content?.title && !content.title.toLowerCase().includes("home")
      ? `${content.title} — 7th Heaven`
      : "7th Heaven Band | Official Chicago Rock Band & Live Concerts");

  const rawDescription =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Official website of 7th Heaven, Chicago's premier rock band with #1 Billboard chart hits, 30 Songs in 30 Minutes medley, and 40 years of live concert tours.";

  const description =
    rawDescription.length > 158
      ? rawDescription.slice(0, 155).replace(/\s+\S*$/, "") + "…"
      : rawDescription;

  return {
    title,
    description,
    alternates: {
      canonical: "https://7thheavenband.com",
    },
    openGraph: {
      title,
      description,
      url: "https://7thheavenband.com",
      siteName: "7th Heaven",
      type: "website",
      images: [
        {
          url: "https://7thheavenband.com/opengraph-image",
          width: 1200,
          height: 630,
          alt: "7th Heaven Band Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@7thheavenband",
      title,
      description,
      images: ["https://7thheavenband.com/opengraph-image"],
    },
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
    <main id="home-page" className="page-container page-container--hero flex flex-col !pt-0">
      {/* ====== HERO (Viewport Height - Sticky Pin) ====== */}
      <section
        id="hero"
        aria-labelledby="hero-heading"
        className="section sticky top-0 z-0 w-full h-[100vh] h-[100svh] overflow-hidden"
        data-pick-label="Play Music"
      >
        <div className="relative h-full w-full">
          <div
            id="hero-card"
            className="relative flex h-full w-full flex-col justify-between"
            data-pick-label="Play Music"
          >
            <HeroVideoPlayer sanityContent={sanityContent} />
          </div>
        </div>
      </section>

      {/* Content Stack: slides up over the sticky hero */}
      <div className="page-stack relative z-10 min-h-screen">
        {/* Announcement banner + Tour list + Band Bio — loaded client-side after paint. */}
        <HomeDataLoader />

        {/* ====== FEATURED VIDEO SHOWCASE (Temporarily disabled) ====== */}
        {/* <HomeVideoShowcase sanityContent={sanityContent} /> */}

        {/* ====== SLIDEUP STACK SECTION (Temporarily disabled) ====== */}
        {/* <SlideupSection sanityContent={sanityContent} /> */}

        {/* ====== SHARED THE STAGE WITH / AS SEEN ON ====== */}
        <HomeLogosSection sanityContent={sanityContent} />

        {/* ====== LATEST BAND NEWS ====== */}
        <HomeNewsSection sanityContent={sanityContent} />
      </div>
    </main>
  );
}
