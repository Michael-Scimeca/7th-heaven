'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMember } from '@/context/MemberContext';

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params?.pin as string;
  const { member, isLoggedIn, openModal } = useMember();

  const [status, setStatus] = useState<'loading' | 'valid' | 'wrong_user' | 'not_logged_in' | 'invalid'>('loading');
  const [winnerName, setWinnerName] = useState('');
  const [prizeName, setPrizeName] = useState('');

  useEffect(() => {
    if (!pin) { setStatus('invalid'); return; }

    // Must be logged in
    if (!isLoggedIn || !member) {
      setStatus('not_logged_in');
      return;
    }

    // Scan all raffle_sync keys in localStorage for a matching PIN
    try {
      let found = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.includes('raffle_sync')) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw);
        if (data.winnerPin === pin && data.status === 'complete') {
          const winner = data.winners?.[0] || '';
          const prize = data.prizes?.[0]?.name || 'Prize';
          setWinnerName(winner);
          setPrizeName(prize);

          // Verify the logged-in user IS the winner
          const loggedInName = member.name?.toLowerCase().trim();
          const winnerNameNorm = winner?.toLowerCase().trim();
          if (loggedInName !== winnerNameNorm) {
            setStatus('wrong_user');
          } else {
            setStatus('valid');
          }
          found = true;
          break;
        }
      }
      if (!found) setStatus('invalid');
    } catch {
      setStatus('invalid');
    }
  }, [pin, isLoggedIn, member]);

  return (
    <div className="min-h-screen bg-[#08080d] flex flex-col items-center justify-center p-6"
      style={{ fontFamily: "'Inter', 'Arial', sans-serif" }}>

      {/* Header */}
      <div className="w-full max-w-sm mb-8 text-center">
        <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-purple-500 mb-1">7th Heaven</p>
        <p className="text-[0.55rem] text-white/20 uppercase tracking-widest">Live Raffle · Claim Verification</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Loading */}
        {status === 'loading' && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/40 text-sm">Verifying...</p>
          </div>
        )}

        {/* NOT LOGGED IN */}
        {status === 'not_logged_in' && (
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-8 text-center">
            <span className="text-5xl block mb-4">🔐</span>
            <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Sign In Required</h2>
            <p className="text-white/40 text-sm mb-6">
              You must be signed in to your 7th Heaven account to verify your raffle win.
            </p>
            <button
              onClick={() => openModal()}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-colors"
            >
              Sign In to Verify
            </button>
          </div>
        )}

        {/* WRONG USER — logged in but not the winner */}
        {status === 'wrong_user' && (
          <div className="bg-[#0f0f18] border border-red-500/30 rounded-2xl p-8 text-center">
            <span className="text-5xl block mb-4">🚫</span>
            <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Not Your Claim</h2>
            <p className="text-white/40 text-sm mb-4">
              This PIN belongs to a different account. You must be signed in as the winning account to verify.
            </p>
            <p className="text-white/20 text-[0.6rem] font-mono bg-black/40 px-3 py-2 rounded-lg inline-block">
              Signed in as: <span className="text-white/50">{member?.name}</span>
            </p>
          </div>
        )}

        {/* VALID — logged in AND is the winner */}
        {status === 'valid' && (
          <div className="bg-[#0f0f18] border-2 border-yellow-500/50 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(251,191,36,0.2)]">

            {/* Top bar */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-400 px-6 py-3 flex items-center justify-center gap-2">
              <span className="text-black font-black text-sm uppercase tracking-widest">✓ PIN Verified</span>
            </div>

            <div className="p-8 text-center">
              <span className="text-6xl block mb-5">🏆</span>
              <h1 className="text-white font-black text-2xl uppercase tracking-wide mb-1">Raffle Winner</h1>
              <p className="text-white/40 text-xs mb-8">Show this screen to the 7th Heaven crew at the merch table.</p>

              {/* Winner name */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-6 py-4 mb-4">
                <p className="text-yellow-500/60 text-[0.5rem] font-black uppercase tracking-[0.2em] mb-1">Account Name</p>
                <p className="text-yellow-400 font-black text-2xl leading-tight">{winnerName}</p>
              </div>

              {/* Prize */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 mb-8">
                <p className="text-white/30 text-[0.5rem] font-black uppercase tracking-[0.2em] mb-1">Prize</p>
                <p className="text-white font-black text-lg leading-tight">{prizeName}</p>
              </div>

              {/* PIN display */}
              <div className="mb-6">
                <p className="text-white/30 text-[0.5rem] font-black uppercase tracking-[0.2em] mb-3">Verification PIN</p>
                <div className="flex items-center justify-center gap-2">
                  {pin.split('').map((digit, i) => (
                    <div key={i} className="w-10 h-14 bg-black/60 border-2 border-yellow-500/40 rounded-lg flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.15)]">
                      <span className="text-yellow-400 font-black text-2xl tabular-nums">{digit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-white/20 text-[0.55rem]">
                Only visible to the winning account. One claim per raffle.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-black/30 px-6 py-3 text-center border-t border-white/5">
              <p className="text-white/20 text-[0.5rem] uppercase tracking-widest">7th Heaven · Live Raffle</p>
            </div>
          </div>
        )}

        {/* INVALID — PIN not found */}
        {status === 'invalid' && (
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-8 text-center">
            <span className="text-5xl block mb-4">❌</span>
            <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">PIN Not Found</h2>
            <p className="text-white/40 text-sm mb-6">
              This PIN doesn't match an active raffle winner, or the raffle has ended.
            </p>
            <p className="text-white/20 text-[0.6rem] font-mono bg-black/40 px-3 py-2 rounded-lg inline-block">PIN: {pin}</p>
          </div>
        )}

      </div>

      <p className="text-white/15 text-[0.55rem] text-center mt-8 max-w-xs uppercase tracking-widest">
        This page is for prize redemption only. One claim per raffle.
      </p>
    </div>
  );
}
