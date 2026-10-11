import React from "react";
import Link from "next/link";

export const metadata = {
  title: "WebGL Noise Dissolve Page Transition Test | 7th Heaven",
  description:
    "Test harness for Codrops WebGL noise dissolve page transitions inspired by page-transitions-astro-barba-gsap.crnacura.workers.dev/about/",
};

export default function WebGLTransitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-transparent text-white flex flex-col font-sans">
        {/* Navigation header for test harness */}
        <header
          data-scrub-target="header"
          className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/30 backdrop-blur-md text-white transition-opacity"
        >
          <div className="site-container flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-purple-400 shadow-xs shadow-purple-400/50" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider uppercase text-zinc-200">
                  WebGL Noise Dissolve
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Codrops About Transition Test Suite
                </span>
              </div>
            </div>

            <nav aria-label="Transition Test Navigation" className="flex items-center gap-2">
              <Link
                href="/transition-test/page-a"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition"
              >
                Page A (Band Showcase)
              </Link>
              <span className="text-zinc-600">&bull;</span>
              <Link
                href="/transition-test/page-b"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition"
              >
                Page B (Concert Experience)
              </Link>
              <span className="text-zinc-600 hidden sm:inline">&bull;</span>
              <a
                href="https://page-transitions-astro-barba-gsap.crnacura.workers.dev/about/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 px-2.5 py-1 text-[11px] font-medium text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-900/50 transition shadow-xs"
              >
                <span>Reference Demo</span>
                <svg
                  className="w-3 h-3 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <div
          id="transition-test-content"
          className="flex-1 w-full flex flex-col bg-transparent"
        >
          {children}
        </div>
      </div>
  );
}
