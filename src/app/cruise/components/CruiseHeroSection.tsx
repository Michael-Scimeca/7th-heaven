"use client";

import React, { type RefObject } from "react";
import Image from "next/image";
import { SectionBadge } from "@/components/SectionBadge";
import HeroParallaxCustomizer from "@/components/HeroParallaxCustomizer";
import type { HeroParallaxController } from "@/lib/useHeroParallax";

interface CruiseHeroSectionProps {
  heroVideoRef: RefObject<HTMLVideoElement | null>;
  heroForegroundRef: RefObject<HTMLDivElement | null>;
  heroMaskSettings: any;
  heroVideoReady: boolean;
  setHeroVideoReady: (ready: boolean) => void;
  heroParallax: HeroParallaxController;
  setIsPaymentDropdownOpen: (open: boolean) => void;
}

export default function CruiseHeroSection({
  heroVideoRef,
  heroForegroundRef,
  heroMaskSettings,
  heroVideoReady,
  setHeroVideoReady,
  heroParallax,
  setIsPaymentDropdownOpen,
}: CruiseHeroSectionProps) {
  React.useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, [heroVideoRef]);

  const filterStyle = React.useMemo(() => {
    const blur = heroMaskSettings?.videoBlur ?? 0;
    const brightness = heroMaskSettings?.videoBrightness ?? 90;
    const contrast = heroMaskSettings?.videoContrast ?? 100;
    if (blur === 0 && brightness === 100 && contrast === 100) return "none";
    return `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%)`;
  }, [heroMaskSettings]);

  return (
    <section
      id="cruise-hero"
      className="-mt-[100px] pt-[100px] relative flex flex-col justify-start overflow-hidden pb-8 md:pb-16 text-white min-h-[35vh] md:min-h-[36vh] lg:min-h-[620px]"
      style={{
        marginLeft: "calc(-1 * var(--page-padding-x))",
        marginRight: "calc(-1 * var(--page-padding-x))",
        width: "calc(100% + 2 * var(--page-padding-x))",
      }}
    >
      {/* Cruise Hero Video Background Overlay with Pure Hardware-Accelerated Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#05030a]">
        <video
          ref={heroVideoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/cruise/hero-video-poster.jpg"
          onLoadedData={() => {
            if (heroVideoRef.current) {
              heroVideoRef.current.play().catch(() => {});
            }
            setHeroVideoReady?.(true);
          }}
          onPlaying={() => setHeroVideoReady?.(true)}
          {...({ fetchPriority: "high" } as any)}
          className="w-full h-full object-cover transition-opacity duration-500 ease-out transform-gpu"
          style={{
            objectPosition: "center 40%",
            filter: filterStyle,
            WebkitFilter: filterStyle,
            opacity: heroVideoReady ? (heroMaskSettings?.videoOpacity ?? 100) / 100 : 1,
          }}
        >
          <source src="/movie/cruise-desktop.mp4" type="video/mp4" />
          <source src="/movie/cruise.mp4" type="video/mp4" />
        </video>

        {/* Hardware Accelerated Bottom Fade Overlay (Replaces GPU FBO mask-image) */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-1"
          style={{
            background: "linear-gradient(to bottom, rgba(5, 3, 10, 0) 0%, rgba(5, 3, 10, 0.7) 60%, rgba(5, 3, 10, 1) 100%)",
          }}
        />
      </div>


      {/* Shared across every hero on the site — see src/lib/useHeroParallax.ts */}
      <HeroParallaxCustomizer {...heroParallax} />

      {/* Hero Text */}
      <div
        ref={heroForegroundRef}
        className="relative z-10 text-left site-container mb-4"
      >
        {/* Chicago Music Cruise Official Branding Badges & Social Links */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <SectionBadge label="CHICAGO MUSIC CRUISE · OVER 25 YEARS (1998 – 2028)" />
          <SectionBadge label="ROYAL CARIBBEAN GROUP ID: 3325680" />
          <SectionBadge
            label="ROYAL CARIBBEAN ONLINE PAYMENT PORTAL"
            isActive
            onClick={() => {
              setIsPaymentDropdownOpen(true);
              const el = document.getElementById("payment-portal-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>

        {/* Main Title: Cruise Name */}
        <h1 className="font-bold uppercase er text-white leading-none">
          7TH HEAVEN <span className="inline-block pr-[0.15em]">FAN CRUISE</span>
        </h1>

        {/* Cruise Ship Names Subtitle */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-start gap-3 sm:gap-4 md:text-base font-bold uppercase text-white">
          <span className="bg-[#e1e6ff29] border-white/10 border px-2 py-2 !rounded-full text-white font-bold border border-white/10 backdrop-blur-[45px] flex items-center gap-2.5">
            Star of the seas <span className="text-purple-200 bg-purple-600/40 px-2.5 py-1 !rounded-full font-bold border border-purple-400/40">2027</span>
          </span>
          <span className="bg-[#e1e6ff29] border-white/10 border px-2 py-2 !rounded-full text-white font-bold border border-white/10 backdrop-blur-[45px] flex items-center gap-2.5">
            Legend of the seas <span className="text-purple-200 bg-purple-600/40 px-2.5 py-1 !rounded-full font-bold border border-purple-400/40">2028</span>
          </span>
        </div>
      </div>
    </section>
  );
}
