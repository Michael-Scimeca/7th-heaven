"use client";

import React from "react";
import Image from "next/image";
import { SectionBadge } from "@/components/SectionBadge";
import HeroParallaxCustomizer from "@/components/HeroParallaxCustomizer";
import type { HeroParallaxController } from "@/lib/useHeroParallax";
import type { RefObject } from "react";

interface CruiseHeroSectionProps {
  heroForegroundRef: RefObject<HTMLDivElement | null>;
  heroMaskSettings: any;
  heroParallax: HeroParallaxController;
  setIsPaymentDropdownOpen: (open: boolean) => void;
  sanityContent?: any;
}

export default function CruiseHeroSection({
  heroForegroundRef,
  heroMaskSettings,
  heroParallax,
  setIsPaymentDropdownOpen,
  sanityContent,
}: CruiseHeroSectionProps) {
  const videoUrl = sanityContent?.heroVideoUrl;

  return (
    <section
      id="cruise-hero"
      className="-mt-[100px] pt-[100px] relative flex flex-col justify-start overflow-hidden pb-8 md:pb-16 text-white min-h-[35vh] md:min-h-[36vh] lg:min-h-[620px] site-container">
      {/* Full-bleed background image & video wrapper with bottom gradient mask */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          marginLeft: "calc(-1 * var(--page-padding-x))",
          marginRight: "calc(-1 * var(--page-padding-x))",
          width: "calc(100% + 2 * var(--page-padding-x))",
          maskImage: "linear-gradient(to bottom, black 0%, black 80%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 80%, transparent 100%)",
        }}>
        {videoUrl ? (
          <video
            src={videoUrl}
            poster="/images/cruise/hero-video-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
        ) : (
          <Image
            src="/images/cruise/hero-video-poster.jpg"
            alt="7th Heaven Fan Cruise hero"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "center 40%" }}
          />
        )}

        {/* Brightness dimming overlay */}
        {heroMaskSettings.videoBrightness < 100 && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#000",
              opacity: (100 - heroMaskSettings.videoBrightness) / 100,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Shared across every hero on the site — see src/lib/useHeroParallax.ts */}
      <HeroParallaxCustomizer {...heroParallax} />

      {/* Hero Text Content — aligned with site-container */}
      <div
        ref={heroForegroundRef}
        className="relative z-10 text-left site-container mb-4">
        {/* Chicago Music Cruise Official Branding Badges & Social Links */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <SectionBadge label={sanityContent?.heroSubheading || "CHICAGO MUSIC CRUISE · OVER 25 YEARS (1998 – 2028)"} />
          <SectionBadge label="ROYAL CARIBBEAN GROUP ID: 3325680" />
        </div>

        {/* Main Title: Cruise Name */}
        <h1 className="">
          {sanityContent?.heroHeading || (
            <>7TH HEAVEN <span className="inline-block pr-[0.15em]">FAN CRUISE</span></>
          )}
        </h1>

        {/* Cruise Ship Names Subtitle */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-start gap-3 sm:gap-4 md:text-base uppercase text-white">
          <span className="bg-[#e1e6ff29] border-white/10 border px-3 py-2 !rounded-full text-white border border-white/10 backdrop-blur-[45px] flex items-center gap-2.5">
            {sanityContent?.sections?.find((s: any) => s.sectionId === "hero_ship_1")?.title || "Star of the seas"} <span className="text-purple-200 bg-purple-600/40 px-2.5 py-1 !rounded-full border border-purple-400/40">{sanityContent?.sections?.find((s: any) => s.sectionId === "hero_ship_1")?.subtitle || "2027"}</span>
          </span>
          <span className="bg-[#e1e6ff29] border-white/10 border px-3 py-2 !rounded-full text-white border border-white/10 backdrop-blur-[45px] flex items-center gap-2.5">
            {sanityContent?.sections?.find((s: any) => s.sectionId === "hero_ship_2")?.title || "Legend of the seas"} <span className="text-purple-200 bg-purple-600/40 px-2.5 py-1 !rounded-full border border-purple-400/40">{sanityContent?.sections?.find((s: any) => s.sectionId === "hero_ship_2")?.subtitle || "2028"}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
