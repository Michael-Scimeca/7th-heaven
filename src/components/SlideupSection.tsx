"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function AutoPlayVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      },
      { threshold: 0.1, rootMargin: "150px 0px" }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const isMobile = typeof window !== "undefined" ? !window.matchMedia("(min-width: 768px)").matches : false;
    const MAX_DURATION = isMobile ? 6 : 8; // 6 seconds long loop on mobile, 8 seconds on desktop
    if (video.currentTime >= MAX_DURATION) {
      try {
        video.currentTime = 0;
      } catch (_) { }
    }
  };

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      onTimeUpdate={handleTimeUpdate}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 z-[1] w-full h-full object-cover"
    />
  );
}

const HEADER_H = 80;

type ThumbItem = { label: string; badge?: string; gradient?: string; video?: string; youtube?: string };

const SLIDES: {
  tag: string;
  title: string;
  desc: string;
  bg: string;
  accent: string;
  thumbs: ThumbItem[];
}[] = [
    {
      tag: "[ 01 ]",
      title: "Thousands of shows. Fans who never miss one.",
      desc: "40 years, thousands of shows, and a crowd that shows up every time — 7th Heaven built a career on fans who sing every word and keep coming back for more.",
      bg: "transparent",
      accent: "#c084fc",
      thumbs: [
        { label: "Soldier Field", badge: "Stadium Stage", gradient: "linear-gradient(160deg,#3b4a3f,#0e1a12)", video: "/movie/luminous-clip.mp4" },
        { label: "Cruise Stage", badge: "Live at Sea", gradient: "linear-gradient(160deg,#4a7fae,#8a3d2d)", video: "/movie/cruise.mp4" },
        { label: "At Sea Crowd", badge: "Fan Audience", gradient: "linear-gradient(160deg,#d986a8,#5b2340)", video: "/movie/ship-sea.mp4" },
        { label: "Port Sunset", badge: "Caribbean Stage", gradient: "linear-gradient(160deg,#2b4c6f,#0e1b2a)", video: "/movie/ship-port.mp4" },
      ],
    },
    {
      tag: "[ 02 ]",
      title: "We love doing private events",
      desc: "Weddings, corporate parties, intimate acoustic sets — bring us in for your private event and we'll bring the same energy we give 20,000 people at a festival.",
      bg: "transparent",
      accent: "#d8b4fe",
      thumbs: [
        { label: "Weddings", badge: "Private Event", gradient: "linear-gradient(160deg,#c9b48a,#3c2f1e)", video: "/movie/Frankie.mp4" },
        { label: "Corporate Events", badge: "Corporate Show", gradient: "linear-gradient(160deg,#8a8a8a,#1a1a1a)", video: "/movie/Mark.mp4" },
        { label: "Private Parties", badge: "VIP Celebration", gradient: "linear-gradient(160deg,#e0c9a6,#5a4326)", video: "/movie/Nick.mp4" },
        { label: "VIP Galas", badge: "Special Event", gradient: "linear-gradient(160deg,#6b4f77,#231429)", video: "/movie/Rich.mp4" },
      ],
    },
    {
      tag: "[ 03 ]",
      title: "Fest season, every summer",
      desc: "From county fairgrounds to Soldier Field, we've headlined more fests than we can count — same energy, bigger stage, same fans singing in the crowd.",
      bg: "transparent",
      accent: "#f2f1e6",
      thumbs: [
        { label: "DeKalb Cornfest", badge: "Summer Fest", gradient: "linear-gradient(160deg,#6f6fce,#1a1a3a)", video: "/movie/fest1-clip.mp4" },
        { label: "Schaumburg Fest", badge: "Main Stage", gradient: "linear-gradient(160deg,#e0a35a,#4a2410)", video: "/movie/hero-colorinmostion.mp4" },
        { label: "Rock N' Wheels", badge: "Outdoor Fest", gradient: "linear-gradient(160deg,#5ad0c0,#0d2a26)", video: "/movie/Adam.mp4" },
        { label: "Main Stage", badge: "Headliner", gradient: "linear-gradient(160deg,#7a3b8e,#240d2a)", video: "/movie/spectrum.mp4" },
      ],
    },
    {
      tag: "[ 04 ]",
      title: "We love playing at bars",
      desc: "Packing local clubs, sports bars, and music venues with high-energy rock sets, classic anthems, and fans singing along all night long.",
      bg: "transparent",
      accent: "#bfa0e9",
      thumbs: [
        { label: "Local Club", badge: "Nightclub", gradient: "linear-gradient(160deg,#6a3b8e,#1b0d2a)", video: "/movie/be-here-clip.mp4" },
        { label: "Sports Bar", badge: "High Energy", gradient: "linear-gradient(160deg,#8e4a3b,#2a0d1b)", video: "/movie/color-in-motion-clip.mp4" },
        { label: "Pub & Grill", badge: "Live Rock", gradient: "linear-gradient(160deg,#3b8e7f,#0d2a23)", video: "/movie/next.mp4" },
        { label: "Late Night Jam", badge: "Live Set", gradient: "linear-gradient(160deg,#8e3b5e,#2a0d1b)", video: "/movie/luminous.mp4" },
      ],
    },
  ];

