"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Asset {
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  url: string;
  category: "logo" | "photo" | "pdf";
}

const assetsList: Asset[] = [
  {
    title: "Official Vector Logo (SVG)",
    description: "Ideal for scalable print designs, banners, and high-res digital use.",
    fileName: "7th_heaven_logo.svg",
    fileSize: "12 KB",
    url: "/images/logo.svg",
    category: "logo",
  },
  {
    title: "Official High-Res Logo (JPG)",
    description: "Standard raster logo for web programs, flyers, and digital calendars.",
    fileName: "7thheavenlogo.jpg",
    fileSize: "8.2 KB",
    url: "/images/7thheavenlogo.jpg",
    category: "logo",
  },
  {
    title: "Full Band Live Action Shot",
    description: "High-resolution action photo of the band performing live on stage.",
    fileName: "band-performance.png",
    fileSize: "932 KB",
    url: "/images/band-performance.png",
    category: "photo",
  },
  {
    title: "Official Promo Banner (Wide)",
    description: "Wide header image suitable for banners, ticket pages, and website embeds.",
    fileName: "hero-banner.png",
    fileSize: "887 KB",
    url: "/images/hero-banner.png",
    category: "photo",
  },
  {
    title: "7th Heaven Cruise Promotional Artwork",
    description: "Official promotional cover art for cruises, travel agents, and group tours.",
    fileName: "cruise-hero.png",
    fileSize: "938 KB",
    url: "/images/cruise-hero.png",
    category: "photo",
  },
  {
    title: "Stage Plot & Input List (PDF)",
    description: "Detailed input grid, microphone assignments, and monitor placement plot.",
    fileName: "7th_heaven_stage_plot_2026.pdf",
    fileSize: "1.4 MB",
    url: "#",
    category: "pdf",
  },
  {
    title: "Technical & Hospitality Rider (PDF)",
    description: "Venue guidelines, sound/lighting requirements, and green room options.",
    fileName: "7th_heaven_tech_rider_2026.pdf",
    fileSize: "2.1 MB",
    url: "#",
    category: "pdf",
  },
];

const shortBio = `7th heaven is an experience you just have to see and hear! Having charted #1 on the Midwest Billboard Charts three times, they are one of the most successful independent rock bands in the country. With 30 songs in 30 minutes, high-energy live shows, and iconic anthems, 7th heaven continues to sell out festivals, theaters, and clubs across the country. Over their 40-year history, they have opened for giants like Bon Jovi, Kid Rock, Def Leppard, and Journey.`;

