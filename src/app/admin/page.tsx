"use client";
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMember } from "@/context/MemberContext";

const MODAL_GLASS_STYLE: React.CSSProperties = {
  background: "var(--color-bg-glass)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid var(--color-border-main)",
};

export default function AdminGatewayPage() {
  const router = useRouter();
  const { member, isLoggedIn, login, logout, hydrated } = useMember();

  /* ── Step State ── */
  const [step, setStep] = useState<"login" | "verify">("login");

  /* ── Login State ── */
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  /* ── PIN 2FA State ── */
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "checking" | "error" | "resending" | "resent">("idle");
  const [verifyError, setVerifyError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Disable page scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Handle redirect if logged in as admin AND 2FA is verified
  useEffect(() => {
    if (hydrated && isLoggedIn && member?.role === 'admin' && member.username) {
      const is2FAVerified = typeof window !== 'undefined' && sessionStorage.getItem('7h_admin_2fa_verified') === 'true';
      if (is2FAVerified) {
        router.replace(`/admin/${member.username}`);
      } else if (step === "login") {
        // Admin is logged in but hasn't done 2FA yet — send PIN and show verify step
        sendPin(member.email);
        setStep("verify");
      }
    }
  }, [hydrated, isLoggedIn, member, router, step]);

  /* ── Send PIN to admin email ── */
  const sendPin = useCallback(async (email: string) => {
    try {
      const res = await fetch("/api/auth/send-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        console.warn("Failed to send PIN: HTTP status", res.status);
        return;
      }
      const data = await res.json();
      if (!data.success) {
        console.warn("Failed to send PIN:", data.error);
      }
    } catch (err) {
      console.error("Error sending PIN:", err);
    }
  }, []);

  /* ── Handle Login (Step 1) ── */
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    try {
      const ok = await login(adminEmail, adminPassword);
      if (!ok) {
        setAdminLoginError('Invalid credentials. Please check your email and password.');
      } else {
        // Login succeeded — send PIN and switch to verify step
        await sendPin(adminEmail);
        setStep("verify");
      }
    } catch (err: any) {
      setAdminLoginError(err.message || 'Login failed');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  /* ── PIN Input Handlers ── */
  const handleDigit = (idx: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, "").slice(-1);
    setPin(prev => { const n = [...prev]; n[idx] = clean; return n; });
    if (clean && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split("");
    setPin(prev => {
      const n = [...prev];
      digits.forEach((d, i) => { n[i] = d; });
      return n;
    });
    const nextIdx = Math.min(digits.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  /* ── Verify PIN (Step 2) ── */
  const handleVerify = async () => {
    const fullPin = pin.join("");
    if (fullPin.length !== 6) return;

    setVerifyStatus("checking");
    setVerifyError("");

    try {
      const email = member?.email || adminEmail;
      const res = await fetch("/api/admin/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin: fullPin }),
      });
      if (!res.ok) {
        setVerifyStatus("error");
        setVerifyError("Verification server error.");
        return;
      }
      const data = await res.json();

      if (data.success) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("7h_admin_2fa_verified", "true");
        }
        const username = member?.username || "admin";
        router.replace(`/admin/${username}`);
      } else {
        setVerifyStatus("error");
        setVerifyError(data.error || "Invalid or expired code.");
        setPin(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setVerifyStatus("error");
      setVerifyError("Verification failed. Please try again.");
    }
  };

  /* ── Resend PIN ── */
  const handleResend = async () => {
    setVerifyStatus("resending");
    const email = member?.email || adminEmail;
    await sendPin(email);
    setVerifyStatus("resent");
    setPin(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    setTimeout(() => setVerifyStatus("idle"), 3000);
  };

  /* ── Auto-submit when all 6 digits entered ── */
  // eslint-disable-next-line react-doctor/no-fetch-in-effect, react-doctor/no-set-state-after-await-in-effect
  useEffect(() => {
    if (step === "verify" && pin.every(d => d !== "") && verifyStatus !== "checking") {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, step]);

  const [is2FAVerified, setIs2FAVerified] = useState(false);

  // Support local storage dev bypass & 2FA check
  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
      if (sessionStorage.getItem('7h_admin_2fa_verified') === 'true') {
        setIs2FAVerified(true);
      }
      const devBypass = localStorage.getItem('7h_dev_bypass') === 'true';
      if (devBypass) {
        sessionStorage.setItem("7h_admin_2fa_verified", "true");
        window.location.replace('/admin/admin');
      }
    }
  }, [hydrated]);

  if (!hydrated) {
    return <div className="min-h-screen  " />;
  }

  // If logged in as admin with 2FA verified, show loading while redirect takes place
  if (isLoggedIn && member?.role === 'admin' && is2FAVerified) {
    return (
      <div className="fixed inset-0 h-screen w-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="uppercase    font-bold">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const isWrongRole = isLoggedIn && member?.role !== 'admin' && step === "login";
  const fullPin = pin.join("");

  return (
    <div className="fixed inset-0 h-screen w-screen text-white flex items-center justify-center px-6 overflow-hidden lock-scroll-fullscreen" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Blurred Hero Background Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('/images/hero-band-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.55) blur(3px)",
          transform: "scale(1.08)",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />
      <div className="fixed inset-0 bg-black/55 backdrop-blur-[45px] z-0 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* ═══════════ STEP 1: Login Form ═══════════ */}
        {step === "login" && (
          <div
            className=" rounded-lg overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out"
            style={MODAL_GLASS_STYLE}
          >
            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-[var(--color-accent)] shadow-[0_0_24px_rgba(147,51,234,0.4)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
                  Admin <span className=" text-[var(--color-accent)]">Access</span>
                </h1>
                <p className="uppercase tracking-[0.2em] font-bold mt-2">
                  Restricted — Authorized personnel only
                </p>
              </div>

              {isWrongRole ? (
                <div className="text-center">
                  <div className="p-5 bg-purple-600/10 border border-purple-500/30 mb-6">
                    <p className="font-bold mb-1">Access Denied</p>
                    <p className="font-semibold">
                      You&apos;re logged in as <strong className="text-white font-extrabold">{member?.name}</strong> ({member?.role}).
                      Admin privileges are required to access this dashboard.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link href="/fans" className="text-[0.65rem] text-[var(--color-accent)] hover:text-purple-300 uppercase tracking-[0.15em] font-bold transition-colors">
                      ← Back to Fan Dashboard
                    </Link>
                    <button aria-label="Action button"
                      onClick={() => logout()}
                      className="text-[0.65rem] text-rose-400 hover:text-rose-300 uppercase tracking-[0.15em] font-bold transition-colors cursor-pointer"
                    >
                      Sign Out & Switch Account
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdminLogin} className="flex flex-col gap-4" autoComplete="off" data-form-type="other">
                  <div>
                    <label htmlFor="root-admin-login-email" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/50 mb-1.5 block font-bold">Email</label>
                    <input aria-label="Input field"
                      id="root-admin-login-email"
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@7thheaven.com"
                      autoComplete="off"
                      data-lpignore="true"
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 font-semibold text-white placeholder:text-white/30 outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(147,51,234,0.3)] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="root-admin-login-password" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/50 mb-1.5 block font-bold">Password</label>
                    <input aria-label="Input field"
                      id="root-admin-login-password"
                      type="password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      data-lpignore="true"
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 font-semibold text-white placeholder:text-white/30 outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(147,51,234,0.3)] transition-colors"
                      required
                    />
                  </div>

                  {adminLoginError && (
                    <p className="text-rose-400 bg-rose-500/10 px-3 py-2 border border-rose-500/20 font-bold rounded-lg text-center">{adminLoginError}</p>
                  )}

                  <button aria-label="Action button"
                    type="submit"
                    disabled={adminLoginLoading}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)]"
                  >
                    {adminLoginLoading ? "Authenticating..." : "Sign In as Admin"}
                  </button>

                  {process.env.NODE_ENV === "development" && (
                    <button aria-label="Action button"
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.setItem("7h_dev_bypass", "true");
                          sessionStorage.setItem("7h_admin_2fa_verified", "true");
                          router.replace("/admin/admin");
                        }
                      }}
                      className="w-full py-3 border border-purple-500/30 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>⚡</span> Instant Dev Access (Bypass Login)
                    </button>
                  )}
                </form>
              )}

              <p className="mt-8 text-center font-bold uppercase tracking-[0.2em]">
                7th Heaven · System Administration
              </p>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2: PIN Verification ═══════════ */}
        {step === "verify" && (
          <>
            <div className="text-center mb-8 relative z-10">
              <p className="font-bold uppercase tracking-[0.3em] mb-1">7th Heaven · Admin</p>
              <h1 className="text-white font-bold text-2xl uppercase   ">Admin 2FA Verification</h1>
              <p className="mt-1">We sent a 6-digit code to <strong className="text-purple-400">{member?.email || adminEmail}</strong></p>
            </div>

            <div
              className=" rounded-lg px-4 py-7 mb-4 transition-opacity duration-300 ease-out no-glow"
              style={{
                background: "rgba(18, 10, 34, 0.85)",
                backdropFilter: "blur(32px) saturate(180%)",
                WebkitBackdropFilter: "blur(32px) saturate(180%)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                borderRadius: 24,
                boxShadow: "0 0 35px rgba(168, 85, 247, 0.25), 0 30px 90px rgba(0, 0, 0, 0.7)",
              }}
            >
              <p className="font-bold uppercase tracking-[0.2em] text-center mb-5">Enter 6-Digit PIN</p>

              <div className="flex items-center justify-center gap-1.5 mb-6 no-glow" onPaste={handlePaste}>
                {[
                  { id: "admin-pin-slot-0", slotIndex: 0 },
                  { id: "admin-pin-slot-1", slotIndex: 1 },
                  { id: "admin-pin-slot-2", slotIndex: 2 },
                  { id: "admin-pin-slot-3", slotIndex: 3 },
                  { id: "admin-pin-slot-4", slotIndex: 4 },
                  { id: "admin-pin-slot-5", slotIndex: 5 },
                ].map(({ id, slotIndex: i }) => {
                  const digit = pin[i];
                  return (
                    <div key={id} className="input-glow-border !w-11 !h-14 rounded-lg shrink-0">
                      <input aria-label={`Admin PIN digit ${i + 1}`}
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        style={{ padding: 0 }}
                        onFocus={() => setFocusedIndex(i)}
                        onBlur={() => setFocusedIndex(null)}
                        onChange={e => handleDigit(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className={`w-full h-full text-center text-xl font-bold rounded-lg border-2 bg-black/70 !p-0 outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 tabular-nums ${focusedIndex === i ? 'border-purple-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.95)] bg-purple-950/80 scale-[1.08] z-10 relative'
                          : digit
                            ? 'border-purple-500/80 text-purple-300 shadow-[0_0_14px_rgba(147,51,234,0.4)]'
                            : ' border-white/10  text-white/40 hover:border-white/40'
                          }`}
                      />
                    </div>
                  );
                })}
              </div>

              {verifyError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <p className="text-red-400 font-bold">{verifyError}</p>
                </div>
              )}

              <button aria-label="Action button"
                onClick={handleVerify}
                disabled={fullPin.length < 6 || verifyStatus === 'checking'}
                style={{
                  opacity: fullPin.length < 6 ? 0.35 : 1,
                  background: fullPin.length < 6
                    ? "rgba(168,85,247,0.15)"
                    : "linear-gradient(135deg, #7c00ff, #a855f7)",
                  border: "none",
                  color: fullPin.length < 6 ? "rgba(255,255,255,0.4)" : "#fff",
                  boxShadow: fullPin.length === 6 ? "0 0 25px rgba(168,85,247,0.4)" : "none",
                  transition: "all 0.25s ease",
                }}
                className="w-full py-3.5 font-bold uppercase    cursor-pointer rounded-lg mb-4 disabled:cursor-not-allowed"
              >
                {verifyStatus === 'checking' ? 'Verifying...' : 'Access My Dashboard →'}
              </button>

              {/* Resend section */}
              <div className="mt-4 text-center">
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                  Didn&apos;t receive the code?
                </p>
                <button aria-label="Action button"
                  type="button"
                  onClick={handleResend}
                  disabled={verifyStatus === "resending"}
                  style={{
                    background: "none",
                    border: "none",
                    color: verifyStatus === "resent" ? "#34d399" : "#a855f7",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {verifyStatus === "resending" ? "Sending…" : verifyStatus === "resent" ? "✓ Code resent!" : "Resend Code"}
                </button>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "18px 0" }} />

              {/* Back to login */}
              <button aria-label="Action button"
                type="button"
                onClick={() => {
                  setStep("login");
                  setPin(["", "", "", "", "", ""]);
                  setVerifyError("");
                  setVerifyStatus("idle");
                  logout();
                }}
                style={{ display: "block", width: "100%", textAlign: "center", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}
              >
                ← Back to Login
              </button>

              {/* Brand footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                  7TH HEAVEN · ADMIN ACCESS
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
