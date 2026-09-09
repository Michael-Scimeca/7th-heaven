"use client";

import LogoTicker, { ARTIST_LOGOS, PRESS_LOGOS } from "@/components/LogoTicker";

export default function HomeLogosSection({ sanityContent }: { sanityContent?: any }) {


  return (
    <div className="container mx-auto px-4 flex flex-col items-center text-center mb-12">
      <div className="inline-flex items-center gap-2 bg-[#00000029] border border-white/10 px-4 py-1.5 rounded-xl    mb-2.5">
        <span className="font-black text-white/95">
          {sanityContent?.logosBadge || "WHO WE'VE PLAYED WITH & WHERE WE'VE BEEN FEATURED"}
        </span>
      </div>
      <p className="mt-2 max-w-2xl">
        {sanityContent?.logosSubtitle || "Over the years, 7th Heaven has shared the stage with legendary artists and has been featured across top national TV networks, radio stations, and major press publications."}
      </p>

      <div className="w-full mt-8 space-y-6">
        <LogoTicker items={ARTIST_LOGOS} direction="left" />
        <LogoTicker items={PRESS_LOGOS} direction="right" />
      </div>
    </div>
  );
}
