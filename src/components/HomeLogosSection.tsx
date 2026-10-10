"use client";

import { useMemo } from "react";
import LogoTicker, {
  ARTIST_LOGOS,
  PRESS_LOGOS,
  TickerItem,
} from "@/components/LogoTicker";
import { urlFor } from "@/lib/sanity";

interface SanityLogoItem {
  name?: string;
  alt?: string;
  src?: string;
  image?: unknown;
}

interface SanityHomeLogosContent {
  logosTitle?: string;
  logosBadge?: string;
  logosSubtitle?: string;
  artistLogos?: SanityLogoItem[];
  pressLogos?: SanityLogoItem[];
}

export default function HomeLogosSection({
  sanityContent,
}: {
  sanityContent?: SanityHomeLogosContent | null;
}) {
  const artistItems: TickerItem[] = useMemo(() => {
    if (
      Array.isArray(sanityContent?.artistLogos) &&
      sanityContent.artistLogos.length > 0
    ) {
      const mapped: TickerItem[] = [];
      for (let i = 0; i < sanityContent.artistLogos.length; i++) {
        const item = sanityContent.artistLogos[i];
        if (item) {
          mapped.push({
            alt: item.alt || item.name || "Artist Logo",
            src: item.image ? urlFor(item.image as Parameters<typeof urlFor>[0]).url() : item.src,
          });
        }
      }
      if (mapped.length > 0) return mapped;
    }
    return ARTIST_LOGOS;
  }, [sanityContent?.artistLogos]);

  const pressItems: TickerItem[] = useMemo(() => {
    if (
      Array.isArray(sanityContent?.pressLogos) &&
      sanityContent.pressLogos.length > 0
    ) {
      const mapped: TickerItem[] = [];
      for (let i = 0; i < sanityContent.pressLogos.length; i++) {
        const item = sanityContent.pressLogos[i];
        if (item) {
          mapped.push({
            alt: item.alt || item.name || "Press Logo",
            src: item.image ? urlFor(item.image as Parameters<typeof urlFor>[0]).url() : item.src,
          });
        }
      }
      if (mapped.length > 0) return mapped;
    }
    return PRESS_LOGOS;
  }, [sanityContent?.pressLogos]);

  return (
    <section
      id="logos"
      aria-labelledby="logos-heading"
      className="section cv-auto relative z-20 flex w-full flex-col items-start text-left"
      style={{ "--cv-size": "361px", "--cv-size-lg": "334px" } as React.CSSProperties}
    >
      <div className="site-container w-full">
        <div className="mb-6 flex flex-col items-start text-left">
          <div className="title-group title-group--section max-w-3xl text-left">
            <h2 id="logos-heading" className="text-amber-50">
              {sanityContent?.logosTitle ||
                sanityContent?.logosBadge ||
                "Who We've Played With & Where We've Been Featured"}
            </h2>
            <p className="text-secondary max-w-[65ch]">
              {sanityContent?.logosSubtitle ||
                "Over the years, 7th Heaven has shared the stage with legendary artists and has been featured across top national TV networks, radio stations, and major press publications."}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-4">
        <LogoTicker
          items={artistItems}
          direction="left"
          ariaLabel="Artists 7th Heaven has shared the stage with"
        />
        <LogoTicker
          items={pressItems}
          direction="right"
          ariaLabel="Press publications, networks, and sports teams featuring 7th Heaven"
        />
      </div>
    </section>
  );
}
