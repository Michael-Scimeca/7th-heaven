"use client";

import React, { useState } from "react";
import {
  Music,
  Film,
  Camera,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

export const MEDIA_PAGE_LAYOUTS = [
  { id: 1, name: "1. Sticky Audio Top Bar + 50/50 Dual Stream Grid", category: "Sticky & Split" },
  { id: 2, name: "2. Fixed Bottom Audio Dock + Hero Video + Fan Mosaic", category: "Persistent Dock" },
  { id: 3, name: "3. Left Studio Sidebar (Audio) + Right 2-Col Video & Fan Feed", category: "Sidebar" },
  { id: 4, name: "4. Right Jukebox Rail + Main Stage Video Center", category: "Sidebar" },
  { id: 5, name: "5. Synchronized Side-by-Side Dual Stream (Band vs Fan)", category: "Dual Stream" },
  { id: 6, name: "6. Editorial 3-Column Magazine Spread (Audio | Video | Fan)", category: "Magazine" },
  { id: 7, name: "7. 2:1 Video Hero with Pinterest Fan Photo Stream", category: "Asymmetric" },
  { id: 8, name: "8. 1:2 Fan Wall Spotlight with Right Audio/Video Rail", category: "Asymmetric" },
  { id: 9, name: "9. Unified Chronological Live Tour Stream", category: "Interleaved" },
  { id: 10, name: "10. Alternating Zig-Zag Band & Fan Story Stream", category: "Interleaved" },
  { id: 11, name: "11. Spotlight Video Player + Full Audio Strip + Media Grid", category: "Spotlight" },
  { id: 12, name: "12. Modern Bento Box Dashboard Grid", category: "Dashboard" },
  { id: 13, name: "13. Top Audio Vault Hero + Persistent Tab Switcher", category: "Tabbed" },
  { id: 14, name: "14. Floating Slide-Out Soundboard Drawer + Clean Dual Grid", category: "Drawer" },
  { id: 15, name: "15. Collapsible Triple Accordion Master Console", category: "Accordion" },
  { id: 16, name: "16. Multi-Segmented Filter Pills (All / Music / Videos / Fans)", category: "Filtered" },
  { id: 17, name: "17. Concert Stage Portals (Stage Cam + Crowd Pit)", category: "Immersion" },
  { id: 18, name: "18. Broadcast Control Room 3-Channel Multiview", category: "Immersion" },
  { id: 19, name: "19. Triple Horizontal Reel Strip Carousels", category: "Horizontal" },
  { id: 20, name: "20. Scrolling Media Canvas with Auto Mini-Player", category: "Adaptive" },
];

interface MediaLayoutContainerProps {
  layoutId: number;
  audioPlayerNode: React.ReactNode;
  officialMediaNode: React.ReactNode;
  fanWallNode: React.ReactNode;
}

export default function MediaLayoutContainer({
  layoutId,
  audioPlayerNode,
  officialMediaNode,
  fanWallNode,
}: MediaLayoutContainerProps) {
  // Local state for interactive layouts like Accordion and Segmented Pills
  const [accordionOpen, setAccordionOpen] = useState<{
    audio: boolean;
    videos: boolean;
    fans: boolean;
  }>({
    audio: true,
    videos: true,
    fans: true,
  });

  const [activeSegment, setActiveSegment] = useState<"all" | "audio" | "videos" | "fans">("all");
  const [isAudioDrawerOpen, setIsAudioDrawerOpen] = useState(false);

  // -------------------------------------------------------------
  // LAYOUT 1: Full-Width Video Showcase + Fan Media Wall Below
  // -------------------------------------------------------------
  if (layoutId === 1) {
    return (
      <div className="w-full space-y-12 sm:space-y-16">
        <div className="sticky top-20 z-30 rounded-[var(--radius-box)] border border-nocturne-mauve/40 bg-black/90 p-3 sm:p-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 mb-2 px-2 text-xs font-mono uppercase text-[#f2efa3]">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Master Audio Deck // 700+ Song Audio Vault</span>
          </div>
          {audioPlayerNode}
        </div>
        <div className="w-full border-t border-white/10 pt-8">
          <div className="mb-6 flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
            <Film className="h-4 w-4 text-[#f2efa3]" />
            <span>Official Video Archive</span>
          </div>
          {officialMediaNode}
        </div>
        <div className="relative w-screen left-1/2 -translate-x-1/2 border-t border-white/10 pt-12 sm:pt-16">
          <div className="w-full">
            {fanWallNode}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 2: Top Audio Bar + Hero Video + Fan Mosaic
  // -------------------------------------------------------------
  if (layoutId === 2) {
    return (
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Top Audio Vault Bar */}
        {audioPlayerNode && (
          <div className="w-full">
            {audioPlayerNode}
          </div>
        )}
        <div>{officialMediaNode}</div>
        <div className="relative w-screen left-1/2 -translate-x-1/2 pt-10 sm:pt-12">
          <div className="w-full">
            {fanWallNode}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 3: Left Studio Sidebar (Audio) + Right 2-Col Video & Fan Feed
  // -------------------------------------------------------------
  if (layoutId === 3) {
    return (
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        <aside className="w-full lg:w-[380px] lg:sticky lg:top-24 shrink-0 rounded-[var(--radius-box)] border border-white/15 bg-black/50 p-4 sm:p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
            <Sliders className="h-5 w-5 text-[#f2efa3]" />
            <h3 className="font-heading text-lg uppercase text-white">Audio Discography</h3>
          </div>
          {audioPlayerNode}
        </aside>
        <main className="w-full min-w-0 flex-1 space-y-16">
          <div>{officialMediaNode}</div>
          <div className="border-t border-white/10 pt-12">{fanWallNode}</div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 4: Right Jukebox Rail + Main Stage Video Center
  // -------------------------------------------------------------
  if (layoutId === 4) {
    return (
      <div className="w-full flex flex-col lg:flex-row-reverse gap-8 lg:gap-12 items-start">
        <aside className="w-full lg:w-[380px] lg:sticky lg:top-24 shrink-0 rounded-[var(--radius-box)] border border-amber-500/20 bg-stone-950/80 p-4 sm:p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2 border-b border-amber-500/20 pb-3 text-amber-400">
            <Radio className="h-5 w-5" />
            <h3 className="font-heading text-lg uppercase">7th Heaven Jukebox</h3>
          </div>
          {audioPlayerNode}
        </aside>
        <main className="w-full min-w-0 flex-1 space-y-16">
          <div>{officialMediaNode}</div>
          <div className="border-t border-white/10 pt-12">{fanWallNode}</div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 5: Synchronized Side-by-Side Dual Stream (Band vs Fan)
  // -------------------------------------------------------------
  if (layoutId === 5) {
    return (
      <div className="w-full space-y-12">
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-4 sm:p-6">
          {audioPlayerNode}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-heading text-xl uppercase tracking-wider text-white">
                Stage Direct Feed
              </span>
              <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[11px] font-bold text-red-400 uppercase">
                Official
              </span>
            </div>
            {officialMediaNode}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-heading text-xl uppercase tracking-wider text-[#f2efa3]">
                Crowd Pit Feed
              </span>
              <span className="rounded-full bg-[#f2efa3]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#f2efa3] uppercase">
                Fan Wall
              </span>
            </div>
            {fanWallNode}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 6: Editorial 3-Column Magazine Spread (Audio | Video | Fan)
  // -------------------------------------------------------------
  if (layoutId === 6) {
    return (
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 lg:sticky lg:top-24 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="mb-3 text-xs font-mono uppercase text-[#f2efa3] tracking-wider">
            Col 01 // Audio Discography
          </div>
          {audioPlayerNode}
        </div>
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 text-xs font-mono uppercase text-white/60 tracking-wider">
            Col 02 // Official Video Archive
          </div>
          {officialMediaNode}
        </div>
        <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 text-xs font-mono uppercase text-white/60 tracking-wider">
            Col 03 // Fan Moments
          </div>
          {fanWallNode}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 7: 2:1 Video Hero with Pinterest Fan Photo Stream
  // -------------------------------------------------------------
  if (layoutId === 7) {
    return (
      <div className="w-full space-y-10">
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-4 sm:p-6">
          {audioPlayerNode}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-heading text-xl uppercase tracking-wider text-white">
              Official Media Reel
            </h3>
            {officialMediaNode}
          </div>
          <div className="lg:col-span-1 space-y-6 border-l border-white/10 pl-0 lg:pl-6">
            <h3 className="font-heading text-xl uppercase tracking-wider text-[#f2efa3]">
              Fan Photo Stream
            </h3>
            {fanWallNode}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 8: 1:2 Fan Wall Spotlight with Right Audio/Video Rail
  // -------------------------------------------------------------
  if (layoutId === 8) {
    return (
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-heading text-2xl uppercase tracking-wider text-[#f2efa3]">
              Fan Media Wall Spotlight
            </h2>
            <p className="text-xs text-white/60">Live fan snapshots and concert photos from across the US</p>
          </div>
          {fanWallNode}
        </div>
        <div className="lg:col-span-1 space-y-10 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-white/15 bg-black/50 p-4 backdrop-blur-md">
            <h3 className="font-heading text-base uppercase text-white mb-3">Audio Vault</h3>
            {audioPlayerNode}
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md">
            <h3 className="font-heading text-base uppercase text-white mb-3">Video Highlights</h3>
            {officialMediaNode}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 9: Unified Chronological Live Tour Stream
  // -------------------------------------------------------------
  if (layoutId === 9) {
    return (
      <div className="w-full space-y-12">
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-4 sm:p-6">
          <div className="mb-2 text-xs font-mono text-[#f2efa3] uppercase tracking-wider">
            Chronological Soundtrack Deck
          </div>
          {audioPlayerNode}
        </div>
        <div className="space-y-16">
          <div className="relative pl-6 border-l-2 border-[#f2efa3]/30 space-y-4">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-[#f2efa3] shadow-[0_0_12px_#f2efa3]" />
            <h3 className="font-heading text-2xl uppercase text-white">Part I: Official Band Performances</h3>
            {officialMediaNode}
          </div>
          <div className="relative pl-6 border-l-2 border-white/20 space-y-4">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white/40" />
            <h3 className="font-heading text-2xl uppercase text-[#f2efa3]">Part II: Live Crowd Encounters</h3>
            {fanWallNode}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 10: Alternating Zig-Zag Band & Fan Story Stream
  // -------------------------------------------------------------
  if (layoutId === 10) {
    return (
      <div className="w-full space-y-16">
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-4 sm:p-6">
          {audioPlayerNode}
        </div>
        <div className="space-y-16">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-black/60 to-black/20 p-6">
            <div className="mb-4 text-xs font-mono text-[#f2efa3] uppercase">CHAPTER 1 // BAND SPOTLIGHT</div>
            {officialMediaNode}
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-l from-[#f2efa3]/5 to-black/30 p-6">
            <div className="mb-4 text-xs font-mono text-white/60 uppercase">CHAPTER 2 // FAN PERSPECTIVE</div>
            {fanWallNode}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 11: Spotlight Video Player + Full Audio Strip + Media Grid
  // -------------------------------------------------------------
  if (layoutId === 11) {
    return (
      <div className="w-full space-y-10">
        <div className="rounded-2xl border border-white/15 bg-black/50 p-4 sm:p-6 shadow-2xl">
          <h3 className="font-heading text-lg uppercase text-white mb-4">Master Audio Strip</h3>
          {audioPlayerNode}
        </div>
        <div className="space-y-6">
          <h3 className="font-heading text-xl uppercase tracking-wider text-white">Official Video Showcase</h3>
          {officialMediaNode}
        </div>
        <div className="border-t border-white/10 pt-10 space-y-6">
          <h3 className="font-heading text-xl uppercase tracking-wider text-[#f2efa3]">Fan Media Wall</h3>
          {fanWallNode}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 12: Modern Bento Box Dashboard Grid
  // -------------------------------------------------------------
  if (layoutId === 12) {
    return (
      <div className="w-full space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-[var(--radius-box)] border border-white/15 bg-black/40 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#f2efa3] uppercase">
              <Music className="h-4 w-4" />
              <span>Audio Vault Deck</span>
            </div>
            {audioPlayerNode}
          </div>
          <div className="lg:col-span-1 rounded-[var(--radius-box)] border border-[#f2efa3]/20 bg-[#f2efa3]/5 p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#f2efa3] uppercase mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Fan Wall Highlights</span>
              </div>
              <p className="text-sm text-white/80">
                Over 300 live crowd photos captured by fans. Share your concert memory with #7thHeavenBand.
              </p>
            </div>
            <div className="pt-4 text-xs font-mono text-white/40">
              COMMUNITY CURATED // LIVE MOMENTS
            </div>
          </div>
        </div>
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/25 p-6 space-y-6">
          <div className="text-sm font-bold uppercase tracking-wider text-white">Video Vault</div>
          {officialMediaNode}
        </div>
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/25 p-6 space-y-6">
          <div className="text-sm font-bold uppercase tracking-wider text-[#f2efa3]">Fan Photo Mosaic</div>
          {fanWallNode}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 13: Top Audio Vault Hero + Persistent Tab Switcher
  // -------------------------------------------------------------
  if (layoutId === 13) {
    return (
      <div className="w-full space-y-8">
        <div className="rounded-[var(--radius-box)] border border-white/15 bg-black/60 p-4 sm:p-6 backdrop-blur-xl">
          <div className="mb-3 text-xs font-mono text-[#f2efa3] uppercase">
            MASTER AUDIO HERO // 700+ SONGS
          </div>
          {audioPlayerNode}
        </div>
        <div className="flex justify-center border-y border-white/10 py-4">
          <div className="inline-flex rounded-full border border-white/15 bg-black/50 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveSegment("videos")}
              className={`cursor-pointer rounded-full px-6 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                activeSegment === "videos" || activeSegment === "all"
                  ? "bg-[#f2efa3] text-black shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Official Videos
            </button>
            <button
              type="button"
              onClick={() => setActiveSegment("fans")}
              className={`cursor-pointer rounded-full px-6 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                activeSegment === "fans"
                  ? "bg-[#f2efa3] text-black shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Fan Media Wall
            </button>
          </div>
        </div>
        <div>
          {activeSegment !== "fans" && officialMediaNode}
          {activeSegment === "fans" && fanWallNode}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 14: Floating Slide-Out Soundboard Drawer + Clean Dual Grid
  // -------------------------------------------------------------
  if (layoutId === 14) {
    return (
      <div className="w-full space-y-12">
        <div className="flex items-center justify-between rounded-xl border border-white/15 bg-black/40 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2efa3] text-black">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase">Audio Vault Soundboard</p>
              <p className="text-xs text-white/50">Access 700+ songs in slide-out studio drawer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAudioDrawerOpen((prev) => !prev)}
            className="cursor-pointer rounded-full bg-[#f2efa3] px-5 py-2 text-xs font-bold text-black uppercase tracking-wider hover:bg-white transition-colors"
          >
            {isAudioDrawerOpen ? "Close Drawer ✕" : "Open Audio Drawer ▶"}
          </button>
        </div>

        {/* Slide-out drawer container */}
        {isAudioDrawerOpen && (
          <div className="rounded-[var(--radius-box)] border border-[#f2efa3]/30 bg-black/90 p-6 backdrop-blur-xl shadow-2xl media-section-enter">
            {audioPlayerNode}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="font-heading text-lg uppercase text-white mb-4">Official Video Vault</h3>
            {officialMediaNode}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="font-heading text-lg uppercase text-[#f2efa3] mb-4">Fan Media Wall</h3>
            {fanWallNode}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 15: Collapsible Triple Accordion Master Console
  // -------------------------------------------------------------
  if (layoutId === 15) {
    return (
      <div className="w-full space-y-6">
        {/* Accordion 1: Audio Vault */}
        <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => setAccordionOpen((p) => ({ ...p, audio: !p.audio }))}
            className="cursor-pointer w-full flex items-center justify-between p-5 text-left border-b border-white/10 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Music className="h-5 w-5 text-[#f2efa3]" />
              <span className="font-heading text-xl uppercase text-white">01 // 700+ Song Audio Vault</span>
            </div>
            {accordionOpen.audio ? <ChevronUp className="h-5 w-5 text-white/50" /> : <ChevronDown className="h-5 w-5 text-white/50" />}
          </button>
          {accordionOpen.audio && <div className="p-6 media-section-enter">{audioPlayerNode}</div>}
        </div>

        {/* Accordion 2: Official Videos */}
        <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => setAccordionOpen((p) => ({ ...p, videos: !p.videos }))}
            className="cursor-pointer w-full flex items-center justify-between p-5 text-left border-b border-white/10 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Film className="h-5 w-5 text-[#f2efa3]" />
              <span className="font-heading text-xl uppercase text-white">02 // Official Video Archive</span>
            </div>
            {accordionOpen.videos ? <ChevronUp className="h-5 w-5 text-white/50" /> : <ChevronDown className="h-5 w-5 text-white/50" />}
          </button>
          {accordionOpen.videos && <div className="p-6 media-section-enter">{officialMediaNode}</div>}
        </div>

        {/* Accordion 3: Fan Media Wall */}
        <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md overflow-hidden">
          <button
            type="button"
            onClick={() => setAccordionOpen((p) => ({ ...p, fans: !p.fans }))}
            className="cursor-pointer w-full flex items-center justify-between p-5 text-left border-b border-white/10 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-[#f2efa3]" />
              <span className="font-heading text-xl uppercase text-[#f2efa3]">03 // Fan Media Wall & Crowd Moments</span>
            </div>
            {accordionOpen.fans ? <ChevronUp className="h-5 w-5 text-white/50" /> : <ChevronDown className="h-5 w-5 text-white/50" />}
          </button>
          {accordionOpen.fans && <div className="p-6 media-section-enter">{fanWallNode}</div>}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 16: Multi-Segmented Filter Pills (All / Music / Videos / Fans)
  // -------------------------------------------------------------
  if (layoutId === 16) {
    return (
      <div className="w-full space-y-8">
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-6">
          {(["all", "audio", "videos", "fans"] as const).map((seg) => (
            <button
              key={seg}
              type="button"
              onClick={() => setActiveSegment(seg)}
              className={`cursor-pointer rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                activeSegment === seg
                  ? "bg-[#f2efa3] text-black shadow-[0_0_20px_rgba(242,239,163,0.4)]"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {seg === "all" && "All Media (All-in-One)"}
              {seg === "audio" && "MP3 Audio Vault"}
              {seg === "videos" && "Official Videos"}
              {seg === "fans" && "Fan Wall"}
            </button>
          ))}
        </div>
        <div className="space-y-12 media-section-enter">
          {(activeSegment === "all" || activeSegment === "audio") && (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">{audioPlayerNode}</div>
          )}
          {(activeSegment === "all" || activeSegment === "videos") && (
            <div className="space-y-4">{officialMediaNode}</div>
          )}
          {(activeSegment === "all" || activeSegment === "fans") && (
            <div className="border-t border-white/10 pt-8">{fanWallNode}</div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 17: Concert Stage Portals (Stage Cam + Crowd Pit)
  // -------------------------------------------------------------
  if (layoutId === 17) {
    return (
      <div className="w-full space-y-12">
        <div className="rounded-2xl border border-amber-500/20 bg-stone-950 p-6">
          <div className="mb-3 text-xs font-mono text-amber-400 uppercase tracking-widest">
            FOH SOUNDBOARD MIX // DIRECT CONCERT AUDIO
          </div>
          {audioPlayerNode}
        </div>
        <div className="space-y-8">
          <div className="border-l-4 border-amber-400 pl-4">
            <h2 className="font-heading text-2xl uppercase tracking-wider text-white">Stage Perspective [CAM 1]</h2>
            <p className="text-xs text-white/50">Pro-shot multi-camera footage and music videos</p>
          </div>
          {officialMediaNode}
        </div>
        <div className="border-t border-white/10 pt-10 space-y-8">
          <div className="border-l-4 border-[#f2efa3] pl-4">
            <h2 className="font-heading text-2xl uppercase tracking-wider text-[#f2efa3]">Crowd Perspective [CAM 2]</h2>
            <p className="text-xs text-white/50">Unfiltered fan concert energy from the front row</p>
          </div>
          {fanWallNode}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 18: Broadcast Control Room 3-Channel Multiview
  // -------------------------------------------------------------
  if (layoutId === 18) {
    return (
      <div className="w-full space-y-8">
        <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-400">
                LIVE BROADCAST MATRIX // CH-01 AUDIO BUS
              </span>
            </div>
            <span className="font-mono text-[10px] text-stone-500">SYNC: 48kHz / 24-BIT</span>
          </div>
          {audioPlayerNode}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5">
            <div className="mb-4 font-mono text-xs uppercase tracking-wider text-stone-300">
              CH-02: PROGRAM VIDEO STREAM
            </div>
            {officialMediaNode}
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5">
            <div className="mb-4 font-mono text-xs uppercase tracking-wider text-[#f2efa3]">
              CH-03: CROWD FAN CAM REEL
            </div>
            {fanWallNode}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 19: Triple Horizontal Reel Strip Carousels
  // -------------------------------------------------------------
  if (layoutId === 19) {
    return (
      <div className="w-full space-y-16">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h3 className="font-heading text-lg uppercase text-white mb-4">Reel 1: Discography Audio Strip</h3>
          {audioPlayerNode}
        </div>
        <div className="space-y-4">
          <h3 className="font-heading text-lg uppercase text-white">Reel 2: Video Reel</h3>
          {officialMediaNode}
        </div>
        <div className="space-y-4 border-t border-white/10 pt-10">
          <h3 className="font-heading text-lg uppercase text-[#f2efa3]">Reel 3: Fan Photo Stream</h3>
          {fanWallNode}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 20: Scrolling Media Canvas with Auto Mini-Player (Adaptive)
  // -------------------------------------------------------------
  return (
    <div className="w-full space-y-16">
      <div className="rounded-[var(--radius-box)] border border-white/15 bg-black/50 p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
        <div className="mb-2 text-xs font-mono text-[#f2efa3] uppercase tracking-wider">
          MASTER REEL PLAYER // SCROLL CANVAS ADAPTIVE
        </div>
        {audioPlayerNode}
      </div>
      <div>
        <h3 className="font-heading text-xl uppercase tracking-wider text-white mb-6">Official Video Catalog</h3>
        {officialMediaNode}
      </div>
      <div className="border-t border-white/10 pt-12">
        <h3 className="font-heading text-xl uppercase tracking-wider text-[#f2efa3] mb-6">Fan Moments Wall</h3>
        {fanWallNode}
      </div>
    </div>
  );
}
