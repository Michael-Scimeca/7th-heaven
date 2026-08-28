"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

async function fetchPaymentSession(sessionId: string) {
  const res = await fetch(`/api/payment-test?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error("HTTP error " + res.status);
  return res.json();
}

function PaymentTestContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  const [amount, setAmount] = useState("25.00");
  const [description, setDescription] = useState("7th Heaven Test Payment");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<{ amountTotal: number; currency: string } | null>(null);

  // eslint-disable-next-line react-doctor/no-fetch-in-effect
  useEffect(() => {
    if (status !== "success" || !sessionId) return;
    let active = true;
    fetchPaymentSession(sessionId)
      .then((data) => {
        if (active && data?.status === "paid") {
          setConfirmed({ amountTotal: data.amountTotal, currency: data.currency });
        }
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, [status, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payment-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start checkout.");
      }

      const data = await res.json();
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="site-container max-w-xl mx-auto px-6">
        <div className="mb-8 text-left">
          <Link
            href="/"
            className="font-bold uppercase tracking-wider text-purple-400hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white/[0.04]backdrop-blur-[18px] border border-white/[0.12] rounded-lg p-8 shadow-[0_8px_64px_rgba(0,0,0,0.4)] text-left">
          <div className="mb-6">
            <span className="inline-block font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] mb-1">
              Stripe Test Mode
            </span>
            <h1 className="text-2xl font-bold uppercase text-white tracking-wide">
              Payment Test Page
            </h1>
            <p className="mt-1 leading-relaxed">
              Runs a real Stripe Checkout session in test mode. Card details are entered on
              Stripe&apos;s hosted page and never touch this server. Use test card{" "}
              <span className="text-white/70 font-mono">4242 4242 4242 4242</span>, any future
              expiry, any CVC.
            </p>
          </div>

          {status === "success" && (
            <div className="mb-6 p-4 border border-white/10 bg-emerald-500/10 text-[var(--color-accent)] font-bold leading-normal">
              🎉{" "}
              {confirmed
                ? `Payment confirmed: $${(confirmed.amountTotal / 100).toFixed(2)} ${confirmed.currency?.toUpperCase()}.`
                : "Payment completed — confirming with Stripe…"}
            </div>
          )}

          {status === "cancelled" && (
            <div className="mb-6 p-4 border border-rose-500/20 bg-rose-500/10 text-rose-400 font-bold leading-normal">
              Checkout was cancelled. No charge was made.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 border border-rose-500/20 bg-rose-500/10 text-rose-400 font-bold leading-normal">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.50"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.12] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.12] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-wider py-3.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Redirecting to Stripe…" : "Pay with Stripe (Test Mode)"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PaymentTestPage() {
  return (
    <Suspense fallback={null}>
      <PaymentTestContent />
    </Suspense>
  );
}