const mediumBio = `7th heaven is an experience you just have to see and hear! Formed in Chicago, this legendary group has reached #1 on the Midwest Billboard Charts three times and captured the hearts of rock fans nationwide. Known for their world-famous "30 Songs in 30 Minutes" medley, 7th heaven plays an ultra-high-energy set comprising massive radio hits and crowd-pleasing originals.

Over a career spanning 40 years, the band has performed thousands of shows, opening for major acts including Bon Jovi, Kid Rock, Def Leppard, Journey, Styx, and REO Speedwagon. Whether headlining packed summer festivals, booking exclusive cruises, or playing iconic music venues, 7th heaven delivers a premium, unforgettable rock concert experience for audiences of all ages.`;

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"all" | "logo" | "photo" | "pdf">("all");
  const [copiedBio, setCopiedBio] = useState<string | null>(null);

  const filteredAssets = activeTab === "all" ? assetsList : assetsList.filter(a => a.category === activeTab);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBio(type);
    setTimeout(() => setCopiedBio(null), 2000);
  };

  const handleSimulateDownload = (asset: Asset) => {
    if (asset.url === "#") {
      alert(`📥 Simulating download for "${asset.fileName}" (${asset.fileSize}).\nIn production, this links to the actual uploaded PDF document.`);
    } else {
      // Direct file download trigger
      const link = document.createElement("a");
      link.href = asset.url;
      link.setAttribute("download", asset.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <section className="py-32 bg-[var(--color-bg-deep)] min-h-screen text-white relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="site-container relative z-10">
        {/* Breadcrumb / Nav */}
        <div className="mb-8">
          <Link href="/" className="text-xs font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1.5 w-fit">
            ← Back to Home
          </Link>
        </div>

        {/* Title & Header */}
        <div className="max-w-3xl mb-16 text-left">
          <span className="inline-block text-sm font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)] bg-purple-500/5">
            Electronic Press Kit (EPK)
          </span>
          <h1 className="text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-tight tracking-tight text-white uppercase italic">
            Media & <span className="gradient-text">Marketing Assets</span>
          </h1>
          <p className="text-white/45 mt-4 text-base md:text-lg leading-relaxed">
            Welcome to the official 7th Heaven promotional resource center. Download high-resolution band logos, official press photography, tech riders, and stage plots for promoters, booking agents, and press outlets.
          </p>
        </div>

        {/* ── SECTION 1: Bio & Copywriting ── */}
        <div className="mb-20 bg-[var(--color-bg-surface)]/60 border border-white/5 p-6 md:p-8 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <span className="text-xl">✍️</span>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide">Official Band Bios</h2>
              <p className="text-2xs text-white/40 uppercase tracking-widest font-bold">Copy/paste ready promotional bios</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Short Bio */}
            <div className="bg-black/30 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)]">Short Bio (~100 words)</span>
                  <span className="text-[var(--font-size-3xs)] text-white/30 font-mono">102 words</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-medium text-left">
                  {shortBio}
                </p>
              </div>
              <button
                onClick={() => handleCopy(shortBio, "short")}
                className="mt-6 w-full py-2 bg-white/5 hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded transition-all cursor-pointer border border-white/10 hover:border-[var(--color-accent)]"
              >
                {copiedBio === "short" ? "✓ Copied to Clipboard!" : "📋 Copy Short Bio"}
              </button>
            </div>

            {/* Medium Bio */}
            <div className="bg-black/30 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)]">Medium Bio (~250 words)</span>
                  <span className="text-[var(--font-size-3xs)] text-white/30 font-mono">160 words</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-medium text-left whitespace-pre-line">
                  {mediumBio}
                </p>
              </div>
              <button
                onClick={() => handleCopy(mediumBio, "medium")}
                className="mt-6 w-full py-2 bg-white/5 hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded transition-all cursor-pointer border border-white/10 hover:border-[var(--color-accent)]"
              >
                {copiedBio === "medium" ? "✓ Copied to Clipboard!" : "📋 Copy Medium Bio"}
              </button>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Media Assets Downloads ── */}
        <div className="mb-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6 mb-8">
            <div className="flex items-center gap-3 text-left">
              <span className="text-xl">📥</span>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide">Downloadable Resources</h2>
                <p className="text-2xs text-white/40 uppercase tracking-widest font-bold">Logos, photos, and tech setup materials</p>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex bg-black rounded p-1 border border-white/10 overflow-x-auto max-w-full">
              {[
                { id: "all", label: "All Assets" },
                { id: "logo", label: "Logos" },
                { id: "photo", label: "Photos" },
                { id: "pdf", label: "Tech Files" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-2xs font-bold uppercase tracking-widest rounded transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout of Assets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset, i) => {
              const isPdf = asset.category === "pdf";
              const isLogo = asset.category === "logo";
              const isPhoto = asset.category === "photo";

              return (
                <div
                  key={i}
                  className="bg-[var(--color-bg-surface)]/40 border border-white/10 rounded-xl overflow-hidden shadow-xl hover:border-purple-500/40 transition-all group flex flex-col justify-between"
                >
                  {/* Thumbnail / Image Preview Header */}
                  <div className="aspect-[16/10] bg-black/40 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                    {isPhoto && (
                      <img src={asset.url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                    {isLogo && (
                      <div className="p-8 w-full h-full flex items-center justify-center bg-white/[0.02]">
                        <img src={asset.url} alt={asset.title} className="max-w-[70%] max-h-[70%] object-contain" />
                      </div>
                    )}
                    {isPdf && (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-950/20 to-black/80">
                        <span className="text-4xl mb-2 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.2)]">📄</span>
                        <span className="text-[var(--font-size-3xs)] font-black uppercase tracking-widest text-red-400 font-mono">TECHNICAL PDF DOCUMENT</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-black/80 border border-white/10 rounded px-2.5 py-0.5 text-[var(--font-size-5xs)] font-mono tracking-widest text-white/50 uppercase shadow">
                      {asset.fileSize}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="text-left mb-6">
                      <span className="text-[var(--font-size-4xs)] font-black uppercase tracking-widest text-[var(--color-accent)] leading-none mb-1 block">
                        {asset.category === "pdf" ? "Tech Doc" : asset.category}
                      </span>
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-tight leading-tight">
                        {asset.title}
                      </h4>
                      <p className="text-2xs text-white/40 mt-1 leading-relaxed">
                        {asset.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSimulateDownload(asset)}
                      className="w-full py-2.5 bg-white/5 hover:bg-[var(--color-accent)] text-white text-xs font-black uppercase tracking-widest rounded-lg border border-white/10 hover:border-[var(--color-accent)] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      Download {asset.category === "pdf" ? "PDF" : "Asset"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 3: Promoters Support / Booking ── */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-purple-950/20 to-fuchsia-950/10 border border-purple-500/25 flex flex-col md:flex-row items-center gap-8 justify-between text-left">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Looking to book 7th Heaven?</h3>
            <p className="text-xs text-white/50 leading-relaxed mt-2">
              For event inquiries, pricing schedules, routing dates, and specific stage/venue accommodations, head over to our Booking Planner portal. Registered event planners can schedule directly.
            </p>
          </div>
          <div className="flex gap-4 shrink-0 w-full md:w-auto">
            <Link href="/book" className="flex-1 md:flex-initial text-center px-6 py-3 bg-[var(--color-accent)] text-white text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(133,29,239,0.3)]">
              Book the Band
            </Link>
            <Link href="/planner" className="flex-1 md:flex-initial text-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all">
              Planner Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
