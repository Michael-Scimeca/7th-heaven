"use client";

import React, { useState } from "react";
import { Trophy } from "lucide-react";

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

export function RaffleClaimModal({
  raffleState,
  member,
  onClose,
}: RaffleClaimModalProps) {
  const [claimMethod, setClaimMethod] = useState<
    "shipping" | "merch_table" | null
  >(null);

  const winnerIdx = Math.max(
    0,
    raffleState.winners.findIndex(
      (w: any) => (w?.name || w) === member?.name,
    ) ?? 0,
  );
  const pin = raffleState.winnerPins?.[winnerIdx] || "";
  const claimUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/claim/${pin}`
      : "";

  const handleClose = () => {
    setClaimMethod(null);
    onClose();
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto border border-purple-500/40 bg-gray-50/98 p-6 text-black backdrop-blur-xl transition-opacity duration-200 ease-out">
        <button
          aria-label="Close"
          onClick={handleClose}
          className="hover: absolute top-3 right-3 rounded-lg bg-gray-50 p-1 text-black/50 transition-colors hover:bg-gray-100"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {!claimMethod ? (
          <>
            <div className="mb-5 flex flex-col items-center text-center">
              <Trophy className="mb-2 h-11 w-11 text-yellow-500" />
              <h3 className="r">You Won!</h3>
              {raffleState.prizes?.[winnerIdx]?.name && (
                <p>{raffleState.prizes[winnerIdx].name}</p>
              )}
              <p className="text-black/40">
                Show your PIN to the crew at the merch table
              </p>
            </div>

            {pin && (
              <div className="mb-6 border-2 border-[var(--color-border-purple)] bg-[var(--color-purple-glow)] p-4 text-center">
                <p className="mb-3">Your Verification PIN</p>
                <div className="mb-3 flex items-center justify-center gap-2">
                  {pin.split("").map((digit: string, i: number) => (
                    <div
                      key={`raffle-pin-${i}-${digit}`}
                      className="flex h-12 w-9 items-center justify-center rounded-lg border-2 border-[var(--color-border-purple)] bg-gray-100"
                    >
                      <span className="text-2xl text-[var(--color-purple-light)] tabular-nums">
                        {digit}
                      </span>
                    </div>
                  ))}
                </div>
                <a
                  href={claimUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-2 block w-full rounded-lg bg-[var(--color-purple-primary)] py-2.5 text-[var(--font-size-xs)] transition-colors hover:bg-[var(--color-purple-hover)]"
                >
                  Open Full Claim Page
                </a>
                <p className="text-black/25">
                  This link is unique to you — show it to the crew
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="mb-2 text-center text-black/30">
                Or choose how to receive your prize
              </p>
              <button
                onClick={() => setClaimMethod("shipping")}
                className="flex w-full items-center gap-3 border border-black/10 bg-gray-50 p-3 text-left transition-colors hover:border-purple-500/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
                <div>
                  <p className="r">Ship it to me</p>
                  <p className="mt-0.5 text-black/30">
                    100% off Shopify checkout link
                  </p>
                </div>
              </button>
              <button
                onClick={() => setClaimMethod("merch_table")}
                className="flex w-full items-center gap-3 border border-black/10 bg-gray-50 p-3 text-left transition-colors hover:border-purple-500/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <div>
                  <p className="r">Pick up at Merch Table</p>
                  <p className="mt-0.5 text-black/30">
                    Show PIN or open claim page
                  </p>
                </div>
              </button>
            </div>
          </>
        ) : claimMethod === "shipping" ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3 className="mb-2">Shipping Claim</h3>
            <p className="mb-6 px-4 text-black/50">
              Your 100% off voucher is being generated. You'll be transferred to
              Shopify to enter your shipping details.
            </p>
            <button
              aria-label="Close"
              onClick={() => {
                alert(
                  "In production, this opens a Shopify Cart with discount applied!",
                );
                handleClose();
              }}
              className="w-full bg-blue-500 py-3 transition-colors hover:bg-blue-400"
            >
              Open Secure Checkout
            </button>
            <button
              onClick={() => setClaimMethod(null)}
              className="mt-2 w-full py-2 text-black/30 transition-colors hover:text-black/60"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="py-4 text-center">
            <h3 className="mb-1">Merch Table Pickup</h3>
            <p className="mb-5 text-black/40">
              Show this PIN or page to the crew
            </p>
            {pin && (
              <div className="mb-6 border border-purple-500/30 bg-purple-500/5 p-4">
                <div className="mb-2 flex items-center justify-center gap-2">
                  {pin.split("").map((digit: string, i: number) => (
                    <div
                      key={`raffle-pin-confirm-${i}-${digit}`}
                      className="flex h-10 w-8 items-center justify-center rounded border border-purple-500/40 bg-gray-100"
                    >
                      <span className="text-lg text-purple-300 tabular-nums">
                        {digit}
                      </span>
                    </div>
                  ))}
                </div>
                <a
                  href={claimUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-accent)]/60 underline"
                >
                  Open full claim page →
                </a>
              </div>
            )}
            <button
              aria-label="Close"
              onClick={handleClose}
              className="w-full bg-emerald-500 py-3 transition-colors hover:bg-emerald-400"
            >
              Done
            </button>
            <button
              onClick={() => setClaimMethod(null)}
              className="mt-2 w-full py-2 text-black/30 transition-colors hover:text-black/60"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
