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
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; }

        .cruise-verify-root {
          min-height: 100vh;
          background: #020818;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        /* Ocean gradient layers */
        .ocean-bg {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(6,182,212,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(14,165,233,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 60%),
            linear-gradient(180deg, #020818 0%, #041025 50%, #02101e 100%);
          pointer-events: none;
        }

        /* Animated wave lines */
        .wave-lines {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 200px;
          pointer-events: none;
          opacity: 0.15;
        }
        .wave {
          position: absolute;
          width: 200%;
          height: 80px;
          background: linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent);
          border-radius: 50%;
          animation: waveMove 8s ease-in-out infinite;
        }
        .wave:nth-child(2) { animation-delay: -3s; animation-duration: 10s; opacity: 0.6; bottom: 20px; }
        .wave:nth-child(3) { animation-delay: -6s; animation-duration: 12s; opacity: 0.4; bottom: 40px; }
        @keyframes waveMove {
          0%, 100% { transform: translateX(-25%) scaleY(1); }
          50% { transform: translateX(0%) scaleY(1.2); }
        }

        /* Floating particles */
        .particle {
          position: fixed;
          width: 2px;
          height: 2px;
          background: rgba(6,182,212,0.6);
          border-radius: 50%;
          animation: float 12s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120px) translateX(30px); opacity: 0; }
        }

        .verify-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 460px;
          background: rgba(4, 16, 37, 0.92);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(6,182,212,0.22);
          border-radius: 28px;
          padding: 40px 40px 36px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 32px 80px rgba(0,0,0,0.6),
            0 0 80px rgba(6,182,212,0.08);
          animation: cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        /* Ship badge */
        .ship-badge {
          width: 64px;
          height: 64px;
          margin: 0 auto 18px;
          background: linear-gradient(135deg, rgba(6,182,212,0.25), rgba(14,165,233,0.12));
          border: 1px solid rgba(6,182,212,0.35);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          box-shadow: 0 8px 24px rgba(6,182,212,0.2), 0 0 0 1px rgba(6,182,212,0.1) inset;
          animation: badgePulse 3s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 8px 24px rgba(6,182,212,0.15), 0 0 0 1px rgba(6,182,212,0.1) inset; }
          50%       { box-shadow: 0 8px 32px rgba(6,182,212,0.3),  0 0 0 1px rgba(6,182,212,0.2) inset; }
        }

        .cruise-eyebrow {
          text-align: center;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(6,182,212,0.8);
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.15);
          border-radius: 100px;
          padding: 4px 14px;
          display: inline-block;
          margin: 0 auto 20px;
        }

        .eyebrow-wrap { text-align: center; margin-bottom: 16px; }

        .card-title {
          text-align: center;
          font-size: 26px;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .card-subtitle {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          line-height: 1.5;
          margin-bottom: 4px;
        }
        .email-highlight {
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: rgba(6,182,212,0.9);
          margin-bottom: 28px;
          word-break: break-all;
        }

        /* PIN inputs */
        .pin-row {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 24px;
        }
        .pin-input {
          width: 58px;
          height: 66px;
          text-align: center;
          font-size: 28px;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          background: rgba(6,182,212,0.04);
          border: 2px solid rgba(6,182,212,0.15);
          border-radius: 14px;
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
          height: 3px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          margin-bottom: 28px;
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
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 20px;
          padding: 10px 16px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #06b6d4, #0ea5e9);
          border: none;
          border-radius: 14px;
          color: #020818;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
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
          margin-top: 24px;
          text-align: center;
        }
        .resend-label {
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          margin-bottom: 8px;
        }
        .resend-btn {
          background: none;
          border: none;
          color: rgba(6,182,212,0.7);
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
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
          margin: 24px 0;
        }

        .back-link {
          display: block;
          text-align: center;
          color: rgba(255,255,255,0.2);
          font-size: 12px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover { color: rgba(255,255,255,0.5); }

        /* Success state */
        .success-wrap {
          text-align: center;
          padding: 16px 0;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(14,165,233,0.1));
          border: 2px solid rgba(6,182,212,0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 0 40px rgba(6,182,212,0.2);
        }
        @keyframes successPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .success-title {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 10px;
        }
        .success-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .success-redirect {
          font-size: 11px;
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

        /* Cruise branding footer */
        .cruise-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        .cruise-brand-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.04);
        }
        .cruise-brand-text {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.12);
        }
      `}</style>

      <div className="cruise-verify-root">
        {/* Background */}
        <div className="ocean-bg" />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${10 + i * 12}%`,
              bottom: `${10 + (i % 3) * 15}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${10 + i * 2}s`,
            }}
          />
        ))}

        {/* Wave effect */}
        <div className="wave-lines">
          <div className="wave" />
          <div className="wave" />
          <div className="wave" />
        </div>

        {/* Card */}
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
                  <p style={{ color: "rgba(34,197,94,0.8)", fontSize: 12, fontWeight: 700 }}>
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
              <div className="cruise-brand" style={{ marginTop: 20 }}>
                <div className="cruise-brand-line" />
                <span className="cruise-brand-text">7th Heaven · Caribbean Cruise 2025</span>
                <div className="cruise-brand-line" />
              </div>
            </>
          )}
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
