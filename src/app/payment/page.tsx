"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

async function fetchPaymentSession(sessionId: string) {
  const res = await fetch(
    `/api/payment-test?session_id=${encodeURIComponent(sessionId)}`,
  );
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
  const [confirmed, setConfirmed] = useState<{
    amountTotal: number;
    currency: string;
  } | null>(null);

  // eslint-disable-next-line react-doctor/no-fetch-in-effect
  useEffect(() => {
    if (status !== "success" || !sessionId) return;
    let active = true;
    fetchPaymentSession(sessionId)
      .then((data) => {
        if (active && data?.status === "paid") {
          setConfirmed({
            amountTotal: data.amountTotal,
            currency: data.currency,
          });
        }
      })
      .catch(() => {});
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
    <div className="page-container min-h-screen pb-20">
      <div className="site-container mx-auto max-w-xl px-6">
        <div className="mb-8 text-left">
          <Link
            href="/"
            className="text-purple-400hover: flex items-center gap-2 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white/[0.04]backdrop-blur-[18px] rounded-lg border border-white/[0.12] p-8 text-left shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
          <div className="mb-6">
            <span className="mb-1 inline-block">Stripe Test Mode</span>
            <h1>Payment Test Page</h1>
            <p>
              Runs a real Stripe Checkout session in test mode. Card details are
              entered on Stripe&apos;s hosted page and never touch this server.
              Use test card{" "}
              <span className="text-white/70">4242 4242 4242 4242</span>, any
              future expiry, any CVC.
            </p>
          </div>

          {status === "success" && (
            <div className="mb-6 border border-white/10 bg-emerald-500/10 p-4 leading-normal">
              🎉{" "}
              {confirmed
                ? `Payment confirmed: $${(confirmed.amountTotal / 100).toFixed(2)} ${confirmed.currency?.toUpperCase()}.`
                : "Payment completed — confirming with Stripe…"}
            </div>
          )}

          {status === "cancelled" && (
            <div className="mb-6 border border-rose-500/20 bg-rose-500/10 p-4 leading-normal text-rose-400">
              Checkout was cancelled. No charge was made.
            </div>
          )}

          {error && (
            <div className="mb-6 border border-rose-500/20 bg-rose-500/10 p-4 leading-normal text-rose-400">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] text-white/40">
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.50"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-3 focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-white/40">
                Description
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-3 focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--color-accent)] py-3.5 transition-colors hover:bg-[var(--color-accent)]/80 disabled:opacity-50"
            >
              {loading
                ? "Redirecting to Stripe…"
                : "Pay with Stripe (Test Mode)"}
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
