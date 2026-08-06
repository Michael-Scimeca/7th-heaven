'use client';

import { useState, useEffect, useRef } from 'react';
import { useMember } from '@/context/MemberContext';

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

export default function VerifyPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [result, setResult] = useState<null | 'checking' | 'valid' | 'invalid'>(null);
  const [winnerData, setWinnerData] = useState<{ winner: string; prize: string; entrants: number } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCrew = member?.role === 'crew' || member?.role === 'admin';

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

  const verify = () => {
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
  };

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
    if (isLoggedIn && isCrew) inputRefs.current[0]?.focus();
  }, [isLoggedIn, isCrew]);

  // Auto-verify when all 6 digits entered
  useEffect(() => {
    if (fullPin.length === 6 && result === null) verify();
    return () => {
      if (verifyTimerRef.current !== null) clearTimeout(verifyTimerRef.current);
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    };
  }, [fullPin]);

  // Disable all document body & page scrolling on verify page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Shared background overlay
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

  const modalGlassStyle: React.CSSProperties = {
    background: "var(--color-bg-glass)",
    backdropFilter: "blur(32px) saturate(180%)",
    WebkitBackdropFilter: "blur(32px) saturate(180%)",
    border: "1px solid var(--color-border-main)",
  };

  if (!isLoggedIn || !member) {
    return (
      <div className="fixed inset-0 h-screen w-screen flex flex-col items-center justify-center p-6 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {renderBackground()}

        <div
          className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-300"
          style={modalGlassStyle}
        >
          <span className="text-5xl block mb-4">🔐</span>
          <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Crew Login Required</h2>
          <p className="text-white/40 text-sm mb-6">Sign in with your crew account to access PIN verification.</p>
          <button
            onClick={() => openModal()}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] cursor-pointer"
          >
            Sign In
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
          className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-300"
          style={modalGlassStyle}
        >
          <span className="text-5xl block mb-4">🚫</span>
          <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Crew Only</h2>
          <p className="text-white/40 text-sm">This page is for 7th Heaven crew members only.</p>
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
        <h1 className="text-white font-black text-2xl uppercase tracking-widest">Raffle Verifier</h1>
        <p className="text-white/30 text-xs mt-1">Enter the fan's PIN to verify their win</p>
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* PIN Input Form */}
        {result !== 'valid' && (
          <div
            className="rounded-3xl p-7 mb-4 shadow-[0_30px_90px_rgba(0,0,0,0.6)] animate-in fade-in duration-300"
            style={modalGlassStyle}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40 text-center mb-5">Enter 6-Digit PIN</p>

            <div className="flex items-center justify-center gap-2 mb-6" onPaste={handlePaste}>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-11 h-14 text-center text-2xl font-black  border-2 bg-black/50 outline-none transition-colors tabular-nums
                    ${digit ? 'border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(147,51,234,0.3)]' : 'border-white/15 text-white/40'}
                    focus:border-purple-400 focus:shadow-[0_0_18px_rgba(147,51,234,0.6)]`}
                />
              ))}
            </div>

            <button
              onClick={verify}
              disabled={fullPin.length < 6 || result === 'checking'}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] cursor-pointer"
            >
              {result === 'checking' ? 'Checking...' : 'Verify PIN'}
            </button>
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
            className="rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-300"
            style={modalGlassStyle}
          >
            <div className="bg-purple-600 px-6 py-4 text-center shadow-[0_0_25px_rgba(147,51,234,0.5)]">
              <p className="text-white font-black text-lg uppercase tracking-widest">✓ Valid Win</p>
            </div>
            <div className="p-6 text-center">
              <span className="text-5xl block mb-4">🏆</span>

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
                  <div key={i} className="w-9 h-11 bg-black/60 border border-purple-500/40 rounded-lg flex items-center justify-center">
                    <span className="text-purple-300 font-black text-lg tabular-nums">{d}</span>
                  </div>
                ))}
              </div>

              <p className="text-emerald-400/90 text-xs font-bold mb-6">Award the prize to this fan ✓</p>

              <button onClick={reset} className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-xs uppercase tracking-widest transition-colors cursor-pointer">
                Verify Another PIN
              </button>
            </div>
          </div>
        )}

        {/* INVALID */}
        {result === 'invalid' && (
          <div
            className="rounded-3xl p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-300"
            style={modalGlassStyle}
          >
            <span className="text-5xl block mb-3">❌</span>
            <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Invalid PIN</h2>
            <p className="text-white/40 text-sm mb-5">
              This PIN doesn't match any raffle winner. Ask the fan to show the email or claim page.
            </p>
            <button onClick={reset} className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-xs uppercase tracking-widest transition-colors cursor-pointer">
              Try Again
            </button>
          </div>
        )}

        <p className="text-white/20 text-[var(--font-size-2xs)] text-center mt-6 uppercase tracking-widest">
          Crew access only · 7th Heaven
        </p>
      </div>
    </div>
  );
}
