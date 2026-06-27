"use client";

import { useState, useEffect, useCallback } from "react";

const PICK_META: Record<string, { name: string; rarity: string; color: string; img: string }> = {
  purple:      { name: "Classic Purple",  rarity: "Common",    color: "#a855f7", img: "/images/picks/purple.png" },
  red:         { name: "Crimson Fire",    rarity: "Uncommon",  color: "#ef4444", img: "/images/picks/red.png" },
  black:       { name: "Stealth Black",   rarity: "Uncommon",  color: "#6b7280", img: "/images/picks/black.png" },
  silver:      { name: "Chrome Silver",   rarity: "Rare",      color: "#c0c0c0", img: "/images/picks/silver.png" },
  gold:        { name: "24K Gold",        rarity: "Epic",      color: "#fbbf24", img: "/images/picks/gold.png" },
  holographic: { name: "Holographic",     rarity: "Legendary", color: "#ec4899", img: "/images/picks/holographic.png" },
};

const RARITY_COLORS: Record<string, string> = {
  Common:    "text-white/40",
  Uncommon:  "text-green-400",
  Rare:      "text-blue-400",
  Epic:      "text-yellow-400",
  Legendary: "text-pink-400",
};

const REASON_LABELS: Record<string, string> = {
  show_attendance: "🎸 Show Attendance",
  merch_purchase:  "🛍️ Merch Purchase",
  social_share:    "📱 Social Share",
  referral:        "🔗 Referral",
  manual:          "🎁 Gift from Admin",
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
    } catch (err) { console.error("[PickAwards] fetchPicks failed:", err); }
  }, [userId]);

  const fetchLotteries = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/picks/lotteries?userId=${userId}`);
      const data = await res.json();
      if (data.lotteries) setLotteries(data.lotteries);
    } catch (err) { console.error("[PickAwards] fetchLotteries failed:", err); }
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPicks(), fetchLotteries()]);
      setLoading(false);
    };
    load();
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
      const data = await res.json();
      if (data.success) {
        setLotteryMsg({ ok: true, msg: data.message });
        await fetchLotteries(); // refresh entries
      } else {
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
    <div className="mb-6 p-6 bg-white/[0.02] border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold">
          Pick <span className="gradient-text">Awards</span>
        </h2>
        <span className="text-xs uppercase tracking-[0.15em] text-white/25">Collect Picks · Enter Lotteries</span>
      </div>

      {/* How it works */}
      <div className="mb-5 p-3 bg-white/[0.02] border border-yellow-500/20 rounded-lg flex items-start gap-2">
        <span className="text-sm">🎯</span>
        <p className="text-xs text-white/50">
          <strong className="text-white/80">How it works:</strong> Collect picks by attending shows, buying merch, sharing socials, and referring friends. Then <strong className="text-white/80">bring your picks to the merch table</strong> at any show to enter the lottery drawing. Picks alone don&apos;t win — you must enter in person!
        </p>
      </div>

      {loading ? (
        <div className="py-10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-white/30">Loading your collection...</span>
        </div>
      ) : (
        <>
          {/* Pick Collection Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {pickTypes.map((pick) => (
              <button
                key={pick.id}
                onClick={() => pick.owned > 0 ? setSelectedPick(selectedPick === pick.id ? null : pick.id) : null}
                className={`relative p-3 border text-center transition-all ${
                  pick.owned > 0
                    ? selectedPick === pick.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[0_0_15px_rgba(133,29,239,0.2)] scale-105"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:scale-[1.02] cursor-pointer"
                    : "border-white/5 opacity-30 grayscale cursor-default"
                }`}
              >
                <div className="relative mx-auto w-16 h-16 mb-2">
                  <img src={pick.img} alt={pick.name} className="w-full h-full object-contain" />
                  {pick.owned > 1 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-[var(--color-accent)] text-white rounded">
                      ×{pick.owned}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-white/70 truncate">{pick.name}</p>
                <p className={`text-2xs font-bold uppercase tracking-[0.1em] ${RARITY_COLORS[pick.rarity]}`}>{pick.rarity}</p>
                {pick.owned === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-[0.15em] bg-black/60 px-2 py-1">Locked</span>
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
              <div className="mb-6 p-4 border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 rounded-lg animate-[fadeIn_0.2s_ease]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={pick.img} alt={pick.name} className="w-10 h-10 object-contain" />
                    <div>
                      <h3 className="font-bold text-white">{pick.name}</h3>
                      <p className={`text-xs font-bold uppercase tracking-[0.1em] ${RARITY_COLORS[pick.rarity]}`}>{pick.rarity} · ×{pick.owned}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPick(null)} className="text-white/30 hover:text-white text-sm cursor-pointer">✕</button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-white/40 uppercase tracking-[0.15em] font-bold">History</p>
                  {pick.picks.slice(0, 5).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/60 bg-white/[0.02] px-3 py-1.5 rounded">
                      <span>{REASON_LABELS[p.awarded_reason] || "🎁 Awarded"}</span>
                      <span className="text-white/20 ml-auto">
                        {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      {p.awarded_by && <span className="text-white/20">by {p.awarded_by}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Collection Stats */}
          <div className="flex items-center gap-6 mb-6 p-3 bg-white/[0.03] border border-white/5">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/25">Total Picks</p>
              <p className="text-xl font-bold text-[var(--color-accent)]">{totalOwned}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/25">Unique Types</p>
              <p className="text-xl font-bold text-white">{uniqueTypes}/{totalTypes}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs uppercase tracking-[0.15em] text-white/25">How to earn</p>
              <p className="text-xs text-white/40">Attend shows · Merch purchases · Social shares · Referrals</p>
            </div>
          </div>

          {/* Visit Merch Table CTA */}
          <div className="mb-6 p-4 border border-white/5 bg-white/[0.02] rounded-lg flex items-center gap-3 border-dashed">
            <span className="text-2xl">🎰</span>
            <p className="text-xs text-white/40 uppercase tracking-[0.15em] font-bold">
              Visit the merch table at any show to enter your picks into the lottery
            </p>
          </div>

          {/* Active Lotteries */}
          {lotteries.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-[0.15em] mb-3">🎰 Active Lotteries</h3>
              <div className="space-y-3">
                {lotteries.map((lottery: any) => (
                  <div
                    key={lottery.id}
                    className={`p-4 border rounded-lg transition-all ${
                      lottery.isEntered
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : lottery.isEligible
                          ? "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50"
                          : "border-white/5 bg-white/[0.01]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-white">{lottery.name}</h4>
                        <p className="text-xs text-white/40">{lottery.prize}</p>
                      </div>
                      <div className="text-right">
                        {lottery.isEntered ? (
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.15em] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">✓ Entered</span>
                        ) : lottery.isEligible ? (
                          <button
                            onClick={() => handleEnterLottery(lottery.id)}
                            disabled={enteringLottery === lottery.id}
                            className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold text-xs uppercase tracking-[0.15em] rounded-lg hover:bg-yellow-500/30 transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_10px_rgba(250,204,21,0.15)]"
                          >
                            {enteringLottery === lottery.id ? "Entering..." : "Enter Lottery"}
                          </button>
                        ) : (
                          <span className="text-xs text-white/20 uppercase tracking-[0.15em]">Not eligible</span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {!lottery.isEntered && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-2xs text-white/30">
                            {lottery.requirement_type === "min_picks"
                              ? `${totalOwned}/${lottery.requirement_value} picks`
                              : `${uniqueTypes}/${lottery.requirement_value} unique types`}
                          </span>
                          <span className="text-2xs text-white/20">{lottery.endsIn}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${lottery.isEligible ? "bg-yellow-400" : "bg-white/10"}`}
                            style={{ width: `${Math.min(100, lottery.progress)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Entry count + deadline */}
                    <div className="flex items-center gap-3 mt-2 text-2xs text-white/20">
                      <span>{lottery.entryCount} entries</span>
                      <span>·</span>
                      <span>Ends in {lottery.endsIn}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lottery result message */}
              {lotteryMsg && (
                <div className={`mt-3 p-3 rounded-lg border text-sm font-bold ${lotteryMsg.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
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
