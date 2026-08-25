/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { Outfit } from "next/font/google";

// Self-hosted at build time by next/font — avoids a runtime DNS lookup +
// request to fonts.googleapis.com/fonts.gstatic.com for this page.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  display: "swap",
});

function CruiseVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "alex@7thheaven.com";
  const initialPin = searchParams.get("pin") || "";

  const [digits, setDigits] = useState<string[]>(
    initialPin.length === 6 ? initialPin.split("") : ["", "", "", "", "", ""]
  );
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigit = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const d = [...digits];
    d[i] = val.slice(-1);
    setDigits(d);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(""));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const pin = digits.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/cruise/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus("success");
        const destination = data.redirectUrl || "/cruise/dashboard";
        setTimeout(() => { window.location.href = destination; }, 2200);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Invalid code. Please try again.");
        setStatus("error");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const handleResend = async () => {
    setResendStatus("sending");
    try {
      await fetch("/api/auth/send-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  };

  const filled = digits.filter(Boolean).length;

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#020818] overflow-hidden ${outfit.className}`}>
      {/* Background Cruise image */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/cruise-hero.png')",
          filter: "brightness(0.4) blur(3px)",
          transform: "scale(1.08)",
        }}
      />
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/60  backdrop-blur-[45px] pointer-events-none z-0" />

      {/* Centered Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-[rgba(10,15,30,0.85)] backdrop-blur-xl border border-purple-500/30  rounded-lg p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.2)] text-center my-auto">
        {status === "success" ? (
          <div className="py-4">
            <h1 className="text-2xl sm:text-3xl  font-bold  text-emerald-400 mb-2">Access Granted!</h1>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Your Cruise Member account is confirmed.<br />
              Welcome aboard the 7th Heaven Caribbean Cruise.
            </p>
            <Link
              href="/cruise/dashboard"
              className="inline-block w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-sm sm:text-base uppercase tracking-widest  rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              Access My Dashboard →
            </Link>
          </div>
        ) : (
          <>
            {/* Eyebrow */}
            <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
              <span className="text-[10px] sm:text-xs  font-bold  uppercase tracking-[0.2em] text-purple-300">7th Heaven Caribbean Cruise</span>
            </div>

            <h1 className="text-2xl sm:text-3xl  font-bold  text-white tracking-tight mb-2">Check Your Email</h1>
            <p className="text-xs sm:text-sm  text-white  mb-2">
              We sent a 6-digit verification code to
            </p>
            <div className="mb-5 inline-block">
              <p className="text-xs sm:text-sm font-bold text-purple-300 bg-purple-600/15 border border-purple-500/30 rounded-lg px-3.5 py-1.5 break-all">
                {email || "your email address"}
              </p>
            </div>

            {/* PIN form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {Array.from(digits, (d, i) => ({ d, i })).map(({ d, i }) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`w-full h-12 sm:h-14 text-center text-xl sm:text-2xl  font-bold  text-white bg-black/60 border  rounded-lg outline-none transition-all ${d
                      ? "border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] bg-purple-950/30"
                      : " border-white/20  focus:border-purple-400 focus:bg-purple-950/20"
                      } ${status === "error" ? "border-rose-500 bg-rose-950/20 animate-shake" : ""}`}
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-500/15 border border-rose-500/30  rounded-lg text-xs font-bold text-rose-300">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={pin.length !== 6 || status === "submitting"}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:brightness-110 active:scale-[0.99] text-white font-bold text-xs sm:text-sm uppercase tracking-[0.15em]  rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(124,0,255,0.4)]"
              >
                {status === "submitting" ? "Verifying…" : "Access My Dashboard →"}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col items-center gap-1.5">
              <p className="text-xs text-white/50">Didn&apos;t receive the code?</p>
              {resendStatus === "sent" ? (
                <p className="text-xs font-bold text-emerald-400">
                  ✓ Code resent! Check your inbox.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "sending"}
                  className="text-xs font-bold text-purple-300 hover:text-white underline transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {resendStatus === "sending" ? "Sending…" : "Resend Code"}
                </button>
              )}
            </div>

            {/* Back link */}
            <div className="mt-4">
              <Link href="/cruise" className="text-xs font-semibold text-white/40 hover:text-white transition-colors">
                ← Back to Cruise Page
              </Link>
            </div>

            {/* Brand footer */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">7th Heaven · Caribbean Cruise 2025</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CruiseVerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#020818", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, fontFamily: "Outfit, sans-serif" }}>Loading…</div>
      </div>
    }>
      <CruiseVerifyContent />
    </Suspense>
  );
}
