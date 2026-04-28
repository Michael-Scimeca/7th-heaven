"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const bookingId = searchParams.get("id");

  const [status, setStatus] = useState<"confirm" | "cancelling" | "done" | "error">("confirm");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCancel = async () => {
    setStatus("cancelling");
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, token }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("done");
      } else {
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (!token || !bookingId) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">Invalid Link</h1>
          <p className="text-white/40 text-sm mb-8">This cancellation link is missing required information. Please use the link from your confirmation email.</p>
          <Link href="/" className="inline-flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold uppercase tracking-wider text-[0.75rem] py-3 px-8 rounded-xl transition-all border border-white/10">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        {status === "confirm" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-2xl">🗓️</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-3">Cancel Booking?</h1>
            <p className="text-white/40 text-sm mb-2 leading-relaxed">
              You&apos;re about to cancel booking <span className="text-[var(--color-accent)] font-bold">{bookingId}</span>.
            </p>
            <p className="text-white/30 text-[0.8rem] mb-8">This action cannot be undone. Our team will be notified.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCancel}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider text-[0.75rem] py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(225,29,72,0.2)] hover:shadow-[0_0_30px_rgba(225,29,72,0.4)] cursor-pointer"
              >
                Yes, Cancel My Booking
              </button>
              <Link href="/" className="inline-flex items-center justify-center w-full bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-bold uppercase tracking-wider text-[0.75rem] py-4 px-8 rounded-xl transition-all border border-white/5">
                Never Mind — Go Back
              </Link>
            </div>
          </>
        )}

        {status === "cancelling" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
              <span className="text-2xl">⏳</span>
            </div>
            <h1 className="text-xl font-bold text-white/60">Cancelling your booking...</h1>
          </>
        )}

        {status === "done" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-3">Booking Cancelled</h1>
            <p className="text-white/40 text-sm mb-2">
              Booking <span className="text-[var(--color-accent)] font-bold">{bookingId}</span> has been cancelled.
            </p>
            <p className="text-white/30 text-[0.8rem] mb-8">Our team has been notified. If you change your mind, you can submit a new booking request anytime.</p>
            <div className="flex flex-col gap-3">
              <Link href="/book" className="inline-flex items-center justify-center w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-wider text-[0.75rem] py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)]">
                Book a New Show
              </Link>
              <Link href="/" className="inline-flex items-center justify-center w-full bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-bold uppercase tracking-wider text-[0.75rem] py-4 px-8 rounded-xl transition-all border border-white/5">
                Return to Homepage
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-3">Cancellation Failed</h1>
            <p className="text-rose-400/70 text-sm mb-8">{errorMsg}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setStatus("confirm")} className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold uppercase tracking-wider text-[0.75rem] py-4 px-8 rounded-xl transition-all border border-white/10 cursor-pointer">
                Try Again
              </button>
              <Link href="/" className="inline-flex items-center justify-center w-full bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-bold uppercase tracking-wider text-[0.75rem] py-4 px-8 rounded-xl transition-all border border-white/5">
                Return to Homepage
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function CancelBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
      <CancelContent />
    </Suspense>
  );
}
