"use client";
/* eslint-disable react-doctor/no-high-complexity-react-function */
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMember } from "@/context/MemberContext";

const MODAL_GLASS_STYLE: React.CSSProperties = {
  background: "var(--color-bg-glass)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid var(--color-border-main)",
};

export default function AdminGatewayPage() {
  const router = useRouter();
  const { member, isLoggedIn, login, logout, hydrated } = useMember();

  /* ── Step State ── */
  const [step, setStep] = useState<"login" | "verify">("login");

  /* ── Login State ── */
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  /* ── PIN 2FA State ── */
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<
    "idle" | "checking" | "error" | "resending" | "resent"
  >("idle");
  const [verifyError, setVerifyError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Disable page scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Handle redirect if logged in as admin AND 2FA is verified
  useEffect(() => {
    if (hydrated && isLoggedIn && member?.role === "admin" && member.username) {
      const is2FAVerified =
        typeof window !== "undefined" &&
        sessionStorage.getItem("7h_admin_2fa_verified") === "true";
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
    setAdminLoginError("");
    setAdminLoginLoading(true);

    try {
      const ok = await login(adminEmail, adminPassword);
      if (!ok) {
        setAdminLoginError(
          "Invalid credentials. Please check your email and password.",
        );
      } else {
        // Login succeeded — send PIN and switch to verify step
        await sendPin(adminEmail);
        setStep("verify");
      }
    } catch (err: any) {
      setAdminLoginError(err.message || "Login failed");
    } finally {
      setAdminLoginLoading(false);
    }
  };

  /* ── PIN Input Handlers ── */
  const handleDigit = (idx: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, "").slice(-1);
    setPin((prev) => {
      const n = [...prev];
      n[idx] = clean;
      return n;
    });
    if (clean && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split("");
    setPin((prev) => {
      const n = [...prev];
      digits.forEach((d, i) => {
        n[i] = d;
      });
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
    if (
      step === "verify" &&
      pin.every((d) => d !== "") &&
      verifyStatus !== "checking"
    ) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, step]);

  const [is2FAVerified, setIs2FAVerified] = useState(false);

  // Support local storage dev bypass & 2FA check
  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      if (sessionStorage.getItem("7h_admin_2fa_verified") === "true") {
        setIs2FAVerified(true);
      }
      const devBypass = localStorage.getItem("7h_dev_bypass") === "true";
      if (devBypass) {
        sessionStorage.setItem("7h_admin_2fa_verified", "true");
        window.location.replace("/admin/admin");
      }
    }
  }, [hydrated]);

  if (!hydrated) {
    return <div className="min-h-screen" />;
  }

  // If logged in as admin with 2FA verified, show loading while redirect takes place
  if (isLoggedIn && member?.role === "admin" && is2FAVerified) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-lg border-4 border-purple-500 border-t-transparent" />
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const isWrongRole =
    isLoggedIn && member?.role !== "admin" && step === "login";
  const fullPin = pin.join("");

  return (
    <main
      id="admin-gateway-page"
      className="lock-scroll-fullscreen fixed inset-0 flex h-screen w-screen items-center justify-center overflow-hidden px-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Blurred Hero Background Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('/images/hero/hero-band-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.55) blur(3px)",
          transform: "scale(1.08)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/55 backdrop-blur-2xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* ═══════════ STEP 1: Login Form ═══════════ */}
        {step === "login" && (
          <div
            className="overflow-hidden rounded-lg shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
            style={MODAL_GLASS_STYLE}
          >
            <div className="p-8 sm:p-10">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-purple-500/30 bg-purple-600/10 shadow-[0_0_24px_rgba(147,51,234,0.4)]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h1>
                  Admin{" "}
                  <span className="text-[var(--color-accent)]">Access</span>
                </h1>
                <p className="mt-2">Restricted — Authorized personnel only</p>
              </div>

              {isWrongRole ? (
                <div className="text-center">
                  <div className="mb-6 border border-purple-500/30 bg-purple-600/10 p-5">
                    <p className="mb-1">Access Denied</p>
                    <p>
                      You&apos;re logged in as <strong>{member?.name}</strong> (
                      {member?.role}). Admin privileges are required to access
                      this dashboard.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link href="/fans" className="hover: text-[0.65rem]">
                      ← Back to Fan Dashboard
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="cursor-pointer text-[0.65rem] text-rose-400 hover:text-rose-300"
                    >
                      Sign Out & Switch Account
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleAdminLogin}
                  className="flex flex-col gap-4"
                  autoComplete="off"
                  data-form-type="other"
                >
                  <div>
                    <label
                      htmlFor="root-admin-login-email"
                      className="mb-1.5 block text-[0.65rem] text-white/50"
                    >
                      Email
                    </label>
                    <input
                      id="root-admin-login-email"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@7thheaven.com"
                      autoComplete="off"
                      data-lpignore="true"
                      className="placeholder: focus-ring w-full border border-white/10 bg-black/50 px-4 py-3 text-white/30 outline-none focus:shadow-[0_0_12px_rgba(147,51,234,0.3)]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="root-admin-login-password"
                      className="mb-1.5 block text-[0.65rem] text-white/50"
                    >
                      Password
                    </label>
                    <input
                      id="root-admin-login-password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      data-lpignore="true"
                      className="placeholder: focus-ring w-full border border-white/10 bg-black/50 px-4 py-3 text-white/30 outline-none focus:shadow-[0_0_12px_rgba(147,51,234,0.3)]"
                      required
                    />
                  </div>

                  {adminLoginError && (
                    <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-center text-rose-400">
                      {adminLoginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={adminLoginLoading}
                    className="btn-primary w-full cursor-pointer rounded-lg py-3.5 disabled:opacity-50"
                  >
                    {adminLoginLoading
                      ? "Authenticating..."
                      : "Sign In as Admin"}
                  </button>

                  {process.env.NODE_ENV === "development" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.setItem("7h_dev_bypass", "true");
                          sessionStorage.setItem(
                            "7h_admin_2fa_verified",
                            "true",
                          );
                          router.replace("/admin/admin");
                        }
                      }}
                      className="btn-action-purple flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3"
                    >
                      <span>⚡</span> Instant Dev Access (Bypass Login)
                    </button>
                  )}
                </form>
              )}

              <p className="mt-8 text-center">
                7th Heaven · System Administration
              </p>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2: PIN Verification ═══════════ */}
        {step === "verify" && (
          <>
            <div className="relative z-10 mb-8 text-center">
              <p className="mb-1">7th Heaven · Admin</p>
              <h2 className="mb-2 text-xl">Admin 2FA Verification</h2>
              <p>
                We sent a 6-digit code to{" "}
                <strong className="text-purple-400">
                  {member?.email || adminEmail}
                </strong>
              </p>
            </div>

            <div
              className="no-glow mb-6 rounded-lg px-4 py-7"
              style={{
                background: "rgba(18, 10, 34, 0.85)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                borderRadius: 24,
                boxShadow:
                  "0 0 35px rgba(168, 85, 247, 0.25), 0 30px 90px rgba(0, 0, 0, 0.7)",
              }}
            >
              <p className="mb-5 text-center">Enter 6-Digit PIN</p>

              <div
                className="no-glow mb-6 flex items-center justify-center gap-1.5"
                onPaste={handlePaste}
              >
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
                    <div
                      key={id}
                      className="input-glow-border !h-14 !w-11 shrink-0 rounded-lg"
                    >
                      <input
                        aria-label={`Admin PIN digit ${i + 1}`}
                        ref={(el) => {
                          inputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        style={{ padding: 0 }}
                        onFocus={() => setFocusedIndex(i)}
                        onBlur={() => setFocusedIndex(null)}
                        onChange={(e) => handleDigit(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className={`h-full w-full rounded-lg border-2 bg-black/70 !p-0 text-center text-xl tabular-nums transition-[border-color,background-color,box-shadow,transform] outline-none ${focusedIndex === i ? "relative z-10 scale-[1.08] border-purple-400 bg-purple-950/80 shadow-[0_0_25px_rgba(168,85,247,0.95)]" : digit ? "border-purple-500/80 shadow-[0_0_14px_rgba(147,51,234,0.4)]" : "border-white/10 text-white/40 hover:border-white/40"}`}
                      />
                    </div>
                  );
                })}
              </div>

              {verifyError && (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center">
                  <p className="text-red-400">{verifyError}</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={fullPin.length < 6 || verifyStatus === "checking"}
                style={{
                  opacity: fullPin.length < 6 ? 0.35 : 1,
                  background:
                    fullPin.length < 6
                      ? "rgba(168,85,247,0.15)"
                      : "linear-gradient(135deg, #7c00ff, #a855f7)",
                  border: "none",
                  color: fullPin.length < 6 ? "rgba(255,255,255,0.4)" : "#fff",
                  boxShadow:
                    fullPin.length === 6
                      ? "0 0 25px rgba(168,85,247,0.4)"
                      : "none",
                  transition: "all 0.25s ease",
                }}
                className="mb-6 w-full cursor-pointer rounded-lg py-3.5 disabled:cursor-not-allowed"
              >
                {verifyStatus === "checking"
                  ? "Verifying..."
                  : "Access My Dashboard →"}
              </button>

              {/* Resend section */}
              <div className="mt-4 text-center">
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: 4,
                  }}
                >
                  Didn&apos;t receive the code?
                </p>
                <button
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
                  {verifyStatus === "resending"
                    ? "Sending…"
                    : verifyStatus === "resent"
                      ? "✓ Code resent!"
                      : "Resend Code"}
                </button>
              </div>

              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                  margin: "18px 0",
                }}
              />

              {/* Back to login */}
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setPin(["", "", "", "", "", ""]);
                  setVerifyError("");
                  setVerifyStatus("idle");
                  logout();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                ← Back to Login
              </button>

              {/* Brand footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "",
                    color: "rgba(255,255,255,0.25)",
                  }}
                >
                  7TH HEAVEN · ADMIN ACCESS
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
