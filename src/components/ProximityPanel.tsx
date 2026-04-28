"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";

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
  Bronze: "text-amber-600",
  Silver: "text-slate-300",
  Gold: "text-yellow-400",
  Platinum: "text-purple-400",
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
      .then(({ data }) => {
        if (data) {
          setZip(data.zip || "");
          setRadius(data.notification_radius || 50);
          setNotificationsEnabled(data.notifications_enabled || false);
        }
      });
  }, [member?.id]);

  // Fetch nearby shows
  const fetchNearbyShows = useCallback(async () => {
    if (!member?.id || !notificationsEnabled) return;
    setLoadingShows(true);
    try {
      const res = await fetch(`/api/proximity/shows?userId=${member.id}`);
      const data = await res.json();
      setNearbyShows(data.shows || []);
    } catch {}
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
      const data = await res.json();
      if (data.success) {
        setSaveStatus("saved");
        fetchNearbyShows();
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
      const data = await res.json();
      setAttendees(data.attendees || []);
      const mine = (data.attendees || []).find((a: Attendee) => a.profiles?.id === member?.id);
      setMyStatus(mine?.status || null);
    } catch {}
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
    <div className="space-y-6">
      {/* Settings Card */}
      <div className="p-6 bg-gradient-to-br from-[#0c0c1a] to-[#0a0a14] border border-blue-500/20 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-56 h-56 bg-blue-500/5 blur-[80px] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              📍 Show Proximity Alerts
            </span>
          </div>
          <h3 className="text-xl font-black text-white mb-1">Shows Near You</h3>
          <p className="text-white/40 text-sm mb-6 max-w-md">
            Get notified when 7th Heaven is performing within your chosen radius. See who else is going!
          </p>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl mb-4">
            <div>
              <p className="text-sm font-bold text-white">Enable Proximity Notifications</p>
              <p className="text-xs text-white/35 mt-0.5">SMS & email alerts for nearby shows</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${notificationsEnabled ? "bg-blue-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${notificationsEnabled ? "left-7" : "left-1"}`} />
            </button>
          </div>

          {/* Zip + Radius */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[0.55rem] uppercase tracking-widest font-bold text-white/30 mb-2 block">Your Zip Code</label>
              <input
                type="text"
                maxLength={5}
                placeholder="60601"
                value={zip}
                onChange={e => setZip(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-white/[0.03] border border-white/10 text-white text-sm font-mono px-4 py-3 rounded-xl outline-none focus:border-blue-500/40 transition-colors placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="text-[0.55rem] uppercase tracking-widest font-bold text-white/30 mb-2 block">Radius</label>
              <select
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full bg-white/[0.03] border border-white/10 text-white text-sm px-4 py-3 rounded-xl outline-none focus:border-blue-500/40 transition-colors appearance-none cursor-pointer"
              >
                {RADIUS_OPTIONS.map(r => (
                  <option key={r} value={r} className="bg-[#0a0a14]">{r} miles</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving || !zip || zip.length < 5}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer"
          >
            {saving ? "Saving…" : saveStatus === "saved" ? "✓ Saved!" : saveStatus === "error" ? "Error — Try Again" : "Save Preferences"}
          </button>
        </div>
      </div>

      {/* Nearby Shows */}
      {notificationsEnabled && (
        <div className="p-6 bg-[#0a0a0f]/80 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[0.65rem] font-black uppercase tracking-widest text-blue-400">
              📍 Shows Within {radius} Miles
            </span>
            <button
              onClick={fetchNearbyShows}
              className="text-[0.55rem] uppercase tracking-widest text-white/30 hover:text-blue-400 font-bold transition-colors"
            >
              Refresh
            </button>
          </div>

          {loadingShows ? (
            <div className="py-8 flex items-center justify-center">
              <span className="text-white/30 text-sm animate-pulse">Checking nearby shows…</span>
            </div>
          ) : nearbyShows.length === 0 ? (
            <div className="py-8 flex flex-col items-center border border-white/5 bg-white/[0.02] rounded-xl border-dashed">
              <span className="text-3xl mb-2 opacity-20">📍</span>
              <p className="text-sm text-white/40 font-bold">No shows in your area yet.</p>
              <p className="text-xs text-white/20 mt-1">We&apos;ll alert you the moment one is booked near you!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {nearbyShows.map(show => (
                <div
                  key={show.id}
                  className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-blue-500/30 transition-all cursor-pointer group"
                  onClick={() => loadAttendees(show)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg shrink-0">
                        <span className="text-[0.55rem] font-black text-blue-400 uppercase">
                          {new Date(show.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-black text-white leading-none">
                          {new Date(show.date + "T12:00:00").getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-[0.85rem] font-bold text-white group-hover:text-blue-400 transition-colors">{show.venue_name}</p>
                        <p className="text-[0.65rem] text-white/40">{show.city}, {show.state}</p>
                        <p className="text-[0.55rem] text-blue-400/70 font-bold mt-0.5">📍 {show.distanceMiles} miles away</p>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleGoing(show); }}
                      className={`px-4 py-2 text-[0.55rem] font-black uppercase tracking-widest rounded-lg transition-all border ${
                        myStatus && selectedShow?.id === show.id
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                          : "bg-white/[0.03] text-white/40 border-white/10 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30"
                      }`}
                    >
                      {myStatus && selectedShow?.id === show.id ? "✓ Going" : "I'm Going"}
                    </button>
                  </div>

                  {/* Attendees preview */}
                  {selectedShow?.id === show.id && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <p className="text-[0.55rem] uppercase tracking-widest text-white/30 font-bold mb-3">
                        {attendees.length} fan{attendees.length !== 1 ? "s" : ""} going
                      </p>
                      {attendeeLoading ? (
                        <span className="text-xs text-white/30 animate-pulse">Loading…</span>
                      ) : attendees.length === 0 ? (
                        <p className="text-xs text-white/25">Be the first to say you&apos;re going!</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {attendees.slice(0, 12).map(a => (
                            <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full">
                              <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-[0.45rem] font-black text-purple-300">
                                {a.profiles?.full_name?.charAt(0) || "?"}
                              </div>
                              <span className="text-[0.65rem] text-white/60 font-medium">{a.profiles?.full_name?.split(" ")[0]}</span>
                              {a.profiles?.tier && a.profiles.tier !== "Bronze" && (
                                <span className={`text-[0.45rem] font-black uppercase ${tierColors[a.profiles.tier]}`}>
                                  {a.profiles.tier}
                                </span>
                              )}
                            </div>
                          ))}
                          {attendees.length > 12 && (
                            <div className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full">
                              <span className="text-[0.65rem] text-white/30">+{attendees.length - 12} more</span>
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
