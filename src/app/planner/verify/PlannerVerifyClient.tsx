/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";

// ─── Digit-by-digit PIN input (same UX as cruise verify) ───────────────────
const renderBg = () => (
  <div className="lock-scroll-fullscreen">
    <div
 style={{
 position: "fixed",
 inset: 0,
 backgroundImage: "url('/images/hero/hero-band-bg.png')",
 backgroundSize: "cover",
 backgroundPosition: "center",
 filter: "brightness(0.35) blur(3px)",
 transform: "scale(1.08)",
 zIndex: 0,
 pointerEvents: "none"
 }}
 />
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 1, pointerEvents: "none" }} />
  </div>
);

interface PlannerVerifyClientProps {
  sanityContent?: any;
}

function PlannerVerifyContent({ sanityContent }: PlannerVerifyClientProps) {
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
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (step === "email") {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === "pin") {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, idx) => { next[idx] = char; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const pin = digits.join("");

  const handleRequestPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("requesting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/planner/send-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("idle");
        setStep("pin");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "No active booking request found for this email.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const handleSubmitPin = useCallback(async (pinCode: string) => {
    if (pinCode.length !== 6) return;
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/planner/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin: pinCode }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus("success");
        const dest = data.redirectUrl || `/planner/dashboard?token=${data.token || ""}`;
        if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = setTimeout(() => {
          router.push(dest);
        }, 1800);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Invalid verification code. Please check and try again.");
        setStatus("error");
        setDigits(["", "", "", "", "", ""]);
        if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
        focusTimerRef.current = setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setStatus("error");
    }
  }, [email, router]);

  useEffect(() => {
    if (pin.length === 6 && status !== "submitting" && status !== "success") {
      handleSubmitPin(pin);
    }
  }, [pin, status, handleSubmitPin]);

  const handleResend = async () => {
    if (!email) {
      setStep("email");
      return;
    }
    setResendStatus("sending");
    try {
      const res = await fetch("/api/planner/send-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendStatus("sent");
        setTimeout(() => setResendStatus("idle"), 5000);
      } else {
        setResendStatus("idle");
        setErrorMsg("Failed to resend code. Please try again.");
      }
    } catch {
      setResendStatus("idle");
    }
  };

  return (
    <div
 style={{
 minHeight: "100vh",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 padding: 16,
 background: "#050508",
 color: "#fff",
 fontFamily: "'Outfit', sans-serif",
 }}>
      {renderBg()}

      <div style={CONTAINER_STYLE}>
        {/* Top Header Badge */}
        <div style={{ marginBottom: 20 }}>
          <div
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: 8,
 padding: "6px 14px",
 borderRadius: 20,
 background: "rgba(168, 85, 247, 0.12)",
 border: "1px solid rgba(168, 85, 247, 0.3)",
 fontSize: 12,
 fontWeight: 700,
 letterSpacing: 1.5,
 color: "#c084fc",
 textTransform: "uppercase",
 }}>
            📅 Event Planner Portal
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1
 style={{
 fontSize: 26,
 fontWeight: 900,
 letterSpacing: "-0.02em",
 marginBottom: 8,
 color: "#fff",
 }}>
          {sanityContent?.heroHeading || sanityContent?.title || (step === "email" ? "Access Booking Portal" : "Verify Your Access Code")}
        </h1>

        <p
 style={{
 fontSize: 14,
 color: "rgba(255, 255, 255, 0.65)",
 lineHeight: 1.5,
 marginBottom: 28,
 }}>
          {sanityContent?.heroSubheading || sanityContent?.subtitle || (
            step === "email" ? (
              "Enter the email address used for your booking request to receive a 6-digit access code."
            ) : (
              <>
                Enter the 6-digit code sent to{" "}
                <strong style={{ color: "#c084fc" }}>{email || "your email"}</strong>
              </>
            )
          )}
        </p>

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div
 style={{
 padding: 24,
 borderRadius: 12,
 background: "rgba(34, 197, 94, 0.1)",
 border: "1px solid rgba(34, 197, 94, 0.3)",
 color: "#4ade80",
 fontSize: 15,
 fontWeight: 700,
 }}>
            ✓ Access Verified! Redirecting to your Planner Dashboard…
          </div>
        )}

        {/* STEP 1: EMAIL REQUEST FORM */}
        {status !== "success" && step === "email" && (
          <form onSubmit={handleRequestPin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "left" }}>
              <label
 htmlFor="email-input-planner"
 style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
                Booking Email Address
              </label>
              <input
 id="email-input-planner"
 ref={emailInputRef}
 type="email"
 required
 placeholder="planner@company.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {errorMsg && (
              <div
 style={{
 padding: "10px 14px",
 borderRadius: 8,
 background: "rgba(244, 63, 94, 0.12)",
 border: "1px solid rgba(244, 63, 94, 0.3)",
 color: "#fb7185",
 fontSize: 13,
 }}>
                {errorMsg}
              </div>
            )}

            <button
 type="submit"
 disabled={status === "requesting"}
 style={{
 padding: "14px 20px",
 borderRadius: 10,
 background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
 color: "#fff",
 fontWeight: 800,
 fontSize: 14,
 border: "none",
 cursor: "pointer",
 boxShadow: "0 4px 20px rgba(168, 85, 247, 0.4)",
 }}>
              {status === "requesting" ? "Sending Code…" : "Send Verification PIN →"}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT PIN INPUT FORM */}
        {status !== "success" && step === "pin" && (
          <div>
            <div
 style={{
 display: "flex",
 justifyContent: "center",
 gap: 10,
 marginBottom: 24,
 }}>
              {digits.map((d, i) => (
                <input
 key={["slot-0", "slot-1", "slot-2", "slot-3", "slot-4", "slot-5"][i]}
 ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={() => setFocusedIndex(i)}
                  onBlur={() => setFocusedIndex(null)}
                  style={{
                    ...INPUT_STYLE,
                    borderColor: focusedIndex === i ? "#c084fc" : d ? "rgba(192, 132, 252, 0.5)" : "rgba(255, 255, 255, 0.15)",
                    boxShadow: focusedIndex === i ? "0 0 16px rgba(192, 132, 252, 0.4)" : "none",
                    background: d ? "rgba(168, 85, 247, 0.1)" : "rgba(255, 255, 255, 0.04)",
                  }}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>

            {errorMsg && (
              <div
 style={{
 padding: "10px 14px",
 borderRadius: 8,
 background: "rgba(244, 63, 94, 0.12)",
 border: "1px solid rgba(244, 63, 94, 0.3)",
 color: "#fb7185",
 fontSize: 13,
 marginBottom: 16,
 }}>
                {errorMsg}
              </div>
            )}

            <button
 type="button"
 onClick={() => handleSubmitPin(pin)}
              disabled={pin.length !== 6 || status === "submitting"}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 10,
                background: pin.length === 6 ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" : "rgba(255,255,255,0.1)",
                color: pin.length === 6 ? "#fff" : "rgba(255,255,255,0.3)",
                fontWeight: 800,
                fontSize: 14,
                border: "none",
                cursor: pin.length === 6 ? "pointer" : "not-allowed",
                boxShadow: pin.length === 6 ? "0 4px 20px rgba(168, 85, 247, 0.4)" : "none",
                marginBottom: 20,
              }}>
              {sanityContent?.submitButtonText || (status === "submitting" ? "Verifying PIN Code…" : "Access Planner Portal →")}
            </button>

            {/* Resend & Email Change links */}
            <div
 style={{
 display: "flex",
 flexDirection: "column",
 alignItems: "center",
 gap: 8,
 fontSize: 13,
 color: "rgba(255, 255, 255, 0.5)",
 }}>
              {resendStatus === "sent" ? (
                <span style={{ color: "#4ade80", fontWeight: 700 }}>✓ Code resent! Check your inbox.</span>
              ) : (
                <button
 type="button"
 onClick={handleResend}
 disabled={resendStatus === "sending"}
 style={{
 background: "none",
 border: "none",
 color: "#c084fc",
 cursor: "pointer",
 textDecoration: "underline",
 fontSize: 13,
 }}>
                  {resendStatus === "sending" ? "Sending Code…" : "Didn't receive the code? Resend Code"}
                </button>
              )}

              <button
 type="button"
 onClick={() => {
                  setStep("email");
                  setErrorMsg("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.4)",
                  cursor: "pointer",
                  fontSize: 12,
                  marginTop: 4,
                }}>
                Change Email Address
              </button>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
 href="/book"
 style={{
 fontSize: 13,
 color: "rgba(255, 255, 255, 0.4)",
 textDecoration: "none",
 fontWeight: 600,
 }}>
            ← Back to Booking Request Form
          </Link>
        </div>
      </div>
    </div>
  );
}

const CONTAINER_STYLE: React.CSSProperties = {
  width: "100%",
  maxWidth: 480,
  padding: 36,
  borderRadius: 20,
  background: "rgba(10, 10, 18, 0.85)",
  border: "1px solid rgba(168, 85, 247, 0.3)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  textAlign: "center",
  boxShadow: "0 0 35px rgba(168, 85, 247, 0.25), 0 30px 90px rgba(0, 0, 0, 0.7)",
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

export default function PlannerVerifyClient({ sanityContent }: PlannerVerifyClientProps) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#050508" }} />}>
      <PlannerVerifyContent sanityContent={sanityContent} />
    </Suspense>
  );
}
