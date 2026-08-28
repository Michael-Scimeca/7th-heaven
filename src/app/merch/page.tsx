/* eslint-disable react-doctor/no-giant-component */
/* oxlint-disable react-doctor/no-state-in-handlers-only, react-doctor/state-only-used-in-handlers */
/* eslint-disable react-doctor/no-state-in-handlers-only, react-doctor/state-only-used-in-handlers */
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
        localStorage.setItem('merch_pickup_queue_v1', JSON.stringify(queue));
        setPickupQueue(queue);
        setScanResult({ status: 'valid', order: queue[orderIndex] });
      }
    }
    setScanInput('');
  };

  // Load data
  const loadData = (isCancelled?: () => boolean) => {
    const queue: PickupOrder[] = JSON.parse(localStorage.getItem('merch_pickup_queue_v1') || localStorage.getItem('merch_pickup_queue') || '[]');
    setPickupQueue(queue);
    setRaffleWins(getRaffleWins());

    // Load claimed pins from localStorage
    const claimedLocal = JSON.parse(localStorage.getItem('claimed_raffle_pins_v1') || localStorage.getItem('claimed_raffle_pins') || '[]');
    const claimedSet = new Set<string>(claimedLocal);

    // Also load claimed status from Supabase to merge
    supabase
      .from('raffles')
      .select('winner_pins')
      .eq('status', 'complete')
      .then(({ data: dbRaffles }: any) => {
        if (isCancelled?.()) return;
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
        if (!isCancelled?.()) {
          setAwardedPins(claimedSet);
        }
      })
      .catch((err: any) => {
        console.error('Error loading claimed pins from Supabase:', err);
        if (!isCancelled?.()) {
          setAwardedPins(claimedSet);
        }
      });
  };

  useEffect(() => {
    let cancelled = false;
    const checkCancelled = () => cancelled;
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
      loadData(checkCancelled);
    }
    const interval = setInterval(() => {
      if (isMerch) loadData(checkCancelled);
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isMerch, isDemo]);


  const awardPrize = async (pin: string) => {
    setAwardedPins(prev => new Set([...prev, pin]));

    // 1. Save to localStorage
    const claimed = JSON.parse(localStorage.getItem('claimed_raffle_pins_v1') || localStorage.getItem('claimed_raffle_pins') || '[]');
    if (!claimed.includes(pin)) {
      claimed.push(pin);
      localStorage.setItem('claimed_raffle_pins_v1', JSON.stringify(claimed));
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
    const queue: PickupOrder[] = JSON.parse(localStorage.getItem('merch_pickup_queue_v1') || localStorage.getItem('merch_pickup_queue') || '[]');
    const updated = queue.map(o => o.id === id ? { ...o, claimed: true } : o);
    localStorage.setItem('merch_pickup_queue_v1', JSON.stringify(updated));
    setPickupQueue(updated);
  };

  // ─── Auth gates ──────────────────────────────────────────────────────────────
  if (!isDemo && (!isLoggedIn || !member)) return (
    <div className="min-h-screen   flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-[var(--color-bg-surface)] border border-white/10 p-8 text-center max-w-sm w-full">
        <span className="text-5xl block mb-4">🔐</span>
        <h2 className="text-white  font-bold  text-xl uppercase tracking-wide mb-2">Merch Login Required</h2>
        <p className="mb-6">Sign in with your merch team account.</p>
        <button aria-label="Action button" onClick={() => openModal()} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white  font-bold  text-xs uppercase tracking-widest transition-colors">Sign In</button>
      </div>
    </div>
  );

  if (!isDemo && !isMerch) return (
    <div className="min-h-screen   flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-[var(--color-bg-surface)] border border-red-500/20 p-8 text-center max-w-sm w-full">
        <span className="text-5xl block mb-4">🚫</span>
        <h2 className="text-white  font-bold  text-xl uppercase tracking-wide mb-2">Merch Team Only</h2>
        <p className="">This page is only accessible to 7th Heaven merch staff.</p>
      </div>
    </div>
  );

  const pendingPickups = pickupQueue.filter(o => !o.claimed);
  const claimedPickups = pickupQueue.filter(o => o.claimed);

  return (
    <div className="site-container min-h-screen pt-[123px]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header — sits below global nav */}
      <div className="border-b border-white/10 bg-[var(--color-bg-surface)]/90 backdrop-blur-sm sticky top-[95px] z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-pink-500 font-bold uppercase tracking-[0.3em]">7th Heaven</p>
            <h1 className="text-white  font-bold  text-lg uppercase tracking-widest">Merch Table</h1>
          </div>
          <div className="flex items-center gap-2">
            {pendingPickups.length > 0 && (
              <span className="px-2.5 py-1 bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs  font-bold  uppercase tracking-widest  rounded-lg  animate-pulse">
                {pendingPickups.length} Pickup{pendingPickups.length !== 1 ? 's' : ''} Pending
              </span>
            )}
            <span className="text-white/30 text-xs font-mono">{isDemo ? 'DEMO MODE' : member?.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center min-h-[55vh]">
        <div className="w-16 h-16 rounded-lg  bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-2xl text-purple-400 mb-4 shadow-[0_0_30px_rgba(147,51,234,0.15)]">
          ✨
        </div>
        <h2 className="text-3xl  font-bold  uppercase tracking-widest text-white   ">
          Coming Soon
        </h2>
        <p className="max-w-sm mt-2 font-medium">
          The 7th Heaven Merch Table portal is currently under maintenance and will be live soon.
        </p>
      </div>
    </div>
  );
}

export default function MerchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen  " />}>
      <MerchDashboard />
    </Suspense>
  );
}
