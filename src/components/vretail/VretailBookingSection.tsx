"use client";

import Link from "next/link";
import { ArrowRight, Phone, CheckCircle2 } from "lucide-react";

interface VretailBookingSectionProps {
  theme?: "lilac" | "indigo";
}

export default function VretailBookingSection({ theme = "lilac" }: VretailBookingSectionProps) {
  const isLilac = theme === "lilac";

  return (
    <section
      id="booking"
      aria-labelledby="vretail-booking-heading"
      className="relative z-10 w-full py-16 lg:py-24"
    >
      <div className="site-container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Glow Box */}
        <div
          className={`relative rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden border text-center transition-all ${
            isLilac
              ? "bg-gradient-to-r from-[#1c053e] via-[#2a085b] to-[#150330] border-[#7928ca]/50 shadow-[0_20px_70px_rgba(85,0,255,0.22)]"
              : "bg-gradient-to-r from-purple-950 via-[#180f3e] to-indigo-950 border-purple-400/40 shadow-[0_0_100px_rgba(147,51,234,0.3)]"
          }`}
        >
          {/* Subtle Ambient Radial Lighting */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-50 -z-10"
            style={{
              background: isLilac
                ? "radial-gradient(circle, rgba(140, 50, 255, 0.7) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)",
            } as React.CSSProperties}
          />

          <div className="max-w-3xl mx-auto">
            <h2
              id="vretail-booking-heading"
              className="text-white font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-6"
            >
              BRING 7TH HEAVEN TO YOUR NEXT MAJOR EVENT
            </h2>

            <p className="text-purple-200/90 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Complete turnkey concert production. Arena-grade sound reinforcement, state-of-the-art
              moving light show, and 40 years of festival-headlining expertise. Available for select 2026/2027 dates.
            </p>

            {/* Checklist */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-10 text-xs sm:text-sm text-purple-200/90 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Full Audio & Lighting Provided
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                5,000+ Verified Performances
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Fast Booking Response
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-white text-base tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95 ${
                  isLilac
                    ? "bg-[#5500ff] hover:bg-[#4800e0] shadow-[0_4px_30px_rgba(85,0,255,0.5)]"
                    : "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_35px_rgba(168,85,247,0.5)]"
                }`}
              >
                REQUEST DATE & AVAILABILITY
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="tel:18475333333"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-neutral-950 text-base tracking-wide bg-white hover:bg-neutral-100 shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4 text-purple-700" />
                CALL DIRECT: (847) 533-3333
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
