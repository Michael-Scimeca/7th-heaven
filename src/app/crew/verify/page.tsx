'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  <>
    <style jsx global>{`
      html, body {
        overflow: hidden !important;
        height: 100vh !important;
        max-height: 100vh !important;
        touch-action: none !important;
      }
    `}</style>
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/images/hero-band-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.35) blur(10px)",
        transform: "scale(1.08)",
        zIndex: 0,
        pointerEvents: "none"
      }}
    />
    <div className="fixed inset-0 bg-black/55 backdrop-blur-md z-0 pointer-events-none" />
  </>
);

const MODAL_GLASS_STYLE: React.CSSProperties = {
  background: "var(--color-bg-glass)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid var(--color-border-main)",
};

export default function VerifyPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [result, setResult] = useState<null | 'checking' | 'valid' | 'invalid'>(null);
  const [winnerData, setWinnerData] = useState<{ winner: string; prize: string; entrants: number } | null>(null);
  const [devBypass, setDevBypass] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.search.includes('demo') || window.location.search.includes('bypass') || window.location.search.includes('preview'))) {
      setDevBypass(true);
    }
  }, []);

  const isCrew = devBypass || member?.role === 'crew' || member?.role === 'admin';

  const fullPin = pin.join('');

  const handleDigit = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...pin];
    next[idx] = digit;
    setPin(next);
    setResult(null);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setPin(text.split(''));
      setResult(null);
    }
  };

  const verify = useCallback(() => {
    if (fullPin.length < 6) return;
    setResult('checking');
    if (verifyTimerRef.current !== null) clearTimeout(verifyTimerRef.current);
    verifyTimerRef.current = setTimeout(() => {
      verifyTimerRef.current = null;
      const found = findRaffleByPin(fullPin);
      if (found) {
        setWinnerData(found);
        setResult('valid');
      } else {
        setWinnerData(null);
        setResult('invalid');
      }
    }, 600);
  }, [fullPin]);

  const reset = () => {
    setPin(['', '', '', '', '', '']);
    setResult(null);
    setWinnerData(null);
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      resetTimerRef.current = null;
      inputRefs.current[0]?.focus();
    }, 50);
  };

  useEffect(() => {
    if (isCrew) inputRefs.current[0]?.focus();
  }, [isCrew]);

  // Auto-verify when all 6 digits entered
  useEffect(() => {
    if (fullPin.length === 6 && result === null) verify();
    return () => {
      if (verifyTimerRef.current !== null) clearTimeout(verifyTimerRef.current);
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    };
  }, [fullPin, result, verify]);

  // Disable all document body & page scrolling on verify page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  if (!isLoggedIn && !devBypass) {
    return (
      <div className="fixed inset-0 h-screen w-screen flex flex-col items-center justify-center p-6 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {renderBackground()}

        <div
          className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out"
          style={MODAL_GLASS_STYLE}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Crew Login Required</h2>
          <p className="text-white/40 text-sm mb-6">Sign in with your crew account to access PIN verification.</p>
          <button aria-label="Action button"
            onClick={() => openModal()}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] cursor-pointer"
          >
            Sign In
          </button>
          <button aria-label="Action button"
            onClick={() => setDevBypass(true)}
            className="w-full mt-3 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer rounded-xl"
          >
            Preview PIN Inputs →
          </button>
        </div>
      </div>
    );
  }

  if (!isCrew) {
    return (
      <div className="fixed inset-0 h-screen w-screen flex flex-col items-center justify-center p-6 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {renderBackground()}

        <div
          className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out"
          style={MODAL_GLASS_STYLE}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Crew Only</h2>
          <p className="text-white/40 text-sm mb-5">This page is for 7th Heaven crew members only.</p>
          <button aria-label="Action button"
            onClick={() => setDevBypass(true)}
            className="w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer rounded-xl"
          >
            Preview PIN Verification Inputs →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-screen flex flex-col items-center justify-center p-6 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {renderBackground()}

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <p className="text-xs font-black uppercase tracking-[0.3em]  text-[var(--color-accent)] mb-1">7th Heaven · Crew</p>
        <h1 className="text-white font-black text-2xl uppercase tracking-widest">Crew PIN Verification</h1>
        <p className="text-white/30 text-xs mt-1">Enter your 6-digit PIN to verify crew access</p>
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* PIN Input Form */}
        {result !== 'valid' && (
          <div
            className="rounded-3xl px-4 py-7 mb-4 shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out no-glow"
            style={MODAL_GLASS_STYLE}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40 text-center mb-5">Enter 6-Digit PIN</p>

            <div className="flex items-center justify-center gap-1.5 mb-6 no-glow" onPaste={handlePaste}>
              {Array.from(pin, (digit, i) => ({ digit, i })).map(({ digit, i }) => (
                <div key={i} className="!w-11 !h-14 rounded-xl shrink-0">
                  <input aria-label="Input field"
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
                    className={`w-full h-full text-center text-xl font-black rounded-xl border-2 bg-black/70 !p-0 outline-none transition-all duration-200 tabular-nums
                      ${focusedIndex === i
                        ? 'border-purple-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.95)] bg-purple-950/80 scale-[1.08] z-10 relative'
                        : digit
                          ? 'border-purple-500/80 text-purple-300 shadow-[0_0_14px_rgba(147,51,234,0.4)]'
                          : 'border-white/20 text-white/40 hover:border-white/40'
                      }`}
                  />
                </div>
              ))}
            </div>

            <button aria-label="Action button"
              onClick={verify}
              disabled={fullPin.length < 6 || result === 'checking'}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] cursor-pointer rounded-xl mb-4"
            >
              {result === 'checking' ? 'Checking...' : 'Access My Dashboard →'}
            </button>

            <div className="space-y-2 mt-4 text-center">
              <button aria-label="Action button"
                type="button"
                onClick={reset}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
              >
                Resend PIN
              </button>

              <button aria-label="Action button"
                type="button"
                onClick={() => openModal("login")}
                style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "rgba(168,85,247,0.8)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
              >
                Need a PIN sent to your email?
              </button>
            </div>

            <p className="flex items-center justify-center gap-1.5" style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 20 }}>
              <svg className="w-3.5 h-3.5 opacity-60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>PIN expires in 10 minutes · Crew access only</span>
            </p>
          </div>
        )}

        {/* Checking state */}
        {result === 'checking' && (
          <div className="text-center py-4 relative z-10">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* VALID */}
        {result === 'valid' && winnerData && (
          <div
            className="rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out"
            style={MODAL_GLASS_STYLE}
          >
            <div className="bg-purple-600 px-6 py-4 text-center shadow-[0_0_25px_rgba(147,51,234,0.5)]">
              <p className="text-white font-black text-lg uppercase tracking-widest">✓ Valid Win</p>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="bg-purple-600/10 border border-purple-500/30 px-5 py-3 mb-3">
                <p className="text-purple-300/60 text-[var(--font-size-2xs)] font-black uppercase tracking-[0.2em] mb-1">Winner Account</p>
                <p className="text-purple-300 font-black text-2xl">{winnerData.winner}</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 px-5 py-3 mb-4">
                <p className="text-white/30 text-[var(--font-size-2xs)] font-black uppercase tracking-[0.2em] mb-1">Prize</p>
                <p className="text-white font-black text-lg">{winnerData.prize}</p>
              </div>

              {/* PIN confirmation */}
              <div className="flex items-center justify-center gap-1.5 mb-5">
                {fullPin.split('').map((d, i) => (
                  <div key={`pin-confirm-${i}-${d}`} className="w-9 h-11 bg-black/60 border border-purple-500/40 rounded-lg flex items-center justify-center">
                    <span className="text-purple-300 font-black text-lg tabular-nums">{d}</span>
                  </div>
                ))}
              </div>

              <p className="text-emerald-400/90 text-xs font-bold mb-6">Award the prize to this fan ✓</p>

              <Link href="/crew" className="w-full block py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer text-center mb-3 rounded-xl">
                Access My Dashboard →
              </Link>

              <button aria-label="Action button" onClick={reset} className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-xs uppercase tracking-widest transition-colors cursor-pointer rounded-xl">
                Verify Another PIN
              </button>
            </div>
          </div>
        )}

        {/* INVALID */}
        {result === 'invalid' && (
          <div
            className="rounded-3xl p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out"
            style={MODAL_GLASS_STYLE}
          >
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Invalid PIN</h2>
            <p className="text-white/40 text-sm mb-5">
              This PIN doesn't match any crew access code. Please check your PIN and try again.
            </p>
            <button aria-label="Action button" onClick={reset} className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-xs uppercase tracking-widest transition-colors cursor-pointer">
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
