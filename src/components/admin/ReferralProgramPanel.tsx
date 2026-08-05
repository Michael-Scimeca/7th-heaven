"use client";

import { useState, useEffect } from "react";

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

  // New milestone form
  const [newThreshold, setNewThreshold] = useState<number>(0);
  const [newReward, setNewReward] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Load config + leaderboard
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/referral-config").then((r) => r.json()),
      fetch("/api/admin/referral-leaderboard").then((r) => r.json()),
    ])
      .then(([config, lb]) => {
        if (config) {
          setEnabled(config.enabled ?? false);
          if (config.milestones?.length) setMilestones(config.milestones);
        }
        if (lb) {
          setLeaderboard(lb.leaderboard || []);
          setTotalReferrals(lb.totalReferrals || 0);
          setTotalConverted(lb.totalConverted || 0);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleEnabled = async () => {
    setToggling(true);
    const newVal = !enabled;
    await fetch("/api/admin/referral-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: newVal }),
    });
    setEnabled(newVal);
    setToggling(false);
  };

  const saveMilestones = async () => {
    setSaving(true);
    await fetch("/api/admin/referral-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestones }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
    const lb = await fetch("/api/admin/referral-leaderboard").then((r) => r.json());
    if (lb) {
      setLeaderboard(lb.leaderboard || []);
      setTotalConverted(lb.totalConverted || 0);
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
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30 px-3 py-1 bg-emerald-500/5">
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
          <button
            onClick={toggleEnabled}
            disabled={toggling}
            className={`w-12 h-6 rounded-full relative transition-colors shrink-0 cursor-pointer ${
              enabled ? "bg-purple-600" : "bg-white/10"
            } ${toggling ? "opacity-50" : ""}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                enabled ? "left-6" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/*  Metrics Strip  */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-white/[0.02] border border-white/5 text-center">
            <p className="text-2xl font-black text-purple-300">{totalReferrals}</p>
            <p className="text-2xs uppercase tracking-widest text-white/30 font-bold mt-1">Total Referrals</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 text-center">
            <p className="text-2xl font-black text-emerald-400">{totalConverted}</p>
            <p className="text-2xs uppercase tracking-widest text-white/30 font-bold mt-1">Converted</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 text-center">
            <p className="text-2xl font-black text-white">{leaderboard.length}</p>
            <p className="text-2xs uppercase tracking-widest text-white/30 font-bold mt-1">Active Referrers</p>
          </div>
        </div>

        {/*  Milestone Rewards Editor  */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-bold">
              Milestone Rewards
            </p>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs uppercase tracking-widest font-bold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
            >
              {showAddForm ? "Cancel" : "+ Add Tier"}
            </button>
          </div>

          {/* Existing milestones */}
          <div className="space-y-2 mb-3">
            {milestones.map((m, i) => (
              <div
                key={i}
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
                <button
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
                  <label className="text-2xs uppercase tracking-widest text-white/30 font-bold block mb-1">
                    Referrals Needed
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newThreshold || ""}
                    onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                    className="w-20 bg-white/[0.04] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-2xs uppercase tracking-widest text-white/30 font-bold block mb-1">
                    Reward
                  </label>
                  <input
                    type="text"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    placeholder="e.g. Free Band Tee + Album"
                    className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-purple-500/50 placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="text-2xs uppercase tracking-widest text-white/30 font-bold block mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-14 bg-white/[0.04] border border-white/10 text-white text-center text-lg px-2 py-1 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <button
                  onClick={addMilestone}
                  disabled={!newReward || newThreshold < 1}
                  className="self-end px-4 py-2 bg-purple-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-40 hover:bg-purple-500 transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={saveMilestones}
            disabled={saving}
            className={`w-full mt-3 py-3 text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${
              saved
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
            {milestones.map((m, i) => (
              <div
                key={i}
                className="flex-1 text-center p-2 bg-white/[0.02] border border-white/5 rounded-lg"
              >
                <p className="text-lg font-black text-purple-300">{m.threshold}</p>
                <p className="text-2xs text-white/30 font-bold uppercase tracking-widest mt-0.5">
                  {m.emoji} {m.reward}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/*  Leaderboard  */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-bold">
               Top Referrers
            </p>
            <span className="text-2xs text-white/20 uppercase tracking-widest font-bold">
              {leaderboard.length} referrer{leaderboard.length !== 1 ? "s" : ""}
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-8 flex flex-col items-center border border-dashed border-white/10 bg-white/[0.02]">
              <span className="text-3xl mb-2 opacity-20"></span>
              <p className="text-sm text-white/30 font-bold">No referrals yet</p>
              <p className="text-xs text-white/20 mt-1">
                When fans share their code and friends sign up, they&apos;ll appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
              {leaderboard.map((entry, i) => {
                // Determine which milestones have been hit
                const milestonesHit = milestones.filter(
                  (m) => entry.total >= m.threshold
                );
                const nextMilestone = milestones.find(
                  (m) => entry.total < m.threshold
                );

                return (
                  <div key={entry.referrer_code}>
                    <button
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
                        className={`flex items-center justify-between p-3 border transition-all hover:bg-white/[0.03] ${
                          i === 0
                            ? "border-purple-500/30 bg-purple-600/[0.04]"
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
                            className={`w-8 h-8 flex items-center justify-center font-black text-sm shrink-0 ${
                              i === 0
                                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
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
                            <p className="text-2xs uppercase tracking-widest text-white/20 font-bold">
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
                            <span className="text-2xs uppercase tracking-widest text-white/30 font-bold">
                              Converted
                            </span>
                            <p className="text-sm font-bold text-emerald-400">
                              {entry.signed_up}
                            </p>
                          </div>
                          <div>
                            <span className="text-2xs uppercase tracking-widest text-white/30 font-bold">
                              Rewarded
                            </span>
                            <p className="text-sm font-bold text-yellow-400">
                              {entry.rewarded}
                            </p>
                          </div>
                          <div>
                            <span className="text-2xs uppercase tracking-widest text-white/30 font-bold">
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
                              <span className="text-2xs uppercase tracking-widest text-white/30 font-bold">
                                Next: {nextMilestone.emoji} {nextMilestone.reward}
                              </span>
                              <span className="text-xs text-purple-300 font-bold">
                                {entry.total}/{nextMilestone.threshold}
                              </span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 transition-all"
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
                            <span className="text-2xs uppercase tracking-widest text-white/30 font-bold">
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
                            <button
                              onClick={() => markRewarded(entry.referrer_code)}
                              className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/20 transition-all cursor-pointer"
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
          )}
        </div>
      </div>
    </div>
  );
}
