"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface RevealMember {
  id: string;
  name: string;
  role: string;
  subtitle?: string;
  imageUrl: string;
  description?: string;
  linkHref?: string;
}

interface BioScrollRevealProps {
  title?: string;
  subtitle?: string;
  members: RevealMember[];
}

export default function BioScrollReveal({
  title = "BAND MEMBERS & DIRECTORS",
  subtitle = "SCROLL TO DISCOVER THE CREATIVE FORCE BEHIND 7TH HEAVEN",
  members,
}: BioScrollRevealProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || members.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      itemRefs.current.forEach((item, index) => {
        if (!item) return;

        ScrollTrigger.create({
          trigger: item,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 0.5,
          onToggle: (self) => {
            if (self.isActive) {
              setActiveIndex(index);
            }
          },
        });
      });
    }, containerRef);

    // Refresh triggers to ensure correct layout calculations
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [members]);

  const handleNameClick = (index: number) => {
    const el = itemRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section ref={containerRef} className="relative w-full py-20 px-6 site-container">
      {/* Header */}
      <div className="mb-16 max-w-2xl">
        <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-2 flex items-center gap-2">
          {subtitle}
        </span>
        <h2
          className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          {title}
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        {/* Left Column: Interactive Name List */}
        <div className="w-full lg:w-3/5 space-y-12 md:space-y-20 py-8">
          {members.map((member, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={member.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => handleNameClick(index)}
                className="group cursor-pointer transition-all duration-300 select-none"
              >
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-xs font-mono text-purple-400 font-bold tracking-widest opacity-60">
                    0{index + 1}
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
                    {member.role}
                  </span>
                </div>

                <h3
                  className={`text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight transition-all duration-300 ${isActive
                    ? "text-white scale-[1.02] translate-x-2 drop-shadow-[0_0_30px_rgba(192,132,252,0.6)]"
                    : "text-white/30 group-hover:text-white/70"
                    }`}
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {member.name}
                </h3>

                {member.description && (
                  <p
                    className={`mt-3 text-sm leading-relaxed max-w-lg transition-opacity duration-300 ${isActive ? "text-white/80 opacity-100" : "text-white/30 opacity-40"
                      }`}
                  >
                    {member.description}
                  </p>
                )}

                {member.linkHref && (
                  <Link
                    href={member.linkHref}
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] hover:underline transition-opacity ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                  >
                    <span>View Full Bio</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Portrait Image Reveal Container */}
        <div className="w-full lg:w-2/5 shrink-0 lg:sticky lg:top-28 z-20">
          <div className="relative aspect-[3/4] w-full rounded-lg  overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-purple-950/20">
            {members.map((member, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={member.id}
                  className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${isActive
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-105 pointer-events-none"
                    }`}
                >
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    width={800}
                    height={1000}
                    unoptimized
                    priority={index === 0}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-80" />

                  {/* Portrait Caption Overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)] bg-black/60 backdrop-blur-md px-2.5 py-1  rounded-lg  border border-white/10">
                      {member.role}
                    </span>
                    <h4 className="text-xl font-black uppercase tracking-tight text-white mt-2 drop-shadow-md">
                      {member.name}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
