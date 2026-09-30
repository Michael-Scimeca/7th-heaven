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
    <div className="fixed inset-0 bg-[url('/images/hero/hero-band-bg.png')] bg-cover bg-center brightness-[0.35] blur-[3px] scale-[1.08] z-0 pointer-events-none" />
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-1 pointer-events-none" />
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
  const [status, setStatus] = useState<
    "idle" | "requesting" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
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
    if (e.key === "Backspace" && !digits[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, idx) => {
      next[idx] = char;
    });
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
        setErrorMsg(
          data.error || "No active booking request found for this email.",
        );
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const handleSubmitPin = useCallback(
    async (pinCode: string) => {
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
          const dest =
            data.redirectUrl || `/planner/dashboard?token=${data.token || ""}`;
          if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
          redirectTimerRef.current = setTimeout(() => {
            router.push(dest);
          }, 1800);
        } else {
          const data = await res.json().catch(() => ({}));
          setErrorMsg(
            data.error ||
            "Invalid verification code. Please check and try again.",
          );
          setStatus("error");
          setDigits(["", "", "", "", "", ""]);
          if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
          focusTimerRef.current = setTimeout(
            () => inputRefs.current[0]?.focus(),
            50,
          );
        }
      } catch {
        setErrorMsg("Network error. Please check your connection.");
        setStatus("error");
      }
    },
    [email, router],
  );

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
    <main id="planner-verify-page" className="min-h-screen flex items-center justify-center p-4 bg-[#050508] text-white font-sans">
      {renderBg()}

      <section id="planner-verify" aria-labelledby="planner-verify-heading" className="section relative">
        <div className="w-full max-w-[480px] p-9 rounded-[var(--radius-box)] bg-[#0a0a12]/85 border border-purple-500/30 backdrop-blur-xl text-center shadow-[0_0_35px_rgba(168,85,247,0.25),0_30px_90px_rgba(0,0,0,0.7)] relative overflow-hidden z-10">
          {/* Top Header Badge */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/12 border border-purple-500/30 text-xs tracking-[1.5px] text-purple-400">
              📅 Event Planner Portal
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 id="planner-verify-heading" className="text-[26px] font-black tracking-[-0.02em] mb-2 text-white">
            {sanityContent?.heroHeading ||
              sanityContent?.title ||
              (step === "email"
                ? "Access Booking Portal"
                : "Verify Your Access Code")}
          </h1>

          <p className="text-sm text-white/65 leading-normal mb-7">
            {sanityContent?.heroSubheading ||
              sanityContent?.subtitle ||
              (step === "email" ? (
                "Enter the email address used for your booking request to receive a 6-digit access code."
              ) : (
                <>
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-purple-400">
                    {email || "your email"}
                  </strong>
                </>
              ))}
          </p>

          {/* SUCCESS STATE */}
          {status === "success" && (
            <div className="p-6 rounded-[var(--radius-box)] bg-green-500/10 border border-green-500/30 text-green-400 text-base">
              ✓ Access Verified! Redirecting to your Planner Dashboard…
            </div>
          )}

          {/* STEP 1: EMAIL REQUEST FORM */}
          {status !== "success" && step === "email" && (
            <form onSubmit={handleRequestPin} className="flex flex-col gap-4">
              <div className="text-left">
                <label htmlFor="email-input-planner" className="block">
                  Booking Email Address
                </label>
                <input id="email-input-planner" ref={emailInputRef} type="email" required placeholder="planner@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 rounded-[var(--radius-box)] bg-white/[0.06] border border-white/20 text-white text-base outline-none box-border" />
              </div>

              {errorMsg && (
                <div className="px-3.5 py-2.5 rounded-[var(--radius-box)] bg-rose-500/12 border border-rose-500/30 text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={status === "requesting"} className="px-5 py-3.5 rounded-[var(--radius-box)] bg-gradient-to-br from-purple-500 to-purple-700 text-white font-extrabold text-sm border-none cursor-pointer shadow-[0_4px_20px_rgba(168,85,247,0.4)]">
                {status === "requesting"
                  ? "Sending Code…"
                  : "Send Verification PIN →"}
              </button>
            </form>
          )}

          {/* STEP 2: 6-DIGIT PIN INPUT FORM */}
          {status !== "success" && step === "pin" && (
            <div>
              <div className="flex justify-center gap-2.5 mb-6">
                {digits.map((d, i) => (
                  <input
                    key={
                      [
                        "slot-0",
                        "slot-1",
                        "slot-2",
                        "slot-3",
                        "slot-4",
                        "slot-5",
                      ][i]
                    }
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
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
                      borderColor:
                        focusedIndex === i
                          ? "#c084fc"
                          : d
                            ? "rgba(192, 132, 252, 0.5)"
                            : "rgba(255, 255, 255, 0.15)",
                      boxShadow:
                        focusedIndex === i
                          ? "0 0 16px rgba(192, 132, 252, 0.4)"
                          : "none",
                      background: d
                        ? "rgba(168, 85, 247, 0.1)"
                        : "rgba(255, 255, 255, 0.04)",
                    }}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="px-3.5 py-2.5 rounded-[var(--radius-box)] bg-rose-500/12 border border-rose-500/30 text-rose-400 text-xs mb-4">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSubmitPin(pin)}
                disabled={pin.length !== 6 || status === "submitting"}
                className={`w-full py-3.5 px-5 rounded-[var(--radius-box)] font-extrabold text-sm border-0 mb-5 transition-[background-color,color,border-color,box-shadow,transform] ${pin.length === 6
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white cursor-pointer shadow-[0_4px_20px_rgba(168,85,247,0.4)]"
                    : "bg-white/10 text-white/30 cursor-not-allowed shadow-none"
                  } `}
              >
                {sanityContent?.submitButtonText ||
                  (status === "submitting"
                    ? "Verifying PIN Code…"
                    : "Access Planner Portal →")}
              </button>

              {/* Resend & Email Change links */}
              <div className="flex flex-col items-center gap-2 text-xs text-white/50">
                {resendStatus === "sent" ? (
                  <span className="text-green-400">
                    ✓ Code resent! Check your inbox.
                  </span>
                ) : (
                  <button type="button" onClick={handleResend} disabled={resendStatus === "sending"} className="bg-transparent border-none text-purple-400 cursor-pointer underline text-xs">
                    {resendStatus === "sending"
                      ? "Sending Code…"
                      : "Didn't receive the code? Resend Code"}
                  </button>
                )}

                <button type="button" onClick={() => { setStep("email"); setErrorMsg(""); }} className="bg-transparent border-none text-white/40 cursor-pointer text-xs mt-1">
                  Change Email Address
                </button>
              </div>
            </div>
          )}

          {/* Back Link */}
          <div className="mt-7 pt-4 border-t border-white/[0.08]">
            <Link href="/book" className="text-xs text-white/40 no-underline font-semibold">
              ← Back to Booking Request Form
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  width: 52,
  height: 64,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 28,
  fontWeight: 800,
  textAlign: "center",
  outline: "none",
  caretColor: "#a855f7",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function PlannerVerifyClient({
  sanityContent,
}: PlannerVerifyClientProps) {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#050508]" />}
    >
      <PlannerVerifyContent sanityContent={sanityContent} />
    </Suspense>
  );
}
