"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";

function CruiseVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
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
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Invalid code. Please try again.");
        setStatus("error");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } else {
        setStatus("success");
        const destination = data.redirectUrl || "/cruise/dashboard";
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
          background: url('/sitemap-screenshots/cruise.png') center top / cover no-repeat;
          filter: blur(3px) brightness(0.35);
          pointer-events: none;
          transform: scale(1.05);
        }

        /* Frosted overlay */
        .cruise-overlay {
          position: absolute;
          inset: 0;
          background: rgba(2, 8, 24, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
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
          max-width: 380px;
          background: rgba(4, 16, 37, 0.95);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(6,182,212,0.25);
          border-radius: 24px;
          padding: 32px 28px 28px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 32px 80px rgba(0,0,0,0.7),
            0 0 120px rgba(6,182,212,0.1);
          animation: cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        /* Ship badge — compact */
        .ship-badge {
          width: 48px;
          height: 48px;
          margin: 0 auto 14px;
          background: linear-gradient(135deg, rgba(6,182,212,0.25), rgba(14,165,233,0.12));
          border: 1px solid rgba(6,182,212,0.35);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 6px 20px rgba(6,182,212,0.2), 0 0 0 1px rgba(6,182,212,0.1) inset;
          animation: badgePulse 3s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 6px 20px rgba(6,182,212,0.15), 0 0 0 1px rgba(6,182,212,0.1) inset; }
          50%       { box-shadow: 0 6px 28px rgba(6,182,212,0.3),  0 0 0 1px rgba(6,182,212,0.2) inset; }
        }

        .cruise-eyebrow {
          text-align: center;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(6,182,212,0.8);
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.15);
          border-radius: 100px;
          padding: 3px 12px;
          display: inline-block;
        }

        .eyebrow-wrap { text-align: center; margin-bottom: 14px; }

        .card-title {
          text-align: center;
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .card-subtitle {
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          line-height: 1.5;
          margin-bottom: 2px;
        }
        .email-highlight {
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: rgba(6,182,212,0.9);
          margin-bottom: 20px;
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
          width: 46px;
          height: 54px;
          text-align: center;
          font-size: 24px;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          background: rgba(6,182,212,0.04);
          border: 2px solid rgba(6,182,212,0.15);
          border-radius: 12px;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
          caret-color: transparent;
        }
        .pin-input:focus {
          border-color: rgba(6,182,212,0.7);
          background: rgba(6,182,212,0.06);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.12), 0 0 20px rgba(6,182,212,0.15);
        }
        .pin-input.filled {
          border-color: rgba(6,182,212,0.5);
          background: rgba(6,182,212,0.05);
          box-shadow: 0 0 12px rgba(6,182,212,0.1);
        }
        .pin-input.error {
          border-color: rgba(239,68,68,0.5);
          background: rgba(239,68,68,0.05);
          box-shadow: 0 0 12px rgba(239,68,68,0.1);
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
          height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(6,182,212,0.8), rgba(14,165,233,1));
          border-radius: 10px;
          transition: width 0.3s ease;
          box-shadow: 0 0 8px rgba(6,182,212,0.4);
        }

        .error-msg {
          text-align: center;
          color: rgba(239,68,68,0.9);
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 14px;
          padding: 8px 12px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #06b6d4, #0ea5e9);
          border: none;
          border-radius: 12px;
          color: #020818;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(6,182,212,0.25);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(6,182,212,0.35); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Resend section */
        .resend-section {
          margin-top: 16px;
          text-align: center;
        }
        .resend-label {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          margin-bottom: 4px;
        }
        .resend-btn {
          background: none;
          border: none;
          color: rgba(6,182,212,0.7);
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s;
        }
        .resend-btn:hover:not(:disabled) { color: rgba(6,182,212,1); }
        .resend-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 16px 0;
        }

        .back-link {
          display: block;
          text-align: center;
          color: rgba(255,255,255,0.2);
          font-size: 11px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover { color: rgba(255,255,255,0.5); }

        /* Success state */
        .success-wrap {
          text-align: center;
          padding: 10px 0;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(14,165,233,0.1));
          border: 2px solid rgba(6,182,212,0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 0 40px rgba(6,182,212,0.2);
        }
        @keyframes successPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .success-title {
          font-size: 26px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 8px;
        }
        .success-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .success-redirect {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(6,182,212,0.8);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Brand footer */
        .cruise-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
        }
        .cruise-brand-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.04);
        }
        .cruise-brand-text {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.12);
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
                <div className="success-icon">🚢</div>
                <h1 className="success-title">You&apos;re In!</h1>
                <p className="success-sub">
                  Your Cruise Member account is confirmed.<br />
                  Welcome aboard the 7th Heaven Caribbean Cruise.
                </p>
                <p className="success-redirect">⚓ Heading to your Cruise Lounge…</p>
              </div>
            ) : (
              <>
                {/* Ship badge */}
                <div className="ship-badge">🛳️</div>

                {/* Eyebrow */}
                <div className="eyebrow-wrap">
                  <span className="cruise-eyebrow">7th Heaven Caribbean Cruise</span>
                </div>

                <h1 className="card-title">Check Your Email</h1>
                <p className="card-subtitle">
                  We sent a 6-digit verification code to
                </p>
                <p className="email-highlight">{email || "your email address"}</p>

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
                        onPaste={handlePaste}
                        className={[
                          "pin-input",
                          d ? "filled" : "",
                          status === "error" ? "error" : "",
                        ].join(" ")}
                      />
                    ))}
                  </div>

                  {errorMsg && <div className="error-msg">{errorMsg}</div>}

                  <button
                    type="submit"
                    disabled={pin.length !== 6 || status === "submitting"}
                    className="submit-btn"
                  >
                    {status === "submitting" ? "⚓ Verifying…" : "🛳️ Board the Cruise"}
                  </button>
                </form>

                {/* Resend */}
                <div className="resend-section">
                  <p className="resend-label">Didn&apos;t receive the code?</p>
                  {resendStatus === "sent" ? (
                    <p style={{ color: "rgba(34,197,94,0.8)", fontSize: 11, fontWeight: 700 }}>
                      ✓ Code resent! Check your inbox.
                    </p>
                  ) : (
                    <button
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
                <a href="/cruise" className="back-link">← Back to Cruise Page</a>

                {/* Brand footer */}
                <div className="cruise-brand" style={{ marginTop: 14 }}>
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
