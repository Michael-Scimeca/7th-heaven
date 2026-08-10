"use client";
/* oxlint-disable react-doctor/only-export-components */
/* eslint-disable react-doctor/only-export-components */

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sliders, Sparkles, X, RotateCcw } from "lucide-react";

export type TickerItem = {
  label?: string;
  sub?: string;
  icon?: "square" | "diamond" | "dot" | "seal";
  src?: string; // path to a logo image (public/... ), takes priority over text
  alt?: string;
};

export type LogoTickerConfig = {
  logoHeight: number;       // px (default 82)
  containerHeight: number;  // px (default 142)
  paddingX: number;         // px (default 70 => 140px gap)
  speedSec: number;         // sec (default 38)
  invert: boolean;          // boolean (default true)
};

const DEFAULT_TICKER_CONFIG: LogoTickerConfig = {
  logoHeight: 82,
  containerHeight: 142,
  paddingX: 70,
  speedSec: 38,
  invert: true,
};

// Artists 7th Heaven has shared stages with
export const ARTIST_LOGOS: TickerItem[] = [
  { src: "/images/press-logos/BonJovi.svg", alt: "Bon Jovi" },
  { src: "/images/press-logos/3DoorsDown.svg", alt: "3 Doors Down" },
  { src: "/images/press-logos/DefLeppard.svg", alt: "Def Leppard" },
  { src: "/images/press-logos/Journey.svg", alt: "Journey" },
  { src: "/images/press-logos/KidRock.svg", alt: "Kid Rock" },
  { src: "/images/press-logos/REOSpeedwagon.svg", alt: "REO Speedwagon" },
  { src: "/images/press-logos/Foreigner.svg", alt: "Foreigner" },
  { src: "/images/press-logos/Styx.svg", alt: "Styx" },
  { src: "/images/press-logos/TedNugent.svg", alt: "Ted Nugent" },
  { src: "/images/press-logos/RickSpringfield.svg", alt: "Rick Springfield" },
  { src: "/images/press-logos/Survivor.svg", alt: "Survivor" },
  { src: "/images/press-logos/JoanJettSignature.svg", alt: "Joan Jett" },
  { src: "/images/press-logos/JeffersonStarship.svg", alt: "Jefferson Starship" },
  { src: "/images/press-logos/Europe.svg", alt: "Europe" },
  { src: "/images/press-logos/TheFixx.svg", alt: "The Fixx" },
  { src: "/images/press-logos/Ratt.svg", alt: "Ratt" },
  { src: "/images/press-logos/WASP.svg", alt: "W.A.S.P." },
];

// Press, media & sports marks
export const PRESS_LOGOS: TickerItem[] = [
  { src: "/images/press-logos/Billboard.svg", alt: "Billboard" },
  { src: "/images/press-logos/MTV.svg", alt: "MTV" },
  { src: "/images/press-logos/NBC.svg", alt: "NBC" },
  { src: "/images/press-logos/NBCOlympics.svg", alt: "NBC Olympics" },
  { src: "/images/press-logos/ABC.svg", alt: "ABC" },
  { src: "/images/press-logos/CBS.svg", alt: "CBS" },
  { src: "/images/press-logos/Fox.svg", alt: "Fox" },
  { src: "/images/press-logos/WGN.svg", alt: "WGN" },
  { src: "/images/press-logos/Mancow.svg", alt: "Mancow" },
  { src: "/images/press-logos/JennyJonesShow.svg", alt: "The Jenny Jones Show" },
  { src: "/images/press-logos/GuitarEdge.svg", alt: "Guitar Edge" },
  { src: "/images/press-logos/ChicagoBulls.svg", alt: "Chicago Bulls" },
  { src: "/images/press-logos/ChicagoCubs.svg", alt: "Chicago Cubs" },
  { src: "/images/press-logos/LosAngelesLakers.svg", alt: "Los Angeles Lakers" },
];

const DEFAULT_ITEMS: TickerItem[] = [...ARTIST_LOGOS, ...PRESS_LOGOS];

function Icon({ kind }: { kind: NonNullable<TickerItem["icon"]> }) {
  if (kind === "square") return <span className="block h-4 w-4 bg-white" />;
  if (kind === "diamond")
    return <span className="block h-4 w-4 rotate-45 bg-white" />;
  if (kind === "dot") return <span className="block h-3 w-3 rounded-full bg-white" />;
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold leading-none text-white">
      ★
    </span>
  );
}

