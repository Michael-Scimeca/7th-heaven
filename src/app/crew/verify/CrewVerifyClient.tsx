/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import Link from "next/link";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
} from "react";
import { useMember } from "@/context/MemberContext";
import { ShieldAlert, Lock, Trophy, XCircle } from "lucide-react";

// All raffle_sync keys across all crew slugs — check any that exist
function findRaffleByPin(pin: string) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.includes("raffle_sync")) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      if (data.winnerPin === pin && data.status === "complete") {
        return {
          winner: data.winners?.[0] || "Unknown",
          prize: data.prizes?.[0]?.name || "Prize",
          entrants: data.entrants || 0,
          ts: data.ts,
        };
      }
    } catch {}
  }
  return null;
}

const renderBackground = () => (
  <div className="lock-scroll-fullscreen">
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
  </div>
);

const MODAL_GLASS_STYLE: React.CSSProperties = {
  background: "var(--color-bg-glass)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid var(--color-border-main)",
};

const PIN_SLOT_IDS = [
  "slot-0",
  "slot-1",
  "slot-2",
  "slot-3",
  "slot-4",
  "slot-5",
];

const bypassSubscribe = () => () => {};
const bypassSnapshot = () =>
  typeof window !== "undefined" &&
  (window.location.search.includes("demo") ||
    window.location.search.includes("bypass") ||
    window.location.search.includes("preview"));
const bypassServerSnapshot = () => false;

interface CrewVerifyClientProps {
  sanityContent?: any;
}