export default function SlideupSection({ showIntro = false }: { showIntro?: boolean }) {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastStateRef = useRef<{ overlap: number; scale: number; translateY: number; masked: boolean }[]>([]);

  useEffect(() => {
    const vh = () => window.innerHeight - HEADER_H;

    function onScroll() {
      const viewportH = vh();

      const rects = cardRefs.current.map((card) => {
        if (!card) return null;
        const innerEl = (card.querySelector('.su-card-inner') as HTMLElement) || card;
        return {
          innerRect: innerEl.getBoundingClientRect(),
          cardRect: card.getBoundingClientRect(),
        };
      });

      const last = lastStateRef.current;
      cardRefs.current.forEach((card, i) => {
        if (!card || !rects[i]) return;
        const prev = last[i] || (last[i] = { overlap: -1, scale: -1, translateY: NaN, masked: false });
        const nextData = rects[i + 1];

        if (nextData) {
          const innerRect = rects[i]!.innerRect;
          const nextRect = nextData.cardRect;

          const coveredProgress = Math.min(Math.max((viewportH + HEADER_H - nextRect.top) / viewportH, 0), 1);
          const scale = Math.round((1 - coveredProgress * 0.05) * 1000) / 1000;
          const translateY = Math.round(-coveredProgress * 20 * 10) / 10;

          const overlapPx = Math.max(0, innerRect.bottom - nextRect.top + 20);
          const overlapPercent = Math.round(Math.min(100, (overlapPx / innerRect.height) * 100) * 4) / 4;

          if (scale !== prev.scale || translateY !== prev.translateY) {
            card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            prev.scale = scale;
            prev.translateY = translateY;
          }

          if (overlapPercent !== prev.overlap) {
            if (overlapPercent > 0) {
              const maskTopPercent = Math.max(0, 100 - overlapPercent);
              const fadeEdge = Math.max(0, maskTopPercent - 6);
              const maskVal = `linear-gradient(to bottom, black 0%, black ${fadeEdge.toFixed(1)}%, transparent ${maskTopPercent.toFixed(1)}%, transparent 100%)`;
              card.style.maskImage = maskVal;
              (card.style as any).webkitMaskImage = maskVal;
              prev.masked = true;
            } else if (prev.masked) {
              card.style.maskImage = "none";
              (card.style as any).webkitMaskImage = "none";
              prev.masked = false;
            }
            prev.overlap = overlapPercent;
          }

          if (card.style.opacity !== "1") card.style.opacity = "1";
        } else if (prev.overlap !== 0 || prev.masked) {
          card.style.transform = "none";
          card.style.opacity = "1";
          card.style.maskImage = "none";
          (card.style as any).webkitMaskImage = "none";
          prev.overlap = 0;
          prev.masked = false;
        }
      });

      let activeIndex = 0;
      rects.forEach((r, i) => {
        if (r && r.cardRect.top <= HEADER_H + viewportH * 0.5) activeIndex = i;
      });
      dotRefs.current.forEach((d, i) => d?.classList.toggle("su-active", i === activeIndex));
    }

    let raf = 0;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onScroll);
    };

    document.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    onScroll();

    return () => {
      document.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
      cancelAnimationFrame(raf);
    };
  }, [showIntro]);

  return (
    <section id="slide-up" className="su-bleed py-section-fluid">
      <div className="su-rail-track">
        <div className="su-rail">
          {SLIDES.map((_, i) => (
            <div key={i} className="su-dot" ref={(el) => { dotRefs.current[i] = el; }} />
          ))}
        </div>
      </div>

      {showIntro && (
        <section className="su-intro">
          <h1>Slideup</h1>
          <p>A sticky window holds each panel in place while the next one climbs up from below and covers it completely — scroll to watch the stack build.</p>
          <div className="su-hint">Scroll</div>
        </section>
      )}

      <section className="su-stack site-container">
        {SLIDES.map((slide, i) => (
          <article
            key={slide.title}
            className="su-card"
            ref={(el) => { cardRefs.current[i] = el; }}
          >
            <div className="su-card-inner">
              <div className="flex flex-col items-center text-center pb-[20px] gap-4">
                <div className="su-headline">
                  <span>{slide.title}</span>
                </div>
                <p className="su-desc">{slide.desc}</p>
              </div>
              <div className="su-thumbs">
                {slide.thumbs.map((t, ti) => (
                  <div key={`${t.label}-${ti}`} className="su-thumb group">
                    {t.video && (
                      <AutoPlayVideo src={t.video} />
                    )}
                    {t.youtube && (
                      <Image
                        src={`https://img.youtube.com/vi/${t.youtube}/hqdefault.jpg`}
                        alt={t.label}
                        width={480}
                        height={360}
                        className="su-thumb-yt object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="su-thumb-overlay" />
                    <div className="su-thumb-content">
                      {t.badge && <span className="su-thumb-badge">{t.badge}</span>}
                      <h3 className="su-thumb-title">{t.label}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
