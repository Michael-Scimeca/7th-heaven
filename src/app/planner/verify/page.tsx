"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";

// ─── Digit-by-digit PIN input (same UX as cruise verify) ───────────────────
function PlannerVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [step, setStep] = useState<"email" | "pin">(emailParam ? "pin" : "email");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "requesting" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-request PIN when email is prefilled from URL
  useEffect(() => {
    if (emailParam && step === "pin") {
      handleRequestPin(emailParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step === "pin") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleRequestPin = async (targetEmail: string) => {
    setStatus("requesting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/planner/request-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Could not send PIN. Please try again.");
        setStatus("error");
      } else {
        setStatus("idle");
        setStep("pin");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

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
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Invalid PIN. Please try again.");
        setStatus("error");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } else {
        setStatus("success");
        const destination = data.redirectUrl || "/planner";
        setTimeout(() => { window.location.href = destination; }, 2200);
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

  // ── Styles ──
  const pageStyle: React.CSSProperties = {
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

  const cardStyle: React.CSSProperties = {
    background: "var(--color-bg-glass)",
    backdropFilter: "blur(32px) saturate(180%)",
    WebkitBackdropFilter: "blur(32px) saturate(180%)",
    border: "1px solid var(--color-border-main)",
    borderRadius: 24,
    padding: "48px 40px",
    width: "100%",
    maxWidth: 480,
    textAlign: "center",
    boxShadow: "0 30px 90px rgba(0, 0, 0, 0.6)",
    position: "relative",
    overflow: "hidden",
    zIndex: 10,
  };

  const inputStyle: React.CSSProperties = {
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

  // Background image overlay helper (exact same blurred hero bg as LoginModal!)
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

  // ── Email Collection Step ──
  if (step === "email") {
    return (
      <div style={pageStyle}>
        {renderBg()}
        <div style={cardStyle}>

          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 26, margin: "0 0 8px" }}>Planner Access</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>
            Enter the email you used when booking 7th Heaven.
            We'll send a 6-digit PIN to verify your identity.
          </p>
          <form onSubmit={e => { e.preventDefault(); handleRequestPin(email); }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12, padding: "14px 16px",
                color: "#fff", fontSize: 15, outline: "none", marginBottom: 16,
              }}
            />
            {errorMsg && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>
                {errorMsg}
              </div>
            )}
            <button
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
    <div style={pageStyle}>
      {renderBg()}
      <div style={cardStyle}>


        {/* Success state */}
        {status === "success" ? (
          <div>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: "#34d399", fontWeight: 900, fontSize: 22, margin: "0 0 8px" }}>Access Granted!</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Redirecting to your Planner Dashboard…</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
            <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 26, margin: "0 0 8px" }}>Enter Your PIN</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: "0 0 6px", lineHeight: 1.6 }}>
              We sent a 6-digit code to:
            </p>
            <p style={{ color: "#a855f7", fontWeight: 700, fontSize: 14, margin: "0 0 32px", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 8, padding: "6px 12px", display: "inline-block" }}>
              {email}
            </p>

            <form onSubmit={handleSubmit}>
              {/* 6 digit boxes */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }} onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    style={{
                      ...inputStyle,
                      borderColor: d ? "#a855f7" : "rgba(255,255,255,0.15)",
                      boxShadow: d ? "0 0 12px rgba(168,85,247,0.35)" : "none",
                    }}
                  />
                ))}
              </div>

              {errorMsg && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={pin.length !== 6 || status === "submitting"}
                style={{
                  width: "100%",
                  background: pin.length !== 6 || status === "submitting"
                    ? "rgba(168,85,247,0.2)"
                    : "linear-gradient(135deg,#7c00ff,#a855f7)",
                  border: "none", borderRadius: 12, padding: "14px",
                  color: "#fff", fontWeight: 800, fontSize: 15,
                  cursor: pin.length !== 6 || status === "submitting" ? "not-allowed" : "pointer",
                  boxShadow: pin.length === 6 ? "0 0 20px rgba(168,85,247,0.35)" : "none",
                  transition: "all 0.2s",
                  marginBottom: 16,
                }}
              >
                {status === "submitting" ? "Verifying…" : "Access My Dashboard →"}
              </button>
            </form>

            <button
              onClick={handleResend}
              disabled={resendStatus !== "idle"}
              style={{ background: "none", border: "none", color: resendStatus === "sent" ? "#34d399" : "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
            >
              {resendStatus === "sending" ? "Sending…" : resendStatus === "sent" ? "✓ New PIN sent!" : "Resend PIN"}
            </button>

            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 24 }}>
              ⏰ PIN expires in 10 minutes · Only admins can create planner accounts
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PlannerVerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#050508" }} />}>
      <PlannerVerifyContent />
    </Suspense>
  );
}
