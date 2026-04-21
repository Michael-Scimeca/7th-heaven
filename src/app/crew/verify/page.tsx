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
    } catch {}
  }
  return null;
}

export default function VerifyPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [result, setResult] = useState<null | 'checking' | 'valid' | 'invalid'>(null);
  const [winnerData, setWinnerData] = useState<{ winner: string; prize: string; entrants: number } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    setTimeout(() => {
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
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  useEffect(() => {
    if (isLoggedIn && isCrew) inputRefs.current[0]?.focus();
  }, [isLoggedIn, isCrew]);

  // Auto-verify when all 6 digits entered
  useEffect(() => {
    if (fullPin.length === 6 && result === null) verify();
  }, [fullPin]);

  if (!isLoggedIn || !member) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-8 text-center max-w-sm w-full">
          <span className="text-5xl block mb-4">🔐</span>
          <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Crew Login Required</h2>
          <p className="text-white/40 text-sm mb-6">Sign in with your crew account to access PIN verification.</p>
          <button onClick={() => openModal()} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isCrew) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="bg-[#0f0f18] border border-red-500/20 rounded-2xl p-8 text-center max-w-sm w-full">
          <span className="text-5xl block mb-4">🚫</span>
          <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Crew Only</h2>
          <p className="text-white/40 text-sm">This page is for 7th Heaven crew members only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080d] flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-yellow-500 mb-1">7th Heaven · Crew</p>
        <h1 className="text-white font-black text-2xl uppercase tracking-widest">Raffle Verifier</h1>
        <p className="text-white/30 text-xs mt-1">Enter the fan's PIN to verify their win</p>
      </div>

      <div className="w-full max-w-xs">

        {/* PIN Input */}
        {result !== 'valid' && (
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 mb-4">
            <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-white/40 text-center mb-5">Enter 6-Digit PIN</p>

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
                  className={`w-11 h-14 text-center text-2xl font-black rounded-xl border-2 bg-black/50 outline-none transition-all tabular-nums
                    ${digit ? 'border-yellow-500/60 text-yellow-400' : 'border-white/15 text-white/40'}
                    focus:border-yellow-500 focus:shadow-[0_0_12px_rgba(251,191,36,0.2)]`}
                />
              ))}
            </div>

            <button
              onClick={verify}
              disabled={fullPin.length < 6 || result === 'checking'}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-widest rounded-xl transition-colors"
            >
              {result === 'checking' ? 'Checking...' : 'Verify PIN'}
            </button>
          </div>
        )}

        {/* Checking state */}
        {result === 'checking' && (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* VALID */}
        {result === 'valid' && winnerData && (
          <div className="bg-[#0f0f18] border-2 border-yellow-500/60 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.25)] animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-400 px-6 py-4 text-center">
              <p className="text-black font-black text-lg uppercase tracking-widest">✓ Valid Win</p>
            </div>
            <div className="p-6 text-center">
              <span className="text-5xl block mb-4">🏆</span>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-3 mb-3">
                <p className="text-yellow-500/50 text-[0.45rem] font-black uppercase tracking-[0.2em] mb-1">Winner Account</p>
                <p className="text-yellow-400 font-black text-2xl">{winnerData.winner}</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 mb-4">
                <p className="text-white/30 text-[0.45rem] font-black uppercase tracking-[0.2em] mb-1">Prize</p>
                <p className="text-white font-black text-lg">{winnerData.prize}</p>
              </div>

              {/* PIN confirmation */}
              <div className="flex items-center justify-center gap-1.5 mb-5">
                {fullPin.split('').map((d, i) => (
                  <div key={i} className="w-9 h-11 bg-black/60 border border-yellow-500/40 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-400 font-black text-lg tabular-nums">{d}</span>
                  </div>
                ))}
              </div>

              <p className="text-emerald-400/80 text-xs font-bold mb-6">Award the prize to this fan ✓</p>

              <button onClick={reset} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-black text-xs uppercase tracking-widest rounded-xl transition-colors">
                Verify Another PIN
              </button>
            </div>
          </div>
        )}

        {/* INVALID */}
        {result === 'invalid' && (
          <div className="bg-[#0f0f18] border-2 border-red-500/40 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <span className="text-5xl block mb-3">❌</span>
            <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Invalid PIN</h2>
            <p className="text-white/40 text-sm mb-5">
              This PIN doesn't match any raffle winner. Ask the fan to show the email or claim page.
            </p>
            <button onClick={reset} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-black text-xs uppercase tracking-widest rounded-xl transition-colors">
              Try Again
            </button>
          </div>
        )}

        <p className="text-white/15 text-[0.5rem] text-center mt-6 uppercase tracking-widest">
          Crew access only · 7th Heaven
        </p>
      </div>
    </div>
  );
}
