"use client";

import React from "react";
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
  setIsPaymentDropdownOpen: _setIsPaymentDropdownOpen,
  sanityContent,
}: CruiseHeroSectionProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  }, []);

  const desktopVideoUrl = sanityContent?.heroVideoUrl || "/movie/cruise-desktop.mp4";
  const mobileVideoUrl = sanityContent?.heroVideoMobileUrl || "/movie/cruise-mobile.mp4";
  const posterUrl = sanityContent?.heroPosterUrl || "/images/cruise/hero-video-poster.jpg";

  const bottomFadeStart = heroMaskSettings?.bottomFadeStart ?? 80;
  const bottomFadeEnd = heroMaskSettings?.bottomFadeEnd ?? 98;
  const videoBrightness = heroMaskSettings?.videoBrightness;
  const dimOpacity = videoBrightness !== undefined && videoBrightness < 100 ? (100 - videoBrightness) / 100 : 0;

  const ship1 = sanityContent?.sections?.find((s: any) => s.sectionId === "hero_ship_1");
  const ship2 = sanityContent?.sections?.find((s: any) => s.sectionId === "hero_ship_2");
  const ship1Title = ship1?.title || "Star of the seas";
  const ship1Year = ship1?.subtitle || "2027";
  const ship2Title = ship2?.title || "Legend of the seas";
  const ship2Year = ship2?.subtitle || "2028";
  const subheading = sanityContent?.heroSubheading || "CHICAGO MUSIC CRUISE · OVER 25 YEARS (1998 – 2028)";

  const maskImageGradient = `linear-gradient(to bottom, black 0%, black ${bottomFadeStart}%, transparent ${bottomFadeEnd}%, transparent 100%)`;

  return (
    <section
      id="cruise-hero"
      className="-mt-[100px] pt-[100px] relative flex flex-col justify-start overflow-hidden pb-8 md:pb-16 text-white min-h-[35vh] md:min-h-[36vh] lg:min-h-[620px] site-container">
      {/* Full-bleed background video & image mask wrapper */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#05030a]"
        style={{
          marginLeft: "calc(-1 * var(--page-padding-x))",
          marginRight: "calc(-1 * var(--page-padding-x))",
          width: "calc(100% + 2 * var(--page-padding-x))",
          bottom: "-12px",
          maskImage: maskImageGradient,
          WebkitMaskImage: maskImageGradient,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          WebkitMaskClip: "border-box",
          maskClip: "border-box",
        }}>
        <video
          ref={videoRef}
          poster={posterUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover bg-[#05030a]"
          style={{
            objectPosition: "center 40%",
            transform: "scale(1.02)",
            transformOrigin: "center center",
          }}>
          <source src={mobileVideoUrl} media="(max-width: 767px)" type="video/mp4" />
          <source src={desktopVideoUrl} media="(min-width: 768px)" type="video/mp4" />
          <track kind="captions" />
        </video>

        {/* Brightness dimming overlay */}
        {dimOpacity > 0 && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-20 bg-black"
            style={{ opacity: dimOpacity }}
          />
        )}
      </div>

      {/* Shared across every hero on the site — see src/lib/useHeroParallax.ts */}
      <HeroParallaxCustomizer {...heroParallax} />

      {/* Hero Text Content — aligned with site-container */}
      <div
        ref={heroForegroundRef}
        className="relative z-10 text-left mb-4">
        {/* Chicago Music Cruise Official Branding Badges & Social Links */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <SectionBadge label={subheading} />
          <SectionBadge label="ROYAL CARIBBEAN GROUP ID: 3325680" />
        </div>

        {/* Main Title: Cruise Name */}
        <h1>
          {sanityContent?.heroHeading || (
            <>7TH HEAVEN <span className="inline-block pr-[0.15em]">FAN CRUISE</span></>
          )}
        </h1>

        {/* Cruise Ship Names Subtitle */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-start gap-3 sm:gap-4 md:text-base uppercase text-white">
          <span className="bg-[#e1e6ff29] border-white/10 border px-3 py-2 !rounded-full text-white border border-white/10 backdrop-blur-[45px] flex items-center gap-2.5">
            {ship1Title} <span className="text-purple-200 bg-purple-600/40 px-2.5 py-1 !rounded-full border border-purple-400/40">{ship1Year}</span>
          </span>
          <span className="bg-[#e1e6ff29] border-white/10 border px-3 py-2 !rounded-full text-white border border-white/10 backdrop-blur-[45px] flex items-center gap-2.5">
            {ship2Title} <span className="text-purple-200 bg-purple-600/40 px-2.5 py-1 !rounded-full border border-purple-400/40">{ship2Year}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
