/* eslint-disable react-doctor/no-giant-component */
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { SquishyToggle } from "@/components/SquishyToggle";
import { GlowInput, GlowSelect } from "@/components/GlowInput";
import { useMember } from "@/context/MemberContext";
import CosmicRadialButton from "@/components/CosmicRadialButton";

interface NearbyShow {
  id: string;
  venue_name: string;
  city: string;
  state: string;
  date: string;
  time: string;
  distanceMiles: number;
  latitude: number;
  longitude: number;
  showPageUrl: string;
}

interface Attendee {
  id: string;
  status: string;
  profiles: {
    id: string;
    full_name: string;
    profile_photo_url: string | null;
    tier: string;
  };
}

const RADIUS_OPTIONS = [10, 25, 50, 100, 200];
const tierColors: Record<string, string> = {
  Bronze: " text-[var(--color-accent)]",
  Silver: "text-slate-300",
  Gold: "text-yellow-400",
  Platinum: " text-[var(--color-accent)]",
};

export default function ProximityPanel() {
  const { member } = useMember();
  const supabase = createClient();

  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState(50);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const [nearbyShows, setNearbyShows] = useState<NearbyShow[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);

  const [selectedShow, setSelectedShow] = useState<NearbyShow | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [myStatus, setMyStatus] = useState<"going" | "there" | null>(null);
  const [attendeeLoading, setAttendeeLoading] = useState(false);

  // Load current profile settings from Supabase
  useEffect(() => {
    if (!member?.id) return;
    supabase
      .from("profiles")
      .select("zip, notification_radius, notifications_enabled")
      .eq("id", member.id)
      .single()
      .then(({ data }: any) => {
        if (data) {
          setZip(data.zip || "");
          setRadius(data.notification_radius || 50);
          setNotificationsEnabled(data.notifications_enabled || false);
        }
      });
  }, [member?.id, supabase]);

  // Fetch nearby shows
  const fetchNearbyShows = useCallback(async () => {
    if (!member?.id || !notificationsEnabled) return;
    setLoadingShows(true);
    try {
      const res = await fetch(`/api/proximity/shows?userId=${member.id}`);
      if (res.ok) {
        const data = await res.json();
        setNearbyShows(data.shows || []);
      }
    } catch { }
    setLoadingShows(false);
  }, [member?.id, notificationsEnabled]);

  useEffect(() => {
    fetchNearbyShows();
  }, [fetchNearbyShows]);

  // Save settings
  const saveSettings = async () => {
    if (!member?.id) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/proximity/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip, notificationRadius: radius, notificationsEnabled }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSaveStatus("saved");
          fetchNearbyShows();
        } else {
          setSaveStatus("error");
        }
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
    setSaving(false);
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  // Load attendees for selected show
  const loadAttendees = async (show: NearbyShow) => {
    setSelectedShow(show);
    setAttendeeLoading(true);
    try {
      const res = await fetch(`/api/proximity/attendees?showId=${show.id}`);
      if (res.ok) {
        const data = await res.json();
        setAttendees(data.attendees || []);
        const mine = (data.attendees || []).find((a: Attendee) => a.profiles?.id === member?.id);
        setMyStatus(mine?.status || null);
      }
    } catch { }
    setAttendeeLoading(false);
  };

  const toggleGoing = async (show: NearbyShow) => {
    if (!member?.id) return;
    if (myStatus) {
      await fetch(`/api/proximity/attendees?showId=${show.id}`, { method: "DELETE" });
      setMyStatus(null);
      setAttendees(prev => prev.filter(a => a.profiles?.id !== member.id));
    } else {
      await fetch("/api/proximity/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showId: show.id, status: "going" }),
      });
      setMyStatus("going");
      loadAttendees(show);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Settings Container — No outer card box/border */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-bold uppercase tracking-[0.2em] text-white bg-[#00000029] border border-white/10 backdrop-blur-[16px] px-3 py-1 rounded-lg border border-[var(--color-accent)]/30">
            Show Proximity Alerts
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Shows Near You</h3>
        <p className="mb-6 max-w-md">
          Get notified when 7th Heaven is performing within your chosen radius. See who else is going!
        </p>

        {/* Notification Toggle */}
        <div className="flex items-center justify-between py-3 border-b border-white/10 mb-4">
          <div>
            <p className="font-bold">Enable Proximity Notifications</p>
            <p className="mt-0.5">SMS & email alerts for nearby shows</p>
          </div>
          <SquishyToggle
            id="proximity-notifications-toggle"
            label="Enable proximity notifications"
            checked={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />
        </div>

        {/* Zip + Radius */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label htmlFor="proximity-zip-input" className="uppercase tracking-widest font-bold text-white mb-2 block">Your Zip Code</label>
            <GlowInput
              id="proximity-zip-input"
              aria-label="Your zip code"
              type="text"
              maxLength={5}
              placeholder="60601"
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/g, ""))}
              className="font-mono"
            />
          </div>
          <div>
            <label htmlFor="proximity-radius-select" className="uppercase tracking-widest font-bold text-white mb-2 block">Radius</label>
            <GlowSelect
              id="proximity-radius-select"
              aria-label="Radius"
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
            >
              {RADIUS_OPTIONS.map(r => (
                <option key={r} value={r} className="bg-[#0f0921] text-white">{r} miles</option>
              ))}
            </GlowSelect>
          </div>
        </div>

        <CosmicRadialButton
          onClick={saveSettings}
          disabled={saving || !zip || zip.length < 5}
          icon={false}
          className="w-full py-3 font-bold uppercase tracking-widest text-white cursor-pointer"
        >
          {saving ? "Saving…" : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Error — Try Again" : "Save Preferences"}
        </CosmicRadialButton>
      </div>

      {/* Nearby Shows */}
      {notificationsEnabled && (
        <div className="pt-2 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Shows Within {radius} Miles
            </span>
            <button aria-label="Action button"
              onClick={fetchNearbyShows}
              className="uppercase tracking-widest text-white/40 hover:text-white font-bold transition-colors"
            >
              Refresh
            </button>
          </div>

          {loadingShows ? (
            <div className="py-8 flex items-center justify-center">
              <span className="text-white/40 animate-pulse">Checking nearby shows…</span>
            </div>
          ) : nearbyShows.length === 0 ? (
            <div className="py-8 flex flex-col items-center rounded-lg border border-white/10 bg-[#00000029] border-dashed">
              <p className="font-bold">No shows in your area yet.</p>
              <p className="mt-1">We&apos;ll alert you the moment one is booked near you!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {nearbyShows.map(show => (
                <div
                  key={show.id}
                  className="p-4 bg-[#00000029] border border-white/10 hover:border-blue-500/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => loadAttendees(show)}
                      className="flex items-center gap-4 text-left cursor-pointer flex-1"
                    >
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg shrink-0">
                        <span className="font-bold text-blue-400 uppercase">
                          {new Date(show.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold text-white leading-none">
                          {new Date(show.date + "T12:00:00").getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold group-hover:text-blue-400 transition-colors">{show.venue_name}</p>
                        <p className="">
                          {show.city ? `${show.city}${show.state ? `, ${show.state}` : ""}` : show.state || ""}
                        </p>
                        <p className="text-blue-400 font-bold mt-0.5">{show.distanceMiles} miles away</p>
                      </div>
                    </button>
                    <button aria-label="Action button"
                      type="button"
                      onClick={e => { e.stopPropagation(); toggleGoing(show); }}
                      className={`px-4 py-2 font-bold uppercase tracking-widest rounded-lg transition-colors border ${myStatus && selectedShow?.id === show.id ?"bg-blue-600 text-white border-blue-600"
                        : "bg-white/10 text-white   border-white/10   hover:bg-blue-500 hover:text-black hover:border-blue-500"
                        }`}
                    >
                      {myStatus && selectedShow?.id === show.id ? "Going" : "I'm Going"}
                    </button>
                  </div>

                  {/* Attendees preview */}
                  {selectedShow?.id === show.id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <p className="uppercase tracking-widest font-bold">
                          {attendees.length} fan{attendees.length !== 1 ? "s" : ""} going
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href={show.showPageUrl || `/shows/${show.id}`}
                            className="uppercase tracking-widest text-blue-400 hover:text-white font-bold transition-colors"
                          >
                            View Show Page →
                          </a>
                          <span className="text-white/20">·</span>
                          <a
                            href={`sms:?body=${encodeURIComponent(`7th Heaven is playing at ${show.venue_name} in ${show.city}! I'm going — check it out: ${show.showPageUrl || `https://7thheavenband.com/shows/${show.id}`}`)}`}
                            className="uppercase tracking-widest text-white/40 hover:text-white font-bold transition-colors"
                          >
                            Share
                          </a>
                        </div>
                      </div>
                      {attendeeLoading ? (
                        <span className="text-black/40 animate-pulse">Loading…</span>
                      ) : attendees.length === 0 ? (
                        <p className="text-black/40">Be the first to say you&apos;re going!</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {attendees.slice(0, 12).map(a => (
                            <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-black/10 rounded-lg">
                              <div className="w-5 h-5 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-[var(--font-size-2xs)] font-bold text-[var(--color-accent)]">
                                {a.profiles?.full_name?.charAt(0) || "?"}
                              </div>
                              <span className="text-black/70 font-medium">{a.profiles?.full_name?.split(" ")[0]}</span>
                              {a.profiles?.tier && a.profiles.tier !== "Bronze" && (
                                <span className={`text-[var(--font-size-2xs)] font-bold uppercase ${tierColors[a.profiles.tier]}`}>
                                  {a.profiles.tier}
                                </span>
                              )}
                            </div>
                          ))}
                          {attendees.length > 12 && (
                            <div className="px-3 py-1.5 bg-white border border-black/10 rounded-lg">
                              <span className="text-black/50">+{attendees.length - 12} more</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
