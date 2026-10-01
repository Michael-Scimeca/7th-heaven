"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const bookingId = searchParams.get("id");

  const [status, setStatus] = useState<
    "confirm" | "cancelling" | "done" | "error"
  >("confirm");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCancel = async () => {
    setStatus("cancelling");
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, token }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatus("done");
        } else {
          setErrorMsg(data.error || "Something went wrong");
          setStatus("error");
        }
      } else {
        const data = await res.json().catch(() => ({}));
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
      <main id="booking-cancel-page" className="page-container flex min-h-screen items-center justify-center">
        <section id="booking-cancel-invalid" aria-labelledby="booking-cancel-invalid-heading" className="section">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[var(--radius-box)] border border-rose-500/20 bg-rose-500/10">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 id="booking-cancel-invalid-heading" className="mb-2">Invalid Link</h1>
            <p className="mb-8">
              This cancellation link is missing required information. Please use
              the link from your confirmation email.
            </p>
            <Link
              href="/"
              className="transition-colors inline-flex items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-white/[0.05] px-8 py-3 hover:bg-white/[0.1]"
            >
              Return to Homepage
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="booking-cancel-page" className="page-container flex min-h-screen items-center justify-center">
      <section id="booking-cancel" aria-labelledby="booking-cancel-heading" className="section">
        <div className="w-full max-w-md text-center">
          {status === "confirm" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-white/10 bg-purple-600/10">
                <span className="text-2xl">🗓️</span>
              </div>
              <div className="title-group title-group--page mb-8 items-center text-center">
                <h1 id="booking-cancel-heading" className="">Cancel Booking?</h1>
                <p>
                  You&apos;re about to cancel booking{" "}
                  <span className="text-[var(--color-accent)]">{bookingId}</span>.
                </p>
                <p>
                  This action cannot be undone. Our team will be notified.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCancel}
                  className="transition-[background-color,color,border-color,box-shadow] w-full cursor-pointer rounded-[var(--radius-box)] bg-rose-600 px-8 py-4 shadow-[0_0_20px_rgba(225,29,72,0.2)] hover:bg-rose-500 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]"
                >
                  Yes, Cancel My Booking
                </button>
                <Link
                  href="/"
                  className="transition-colors inline-flex w-full items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] px-8 py-4 hover:bg-white/[0.08]"
                >
                  Never Mind — Go Back
                </Link>
              </div>
            </>
          )}

          {status === "cancelling" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-[#00000029]">
                <span className="text-2xl">⏳</span>
              </div>
              <h2 id="booking-cancel-heading" className="mb-2">Cancelling your booking...</h2>
            </>
          )}

          {status === "done" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-emerald-500/10">
                <svg
                  width="28"
                  height="28"
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
              <div className="title-group title-group--section mb-8 items-center text-center">
                <h2 id="booking-cancel-heading" className="">Booking Cancelled</h2>
                <p>
                  Booking{" "}
                  <span className="text-[var(--color-accent)]">{bookingId}</span>{" "}
                  has been cancelled.
                </p>
                <p>
                  Our team has been notified. If you change your mind, you can
                  submit a new booking request anytime.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/book"
                  className="transition-colors inline-flex w-full items-center justify-center rounded-[var(--radius-box)] bg-[var(--color-accent)] px-8 py-4 shadow-[0_0_20px_rgba(255,10,61,0.3)] hover:bg-[var(--color-accent)]/80"
                >
                  Book a New Show
                </Link>
                <Link
                  href="/"
                  className="transition-colors inline-flex w-full items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] px-8 py-4 hover:bg-white/[0.08]"
                >
                  Return to Homepage
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[var(--radius-box)] border border-rose-500/20 bg-rose-500/10">
                <span className="text-2xl">❌</span>
              </div>
              <h2 id="booking-cancel-heading" className="mb-3">Cancellation Failed</h2>
              <p className="mb-8 text-rose-400/70">{errorMsg}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStatus("confirm")}
                  className="transition-colors w-full cursor-pointer rounded-[var(--radius-box)] border border-white/10 bg-white/[0.05] px-8 py-4 hover:bg-white/[0.1]"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="transition-colors inline-flex w-full items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] px-8 py-4 hover:bg-white/[0.08]"
                >
                  Return to Homepage
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function CancelBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CancelContent />
    </Suspense>
  );
}