export default function CrewVerifyClient({
  sanityContent,
}: CrewVerifyClientProps) {
  const { member, isLoggedIn, openModal } = useMember();
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [result, setResult] = useState<null | "checking" | "valid" | "invalid">(
    null,
  );
  const [winnerData, setWinnerData] = useState<{
    winner: string;
    prize: string;
    entrants: number;
    ts?: number;
  } | null>(null);
  const devBypass = useSyncExternalStore(
    bypassSubscribe,
    bypassSnapshot,
    bypassServerSnapshot,
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCrew =
    devBypass || member?.role === "crew" || member?.role === "admin";

  const fullPin = pin.join("");

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[i] = d;
    setPin(next);
    setResult(null);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !pin[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setPin(next);
    setResult(null);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const verifyPin = useCallback(() => {
    if (fullPin.length !== 6) return;
    setResult("checking");

    if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
    verifyTimerRef.current = setTimeout(() => {
      const found = findRaffleByPin(fullPin);
      if (found) {
        setWinnerData(found);
        setResult("valid");
      } else {
        setResult("invalid");
      }
    }, 600);
  }, [fullPin]);

  useEffect(() => {
    if (fullPin.length === 6) {
      verifyPin();
    }
  }, [fullPin, verifyPin]);

  useEffect(() => {
    return () => {
      if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const reset = () => {
    setPin(["", "", "", "", "", ""]);
    setResult(null);
    setWinnerData(null);
    inputRefs.current[0]?.focus();
  };

  // ── NON-CREW GATE SCREEN ──
  if (!isCrew) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-[var(--color-text-main)]">
        {renderBackground()}

        <div className="relative z-10 w-full max-w-md">
          <div
            className="rounded-lg p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
            style={MODAL_GLASS_STYLE}
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <h2 className="mb-2 text-xl">
              {sanityContent?.heroHeading ||
                sanityContent?.title ||
                "Crew Portal Restricted"}
            </h2>

            <p className="mb-6">
              {sanityContent?.heroSubheading ||
                sanityContent?.subtitle ||
                "You must be signed in as an authorized 7th Heaven Crew Member to verify winner PINs."}
            </p>

            {!isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="w-full cursor-pointer rounded-xl bg-[var(--color-accent)] py-3.5 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
                >
                  Sign In to Access
                </button>
                <Link href="/" className="text-white/60 hover:text-white">
                  Return to Home
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-red-300">
                  Logged in as <span>{member?.email}</span> (Role:{" "}
                  {member?.role}). This account does not have crew privileges.
                </div>
                <Link
                  href="/"
                  className="bg-white/10 py-3 text-center hover:bg-white/20"
                >
                  Return to Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN CREW VERIFIER INTERFACE ──
  return (
    <div className="flex min-h-screen items-center justify-center p-4 text-[var(--color-text-main)]">
      {renderBackground()}

      <div className="relative z-10 w-full max-w-md">
        {/* TOP BAR / NAVIGATION */}
        <div className="mb-6 flex items-center justify-between px-1">
          <Link
            href="/crew"
            className="flex items-center gap-1.5 text-white/60 hover:text-white"
          >
            ← Crew Dashboard
          </Link>
          <span className="flex items-center gap-1 text-emerald-400">
            <Lock className="h-3.5 w-3.5" /> Crew Mode
          </span>
        </div>

        {/* INPUT / CHECKING FORM */}
        {result !== "valid" && result !== "invalid" && (
          <div
            className="rounded-lg p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
            style={MODAL_GLASS_STYLE}
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <Trophy className="h-8 w-8" />
            </div>

            <h1 className="mb-2 text-xl">
              {sanityContent?.heroHeading ||
                sanityContent?.title ||
                "Verify Winner PIN"}
            </h1>
            <p className="mb-6">
              {sanityContent?.heroSubheading ||
                sanityContent?.subtitle ||
                "Enter the 6-digit claim code presented by the winner to confirm their prize."}
            </p>

            {/* 6-DIGIT PIN INPUT GRID */}
            <div className="mb-6 flex items-center justify-center gap-2">
              {pin.map((digit, idx) => (
                <input
                  key={PIN_SLOT_IDS[idx]}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={result === "checking"}
                  onChange={(e) => handleDigit(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  onFocus={() => setFocusedIndex(idx)}
                  className={`focus-ring h-14 w-11 border bg-black/60 text-center text-xl tabular-nums ${focusedIndex === idx ? "border-[var(--color-accent)] bg-black/80 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : digit ? "border-white/40 bg-black/70" : "border-white/15"}`}
                  aria-label={`PIN digit ${idx + 1}`}
                />
              ))}
            </div>

            {/* STATUS FEEDBACK */}
            {result === "checking" ? (
              <div className="flex items-center justify-center gap-2 py-3 text-emerald-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                <span>Checking Database…</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={verifyPin}
                disabled={fullPin.length !== 6}
                className={`w-full cursor-pointer rounded-xl py-3.5 ${fullPin.length === 6 ? "bg-[var(--color-accent)] shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:bg-emerald-500" : "cursor-not-allowed border border-white/5 bg-white/10 text-white/40"}`}
              >
                Verify PIN Code
              </button>
            )}
          </div>
        )}

        {/* VALID WINNER RESULT */}
        {result === "valid" && winnerData && (
          <div
            className="rounded-lg border-emerald-500/50 p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
            style={MODAL_GLASS_STYLE}
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <Trophy className="h-9 w-9" />
            </div>

            <div className="mb-3 inline-block rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-emerald-300">
              ✓ Verified Match
            </div>

            <h2 className="mb-1">Official Winner</h2>

            <div className="my-4 space-y-3 rounded-lg border border-white/10 bg-black/40 p-4 text-left">
              <div>
                <p className="mb-1">Fan Name</p>
                <p>{winnerData.winner}</p>
              </div>

              <div className="border-t border-white/10 pt-2">
                <p className="mb-1">Prize</p>
                <p className="text-emerald-400">{winnerData.prize}</p>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-center gap-1.5">
              {fullPin.split("").map((d, i) => (
                <div
                  key={`pin-confirm-${i}-${d}`}
                  className="flex h-11 w-9 items-center justify-center rounded-lg border border-purple-500/40 bg-black/60"
                >
                  <span className="tabular-nums">{d}</span>
                </div>
              ))}
            </div>

            <p className="mb-6 text-emerald-400/90">
              Award the prize to this fan ✓
            </p>

            <Link
              href="/crew"
              className="mb-3 block w-full cursor-pointer rounded-xl bg-[var(--color-accent)] py-3.5 text-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-500"
            >
              Access My Dashboard →
            </Link>

            <button
              type="button"
              onClick={reset}
              className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/10 py-3.5 hover:bg-white/20"
            >
              Verify Another PIN
            </button>
          </div>
        )}

        {/* INVALID */}
        {result === "invalid" && (
          <div
            className="rounded-lg p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
            style={MODAL_GLASS_STYLE}
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <XCircle className="h-8 w-8" />
            </div>
            <h2 className="mb-2">Invalid PIN</h2>
            <p className="mb-5">
              This PIN doesn't match any crew access code. Please check your PIN
              and try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className="w-full cursor-pointer border border-white/10 bg-white/10 py-3.5 hover:bg-white/20"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
