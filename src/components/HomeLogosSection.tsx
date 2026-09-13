"use client";

import { useMemo } from "react";
import LogoTicker, { ARTIST_LOGOS, PRESS_LOGOS, TickerItem } from "@/components/LogoTicker";
import { urlFor } from "@/lib/sanity";

export default function HomeLogosSection({ sanityContent }: { sanityContent?: any }) {
  const artistItems: TickerItem[] = useMemo(() => {
    if (Array.isArray(sanityContent?.artistLogos) && sanityContent.artistLogos.length > 0) {
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
    if (Array.isArray(sanityContent?.pressLogos) && sanityContent.pressLogos.length > 0) {
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
    <section id="logos" className="relative w-full py-section-fluid px-4 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 bg-[#00000029] border border-white/10 px-4 py-1.5 rounded-xl mb-2.5">
        <span className="font-black text-white/95">
          {sanityContent?.logosBadge || "WHO WE'VE PLAYED WITH & WHERE WE'VE BEEN FEATURED"}
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-purple-200/80">
        {sanityContent?.logosSubtitle || "Over the years, 7th Heaven has shared the stage with legendary artists and has been featured across top national TV networks, radio stations, and major press publications."}
      </p>

      <div className="w-full mt-8 space-y-6">
        <LogoTicker items={artistItems} direction="left" />
        <LogoTicker items={pressItems} direction="right" />
      </div>
    </section>
  );
}
