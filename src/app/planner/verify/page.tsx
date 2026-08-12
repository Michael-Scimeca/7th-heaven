/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";

// ─── Digit-by-digit PIN input (same UX as cruise verify) ───────────────────
const renderBg = () => (
  <>
    <style jsx global>{`
      html, body {
        overflow: hidden !important;
        height: 100vh !important;
        max-height: 100vh !important;
        touch-action: none !important;
      }
    `}</style>
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/images/hero-band-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.35) blur(10px)",
        transform: "scale(1.08)",
        zIndex: 0,
        pointerEvents: "none"
      }}
    />
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.55)", backdropFilter: "blur(12px)", zIndex: 1, pointerEvents: "none" }} />
  </>
);

function PlannerVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [step, setStep] = useState<"email" | "pin">("pin");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [status, setStatus] = useState<"idle" | "requesting" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (step === "email") {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleRequestPin = useCallback(async (targetEmail: string) => {
    setStatus("requesting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/planner/request-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus("idle");
        setStep("pin");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Could not send PIN. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setStatus("error");
    }
  }, []);

  // Auto-request PIN when email is prefilled from URL
  useEffect(() => {
    if (emailParam && step === "pin") {
      handleRequestPin(emailParam);
    }
  }, [emailParam, step, handleRequestPin]);

  useEffect(() => {
    if (step === "pin") {
      const t = setTimeout(() => inputRefs.current[0]?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [step]);

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
      const res = await fetch("/api/planner/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus("success");
        const destination = data.redirectUrl || "/planner";
        setTimeout(() => { window.location.href = destination; }, 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Invalid PIN. Please try again.");
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
      await fetch("/api/planner/request-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendStatus("sent");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {
      setResendStatus("idle");
    }
  };

  // Lock document body and page overflow
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // ── Email Collection Step ──
  if (step === "email") {
    return (
      <div style={PAGE_STYLE}>
        {renderBg()}
        <div style={CARD_STYLE}>

          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 26, margin: "0 0 8px" }}>Planner Access</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>
            Enter the email you used when booking 7th Heaven.
            We'll send a 6-digit PIN to verify your identity.
          </p>
          <form onSubmit={e => { e.preventDefault(); handleRequestPin(email); }}>
            <div className="input-glow-border rounded-xl mb-4">
              <input aria-label="Input field"
                ref={emailInputRef}
                autoFocus
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/5 border border-white/15 focus:border-purple-400 focus:shadow-[0_0_25px_rgba(168,85,247,0.85),inset_0_0_15px_rgba(168,85,247,0.3)] focus:bg-purple-950/40 rounded-xl px-4 py-3.5 text-base text-white placeholder:text-white/40 outline-none transition-all duration-200"
              />
            </div>
            {errorMsg && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>
                {errorMsg}
              </div>
            )}
            <button aria-label="Action button"
              type="submit"
              disabled={status === "requesting"}
              style={{
                width: "100%",
                background: status === "requesting" ? "rgba(168,85,247,0.2)" : "linear-gradient(135deg,#7c00ff,#a855f7)",
                border: "none", borderRadius: 12, padding: "14px",
                color: "#fff", fontWeight: 800, fontSize: 15,
                cursor: status === "requesting" ? "not-allowed" : "pointer",
                boxShadow: "0 0 20px rgba(168,85,247,0.35)",
              }}
            >
              {status === "requesting" ? "Sending PIN…" : "Send My PIN →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── PIN Entry Step ──
  return (
    <div style={PAGE_STYLE}>
      {renderBg()}
      <div style={CARD_STYLE}>


        {/* Success state */}
        {status === "success" ? (
          <div className="py-4">
            <h2 style={{ color: "#34d399", fontWeight: 900, fontSize: 24, margin: "0 0 10px" }}>Access Granted!</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "0 0 24px" }}>Your PIN has been verified successfully.</p>
            <Link
              href="/planner"
              style={{
                display: "inline-block",
                width: "100%",
                background: "linear-gradient(135deg,#10b981,#059669)",
                borderRadius: 12,
                padding: "14px",
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 0 20px rgba(16,185,129,0.4)"
              }}
            >
              Access My Dashboard →
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 26, margin: "0 0 8px" }}>PLANNER ACCESS PIN</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: email ? "0 0 6px" : "0 0 24px", lineHeight: 1.6 }}>
              {email ? "We sent a 6-digit code to:" : "Enter your 6-digit PIN to access your Planner Dashboard"}
            </p>
            {email && (
              <p style={{ color: "#a855f7", fontWeight: 700, fontSize: 14, margin: "0 0 24px", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 8, padding: "6px 12px", display: "inline-block" }}>
                {email}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              {/* 6 digit boxes */}
              <div className="flex items-center justify-center gap-1.5 mb-6 no-glow" onPaste={handlePaste}>
                {Array.from(digits, (d, i) => ({ d, i })).map(({ d, i }) => (
                  <div key={i} className="input-glow-border !w-11 !h-14 rounded-xl shrink-0">
                    <input aria-label="Input field"
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      style={{ padding: 0 }}
                      onFocus={() => setFocusedIndex(i)}
                      onBlur={() => setFocusedIndex(null)}
                      onChange={e => handleDigit(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className={`w-full h-full text-center text-xl font-black rounded-xl border-2 bg-black/70 !p-0 outline-none transition-all duration-200 tabular-nums
                        ${focusedIndex === i
                          ? 'border-purple-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.95)] bg-purple-950/80 scale-[1.08] z-10 relative'
                          : d
                            ? 'border-purple-500/80 text-purple-300 shadow-[0_0_14px_rgba(147,51,234,0.4)]'
                            : 'border-white/20 text-white/40 hover:border-white/40'
                        }`}
                    />
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>
                  {errorMsg}
                </div>
              )}

              <button aria-label="Action button"
                type="submit"
                disabled={pin.length !== 6 || status === "submitting"}
                style={{
                  width: "100%",
                  opacity: pin.length !== 6 ? 0.35 : 1,
                  background: pin.length !== 6 || status === "submitting"
                    ? "rgba(168,85,247,0.15)"
                    : "linear-gradient(135deg,#7c00ff,#a855f7)",
                  border: "none", borderRadius: 12, padding: "14px",
                  color: pin.length !== 6 ? "rgba(255,255,255,0.4)" : "#fff",
                  fontWeight: 800, fontSize: 15,
                  cursor: pin.length !== 6 || status === "submitting" ? "not-allowed" : "pointer",
                  boxShadow: pin.length === 6 ? "0 0 25px rgba(168,85,247,0.4)" : "none",
                  transition: "all 0.25s ease",
                  marginBottom: 16,
                }}
              >
                {status === "submitting" ? "Verifying…" : "Access My Dashboard →"}
              </button>
            </form>

            <div className="space-y-2 mt-4">
              <button aria-label="Action button"
                onClick={handleResend}
                disabled={resendStatus !== "idle"}
                style={{ background: "none", border: "none", color: resendStatus === "sent" ? "#34d399" : "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
              >
                {resendStatus === "sending" ? "Sending…" : resendStatus === "sent" ? "✓ New PIN sent!" : "Resend PIN"}
              </button>

              <button aria-label="Action button"
                type="button"
                onClick={() => setStep("email")}
                style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "rgba(168,85,247,0.8)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
              >
                Need a PIN sent to your email?
              </button>
            </div>

            <p className="flex items-center justify-center gap-1.5" style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 20 }}>
              <svg className="w-3.5 h-3.5 opacity-60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>PIN expires in 10 minutes · Only admins can create planner accounts</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const PAGE_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  height: "100vh",
  width: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  fontFamily: "'Outfit', 'Inter', sans-serif",
  overflow: "hidden",
};

const CARD_STYLE: React.CSSProperties = {
  background: "var(--color-bg-glass)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid var(--color-border-main)",
  borderRadius: 24,
  padding: "48px 20px",
  width: "100%",
  maxWidth: 480,
  textAlign: "center",
  boxShadow: "0 30px 90px rgba(0, 0, 0, 0.6)",
  position: "relative",
  overflow: "hidden",
  zIndex: 10,
};

const INPUT_STYLE: React.CSSProperties = {
  width: 52,
  height: 64,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  color: "#fff",
  fontSize: 28,
  fontWeight: 800,
  textAlign: "center",
  outline: "none",
  caretColor: "#a855f7",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function PlannerVerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#050508" }} />}>
      <PlannerVerifyContent />
    </Suspense>
  );
}
