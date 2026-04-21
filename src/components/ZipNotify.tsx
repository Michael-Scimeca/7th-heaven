"use client";

import { useState } from "react";

export default function ZipNotify() {
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("50");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !zip) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, zip, radius }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setZip("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-32 bg-[var(--color-bg-primary)] border-t border-white/10" id="zip-notify">
      <div className="site-container max-w-[800px] text-center">

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-8 border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent, #851DEF)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)]">
          Never Miss a Show
        </span>

        <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-white mb-4">
          Get notified when we&apos;re<br />
          <span className="gradient-text">playing near you</span>
        </h2>

        <p className="text-white/40 text-[0.9rem] max-w-md mx-auto mb-10 leading-relaxed">
          Enter your zip code and we&apos;ll send you an alert whenever 7th Heaven has a show within your area. No spam — just show dates.
        </p>

        {status === "success" ? (
          <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 p-6 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent, #851DEF)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span className="text-white font-bold text-[0.9rem]">You&apos;re on the list!</span>
            </div>
            <p className="text-white/40 text-[0.75rem]">
              We&apos;ll notify you at <span className="text-[var(--color-accent)]">{email || "your email"}</span> when a show is announced near zip <span className="text-[var(--color-accent)]">{zip}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="flex-1 bg-white/[0.03] border border-white/10 px-4 py-3.5 text-[0.85rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                required
                placeholder="Zip Code"
                maxLength={5}
                pattern="\d{5}"
                className="w-full sm:w-[130px] bg-white/[0.03] border border-white/10 px-4 py-3.5 text-[0.85rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors text-center"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Radius selector */}
              <div className="flex items-center gap-2 text-[0.7rem] text-white/30">
                <span>Notify me within</span>
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="bg-white/[0.03] border border-white/10 px-2 py-1.5 text-[0.75rem] text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors appearance-none cursor-pointer text-center"
                >
                  <option value="25" className="bg-[#0a0a0f]">25 mi</option>
                  <option value="50" className="bg-[#0a0a0f]">50 mi</option>
                  <option value="100" className="bg-[#0a0a0f]">100 mi</option>
                  <option value="200" className="bg-[#0a0a0f]">200 mi</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="sm:ml-auto inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.8rem] uppercase tracking-[0.1em] py-3.5 px-8 transition-all cursor-pointer disabled:opacity-50"
              >
                {status === "loading" ? "Signing up..." : "Notify Me"}
              </button>
            </div>

            {status === "error" && (
              <p className="text-red-400 text-[0.75rem] mt-3">Something went wrong. Please try again.</p>
            )}
          </form>
        )}

        <p className="text-[0.6rem] text-white/15 mt-6">
          Unsubscribe anytime. We&apos;ll never share your information.
        </p>

      </div>
    </section>
  );
}