export default function LogoTicker({
  items = DEFAULT_ITEMS,
  speedSec: initialSpeedSec = 38,
  bgClassName = "bg-transparent",
  direction = "left",
  showControls = true,
}: {
  items?: TickerItem[];
  speedSec?: number;
  bgClassName?: string;
  direction?: "left" | "right";
  showControls?: boolean;
}) {
  // Live Config State with localStorage persistence & automatic migration to new screenshot preset
  const [config, setConfig] = useState<LogoTickerConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("smooothy_logo_ticker_config_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.logoHeight === "number") {
            // Update old small defaults to new saved screenshot settings if logo height was <= 40
            if (parsed.logoHeight <= 40) {
              return DEFAULT_TICKER_CONFIG;
            }
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to parse logo ticker config:", e);
      }
    }
    return DEFAULT_TICKER_CONFIG;
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("smooothy_logo_ticker_config_v1", JSON.stringify(config));
      } catch (e) {
        console.error("Failed to save logo ticker config:", e);
      }
    }
  }, [config]);

  // render the list 3x back-to-back so it fills the width immediately
  const track = [...items, ...items, ...items];
  const activeSpeed = config.speedSec || initialSpeedSec;

  return (
    <div className="relative w-full">
      <div
        className={`hoy-ticker relative w-full overflow-hidden py-2 ${bgClassName}`}
        style={{ ["--ticker-speed" as string]: `${activeSpeed}s` }}
      >
        <div
          className={`hoy-ticker-track flex w-max items-stretch${direction === "right" ? " hoy-ticker-reverse" : ""
            }`}
        >
          {track.map((item, i) =>
            item.src ? (
              <div
                key={item.src + "-" + i}
                className="flex shrink-0 items-center justify-center transition-[padding,height] duration-150"
                style={{
                  height: `${config.containerHeight}px`,
                  paddingLeft: `${config.paddingX}px`,
                  paddingRight: `${config.paddingX}px`,
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt ?? ""}
                  width={200}
                  height={config.logoHeight}
                  className={`w-auto object-contain transition-[height,filter] duration-150 ${
                    config.invert ? "hoy-ticker-logo" : ""
                  }`}
                  style={{ height: `${config.logoHeight}px`, width: "auto" }}
                  unoptimized
                />
              </div>
            ) : (
              <div
                key={(item.label || "item") + "-" + i}
                className="flex shrink-0 items-center gap-6 border-r border-white/20 px-10"
                style={{ height: `${config.containerHeight}px` }}
              >
                {item.icon && <Icon kind={item.icon} />}
                <div className="flex flex-col leading-tight">
                  <span className="whitespace-nowrap text-2xl font-black tracking-tight text-white">
                    {item.label}
                  </span>
                  {item.sub && (
                    <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-white/60">
                      {item.sub}
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        <style>{`
          .hoy-ticker-track {
            animation: hoy-ticker-scroll var(--ticker-speed, 40s) linear infinite;
          }
          .hoy-ticker-track.hoy-ticker-reverse {
            animation-direction: reverse;
          }
          .hoy-ticker-logo {
            filter: brightness(0) invert(1);
          }
          .hoy-ticker {
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
            mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          }
          @keyframes hoy-ticker-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-33.3333%); }
          }
        `}</style>
      </div>

      {/* 🏷️ Interactive Logo Size Studio Floating Drawer */}
      {showControls && direction === "left" && (
        <div className="fixed bottom-6 left-52 z-[200]">
          <button
            type="button"
            onClick={() => setIsStudioOpen(!isStudioOpen)}
            className="px-4 py-3 rounded-full bg-black/90 hover:bg-black backdrop-blur-2xl border border-purple-500/50 hover:border-purple-400 text-white text-xs font-mono font-extrabold tracking-wider flex items-center gap-2.5 shadow-[0_8px_32px_rgba(168,85,247,0.45)] transition-transform duration-200 transform hover:scale-105 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Logo Size Studio 🏷️</span>
          </button>

          {isStudioOpen && (
            <div
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute bottom-16 left-0 w-80 sm:w-96 max-h-[85vh] overflow-y-auto custom-scrollbar bg-black/95 backdrop-blur-2xl border border-purple-500/40 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-white text-xs space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h4 className="font-extrabold uppercase tracking-wider text-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400">
                    Logo Size Studio
                  </h4>
                </div>
                <button
                  type="button"
                  aria-label="Close Logo Size Studio"
                  onClick={() => setIsStudioOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-4 bg-purple-950/40 p-4 rounded-2xl border border-purple-500/30">
                {/* 1. Logo Height */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white/80">Logo Image Height</span>
                    <span className="font-mono text-purple-300 font-bold">{config.logoHeight}px</span>
                  </div>
                  <input
                    type="range"
                    aria-label="Logo Image Height"
                    min="16"
                    max="120"
                    step="1"
                    value={config.logoHeight}
                    onChange={(e) => setConfig((prev) => ({ ...prev, logoHeight: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* 2. Container Height */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white/80">Row Height</span>
                    <span className="font-mono text-purple-300 font-bold">{config.containerHeight}px</span>
                  </div>
                  <input
                    type="range"
                    aria-label="Row Height"
                    min="32"
                    max="160"
                    step="2"
                    value={config.containerHeight}
                    onChange={(e) => setConfig((prev) => ({ ...prev, containerHeight: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* 3. Horizontal Gap / Padding */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white/80">Logo Horizontal Gap</span>
                    <span className="font-mono text-purple-300 font-bold">{config.paddingX * 2}px</span>
                  </div>
                  <input
                    type="range"
                    aria-label="Logo Horizontal Gap"
                    min="8"
                    max="96"
                    step="2"
                    value={config.paddingX}
                    onChange={(e) => setConfig((prev) => ({ ...prev, paddingX: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* 4. Scroll Animation Speed */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white/80">Scroll Speed</span>
                    <span className="font-mono text-purple-300 font-bold">{config.speedSec}s</span>
                  </div>
                  <input
                    type="range"
                    aria-label="Scroll Speed"
                    min="10"
                    max="120"
                    step="2"
                    value={config.speedSec}
                    onChange={(e) => setConfig((prev) => ({ ...prev, speedSec: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* 5. Invert Colors Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-white/80 text-[11px]">White Logo Style (Invert)</span>
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, invert: !prev.invert }))}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase transition-all cursor-pointer ${
                      config.invert
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                        : "bg-white/10 text-white/50 border border-white/10"
                    }`}
                  >
                    {config.invert ? "White Enabled" : "Original Colors"}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-white/10 flex flex-col space-y-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    const codeStr = JSON.stringify(config, null, 2);
                    console.log("=== LOGO_TICKER_CONFIG ===", codeStr);
                    navigator.clipboard?.writeText(codeStr);
                    alert("Logo Ticker configuration copied to clipboard!");
                  }}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Copy Preset to Clipboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfig(DEFAULT_TICKER_CONFIG)}
                  className="flex items-center justify-center gap-1 font-mono text-purple-400 hover:text-white font-bold transition-colors cursor-pointer pt-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default Logo Sizes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

