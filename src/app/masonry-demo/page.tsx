import type { Metadata } from "next";
import { PageSection } from "@/components/PageSection";
import { SectionHeader } from "@/components/SectionHeader";
import { Stack } from "@/components/Stack";
import { ParallaxMasonry } from "@/components/ParallaxMasonry";
import type { MasonryItem } from "@/components/ParallaxMasonry";

export const metadata: Metadata = {
  title: "Masonry Gallery Demo | 7th Heaven",
  description:
    "Interactive demonstration of the multi-speed parallax masonry gallery with responsive column distribution, smooth scroll integration, and zero layout shift.",
};

const GALLERY_ITEMS: MasonryItem[] = [
  {
    src: "/images/7hrrk/artbook.jpg",
    alt: "7th Heaven Artbook Cover",
    width: 1051,
    height: 1360,
    caption: "Official Band Artbook (Collector's Edition)",
    href: "/merch",
  },
  {
    src: "/images/hero/band-performance.webp",
    alt: "7th Heaven live band performance",
    width: 1024,
    height: 1024,
    caption: "Live onstage electrifying high-energy rock performance",
    href: "/tour",
  },
  {
    src: "/images/7hrrk/kids1.png",
    alt: "7th Heaven Rock for Kids event",
    width: 1280,
    height: 679,
    caption: "Rock for Kids community benefit showcase",
  },
  {
    src: "/images/7hrrk/book1.jpg",
    alt: "Comic Book Issue 1 Cover",
    width: 1000,
    height: 1500,
    caption: "7th Heaven Universe — Graphic Novel Issue #1",
    href: "/comics",
  },
  {
    src: "/images/cruise/ports/cococay.jpg",
    alt: "Perfect Day at CocoCay beach party",
    width: 922,
    height: 516,
    caption: "Rock the Boat Cruise — Beachfront stage at CocoCay",
    href: "/cruise",
  },
  {
    src: "/images/merch/merch-be-here.png",
    alt: "Be Here Album merchandise bundle",
    width: 1024,
    height: 1024,
    caption: "Limited Edition 'Be Here' vinyl & apparel pack",
    href: "/merch",
  },
  {
    src: "/images/7hrrk/book2.jpg",
    alt: "Comic Book Issue 2 Cover",
    width: 907,
    height: 1360,
    caption: "7th Heaven Universe — Graphic Novel Issue #2",
    href: "/comics",
  },
  {
    src: "/images/cruise/ports/june-2024.jpg",
    alt: "Cruise Port arrival in June 2024",
    width: 922,
    height: 544,
    caption: "Island docking on the Royal Caribbean cruise line",
    href: "/cruise",
  },
  {
    src: "/images/merch/vinyl.png",
    alt: "7th Heaven signature vinyl record",
    width: 1024,
    height: 1024,
    caption: "Classic 180g heavyweight vinyl release",
    href: "/merch",
  },
  {
    src: "/images/7hrrk/book3.jpg",
    alt: "Comic Book Issue 3 Cover",
    width: 907,
    height: 1360,
    caption: "7th Heaven Universe — Graphic Novel Issue #3",
    href: "/comics",
  },
  {
    src: "/images/cruise/cococay-beach-party.png",
    alt: "CocoCay Beach Party live crowd",
    width: 1024,
    height: 1024,
    caption: "Fans gathered in the Caribbean sunshine",
    href: "/cruise",
  },
  {
    src: "/images/fans/fan-photo-featured.jpg",
    alt: "Concert crowd enjoying 7th Heaven show",
    width: 1024,
    height: 682,
    caption: "Front-row fans at the summer festival amphitheater",
  },
  {
    src: "/images/7hrrk/book4.jpg",
    alt: "Comic Book Issue 4 Cover",
    width: 1000,
    height: 1500,
    caption: "7th Heaven Universe — Graphic Novel Issue #4",
    href: "/comics",
  },
  {
    src: "/images/cruise/ports/stmaarten2.jpg",
    alt: "St. Maarten island view",
    width: 434,
    height: 326,
    caption: "St. Maarten tropical port stop",
    href: "/cruise",
  },
  {
    src: "/images/merch/hoodie.png",
    alt: "7th Heaven premium tour hoodie",
    width: 1024,
    height: 1024,
    caption: "Embroidered heavy cotton tour hoodie",
    href: "/merch",
  },
  {
    src: "/images/7hrrk/book5.jpg",
    alt: "Comic Book Issue 5 Cover",
    width: 1000,
    height: 1500,
    caption: "7th Heaven Universe — Graphic Novel Issue #5",
    href: "/comics",
  },
  {
    src: "/images/cruise/ports/stthomas1.jpg",
    alt: "St. Thomas Caribbean harbor",
    width: 431,
    height: 323,
    caption: "St. Thomas panoramic coastal harbor",
    href: "/cruise",
  },
  {
    src: "/images/merch/merch-covered.png",
    alt: "Covered album album release merch",
    width: 1024,
    height: 1024,
    caption: "Covered Album official launch commemorative package",
    href: "/merch",
  },
];

export default function MasonryDemoPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-32">
      <header className="site-container mb-12">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2 block">
            Component Showcase
          </span>
          <h1 className="text-primary mb-4">
            Parallax Masonry Gallery
          </h1>
          <p className="text-secondary text-base leading-relaxed">
            Multi-speed column drift with subtle inner image parallax, responsive greedy
            shortest-column distribution (1 col &lt; 640px, 2 cols from 640px, 3 cols from 1024px, 4 cols from 1440px),
            and zero layout shift.
          </p>
        </div>
      </header>

      <PageSection
        id="gallery-section"
        size="lg"
        aria-labelledby="gallery-section-heading"
      >
        <Stack gap="xl">
          <SectionHeader
            id="gallery-section-heading"
            badge="Live Gallery"
            title="Visual Archive &amp; Memories"
            subtitle="Browse through live concert moments, comic books, merchandise, and cruise experiences. Notice the alternating column drift velocities and smooth card hover effects."
          />

          <ParallaxMasonry
            items={GALLERY_ITEMS}
            parallaxStrength={1}
            ariaLabel="Visual Archive & Memories"
          />
        </Stack>
      </PageSection>
    </main>
  );
}
