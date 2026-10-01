"use client";

import { useMemo } from "react";
import LogoTicker, {
  ARTIST_LOGOS,
  PRESS_LOGOS,
  TickerItem,
} from "@/components/LogoTicker";
import { urlFor } from "@/lib/sanity";
import { SectionBadge } from "@/components/SectionBadge";

export default function HomeLogosSection({
  sanityContent,
}: {
  sanityContent?: any;
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
            src: item.image ? urlFor(item.image).url() : item.src,
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
            src: item.image ? urlFor(item.image).url() : item.src,
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
        <h2 id="logos-heading" className="sr-only">
          Featured &amp; Stage Partners
        </h2>
        <div className="mb-6 flex flex-col items-start text-left">
          <div className="mb-2 inline-flex items-center justify-start">
            <SectionBadge variant="box" className="font-black">
              {sanityContent?.logosBadge ||
                "WHO WE'VE PLAYED WITH & WHERE WE'VE BEEN FEATURED"}
            </SectionBadge>
          </div>
          <p className="max-w-2xl text-purple-200/80 text-left">
            {sanityContent?.logosSubtitle ||
              "Over the years, 7th Heaven has shared the stage with legendary artists and has been featured across top national TV networks, radio stations, and major press publications."}
          </p>
        </div>
      </div>
      <div className="w-full space-y-4">
        <LogoTicker items={artistItems} direction="left" />
        <LogoTicker items={pressItems} direction="right" />
      </div>
    </section>
  );
}
