"use client";
/* oxlint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/click-events-have-key-events */
import Image from 'next/image';

import { useState, useEffect, useCallback } from "react";

const PICK_META: Record<string, { name: string; rarity: string; color: string; img: string }> = {
  purple: { name: "Classic Purple", rarity: "Common", color: "#a855f7", img: "/images/picks/purple.png" },
  red: { name: "Crimson Fire", rarity: "Uncommon", color: "#ef4444", img: "/images/picks/red.png" },
  black: { name: "Stealth Black", rarity: "Uncommon", color: "#6b7280", img: "/images/picks/black.png" },
  silver: { name: "Chrome Silver", rarity: "Rare", color: "#c0c0c0", img: "/images/picks/silver.png" },
  gold: { name: "24K Gold", rarity: "Epic", color: "#c084fc", img: "/images/picks/gold.png" },
  holographic: { name: "Holographic", rarity: "Legendary", color: "#ec4899", img: "/images/picks/holographic.png" },
};

const RARITY_COLORS: Record<string, string> = {
  Common: "text-white/40",
  Uncommon: "text-green-400",
  Rare: "text-blue-400",
  Epic: "text-purple-300",
  Legendary: "text-pink-400",
};

import { Guitar, ShoppingBag, Smartphone, Link as LinkIcon, Gift, Dices, Check, X } from "lucide-react";

const REASON_LABELS: Record<string, string> = {
  show_attendance: "Show Attendance",
  merch_purchase: "Merch Purchase",
  social_share: "Social Share",
  referral: "Referral",
  manual: "Gift from Admin",
};

interface PickAwardsSectionProps {
  userId?: string;
}

