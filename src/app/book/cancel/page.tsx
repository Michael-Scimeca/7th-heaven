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
      <div className="site-container flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/10">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="mb-2 text-xl">Invalid Link</h2>
          <p className="mb-8">
            This cancellation link is missing required information. Please use
            the link from your confirmation email.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-white/10 bg-white/[0.05] px-8 py-3 hover:bg-white/[0.1]"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md text-center">
        {status === "confirm" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-white/10 bg-purple-600/10">
              <span className="text-2xl">🗓️</span>
            </div>
            <h1 className="mb-3">Cancel Booking?</h1>
            <p className="mb-2">
              You&apos;re about to cancel booking{" "}
              <span className="text-[var(--color-accent)]">{bookingId}</span>.
            </p>
            <p className="mb-8">
              This action cannot be undone. Our team will be notified.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCancel}
                className="w-full cursor-pointer bg-rose-600 px-8 py-4 shadow-[0_0_20px_rgba(225,29,72,0.2)] hover:bg-rose-500 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]"
              >
                Yes, Cancel My Booking
              </button>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center border border-white/5 bg-white/[0.03] px-8 py-4 hover:bg-white/[0.08]"
              >
                Never Mind — Go Back
              </Link>
            </div>
          </>
        )}

        {status === "cancelling" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center border border-white/10 bg-[#00000029]">
              <span className="text-2xl">⏳</span>
            </div>
            <h2 className="mb-2 text-xl">Cancelling your booking...</h2>
          </>
        )}

        {status === "done" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-white/10 bg-emerald-500/10">
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
            <h2 className="mb-3 text-2xl">Booking Cancelled</h2>
            <p className="mb-2">
              Booking{" "}
              <span className="text-[var(--color-accent)]">{bookingId}</span>{" "}
              has been cancelled.
            </p>
            <p className="mb-8">
              Our team has been notified. If you change your mind, you can
              submit a new booking request anytime.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/book"
                className="inline-flex w-full items-center justify-center bg-[var(--color-accent)] px-8 py-4 shadow-[0_0_20px_rgba(255,10,61,0.3)] hover:bg-[var(--color-accent)]/80"
              >
                Book a New Show
              </Link>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center border border-white/5 bg-white/[0.03] px-8 py-4 hover:bg-white/[0.08]"
              >
                Return to Homepage
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/10">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="mb-3 text-2xl">Cancellation Failed</h2>
            <p className="mb-8 text-rose-400/70">{errorMsg}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStatus("confirm")}
                className="w-full cursor-pointer border border-white/10 bg-white/[0.05] px-8 py-4 hover:bg-white/[0.1]"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center border border-white/5 bg-white/[0.03] px-8 py-4 hover:bg-white/[0.08]"
              >
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
    <Suspense fallback={<div className="min-h-screen" />}>
      <CancelContent />
    </Suspense>
  );
}
