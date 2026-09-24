"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import SearchInput from "@/components/SearchInput";

const PICK_TYPES = [
  {
    id: "purple",
    name: "Classic Purple",
    rarity: "Common",
    color: "#a855f7",
    chance: "60%",
  },
  {
    id: "red",
    name: "Crimson Fire",
    rarity: "Uncommon",
    color: "#ef4444",
    chance: "25%",
  },
  {
    id: "black",
    name: "Stealth Black",
    rarity: "Uncommon",
    color: "#6b7280",
    chance: "25%",
  },
  {
    id: "silver",
    name: "Chrome Silver",
    rarity: "Rare",
    color: "#c0c0c0",
    chance: "10%",
  },
  {
    id: "gold",
    name: "24K Gold",
    rarity: "Epic",
    color: "#c084fc",
    chance: "4%",
  },
  {
    id: "holographic",
    name: "Holographic",
    rarity: "Legendary",
    color: "#ec4899",
    chance: "1%",
  },
];

const AWARD_REASONS = [
  {
    id: "show_attendance",
    label: " Show Attendance",
    desc: "Fan attended a live show",
  },
  {
    id: "merch_purchase",
    label: " Merch Purchase",
    desc: "Bought merch at a show or online",
  },
  {
    id: "social_share",
    label: " Social Share",
    desc: "Shared on social media",
  },
  { id: "referral", label: " Referral", desc: "Referred a new fan" },
  { id: "manual", label: " Manual Award", desc: "Custom award by admin" },
];

const rarityColors: Record<string, string> = {
  Common: " text-white/40",
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
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
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
      f.username?.toLowerCase().includes(search.toLowerCase()),
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
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const pickMeta = PICK_TYPES.find((p) => p.id === selectedPick)!;
          setResult({
            ok: true,
            msg: `Awarded ${pickMeta.name} to ${selectedFan.full_name || selectedFan.email}!`,
          });
          setRecentAwards((prev) => [
            {
              fan: selectedFan.full_name || selectedFan.email,
              pick: pickMeta.name,
              rarity: pickMeta.rarity,
              time: new Date().toLocaleTimeString(),
              color: pickMeta.color,
            },
            ...prev.slice(0, 9),
          ]);
        } else {
          setResult({ ok: false, msg: data.error || "Failed to award pick" });
        }
      } else {
        const data = await res.json().catch(() => ({}));
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
    if (
      !confirm(
        `Award ${PICK_TYPES.find((p) => p.id === selectedPick)?.name} to ${count} fans?`,
      )
    )
      return;
    setAwarding(true);
    setResult(null);
    const results = await Promise.all(
      filteredFans.map(async (fan) => {
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
          if (res.ok) {
            const data = await res.json();
            return data.success ? 1 : 0;
          }
        } catch {}
        return 0;
      }),
    );
    const success = results.reduce<number>((acc, cur) => acc + cur, 0);
    setResult({ ok: true, msg: `Awarded picks to ${success}/${count} fans` });
    setAwarding(false);
  };

  return (
    <div className="space-y-6">
      {/* Pick Type Selection */}
      <div>
        <span className="mb-2 block text-white/40">Select Pick Type</span>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {PICK_TYPES.map((pick) => (
            <button
              key={pick.id}
              onClick={() => setSelectedPick(pick.id)}
              className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${selectedPick === pick.id ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[0_0_15px_rgba(255,10,61,0.2)]" : "border-white/10 bg-white/[0.02]"}`}
            >
              <div
                className="mx-auto mb-1.5 flex h-11 w-11 items-center justify-center rounded-lg text-lg"
                style={{
                  background: `${pick.color}20`,
                  color: pick.color,
                  border: `1px solid ${pick.color}40`,
                }}
              >
                7H
              </div>
              <p className="truncate">{pick.name}</p>
              <p className={` ${rarityColors[pick.rarity]}`}>{pick.rarity}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Award Reason */}
      <div>
        <span className="mb-2 block text-white/40">Reason</span>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {AWARD_REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReason(r.id)}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-left transition-colors ${selectedReason === r.id ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10" : "border-white/10 bg-white/[0.02]"}`}
            >
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fan Search + Selection */}
      <div>
        <label htmlFor="search-fan-input" className="mb-2 block text-white/40">
          Select Fan{" "}
          {selectedFan && (
            <span className="text-[var(--color-accent)]">
              → {selectedFan.full_name || selectedFan.email}
            </span>
          )}
        </label>
        <SearchInput
          id="search-fan-input"
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or username..."
          containerClassName="max-w-[300px] mb-3"
        />

        <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10">
          {filteredFans.length === 0 ? (
            <p className="py-4 text-center">No fans found</p>
          ) : (
            filteredFans.slice(0, 20).map((fan) => (
              <button
                key={fan.id}
                onClick={() => setSelectedFan(fan)}
                className={`w-full cursor-pointer border-b border-white/10 px-4 py-2.5 text-left transition-colors last:border-0 ${selectedFan?.id === fan.id ? "bg-[var(--color-accent)]/10" : "hover:bg-white/[0.03]"}`}
              >
                <span>{fan.full_name || "Unnamed"}</span>
                <span className="ml-2 text-white/30">{fan.email}</span>
                {fan.username && (
                  <span className="ml-2 text-[var(--color-accent)]/50">
                    @{fan.username}
                  </span>
                )}
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
          className="flex-1 cursor-pointer bg-[var(--color-accent)] py-3 shadow-[0_0_20px_rgba(255,10,61,0.3)] transition-colors hover:brightness-110 disabled:opacity-30"
        >
          {awarding
            ? "Awarding..."
            : `Award to ${selectedFan?.full_name?.split(" ")[0] || "Fan"}`}
        </button>
        <button
          onClick={handleBulkAward}
          disabled={filteredFans.length === 0 || awarding}
          className="cursor-pointer border border-[var(--color-border-purple)] px-6 py-3 text-[var(--color-purple-light)] text-[var(--font-size-xs)] transition-colors hover:bg-[var(--color-purple-glow)] disabled:opacity-30"
        >
          Bulk ({filteredFans.length})
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg border p-3 ${result.ok ? "border-emerald-500/30 bg-emerald-500/10 text-[var(--color-accent)]" : "border-red-500/30 bg-red-500/10 text-red-400"}`}
        >
          {result.msg}
        </div>
      )}

      {/* Recent Awards Log */}
      {recentAwards.length > 0 && (
        <div>
          <span className="mb-2 block text-white/40">Recent Awards</span>
          <div className="space-y-1.5">
            {recentAwards.map((a) => (
              <div
                key={a.id || `${a.fan}-${a.time}`}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
              >
                <span
                  className="h-3 w-3 rounded-lg"
                  style={{ background: a.color }}
                />
                <span className="text-white/70">{a.fan}</span>
                <span className="text-white/30">→</span>
                <span className={`${rarityColors[a.rarity]}`}>{a.pick}</span>
                <span className="ml-auto text-white/20">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
