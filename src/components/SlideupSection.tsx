"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function HoverVideo({ src }: { src: string }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (hovered && videoRef.current) {
      videoRef.current.play().catch(() => { });
    } else if (!hovered && videoRef.current) {
      videoRef.current.pause();
    }
  }, [hovered]);

  return (
    <div
      className="absolute inset-0 w-full h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-[1] w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 z-[1] w-full h-full bg-zinc-900/60" />
      )}
    </div>
  );
}

const HEADER_H = 80;

type ThumbItem = { label: string; gradient?: string; video?: string; youtube?: string };

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
        { label: "Color In Motion", gradient: "linear-gradient(160deg,#3b4a3f,#0e1a12)", video: "/movie/hero-colorinmostion.mp4" },
        { label: "Cruise", gradient: "linear-gradient(160deg,#4a7fae,#8a3d2d)", video: "/movie/cruise.mp4" },
        { label: "At Sea", gradient: "linear-gradient(160deg,#d986a8,#5b2340)", video: "/movie/ship-sea.mp4" },
        { label: "Adam", gradient: "linear-gradient(160deg,#3a3a3a,#0b0b0b)", video: "/movie/Adam.mp4" },
      ],
    },
    {
      tag: "[ 02 ]",
      title: "We love doing private events",
      desc: "Weddings, corporate parties, intimate acoustic sets — bring us in for your private event and we'll bring the same energy we give 20,000 people at a festival.",
      bg: "transparent",
      accent: "#d8b4fe",
      thumbs: [
        { label: "Wedding", gradient: "linear-gradient(160deg,#c9b48a,#3c2f1e)", video: "/movie/Frankie.mp4" },
        { label: "Corporate", gradient: "linear-gradient(160deg,#8a8a8a,#1a1a1a)", video: "/movie/Mark.mp4" },
        { label: "Private Party", gradient: "linear-gradient(160deg,#e0c9a6,#5a4326)", video: "/movie/Nick.mp4" },
        { label: "Acoustic Set", gradient: "linear-gradient(160deg,#4d5a4a,#10140f)", video: "/movie/Rich.mp4" },
      ],
    },
    {
      tag: "[ 03 ]",
      title: "Fest season, every summer",
      desc: "From county fairgrounds to Soldier Field, we've headlined more fests than we can count — same energy, bigger stage, same fans singing in the crowd.",
      bg: "transparent",
      accent: "#f2f1e6",
      thumbs: [
        { label: "DeKalb Cornfest", gradient: "linear-gradient(160deg,#6f6fce,#1a1a3a)", youtube: "C0PQYmyaTFk" },
        { label: "Schaumburg Fest", gradient: "linear-gradient(160deg,#e0a35a,#4a2410)", youtube: "qp5Y312eiS8" },
        { label: "Schaumburg Fest", gradient: "linear-gradient(160deg,#5ad0c0,#0d2a26)", youtube: "4DR68Z8rd_k" },
        { label: "Rock N' Wheels", gradient: "linear-gradient(160deg,#d9d9d9,#3a3a3a)", youtube: "UQBvl_wZ0ak" },
      ],
    },
    {
      tag: "[ 04 ]",
      title: "We love playing at bars",
      desc: "Packing local clubs, sports bars, and music venues with high-energy rock sets, classic anthems, and fans singing along all night long.",
      bg: "transparent",
      accent: "#bfa0e9",
      thumbs: [
        { label: "Local Club", gradient: "linear-gradient(160deg,#6a3b8e,#1b0d2a)", video: "/movie/hero-colorinmostion.mp4" },
        { label: "Sports Bar", gradient: "linear-gradient(160deg,#8e4a3b,#2a0d1b)", video: "/movie/cruise.mp4" },
        { label: "Pub & Grill", gradient: "linear-gradient(160deg,#3b8e7f,#0d2a23)", video: "/movie/ship-sea.mp4" },
        { label: "Music Hall", gradient: "linear-gradient(160deg,#8e863b,#2a270d)", video: "/movie/Adam.mp4" },
      ],
    },
  ];

