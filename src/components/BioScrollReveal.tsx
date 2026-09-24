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

function BioScrollRevealComponent({
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
    <section
      ref={containerRef}
      className="site-container relative w-full px-6 py-20"
    >
      {/* Header */}
      <div className="mb-16 max-w-2xl">
        <span className="mb-2 flex items-center gap-2">{subtitle}</span>
        <h2 className="er md:text-6xl">{title}</h2>
      </div>

      <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
        {/* Left Column: Interactive Name List */}
        <div className="w-full space-y-12 py-8 md:space-y-20 lg:w-3/5">
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
                <div className="mb-2 flex items-baseline gap-4">
                  <span className="text-purple-400 opacity-60">
                    0{index + 1}
                  </span>
                  <span className="text-white/50 transition-colors group-hover:text-white">
                    {member.role}
                  </span>
                </div>

                <h3
                  className={`transition-all duration-300 md:text-7xl ${isActive ? "translate-x-2 scale-[1.02] drop-shadow-[0_0_30px_rgba(192,132,252,0.6)]" : "text-white/30 text-white/70 group-hover:text-white"}`}
                >
                  {member.name}
                </h3>

                {member.description && (
                  <p
                    className={`mt-3 max-w-lg transition-opacity duration-300 ${isActive ? "opacity-100" : "text-white/30 opacity-40"}`}
                  >
                    {member.description}
                  </p>
                )}

                {member.linkHref && (
                  <Link
                    href={member.linkHref}
                    onClick={(e) => e.stopPropagation()}
                    className={`mt-4 inline-flex items-center gap-2 transition-opacity hover:text-white ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
                  >
                    <span>View Full Bio</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Portrait Image Reveal Container */}
        <div className="z-20 w-full shrink-0 lg:sticky lg:top-28 lg:w-2/5">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-white/10 bg-purple-950/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            {members.map((member, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={member.id}
                  className={`absolute inset-0 h-full w-full transition-all duration-700 ease-out ${isActive ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-105 opacity-0"}`}
                >
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    width={800}
                    height={1000}
                    unoptimized
                    priority={index === 0}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-80" />

                  {/* Portrait Caption Overlay */}
                  <div className="absolute right-6 bottom-6 left-6">
                    <span className="rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 backdrop-blur-[45px]">
                      {member.role}
                    </span>
                    <h4 className="drop- mt-2">{member.name}</h4>
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

const BioScrollReveal = React.memo(BioScrollRevealComponent);
export default BioScrollReveal;
