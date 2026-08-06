'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMember } from '@/context/MemberContext';
import { supabase } from '@/lib/supabase-client';



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
  size?: string;
  color?: string;
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
    } catch { }
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

  // Scanner and single-use verification
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{ status: 'valid' | 'already_claimed' | 'invalid'; order?: PickupOrder } | null>(null);

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    let targetCode = scanInput.trim().toUpperCase();
    if (!targetCode.startsWith('PU-') && /^\d+$/.test(targetCode)) {
      targetCode = `PU-${targetCode}`;
    }

    const queue: PickupOrder[] = JSON.parse(localStorage.getItem('merch_pickup_queue') || '[]');
    const orderIndex = queue.findIndex(o => o.code === targetCode);

    if (orderIndex === -1) {
      setScanResult({ status: 'invalid' });
    } else {
      const order = queue[orderIndex];
      if (order.claimed) {
        setScanResult({ status: 'already_claimed', order });
      } else {
        // Mark as claimed
        queue[orderIndex].claimed = true;
        localStorage.setItem('merch_pickup_queue', JSON.stringify(queue));
        setPickupQueue(queue);
        setScanResult({ status: 'valid', order: queue[orderIndex] });
      }
    }
    setScanInput('');
  };

  // Load data
  const loadData = async () => {
    const queue: PickupOrder[] = JSON.parse(localStorage.getItem('merch_pickup_queue') || '[]');
    setPickupQueue(queue);
    setRaffleWins(getRaffleWins());

    // Load claimed pins from localStorage
    const claimedLocal = JSON.parse(localStorage.getItem('claimed_raffle_pins') || '[]');
    const claimedSet = new Set<string>(claimedLocal);

    // Also load claimed status from Supabase to merge
    try {
      const { data: dbRaffles } = await supabase
        .from('raffles')
        .select('winner_pins')
        .eq('status', 'complete');

      if (dbRaffles) {
        dbRaffles.forEach((raffle: any) => {
          let winnerPins = [];
          try {
            winnerPins = typeof raffle.winner_pins === 'string' ? JSON.parse(raffle.winner_pins) : raffle.winner_pins;
          } catch { }

          if (Array.isArray(winnerPins)) {
            winnerPins.forEach((item: any) => {
              if (item && typeof item === 'object' && item.pin && item.claimed) {
                claimedSet.add(item.pin);
              }
            });
          }
        });
      }
    } catch (err) {
      console.error('Error loading claimed pins from Supabase:', err);
    }

    setAwardedPins(claimedSet);
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
    if (isMerch) {
      loadData();
    }
    const interval = setInterval(() => {
      if (isMerch) loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [isMerch, isDemo]);


  const awardPrize = async (pin: string) => {
    setAwardedPins(prev => new Set([...prev, pin]));

    // 1. Save to localStorage
    const claimed = JSON.parse(localStorage.getItem('claimed_raffle_pins') || '[]');
    if (!claimed.includes(pin)) {
      claimed.push(pin);
      localStorage.setItem('claimed_raffle_pins', JSON.stringify(claimed));
    }

    // 2. Persist to Supabase by finding the raffle and updating it
    try {
      const { data: raffles } = await supabase
        .from('raffles')
        .select('*')
        .eq('status', 'complete');

      if (raffles) {
        for (const raffle of raffles) {
          let winnerPins = [];
          try {
            winnerPins = typeof raffle.winner_pins === 'string' ? JSON.parse(raffle.winner_pins) : raffle.winner_pins;
          } catch { }

          if (Array.isArray(winnerPins)) {
            let updated = false;
            const nextWinnerPins = winnerPins.map((item: any) => {
              if (typeof item === 'string' && item === pin) {
                updated = true;
                return { pin: item, claimed: true };
              } else if (item && typeof item === 'object' && item.pin === pin) {
                updated = true;
                return { ...item, claimed: true };
              }
              return item;
            });

            if (updated) {
              await supabase
                .from('raffles')
                .update({ winner_pins: nextWinnerPins })
                .eq('id', raffle.id);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to persist raffle award in Supabase:', err);
    }
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
    <div className="min-h-screen bg-[var(--color-bg-deep)] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-[var(--color-bg-surface)] border border-white/10 p-8 text-center max-w-sm w-full">
        <span className="text-5xl block mb-4">🔐</span>
        <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Merch Login Required</h2>
        <p className="text-white/40 text-sm mb-6">Sign in with your merch team account.</p>
        <button onClick={() => openModal()} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest transition-colors">Sign In</button>
      </div>
    </div>
  );

  if (!isDemo && !isMerch) return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-[var(--color-bg-surface)] border border-red-500/20 p-8 text-center max-w-sm w-full">
        <span className="text-5xl block mb-4">🚫</span>
        <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">Merch Team Only</h2>
        <p className="text-white/40 text-sm">This page is only accessible to 7th Heaven merch staff.</p>
      </div>
    </div>
  );

  const pendingPickups = pickupQueue.filter(o => !o.claimed);
  const claimedPickups = pickupQueue.filter(o => o.claimed);

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] pt-[123px]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header — sits below global nav */}
      <div className="border-b border-white/10 bg-[var(--color-bg-surface)]/90 backdrop-blur-sm sticky top-[95px] z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-pink-500 font-black uppercase tracking-[0.3em]">7th Heaven</p>
            <h1 className="text-white font-black text-lg uppercase tracking-widest">Merch Table</h1>
          </div>
          <div className="flex items-center gap-2">
            {pendingPickups.length > 0 && (
              <span className="px-2.5 py-1 bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-black uppercase tracking-widest rounded-full animate-pulse">
                {pendingPickups.length} Pickup{pendingPickups.length !== 1 ? 's' : ''} Pending
              </span>
            )}
            <span className="text-white/30 text-xs font-mono">{isDemo ? 'DEMO MODE' : member?.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Real-time Ticket/PIN Verification Scanner */}
        <div className="bg-[var(--color-bg-surface)] border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-sm">🔍</div>
            <div>
              <h2 className="text-white font-black text-sm uppercase tracking-wide">Scan QR Code or Enter PIN</h2>
              <p className="text-white/30 text-xs">Verify ticket single-use status at the Merch Desk</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <form onSubmit={handleVerifyCode} className="flex gap-2">
              <input
                type="text"
                placeholder="Scan QR or enter PIN (e.g. PU-3501 or 3501)"
                value={scanInput}
                onChange={e => setScanInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-pink-500 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-pink-500 hover:bg-pink-400 text-white font-black text-xs uppercase tracking-widest transition-all border-none cursor-pointer"
              >
                Verify Code
              </button>
            </form>

            {scanResult && (
              <div className="animate-in fade-in duration-250">
                {scanResult.status === 'valid' && scanResult.order && (
                  <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-emerald-400 font-black text-sm uppercase tracking-wide">Valid Code - Hand Off Item</p>
                      <p className="text-white text-xs mt-0.5">Item: <strong className="text-white font-bold">{scanResult.order.item}</strong></p>
                      {(scanResult.order.size || scanResult.order.color) && (
                        <p className="text-white/80 text-xs mt-0.5">
                          {scanResult.order.size && <span>Size: <strong>{scanResult.order.size}</strong></span>}
                          {scanResult.order.size && scanResult.order.color && <span> · </span>}
                          {scanResult.order.color && <span>Color: <strong>{scanResult.order.color}</strong></span>}
                        </p>
                      )}
                      <p className="text-white/60 text-xs">Customer: {scanResult.order.customer} ({scanResult.order.email})</p>
                      <p className="text-emerald-400/80 text-[var(--font-size-3xs)] uppercase font-bold mt-1 tracking-wider">Order marked as claimed</p>
                    </div>
                  </div>
                )}

                {scanResult.status === 'already_claimed' && scanResult.order && (
                  <div className="p-4 bg-red-500/15 border border-red-500/30 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-red-400 font-black text-sm uppercase tracking-wide">Warning: Already Claimed!</p>
                      <p className="text-white/60 text-xs mt-0.5">This QR/PIN code was already redeemed for a <strong className="text-white font-bold">{scanResult.order.item}</strong>.</p>
                      <p className="text-red-400/80 text-[var(--font-size-3xs)] uppercase font-bold mt-1 tracking-wider">DO NOT HAND OVER DUPLICATE MERCHANDISE</p>
                    </div>
                  </div>
                )}

                {scanResult.status === 'invalid' && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className=" text-[var(--color-accent)] font-black text-sm uppercase tracking-wide">Invalid Code</p>
                      <p className="text-white/60 text-xs mt-0.5">This code was not found in the purchase database.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Raffle Winners — PIN display for visual matching */}
        <div className="bg-[var(--color-bg-surface)] border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm">🏆</div>
            <div>
              <h2 className="text-white font-black text-sm uppercase tracking-wide">Raffle Winner PINs</h2>
              <p className="text-white/30 text-xs">Fan shows their PIN — match it here, then tap Award</p>
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
                        <p className="text-purple-300 font-black text-sm">{win.winner}</p>
                        <span className="text-white/20 text-[var(--font-size-2xs)] font-mono">· {win.prize}</span>
                        {awarded && <span className="text-emerald-400 font-black text-[var(--font-size-2xs)] uppercase tracking-widest">✓ Awarded</span>}
                      </div>
                      {/* PIN displayed as large readable digits */}
                      <div className="flex items-center gap-1.5">
                        {win.pin.split('').map((digit, i) => (
                          <div key={i} className={`w-10 h-13 min-h-[52px] flex items-center justify-center rounded-lg border-2 ${awarded
                            ? 'bg-white/5 border-white/10'
                            : 'bg-purple-500/5 border-purple-500/40 shadow-[0_0_12px_rgba(147,51,234,0.1)]'
                            }`}>
                            <span className={`font-black text-2xl tabular-nums ${awarded ? 'text-white/20' : 'text-purple-300'
                              }`}>{digit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => awardPrize(win.pin)}
                      disabled={awarded}
                      className={`shrink-0 px-5 py-3 font-black text-xs uppercase tracking-widest  transition-all ${awarded
                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:scale-[1.03] active:scale-[0.97]'
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
            className="flex-1 py-2.5 font-black text-xs uppercase tracking-widest border bg-pink-500/20 border-pink-500/40 text-pink-400">
            🛍️ Pickup Queue {pendingPickups.length > 0 ? `(${pendingPickups.length})` : ''}
          </button>
        </div>

        {/* Pickup Queue Tab */}
        {tab === 'pickup' && (
          <div className="space-y-3">
            {pendingPickups.length === 0 && claimedPickups.length === 0 ? (
              <div className="bg-[var(--color-bg-surface)] border border-white/10 p-10 text-center">
                <span className="text-4xl block mb-3 opacity-30">🛍️</span>
                <p className="text-white/30 text-sm">No pickup orders yet</p>
                <p className="text-white/15 text-xs mt-1">Orders appear here when fans choose "pickup" during a flash sale</p>
              </div>
            ) : (
              <>
                {pendingPickups.map(order => (
                  <div key={order.id} className="bg-[var(--color-bg-surface)] border border-pink-500/30 overflow-hidden">
                    <div className="px-5 py-3 bg-pink-500/5 border-b border-pink-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                        <span className="text-pink-400 font-black text-xs uppercase tracking-widest">Pending Pickup</span>
                      </div>
                      <span className="text-white font-black text-sm tracking-widest">{order.code}</span>
                    </div>
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-black text-sm">{order.item}</p>
                        {(order.size || order.color) && (
                          <p className="text-white/60 text-xs mt-0.5">
                            {order.size && <span>Size: <strong className="text-white/80">{order.size}</strong></span>}
                            {order.size && order.color && <span> · </span>}
                            {order.color && <span>Color: <strong className="text-white/80">{order.color}</strong></span>}
                          </p>
                        )}
                        <p className="text-white/40 text-xs mt-0.5">{order.customer}{order.email ? ` · ${order.email}` : ''}</p>
                        <p className="text-pink-400 font-black text-sm mt-1">${order.price}</p>
                      </div>
                      <button onClick={() => markClaimed(order.id)}
                        className="shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest transition-colors">
                        ✓ Hand Off
                      </button>
                    </div>
                  </div>
                ))}
                {claimedPickups.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-white/20 text-xs font-black uppercase tracking-widest px-1">Completed</p>
                    {claimedPickups.map(order => (
                      <div key={order.id} className="bg-[var(--color-bg-surface)] border border-white/5 px-5 py-3 flex items-center justify-between opacity-50">
                        <div>
                          <p className="text-white text-sm font-bold">{order.item}</p>
                          {(order.size || order.color) && (
                            <p className="text-white/40 text-[var(--font-size-3xs)]">
                              {order.size && <span>{order.size}</span>}
                              {order.size && order.color && <span> / </span>}
                              {order.color && <span>{order.color}</span>}
                            </p>
                          )}
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
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg-deep)]" />}>
      <MerchDashboard />
    </Suspense>
  );
}
