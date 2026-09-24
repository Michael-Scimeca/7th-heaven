"use client";
/* eslint-disable react-doctor/no-high-complexity-react-function */
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import { useMember } from "@/context/MemberContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPhoneDisplay } from "@/lib/validation";

export default function CruiseDashboardGate() {
  const { isLoggedIn, member, login, signup } = useMember();
  const router = useRouter();
  const supabase = createClient();

  // Auth panel states
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinInput, setPinInput] = useState("");

  // If already logged in, redirect immediately to the username dashboard
  useEffect(() => {
    if (isLoggedIn && member?.username) {
      router.replace(`/cruise/${member.username}`);
    } else if (isLoggedIn && member) {
      const fallbackUsername =
        member.email
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "cruiser";
      router.replace(`/cruise/${fallbackUsername}`);
    }
  }, [isLoggedIn, member, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get("bypass") === "true" ||
        urlParams.get("demo") === "true"
      ) {
        window.location.replace("/cruise/demo?bypass=true");
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Email and Password are required.");
      return;
    }
    setSubmitting(true);
    setAuthError("");
    try {
      const success = await login(email, password);
      if (!success) {
        setAuthError("Invalid email or password.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during log in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setAuthError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    setAuthError("");
    try {
      const res = await fetch("/api/cruise/register-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          name,
          email,
          phone,
          password,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVerifyingPin(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || "Failed to submit registration request.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput) {
      setAuthError("PIN code is required.");
      return;
    }
    setSubmitting(true);
    setAuthError("");
    try {
      const res = await fetch("/api/cruise/register-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          email,
          pin: pinInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const success = await login(email, password);
        if (success) {
          setVerifyingPin(false);
          setPinInput("");
        } else {
          setAuthError(
            "Verification successful, but automatic log in failed. Please sign in via the Log In tab.",
          );
          setVerifyingPin(false);
          setAuthTab("login");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || "Verification failed.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during verification.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-8 w-8 animate-spin rounded-lg border-2 border-white/10 border-t-cyan-400" />
          <p>Redirecting to Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-32 pb-20">
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-lg bg-[var(--color-accent)]/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-lg bg-cyan-500/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md animate-[fadeIn_0.3s_ease-out]">
        <div className="mb-8 text-center">
          <span className="mb-6 block animate-[bounce_2s_infinite] text-5xl">
            🚢
          </span>
          <h1>Cruise Hub</h1>
          <p className="text-purple-400">Exclusive Passenger Community</p>
        </div>

        <div className="overflow-hidden border border-white/10 bg-[var(--color-bg-surface)]/80 backdrop-blur-xl">
          {verifyingPin ? (
            <div className="animate-[fadeIn_0.3s_ease-out] p-8">
              <div className="mb-6 text-center">
                <span className="mb-3 block animate-[pulse_1.5s_infinite] text-4xl">
                  🔑
                </span>
                <h3 className="mb-2">Verify Your Email</h3>
                <p>
                  We've sent a 6-digit verification PIN to{" "}
                  <strong className="text-cyan-400">{email}</strong>. Enter it
                  below to activate your account.
                </p>
              </div>

              <form onSubmit={handleVerifyPinSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="cruise-pin-input"
                    className="mb-1.5 block text-white/40"
                  >
                    6-Digit Verification PIN
                  </label>
                  <input
                    id="cruise-pin-input"
                    type="text"
                    required
                    placeholder="123456"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) =>
                      setPinInput(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full border border-white/10 bg-[var(--color-bg-card)] px-4 py-3 text-center text-lg transition-colors outline-none focus:border-purple-400/50"
                  />
                </div>

                {authError && (
                  <p className="mt-2 text-center text-rose-400">{authError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 bg-cyan-500 py-3 shadow-cyan-500/10 transition-colors hover:bg-cyan-400 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-lg border-2 border-black/30 border-t-black" />
                  ) : (
                    "Verify PIN & Access Hub →"
                  )}
                </button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyingPin(false);
                      setAuthError("");
                    }}
                    className="cursor-pointer text-[var(--font-size-2xs)] text-white/40 transition-colors hover:text-white"
                  >
                    ← Cancel and Back
                  </button>
                </div>
              </form>
            </div>
          ) : regSuccess ? (
            <div className="animate-[fadeIn_0.3s_ease-out] p-8 text-center">
              <span className="mb-6 block text-4xl">📧</span>
              <h3 className="mb-2">Check Your Email</h3>
              <p className="mb-6">
                We've sent a verification link to <strong>{email}</strong>.
                Please check your inbox and click the link to activate your
                Cruise Hub account.
              </p>
              <button
                onClick={() => {
                  setRegSuccess(false);
                  setAuthTab("login");
                }}
                className="w-full cursor-pointer border border-white/10 bg-[#00000029] py-2.5 transition-colors hover:bg-white/10 hover:text-white"
              >
                Go to Log In
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setAuthError("");
                  }}
                  className={`flex-1 cursor-pointer py-4 transition-colors ${authTab === "login" ? "border-b-2 border-purple-400 bg-white/[0.02]" : "text-white/40 text-white/70 hover:text-white"}`}
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthTab("register");
                    setAuthError("");
                  }}
                  className={`flex-1 cursor-pointer py-4 transition-colors ${authTab === "register" ? "border-b-2 border-purple-400 bg-white/[0.02]" : "text-white/40 text-white/70 hover:text-white"}`}
                >
                  Register
                </button>
              </div>

              <div className="p-6 md:p-8">
                {authTab === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <p className="mb-6">
                      Sign in using your Cruise Hub credentials to access your
                      booking, lounge chat, and itinerary.
                    </p>
                    <div>
                      <label
                        htmlFor="cruise-login-email"
                        className="mb-1.5 block text-white/40"
                      >
                        Email Address
                      </label>
                      <input
                        id="cruise-login-email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-white/10 bg-[var(--color-bg-card)] px-4 py-3 transition-colors outline-none focus:border-purple-400/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cruise-login-password"
                        className="mb-1.5 block text-white/40"
                      >
                        Password
                      </label>
                      <input
                        id="cruise-login-password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-white/10 bg-[var(--color-bg-card)] px-4 py-3 transition-colors outline-none focus:border-purple-400/50"
                      />
                    </div>

                    {authError && (
                      <p className="mt-2 text-rose-400">{authError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 bg-cyan-500 py-3 shadow-cyan-500/10 transition-colors hover:bg-cyan-400 disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="h-4 w-4 animate-spin rounded-lg border-2 border-black/30 border-t-black" />
                      ) : (
                        "Access Cruise Hub →"
                      )}
                    </button>

                    <div className="mt-4 border-t border-white/10 pt-3">
                      <button
                        type="button"
                        onClick={() => router.replace("/cruise/demo")}
                        className="r flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-3 transition-all hover:brightness-110"
                      >
                        ⚡ Instant Demo Access
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <p className="mb-6">
                      Sign up as a Cruise Member to register for the priority
                      booking list and unlock access to the hub.
                    </p>
                    <div>
                      <label
                        htmlFor="cruise-reg-name"
                        className="mb-1.5 block text-white/40"
                      >
                        Full Legal Name *
                      </label>
                      <input
                        id="cruise-reg-name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-white/10 bg-[var(--color-bg-card)] px-4 py-3 transition-colors outline-none focus:border-purple-400/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cruise-reg-email"
                        className="mb-1.5 block text-white/40"
                      >
                        Email Address *
                      </label>
                      <input
                        id="cruise-reg-email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-white/10 bg-[var(--color-bg-card)] px-4 py-3 transition-colors outline-none focus:border-purple-400/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cruise-reg-phone"
                        className="mb-1.5 block text-white/40"
                      >
                        Phone Number *
                      </label>
                      <input
                        id="cruise-reg-phone"
                        type="tel"
                        required
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChange={(e) =>
                          setPhone(formatPhoneDisplay(e.target.value))
                        }
                        className="w-full border border-white/10 bg-[var(--color-bg-card)] px-4 py-3 transition-colors outline-none focus:border-purple-400/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cruise-reg-password"
                        className="mb-1.5 block text-white/40"
                      >
                        Choose Password *
                      </label>
                      <input
                        id="cruise-reg-password"
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-white/10 bg-[var(--color-bg-card)] px-4 py-3 transition-colors outline-none focus:border-purple-400/50"
                      />
                    </div>

                    {authError && (
                      <p className="mt-2 text-rose-400">{authError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 bg-[var(--color-accent)] py-3 shadow-[var(--color-accent)]/20 transition-colors hover:brightness-110 disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="h-4 w-4 animate-spin rounded-lg border-2 border-white/10 border-t-white" />
                      ) : (
                        "Register & Access Hub →"
                      )}
                    </button>

                    <div className="mt-4 border-t border-white/10 pt-3">
                      <button
                        type="button"
                        onClick={() => router.replace("/cruise/demo")}
                        className="r flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-3 transition-all hover:brightness-110"
                      >
                        ⚡ Instant Demo Access →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/cruise"
            className="text-white/40 transition-colors hover:text-white"
          >
            ← Back to Cruise Information
          </Link>
        </div>
      </div>
    </div>
  );
}