export default function SlideupSection({ showIntro = false }: { showIntro?: boolean }) {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const vh = () => window.innerHeight - HEADER_H;

    function onScroll() {
      const viewportH = vh();

      // Phase 1: Batch ALL DOM geometry reads into array (no style writes)
      const rects = cardRefs.current.map((card) => {
        if (!card) return null;
        const innerEl = (card.querySelector('.su-card-inner') as HTMLElement) || card;
        return {
          innerRect: innerEl.getBoundingClientRect(),
          cardRect: card.getBoundingClientRect(),
        };
      });

      // Phase 2: Batch ALL DOM style mutations (no geometry reads)
      cardRefs.current.forEach((card, i) => {
        if (!card || !rects[i]) return;
        const nextData = rects[i + 1];
        if (nextData) {
          const innerRect = rects[i]!.innerRect;
          const nextRect = nextData.cardRect;

          const coveredProgress = Math.min(Math.max((viewportH + HEADER_H - nextRect.top) / viewportH, 0), 1);
          const scale = 1 - coveredProgress * 0.05;
          const translateY = -coveredProgress * 20;

          const overlapPx = Math.max(0, innerRect.bottom - nextRect.top + 20);
          const overlapPercent = Math.min(100, (overlapPx / innerRect.height) * 100);

          if (overlapPercent > 0) {
            const maskTopPercent = Math.max(0, 100 - overlapPercent);
            const fadeEdge = Math.max(0, maskTopPercent - 6);
            const maskVal = `linear-gradient(to bottom, black 0%, black ${fadeEdge.toFixed(1)}%, transparent ${maskTopPercent.toFixed(1)}%, transparent 100%)`;
            card.style.maskImage = maskVal;
            (card.style as any).webkitMaskImage = maskVal;
            card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            card.style.opacity = "1";
          } else {
            card.style.maskImage = "none";
            (card.style as any).webkitMaskImage = "none";
            card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            card.style.opacity = "1";
          }
        } else {
          card.style.transform = "none";
          card.style.opacity = "1";
          card.style.maskImage = "none";
          (card.style as any).webkitMaskImage = "none";
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
    <div className="su-bleed my-12 ">
      <style>{`
        .su-bleed{
          position:relative;
          background:transparent;
          color:#f2f1e6;
          font-family: inherit;
        }
        .su-rail-track{
          position:absolute;
          top:0;
          bottom:0;
          left:-24px;
          z-index:50;
          pointer-events:none;
        }
        .su-rail{
          position:sticky;
          top:50vh;
          transform:translateY(-50%);
          display:flex;
          flex-direction:column;
          gap:14px;
        }
        .su-rail .su-dot{
          width:7px;
          height:7px;
          border-radius:2px;
          background:rgba(255,255,255,0.18);
          transition:background .3s ease, height .3s ease;
        }
        .su-rail .su-dot.su-active{
          background:#c084fc;
          height:22px;
        }
        .su-intro{
          min-height: 40vh;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          padding: 8vh 6vw 4vh;
          gap:18px;
        }
        .su-intro h1{
          font-size: clamp(2.2rem, 6vw, 4.5rem);
          font-weight:800;
          letter-spacing:-0.02em;
          color:#c084fc;
          line-height:1.05;
          margin:0;
        }
        .su-intro p{
          max-width:520px;
          color:#a9a897;
          font-size:1rem;
          line-height:1.6;
          margin:0;
        }
        .su-hint{
          margin-top:10px;
          font-size:0.75rem;
          letter-spacing:0.14em;
          text-transform:uppercase;
          color:#a855f7;
          display:flex;
          align-items:center;
          gap:8px;
        }
        .su-hint::before{
          content:"";
          width:1px;
          height:26px;
          background:linear-gradient(#a855f7, transparent);
          animation: su-pulse 1.6s ease-in-out infinite;
        }
        @keyframes su-pulse{
          0%,100%{ opacity:.25; }
          50%{ opacity:1; }
        }
        .su-stack{ position:relative; }
        .su-card{
          position:sticky;
          top:${HEADER_H}px;
          height:auto;
          min-height:0;
          padding-top:32px;
          padding-bottom:48px;
          width:100%;
          display:flex;
          align-items:flex-start;
          justify-content:center;
          overflow:hidden;
          border-radius:28px 28px 0 0;
          will-change:transform, filter;
          background: transparent;
        }
        .su-card-inner{
          position:relative;
          z-index:2;
          width: 100vw;
          display:flex;
          flex-direction:column;
          align-items:center;
          text-align:center;
          gap:26px;
        }
        .su-tag{
          font-size:0.85rem;
          letter-spacing:0.12em;
          opacity:0.75;
          font-weight:600;
        }
        .su-headline{
          display:flex;
          align-items:center;
          justify-content:center;
          gap:22px;
          flex-wrap:wrap;
          font-size:clamp(2rem, 5.4vw, 4.6rem);
          font-weight:800;
          letter-spacing:-0.02em;
          line-height:1.05;
          max-width:800px;
          width:100%;
        }
        .su-desc{
          max-width:640px;
          color:#a9a897;
          font-size:1.05rem;
          line-height:1.7;
          margin:0;
        }
        .su-thumbs{
          display:flex;
          gap:16px;
          width:100%;
        }
        .su-thumb{
          flex:1;
          aspect-ratio:4/5;
          border-radius:14px;
          position:relative;
          overflow:hidden;
          display:flex;
          align-items:flex-end;
          padding:12px;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06);
        }
        .su-thumb span{
          position:relative;
          z-index:2;
          font-size:0.75rem;
          font-weight:600;
          color:#ffffff;
          background:rgba(147, 51, 234, 0.85);
          padding:5px 11px;
          border-radius:20px;
          backdrop-filter:blur(6px);
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          border:1px solid rgba(255,255,255,0.2);
        }
        .su-thumb video{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          object-fit:cover;
          z-index:1;
        }
        .su-thumb-yt{
          position:absolute;
          top:50%;
          left:50%;
          height:100%;
          width:auto;
          aspect-ratio:16/9;
          min-width:100%;
          transform:translate(-50%, -50%);
          border:0;
          z-index:1;
          pointer-events:none;
        }
        @media (max-width: 720px){
          .su-thumbs{ flex-wrap:wrap; }
          .su-thumb{ flex:1 1 calc(50% - 8px); aspect-ratio:1/1; }
          .su-rail{ left:12px; }
        }
      `}</style>

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
              <div className="su-headline" style={{ color: slide.accent }}>
                <span>{slide.title}</span>
              </div>
              <p className="su-desc">{slide.desc}</p>
              <div className="su-thumbs">
                {slide.thumbs.map((t, ti) => (
                  <div key={`${t.label}-${ti}`} className="su-thumb">
                    {t.video && (
                      <HoverVideo src={t.video} />
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
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
