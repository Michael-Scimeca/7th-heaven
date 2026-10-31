"use client";

import React from "react";

export function BackgroundViewRenderer({ viewId }: { viewId: string }) {
  switch (viewId) {
    case "arena-concert":
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Fallback image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero/band-performance.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-150 blur-3xl saturate-150 opacity-65"
          />
          {/* Synchronized Concert Video Bleed */}
          <video
            src="/movie/loops/aint-that-just-beautiful-30s.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-150 blur-3xl saturate-150 opacity-75"
          />
          {/* Contrast scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85" />
          {/* 35mm Analog Film Noise */}
          <div className="absolute inset-0 bg-film-noise opacity-80 mix-blend-overlay" />
        </div>
      );

    case "jjettas-editorial":
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#0b0a0f]">
          {/* Upper JJettas Purple Atmosphere Glow */}
          <div className="absolute -top-[15vw] left-1/2 -translate-x-1/2 w-[120vw] h-[65vw] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(79,43,171,0.6)_0%,rgba(158,109,233,0.25)_40%,transparent_75%)] blur-3xl opacity-85" />
          {/* Secondary ambient warmth */}
          <div className="absolute top-[30vh] right-[5vw] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(238,172,26,0.12)_0%,transparent_65%)] blur-3xl opacity-60" />
          {/* Vignette darkening towards bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0a0f]/40 to-[#0b0a0f]" />
          {/* Film Grain */}
          <div className="absolute inset-0 bg-film-noise opacity-70 mix-blend-overlay" />
        </div>
      );

    case "fluid-aurora":
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#0a0514]">
          {/* Aurora Lobe 1 (Electric Violet) */}
          <div className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.45)_0%,transparent_65%)] blur-3xl animate-pulse duration-1000" />
          {/* Aurora Lobe 2 (Royal Indigo) */}
          <div className="absolute top-[20%] -right-[15%] w-[75vw] h-[75vw] rounded-full bg-[radial-gradient(circle,rgba(67,56,202,0.4)_0%,transparent_65%)] blur-3xl" />
          {/* Aurora Lobe 3 (Sunset Amber/Magenta) */}
          <div className="absolute top-[50%] left-[10%] w-[70vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.25)_0%,rgba(192,38,211,0.2)_45%,transparent_70%)] blur-3xl" />
          {/* Dark scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
          {/* Tactile Noise */}
          <div className="absolute inset-0 bg-film-noise opacity-65 mix-blend-overlay" />
        </div>
      );

    case "stadium-beams":
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#050508]">
          {/* Left Volumetric Light Cone */}
          <div
            className="absolute top-0 left-[15%] w-[40vw] h-[120vh] origin-top opacity-30 transform -rotate-12 blur-2xl pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(245, 158, 11, 0.45) 0%, rgba(147, 51, 234, 0.25) 50%, transparent 100%)",
            }}
          />
          {/* Right Volumetric Light Cone */}
          <div
            className="absolute top-0 right-[15%] w-[45vw] h-[120vh] origin-top opacity-30 transform rotate-12 blur-2xl pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(168, 85, 247, 0.5) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)",
            }}
          />
          {/* Ground Concert Stage Horizon Glow */}
          <div className="absolute bottom-0 inset-x-0 h-[40vh] bg-[radial-gradient(ellipse_at_bottom,rgba(238,172,26,0.2)_0%,rgba(124,58,237,0.15)_45%,transparent_80%)] blur-3xl" />
          {/* Stadium Haze Scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
          {/* Film Noise */}
          <div className="absolute inset-0 bg-film-noise opacity-85 mix-blend-overlay" />
        </div>
      );

    case "noir-gold":
    default:
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#060608]">
          {/* Delicate Champagne Gold Top Horizon Light */}
          <div className="absolute -top-[10vw] left-1/2 -translate-x-1/2 w-[85vw] h-[35vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(238,172,26,0.14)_0%,rgba(238,172,26,0.03)_50%,transparent_75%)] blur-3xl opacity-90" />
          {/* Subtle Deep Obsidian Floor */}
          <div className="absolute bottom-0 inset-x-0 h-[30vh] bg-gradient-to-t from-black to-transparent" />
          {/* Subtle Fine Stardust Noise */}
          <div className="absolute inset-0 bg-film-noise opacity-55 mix-blend-overlay" />
        </div>
      );
  }
}
