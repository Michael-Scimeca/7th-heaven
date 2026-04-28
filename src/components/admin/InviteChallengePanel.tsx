"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (!selectedShowId) return;
    setLoading(true);
    fetch(`/api/admin/invite-challenge?showId=${selectedShowId}`)
      .then((r) => r.json())
      .then((data) => {
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
      })
      .finally(() => setLoading(false));
  }, [selectedShowId]);

  const save = async () => {
    if (!selectedShowId || !challenge.reward_name) return;
    setSaving(true);
    await fetch("/api/admin/invite-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ show_id: selectedShowId, ...challenge }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const selectedShow = shows.find((s) => s._id === selectedShowId);

  return (
    <div className="relative bg-[#0a0a14] border border-white/[0.06] overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-0 left-0 w-64 h-32 bg-purple-600/10 blur-[60px] pointer-events-none" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-purple-400 mb-0.5">Show Promotions</p>
            <h3 className="text-white font-black text-lg">🎁 Invite Challenge</h3>
            <p className="text-white/30 text-xs mt-0.5">Fans who invite N friends unlock a free merch item at the door</p>
          </div>
          {challenge.enabled && selectedShowId && (
            <span className="text-[0.55rem] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30 px-3 py-1 bg-emerald-500/5">
              Active
            </span>
          )}
        </div>

        {/* Show picker */}
        <div className="mb-4">
          <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">Select Show</label>
          <select
            value={selectedShowId}
            onChange={(e) => setSelectedShowId(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-purple-500/50"
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
                    <p className="text-sm font-bold text-white">Enable challenge for this show</p>
                    <p className="text-[0.6rem] text-white/30 mt-0.5">Fans will see this on the show page</p>
                  </div>
                  <button
                    onClick={() => setChallenge((c) => ({ ...c, enabled: !c.enabled }))}
                    className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${challenge.enabled ? "bg-purple-600" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${challenge.enabled ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>

                {challenge.enabled && (
                  <>
                    {/* Threshold */}
                    <div>
                      <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">
                        Invite Threshold
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={challenge.threshold}
                          onChange={(e) => setChallenge((c) => ({ ...c, threshold: parseInt(e.target.value) || 20 }))}
                          className="w-24 bg-white/[0.04] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-purple-500/50"
                        />
                        <span className="text-white/30 text-sm">fans invited to unlock reward</span>
                      </div>
                    </div>

                    {/* Reward name */}
                    <div>
                      <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">
                        Reward Name
                      </label>
                      <input
                        type="text"
                        value={challenge.reward_name}
                        onChange={(e) => setChallenge((c) => ({ ...c, reward_name: e.target.value }))}
                        placeholder="e.g. Free Band Tee, Signed Poster, Backstage Pass"
                        className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-purple-500/50 placeholder:text-white/20"
                      />
                    </div>

                    {/* Reward description */}
                    <div>
                      <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">
                        Claim Instructions
                      </label>
                      <textarea
                        value={challenge.reward_description}
                        onChange={(e) => setChallenge((c) => ({ ...c, reward_description: e.target.value }))}
                        rows={2}
                        placeholder="e.g. Claim at the merch table, night of show"
                        className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-purple-500/50 placeholder:text-white/20 resize-none"
                      />
                    </div>

                    {/* Preview */}
                    <div className="p-4 border border-purple-500/20 bg-purple-500/[0.04]">
                      <p className="text-[0.55rem] uppercase tracking-widest text-purple-400 font-bold mb-2">Fan-facing preview</p>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🎁</span>
                        <div>
                          <p className="text-white text-sm font-bold">
                            Invite {challenge.threshold} fans → get a free{" "}
                            <span className="text-purple-300">{challenge.reward_name || "merch item"}</span>
                          </p>
                          <p className="text-white/40 text-xs mt-0.5">{challenge.reward_description}</p>
                          <div className="mt-2 h-1.5 bg-white/10 w-48">
                            <div className="h-full bg-purple-500 w-[30%]" />
                          </div>
                          <p className="text-[0.5rem] text-white/25 mt-0.5">6 / {challenge.threshold} fans invited</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Save */}
                <button
                  onClick={save}
                  disabled={saving || !challenge.reward_name}
                  className={`w-full py-3.5 text-sm font-black uppercase tracking-widest transition-all ${
                    saved
                      ? "bg-emerald-600 text-white"
                      : "bg-[var(--color-accent)] text-white hover:brightness-110 disabled:opacity-40"
                  }`}
                >
                  {saved ? "✓ Challenge Saved" : saving ? "Saving…" : "Save Challenge"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
