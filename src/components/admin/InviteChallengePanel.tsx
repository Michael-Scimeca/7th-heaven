/* eslint-disable react-doctor/no-high-complexity-react-function */
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
      const r = await fetch(
        `/api/admin/invite-challenge?showId=${selectedShowId}`,
      );
      if (r.ok) {
        const data = await r.json();
        if (data) {
          setChallenge({
            enabled: data.enabled ?? false,
            threshold: data.threshold ?? 20,
            reward_name: data.reward_name ?? "",
            reward_description:
              data.reward_description ??
              "Claim at the merch table, night of show",
          });
        } else {
          setChallenge({
            enabled: false,
            threshold: 20,
            reward_name: "",
            reward_description: "Claim at the merch table, night of show",
          });
        }
      }
    } catch {
    } finally {
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
    <div className="relative overflow-hidden border border-white/[0.06] bg-[var(--color-bg-surface)]">
      {/* Accent glow */}
      <div className="pointer-events-none absolute top-0 left-0 h-32 w-64 bg-[var(--color-accent)]/10 blur-3xl" />

      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="group relative flex w-full cursor-pointer items-center justify-between border-0 p-6 text-left select-none hover:bg-white/[0.02]"
      >
        <div>
          <p>Show Promotions</p>
          <h3 className="flex items-center gap-2">
            Invite Challenge
            {challenge.enabled && selectedShowId && (
              <span className="rounded border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5">
                Active
              </span>
            )}
          </h3>
          <p className="mt-0.5">
            Fans who invite N friends unlock a free merch item at the door
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-white/40 sm:inline">
            {isCollapsed ? "Expand" : "Collapse"}
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 ${!isCollapsed ? "rotate-180" : ""}`}
          ></div>
        </div>
      </button>

      {!isCollapsed && (
        <div className="relative animate-[fadeIn_0.2s_ease-out] space-y-5 border-t border-white/[0.04] p-6 pt-0">
          {/* Show picker */}
          <div className="mt-4 mb-6">
            <label
              htmlFor="invite-challenge-show-select"
              className="mb-1.5 block text-white/40"
            >
              Select Show
            </label>
            <select
              id="invite-challenge-show-select"
              value={selectedShowId}
              onChange={(e) => setSelectedShowId(e.target.value)}
              className="focus-ring w-full border border-white/10 bg-white/[0.04] px-4 py-3"
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
                <div className="py-4 text-center text-white/30">
                  Loading challenge config…
                </div>
              ) : (
                <>
                  {/* Enable toggle */}
                  <div className="flex items-center justify-between border border-white/[0.05] bg-white/[0.02] p-4">
                    <div>
                      <p>Enable challenge for this show</p>
                      <p className="mt-0.5">
                        Fans will see this on the show page
                      </p>
                    </div>
                    <SquishyToggle
                      id="challenge-enabled"
                      label="Enable challenge for this show"
                      checked={!!challenge.enabled}
                      onChange={(v) =>
                        setChallenge((c) => ({ ...c, enabled: v }))
                      }
                    />
                  </div>

                  {challenge.enabled && (
                    <>
                      {/* Threshold */}
                      <div>
                        <label
                          htmlFor="invite-challenge-threshold"
                          className="mb-1.5 block text-white/40"
                        >
                          Invite Threshold
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            id="invite-challenge-threshold"
                            type="number"
                            min={1}
                            max={500}
                            value={challenge.threshold}
                            onChange={(e) =>
                              setChallenge((c) => ({
                                ...c,
                                threshold: parseInt(e.target.value) || 20,
                              }))
                            }
                            className="focus-ring w-24 border border-white/10 bg-white/[0.04] px-4 py-3"
                          />
                          <span className="text-white/30">
                            fans invited to unlock reward
                          </span>
                        </div>
                      </div>

                      {/* Reward name */}
                      <div>
                        <label
                          htmlFor="invite-challenge-reward-name"
                          className="mb-1.5 block text-white/40"
                        >
                          Reward Name
                        </label>
                        <input
                          id="invite-challenge-reward-name"
                          type="text"
                          value={challenge.reward_name}
                          onChange={(e) =>
                            setChallenge((c) => ({
                              ...c,
                              reward_name: e.target.value,
                            }))
                          }
                          placeholder="e.g. Free Band Tee, Signed Poster, Backstage Pass"
                          className="placeholder: focus-ring w-full border border-white/10 bg-white/[0.04] px-4 py-3 text-white/20"
                        />
                      </div>

                      {/* Reward description */}
                      <div>
                        <label
                          htmlFor="invite-challenge-claim-instructions"
                          className="mb-1.5 block text-white/40"
                        >
                          Claim Instructions
                        </label>
                        <textarea
                          aria-label="Text input"
                          id="invite-challenge-claim-instructions"
                          value={challenge.reward_description}
                          onChange={(e) =>
                            setChallenge((c) => ({
                              ...c,
                              reward_description: e.target.value,
                            }))
                          }
                          rows={2}
                          placeholder="e.g. Claim at the merch table, night of show"
                          className="placeholder: focus-ring w-full resize-none border border-white/10 bg-white/[0.04] px-4 py-3 text-white/20"
                        />
                      </div>

                      {/* Preview */}
                      <div className="border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04] p-4">
                        <p className="mb-2">Fan-facing preview</p>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl"></span>
                          <div>
                            <p>
                              Invite {challenge.threshold} fans → get a free{" "}
                              <span className="text-[var(--color-accent)]">
                                {challenge.reward_name || "merch item"}
                              </span>
                            </p>
                            <p className="mt-0.5">
                              {challenge.reward_description}
                            </p>
                            <div className="mt-2 h-1.5 w-48 bg-white/10">
                              <div className="h-full w-[30%] bg-[var(--color-accent)]" />
                            </div>
                            <p className="mt-0.5">
                              6 / {challenge.threshold} fans invited
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Save */}
                  <button
                    onClick={save}
                    disabled={saving || !challenge.reward_name}
                    className={`w-full py-3.5 ${saved ? "bg-[var(--color-accent)]" : "bg-[var(--color-accent)] hover:brightness-110 disabled:opacity-40"}`}
                  >
                    {saved
                      ? " Challenge Saved"
                      : saving
                        ? "Saving…"
                        : "Save Challenge"}
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
