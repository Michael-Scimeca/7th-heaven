"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Eye, ArrowRight, LayoutTemplate } from "lucide-react";
import VretailHero from "./VretailHero";
import VretailMarquee from "./VretailMarquee";
import VretailTourSection from "./VretailTourSection";
import VretailMedleySection from "./VretailMedleySection";
import VretailBookingSection from "./VretailBookingSection";

interface VretailHomeClientProps {
  defaultTheme?: "lilac" | "indigo";
  initialShows?: Array<{
    id: string;
    day?: string;
    date: string;
    venue: string;
    city: string;
    state: string;
    time?: string;
    startDate?: string;
    websiteUrl?: string;
    mapUrl?: string;
    info?: string;
  }>;
}

export default function VretailHomeClient({ defaultTheme = "lilac", initialShows }: VretailHomeClientProps) {
  const [theme, setTheme] = useState<"lilac" | "indigo">(defaultTheme);
  const [showNotificationBar, setShowNotificationBar] = useState(true);

  const isLilac = theme === "lilac";

  useEffect(() => {
    if (isLilac) {
      document.documentElement.classList.add("theme-lilac");
      document.body.classList.add("theme-lilac");
    } else {
      document.documentElement.classList.remove("theme-lilac");
      document.body.classList.remove("theme-lilac");
    }
    return () => {
      document.documentElement.classList.remove("theme-lilac");
      document.body.classList.remove("theme-lilac");
    };
  }, [isLilac]);

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-500 ${
        isLilac
          ? "text-black selection:bg-[#5500ff] selection:text-white"
          : "bg-[#0a0618] text-white selection:bg-purple-500 selection:text-white"
      }`}
    >
      {/* Background Gradient Canvas */}
      <div
        id="vretail-ambient-canvas"
        className="pointer-events-none fixed inset-0 -z-10"
      />

      {/* Floating Theme Switcher & Concept Banner */}
      {showNotificationBar && (
        <aside
          aria-label="Theme mode switcher and concept banner"
          className={`relative z-30 w-full border-b px-4 py-2.5 text-xs backdrop-blur-md transition-colors ${
            isLilac
              ? "bg-white/40 border-[#4a2e8c]/10 text-[#2b2456]"
              : "bg-gradient-to-r from-purple-950/90 via-[#1e1346] to-indigo-950/90 border-purple-500/30 text-purple-200"
          }`}
        >
          <div className="site-container max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full animate-pulse ${isLilac ? "bg-[#5500ff]" : "bg-emerald-400"}`} />
              <div className="font-extrabold uppercase tracking-wide">
                {isLilac ? "🌸 Electric Lilac Theme Active" : "🌙 Twilight Indigo Theme Active"}
              </div>
              <div className="hidden md:inline opacity-80">
                — {isLilac ? "Soft Pastel Lavender Canvas with High-Voltage Violet & Jet Black Typography" : "Deep Velvet Twilight with Glowing Violet Accents"}
              </div>
            </div>

            {/* Quick Toggle Controls */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center p-0.5 rounded-full border ${isLilac ? "bg-black/5 border-black/10" : "bg-white/10 border-white/10"}`}>
                <button
                  type="button"
                  onClick={() => setTheme("lilac")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isLilac
                      ? "bg-white/80 backdrop-blur-sm text-black shadow-sm"
                      : "text-purple-300 hover:text-white"
                  }`}
                >
                  🌸 Lilac
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("indigo")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    !isLilac
                      ? "bg-[#5500ff] text-white shadow-sm"
                      : "text-[#4a2e8c] hover:text-black"
                  }`}
                >
                  🌙 Indigo
                </button>
              </div>

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1 font-semibold hover:underline underline-offset-2 ml-2"
              >
                <Eye className="w-3.5 h-3.5" />
                Classic
              </Link>

              <button
                type="button"
                onClick={() => setShowNotificationBar(false)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  isLilac ? "bg-black/10 hover:bg-black/15 text-black" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                aria-label="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Hero Section */}
      <VretailHero theme={theme} />

      {/* Live Tour Schedule Cards */}
      <VretailTourSection initialShows={initialShows} theme={theme} />

      {/* 30 in 30 Signature Medley Showcase */}
      <VretailMedleySection theme={theme} />

      {/* Turnkey Booking & Private Events Conversion Section */}
      <VretailBookingSection theme={theme} />

      {/* Partner & Stage Sharing Marquee Strip (Who We've Played With & Where We've Been Featured) */}
      <VretailMarquee theme={theme} />

      {/* Floating Quick Action Dock */}
      <div
        className={`fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2 p-1.5 rounded-full shadow-2xl backdrop-blur-xl border ${
          isLilac
            ? "bg-white/90 border-[#4a2e8c]/20 shadow-[0_10px_35px_rgba(85,0,255,0.18)]"
            : "bg-[#120b2e]/90 border-purple-400/40"
        }`}
      >
        <button
          type="button"
          onClick={() => setTheme(isLilac ? "indigo" : "lilac")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            isLilac
              ? "bg-[#5500ff]/10 text-[#5500ff] hover:bg-[#5500ff]/20"
              : "bg-purple-600/30 text-purple-200 hover:text-white"
          }`}
        >
          {isLilac ? "🌙 Switch to Indigo" : "🌸 Switch to Lilac"}
        </button>
        <Link
          href="/shows"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all ${
            isLilac
              ? "bg-[#5500ff] hover:bg-[#4800e0]"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Tour 2026
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>

    </div>
  );
}
