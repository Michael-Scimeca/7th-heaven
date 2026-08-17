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
    <>

      <div className={`cruise-verify-root ${outfit.className}`}>
        {/* Cruise page rendered behind as a blurred backdrop */}
        <div className="cruise-bg-image" />

        {/* Frosted overlay */}
        <div className="cruise-overlay" />

        {/* Modal */}
        <div className="cruise-modal-wrap">
          <div className="verify-card">
            {status === "success" ? (
              <div className="success-wrap">
                <h1 className="success-title">Access Granted!</h1>
                <p className="success-sub">
                  Your Cruise Member account is confirmed.<br />
                  Welcome aboard the 7th Heaven Caribbean Cruise.
                </p>
                <Link href="/cruise/dashboard" className="success-redirect-btn">
                  Access My Dashboard →
                </Link>
              </div>
            ) : (
              <>
                {/* Eyebrow */}
                <div className="eyebrow-wrap">
                  <span className="cruise-eyebrow">7th Heaven Caribbean Cruise</span>
                </div>

                <h1 className="card-title">Check Your Email</h1>
                <p className="card-subtitle">
                  We sent a 6-digit verification code to
                </p>
                <div className="text-center">
                  <p className="email-highlight">{email || "your email address"}</p>
                </div>

                {/* Progress bar */}
                <div className="progress-bar-wrap">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(filled / 6) * 100}%` }}
                  />
                </div>

                {/* PIN form */}
                <form onSubmit={handleSubmit}>
                  <div className="pin-row">
                    {Array.from(digits, (d, i) => ({ d, i })).map(({ d, i }) => (
                      <div key={i} className="input-glow-border pin-input-wrap">
                        <input aria-label="Input field"
                          ref={el => { inputRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          style={{ padding: 0 }}
                          onChange={e => handleDigit(i, e.target.value)}
                          onKeyDown={e => handleKeyDown(i, e)}
                          onPaste={handlePaste}
                          className={[
                            "pin-input",
                            d ? "filled" : "",
                            status === "error" ? "error" : "",
                          ].join(" ")}
                        />
                      </div>
                    ))}
                  </div>

                  {errorMsg && <div className="error-msg">{errorMsg}</div>}

                  <button aria-label="Action button"
                    type="submit"
                    disabled={pin.length !== 6 || status === "submitting"}
                    className="submit-btn"
                  >
                    {status === "submitting" ? "Verifying…" : "Access My Dashboard →"}
                  </button>
                </form>

                {/* Resend */}
                <div className="resend-section">
                  <p className="resend-label">Didn&apos;t receive the code?</p>
                  {resendStatus === "sent" ? (
                    <p style={{ color: "rgba(52,211,153,0.9)", fontSize: 12, fontWeight: 700 }}>
                      ✓ Code resent! Check your inbox.
                    </p>
                  ) : (
                    <button aria-label="Action button"
                      onClick={handleResend}
                      disabled={resendStatus === "sending"}
                      className="resend-btn"
                    >
                      {resendStatus === "sending" ? "Sending…" : "Resend Code"}
                    </button>
                  )}
                </div>

                <div className="divider" />

                {/* Back link */}
                <Link href="/cruise" className="back-link">← Back to Cruise Page</Link>

                {/* Brand footer */}
                <div className="cruise-brand">
                  <div className="cruise-brand-line" />
                  <span className="cruise-brand-text">7th Heaven · Caribbean Cruise 2025</span>
                  <div className="cruise-brand-line" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
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
