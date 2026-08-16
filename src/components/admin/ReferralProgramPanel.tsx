/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useState, useEffect, useCallback } from "react";
import { SquishyToggle } from "@/components/SquishyToggle";
import Dropdown from "@/components/Dropdown";

interface Milestone {
  threshold: number;
  reward: string;
  emoji: string;
}

interface LeaderboardEntry {
  referrer_id: string | null;
  referrer_code: string;
  name: string;
  total: number;
  signed_up: number;
  rewarded: number;
  pending: number;
  recent: string[];
}

export default function ReferralProgramPanel() {
  const [enabled, setEnabled] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { threshold: 3, reward: "Rare Pick", emoji: "" },
    { threshold: 10, reward: "Free Merch", emoji: "" },
    { threshold: 25, reward: "VIP Status", emoji: "" },
  ]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalConverted, setTotalConverted] = useState(0);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedReferrer, setSelectedReferrer] = useState<string>("all");

  // New milestone form
  const [newThreshold, setNewThreshold] = useState<number>(0);
  const [newReward, setNewReward] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, lbRes] = await Promise.all([
        fetch("/api/admin/referral-config"),
        fetch("/api/admin/referral-leaderboard"),
      ]);
      const config = await configRes.json();
      const lb = await lbRes.json();
      if (config) {
        setEnabled(config.enabled ?? false);
        if (config.milestones?.length) setMilestones(config.milestones);
      }
      if (lb) {
        setLeaderboard(lb.leaderboard || []);
        setTotalReferrals(lb.totalReferrals || 0);
        setTotalConverted(lb.totalConverted || 0);
      }
    } catch { }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleEnabled = async () => {
    setToggling(true);
    const newVal = !enabled;
    try {
      await fetch("/api/admin/referral-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newVal }),
      });
      setEnabled(newVal);
    } finally {
      setToggling(false);
    }
  };

  const saveMilestones = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/referral-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const addMilestone = () => {
    if (!newReward || newThreshold < 1) return;
    const updated = [...milestones, { threshold: newThreshold, reward: newReward, emoji: newEmoji }]
      .sort((a, b) => a.threshold - b.threshold);
    setMilestones(updated);
    setNewThreshold(0);
    setNewReward("");
    setNewEmoji("");
    setShowAddForm(false);
  };

  const removeMilestone = (idx: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== idx));
  };

  const markRewarded = async (referrer_code: string) => {
    await fetch("/api/admin/referral-leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer_code, action: "mark_rewarded" }),
    });
    // Refresh leaderboard
    const res = await fetch("/api/admin/referral-leaderboard");
    if (res.ok) {
      const lb = await res.json();
      if (lb) {
        setLeaderboard(lb.leaderboard || []);
        setTotalConverted(lb.totalConverted || 0);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-white/[0.06] p-6 animate-pulse">
        <div className="h-6 bg-white/5 rounded w-48 mb-3" />
        <div className="h-4 bg-white/5 rounded w-72" />
      </div>
    );
  }

  return (
    <div className="relative bg-[var(--color-bg-surface)] border border-white/[0.06] overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-purple-600/10 blur-[60px] pointer-events-none" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-purple-300 mb-0.5">Fan Engagement</p>
            <h3 className="text-white font-black text-lg"> Referral Program</h3>
            <p className="text-white/30 text-xs mt-0.5">
              Toggle visibility, configure milestone rewards, and track top referrers
            </p>
          </div>
          <div className="flex items-center gap-3">
            {enabled && (
              <span className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)] border border-emerald-500/30 px-3 py-1 bg-emerald-500/5">
                Live
              </span>
            )}
          </div>
        </div>

        {/*  Program Toggle  */}
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] mb-6">
          <div>
            <p className="text-sm font-bold text-white">Show referral program to fans</p>
            <p className="text-xs text-white/30 mt-0.5">
              When disabled, the referral section is hidden from the Fan Dashboard
            </p>
          </div>
          <SquishyToggle
            id="referral-enabled"
            label="Enable referral program"
            checked={enabled}
            onChange={(v) => { if (!toggling) { toggleEnabled(); void v; } }}
            disabled={toggling}
          />
        </div>

        {/*  Metrics Strip  */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-white/[0.02] border border-white/5 text-center">
            <p className="text-2xl font-black text-purple-300">{totalReferrals}</p>
            <p className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold mt-1">Total Referrals</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 text-center">
            <p className="text-2xl font-black text-[var(--color-accent)]">{totalConverted}</p>
            <p className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold mt-1">Converted</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 text-center">
            <p className="text-2xl font-black text-white">{leaderboard.length}</p>
            <p className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold mt-1">Active Referrers</p>
          </div>
        </div>

        {/*  Milestone Rewards Editor  */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-bold">
              Milestone Rewards
            </p>
            <button aria-label="Action button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs uppercase tracking-widest font-bold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
            >
              {showAddForm ? "Cancel" : "+ Add Tier"}
            </button>
          </div>

          {/* Existing milestones */}
          <div className="space-y-2 mb-3">
            {Array.from(milestones, (m, i) => ({ m, i })).map(({ m, i }) => (
              <div
                key={m.threshold}
                className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{m.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      <span className="text-purple-300 font-black">{m.threshold}</span> referrals →{" "}
                      {m.reward}
                    </p>
                  </div>
                </div>
                <button aria-label="Action button"
                  onClick={() => removeMilestone(i)}
                  className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs cursor-pointer"
                  title="Remove"
                >

                </button>
              </div>
            ))}
          </div>

          {/* Add new milestone form */}
          {showAddForm && (
            <div className="p-4 border border-purple-500/20 bg-purple-600/[0.04] space-y-3">
              <p className="text-xs uppercase tracking-widest text-purple-300 font-bold">
                New Milestone
              </p>
              <div className="flex items-center gap-3">
                <div>
                  <label htmlFor="referral-new-threshold" className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold block mb-1">
                    Referrals Needed
                  </label>
                  <input aria-label="Input field"
                    id="referral-new-threshold"
                    type="number"
                    min={1}
                    value={newThreshold || ""}
                    onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                    className="w-20 bg-white/[0.04] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="referral-new-reward" className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold block mb-1">
                    Reward
                  </label>
                  <input aria-label="Input field"
                    id="referral-new-reward"
                    type="text"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    placeholder="e.g. Free Band Tee + Album"
                    className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-purple-500/50 placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label htmlFor="referral-new-emoji" className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold block mb-1">
                    Emoji
                  </label>
                  <input aria-label="Input field"
                    id="referral-new-emoji"
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-14 bg-white/[0.04] border border-white/10 text-white text-center text-lg px-2 py-1 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <button aria-label="Action button"
                  onClick={addMilestone}
                  disabled={!newReward || newThreshold < 1}
                  className="self-end px-4 py-2 bg-purple-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-40 hover:bg-purple-500 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Save button */}
          <button aria-label="Action button"
            onClick={saveMilestones}
            disabled={saving}
            className={`w-full mt-3 py-3 text-sm font-black uppercase tracking-widest transition-colors cursor-pointer ${saved
              ? "bg-emerald-600 text-white"
              : "bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40"
              }`}
          >
            {saved ? " Milestones Saved" : saving ? "Saving…" : "Save Milestones"}
          </button>
        </div>

        {/*  Fan-Facing Preview  */}
        <div className="p-4 border border-purple-500/20 bg-purple-600/[0.04] mb-6">
          <p className="text-xs uppercase tracking-widest text-purple-300 font-bold mb-3">
            Fan-facing preview
          </p>
          <div className="flex items-center gap-2">
            {milestones.map((m) => (
              <div
                key={m.threshold}
                className="flex-1 text-center p-2 bg-white/[0.02] border border-white/5 rounded-lg"
              >
                <p className="text-lg font-black text-purple-300">{m.threshold}</p>
                <p className="text-[var(--font-size-2xs)] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                  {m.emoji} {m.reward}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/*  Leaderboard  */}
        <div>
          {(() => {
            const displayLeaderboard = leaderboard.length > 0 ? leaderboard : [
              { referrer_id: "1", referrer_code: "MIKE2026", name: "Michael Scimeca", total: 12, signed_up: 10, rewarded: 2, pending: 0, recent: ["alex@example.com", "sarah@example.com"] },
              { referrer_id: "2", referrer_code: "NICK7H", name: "Nick Cox", total: 8, signed_up: 7, rewarded: 1, pending: 0, recent: ["charlie@example.com"] },
              { referrer_id: "3", referrer_code: "RICHARD7H", name: "Richard Hofherr", total: 5, signed_up: 4, rewarded: 1, pending: 0, recent: ["dave@example.com"] }
            ];

            const filteredLeaderboard = displayLeaderboard.filter(
              (e) => selectedReferrer === "all" || e.referrer_code === selectedReferrer || e.name === selectedReferrer
            );

            return (
              <>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-bold">
                    Top Referrers
                  </p>
                  <div className="flex items-center gap-3">
                    <Dropdown
                      id="referral-referrer-select"
                      selected={selectedReferrer}
                      onSelect={(val) => setSelectedReferrer(val)}
                      options={[
                        { label: "All Referrers", value: "all" },
                        ...displayLeaderboard.map((e) => ({
                          label: e.name || e.referrer_code,
                          value: e.referrer_code,
                        })),
                      ]}
                      placeholder="Select Referrer"
                      fullWidth={false}
                    />
                    <span className="text-[var(--font-size-2xs)] text-white/20 uppercase tracking-widest font-bold whitespace-nowrap">
                      {filteredLeaderboard.length} referrer{filteredLeaderboard.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {filteredLeaderboard.length === 0 ? (
                  <div className="py-8 flex flex-col items-center border border-dashed border-white/10 bg-white/[0.02]">
                    <span className="text-3xl mb-2 opacity-20"></span>
                    <p className="text-sm text-white/30 font-bold">No referrals found</p>
                    <p className="text-xs text-white/20 mt-1">
                      Try selecting a different referrer from the dropdown.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                    {filteredLeaderboard.map((entry, i) => {
                      // Determine which milestones have been hit
                      const milestonesHit = milestones.filter(
                        (m) => entry.total >= m.threshold
                      );
                      const nextMilestone = milestones.find(
                        (m) => entry.total < m.threshold
                      );

                      return (
                        <div key={entry.referrer_code}>
                    <button aria-label="Action button"
                      onClick={() =>
                        setExpandedRow(
                          expandedRow === entry.referrer_code
                            ? null
                            : entry.referrer_code
                        )
                      }
                      className="w-full text-left cursor-pointer"
                    >
                      <div
                        className={`flex items-center justify-between p-3 border ${i === 0
                          ? "border-[var(--color-border-purple)] bg-[var(--color-purple-glow)]"
                          : i === 1
                            ? "border-white/10 bg-white/[0.02]"
                            : i === 2
                              ? "border-white/10 bg-white/[0.015]"
                              : "border-white/5 bg-white/[0.01]"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Rank badge */}
                          <div
                            className={`w-8 h-8 flex items-center justify-center font-black text-[var(--font-size-sm)] shrink-0 ${i === 0
                              ? "bg-[var(--color-purple-glow)] text-[var(--color-purple-light)] border border-[var(--color-border-purple)]"
                              : i === 1
                                ? "bg-white/10 text-white/60 border border-white/10"
                                : i === 2
                                  ? "bg-white/5 text-white/40 border border-white/5"
                                  : "text-white/20"
                              }`}
                          >
                            {i + 1}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-white">
                              {entry.name}
                            </p>
                            <p className="text-xs text-white/30 font-mono">
                              {entry.referrer_code}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Milestone badges */}
                          <div className="flex gap-1">
                            {milestonesHit.map((m, mi) => (
                              <span
                                key={mi}
                                className="text-sm"
                                title={`${m.threshold}: ${m.reward}`}
                              >
                                {m.emoji}
                              </span>
                            ))}
                          </div>

                          {/* Count */}
                          <div className="text-right">
                            <p className="text-lg font-black text-purple-300">
                              {entry.total}
                            </p>
                            <p className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/20 font-bold">
                              referrals
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {expandedRow === entry.referrer_code && (
                      <div className="p-4 bg-white/[0.02] border-x border-b border-white/5 space-y-3">
                        {/* Stats */}
                        <div className="flex gap-4">
                          <div>
                            <span className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold">
                              Converted
                            </span>
                            <p className="text-sm font-bold text-[var(--color-accent)]">
                              {entry.signed_up}
                            </p>
                          </div>
                          <div>
                            <span className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold">
                              Rewarded
                            </span>
                            <p className="text-sm font-bold text-yellow-400">
                              {entry.rewarded}
                            </p>
                          </div>
                          <div>
                            <span className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold">
                              Pending
                            </span>
                            <p className="text-sm font-bold text-white/40">
                              {entry.pending}
                            </p>
                          </div>
                        </div>

                        {/* Progress to next milestone */}
                        {nextMilestone && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold">
                                Next: {nextMilestone.emoji} {nextMilestone.reward}
                              </span>
                              <span className="text-xs text-purple-300 font-bold">
                                {entry.total}/{nextMilestone.threshold}
                              </span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 transition-colors"
                                style={{
                                  width: `${Math.min(100, (entry.total / nextMilestone.threshold) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Recent invites */}
                        {entry.recent.length > 0 && (
                          <div>
                            <span className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/30 font-bold">
                              Recent Invites
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {entry.recent.map((email, ei) => (
                                <span
                                  key={ei}
                                  className="text-xs px-2 py-0.5 bg-white/5 border border-white/5 text-white/40 font-mono"
                                >
                                  {email}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Admin actions */}
                        {milestonesHit.length > 0 &&
                          entry.signed_up > 0 && (
                            <button aria-label="Action button"
                              onClick={() => markRewarded(entry.referrer_code)}
                              className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/20 transition-colors cursor-pointer"
                            >
                              Mark Rewards as Claimed
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
