"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Volume2, VolumeX, Play, Pause, Sparkles } from "lucide-react";

interface VretailHeroProps {
  theme?: "lilac" | "indigo";
  onExploreTour?: () => void;
}

export default function VretailHero({ theme = "lilac", onExploreTour }: VretailHeroProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const isLilac = theme === "lilac";

  return (
    <section
      id="vretail-hero"
      aria-labelledby="vretail-hero-heading"
      className="relative z-10 w-full pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden"
    >
      {/* Ambient Top Glow */}
      <div
        className="pointer-events-none absolute -top-40 right-1/4 w-[850px] h-[550px] rounded-full blur-[130px] -z-10"
        style={{
          "--tw-bg-opacity": "1",
          opacity: isLilac ? 0.35 : 0.45,
          background: isLilac
            ? "radial-gradient(ellipse at center, rgba(160, 110, 255, 0.4) 0%, rgba(200, 180, 255, 0.2) 50%, transparent 80%)"
            : "radial-gradient(ellipse at center, rgba(145, 65, 240, 0.5) 0%, rgba(85, 25, 170, 0.25) 50%, transparent 80%)",
        } as React.CSSProperties}
      />

      <div className="site-container w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: Headline, Story, Dual CTAs, Stats */}
        <div className="w-full flex flex-col items-start text-left mb-12">
          
          {/* Headline - Clean bold display (MANDATORY rule: no pill badges above) */}
          <h1
            id="vretail-hero-heading"
            className={`font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-6 ${
              isLilac ? "text-black" : "text-white"
            }`}
          >
            CHICAGO’S PREMIER LIVE ARENA ROCK EXPERIENCE
          </h1>

          {/* Supporting Copy */}
          <p
            className={`text-lg sm:text-xl font-normal leading-relaxed mb-8 max-w-2xl ${
              isLilac ? "text-[#2b2456]" : "text-indigo-200/80"
            }`}
          >
            Over 40 years of sold-out amphitheaters, #1 Billboard chart hits, and the world-famous
            &ldquo;30 Songs in 30 Minutes&rdquo; non-stop medley. Experience the Midwest&apos;s highest-energy
            concert powerhouse live on stage.
          </p>

          {/* Dual CTA Pills matching user screenshot */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
            {/* Primary: Electric Violet Pill */}
            <Link
              href="/shows"
              onClick={onExploreTour}
              className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-black text-base tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                isLilac
                  ? "bg-[#5500ff] hover:bg-[#4800e0] text-black shadow-[0_6px_25px_rgba(85,0,255,0.45)] hover:shadow-[0_8px_35px_rgba(85,0,255,0.65)]"
                  : "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_35px_rgba(168,85,247,0.45)] hover:shadow-[0_0_50px_rgba(168,85,247,0.7)]"
              }`}
            >
              EXPLORE 2026 TOUR
              <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isLilac ? "text-black" : "text-white"}`} />
            </Link>

            {/* Secondary: Jet Black Pill (with Pink/Purple Calendar Icon) */}
            <Link
              href="/book"
              className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base tracking-wide shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                isLilac
                  ? "bg-black hover:bg-neutral-900 text-white"
                  : "bg-white hover:bg-neutral-100 text-neutral-950"
              }`}
            >
              <Calendar className={`w-4 h-4 ${isLilac ? "text-[#c084fc]" : "text-purple-700"}`} />
              BOOK PRIVATE / VIP
            </Link>
          </div>

          {/* Social Proof & Trust Metrics Bar */}
          <div
            className={`w-full pt-8 border-t grid grid-cols-2 sm:grid-cols-4 gap-6 ${
              isLilac ? "border-[#4a2e8c]/20" : "border-purple-500/20"
            }`}
          >
            <div>
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${isLilac ? "text-black" : "text-white"}`}>
                5,000+
              </div>
              <div className={`text-xs uppercase tracking-wider font-bold mt-1 ${isLilac ? "text-[#5e5388]" : "text-purple-300/70"}`}>
                Concerts Played
              </div>
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${isLilac ? "text-black" : "text-white"}`}>
                100+
              </div>
              <div className={`text-xs uppercase tracking-wider font-bold mt-1 ${isLilac ? "text-[#5e5388]" : "text-purple-300/70"}`}>
                Fests Annually
              </div>
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${isLilac ? "text-black" : "text-white"}`}>
                #1
              </div>
              <div className={`text-xs uppercase tracking-wider font-bold mt-1 ${isLilac ? "text-[#5e5388]" : "text-purple-300/70"}`}>
                Billboard Hit
              </div>
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${isLilac ? "text-black" : "text-white"}`}>
                30 in 30
              </div>
              <div className={`text-xs uppercase tracking-wider font-bold mt-1 ${isLilac ? "text-[#5e5388]" : "text-purple-300/70"}`}>
                Rock Medley
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM SHOWCASE: 16:9 Floating Interactive Showcase Card */}
        <div className="w-full relative flex justify-center">
          
          {/* Glowing Backdrop Ring */}
          <div className="relative w-full max-w-4xl group">
            <div
              className="absolute -inset-1 rounded-3xl opacity-75 blur-xl group-hover:opacity-100 transition duration-700 -z-10"
              style={{
                background: isLilac
                  ? "linear-gradient(135deg, rgba(85, 0, 255, 0.3) 0%, rgba(192, 132, 252, 0.25) 100%)"
                  : "linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(99, 102, 241, 0.4) 50%, rgba(192, 132, 252, 0.2) 100%)",
              } as React.CSSProperties}
            />

            {/* Card Container */}
            <div
              className={`relative rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl ${
                isLilac
                  ? "border border-white/60 bg-white/50 shadow-[0_20px_50px_rgba(100,60,180,0.14)]"
                  : "border border-purple-400/30 bg-[#0e0826]/90"
              }`}
            >
                
                {/* 16:9 Video Canvas */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                  <video
                    ref={videoRef}
                    src="/movie/be-here-clip.mp4"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />

                  {/* Subtle Dark Gradient Overlay for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-neutral-950/30 pointer-events-none" />

                  {/* Top-Left Floating Badge: Live Status */}
                  <div
                    className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-lg backdrop-blur-md ${
                      isLilac
                        ? "bg-white/75 text-black border border-white/50"
                        : "bg-black/60 text-white border border-white/10"
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    Concert Stage Capture
                  </div>

                  {/* Top-Right Controls: Sound & Play Toggle */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSound}
                      aria-label={isMuted ? "Unmute concert video" : "Mute concert video"}
                      className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg active:scale-95 ${
                        isLilac
                          ? "bg-white/75 text-black hover:bg-white/90 border border-white/50"
                          : "bg-black/60 hover:bg-purple-600/80 text-white border border-white/10"
                      }`}
                    >
                      {isMuted ? (
                        <VolumeX className={`w-4 h-4 ${isLilac ? "text-[#5500ff]" : "text-purple-300"}`} />
                      ) : (
                        <Volume2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                      className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg active:scale-95 ${
                        isLilac
                          ? "bg-white/75 text-black hover:bg-white/90 border border-white/50"
                          : "bg-black/60 hover:bg-purple-600/80 text-white border border-white/10"
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Bottom Floating Info Pill */}
                  <div
                    className={`absolute bottom-4 left-4 right-4 z-20 p-3.5 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-2xl ${
                      isLilac
                        ? "bg-white/75 text-black border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                        : "bg-black/75 text-white border border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isLilac
                            ? "bg-[#5500ff]/15 text-[#5500ff] border border-[#5500ff]/20"
                            : "bg-purple-600/30 text-purple-300 border border-purple-400/30"
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs sm:text-sm font-black tracking-tight ${isLilac ? "text-black" : "text-white"}`}>
                          30 Songs in 30 Minutes
                        </div>
                        <div className={`text-[11px] font-medium ${isLilac ? "text-[#5e5388]" : "text-purple-300/80"}`}>
                          Signature Arena Rock Medley • Live
                        </div>
                      </div>
                    </div>

                    {/* Equalizer animation */}
                    <div className="flex items-end gap-1 h-5 px-2">
                      <span className={`w-1 rounded-full animate-bounce h-3 ${isLilac ? "bg-[#5500ff]" : "bg-purple-400"}`} />
                      <span className={`w-1 rounded-full animate-bounce [animation-delay:0.2s] h-5 ${isLilac ? "bg-[#7928ca]" : "bg-violet-300"}`} />
                      <span className={`w-1 rounded-full animate-bounce [animation-delay:0.4s] h-4 ${isLilac ? "bg-[#5500ff]" : "bg-indigo-400"}`} />
                      <span className={`w-1 rounded-full animate-bounce [animation-delay:0.1s] h-2 ${isLilac ? "bg-[#9b51e0]" : "bg-purple-300"}`} />
                    </div>
                  </div>

                </div>

                {/* Sub-Card Footer Ribbon */}
                <div
                  className={`px-5 py-3.5 flex items-center justify-between text-xs ${
                    isLilac
                      ? "bg-white/60 backdrop-blur-md border-t border-white/40"
                      : "bg-[#120b2e] border-t border-purple-500/15"
                  }`}
                >
                  <div className={`font-semibold flex items-center gap-1.5 ${isLilac ? "text-[#3b3260]" : "text-indigo-200/70"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Upcoming Tour Dates Live
                  </div>
                  <Link
                    href="/shows"
                    className={`font-bold flex items-center gap-1 group/link ${
                      isLilac ? "text-[#5500ff] hover:text-purple-800" : "text-purple-400 hover:text-purple-300"
                    }`}
                  >
                    View Schedule
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
