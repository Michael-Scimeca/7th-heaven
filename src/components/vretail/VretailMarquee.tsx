"use client";

import LogoTicker, { ARTIST_LOGOS, PRESS_LOGOS } from "@/components/LogoTicker";

interface VretailMarqueeProps {
  theme?: "lilac" | "indigo";
}

export default function VretailMarquee({ theme = "lilac" }: VretailMarqueeProps) {
  const isLilac = theme === "lilac";

  return (
    <section
      id="vretail-marquee"
      aria-labelledby="vretail-marquee-heading"
      className={`relative z-10 w-full pt-16 pb-20 border-t overflow-hidden transition-colors ${
        isLilac
          ? "lilac-theme bg-white/25 border-[#4a2e8c]/15 backdrop-blur-md"
          : "bg-[#0d0724]/70 border-purple-500/20 backdrop-blur-md"
      }`}
    >
      <div className="site-container w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-left">
        <h2
          id="vretail-marquee-heading"
          className={`font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-3 ${
            isLilac ? "text-black" : "text-white"
          }`}
        >
          Who We&apos;ve Played With &amp; Where We&apos;ve Been Featured
        </h2>
        <p
          className={`text-sm sm:text-base max-w-2xl leading-relaxed ${
            isLilac ? "text-[#3b3260]" : "text-purple-200/80"
          }`}
        >
          Over the years, 7th Heaven has shared the stage with legendary artists and has been featured across top national TV networks, radio stations, and major press publications.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 opacity-90 hover:opacity-100 transition-opacity">
        <LogoTicker
          items={ARTIST_LOGOS}
          direction="left"
          ariaLabel="Artists 7th Heaven has shared the stage with"
        />
        <LogoTicker
          items={PRESS_LOGOS}
          direction="right"
          ariaLabel="Media and press networks featuring 7th Heaven"
        />
      </div>
    </section>
  );
}
