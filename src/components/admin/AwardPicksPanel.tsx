"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const PICK_TYPES = [
  { id: "purple", name: "Classic Purple", rarity: "Common", color: "#a855f7", chance: "60%" },
  { id: "red", name: "Crimson Fire", rarity: "Uncommon", color: "#ef4444", chance: "25%" },
  { id: "black", name: "Stealth Black", rarity: "Uncommon", color: "#6b7280", chance: "25%" },
  { id: "silver", name: "Chrome Silver", rarity: "Rare", color: "#c0c0c0", chance: "10%" },
  { id: "gold", name: "24K Gold", rarity: "Epic", color: "#c084fc", chance: "4%" },
  { id: "holographic", name: "Holographic", rarity: "Legendary", color: "#ec4899", chance: "1%" },
];

const AWARD_REASONS = [
  { id: "show_attendance", label: " Show Attendance", desc: "Fan attended a live show" },
  { id: "merch_purchase", label: " Merch Purchase", desc: "Bought merch at a show or online" },
  { id: "social_share", label: " Social Share", desc: "Shared on social media" },
  { id: "referral", label: " Referral", desc: "Referred a new fan" },
  { id: "manual", label: " Manual Award", desc: "Custom award by admin" },
];

const rarityColors: Record<string, string> = {
  Common: "text-white/40",
  Uncommon: "text-green-400",
  Rare: "text-blue-400",
  Epic: "text-yellow-400",
  Legendary: "text-pink-400",
};

export default function AwardPicksPanel() {
  const [fans, setFans] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFan, setSelectedFan] = useState<any | null>(null);
  const [selectedPick, setSelectedPick] = useState(PICK_TYPES[0].id);
  const [selectedReason, setSelectedReason] = useState(AWARD_REASONS[0].id);
  const [awarding, setAwarding] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [recentAwards, setRecentAwards] = useState<any[]>([]);

  // Load fans from Supabase
  useEffect(() => {
    const loadFans = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, username")
        .eq("role", "fan")
        .order("full_name");
      setFans(data || []);
    };
    loadFans();
  }, []);

  const filteredFans = fans.filter(
    (f) =>
      !search ||
      f.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.email?.toLowerCase().includes(search.toLowerCase()) ||
      f.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAward = async () => {
    if (!selectedFan) return;
    setAwarding(true);
    setResult(null);
    try {
      const res = await fetch("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedFan.id,
          pickType: selectedPick,
          reason: selectedReason,
          awardedBy: "admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const pickMeta = PICK_TYPES.find((p) => p.id === selectedPick)!;
        setResult({ ok: true, msg: `Awarded ${pickMeta.name} to ${selectedFan.full_name || selectedFan.email}!` });
        setRecentAwards((prev) => [
          { fan: selectedFan.full_name || selectedFan.email, pick: pickMeta.name, rarity: pickMeta.rarity, time: new Date().toLocaleTimeString(), color: pickMeta.color },
          ...prev.slice(0, 9),
        ]);
      } else {
        setResult({ ok: false, msg: data.error || "Failed to award pick" });
      }
    } catch (err: any) {
      setResult({ ok: false, msg: err.message });
    }
    setAwarding(false);
  };

  const handleBulkAward = async () => {
    if (filteredFans.length === 0) return;
    const count = filteredFans.length;
    if (!confirm(`Award ${PICK_TYPES.find(p => p.id === selectedPick)?.name} to ${count} fans?`)) return;
    setAwarding(true);
    setResult(null);
    let success = 0;
    for (const fan of filteredFans) {
      try {
        const res = await fetch("/api/picks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: fan.id,
            pickType: selectedPick,
            reason: selectedReason,
            awardedBy: "admin",
          }),
        });
        const data = await res.json();
        if (data.success) success++;
      } catch { }
    }
    setResult({ ok: true, msg: `Awarded picks to ${success}/${count} fans` });
    setAwarding(false);
  };

  return (
    <div className="space-y-6">
      {/* Pick Type Selection */}
      <div>
        <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-2 block">Select Pick Type</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {PICK_TYPES.map((pick) => (
            <button
              key={pick.id}
              onClick={() => setSelectedPick(pick.id)}
              className={`p-3 border text-center transition-all cursor-pointer rounded-lg ${selectedPick === pick.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[0_0_15px_rgba(255,10,61,0.2)]"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
            >
              <div
                className="w-10 h-10 mx-auto mb-1.5 rounded-lg flex items-center justify-center text-lg font-black"
                style={{ background: `${pick.color}20`, color: pick.color, border: `1px solid ${pick.color}40` }}
              >
                7H
              </div>
              <p className="text-xs font-bold text-white/70 truncate">{pick.name}</p>
              <p className={`text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.1em] ${rarityColors[pick.rarity]}`}>
                {pick.rarity}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Award Reason */}
      <div>
        <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-2 block">Reason</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {AWARD_REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReason(r.id)}
              className={`px-3 py-2 text-left border transition-all cursor-pointer rounded-lg ${selectedReason === r.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
            >
              <span className="text-sm">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fan Search + Selection */}
      <div>
        <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-2 block">
          Select Fan {selectedFan && <span className=" text-[var(--color-accent)]">→ {selectedFan.full_name || selectedFan.email}</span>}
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or username..."
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors rounded-lg mb-3"
        />

        <div className="max-h-48 overflow-y-auto border border-white/5 rounded-lg">
          {filteredFans.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">No fans found</p>
          ) : (
            filteredFans.slice(0, 20).map((fan) => (
              <button
                key={fan.id}
                onClick={() => setSelectedFan(fan)}
                className={`w-full text-left px-4 py-2.5 border-b border-white/5 last:border-0 transition-all cursor-pointer ${selectedFan?.id === fan.id
                  ? "bg-[var(--color-accent)]/10 text-white"
                  : "hover:bg-white/[0.03] text-white/60"
                  }`}
              >
                <span className="text-sm font-bold">{fan.full_name || "Unnamed"}</span>
                <span className="text-xs text-white/30 ml-2">{fan.email}</span>
                {fan.username && <span className="text-xs  text-[var(--color-accent)]/50 ml-2">@{fan.username}</span>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAward}
          disabled={!selectedFan || awarding}
          className="flex-1 py-3 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-30 cursor-pointer shadow-[0_0_20px_rgba(255,10,61,0.3)]"
        >
          {awarding ? "Awarding..." : `Award to ${selectedFan?.full_name?.split(" ")[0] || "Fan"}`}
        </button>
        <button
          onClick={handleBulkAward}
          disabled={filteredFans.length === 0 || awarding}
          className="px-6 py-3 border border-[var(--color-border-purple)] text-[var(--color-purple-light)] font-bold text-[var(--font-size-xs)] uppercase tracking-widest hover:bg-[var(--color-purple-glow)] transition-all disabled:opacity-30 cursor-pointer"
        >
          Bulk ({filteredFans.length})
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`p-3 rounded-lg border text-sm font-bold ${result.ok ? "border-emerald-500/30 bg-emerald-500/10 text-[var(--color-accent)]" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
          {result.msg}
        </div>
      )}

      {/* Recent Awards Log */}
      {recentAwards.length > 0 && (
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-2 block">Recent Awards</label>
          <div className="space-y-1.5">
            {recentAwards.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-sm">
                <span className="w-3 h-3 rounded-full" style={{ background: a.color }} />
                <span className="text-white/70 font-bold">{a.fan}</span>
                <span className="text-white/30">→</span>
                <span className={`font-bold ${rarityColors[a.rarity]}`}>{a.pick}</span>
                <span className="text-white/20 ml-auto text-xs">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
