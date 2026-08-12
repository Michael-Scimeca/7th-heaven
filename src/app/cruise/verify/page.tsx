/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";

function CruiseVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');

        .cruise-verify-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          font-family: 'Outfit', sans-serif;
        }

        /* Cruise page background behind the modal */
        .cruise-bg-image {
          position: absolute;
          inset: 0;
          background: url('/images/cruise-verify-bg.jpg') center center / cover no-repeat;
          filter: brightness(0.45) blur(16px);
          pointer-events: none;
          transform: scale(1.08);
        }

        /* Frosted overlay */
        .cruise-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(15, 6, 28, 0.45), rgba(8, 2, 16, 0.8));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* Modal container */
        .cruise-modal-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 10;
        }

        .verify-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(18, 10, 34, 0.85);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(168, 85, 247, 0.4);
          border-radius: 24px;
          padding: 36px 28px 28px;
          box-shadow:
            0 0 35px rgba(168, 85, 247, 0.25),
            0 30px 90px rgba(0, 0, 0, 0.7);
          animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        .cruise-eyebrow {
          text-align: center;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(168,85,247,0.9);
          background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.3);
          border-radius: 100px;
          padding: 4px 14px;
          display: inline-block;
        }

        .eyebrow-wrap { text-align: center; margin-bottom: 16px; }

        .card-title {
          text-align: center;
          font-size: 24px;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .card-subtitle {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
          margin-bottom: 6px;
        }
        .email-highlight {
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: #a855f7;
          background: rgba(168,85,247,0.15);
          border: 1px solid rgba(168,85,247,0.3);
          border-radius: 8px;
          padding: 6px 12px;
          display: inline-block;
          margin: 0 auto 20px;
          word-break: break-all;
        }

        /* PIN inputs — compact */
        .pin-row {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-bottom: 18px;
        }
        .pin-input {
          width: 44px;
          height: 54px;
          text-align: center;
          font-size: 20px;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          background: rgba(0, 0, 0, 0.7);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: #fff;
          outline: none;
          padding: 0 !important;
          transition: all 0.2s ease;
          caret-color: transparent;
        }
        .pin-input:focus {
          border-color: #a855f7;
          background: rgba(58, 12, 92, 0.8);
          box-shadow: 0 0 25px rgba(168,85,247,0.95), inset 0 0 15px rgba(168,85,247,0.3);
          transform: scale(1.08);
          z-index: 10;
          position: relative;
        }
        .pin-input.filled {
          border-color: rgba(168,85,247,0.8);
          color: #d8b4fe;
          box-shadow: 0 0 14px rgba(147,51,234,0.4);
        }
        .pin-input.error {
          border-color: rgba(239,68,68,0.7);
          background: rgba(239,68,68,0.1);
          box-shadow: 0 0 14px rgba(239,68,68,0.3);
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        /* Progress bar */
        .progress-bar-wrap {
          height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 10px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c00ff, #a855f7);
          border-radius: 10px;
          transition: opacity 0.3s ease, transform 0.3s ease;
          box-shadow: 0 0 12px rgba(168,85,247,0.5);
        }

        .error-msg {
          text-align: center;
          color: #f87171;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 16px;
          padding: 10px 14px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 8px;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #7c00ff, #a855f7);
          border: none;
          border-radius: 14px !important;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 20px rgba(168,85,247,0.35);
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(168,85,247,0.6);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled {
          background: rgba(168,85,247,0.15);
          color: rgba(255,255,255,0.4);
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Resend section */
        .resend-section {
          margin-top: 16px;
          text-align: center;
        }
        .resend-label {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 4px;
        }
        .resend-btn {
          background: none;
          border: none;
          color: rgba(168,85,247,0.85);
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .resend-btn:hover:not(:disabled) { color: #a855f7; }
        .resend-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 18px 0;
        }

        .back-link {
          display: block;
          text-align: center;
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover { color: #a855f7; }

        /* Success state */
        .success-wrap {
          text-align: center;
          padding: 10px 0;
        }
        .success-title {
          font-size: 26px;
          font-weight: 900;
          color: #34d399;
          margin-bottom: 8px;
        }
        .success-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .success-redirect-btn {
          display: inline-block;
          width: 100%;
          background: linear-gradient(135deg,#10b981,#059669);
          border-radius: 12px;
          padding: 14px;
          color: #fff;
          font-weight: 800;
          font-size: 15px;
          text-decoration: none;
          box-shadow: 0 0 20px rgba(16,185,129,0.4);
        }

        /* Brand footer */
        .cruise-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }
        .cruise-brand-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .cruise-brand-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }
      `}</style>

      <div className="cruise-verify-root">
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
                      <div
                        key={i}
                        className={`input-glow-border pin-box-wrapper w-11 h-14 rounded-xl shrink-0 transition-all duration-200 ${focusedIndex === i ? 'active scale-[1.05] z-10' : ''}`}
                      >
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
                          onPaste={handlePaste}
                          className={[
                            "pin-input w-full h-full text-center text-xl font-black rounded-xl bg-white/10 border-none text-white !p-0 outline-none transition-all duration-200 tabular-nums",
                            focusedIndex === i ? "text-white bg-purple-950/70 shadow-[0_0_20px_rgba(168,85,247,0.5)]" : "",
                            d ? "filled text-purple-300 bg-white/15" : "text-white/40 hover:bg-white/15",
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
