"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMember } from "@/context/MemberContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const sessionId = searchParams.get("session_id");
  const { member, isLoggedIn } = useMember();
  const [countdown, setCountdown] = useState(15);

  // Auto-redirect to homepage after countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = isLoggedIn && member?.role === "event_planner" ? "/planner" : "/";
    }
  }, [countdown, isLoggedIn, member?.role]);

  return (
    <section className="min-h-screen flex items-center justify-center site-container relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500 opacity-[0.04] rounded-lg blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[var(--color-accent)] opacity-[0.03] rounded-lg blur-[120px] pointer-events-none" />

      <div className="text-center max-w-lg relative z-10 w-full animate-[fade-in-up_0.6s_ease-out_both]">
        {/* Success Card */}
        <div className="bg-[var(--color-bg-surface)]/80 border border-emerald-500/10 backdrop-blur-xl p-10 rounded-[2rem]">
          {/* Checkmark */}
          <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg flex items-center justify-center animate-[scale-in_0.5s_ease-out_0.2s_both]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {sessionId ? "Booking Confirmed ✓" : "Request Submitted"}
          </h1>

          {bookingId && (
            <div className="inline-block bg-[var(--color-accent)]/10 border border-white/10 px-4 py-2 mb-4">
              <span className="font-bold uppercase tracking-[0.2em] text-white/40 block">Booking ID</span>
              <span className="text-lg font-bold text-[var(--color-accent)] font-mono">{bookingId}</span>
            </div>
          )}

          <p className="leading-relaxed mb-2">
            {sessionId
              ? "Your booking has been confirmed successfully. We'll be in touch within 24–48 hours with details."
              : "We've received your booking request. Check your email for a confirmation."
            }
          </p>

          {sessionId && (
            <div className="flex items-center justify-center gap-2 text-[var(--color-accent)]/80 text-sm mb-6">
              <span className="w-2 h-2 rounded-lg bg-emerald-400 animate-pulse" />
              Confirmation sent to your email
            </div>
          )}

          <div className="flex flex-col gap-3 w-full mt-6">
            {isLoggedIn && member?.role === "event_planner" && (
              <Link
                href="/planner"
                className="inline-flex items-center justify-center w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-wider text-base py-4 px-8 transition-colors shadow-[0_0_20px_rgba(255,10,61,0.3)] hover:shadow-[0_0_30px_rgba(255,10,61,0.5)]"
              >
                View in My Dashboard →
              </Link>
            )}
            <Link
              href="/book"
              className="inline-flex items-center justify-center w-full bg-white/[0.05] hover:bg-white/[0.1] text-white/80 font-bold uppercase tracking-wider text-base py-4 px-8 transition-colors border border-white/5"
            >
              Book Another Show
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full bg-white/[0.03] hover:bg-white/[0.08] text-white font-bold uppercase tracking-wider text-base py-3 px-8 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>

          <p className="mt-6">
            Redirecting in {countdown}s...
          </p>
        </div>
      </div>
    </section>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen  " />}>
      <SuccessContent />
    </Suspense>
  );
}
