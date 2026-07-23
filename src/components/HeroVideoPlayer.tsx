"use client";

import { useState, useRef } from "react";
import type { ReactNode } from "react";
import VinylHeroPlayer from "@/components/VinylHeroPlayer";

const ALBUM_VIDEOS: Record<string, string> = {
  "be-here":         "/movie/Behere-hero.mp4",
  "color-in-motion": "/movie/hero-colorinmostion.mp4",
  "luminous":        "/movie/luminous.mp4",
  "next":            "/movie/next.mp4",
  "spectrum":        "/movie/spectrum.mp4",
};

const DEFAULT_VIDEO = "/movie/Behere-hero.mp4";

export default function HeroVideoPlayer({ children }: { children?: ReactNode }) {
  const [videoSrc, setVideoSrc] = useState(DEFAULT_VIDEO);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleAlbumChange = (albumId: string) => {
    const next = ALBUM_VIDEOS[albumId] ?? DEFAULT_VIDEO;
    if (next === videoSrc) return;
    setVideoSrc(next);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }, 0);
  };

  return (
    <>
      {/* ── Hero background video (self-hosted, full-bleed) ── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* ── Dark tint overlay over video ── */}
      <div className="absolute inset-0 z-[1] bg-[#0d0914]/70 pointer-events-none" />

      {/* ── Bottom content row: Live thumbs (left) + Vinyl player (right) ── */}
      <div className="relative z-[3] flex flex-col xl:flex-row items-end justify-between gap-6 mt-auto">
        {/* Bottom Left — server-rendered children (HeroLiveThumbs) */}
        <div className="relative z-30">
          {children}
        </div>

        {/* Vinyl MP3 Album Player */}
        <div className="w-full xl:w-auto flex justify-center xl:justify-end">
          <VinylHeroPlayer onAlbumChange={handleAlbumChange} />
        </div>
      </div>
    </>
  );
}
