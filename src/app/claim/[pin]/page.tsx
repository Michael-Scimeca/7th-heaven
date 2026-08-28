/* eslint-disable react-doctor/no-giant-component */
'use client';
import Image from 'next/image';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMember } from '@/context/MemberContext';
import CosmicRadialButton from '@/components/CosmicRadialButton';

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params?.pin as string;
  const { member, isLoggedIn, openModal } = useMember();

  const [status, setStatus] = useState<'loading' | 'valid' | 'wrong_user' | 'not_logged_in' | 'invalid'>('loading');
  const [winnerName, setWinnerName] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [shopifyProductsMap, setShopifyProductsMap] = useState<Record<string, { title: string, imageUrl: string }>>({});
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    if (pin) {
      const claimedMap = JSON.parse(localStorage.getItem('claimed_raffle_pins_v1') || localStorage.getItem('claimed_raffle_pins') || '{}');
      if (claimedMap[pin]) {
        setHasClaimed(true);
      }
    }
  }, [pin]);

  const handleClaimConfirm = () => {
    if (hasClaimed || !pin) return;

    // Save to claimed map
    const claimedMap = JSON.parse(localStorage.getItem('claimed_raffle_pins_v1') || localStorage.getItem('claimed_raffle_pins') || '{}');
    claimedMap[pin] = true;
    localStorage.setItem('claimed_raffle_pins_v1', JSON.stringify(claimedMap));
    setHasClaimed(true);

    const firstPrize = prizesList[0];
    const displayTitle = firstPrize ? (shopifyProductsMap[firstPrize.productId || '']?.title || firstPrize.name) : 'Raffle Prize';
    const displayImage = firstPrize ? (shopifyProductsMap[firstPrize.productId || '']?.imageUrl || '/images/mockups/merch-hoodie.png') : '/images/mockups/merch-hoodie.png';

    const newClaimOrder = {
      id: Date.now(),
      customer: winnerName || member?.name || 'Anonymous Fan',
      email: member?.email || (winnerName.toLowerCase().replace(/\s+/g, '') + '@fan.7thheaven.com'),
      address: '',
      city: '',
      zip: '',
      item: displayTitle,
      price: '$0.00',
      size: displayTitle.toLowerCase().match(/shirt|tee|hoodie|sweat|jersey|jacket|tank|hat|cap/) ? 'L' : null,
      color: displayTitle.toLowerCase().match(/shirt|tee|hoodie|sweat|jersey|jacket|tank|hat|cap/) ? 'Black' : null,
      method: 'merch_table',
      source: 'Raffle',
      status: 'Ready for Pickup',
      image: displayImage,
      ts: Date.now()
    };

    // Save to admin_orders_list in localStorage
    try {
      const currentOrders = JSON.parse(localStorage.getItem('admin_orders_list_v1') || localStorage.getItem('admin_orders_list') || '[]');
      currentOrders.unshift(newClaimOrder);
      localStorage.setItem('admin_orders_list_v1', JSON.stringify(currentOrders));

      // Also add to merch_pickup_queue
      const queue = JSON.parse(localStorage.getItem('merch_pickup_queue_v1') || localStorage.getItem('merch_pickup_queue') || '[]');
      queue.unshift({
        id: newClaimOrder.id,
        code: `PU-${pin}`,
        item: newClaimOrder.item,
        size: newClaimOrder.size,
        color: newClaimOrder.color,
        price: newClaimOrder.price,
        customer: newClaimOrder.customer,
        email: newClaimOrder.email,
        ts: newClaimOrder.ts,
        claimed: false
      });
      localStorage.setItem('merch_pickup_queue_v1', JSON.stringify(queue));

      // Decrement inventory in Shopify storefront for the prize
      if (firstPrize?.variantId) {
        fetch('/api/shopify/inventory/adjust', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId: firstPrize.variantId, quantity: firstPrize.qty || 1 })
        }).then(res => res.ok ? res.json() : null)
          .then(data => console.log('[Shopify Inventory Sync]', data))
          .catch(err => console.error('[Shopify Inventory Sync Error]', err));
      }

      // Notify admin via BroadcastChannel
      const bc = new BroadcastChannel('7h_live_michael');
      bc.postMessage({ type: 'ORDER_CREATED', payload: newClaimOrder });
      bc.close();
    } catch (err) {
      console.error("Failed to persist raffle claim:", err);
    }
  };

  const prizesList = useMemo<{ name: string, qty: number, productId?: string, variantId?: string }[]>(() => {
    if (!prizeName) return [];
    try {
      if (prizeName.startsWith('[') || prizeName.startsWith('{')) {
        const parsed = JSON.parse(prizeName);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return [{ name: prizeName, qty: 1 }];
    } catch {
      return [{ name: prizeName, qty: 1 }];
    }
  }, [prizeName]);

  const fetchShopifyDetails = useCallback(async () => {
    if (prizesList.length === 0) return;
    try {
      const res = await fetch('/api/shopify/inventory');
      if (res.ok) {
        const data = await res.json();
        const productList = data.products || data || [];
        const map: Record<string, { title: string, imageUrl: string }> = {};
        for (const p of productList) {
          map[p.id] = {
            title: p.title,
            imageUrl: p.images?.edges?.[0]?.node?.url || '/images/mockups/merch-hoodie.png'
          };
        }
        setShopifyProductsMap(map);
      }
    } catch (e) {
      console.error('Failed to load Shopify products for claiming page:', e);
    }
  }, [prizesList.length]);

  useEffect(() => {
    fetchShopifyDetails();
  }, [fetchShopifyDetails]);

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
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${status === 'valid' ? 'flash-bg' : ' '}`}
      style={{ fontFamily: "'Inter', 'Arial', sans-serif" }}>

      {/* Header */}
      <div className="w-full max-w-sm mb-8 text-center">
        <p className="font-bold uppercase tracking-[0.3em] text-purple-500 mb-1">7th Heaven</p>
        <p className="uppercase tracking-widest">Live Raffle · Claim Verification</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Loading */}
        {status === 'loading' && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-yellow-500 rounded-lg animate-spin mx-auto mb-4" />
            <p className="">Verifying...</p>
          </div>
        )}

        {/* NOT LOGGED IN */}
        {status === 'not_logged_in' && (
          <div className="bg-[var(--color-bg-surface)] border border-white/10 p-8 text-center">
            <span className="text-5xl block mb-4">🔐</span>
            <h2 className="text-white font-bold uppercase tracking-wide mb-2">Sign In Required</h2>
            <p className="mb-6">
              You must be signed in to your 7th Heaven account to verify your raffle win.
            </p>
            <CosmicRadialButton
              onClick={() => openModal()}
              icon={false}
              className="w-full py-3 text-white font-bold tracking-wider rounded-lg"
            >
              Sign In to Verify
            </CosmicRadialButton>
          </div>
        )}

        {/* WRONG USER — logged in but not the winner */}
        {status === 'wrong_user' && (
          <div className="bg-[var(--color-bg-surface)] border border-red-500/30 p-8 text-center">
            <span className="text-5xl block mb-4">🚫</span>
            <h2 className="text-white font-bold uppercase tracking-wide mb-2">Not Your Claim</h2>
            <p className="mb-4">
              This PIN belongs to a different account. You must be signed in as the winning account to verify.
            </p>
            <p className="font-mono bg-black/40 px-3 py-2 rounded-lg inline-block">
              Signed in as: <span className="text-white/50">{member?.name}</span>
            </p>
          </div>
        )}

        {/* VALID — logged in AND is the winner */}
        {status === 'valid' && (
          <div className="bg-[var(--color-bg-surface)] border-2 border-yellow-500/50 overflow-hidden shadow-[0_0_60px_rgba(192, 132, 252,0.2)]">

            {/* Top bar */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-400 px-6 py-3 flex items-center justify-center gap-2">
              <span className="text-black font-bold uppercase tracking-widest font-sans">✓ PIN Verified</span>
            </div>

            <div className="p-8 text-center">
              <span className="text-6xl block mb-5">🏆</span>
              <h1 className="text-white font-bold text-2xl uppercase tracking-wide mb-1 font-sans">Raffle Winner</h1>
              <p className="mb-8 font-sans">Show this screen to the 7th Heaven crew at the merch table.</p>

              {/* Winner name */}
              <div className="bg-purple-500/10 border border-purple-500/30 px-6 py-4 mb-4">
                <p className="text-[var(--color-accent)]/60 font-bold uppercase tracking-[0.2em] mb-1 font-sans">Account Name</p>
                <p className="text-purple-300 font-bold leading-tight font-sans">{winnerName}</p>
              </div>

              {/* Prizes List */}
              <div className="space-y-3 mb-8">
                <p className="font-bold uppercase tracking-[0.2em] mb-1 text-center font-sans">Prizes Won ({prizesList.length})</p>
                {prizesList.map((item) => {
                  const shopifyDetails = item.productId ? shopifyProductsMap[item.productId] : null;
                  const displayTitle = shopifyDetails?.title || item.name;
                  const displayImage = shopifyDetails?.imageUrl || '/images/mockups/merch-hoodie.png';

                  return (
                    <div key={item.productId || item.variantId || item.name} className="bg-white/[0.03] border border-white/10 p-3 flex gap-3 items-center text-left">
                      <div className="w-12 h-12 bg-[#00000029] rounded-lg flex items-center justify-center p-1 relative shrink-0">
                        <Image width={200} height={200} unoptimized src={displayImage} alt={displayTitle} className="w-full h-full object-contain mix-blend-screen" onError={(e) => { e.currentTarget.src = '/images/mockups/merch-hoodie.png'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate font-sans">{displayTitle}</p>
                        <p className="mt-0.5 uppercase tracking-widest font-bold font-sans">Qty: {item.qty || 1}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PIN display */}
              <div className="mb-6">
                <p className="font-bold uppercase tracking-[0.2em] mb-3 font-sans">Verification PIN</p>
                <div className="flex items-center justify-center gap-2">
                  {Array.from(pin, (digit, i) => ({ digit, i })).map(({ digit, i }) => (
                    <div key={i} className="w-10 h-14 bg-black/60 border-2 border-purple-500/40 rounded-lg flex items-center justify-center shadow-[0_0_8px_rgba(192, 132, 252,0.15)]">
                      <span className="text-purple-300 font-bold text-2xl tabular-nums font-sans">{digit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claim Confirm Button */}
              <div className="mt-6 mb-4">
                {hasClaimed ? (
                  <div className="py-3 px-4 bg-emerald-500/15 border border-emerald-500/30 text-[var(--color-accent)] font-bold uppercase tracking-widest font-sans flex items-center justify-center gap-1.5 animate-pulse">
                    <span>✓ Claim Confirmed & Admin Notified</span>
                  </div>
                ) : (
                  <CosmicRadialButton
                    onClick={handleClaimConfirm}
                    icon={false}
                    className="w-full py-3 text-white font-bold tracking-wider rounded-lg font-sans"
                  >
                    Confirm Prize Claim
                  </CosmicRadialButton>
                )}
              </div>

              <p className="font-sans">
                Only visible to the winning account. One claim per raffle.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-black/30 px-6 py-3 text-center border-t border-white/5">
              <p className="uppercase tracking-widest font-sans">7th Heaven · Live Raffle</p>
            </div>
          </div>
        )}

        {/* INVALID — PIN not found */}
        {status === 'invalid' && (
          <div className="bg-[var(--color-bg-surface)] border border-white/10 p-8 text-center">
            <span className="text-5xl block mb-4">❌</span>
            <h2 className="text-white font-bold uppercase tracking-wide mb-2">PIN Not Found</h2>
            <p className="mb-6">
              This PIN doesn't match an active raffle winner, or the raffle has ended.
            </p>
            <p className="font-mono bg-black/40 px-3 py-2 rounded-lg inline-block">PIN: {pin}</p>
          </div>
        )}

      </div>

      <p className="text-center mt-8 max-w-xs uppercase tracking-widest">
        This page is for prize redemption only. One claim per raffle.
      </p>
    </div>
  );
}