export default function PickAwardsSection({ userId }: PickAwardsSectionProps) {
  const [grouped, setGrouped] = useState<Record<string, { count: number; picks: any[]; meta: any }>>({});
  const [totalOwned, setTotalOwned] = useState(0);
  const [uniqueTypes, setUniqueTypes] = useState(0);
  const [totalTypes, setTotalTypes] = useState(6);
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPick, setSelectedPick] = useState<string | null>(null);
  const [enteringLottery, setEnteringLottery] = useState<string | null>(null);
  const [lotteryMsg, setLotteryMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  const fetchPicks = useCallback(async () => {
    if (!userId) { console.warn("[PickAwards] No userId provided"); return; }
    try {
      console.log("[PickAwards] Fetching picks for userId:", userId);
      const res = await fetch(`/api/picks?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("[PickAwards] API response:", data);
        if (data.error) {
          console.error("[PickAwards] API error:", data.error);
          return;
        }
        if (data.grouped) {
          setGrouped(data.grouped);
          setTotalOwned(data.totalOwned);
          setUniqueTypes(data.uniqueTypes);
          setTotalTypes(data.totalTypes);
        }
      }
    } catch (err) { console.error("[PickAwards] fetchPicks failed:", err); }
  }, [userId]);

  const fetchLotteries = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/picks/lotteries?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.lotteries) setLotteries(data.lotteries);
      }
    } catch (err) { console.error("[PickAwards] fetchLotteries failed:", err); }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPicks(), fetchLotteries()]);
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [fetchPicks, fetchLotteries]);

  const handleEnterLottery = async (lotteryId: string) => {
    setEnteringLottery(lotteryId);
    setLotteryMsg(null);
    try {
      const res = await fetch("/api/picks/lotteries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotteryId, userId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLotteryMsg({ ok: true, msg: data.message });
          await fetchLotteries(); // refresh entries
        } else {
          setLotteryMsg({ ok: false, msg: data.error || "Failed to enter lottery" });
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setLotteryMsg({ ok: false, msg: data.error || "Failed to enter lottery" });
      }
    } catch (err: any) {
      setLotteryMsg({ ok: false, msg: err.message });
    }
    setEnteringLottery(null);
  };

  // Build pick types array for grid display
  const pickTypes = Object.entries(PICK_META).map(([id, meta]) => ({
    id,
    ...meta,
    owned: grouped[id]?.count || 0,
    picks: grouped[id]?.picks || [],
  }));

  return (
    <div className="mb-6 p-6 bg-white border border-black/10 shadow-md text-black">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-black">
          Pick <span className="gradient-text">Awards</span>
        </h2>
        <span className="uppercase tracking-[0.15em] text-black/40">Collect Picks · Enter Lotteries</span>
      </div>

      {loading ? (
        <div className="py-10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-lg animate-spin" />
          <span className="ml-3 text-black/40">Loading your collection...</span>
        </div>
      ) : (
        <>
          {/* Pick Collection Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {pickTypes.map((pick) => (
              <button aria-label="Action button"
                key={pick.id}
                onClick={() => pick.owned > 0 ? setSelectedPick(selectedPick === pick.id ? null : pick.id) : null}
                className={`relative p-3 border text-center transition-colors ${pick.owned > 0 ? selectedPick === pick.id ?"border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[0_0_15px_rgba(255,10,61,0.2)] scale-105"
                    : "border-black/10 bg-gray-50 hover:border-black/25 hover:scale-[1.02] cursor-pointer"
                  : "border-black/10 bg-gray-100/50 opacity-40 grayscale cursor-default"
                  }`}
              >
                <div className="relative mx-auto w-16 h-16 mb-2">
                  <Image width={200} height={200} unoptimized src={pick.img} alt={pick.name} className="w-full h-full object-contain" />
                  {pick.owned > 1 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center font-bold bg-[var(--color-accent)] text-white rounded">
                      ×{pick.owned}
                    </span>
                  )}
                </div>
                <p className="font-bold text-black/80 truncate">{pick.name}</p>
                <p className={`font-bold uppercase tracking-[0.1em] ${RARITY_COLORS[pick.rarity]}`}>{pick.rarity}</p>
                {pick.owned === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <span className="font-bold text-black/60 uppercase tracking-[0.15em] bg-gray-200/90 px-2 py-1 rounded shadow-xs">Locked</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Pick Detail Panel (when a pick is selected) */}
          {selectedPick && (() => {
            const pick = pickTypes.find((p) => p.id === selectedPick);
            if (!pick || pick.owned === 0) return null;
            return (
              <div className="mb-6 p-4 border border-white/10 bg-[var(--color-accent)]/5 rounded-lg animate-[fadeIn_0.2s_ease]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Image width={200} height={200} unoptimized src={pick.img} alt={pick.name} className="w-10 h-10 object-contain" />
                    <div>
                      <h3 className="font-bold text-black">{pick.name}</h3>
                      <p className={`font-bold uppercase tracking-[0.1em] ${RARITY_COLORS[pick.rarity]}`}>{pick.rarity} · ×{pick.owned}</p>
                    </div>
                  </div>
                  <button aria-label="Action button" onClick={() => setSelectedPick(null)} className="text-black/40 hover:text-black cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-black/50 uppercase tracking-[0.15em] font-bold">History</p>
                  {pick.picks.slice(0, 5).map((p: any) => (
                    <div key={p.id || p.created_at} className="flex items-center gap-2 text-black/70 bg-gray-50 px-3 py-1.5 rounded">
                      <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-purple-600" /> {REASON_LABELS[p.awarded_reason] || "Awarded"}</span>
                      <span className="text-black/40 ml-auto">
                        {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      {p.awarded_by && <span className="text-black/40">by {p.awarded_by}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Collection Stats */}
          <div className="flex items-center gap-6 mb-6 p-3 bg-gray-50 border border-black/10 rounded-lg">
            <div>
              <p className="uppercase tracking-[0.15em] text-black/40 font-bold">Total Picks</p>
              <p className="font-bold">{totalOwned}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.15em] text-black/40 font-bold">Unique Types</p>
              <p className="font-bold text-black">{uniqueTypes}/{totalTypes}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="uppercase tracking-[0.15em] text-black/40 font-bold">How to earn</p>
              <p className="text-black/60">Attend shows · Merch purchases · Social shares · Referrals</p>
            </div>
          </div>

          {/* Visit Merch Table CTA */}
          <div className="mb-6 p-4 border border-black/10 bg-gray-50 rounded-lg flex items-center gap-3 border-dashed">
            <Dices className="w-6 h-6 text-purple-600 shrink-0" />
            <p className="text-black/60 uppercase tracking-[0.15em] font-bold">
              Visit the merch table at any show to enter your picks into the lottery
            </p>
          </div>

          {/* Active Lotteries */}
          {lotteries.length > 0 && (
            <div>
              <h3 className="font-bold text-black/70 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5"><Dices className="w-4 h-4 text-purple-600" /> Active Lotteries</h3>
              <div className="space-y-3">
                {lotteries.map((lottery: any) => (
                  <div
                    key={lottery.id}
                    className={`p-4 border rounded-lg transition-colors ${lottery.isEntered ?"border-emerald-500/30 bg-emerald-500/5"
                      : lottery.isEligible
                        ? "border-purple-500/30 bg-purple-500/5 hover:border-yellow-500/50"
                        : "border-black/10 bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-black">{lottery.name}</h4>
                        <p className="text-black/50">{lottery.prize}</p>
                      </div>
                      <div className="text-right">
                        {lottery.isEntered ? (
                          <span className="font-bold text-emerald-600 uppercase tracking-[0.15em] bg-emerald-500/10 px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1"><Check className="w-3 h-3" /> Entered</span>
                        ) : lottery.isEligible ? (
                          <button aria-label="Action button"
                            onClick={() => handleEnterLottery(lottery.id)}
                            disabled={enteringLottery === lottery.id}
                            className="px-4 py-2 bg-[var(--color-purple-glow)] border border-[var(--color-border-purple)] text-[var(--color-purple-light)] font-bold text-[var(--font-size-xs)] uppercase tracking-[0.15em] rounded-lg hover:bg-[var(--color-purple-glow)] transition-colors cursor-pointer disabled:opacity-50 shadow-[0_0_10px_var(--color-purple-glow)]"
                          >
                            {enteringLottery === lottery.id ? "Entering..." : "Enter Lottery"}
                          </button>
                        ) : (
                          <span className="text-black/40 uppercase tracking-[0.15em]">Not eligible</span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {!lottery.isEntered && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[var(--font-size-2xs)] text-black/50">
                            {lottery.requirement_type === "min_picks"
                              ? `${totalOwned}/${lottery.requirement_value} picks`
                              : `${uniqueTypes}/${lottery.requirement_value} unique types`}
                          </span>
                          <span className="text-[var(--font-size-2xs)] text-black/40">{lottery.endsIn}</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/10 rounded-lg overflow-hidden">
                          <div
                            className={`h-full rounded-lg transition-colors ${lottery.isEligible ?"bg-yellow-500" : "bg-black/20"}`}
                            style={{ width: `${Math.min(100, lottery.progress)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Entry count + deadline */}
                    <div className="flex items-center gap-3 mt-2 text-[var(--font-size-2xs)] text-black/40">
                      <span>{lottery.entryCount} entries</span>
                      <span>·</span>
                      <span>Ends in {lottery.endsIn}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lottery result message */}
              {lotteryMsg && (
                <div className={`mt-3 p-3 rounded-lg border font-bold ${lotteryMsg.ok ?"border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-red-500/30 bg-red-500/10 text-red-600"}`}>
                  {lotteryMsg.msg}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
