'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMember } from '@/context/MemberContext';



// ─── Types ────────────────────────────────────────────────────────────────────
interface PickupOrder {
  id: number;
  code: string;
  item: string;
  price: string;
  customer: string;
  email: string;
  ts: number;
  claimed: boolean;
}

interface RaffleWin {
  pin: string;
  winner: string;
  prize: string;
  crewSlug: string;
  ts: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRaffleWins(): RaffleWin[] {
  const wins: RaffleWin[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.includes('raffle_sync')) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      if (data.status !== 'complete') continue;
      const pins: string[] = data.winnerPins || (data.winnerPin ? [data.winnerPin] : []);
      pins.forEach((pin, idx) => {
        wins.push({
          pin,
          winner: data.winners?.[idx] || data.winners?.[0] || 'Unknown',
          prize: data.prizes?.[idx]?.name || data.prizes?.[0]?.name || 'Prize',
          crewSlug: key.replace('raffle_sync_', ''),
          ts: data.ts || 0,
        });
      });
    } catch {}
  }
  return wins;
}


// ─── Page ─────────────────────────────────────────────────────────────────────
function MerchDashboard() {
  const { member, isLoggedIn, openModal } = useMember();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'merch';
  const isMerch = isDemo || member?.role === 'merch' || member?.role === 'crew' || member?.role === 'admin';

  // Awarded tracking
  const [awardedPins, setAwardedPins] = useState<Set<string>>(new Set());

  // Pickup queue
  const [pickupQueue, setPickupQueue] = useState<PickupOrder[]>([]);
  const [raffleWins, setRaffleWins] = useState<RaffleWin[]>([]);

  // Active tab
  const [tab, setTab] = useState<'raffle' | 'pickup'>('pickup');

  // Load data
  const loadData = () => {
    const queue: PickupOrder[] = JSON.parse(localStorage.getItem('merch_pickup_queue') || '[]');
    setPickupQueue(queue);
    setRaffleWins(getRaffleWins());
  };

  useEffect(() => {
    if (isDemo) {
      // Seed demo data
      setPickupQueue([
        { id: 1, code: 'PU-483920', item: '7H Classic Logo Tee', price: '35.00', customer: 'ChicagoLou', email: 'chicagolou@gmail.com', ts: Date.now() - 120000, claimed: false },
        { id: 2, code: 'PU-710234', item: 'Tour Hoodie (Black)', price: '65.00', customer: 'RichFam99', email: 'richfam@yahoo.com', ts: Date.now() - 300000, claimed: false },
        { id: 3, code: 'PU-591847', item: 'Drumstick Set (Signed)', price: '28.00', customer: 'BeatsByMike', email: 'beats@gmail.com', ts: Date.now() - 600000, claimed: true },
      ]);
      setRaffleWins([
        { pin: '847392', winner: 'ChicagoLou', prize: 'Signed Drumsticks', crewSlug: 'michael', ts: Date.now() - 900000 },
      ]);
      return;
    }
    if (isMerch) loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [isMerch, isDemo]);


  const awardPrize = (pin: string) => {
    setAwardedPins(prev => new Set([...prev, pin]));
  };


  // Mark pickup as claimed
  const markClaimed = (id: number) => {
    const queue: PickupOrder[] = JSON.parse(localStorage.getItem('merch_pickup_queue') || '[]');
    const updated = queue.map(o => o.id === id ? { ...o, claimed: true } : o);
    localStorage.setItem('merch_pickup_queue', JSON.stringify(updated));
    setPickupQueue(updated);
  };

  // ─── Auth gates ──────────────────────────────────────────────────────────────
  if (!isDemo && (!isLoggedIn || !member)) return (
    <div className="min-h-screen bg-[#08080d] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-8 text-center max-w-sm w-full">
        <span className="text-5xl block mb-4">🔐</span>
        <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Merch Login Required</h2>
        <p className="text-white/40 text-sm mb-6">Sign in with your merch team account.</p>
        <button onClick={() => openModal()} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-colors">Sign In</button>
      </div>
    </div>
  );

  if (!isDemo && !isMerch) return (
    <div className="min-h-screen bg-[#08080d] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-[#0f0f18] border border-red-500/20 rounded-2xl p-8 text-center max-w-sm w-full">
        <span className="text-5xl block mb-4">🚫</span>
        <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Merch Team Only</h2>
        <p className="text-white/40 text-sm">This page is only accessible to 7th Heaven merch staff.</p>
      </div>
    </div>
  );

  const pendingPickups = pickupQueue.filter(o => !o.claimed);
  const claimedPickups = pickupQueue.filter(o => o.claimed);

  return (
    <div className="min-h-screen bg-[#08080d] pt-[72px]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header — sits below global nav */}
      <div className="border-b border-white/10 bg-[#0a0a10]/90 backdrop-blur-sm sticky top-[72px] z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-[0.55rem] text-pink-500 font-black uppercase tracking-[0.3em]">7th Heaven</p>
            <h1 className="text-white font-black text-lg uppercase tracking-widest">Merch Table</h1>
          </div>
          <div className="flex items-center gap-2">
            {pendingPickups.length > 0 && (
              <span className="px-2.5 py-1 bg-pink-500/20 border border-pink-500/30 text-pink-400 text-[0.6rem] font-black uppercase tracking-widest rounded-full animate-pulse">
                {pendingPickups.length} Pickup{pendingPickups.length !== 1 ? 's' : ''} Pending
              </span>
            )}
            <span className="text-white/30 text-[0.6rem] font-mono">{isDemo ? 'DEMO MODE' : member?.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Raffle Winners — PIN display for visual matching */}
        <div className="bg-[#0f0f18] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-sm">🏆</div>
            <div>
              <h2 className="text-white font-black text-sm uppercase tracking-wide">Raffle Winner PINs</h2>
              <p className="text-white/30 text-[0.55rem]">Fan shows their PIN — match it here, then tap Award</p>
            </div>
          </div>

          {raffleWins.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-3xl block mb-2 opacity-30">🏆</span>
              <p className="text-white/30 text-sm">No raffle wins yet</p>
              <p className="text-white/15 text-xs mt-1">Winner PINs will appear here after a raffle ends</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {raffleWins.map((win) => {
                const awarded = awardedPins.has(win.pin);
                return (
                  <div key={win.pin} className={`p-5 flex items-center justify-between gap-4 transition-opacity ${awarded ? 'opacity-40' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-yellow-400 font-black text-sm">{win.winner}</p>
                        <span className="text-white/20 text-[0.5rem] font-mono">· {win.prize}</span>
                        {awarded && <span className="text-emerald-400 font-black text-[0.5rem] uppercase tracking-widest">✓ Awarded</span>}
                      </div>
                      {/* PIN displayed as large readable digits */}
                      <div className="flex items-center gap-1.5">
                        {win.pin.split('').map((digit, i) => (
                          <div key={i} className={`w-10 h-13 min-h-[52px] flex items-center justify-center rounded-lg border-2 ${
                            awarded
                              ? 'bg-white/5 border-white/10'
                              : 'bg-yellow-500/5 border-yellow-500/40 shadow-[0_0_12px_rgba(251,191,36,0.1)]'
                          }`}>
                            <span className={`font-black text-2xl tabular-nums ${
                              awarded ? 'text-white/20' : 'text-yellow-400'
                            }`}>{digit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => awardPrize(win.pin)}
                      disabled={awarded}
                      className={`shrink-0 px-5 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${
                        awarded
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-[1.03] active:scale-[0.97]'
                      }`}
                    >
                      {awarded ? '✓ Done' : 'Award Prize'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tabs — Pickup Queue only */}
        <div className="flex gap-2">
          <button
            className="flex-1 py-2.5 font-black text-xs uppercase tracking-widest rounded-xl border bg-pink-500/20 border-pink-500/40 text-pink-400">
            🛍️ Pickup Queue {pendingPickups.length > 0 ? `(${pendingPickups.length})` : ''}
          </button>
        </div>

        {/* Pickup Queue Tab */}
        {tab === 'pickup' && (
          <div className="space-y-3">
            {pendingPickups.length === 0 && claimedPickups.length === 0 ? (
              <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-10 text-center">
                <span className="text-4xl block mb-3 opacity-30">🛍️</span>
                <p className="text-white/30 text-sm">No pickup orders yet</p>
                <p className="text-white/15 text-xs mt-1">Orders appear here when fans choose "pickup" during a flash sale</p>
              </div>
            ) : (
              <>
                {pendingPickups.map(order => (
                  <div key={order.id} className="bg-[#0f0f18] border border-pink-500/30 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 bg-pink-500/5 border-b border-pink-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                        <span className="text-pink-400 font-black text-[0.6rem] uppercase tracking-widest">Pending Pickup</span>
                      </div>
                      <span className="text-white font-black text-sm tracking-widest">{order.code}</span>
                    </div>
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-black text-sm">{order.item}</p>
                        <p className="text-white/40 text-xs mt-0.5">{order.customer}{order.email ? ` · ${order.email}` : ''}</p>
                        <p className="text-pink-400 font-black text-sm mt-1">${order.price}</p>
                      </div>
                      <button onClick={() => markClaimed(order.id)}
                        className="shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-colors">
                        ✓ Hand Off
                      </button>
                    </div>
                  </div>
                ))}
                {claimedPickups.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-white/20 text-[0.55rem] font-black uppercase tracking-widest px-1">Completed</p>
                    {claimedPickups.map(order => (
                      <div key={order.id} className="bg-[#0f0f18] border border-white/5 rounded-xl px-5 py-3 flex items-center justify-between opacity-50">
                        <div>
                          <p className="text-white text-sm font-bold">{order.item}</p>
                          <p className="text-white/40 text-xs">{order.customer} · {order.code}</p>
                        </div>
                        <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">✓ Claimed</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}



      </div>
    </div>
  );
}

export default function MerchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080d]" />}>
      <MerchDashboard />
    </Suspense>
  );
}
