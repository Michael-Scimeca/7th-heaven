/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  display: "swap",
});

interface CruiseVerifyClientProps {
  sanityContent?: any;
}

function CruiseVerifyContent({ sanityContent }: CruiseVerifyClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "alex@7thheaven.com";
  const initialPin = searchParams.get("pin") || "";

  const [digits, setDigits] = useState<string[]>(
    initialPin.length === 6 ? initialPin.split("") : ["", "", "", "", "", ""],
  );
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
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
    if (e.key === "Backspace" && !digits[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
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
        setTimeout(() => {
          window.location.href = destination;
        }, 2200);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Invalid code. Please try again.");
        setStatus("error");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setStatus("error");
    }
  };

  const handleResend = async () => {
    setResendStatus("sending");
    try {
      await fetch("/api/cruise/resend-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendStatus("sent");
      setTimeout(() => setResendStatus("idle"), 5000);
    } catch {
      setResendStatus("idle");
    }
  };

  return (
    <div
      className={`${outfit.className} relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020818] p-4`}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-2/3 left-1/3 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[100px]" />

      {/* Main Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
        {/* Header Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/30 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-3xl shadow-inner">
          🚢
        </div>

        <h1 className="mb-1 text-2xl">
          {sanityContent?.heroHeading ||
            sanityContent?.title ||
            "Verify Cruise Access"}
        </h1>
        <p className="mb-6 text-sm text-white/60">
          {sanityContent?.heroSubheading || sanityContent?.subtitle || (
            <>
              Enter the 6-digit access code sent to <br />
              <span className="text-purple-300">{email}</span>
            </>
          )}
        </p>

        {status === "success" ? (
          <div className="space-y-3 py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/20 text-2xl text-emerald-400">
              ✓
            </div>
            <p className="text-lg text-emerald-300">Access Granted!</p>
            <p className="text-xs text-white/50">
              Redirecting to your cruise dashboard…
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 6 Digit PIN Inputs */}
              <div className="flex justify-center gap-2">
                {digits.map((digit, idx) => (
                  <input
                    key={
                      [
                        "slot-0",
                        "slot-1",
                        "slot-2",
                        "slot-3",
                        "slot-4",
                        "slot-5",
                      ][idx]
                    }
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigit(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="h-13 w-11 rounded-xl border border-white/15 bg-white/[0.06] text-center text-xl shadow-sm transition-all focus:border-purple-400 focus:bg-white/[0.1] focus:outline-none"
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              {errorMsg && (
                <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-400">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={pin.length !== 6 || status === "submitting"}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-sm shadow-purple-500/20 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sanityContent?.submitButtonText ||
                  (status === "submitting"
                    ? "Verifying…"
                    : "Access My Dashboard →")}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-5 flex flex-col items-center gap-1.5 border-t border-white/10 pt-4 text-xs">
              <p className="text-white/60">Didn&apos;t receive the code?</p>
              {resendStatus === "sent" ? (
                <p className="text-emerald-400">
                  ✓ Code resent! Check your inbox.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "sending"}
                  className="cursor-pointer text-purple-300 transition-colors hover:text-white disabled:opacity-50"
                >
                  {resendStatus === "sending" ? "Sending…" : "Resend Code"}
                </button>
              )}
            </div>

            {/* Back link */}
            <div className="mt-4 text-xs">
              <Link
                href="/cruise"
                className="text-white/40 transition-colors hover:text-white"
              >
                ← Back to Cruise Page
              </Link>
            </div>

            {/* Brand footer */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-[10px] text-white/30">
                7th Heaven · Caribbean Cruise 2025
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CruiseVerifyClient({
  sanityContent,
}: CruiseVerifyClientProps) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#020818",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 14,
              fontFamily: "Outfit, sans-serif",
            }}
          >
            Loading…
          </div>
        </div>
      }
    >
      <CruiseVerifyContent sanityContent={sanityContent} />
    </Suspense>
  );
}
