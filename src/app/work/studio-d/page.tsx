"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ExoTextReveal from "@/components/ExoTextReveal";
import TransitionLink from "@/components/TransitionLink";
import { ExternalLink } from "lucide-react";

const EXO_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";

export default function StudioDPage() {
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Hero Image / Video entrance scale down
      if (heroImageRef.current) {
        gsap.fromTo(
          heroImageRef.current,
          {
            scale: 1.2,
            opacity: 0,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 1.4,
            ease: EXO_EASE,
          }
        );
      }

      // 2. Hero Content reveal
      if (heroContentRef.current) {
        gsap.fromTo(
          heroContentRef.current,
          {
            y: 40,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            delay: 0.3,
            ease: EXO_EASE,
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen w-full text-white overflow-x-hidden">
      {/* Full-bleed Hero Media Container */}
      <div className="relative h-screen w-full overflow-hidden flex items-end">
        <div
          ref={heroImageRef}
          className="absolute inset-0 w-full h-full transform-gpu">
          <Image
            src="/images/hero-banner.png"
            alt="Studio D - Urban and Landscape Design"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-90"
          />
          {/* Subtle gradient vignette overlay */}
          <div className="absolute inset-0" />
        </div>

        {/* Hero Content Overlay (Positioned exactly like Exo Ape Studio D) */}
        <div
          ref={heroContentRef}
          className="relative z-10 w-full site-container pb-16 sm:pb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            {/* Giant Title matching Exo Ape Studio D */}
            <ExoTextReveal
              as="h1"
              className="text-6xl sm:text-8xl md:text-9xl font-light text-white leading-none font-sans"
              duration={1.2}
              stagger={0.1}>
              Studio D
            </ExoTextReveal>
            <p className="text-base sm:text-lg text-white/80 font-sans">
              Urban and Landscape Design
            </p>
          </div>

          <div className="pt-4 md:pt-0">
            <a
              href="https://7thheavenband.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm sm:text-base text-white hover:text-purple-300 transition-colors border-b border-white/60 hover:border-purple-300 pb-0.5">
              <span>Visit website</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Case Study Details Section */}
      <section className="site-container py-24 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-purple-400">
              Project Overview
            </span>
            <h2 className="text-3xl sm:text-4xl text-white">
              Landscape Architecture & Design Universe
            </h2>
          </div>
          <div className="md:col-span-8 space-y-6 text-lg text-white/80 font-sans">
            <p>
              Studio D is a visionary design concept bringing harmony between urban architecture and natural landscapes. Our work integrates interactive media, pop rock energy, and immersive visual storytelling.
            </p>
            <p>
              Every project is crafted with fluid transitions, rich atmospheric lighting, and responsive micro-animations that engage audiences across platforms.
            </p>
          </div>
        </div>

        {/* Seamless Next Case Study Page Transition Banner */}
        <div className="pt-16 border-t border-white/10 text-center">
          <TransitionLink
            href="/rock-and-roll-kids"
            className="group block relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-purple-950/60 border border-purple-500/20 p-10 sm:p-16 hover:border-purple-400/50 transition-all transform-gpu hover:scale-[1.01]">
            <span className="text-xs tracking-[0.3em] uppercase block mb-3">
              Next Project
            </span>
            <h3 className="text-4xl sm:text-6xl font-black text-white group-hover:text-purple-200 transition-colors flex items-center justify-center gap-4">
              Rock &apos;N&apos; Roll Kids <span className="text-purple-400 group-hover:translate-x-3 transition-transform duration-300">→</span>
            </h3>
          </TransitionLink>
        </div>
      </section>
    </div>
  );
}
