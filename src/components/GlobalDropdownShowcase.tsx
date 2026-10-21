"use client";

import React, { useState } from "react";
import ConnectedDateCapsule from "@/components/ConnectedDateCapsule";
import { Sparkles, Check, CheckCircle2, SlidersHorizontal } from "lucide-react";

/**
 * GlobalDropdownShowcase
 *
 * Exclusively presents the user-selected VisionOS Frosted Glass Connected Capsule:
 * A single continuous rounded-full container with Month & Year joined by a central hairline
 * divider, adaptive canvas frosted glass shader tint, and zero outer drop blur.
 */
export default function GlobalDropdownShowcase() {
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 9 = October
  const [selectedYear, setSelectedYear] = useState<number>(2027);

  return (
    <div className="flex flex-col gap-10">
      {/* Header bar */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <Check className="h-3.5 w-3.5" /> Selected Global Standard
            </span>
            <span className="text-xs text-white/50">VisionOS Frosted Glass Connected Capsule</span>
          </div>
          <h2 className="mt-2 font-black tracking-tight text-white">
            Connected Date Capsule
          </h2>
          <p className="mt-1 text-xs text-white/60 max-w-2xl leading-relaxed">
            A single continuous <code className="text-purple-300 font-mono">rounded-full</code> container joining Month &amp; Year with a central frosted hairline divider, adaptive canvas shader tint, and zero blurry drop glow (<code className="text-white/80 font-mono">shadow-none</code>).
          </p>
        </div>
      </div>

      {/* Featured Main Showcase Card */}
      <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-white/15 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
            <div>
              <span className="flex items-center gap-2 text-base font-bold text-white">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                VisionOS Frosted Glass Connected Capsule
              </span>
              <p className="text-xs text-purple-300/70 mt-0.5">
                Adaptive Shader Tint (<code className="text-purple-200 font-mono text-[11px]">from-purple-950/50 via-indigo-950/40 to-purple-900/50</code>)
              </p>
            </div>
            <span className="self-start sm:self-auto rounded-full border border-cyan-400/40 bg-cyan-500/25 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-cyan-200">
              Active Standard
            </span>
          </div>

          <p className="text-xs leading-relaxed text-white/70 max-w-3xl">
            The background canvas gradient physically shines through the semi-translucent purple-indigo frosted body, allowing the capsule to automatically adapt to any ambient page lighting or hero video.
          </p>

          {/* Interactive Live Interactive Demo Area */}
          <div className="rounded-2xl border border-white/10 bg-[#150a28]/60 p-8 backdrop-blur-md relative min-h-[360px] flex flex-col items-center justify-center">
            <div className="absolute top-4 left-6 flex items-center gap-2 text-[11px] text-white/40">
              <span className="uppercase tracking-wider font-semibold">Interactive Live Trigger:</span>
              <span>Click Month or Year to test dropdown</span>
            </div>

            {/* The Connected Date Capsule */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <ConnectedDateCapsule
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChange={({ month, year }) => {
                  setSelectedMonth(month);
                  setSelectedYear(year);
                }}
                size="md"
              />

              <span className="text-[11px] text-white/40 mt-2">
                Currently Selected: <strong className="text-white font-mono">{selectedMonth + 1} / {selectedYear}</strong>
              </span>
            </div>
          </div>

          {/* Size Variations */}
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
              Available Scale Variations:
            </span>
            <div className="flex flex-wrap items-center justify-around gap-6 py-2">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-white/40">Compact (size=&quot;sm&quot;)</span>
                <ConnectedDateCapsule
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onChange={({ month, year }) => {
                    setSelectedMonth(month);
                    setSelectedYear(year);
                  }}
                  size="sm"
                  idPrefix="demo-sm"
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-purple-300">Standard (size=&quot;md&quot;)</span>
                <ConnectedDateCapsule
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onChange={({ month, year }) => {
                    setSelectedMonth(month);
                    setSelectedYear(year);
                  }}
                  size="md"
                  idPrefix="demo-md"
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-white/40">Prominent (size=&quot;lg&quot;)</span>
                <ConnectedDateCapsule
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onChange={({ month, year }) => {
                    setSelectedMonth(month);
                    setSelectedYear(year);
                  }}
                  size="lg"
                  idPrefix="demo-lg"
                />
              </div>
            </div>
          </div>

          {/* Anatomy Tokens */}
          <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              Design Anatomy &amp; Tokens:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Container:</strong> <code className="text-purple-300 font-mono text-[10px]">bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-purple-900/50 backdrop-blur-2xl</code></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Specular Catch:</strong> <code className="text-purple-300 font-mono text-[10px]">shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]</code></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Frosted Divider:</strong> <code className="text-purple-300 font-mono text-[10px]">h-5 w-px bg-white/30</code></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Floating Menu:</strong> <code className="text-purple-300 font-mono text-[10px]">border-white/20 bg-purple-950/80 backdrop-blur-2xl rounded-2xl</code></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
