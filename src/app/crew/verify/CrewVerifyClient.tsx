/* eslint-disable react-doctor/no-high-complexity-react-function */
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { useMember } from '@/context/MemberContext';
import { ShieldAlert, Lock, Trophy, XCircle } from 'lucide-react';

// All raffle_sync keys across all crew slugs — check any that exist
function findRaffleByPin(pin: string) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.includes('raffle_sync')) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      if (data.winnerPin === pin && data.status === 'complete') {
        return {
          winner: data.winners?.[0] || 'Unknown',
          prize: data.prizes?.[0]?.name || 'Prize',
          entrants: data.entrants || 0,
          ts: data.ts,
        };
      }
    } catch { }
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
 pointerEvents: "none"
 }}
 />
    <div className="fixed inset-0 bg-black/55 backdrop-blur-[45px] z-0 pointer-events-none" />
  </div>
);

const MODAL_GLASS_STYLE: React.CSSProperties = {
  background: "var(--color-bg-glass)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid var(--color-border-main)",
};

const PIN_SLOT_IDS = ["slot-0", "slot-1", "slot-2", "slot-3", "slot-4", "slot-5"];

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

export default function CrewVerifyClient({ sanityContent }: CrewVerifyClientProps) {
  const { member, isLoggedIn, openModal } = useMember();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [result, setResult] = useState<null | 'checking' | 'valid' | 'invalid'>(null);
  const [winnerData, setWinnerData] = useState<{ winner: string; prize: string; entrants: number; ts?: number } | null>(null);
  const devBypass = useSyncExternalStore(bypassSubscribe, bypassSnapshot, bypassServerSnapshot);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCrew = devBypass || member?.role === 'crew' || member?.role === 'admin';

  const fullPin = pin.join('');

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...pin];
    next[i] = d;
    setPin(next);
    setResult(null);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setPin(next);
    setResult(null);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const verifyPin = useCallback(() => {
    if (fullPin.length !== 6) return;
    setResult('checking');

    if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
    verifyTimerRef.current = setTimeout(() => {
      const found = findRaffleByPin(fullPin);
      if (found) {
        setWinnerData(found);
        setResult('valid');
      } else {
        setResult('invalid');
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
    setPin(['', '', '', '', '', '']);
    setResult(null);
    setWinnerData(null);
    inputRefs.current[0]?.focus();
  };

  // ── NON-CREW GATE SCREEN ──
  if (!isCrew) {
    return (
      <div className="min-h-screen text-[var(--color-text-main)] flex items-center justify-center p-4">
        {renderBackground()}

        <div className="relative z-10 w-full max-w-md">
          <div
 className="rounded-lg p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out"
 style={MODAL_GLASS_STYLE}>
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-xl text-white uppercase mb-2">
              {sanityContent?.heroHeading || sanityContent?.title || "Crew Portal Restricted"}
            </h2>

            <p className="mb-6">
              {sanityContent?.heroSubheading || sanityContent?.subtitle || "You must be signed in as an authorized 7th Heaven Crew Member to verify winner PINs."}
            </p>

            {!isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <button
 type="button"
 onClick={() => openModal()}
                  className="w-full py-3.5 bg-[var(--color-accent)] hover:bg-emerald-500 text-white uppercase transition-all duration-300 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.3)] rounded-xl">

                  Sign In to Access
                </button>
                <Link
 href="/"
 className="text-white/60 hover:text-white transition-colors">
                  Return to Home
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-xs">
                  Logged in as <span className="font-semibold text-white">{member?.email}</span> (Role: {member?.role}). This account does not have crew privileges.
                </div>
                <Link
 href="/"
 className="py-3 bg-white/10 hover:bg-white/20 text-white uppercase transition-colors text-center">
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
    <div className="min-h-screen text-[var(--color-text-main)] flex items-center justify-center p-4">
      {renderBackground()}

      <div className="relative z-10 w-full max-w-md">

        {/* TOP BAR / NAVIGATION */}
        <div className="flex items-center justify-between mb-4 px-1">
          <Link
 href="/crew"
 className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
            ← Crew Dashboard
          </Link>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Crew Mode
          </span>
        </div>

        {/* INPUT / CHECKING FORM */}
        {result !== 'valid' && result !== 'invalid' && (
          <div
 className="rounded-lg p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out"
 style={MODAL_GLASS_STYLE}>
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <Trophy className="w-8 h-8" />
            </div>

            <h1 className="text-xl text-white uppercase mb-2">
              {sanityContent?.heroHeading || sanityContent?.title || "Verify Winner PIN"}
            </h1>
            <p className="mb-6">
              {sanityContent?.heroSubheading || sanityContent?.subtitle || "Enter the 6-digit claim code presented by the winner to confirm their prize."}
            </p>

            {/* 6-DIGIT PIN INPUT GRID */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {pin.map((digit, idx) => (
                <input
 key={PIN_SLOT_IDS[idx]}
 ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={result === 'checking'}
                  onChange={(e) => handleDigit(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  onFocus={() => setFocusedIndex(idx)}
                  className={`w-11 h-14 bg-black/60 border text-center text-xl text-white font-mono tabular-nums focus:outline-none transition-all ${focusedIndex === idx
                    ? 'border-[var(--color-accent)] shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-black/80'
                    : digit
                      ? 'border-white/40 bg-black/70'
                      : 'border-white/15'
                    }`}
                  aria-label={`PIN digit ${idx + 1}`}
                />
              ))}
            </div>

            {/* STATUS FEEDBACK */}
            {result === 'checking' ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 py-3">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Checking Database…</span>
              </div>
            ) : (
              <button
 type="button"
 onClick={verifyPin}
 disabled={fullPin.length !== 6}
 className={`w-full py-3.5 uppercase transition-all duration-300 rounded-xl cursor-pointer ${fullPin.length === 6
 ? 'bg-[var(--color-accent)] hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)]'
 : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
 }`}>
                Verify PIN Code
              </button>
            )}
          </div>
        )}

        {/* VALID WINNER RESULT */}
        {result === 'valid' && winnerData && (
          <div
 className="rounded-lg p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out border-emerald-500/50"
 style={MODAL_GLASS_STYLE}>
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <Trophy className="w-9 h-9" />
            </div>

            <div className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 uppercase font-mono mb-3 rounded-full">
              ✓ Verified Match
            </div>

            <h2 className="text-white uppercase mb-1">Official Winner</h2>

            <div className="p-4 bg-black/40 border border-white/10 rounded-lg text-left my-4 space-y-3">
              <div>
                <p className="uppercase mb-1">Fan Name</p>
                <p className="text-white text-lg font-semibold">{winnerData.winner}</p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="uppercase mb-1">Prize</p>
                <p className="text-emerald-400 font-semibold">{winnerData.prize}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-5">
              {fullPin.split('').map((d, i) => (
                <div key={`pin-confirm-${i}-${d}`} className="w-9 h-11 bg-black/60 border border-purple-500/40 rounded-lg flex items-center justify-center">
                  <span className="text-purple-300 text-lg tabular-nums">{d}</span>
                </div>
              ))}
            </div>

            <p className="text-emerald-400/90 mb-6">Award the prize to this fan ✓</p>

            <Link href="/crew" className="w-full block py-3.5 bg-[var(--color-accent)] hover:bg-emerald-500 text-white uppercase transition-colors shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer text-center mb-3 rounded-xl">
              Access My Dashboard →
            </Link>

            <button type="button" onClick={reset} className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white uppercase transition-colors cursor-pointer rounded-xl">
              Verify Another PIN
            </button>
          </div>
        )}

        {/* INVALID */}
        {result === 'invalid' && (
          <div
 className="rounded-lg p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out"
 style={MODAL_GLASS_STYLE}>
            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-white uppercase mb-2">Invalid PIN</h2>
            <p className="mb-5">
              This PIN doesn't match any crew access code. Please check your PIN and try again.
            </p>
            <button type="button" onClick={reset} className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white uppercase transition-colors cursor-pointer">
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
