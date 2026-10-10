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

  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Official website of 7th Heaven, Chicago's premier rock band with #1 Billboard chart hits, 30 Songs in 30 Minutes medley, and 40 years of live concert tours.";

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
          url: "https://7thheavenband.com/images/logos/7thheavenlogo.jpg",
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
      images: ["https://7thheavenband.com/images/logos/7thheavenlogo.jpg"],
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

{/* ====== FEATURED VIDEO SHOWCASE (Temporarily disabled) ====== */}
      {/* <HomeVideoShowcase sanityContent={sanityContent} /> */}

      {/* ====== SLIDEUP STACK SECTION (Temporarily disabled) ====== */}
      {/* <SlideupSection sanityContent={sanityContent} /> */}

      {/* ====== SHARED THE STAGE WITH / AS SEEN ON ====== */}
      <HomeLogosSection sanityContent={sanityContent} />

      {/* ====== LATEST BAND NEWS ====== */}
      <HomeNewsSection sanityContent={sanityContent} />
    </main>
  );
}
