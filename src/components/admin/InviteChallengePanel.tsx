"use client";

import { useState, useEffect, useCallback } from "react";
import { SquishyToggle } from "@/components/SquishyToggle";

interface Show {
  _id: string;
  venue: string;
  city: string;
  state: string;
  date: string;
}

interface Challenge {
  show_id: string;
  enabled: boolean;
  threshold: number;
  reward_name: string;
  reward_description: string;
}

export default function InviteChallengePanel({ shows }: { shows: Show[] }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedShowId, setSelectedShowId] = useState<string>("");
  const [challenge, setChallenge] = useState<Partial<Challenge>>({
    enabled: false,
    threshold: 20,
    reward_name: "",
    reward_description: "Claim at the merch table, night of show",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchChallenge = useCallback(async () => {
    if (!selectedShowId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/invite-challenge?showId=${selectedShowId}`);
      if (r.ok) {
        const data = await r.json();
        if (data) {
          setChallenge({
            enabled: data.enabled ?? false,
            threshold: data.threshold ?? 20,
            reward_name: data.reward_name ?? "",
            reward_description: data.reward_description ?? "Claim at the merch table, night of show",
          });
        } else {
          setChallenge({ enabled: false, threshold: 20, reward_name: "", reward_description: "Claim at the merch table, night of show" });
        }
      }
    } catch { }
    finally {
      setLoading(false);
    }
  }, [selectedShowId]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const save = async () => {
    if (!selectedShowId || !challenge.reward_name) return;
    setSaving(true);
    try {
      await fetch("/api/admin/invite-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show_id: selectedShowId, ...challenge }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const selectedShow = shows.find((s) => s._id === selectedShowId);

  return (
    <div className="relative bg-[var(--color-bg-surface)] border border-white/[0.06] overflow-hidden transition-colors duration-300">
      {/* Accent glow */}
      <div className="absolute top-0 left-0 w-64 h-32 bg-[var(--color-accent)]/10 blur-[60px] pointer-events-none" />

      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full text-left relative p-6 cursor-pointer select-none hover:bg-white/[0.02] transition-colors flex items-center justify-between group border-0 bg-transparent"
      >
        <div>
          <p className="uppercase tracking-[0.2em] font-bold mb-0.5">Show Promotions</p>
          <h3 className="text-white  font-bold  text-lg flex items-center gap-2">
            Invite Challenge
            {challenge.enabled && selectedShowId && (
              <span className="text-[var(--font-size-4xs)]  font-bold  uppercase tracking-widest text-[var(--color-accent)] border border-emerald-500/30 px-2 py-0.5 bg-emerald-500/5 rounded">
                Active
              </span>
            )}
          </h3>
          <p className="mt-0.5">Fans who invite N friends unlock a free merch item at the door</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider hidden sm:inline">
            {isCollapsed ? 'Expand' : 'Collapse'}
          </span>
          <div className={`w-8 h-8  rounded-lg  border border-white/10 flex items-center justify-center  text-white  transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`}>

          </div>
        </div>
      </button>

      {!isCollapsed && (
        <div className="relative p-6 pt-0 border-t border-white/[0.04] mt-1 space-y-5 animate-[fadeIn_0.2s_ease-out]">
          {/* Show picker */}
          <div className="mb-4 mt-4">
            <label htmlFor="invite-challenge-show-select" className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">Select Show</label>
            <select aria-label="Select option"
              id="invite-challenge-show-select"
              value={selectedShowId}
              onChange={(e) => setSelectedShowId(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[var(--color-accent)]/50"
            >
              <option value="">— Pick a show —</option>
              {shows.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.venue} · {s.city}, {s.state} · {s.date}
                </option>
              ))}
            </select>
          </div>

          {selectedShowId && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-white/30 text-xs text-center py-4">Loading challenge config…</div>
              ) : (
                <>
                  {/* Enable toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05]">
                    <div>
                      <p className="font-bold">Enable challenge for this show</p>
                      <p className="mt-0.5">Fans will see this on the show page</p>
                    </div>
                    <SquishyToggle
                      id="challenge-enabled"
                      label="Enable challenge for this show"
                      checked={!!challenge.enabled}
                      onChange={(v) => setChallenge((c) => ({ ...c, enabled: v }))}
                    />
                  </div>

                  {challenge.enabled && (
                    <>
                      {/* Threshold */}
                      <div>
                        <label htmlFor="invite-challenge-threshold" className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">
                          Invite Threshold
                        </label>
                        <div className="flex items-center gap-3">
                          <input aria-label="Input field"
                            id="invite-challenge-threshold"
                            type="number"
                            min={1}
                            max={500}
                            value={challenge.threshold}
                            onChange={(e) => setChallenge((c) => ({ ...c, threshold: parseInt(e.target.value) || 20 }))}
                            className="w-24 bg-white/[0.04] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[var(--color-accent)]/50"
                          />
                          <span className="text-white/30 text-sm">fans invited to unlock reward</span>
                        </div>
                      </div>

                      {/* Reward name */}
                      <div>
                        <label htmlFor="invite-challenge-reward-name" className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">
                          Reward Name
                        </label>
                        <input aria-label="Input field"
                          id="invite-challenge-reward-name"
                          type="text"
                          value={challenge.reward_name}
                          onChange={(e) => setChallenge((c) => ({ ...c, reward_name: e.target.value }))}
                          placeholder="e.g. Free Band Tee, Signed Poster, Backstage Pass"
                          className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[var(--color-accent)]/50 placeholder:text-white/20"
                        />
                      </div>

                      {/* Reward description */}
                      <div>
                        <label htmlFor="invite-challenge-claim-instructions" className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">
                          Claim Instructions
                        </label>
                        <textarea aria-label="Text input"
                          id="invite-challenge-claim-instructions"
                          value={challenge.reward_description}
                          onChange={(e) => setChallenge((c) => ({ ...c, reward_description: e.target.value }))}
                          rows={2}
                          placeholder="e.g. Claim at the merch table, night of show"
                          className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[var(--color-accent)]/50 placeholder:text-white/20 resize-none"
                        />
                      </div>

                      {/* Preview */}
                      <div className="p-4 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04]">
                        <p className="uppercase tracking-widest font-bold mb-2">Fan-facing preview</p>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl"></span>
                          <div>
                            <p className="font-bold">
                              Invite {challenge.threshold} fans → get a free{" "}
                              <span className=" text-[var(--color-accent)]">{challenge.reward_name || "merch item"}</span>
                            </p>
                            <p className="mt-0.5">{challenge.reward_description}</p>
                            <div className="mt-2 h-1.5 bg-white/10 w-48">
                              <div className="h-full bg-[var(--color-accent)] w-[30%]" />
                            </div>
                            <p className="mt-0.5">6 / {challenge.threshold} fans invited</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Save */}
                  <button aria-label="Action button"
                    onClick={save}
                    disabled={saving || !challenge.reward_name}
                    className={`w-full py-3.5 text-sm  font-bold  uppercase tracking-widest transition-colors ${saved
                      ? "bg-[var(--color-accent)]  text-white"
                      : "bg-[var(--color-accent)] text-white hover:brightness-110 disabled:opacity-40"
                      }`}
                  >
                    {saved ? " Challenge Saved" : saving ? "Saving…" : "Save Challenge"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
