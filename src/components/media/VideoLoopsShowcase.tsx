"use client";

import React, { useState } from "react";
import {
  Film,
  X,
  Check,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
} from "lucide-react";
import { VIDEO_LOOP_PRESETS, type VideoLoopPreset } from "../GlobalVideoBackdrop";

interface VideoLoopsShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
  activeVideoSrc: string;
  onSelectVideo: (videoSrc: string) => void;
}

export default function VideoLoopsShowcase({
  isOpen,
  onClose,
  activeVideoSrc,
  onSelectVideo,
}: VideoLoopsShowcaseProps) {
  const [previewMode, setPreviewMode] = useState<"backdrop" | "sharp">("backdrop");

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-loops-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl rounded-[28px] bg-zinc-950/95 border border-white/15 shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 text-white my-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2
                id="video-loops-title"
                className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2"
              >
                6-Second Bandwidth-Saver Video Loops (30s In)
              </h2>
              <p className="text-xs text-zinc-400">
                Extracted exactly at 0:30 into 6-second lightweight loops. Running under the active :root backdrop config.
              </p>
            </div>
          </div>

          {/* Controls: Mode Switcher & Close */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center p-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode("backdrop")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  previewMode === "backdrop"
                    ? "bg-purple-500 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Atmospheric Backdrop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("sharp")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  previewMode === "sharp"
                    ? "bg-purple-500 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sharp Video Raw
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Video Showcase"
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current CSS Specification Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs font-mono">
          <div className="flex items-center gap-2 text-purple-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Active :root Setup:</strong> 25% Darkness • #0b0414 Obsidian • to-top Gradient • 64px Blur • 10% Opacity • 159% Saturation
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">Bandwidth: ~2MB per loop vs 27MB original</span>
        </div>

        {/* 5 Video Loop Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {VIDEO_LOOP_PRESETS.map((preset, index) => {
            const isSelected = activeVideoSrc === preset.videoSrc;

            return (
              <div
                key={preset.id}
                className={`relative rounded-[22px] overflow-hidden border p-4 flex flex-col justify-between gap-3 transition-all ${
                  isSelected
                    ? "border-amber-400/60 bg-white/[0.07] shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-300">
                    Video #{index + 1}
                  </span>
                  <span className="font-mono text-[10px] text-amber-300 font-extrabold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    {preset.size}
                  </span>
                </div>

                {/* Video Container */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner group">
                  {/* The 6-second video loop */}
                  <video
                    src={preset.videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      previewMode === "backdrop"
                        ? "scale-150 blur-3xl saturate-150 opacity-10"
                        : "scale-100 opacity-95"
                    }`}
                  />

                  {/* Gradient Scrim when in backdrop preview mode */}
                  {previewMode === "backdrop" && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0b0414]/90 via-[#0b0414]/50 to-[#0b0414]/70" />
                  )}

                  {/* Overlay Meta */}
                  <div className="absolute inset-x-2 bottom-2 flex items-center justify-between text-[10px] font-mono text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    <span className="flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      {preset.timeRange}
                    </span>
                    <span className="text-zinc-400">6.0s Loop</span>
                  </div>
                </div>

                {/* Title and metadata */}
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-extrabold text-sm text-white truncate">{preset.title}</h3>
                  <p className="text-xs text-zinc-400 truncate">{preset.sourceTrack}</p>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectVideo(preset.videoSrc);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Active Site Backdrop
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" />
                      Select as Active
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info & Done button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-zinc-400">
          <span>
            Extracting 6-second loops reduces video bandwidth by over <strong>92%</strong> while maintaining a continuous concert vibe.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
