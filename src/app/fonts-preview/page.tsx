"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Sparkles, Type } from "lucide-react";

interface FontItem {
  name: string;
  family: string;
  source: "Google Fonts" | "Custom Web Font (Local)" | "Google Fonts / Local";
  stylesCount: string;
  classification: string;
  weightsAvailable: string;
  sampleHeadline: string;
  sampleSubtitle: string;
  sampleParagraph: string;
  cssFamily: string;
}

const FONTS: FontItem[] = [
  {
    name: "Anton",
    family: "'Anton', sans-serif",
    source: "Google Fonts",
    stylesCount: "1 style",
    classification: "Condensed Grotesque Display",
    weightsAvailable: "Regular (400)",
    sampleHeadline: "7TH HEAVEN ROCK BAND",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'Anton', sans-serif;",
  },
  {
    name: "Barlow",
    family: "'Barlow', sans-serif",
    source: "Google Fonts",
    stylesCount: "18 styles",
    classification: "Low-Contrast Grotesk Sans",
    weightsAvailable: "100 - 900 (Normal & Italic)",
    sampleHeadline: "7th Heaven Rock Band",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'Barlow', sans-serif;",
  },
  {
    name: "Bayon",
    family: "'Bayon', sans-serif",
    source: "Google Fonts",
    stylesCount: "1 style",
    classification: "Tall Display Sans",
    weightsAvailable: "Regular (400)",
    sampleHeadline: "7TH HEAVEN ROCK BAND",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'Bayon', sans-serif;",
  },
  {
    name: "Bonapite",
    family: "'Bonapite', sans-serif",
    source: "Custom Web Font (Local)",
    stylesCount: "2 styles",
    classification: "Handwritten Signature / Brush",
    weightsAvailable: "Regular / Italic",
    sampleHeadline: "7th Heaven Rock Band",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'Bonapite', sans-serif;",
  },
  {
    name: "Flavor Story",
    family: "'FlavorStory', cursive, sans-serif",
    source: "Custom Web Font (Local)",
    stylesCount: "1 style",
    classification: "Dry Brush Display Script",
    weightsAvailable: "Regular (400)",
    sampleHeadline: "7th Heaven Rock Band",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'FlavorStory', cursive, sans-serif;",
  },
  {
    name: "LT Lemon",
    family: "'LTLemon', cursive, sans-serif",
    source: "Custom Web Font (Local)",
    stylesCount: "1 style",
    classification: "Casual Marker / Handwritten Display",
    weightsAvailable: "Regular (400)",
    sampleHeadline: "7th Heaven Rock Band",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'LTLemon', cursive, sans-serif;",
  },
  {
    name: "Melange",
    family: "'Melange', sans-serif",
    source: "Custom Web Font (Local)",
    stylesCount: "18 styles",
    classification: "Modern Geometric Display Sans",
    weightsAvailable: "Thin - Black (Normal & Italic)",
    sampleHeadline: "7th Heaven Rock Band",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'Melange', sans-serif;",
  },
  {
    name: "New Amsterdam",
    family: "'NewAmsterdam', sans-serif",
    source: "Google Fonts / Local",
    stylesCount: "1 style",
    classification: "Tall Heavy Condensed Woodblock",
    weightsAvailable: "Regular (400)",
    sampleHeadline: "7TH HEAVEN ROCK BAND",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'NewAmsterdam', sans-serif;",
  },
  {
    name: "Kalam",
    family: "'Kalam', cursive, sans-serif",
    source: "Google Fonts",
    stylesCount: "3 styles",
    classification: "Handwritten Informal Marker Script",
    weightsAvailable: "Light (300), Regular (400), Bold (700)",
    sampleHeadline: "7TH HEAVEN ROCK BAND",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'Kalam', cursive, sans-serif;",
  },
  {
    name: "Penlike",
    family: "'Penlike', cursive, sans-serif",
    source: "Custom Web Font (Local)",
    stylesCount: "1 style",
    classification: "Handmade Organic Felt-Pen Script",
    weightsAvailable: "Regular (400)",
    sampleHeadline: "7th Heaven Rock Band",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'Penlike', cursive, sans-serif;",
  },
  {
    name: "Quisas",
    family: "'Quisas', cursive, sans-serif",
    source: "Custom Web Font (Local)",
    stylesCount: "1 style",
    classification: "Quirky Handmade Marker Script",
    weightsAvailable: "Regular (400)",
    sampleHeadline: "7TH HEAVEN ROCK BAND",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'Quisas', cursive, sans-serif;",
  },
  {
    name: "Switzer",
    family: "'Switzer', sans-serif",
    source: "Custom Web Font (Local)",
    stylesCount: "14 styles",
    classification: "Neo-Grotesque Variable Sans",
    weightsAvailable: "Thin - Black (Normal & Italic)",
    sampleHeadline: "7th Heaven Rock Band",
    sampleSubtitle: "Midwest's Premier High-Energy Festival Experience",
    sampleParagraph: "Chart-topping rock band from Chicago with 3 #1 Billboard hits and 7 major singles.",
    cssFamily: "font-family: 'Switzer', sans-serif;",
  },
];

