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
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      window.location.href =
        isLoggedIn && member?.role === "event_planner" ? "/planner" : "/";
    }
  }, [countdown, isLoggedIn, member?.role]);

  return (
    <section className="site-container relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-emerald-500 opacity-[0.04] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-lg bg-[var(--color-accent)] opacity-[0.03] blur-3xl" />

      <div className="relative z-10 w-full max-w-lg animate-[fade-in-up_0.6s_ease-out_both] text-center">
        {/* Success Card */}
        <div className="rounded-[2rem] border border-emerald-500/10 bg-[var(--color-bg-surface)]/80 p-10 backdrop-blur-xl">
          {/* Checkmark */}
          <div className="mx-auto mb-6 flex h-20 w-20 animate-[scale-in_0.5s_ease-out_0.2s_both] items-center justify-center rounded-lg border-2 border-emerald-500/30 bg-emerald-500/10">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="mb-2">
            {sessionId ? "Booking Confirmed ✓" : "Request Submitted"}
          </h1>

          {bookingId && (
            <div className="mb-6 inline-block border border-white/10 bg-[var(--color-accent)]/10 px-4 py-2">
              <span className="block text-white/40">Booking ID</span>
              <span className="text-[var(--color-accent)]">{bookingId}</span>
            </div>
          )}

          <p className="mb-2">
            {sessionId
              ? "Your booking has been confirmed successfully. We'll be in touch within 24–48 hours with details."
              : "We've received your booking request. Check your email for a confirmation."}
          </p>

          {sessionId && (
            <div className="mb-6 flex items-center justify-center gap-2 text-[var(--color-accent)]/80">
              <span className="h-2 w-2 animate-pulse rounded-lg bg-emerald-400" />
              Confirmation sent to your email
            </div>
          )}

          <div className="mt-6 flex w-full flex-col gap-3">
            {isLoggedIn && member?.role === "event_planner" && (
              <Link
                href="/planner"
                className="inline-flex w-full items-center justify-center bg-[var(--color-accent)] px-8 py-4 text-base shadow-[0_0_20px_rgba(255,10,61,0.3)] hover:bg-[var(--color-accent)]/80 hover:shadow-[0_0_30px_rgba(255,10,61,0.5)]"
              >
                View in My Dashboard →
              </Link>
            )}
            <Link
              href="/book"
              className="inline-flex w-full items-center justify-center border border-white/5 bg-white/[0.05] px-8 py-4 text-base hover:bg-white/[0.1]"
            >
              Book Another Show
            </Link>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center bg-white/[0.03] px-8 py-3 text-base hover:bg-white/[0.08]"
            >
              Return to Homepage
            </Link>
          </div>

          <p className="mt-6">Redirecting in {countdown}s...</p>
        </div>
      </div>
    </section>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SuccessContent />
    </Suspense>
  );
}
