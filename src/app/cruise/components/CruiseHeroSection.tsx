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
  setIsPaymentDropdownOpen,
  sanityContent,
}: CruiseHeroSectionProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(video);
    video.play().catch(() => { });

    return () => {
      observer.disconnect();
    };
  }, []);

  const desktopVideoUrl = "/movie/cruise-desktop.mp4";
  const mobileVideoUrl = "/movie/cruise-desktop.mp4";
  const posterUrl =
    sanityContent?.heroPosterUrl || "/images/cruise/hero-video-poster.jpg";

  const bottomFadeStart = heroMaskSettings?.bottomFadeStart ?? 80;
  const bottomFadeEnd = heroMaskSettings?.bottomFadeEnd ?? 98;
  const videoBrightness = heroMaskSettings?.videoBrightness;
  const dimOpacity =
    videoBrightness !== undefined && videoBrightness < 100
      ? (100 - videoBrightness) / 100
      : 0;

  const ship1 = sanityContent?.sections?.find(
    (s: any) => s.sectionId === "hero_ship_1",
  );
  const ship2 = sanityContent?.sections?.find(
    (s: any) => s.sectionId === "hero_ship_2",
  );
  const ship1Title = ship1?.title || "Star of the seas";
  const ship1Year = ship1?.subtitle || "2027";
  const ship2Title = ship2?.title || "Legend of the seas";
  const ship2Year = ship2?.subtitle || "2028";
  const subheading =
    sanityContent?.heroSubheading ||
    "CHICAGO MUSIC CRUISE · OVER 25 YEARS (1998 – 2028)";

  const maskImageGradient =
    "linear-gradient(to bottom, black 0%, black 65%, transparent 95%)";

  return (
    <section
      id="cruise-hero"
      aria-labelledby="cruise-hero-heading"
      className="section relative overflow-x-clip"
    >
      {/* Full-bleed background video & image mask wrapper */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${posterUrl})`,
          bottom: "-8px",
          maskImage: maskImageGradient,
          WebkitMaskImage: maskImageGradient,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          WebkitMaskClip: "border-box",
          maskClip: "border-box",
        }}
      >
        <video
          ref={videoRef}
          poster={posterUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: "center center",
            WebkitMaskImage: maskImageGradient,
            maskImage: maskImageGradient,
          }}
        >
          <source src={desktopVideoUrl} type="video/mp4" />
          <track kind="captions" />
        </video>

        {/* Brightness dimming overlay */}
        {dimOpacity > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 bg-black"
            style={{ opacity: dimOpacity }}
          />
        )}
      </div>

      <div className="site-container relative flex min-h-[710px] flex-col justify-start pt-[calc(var(--header-height)+var(--page-top))] md:h-[800px] md:min-h-[800px]">
        {/* Shared across every hero on the site — see src/lib/useHeroParallax.ts */}
        <HeroParallaxCustomizer {...heroParallax} />

        {/* Hero Text Content — aligned with site-container */}
        <div ref={heroForegroundRef} className="relative z-10 mb-6 text-left">
        {/* Main Title: Cruise Name */}
        <h1 className="" id="cruise-hero-heading">
          {sanityContent?.heroHeading || (
            <>
              7TH HEAVEN{" "}
              <span className="inline-block pr-[0.15em]">FAN CRUISE</span>
            </>
          )}
        </h1>

        {/* Cruise Ship Names Subtitle & Payment Action */}
        <div className="mt-4 flex flex-wrap items-center justify-start gap-3 sm:mt-4">
          <span className="btn-pill-glass flex items-center gap-2.5 backdrop-blur-2xl">
            {ship1Title}{" "}
            <span className="rounded-full border border-purple-400/40 bg-purple-600/40 px-2.5 py-1 text-purple-200">
              {ship1Year}
            </span>
          </span>
          <span className="btn-pill-glass flex items-center gap-2.5 backdrop-blur-2xl">
            {ship2Title}{" "}
            <span className="rounded-full border border-purple-400/40 bg-purple-600/40 px-2.5 py-1 text-purple-200">
              {ship2Year}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              setIsPaymentDropdownOpen(true);
              const el = document.getElementById("signup");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-pill-glass flex cursor-pointer items-center gap-2 border border-action/40 bg-action-soft text-action font-semibold backdrop-blur-2xl transition-[background-color,color,border-color] hover:bg-action/25 hover:text-action-hover focus-visible:ring-2 focus-visible:ring-action-ring"
          >
            <span>💳 MAKE A PAYMENT - GROUP ID: 3325680</span>
          </button>
        </div>
      </div>
      </div>
    </section>
  );
}
