"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FeatureCard } from "../data/featuresData";

export function DemoPreview({
  src,
  title,
  isPurple,
}: {
  src: string;
  title: string;
  isPurple: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded]);

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className={`group relative aspect-video w-full cursor-pointer overflow-hidden border-2 ${isPurple ? "border-[#851DEF]/30 hover:border-[#851DEF]/60 hover:shadow-[0_0_30px_rgba(255,10,61,0.15)]" : "border-white/10 hover:border-white/25 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image
          width={200}
          height={200}
          unoptimized
          src={src}
          alt={`${title} demo preview`}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-50" />
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-lg group-hover:scale-110 ${isPurple ? "bg-[var(--color-accent)]/80 shadow-[0_0_25px_rgba(255,10,61,0.5)] group-hover:bg-[var(--color-accent)] group-hover:shadow-[0_0_40px_rgba(255,10,61,0.7)]" : "bg-white/20 shadow-[0_0_25px_rgba(255,255,255,0.15)] group-hover:bg-white/30"}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Label */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span
            className={`rounded-lg border px-2.5 py-1 backdrop-blur-sm ${isPurple ? "border-[#851DEF]/50 bg-[var(--color-accent)]/30" : "border-white/10 bg-black/50"}`}
          >
            ▶ Live Preview
          </span>
        </div>
      </button>

      {/* Fullscreen Modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl md:p-8"
          onClick={() => setExpanded(false)}
        >
          <div className="relative w-full max-w-6xl">
            {/* Close Button */}
            <button
              onClick={() => setExpanded(false)}
              className="absolute -top-12 right-0 flex cursor-pointer items-center gap-2 hover:text-white"
            >
              Close <span>✕</span>
            </button>
            {/* Title */}
            <div className="mb-6">
              <h3 style={{ fontStyle: " " }}>
                {title} <span style={{ color: "#851DEF" }}>Demo</span>
              </h3>
            </div>
            {/* Image */}
            <div
              className={`overflow-hidden border-2 ${isPurple ? "border-[#851DEF]/40" : "border-white/10"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image
                width={200}
                height={200}
                unoptimized
                src={src}
                alt={`${title} demo`}
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function FeatureCardUI({ f }: { f: FeatureCard }) {
  const [expanded, setExpanded] = useState(false);
  const isPurple = !!f.highlight;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden border ${isPurple ? "border-[#851DEF]/25 bg-gradient-to-br from-[#851DEF]/8 via-black to-black hover:border-[#851DEF]/50" : "border-white/10 border-white/[0.07] bg-white/[0.02]"}`}
    >
      {/* accent top line */}
      <div
        className={`h-px w-full ${isPurple ? "bg-gradient-to-r from-[#851DEF]/70 via-[#c084fc]/40 to-transparent" : "bg-gradient-to-r from-white/10 to-transparent"}`}
      />

      <div className="flex flex-1 flex-col gap-5 p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-5xl">{f.icon}</span>
          {isPurple && (
            <span className="shrink-0 rounded-lg border border-[#851DEF]/30 bg-[var(--color-accent)]/20 px-3 py-1 text-[#c084fc]">
              ✦ Flagship
            </span>
          )}
        </div>

        {/* Titles */}
        <div>
          <h3 className="mb-1.5" style={{ fontStyle: " " }}>
            {f.title}
          </h3>
          <p className={` ${isPurple ? "text-[#c084fc]" : "text-white/40"}`}>
            {f.tagline}
          </p>
        </div>

        {/* Demo Preview */}
        {f.demo && (
          <DemoPreview src={f.demo} title={f.title} isPurple={isPurple} />
        )}

        {/* Description */}
        <p>{f.description}</p>

        {/* Why it matters */}
        <div
          className={`rounded-lg border p-4 text-base ${isPurple ? "border-[#851DEF]/20 bg-[var(--color-accent)]/10 text-[#c084fc]/80" : "border-white/[0.07] bg-white/[0.03] text-white/40"}`}
        >
          <span className="mb-1.5 block text-white/50">Why it matters</span>
          {f.whyItMatters}
        </div>

        {/* Bullets */}
        <div>
          <p className="mb-3">What it does</p>
          <ul className="space-y-2">
            {f.bullets.map((b) => (
              <li
                key={`bullet-${b.slice(0, 20)}`}
                className="flex items-start gap-2.5"
              >
                <span
                  className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-lg ${isPurple ? "bg-[var(--color-accent)]" : "bg-white/25"}`}
                />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* How It Works — expandable */}
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`flex cursor-pointer items-center gap-2 text-base ${isPurple ? "text-[var(--color-accent-soft)] hover:text-white" : "text-white/30 hover:text-white"}`}
          >
            <span className={`${expanded ? "rotate-90" : "rotate-0"}`}>▶</span>
            How It Works
          </button>
          {expanded && (
            <div className="mt-3 space-y-2.5">
              {Array.from(f.howItWorks, (h, i) => ({ h, i })).map(
                ({ h, i }) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-base text-white/40"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg ${isPurple ? "bg-[var(--color-accent)]/20 text-[#c084fc]" : "bg-[#00000029] text-white/30"}`}
                    >
                      {i + 1}
                    </span>
                    {h}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {f.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-lg border px-3 py-1 text-base ${isPurple ? "border-[#851DEF]/25 bg-[var(--color-accent)]/10 text-[#c084fc]" : "border-white/10 bg-[#00000029] text-white/40"}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer link */}
      {f.link && (
        <Link
          href={f.link}
          className={`flex items-center justify-between border-t px-6 py-4 text-base ${isPurple ? "border-[#851DEF]/15 text-[var(--color-accent-soft)] hover:bg-[var(--color-accent)]/10 hover:text-white" : "border-white/10 bg-[#00000029] hover:text-white"}`}
        >
          Explore live →
        </Link>
      )}
    </div>
  );
}
