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
          },
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
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Full-bleed Hero Media Container */}
      <div className="relative flex h-screen w-full items-end overflow-hidden">
        <div
          ref={heroImageRef}
          className="absolute inset-0 h-full w-full transform-gpu"
        >
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
          className="site-container relative z-10 flex w-full flex-col justify-between gap-6 pb-16 sm:pb-24 md:flex-row md:items-end"
        >
          <div className="max-w-3xl space-y-2">
            {/* Giant Title matching Exo Ape Studio D */}
            <ExoTextReveal
              as="h1"
              className="text-6xl font-light sm:text-8xl md:text-9xl"
              duration={1.2}
              stagger={0.1}
            >
              Studio D
            </ExoTextReveal>
            <p className="sm:">Urban and Landscape Design</p>
          </div>

          <div className="pt-4 md:pt-0">
            <a
              href="https://7thheavenband.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group hover: inline-flex items-center gap-2 border-b border-white/60 pb-0.5 hover:border-purple-300 sm:text-base"
            >
              <span>Visit website</span>
              <ExternalLink className="h-4 w-4 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Case Study Details Section */}
      <section className="site-container space-y-16 py-24">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <div className="space-y-4 md:col-span-4">
            <span className="text-purple-400">Project Overview</span>
            <h2 className="text-3xl sm:text-4xl">
              Landscape Architecture & Design Universe
            </h2>
          </div>
          <div className="space-y-6 md:col-span-8">
            <p>
              Studio D is a visionary design concept bringing harmony between
              urban architecture and natural landscapes. Our work integrates
              interactive media, pop rock energy, and immersive visual
              storytelling.
            </p>
            <p>
              Every project is crafted with fluid transitions, rich atmospheric
              lighting, and responsive micro-animations that engage audiences
              across platforms.
            </p>
          </div>
        </div>

        {/* Seamless Next Case Study Page Transition Banner */}
        <div className="border-t border-white/10 pt-16 text-center">
          <TransitionLink
            href="/rock-and-roll-kids"
            className="group relative block transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-purple-950/60 p-10 hover:scale-[1.01] hover:border-purple-400/50 sm:p-16"
          >
            <span className="mb-3 block">Next Project</span>
            <h3 className="flex items-center justify-center gap-4 text-4xl font-black group-hover:text-purple-200 sm:text-6xl">
              Rock &apos;N&apos; Roll Kids{" "}
              <span className="text-purple-400 group-hover:translate-x-3">
                →
              </span>
            </h3>
          </TransitionLink>
        </div>
      </section>
    </div>
  );
}
