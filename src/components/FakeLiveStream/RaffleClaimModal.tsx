'use client';

import React, { useState } from 'react';
import { Trophy } from 'lucide-react';

interface RaffleState {
  status: string;
  entrants: any[];
  prizes: any[];
  winners: any[];
  timer: number;
  minEntrants?: number;
  countdown?: number;
  winnerPins?: string[];
  timestamp?: number;
}

interface Member {
  name: string;
  [key: string]: any;
}

interface RaffleClaimModalProps {
  raffleState: RaffleState;
  member: Member | null;
  onClose: () => void;
}

export function RaffleClaimModal({ raffleState, member, onClose }: RaffleClaimModalProps) {
  const [claimMethod, setClaimMethod] = useState<'shipping' | 'merch_table' | null>(null);

  const winnerIdx = Math.max(0, raffleState.winners.findIndex((w: any) => (w?.name || w) === member?.name) ?? 0);
  const pin = raffleState.winnerPins?.[winnerIdx] || '';
  const claimUrl = typeof window !== 'undefined' ? `${window.location.origin}/claim/${pin}` : '';

  const handleClose = () => {
    setClaimMethod(null);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="bg-gray-50/98 backdrop-blur-xl border border-purple-500/40 p-6 w-full max-w-sm shadow-md relative transition-opacity duration-200 ease-out max-h-[90vh] overflow-y-auto text-black">
        <button aria-label="Close"
          onClick={handleClose}
          className="absolute top-3 right-3 text-black/50 hover:text-black transition-colors p-1 bg-gray-50 hover:bg-gray-100 rounded-full"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {!claimMethod ? (
          <>
            <div className="text-center mb-5 flex flex-col items-center">
              <Trophy className="w-10 h-10 text-yellow-500 mb-2" />
              <h3 className="text-xl font-black text-black uppercase tracking-wider">You Won!</h3>
              {raffleState.prizes?.[winnerIdx]?.name && (
                <p className="text-sm font-bold  text-[var(--color-accent)] mt-1 uppercase tracking-widest">{raffleState.prizes[winnerIdx].name}</p>
              )}
              <p className="text-xs text-black/40 mt-1">Show your PIN to the crew at the merch table</p>
            </div>

            {pin && (
              <div className="bg-[var(--color-purple-glow)] border-2 border-[var(--color-border-purple)] p-4 mb-4 text-center">
                <p className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.2em] text-[var(--color-purple-light)] mb-3">Your Verification PIN</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {pin.split('').map((digit: string, i: number) => (
                    <div key={`raffle-pin-${i}-${digit}`} className="w-9 h-12 bg-gray-100 border-2 border-[var(--color-border-purple)] rounded-lg flex items-center justify-center">
                      <span className="text-[var(--color-purple-light)] font-black text-2xl tabular-nums">{digit}</span>
                    </div>
                  ))}
                </div>
                <a href={claimUrl} target="_blank" rel="noreferrer"
                  className="block w-full py-2.5 bg-[var(--color-purple-primary)] hover:bg-[var(--color-purple-hover)] text-white font-black text-[var(--font-size-xs)] uppercase tracking-widest rounded-lg transition-colors mb-2">
                  Open Full Claim Page
                </a>
                <p className="text-[var(--font-size-2xs)] text-black/25">This link is unique to you — show it to the crew</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-black/30 uppercase tracking-widest text-center mb-2">Or choose how to receive your prize</p>
              <button aria-label="Action button" onClick={() => setClaimMethod('shipping')}
                className="w-full p-3 border border-black/10 hover:border-purple-500/30 bg-gray-50 flex items-center gap-3 transition-colors text-left">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </div>
                <div>
                  <p className="font-bold text-xs text-black uppercase tracking-wider">Ship it to me</p>
                  <p className="text-xs text-black/30 mt-0.5">100% off Shopify checkout link</p>
                </div>
              </button>
              <button aria-label="Action button" onClick={() => setClaimMethod('merch_table')}
                className="w-full p-3 border border-black/10 hover:border-purple-500/30 bg-gray-50 flex items-center gap-3 transition-colors text-left">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[var(--color-accent)] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                </div>
                <div>
                  <p className="font-bold text-xs text-black uppercase tracking-wider">Pick up at Merch Table</p>
                  <p className="text-xs text-black/30 mt-0.5">Show PIN or open claim page</p>
                </div>
              </button>
            </div>
          </>
        ) : claimMethod === 'shipping' ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
            </div>
            <h3 className="text-lg font-black text-black uppercase tracking-wider mb-2">Shipping Claim</h3>
            <p className="text-sm text-black/50 mb-6 px-4">Your 100% off voucher is being generated. You'll be transferred to Shopify to enter your shipping details.</p>
            <button aria-label="Close"
              onClick={() => { alert('In production, this opens a Shopify Cart with discount applied!'); handleClose(); }}
              className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-black font-black text-xs uppercase tracking-widest transition-colors"
            >
              Open Secure Checkout
            </button>
            <button aria-label="Action button" onClick={() => setClaimMethod(null)} className="w-full mt-2 py-2 text-black/30 hover:text-black/60 text-xs font-bold uppercase tracking-widest transition-colors">Back</button>
          </div>
        ) : (
          <div className="text-center py-4">
            <h3 className="text-lg font-black text-[var(--color-accent)] uppercase tracking-wider mb-1">Merch Table Pickup</h3>
            <p className="text-xs text-black/40 mb-5 uppercase tracking-widest">Show this PIN or page to the crew</p>
            {pin && (
              <div className="bg-purple-500/5 border border-purple-500/30 p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {pin.split('').map((digit: string, i: number) => (
                    <div key={`raffle-pin-confirm-${i}-${digit}`} className="w-8 h-10 bg-gray-100 border border-purple-500/40 rounded flex items-center justify-center">
                      <span className="text-purple-300 font-black text-lg tabular-nums">{digit}</span>
                    </div>
                  ))}
                </div>
                <a href={claimUrl} target="_blank" rel="noreferrer" className=" text-[var(--color-accent)]/60 text-xs underline">Open full claim page →</a>
              </div>
            )}
            <button aria-label="Close" onClick={handleClose} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest transition-colors">Done</button>
            <button aria-label="Action button" onClick={() => setClaimMethod(null)} className="w-full mt-2 py-2 text-black/30 hover:text-black/60 text-xs font-bold uppercase tracking-widest transition-colors">Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
