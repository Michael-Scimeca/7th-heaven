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
    } catch {
    } finally {
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
    const updated = [
      ...milestones,
      { threshold: newThreshold, reward: newReward, emoji: newEmoji },
    ].sort((a, b) => a.threshold - b.threshold);
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
      <div className="animate-pulse border border-white/[0.06] bg-[var(--color-bg-surface)] p-6">
        <div className="mb-3 h-6 w-48 rounded bg-[#00000029]" />
        <div className="h-4 w-72 rounded bg-[#00000029]" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-white/[0.06] bg-[var(--color-bg-surface)]">
      {/* Accent glow */}
      <div className="pointer-events-none absolute top-0 right-0 h-32 w-64 bg-purple-600/10 blur-[60px]" />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-purple-300">Fan Engagement</p>
            <h3> Referral Program</h3>
            <p className="mt-0.5">
              Toggle visibility, configure milestone rewards, and track top
              referrers
            </p>
          </div>
          <div className="flex items-center gap-3">
            {enabled && (
              <span className="border border-emerald-500/30 bg-emerald-500/5 px-3 py-1">
                Live
              </span>
            )}
          </div>
        </div>

        {/*  Program Toggle  */}
        <div className="mb-6 flex items-center justify-between border border-white/[0.05] bg-white/[0.02] p-4">
          <div>
            <p>Show referral program to fans</p>
            <p className="mt-0.5">
              When disabled, the referral section is hidden from the Fan
              Dashboard
            </p>
          </div>
          <SquishyToggle
            id="referral-enabled"
            label="Enable referral program"
            checked={enabled}
            onChange={(v) => {
              if (!toggling) {
                toggleEnabled();
                void v;
              }
            }}
            disabled={toggling}
          />
        </div>

        {/*  Metrics Strip  */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="border border-white/10 bg-white/[0.02] p-4 text-center">
            <p className="text-purple-300">{totalReferrals}</p>
            <p>Total Referrals</p>
          </div>
          <div className="border border-white/10 bg-white/[0.02] p-4 text-center">
            <p>{totalConverted}</p>
            <p>Converted</p>
          </div>
          <div className="border border-white/10 bg-white/[0.02] p-4 text-center">
            <p>{leaderboard.length}</p>
            <p>Active Referrers</p>
          </div>
        </div>

        {/*  Milestone Rewards Editor  */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <p>Milestone Rewards</p>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="cursor-pointer text-purple-300 transition-colors hover:text-purple-200"
            >
              {showAddForm ? "Cancel" : "+ Add Tier"}
            </button>
          </div>

          {/* Existing milestones */}
          <div className="mb-3 space-y-2">
            {Array.from(milestones, (m, i) => ({ m, i })).map(({ m, i }) => (
              <div
                key={m.threshold}
                className="group flex items-center justify-between border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{m.emoji}</span>
                  <div>
                    <p>
                      <span className="text-purple-300">{m.threshold}</span>{" "}
                      referrals → {m.reward}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeMilestone(i)}
                  className="cursor-pointer text-white/20 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-400"
                  title="Remove"
                ></button>
              </div>
            ))}
          </div>

          {/* Add new milestone form */}
          {showAddForm && (
            <div className="space-y-3 border border-white/10 bg-purple-600/[0.04] p-4">
              <p className="text-purple-300">New Milestone</p>
              <div className="flex items-center gap-3">
                <div>
                  <label
                    htmlFor="referral-new-threshold"
                    className="mb-1 block text-[var(--font-size-2xs)] text-white/30"
                  >
                    Referrals Needed
                  </label>
                  <input
                    id="referral-new-threshold"
                    type="number"
                    min={1}
                    value={newThreshold || ""}
                    onChange={(e) =>
                      setNewThreshold(parseInt(e.target.value) || 0)
                    }
                    className="w-20 border border-white/10 bg-white/[0.04] px-3 py-2 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="referral-new-reward"
                    className="mb-1 block text-[var(--font-size-2xs)] text-white/30"
                  >
                    Reward
                  </label>
                  <input
                    id="referral-new-reward"
                    type="text"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    placeholder="e.g. Free Band Tee + Album"
                    className="placeholder: w-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/20 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="referral-new-emoji"
                    className="mb-1 block text-[var(--font-size-2xs)] text-white/30"
                  >
                    Emoji
                  </label>
                  <input
                    id="referral-new-emoji"
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-14 border border-white/10 bg-white/[0.04] px-2 py-1 text-center text-lg focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={addMilestone}
                  disabled={!newReward || newThreshold < 1}
                  className="cursor-pointer self-end bg-purple-600 px-4 py-2 transition-colors hover:bg-purple-500 disabled:opacity-40"
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
            className={`mt-3 w-full cursor-pointer py-3 transition-colors ${saved ? "bg-[var(--color-accent)]" : "bg-purple-600 hover:bg-purple-500 disabled:opacity-40"}`}
          >
            {saved
              ? " Milestones Saved"
              : saving
                ? "Saving…"
                : "Save Milestones"}
          </button>
        </div>

        {/*  Fan-Facing Preview  */}
        <div className="mb-6 border border-white/10 bg-purple-600/[0.04] p-4">
          <p className="mb-3 text-purple-300">Fan-facing preview</p>
          <div className="flex items-center gap-2">
            {milestones.map((m) => (
              <div
                key={m.threshold}
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.02] p-2 text-center"
              >
                <p className="text-purple-300">{m.threshold}</p>
                <p className="mt-0.5">
                  {m.emoji} {m.reward}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/*  Leaderboard  */}
        <div>
          {(() => {
            const displayLeaderboard =
              leaderboard.length > 0
                ? leaderboard
                : [
                    {
                      referrer_id: "1",
                      referrer_code: "MIKE2026",
                      name: "Michael Scimeca",
                      total: 12,
                      signed_up: 10,
                      rewarded: 2,
                      pending: 0,
                      recent: ["alex@example.com", "sarah@example.com"],
                    },
                    {
                      referrer_id: "2",
                      referrer_code: "NICK7H",
                      name: "Nick Cox",
                      total: 8,
                      signed_up: 7,
                      rewarded: 1,
                      pending: 0,
                      recent: ["charlie@example.com"],
                    },
                    {
                      referrer_id: "3",
                      referrer_code: "RICHARD7H",
                      name: "Richard Hofherr",
                      total: 5,
                      signed_up: 4,
                      rewarded: 1,
                      pending: 0,
                      recent: ["dave@example.com"],
                    },
                  ];

            const filteredLeaderboard = displayLeaderboard.filter(
              (e) =>
                selectedReferrer === "all" ||
                e.referrer_code === selectedReferrer ||
                e.name === selectedReferrer,
            );

            return (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p>Top Referrers</p>
                  <div className="flex items-center gap-3">
                    <Dropdown
                      id="referral-referrer-select"
                      selected={selectedReferrer}
                      onSelect={(val: any) =>
                        setSelectedReferrer(
                          typeof val === "string"
                            ? val
                            : (val as { value?: string })?.value || "all",
                        )
                      }
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
                    <span className="whitespace-nowrap text-[var(--font-size-2xs)] text-white/20">
                      {filteredLeaderboard.length} referrer
                      {filteredLeaderboard.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {filteredLeaderboard.length === 0 ? (
                  <div className="flex flex-col items-center border border-dashed border-white/10 bg-white/[0.02] py-8">
                    <span className="mb-2 text-3xl opacity-20"></span>
                    <p>No referrals found</p>
                    <p>Try selecting a different referrer from the dropdown.</p>
                  </div>
                ) : (
                  <div className="scrollbar-hide max-h-[400px] space-y-2 overflow-y-auto pr-1">
                    {filteredLeaderboard.map((entry, i) => {
                      // Determine which milestones have been hit
                      const milestonesHit = milestones.filter(
                        (m) => entry.total >= m.threshold,
                      );
                      const nextMilestone = milestones.find(
                        (m) => entry.total < m.threshold,
                      );

                      return (
                        <div key={entry.referrer_code}>
                          <button
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === entry.referrer_code
                                  ? null
                                  : entry.referrer_code,
                              )
                            }
                            className="w-full cursor-pointer text-left"
                          >
                            <div
                              className={`flex items-center justify-between border p-3 ${i === 0 ? "border-[var(--color-border-purple)] bg-[var(--color-purple-glow)]" : i === 1 ? "border-white/10 bg-white/[0.02]" : i === 2 ? "border-white/10 bg-white/[0.015]" : "border-white/10 bg-white/[0.01]"}`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Rank badge */}
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center text-[var(--font-size-sm)] ${i === 0 ? "border border-[var(--color-border-purple)] bg-[var(--color-purple-glow)] text-[var(--color-purple-light)]" : i === 1 ? "border border-white/10 bg-white/10" : i === 2 ? "border border-white/5 bg-[#00000029] text-white/40" : "text-white/20"}`}
                                >
                                  {i + 1}
                                </div>

                                <div>
                                  <p>{entry.name}</p>
                                  <p>{entry.referrer_code}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                {/* Milestone badges */}
                                <div className="flex gap-1">
                                  {milestonesHit.map((m, mi) => (
                                    <span
                                      key={mi}

                                      title={`${m.threshold}: ${m.reward}`}
                                    >
                                      {m.emoji}
                                    </span>
                                  ))}
                                </div>

                                {/* Count */}
                                <div className="text-right">
                                  <p className="text-purple-300">
                                    {entry.total}
                                  </p>
                                  <p>referrals</p>
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Expanded details */}
                          {expandedRow === entry.referrer_code && (
                            <div className="space-y-3 border-x border-b border-white/10 bg-white/[0.02] p-4">
                              {/* Stats */}
                              <div className="flex gap-4">
                                <div>
                                  <span className="text-[var(--font-size-2xs)] text-white/30">
                                    Converted
                                  </span>
                                  <p>{entry.signed_up}</p>
                                </div>
                                <div>
                                  <span className="text-[var(--font-size-2xs)] text-white/30">
                                    Rewarded
                                  </span>
                                  <p className="text-yellow-400">
                                    {entry.rewarded}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[var(--font-size-2xs)] text-white/30">
                                    Pending
                                  </span>
                                  <p>{entry.pending}</p>
                                </div>
                              </div>

                              {/* Progress to next milestone */}
                              {nextMilestone && (
                                <div>
                                  <div className="mb-1 flex items-center justify-between">
                                    <span className="text-[var(--font-size-2xs)] text-white/30">
                                      Next: {nextMilestone.emoji}{" "}
                                      {nextMilestone.reward}
                                    </span>
                                    <span className="text-purple-300">
                                      {entry.total}/{nextMilestone.threshold}
                                    </span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-lg bg-[#00000029]">
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
                                  <span className="text-[var(--font-size-2xs)] text-white/30">
                                    Recent Invites
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {entry.recent.map((email, ei) => (
                                      <span
                                        key={ei}
                                        className="border border-white/10 bg-[#00000029] px-2 py-0.5 text-white/40"
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
                                    onClick={() =>
                                      markRewarded(entry.referrer_code)
                                    }
                                    className="cursor-pointer border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-yellow-400 transition-colors hover:bg-yellow-500/20"
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
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
