"use client";

import React from "react";
import dynamic from "next/dynamic";
import { GitBranch, FileCode, ExternalLink } from "lucide-react";

const UserFlowMap = dynamic(() => import("@/components/UserFlowMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[850px] rounded-3xl border border-purple-500/30 bg-[#050505] flex flex-col items-center justify-center gap-4 text-purple-300 animate-pulse">
      <GitBranch className="w-10 h-10 animate-spin text-purple-400" />
      <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/60">
        Loading Interactive User Flow Graph Engine...
      </span>
    </div>
  ),
});

export default function VisualSitemapClient() {
  return (
    <div className="min-h-screen text-white pt-24 pb-16 px-4 sm:px-8 lg:px-[42px] max-w-[1700px] mx-auto space-y-6">
      
      {/* Streamlined Header Bar */}
      <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-black/80 to-cyan-950/40 p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-purple-400" /> Octopus.do Interactive User Flow Map
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
            7th Heaven Architecture & Flow Engine
          </h1>
          <p className="text-white/60 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Directional user journey graph tracing root home entry, top header nav categories, authentication PIN emails, booking inquiries, and member dashboards.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
          >
            <FileCode className="w-4 h-4 text-purple-300" />
            <span>XML Sitemap</span>
            <ExternalLink className="w-3 h-3 text-white/50" />
          </a>
        </div>
      </div>

      {/* Main Graph Canvas */}
      <UserFlowMap />

    </div>
  );
}