export default function FontsPreviewPage() {
  const [customText, setCustomText] = useState("OFFICIAL MUSIC VIDEOS • 2025");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"badge-comparison" | "cards" | "media-comparison" | "grid">("badge-comparison");
  const [isUppercase, setIsUppercase] = useState(true);
  const [isBold, setIsBold] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<"normal" | "600" | "700" | "900">("700");

  const displayText = isUppercase ? customText.toUpperCase() : customText;
  const currentFontWeight = isBold ? selectedWeight : "normal";

  const copyCss = (css: string, idx: number) => {
    navigator.clipboard.writeText(css);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Google fonts link for Barlow, Bayon, Anton, New Amsterdam & Kalam */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow:ital,wght@0,300;0,400;0,600;0,700;0,900;1,400&family=Bayon&family=Kalam:wght@300;400;700&family=New+Amsterdam&display=swap"
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          @font-face {
            font-family: 'Bonapite';
            src: url('/fonts/Bonapite.ttf') format('truetype'),
                 url('/fonts/Bonapite.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'FlavorStory';
            src: url('/fonts/FlavorStory.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Penlike';
            src: url('/fonts/Penlike.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Melange';
            src: url('/fonts/Melange-Bold.otf') format('opentype');
            font-weight: bold;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'NewAmsterdam';
            src: url('/fonts/NewAmsterdam-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Quisas';
            src: url('/fonts/Quisas.woff2') format('woff2'),
                 url('/fonts/Quisas.woff') format('woff'),
                 url('/fonts/Quisas.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `
      }} />

      <main className="min-h-screen bg-[#130819] text-white pt-24 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div className="space-y-3">
              <Link
                href="/media"
                className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Media
              </Link>
              <h1 className="font-black tracking-tight text-white flex items-center gap-3">
                <Type className="w-9 h-9 text-[#f5b942]" />
                Web Safe Font Library
              </h1>
              <p className="text-zinc-300 text-base max-w-2xl">
                All 10 fonts from your collection rendered simultaneously on the web. Test live text, preview headlines, subtitles, and see how they look across media cards.
              </p>
            </div>

            {/* View Switcher */}
            <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-full">
              <button
                type="button"
                onClick={() => setActiveTab("badge-comparison")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "badge-comparison"
                    ? "bg-[#a855f7] text-white shadow-lg shadow-purple-900/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Exact Text Comparison (All 10 Fonts)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cards")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "cards"
                    ? "bg-[#a855f7] text-white shadow-lg shadow-purple-900/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Detailed Font Cards
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media-comparison")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "media-comparison"
                    ? "bg-[#a855f7] text-white shadow-lg shadow-purple-900/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Media Card Comparison
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("grid")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "grid"
                    ? "bg-[#a855f7] text-white shadow-lg shadow-purple-900/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Specimen Grid
              </button>
            </div>
          </div>

          {/* Interactive Live Text Tester */}
          <div className="bg-[#210e2a] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label htmlFor="custom-preview-input" className="text-xs font-mono uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f5b942]" />
                Live Text Tester & Weight Controls:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {/* BOLD TOGGLE */}
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg border transition-all ${
                    isBold
                      ? "bg-[#f5b942] text-black border-[#f5b942] shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-zinc-300 border-white/10 hover:border-amber-400/50 hover:text-white"
                  }`}
                >
                  BOLD: {isBold ? "ON" : "OFF"}
                </button>

                {/* WEIGHT SELECTOR (when bold is on) */}
                {isBold && (
                  <div className="flex items-center gap-1 bg-black/40 border border-amber-500/40 p-1 rounded-lg">
                    {(["600", "700", "900"] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                          selectedWeight === w
                            ? "bg-amber-400 text-black font-black"
                            : "text-amber-200 hover:text-white"
                        }`}
                      >
                        {w === "600" ? "SemiBold (600)" : w === "700" ? "Bold (700)" : "Black (900)"}
                      </button>
                    ))}
                  </div>
                )}

                {/* UPPERCASE TOGGLE */}
                <button
                  type="button"
                  onClick={() => setIsUppercase(!isUppercase)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                    isUppercase
                      ? "bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-sm"
                      : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                  }`}
                >
                  UPPERCASE: {isUppercase ? "ON" : "OFF"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomText("OFFICIAL MUSIC VIDEOS • 2025");
                    setIsUppercase(true);
                  }}
                  className="text-xs font-mono px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 transition-colors"
                >
                  Reset: OFFICIAL MUSIC VIDEOS • 2025
                </button>
              </div>
            </div>
            <input
              id="custom-preview-input"
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type anything to preview..."
              className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-3 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f5b942] transition-all font-sans"
            />
          </div>

          {/* TAB 0: EXACT TEXT COMPARISON (DARK PURPLE BACKGROUND MATCHING SCREENSHOT) */}
          {activeTab === "badge-comparison" && (
            <div className="space-y-4">
              <div className="bg-[#210e2a] border border-purple-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Direct Screenshot Comparison
                    {isBold && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-400 text-black font-black">
                        BOLD {selectedWeight} ACTIVE
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-zinc-300">
                    Showing your exact text <code className="text-amber-300 font-mono">&ldquo;{displayText}&rdquo;</code> across all 11 fonts with live weight &amp; bold controls.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                  <span>Weight: <strong className="text-amber-300">{currentFontWeight}</strong></span>
                  <span>•</span>
                  <span>Transform: <strong className="text-amber-300">{isUppercase ? "UPPERCASE" : "AS TYPED"}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FONTS.map((font, idx) => (
                  <div
                    key={font.name}
                    className="relative rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all shadow-xl flex flex-col justify-between overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #1b0a23 0%, #2b0e35 50%, #16081e 100%)",
                    }}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{font.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-purple-200">
                          {font.classification}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCss(`${font.cssFamily} font-weight: ${currentFontWeight};`, idx)}
                        className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedIndex === idx ? "Copied CSS" : "Copy CSS"}
                      </button>
                    </div>

                    {/* Exact Screenshot Render */}
                    <div className="py-4 px-2 space-y-4">
                      {/* Active rendering with user's selected weight */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase text-purple-300/70">
                            Current Mode ({currentFontWeight === "normal" ? "Regular" : `Bold ${currentFontWeight}`})
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: font.family,
                            fontWeight: currentFontWeight,
                          }}
                          className="text-xl sm:text-2xl text-purple-100 tracking-wide select-all"
                        >
                          {displayText}
                        </div>
                        <div
                          style={{
                            fontFamily: font.family,
                            fontWeight: currentFontWeight,
                          }}
                          className="text-xs sm:text-sm text-purple-300/80 tracking-widest mt-1.5 uppercase"
                        >
                          {displayText}
                        </div>
                      </div>

                      {/* Side-by-side Regular vs Bold comparison row inside each card */}
                      <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-left bg-black/20 p-2.5 rounded-xl">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                            Regular (400)
                          </span>
                          <div
                            style={{ fontFamily: font.family, fontWeight: "normal" }}
                            className="text-sm text-purple-200 truncate"
                          >
                            {displayText}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-300 block mb-1">
                            Bold (700)
                          </span>
                          <div
                            style={{ fontFamily: font.family, fontWeight: "bold" }}
                            className="text-sm text-amber-200 font-bold truncate"
                          >
                            {displayText}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-mono text-[10px] text-purple-300">{font.source}</span>
                      <code className="text-[10px] text-zinc-400 font-mono">{font.family}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: DETAILED FONT CARDS */}
          {activeTab === "cards" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {FONTS.map((font, idx) => (
                <div
                  key={font.name}
                  className="bg-[#1b0b23] border border-white/10 hover:border-purple-500/40 transition-all duration-300 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-white tracking-tight">{font.name}</h2>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/30">
                            {font.stylesCount}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {font.classification} • {font.source}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyCss(font.cssFamily, idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 transition-colors"
                        title="Copy CSS font-family"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span>CSS</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Interactive Live Sample */}
                    <div className="bg-black/30 rounded-xl p-5 border border-white/5 space-y-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                        Live Preview ({font.name})
                      </span>
                      <div
                        style={{ fontFamily: font.family }}
                        className="text-2xl sm:text-3xl text-white tracking-wide break-words leading-tight"
                      >
                        {displayText || "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"}
                      </div>
                    </div>

                    {/* Hierarchy Samples */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300">
                          Headline / Title Display
                        </span>
                        <div
                          style={{ fontFamily: font.family }}
                          className="text-xl sm:text-2xl text-[#f5b942] tracking-wide uppercase"
                        >
                          {font.sampleHeadline}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300">
                          Subtitle / Label
                        </span>
                        <div
                          style={{ fontFamily: font.family }}
                          className="text-base text-zinc-200 uppercase"
                        >
                          {font.sampleSubtitle}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300">
                          Body / Small Context
                        </span>
                        <p
                          style={{ fontFamily: font.family }}
                          className="text-sm text-zinc-400 leading-relaxed"
                        >
                          {font.sampleParagraph}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                    <span>Weights: {font.weightsAvailable}</span>
                    <code className="text-[11px] text-purple-300/80 font-mono">{font.family}</code>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MEDIA CARD COMPARISON */}
          {activeTab === "media-comparison" && (
            <div className="space-y-6">
              <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-6">
                <h2 className="font-bold text-white mb-2">Direct Media Card Comparison (Always Uppercase)</h2>
                <p className="text-sm text-zinc-300">
                  See how each font looks when applied directly as the video title and subtitle in the 7th Heaven Media Card component.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FONTS.map((font) => (
                  <div
                    key={font.name}
                    className="bg-[#1b0b23] border border-white/10 rounded-2xl p-5 space-y-4 relative group hover:border-purple-500/50 transition-all shadow-lg"
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f5b942] uppercase tracking-wider">
                        {font.name}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">{font.classification.split(" ")[0]}</span>
                    </div>

                    {/* Mock Media Video Card Thumbnail */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center group-hover:scale-[1.01] transition-transform">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      <div className="relative z-10 text-center px-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-2 border border-white/20">
                          <div className="w-0 h-0 border-y-6 border-y-transparent border-l-10 border-l-white ml-1" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300">
                          4K Live Performance
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white/80">
                        3:42
                      </div>
                    </div>

                    {/* Mock Content Using Font */}
                    <div className="space-y-1.5">
                      <div
                        style={{ fontFamily: font.family, fontWeight: currentFontWeight }}
                        className="text-lg font-bold text-white line-clamp-1 group-hover:text-[#f2efa3] transition-colors uppercase"
                      >
                        {displayText || "OFFICIAL MUSIC VIDEOS • 2025"}
                      </div>

                      <div
                        style={{ fontFamily: font.family, fontWeight: currentFontWeight }}
                        className="text-xs text-purple-300 line-clamp-1 uppercase tracking-wider"
                      >
                        {displayText || "OFFICIAL MUSIC VIDEOS • 2025"}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Font Family</span>
                      <code className="text-purple-300 font-mono text-[10px]">{font.family}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SPECIMEN GRID */}
          {activeTab === "grid" && (
            <div className="bg-[#1b0b23] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[11px] font-mono uppercase tracking-wider text-purple-300">
                      <th className="py-4 px-6">Font Name</th>
                      <th className="py-4 px-6">Classification</th>
                      <th className="py-4 px-6">Source</th>
                      <th className="py-4 px-6 min-w-[320px]">Specimen Rendering</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {FONTS.map((font, idx) => (
                      <tr key={font.name} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 px-6 font-bold text-white whitespace-nowrap">
                          {font.name}
                        </td>
                        <td className="py-5 px-6 text-zinc-400 whitespace-nowrap">
                          {font.classification}
                        </td>
                        <td className="py-5 px-6 text-purple-300 text-xs whitespace-nowrap font-mono">
                          {font.source}
                        </td>
                        <td className="py-5 px-6">
                          <div
                            style={{ fontFamily: font.family, fontWeight: currentFontWeight }}
                            className="text-2xl text-[#f2efa3] tracking-wide uppercase"
                          >
                            {displayText || "OFFICIAL MUSIC VIDEOS • 2025"}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => copyCss(font.cssFamily, idx)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            )}
                            <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
