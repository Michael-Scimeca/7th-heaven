/* eslint-disable react-doctor/no-giant-component, react-doctor/no-high-complexity-react-function */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
import Image from "next/image";

import { useMember } from "@/context/MemberContext";
import {
  useEffect,
  useState,
  useCallback,
  use,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProximityPanel from "@/components/ProximityPanel";
import DOMPurify from "dompurify";
import { sanitizeHtml } from "@/lib/sanitize-html";
import CruiseChat from "@/components/CruiseChat";
import dynamic from "next/dynamic";

const FanUploadForm = dynamic(() => import("@/components/FanUploadForm"), {
  ssr: false,
  loading: () => (
    <p className="animate-pulse text-black/40">Loading upload form...</p>
  ),
});
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import { GlowInput } from "@/components/GlowInput";
import {
  EmbarkationCountdown,
  ImportantLinksWidget,
  BookingManager,
} from "@/components/CruiseWidgets";
import SeventhButton from "@/components/SeventhButton";
import { SectionBadge } from "@/components/SectionBadge";
import MemberHeaderBadge from "@/components/MemberHeaderBadge";

const PIN_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-2.5 w-2.5 shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export default function FanAccountPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { member, isLoggedIn, openModal } = useMember();
  const supabase = createClient();
  const [myPhotos, setMyPhotos] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [claimedPins, setClaimedPins] = useState<string[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [merch, setMerch] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
    status: "upcoming" as "upcoming" | "live" | "ended",
  });
  const [nextShow, setNextShow] = useState<any>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [liveAlertPhone, setLiveAlertPhone] = useState("");
  const [liveAlertStatus, setLiveAlertStatus] = useState<
    "idle" | "saving" | "subscribed" | "error"
  >("idle");
  const [liveAlertSubscribed, setLiveAlertSubscribed] = useState(false);
  const [liveAlertsEnabled, setLiveAlertsEnabled] = useState(true);
  const [parkingNoteOpenIdx, setParkingNoteOpenIdx] = useState<number | null>(
    null,
  );

  // Cruise Community Toggle State
  const [isCruiser, setIsCruiser] = useState(false);
  const [dashboardView, setDashboardView] = useState<"fan" | "cruise">("fan");
  const CRUISE_END_DATE = "2026-04-19";
  const isCruiseBannerActive = useSyncExternalStore(
    () => () => {},
    () =>
      (new Date().getTime() - new Date(CRUISE_END_DATE).getTime()) /
        (1000 * 60 * 60 * 24) <
      60,
    () => false,
  );

  // Cruise dashboard data
  const [cruiseAnnouncement, setCruiseAnnouncement] = useState<string | null>(
    null,
  );
  type CruiseItineraryEvent = {
    id: string;
    time: string;
    title: string;
    subtitle: string;
  };
  type CruiseItineraryDay = {
    id: string;
    dayLabel: string;
    location: string;
    theme: string;
    events: CruiseItineraryEvent[];
    colorTheme: string;
  };
  const [cruiseItinerary, setCruiseItinerary] = useState<CruiseItineraryDay[]>(
    [],
  );

  // ── DEMO MODE — DELETE BEFORE GO-LIVE ─────────────────────────────────────
  // When the URL username is 'demo', bypass login and inject a fake fan profile
  // so the client can see the full dashboard without creating an account.
  const isDemoMode = username === "demo";
  const demoMember = isDemoMode
    ? ({
        id: "demo-fan-001",
        name: "Demo Fan",
        email: "demo@7thheavenband.com",
        role: "fan" as const,
      } as any)
    : null;
  // ── END DEMO MODE ──────────────────────────────────────────────────────────

  const checkCruiser = useCallback(async () => {
    if (!member?.email) return;

    const daysSinceCruise =
      (new Date().getTime() - new Date(CRUISE_END_DATE).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceCruise > 60) {
      setIsCruiser(false);
      setDashboardView("fan");
      return;
    }

    const { data } = await supabase
      .from("cruise_signups")
      .select("id")
      .eq("email", member.email)
      .single();
    if (data || member?.signup_source === "cruise_member_signup") {
      setIsCruiser(true);
      if (member?.signup_source === "cruise_member_signup") {
        setDashboardView("cruise");
      }

      // Load itinerary
      fetch(`/api/cruise/itinerary?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((raw) => {
          let d = raw;
          let i = 0;
          while (typeof d === "string" && i < 3) {
            try {
              d = JSON.parse(d);
            } catch {
              break;
            }
            i++;
          }
          if (Array.isArray(d) && d.length > 0) setCruiseItinerary(d);
        })
        .catch(() => {});

      // Load announcement
      fetch("/api/cruise/announcement?t=" + Date.now(), { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.message) setCruiseAnnouncement(d.message);
          else setCruiseAnnouncement(null);
        })
        .catch(() => {});
    }
  }, [member?.email, member?.signup_source, supabase]);

  useEffect(() => {
    checkCruiser();
  }, [checkCruiser]);

  // Check if fan already subscribed to live alerts
  useEffect(() => {
    try {
      const saved = localStorage.getItem("7h_live_alert_phone");
      if (saved) {
        setLiveAlertPhone(saved);
        setLiveAlertSubscribed(true);
        setLiveAlertStatus("subscribed");
      }
    } catch {}
  }, []);

  const handleLiveAlertSubscribe = async () => {
    const cleaned = liveAlertPhone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    setLiveAlertStatus("saving");
    try {
      const res = await fetch("/api/sms/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleaned,
          name: member?.name || "Fan",
          zipCode: "00000",
          source: "live_alert",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("7h_live_alert_phone", cleaned);
          setLiveAlertSubscribed(true);
          setLiveAlertStatus("subscribed");
        } else {
          setLiveAlertStatus("error");
        }
      } else {
        setLiveAlertStatus("error");
      }
    } catch {
      setLiveAlertStatus("error");
    }
  };

  const referralCode =
    (member?.name
      ? member.name.replace(/\s+/g, "").toUpperCase().slice(0, 6)
      : "FAN") + (member?.id?.slice(-4) || "7H");

  const loadDashboardData = useCallback(async () => {
    try {
      const tourRes = await fetch("/api/tour");
      if (tourRes.ok) {
        const data = await tourRes.json();
        const upcoming = (data || []).filter(
          (s: any) => s.date && new Date(s.date + "T23:59:59") >= new Date(),
        );
        setShows(upcoming);
        if (upcoming.length > 0) setNextShow(upcoming[0]);
      }
    } catch {}

    try {
      const merchRes = await fetch("/api/merch");
      if (merchRes.ok) {
        const data = await merchRes.json();
        if (data) setMerch(data);
      }
    } catch {}

    try {
      const alertRes = await fetch(
        "/api/admin/settings?key=live_alerts_enabled",
      );
      if (alertRes.ok) {
        const data = await alertRes.json();
        if (data?.value === "off") setLiveAlertsEnabled(false);
      }
    } catch {}

    try {
      localStorage.removeItem("vip_inbox_messages");
      localStorage.removeItem("7h_vip_inbox");
      Object.keys(localStorage).forEach((k) => {
        if (
          k.includes("is_live") ||
          k.includes("crew_is_live") ||
          k.includes("raffle") ||
          k.includes("pinned")
        ) {
          localStorage.removeItem(k);
        }
      });
    } catch {}

    try {
      const claimed = JSON.parse(
        localStorage.getItem("claimed_raffle_pins") || "[]",
      );
      setClaimedPins(Array.isArray(claimed) ? claimed : []);
    } catch {}
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadMyPhotos = useCallback(async () => {
    if (!member?.name) return;
    try {
      const res = await fetch("/api/fans?all=true");
      if (res.ok) {
        const data = await res.json();
        setMyPhotos(data.filter((p: any) => p.name === member.name));
      }
    } catch {}
  }, [member?.name]);

  useEffect(() => {
    loadMyPhotos();
  }, [loadMyPhotos]);

  // Live stream polling — checks actual crew live status + Supabase broadcasts
  const [liveFeeds, setLiveFeeds] = useState<
    { room: string; title: string; viewers: number; host: string }[]
  >([]);

  const checkLiveFeeds = useCallback(async () => {
    try {
      const feeds: {
        room: string;
        title: string;
        viewers: number;
        host: string;
      }[] = [];
      const seenRooms = new Set<string>();

      // 1. Get active LiveKit rooms for cross-validation
      const activeLkRooms = new Set<string>();
      try {
        const res = await fetch("/api/live-rooms");
        if (res.ok) {
          const data = await res.json();
          if (data.rooms?.length > 0) {
            for (const room of data.rooms) {
              activeLkRooms.add(room.name);
            }
          }
        }
      } catch {}

      // 2. Query Supabase live_streams — only show LiveKit-confirmed streams
      try {
        const { data: streams } = await supabase
          .from("live_streams")
          .select("*")
          .eq("status", "live");
        if (streams?.length) {
          const seenUsers = new Set<string>();
          const staleIds: string[] = [];

          for (const st of streams) {
            const roomName = st.stream_url || `live_${st.user_id}`;

            // Only show if LiveKit confirms it's actually live
            if (
              activeLkRooms.has(roomName) &&
              !seenUsers.has(st.user_id) &&
              !seenRooms.has(roomName)
            ) {
              seenUsers.add(st.user_id);
              seenRooms.add(roomName);
              feeds.push({
                room: roomName,
                title: st.title || "Crew Broadcast",
                viewers: st.viewer_count || 0,
                host: st.title?.split(" — ")[0] || "Crew Member",
              });
            } else if (!activeLkRooms.has(roomName)) {
              staleIds.push(st.id);
            }
          }

          // Auto-clean stale entries
          if (staleIds.length > 0) {
            supabase
              .from("live_streams")
              .update({ status: "ended" })
              .in("id", staleIds)
              .then(null, () => {});
          }
        }
      } catch {}
      // 3. FALLBACK: Show LiveKit rooms not matched to Supabase entries
      activeLkRooms.forEach((roomName: string) => {
        if (!seenRooms.has(roomName)) {
          seenRooms.add(roomName);
          const hostName = roomName
            .replace(/^live_/, "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          feeds.push({
            room: roomName,
            title: "Crew Broadcast",
            viewers: 0,
            host: hostName,
          });
        }
      });

      setLiveFeeds(feeds);
      setIsLive(feeds.length > 0);
    } catch {
      setIsLive(false);
      setLiveFeeds([]);
    }
  }, [supabase]);

  useEffect(() => {
    checkLiveFeeds();
    const interval = setInterval(checkLiveFeeds, 4000);

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key?.startsWith("crew_is_live_") ||
        e.key?.startsWith("7h_crew_is_live_")
      )
        checkLiveFeeds();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [checkLiveFeeds]);

  // Countdown timer
  useEffect(() => {
    if (!nextShow?.date) return;
    const buildTarget = () => {
      // Sanity dates are ISO: '2026-04-24'
      const d = new Date(nextShow.date + "T20:00:00");
      if (nextShow.time) {
        const match = nextShow.time.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
        if (match) {
          let h = parseInt(match[1]);
          const m = parseInt(match[2] || "0");
          if (match[3].toLowerCase() === "pm" && h !== 12) h += 12;
          if (match[3].toLowerCase() === "am" && h === 12) h = 0;
          d.setHours(h, m, 0, 0);
        }
      }
      return d;
    };
    const target = buildTarget();
    if (isNaN(target.getTime())) return;
    const tick = () => {
      const targetTime = target.getTime();
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      let status: "upcoming" | "live" | "ended" = "upcoming";
      if (now >= targetTime) {
        if (now < targetTime + 3.5 * 60 * 60 * 1000) {
          // 3.5 hours for the show
          status = "live";
        } else {
          status = "ended";
        }
      }

      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
        status,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextShow]);

  // devBypass is initialized to false on SSR; updated on client after mount to prevent
  // server/client render mismatch (hydration error).
  const [devBypass, setDevBypass] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setDevBypass(localStorage.getItem("7h_dev_bypass") === "true");
    }
  }, []);

  // Effective member = demo injection (always fan) OR real logged-in user
  const effectiveMember = isDemoMode ? demoMember : member;

  // Specific show notification subscriptions
  const [subscribedShows, setSubscribedShows] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const loadSubscribedShows = useCallback(async () => {
    if (!effectiveMember?.email) return;
    setLoadingAlerts(true);
    try {
      const res = await fetch(
        `/api/shows/notify-me?email=${encodeURIComponent(effectiveMember.email)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.subscriptions) {
          setSubscribedShows(data.subscriptions);
        }
      }
    } catch {
    } finally {
      setLoadingAlerts(false);
    }
  }, [effectiveMember?.email]);

  useEffect(() => {
    loadSubscribedShows();
  }, [loadSubscribedShows]);

  const handleUnsubscribeShow = async (showId: string) => {
    if (!effectiveMember?.email) return;
    try {
      const res = await fetch(
        `/api/shows/notify-me?email=${encodeURIComponent(effectiveMember.email)}&showId=${encodeURIComponent(showId)}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setSubscribedShows((prev) => prev.filter((s) => s.showId !== showId));
      } else {
        alert("Failed to cancel alert subscription. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  if (!isLoggedIn && !devBypass && !isDemoMode) {
    return (
      <main className="site-container flex min-h-screen items-center justify-center py-48">
        <div className="text-center">
          <h1 className="mb-6">
            Fan <span className="gradient-text">Account</span>
          </h1>
          <p className="mb-8 max-w-sm">
            Access your VIP dashboard, exclusive deals, and photo submission
            tools.
          </p>
          <button
            onClick={() => openModal("login")}
            className="bg-[var(--color-accent)] px-8 py-3 shadow-[0_0_15px_rgba(255,10,61,0.3)] hover:brightness-110"
          >
            Login to Access
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="site-container page-container min-h-screen"
      id="fan-profile-page"
    >
      <div>
        {/* ── DEMO BANNER — DELETE BEFORE GO-LIVE ────────────────────────────── */}
        {isDemoMode && (
          <aside className="mb-8 flex items-start gap-3 border border-purple-500/30 bg-purple-600/10 px-5 py-3">
            <span className="shrink-0 text-purple-300">⚠ DEMO MODE</span>
            <p className="text-purple-200/60">
              This is a preview of the Fan Dashboard with simulated data. Fans
              will need to create a free account to access their personal
              dashboard at{" "}
              <code className="text-purple-200/80">/fans/username</code>.
            </p>
          </aside>
        )}
        {/* ── END DEMO BANNER ─────────────────────────────────────────────── */}

        {/* Account Identity Header */}
        <header className="mb-6 border-b border-[var(--border-color)]">
          <MemberHeaderBadge
            name={effectiveMember?.name || member?.name || "Fan Guest"}
            email={effectiveMember?.email || member?.email || ""}
            avatar={effectiveMember?.avatar || member?.avatar}
            badgeLabel={
              effectiveMember?.role === "admin"
                ? "ADMIN"
                : effectiveMember?.role === "crew"
                  ? "CREW"
                  : "FAN"
            }
            badgeColorClass="bg-purple-600/70 border-purple-400/50 text-purple-200"
            subtitle="Access your fan profile, exclusive content, merch, show history, and cruise updates all in one place."
          />
        </header>

        {/* Cruise Hub Toggle */}
        {isCruiser && (
          <div className="-mt-2 mb-10 flex justify-center">
            <div className="inline-flex items-center rounded-lg border border-white/10 bg-[#00000029] p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <button
                onClick={() => setDashboardView("fan")}
                className={`cursor-pointer rounded-lg px-6 py-2 transition-colors ${dashboardView === "fan" ? "bg-[var(--color-accent)] shadow-[0_0_15px_rgba(255,10,61,0.4)]" : "text-white/40 hover:text-white"}`}
              >
                Fan Dashboard
              </button>
              <button
                onClick={() => setDashboardView("cruise")}
                className={`cursor-pointer rounded-lg px-6 py-2 transition-colors ${dashboardView === "cruise" ? "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "text-white/40"}`}
              >
                Cruise Hub
              </button>
            </div>
          </div>
        )}

        {dashboardView === "cruise" ? (
          <div>
            {/* Cruise Header */}
            <header className="mb-8 flex flex-col justify-between gap-8 border-b border-[var(--border-color)] pb-8 md:flex-row md:items-end">
              <div>
                <div className="mb-6 flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl">Cruise Hub</h2>
                    <p>Passenger Area</p>
                  </div>
                </div>
                <p className="max-w-xl">
                  Welcome aboard, <strong>{member?.name || "Guest"}</strong>.
                  Here is your official cruise status and early access portal.
                </p>
              </div>
              <div className="shrink-0">
                <EmbarkationCountdown />
              </div>
            </header>

            {/* Captain's Log */}
            {cruiseAnnouncement && (
              <div className="relative mb-8 overflow-hidden border border-purple-500/30 bg-gradient-to-br from-cyan-50 to-[#0a0a0f]">
                <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-lg blur-[80px]" />
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-cyan-500" />
                <div className="relative z-10 p-6 md:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <h3 className="text-black">Captain&apos;s Log</h3>
                    <span className="ml-auto rounded border border-purple-500/20 px-2 py-1 text-cyan-500/60">
                      Priority Update
                    </span>
                  </div>
                  <div
                    className="[&_a]: [&_a]: [&_strong]: [&_strong]: space-y-4 text-black/80 [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(cruiseAnnouncement),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Main Content Column */}
              <div className="flex flex-col gap-8 lg:col-span-2">
                <div className="flex flex-col gap-6">
                  <BookingManager email={member?.email} />
                  <ImportantLinksWidget />
                </div>

                {cruiseItinerary.length > 0 && (
                  <div>
                    <h2 className="mb-6 flex items-center gap-3">
                      Official Itinerary{" "}
                      <span className="not- ml-2 text-white/40">
                        Subject to Change
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {cruiseItinerary.map((day) => (
                        <div
                          key={day.id}
                          className="group relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6 transition-colors duration-300"
                          style={
                            {
                              "--tw-border-opacity": "0.4",
                              borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)`,
                            } as React.CSSProperties
                          }
                        >
                          <div
                            className="pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-lg opacity-10 blur-[50px] transition-colors duration-500 group-hover:opacity-20"
                            style={{ backgroundColor: day.colorTheme }}
                          />
                          <div className="relative z-10">
                            <div className="mb-5 flex items-center justify-between">
                              <span
                                className="rounded border px-2.5 py-1"
                                style={{
                                  color: day.colorTheme,
                                  backgroundColor: `color-mix(in srgb, ${day.colorTheme} 10%, transparent)`,
                                  borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)`,
                                }}
                              >
                                {day.dayLabel}
                              </span>
                              <span>{day.location}</span>
                            </div>
                            <h3 className="mb-2">{day.theme}</h3>
                            <ul className="mt-5 space-y-4 border-t border-white/10 pt-5">
                              {day.events.map((ev) => (
                                <li
                                  key={ev.id}
                                  className="flex items-start gap-4"
                                >
                                  <span
                                    className="mt-0.5"
                                    style={{ color: day.colorTheme }}
                                  >
                                    {ev.time}
                                  </span>
                                  <div>
                                    <strong className="block">
                                      {ev.title}
                                    </strong>
                                    <span>{ev.subtitle}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 flex flex-col gap-6">
                  {/* Passengers Widget */}
                  <div className="group relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                    <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-lg bg-[var(--color-accent)]/10 blur-[40px] transition-colors duration-500 group-hover:bg-[var(--color-accent)]/20" />
                    <div className="relative z-10 mb-5 flex items-end justify-between">
                      <div>
                        <h2 className="mb-1 text-white/40">Community</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">412</span>
                          <span className="text-[var(--color-accent)]">
                            Fans Onboard
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative z-10 mb-6 flex items-center">
                      <div className="flex -space-x-3">
                        {["JD", "SL", "MT", "AB", "RC", "KW"].map(
                          (initials, i) => {
                            const colors = [
                              "bg-rose-500/20 text-rose-300",
                              "bg- purple-white/20 text-purple-300",
                              "bg-cyan-500/20   ",
                              "bg-amber-500/20 text-amber-300",
                              "bg-emerald-500/20 text-emerald-300",
                              "bg-indigo-500/20 text-indigo-300",
                            ];
                            return (
                              <div
                                key={`fan-avatar-${i}-${initials}`}
                                className={`h-11 w-11 rounded-lg border-2 border-[var(--color-bg-surface)] ${colors[i % colors.length]} flex cursor-pointer items-center justify-center overflow-hidden transition-transform hover:-translate-y-1`}
                                style={{ zIndex: 10 - i }}
                              >
                                <span>{initials}</span>
                              </div>
                            );
                          },
                        )}
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[var(--color-bg-surface)] bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
                          +406
                        </div>
                      </div>
                    </div>
                    <p className="relative z-10 border-t border-white/10 pt-4">
                      Join the official 7th Heaven cruise community. See who
                      else is sailing, coordinate shore excursions, and make new
                      friends!
                    </p>
                  </div>
                  <CruiseChat />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Backstage Feed — always visible */}
            <section
              id="backstage-feed"
              aria-label="Backstage Live Feed"
              className="mb-6"
            >
              {isLive && liveFeeds.length > 0 ? (
                <div className="space-y-3">
                  {liveFeeds.map((feed) => (
                    <Link
                      key={feed.room}
                      href={`/live/${feed.room}`}
                      className="group relative block overflow-hidden"
                    >
                      <div className="flex items-center justify-between border border-red-500/40 bg-red-950/40 px-6 py-4 transition-colors hover:border-red-500/60">
                        <div className="flex items-center gap-4">
                          <span className="relative flex h-4 w-4">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-lg bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-4 w-4 rounded-lg bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                          </span>
                          <div>
                            <p>
                              {feed.host} is LIVE{" "}
                              {feed.title ? `— ${feed.title}` : ""}
                            </p>
                            <p className="mt-0.5 text-red-300/80">
                              {feed.viewers > 0
                                ? `${feed.viewers} watching · `
                                : ""}
                              Watch the backstage feed before it ends
                            </p>
                          </div>
                        </div>
                        <span className="rounded-lg bg-red-500 px-4 py-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-colors group-hover:bg-red-400">
                          Watch Now{" "}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link href="/live" className="group block">
                  <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-white/10 bg-[#00000029] px-4 py-4 transition-colors hover:border-white/20 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <span className="relative flex h-4 w-4 shrink-0">
                        <span className="relative inline-flex h-4 w-4 rounded-lg bg-white/30" />
                      </span>
                      <div>
                        <p>Backstage is Quiet</p>
                        <p className="mt-0.5 text-sm sm:text-base">
                          No crew feeds are live right now — check back during
                          the next show
                        </p>
                      </div>
                    </div>
                    <span className="w-full shrink-0 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-center whitespace-nowrap text-white/70 transition-colors group-hover:bg-white/20 group-hover:text-white sm:w-auto">
                      Live Hub
                    </span>
                  </div>
                </Link>
              )}
            </section>

            {/* Rewards & Raffle Wins */}
            {inboxMessages.some(
              (m) => m.color === "yellow" || m.title?.includes("Win"),
            ) && (
              <section
                id="raffle-rewards"
                aria-label="Raffle Rewards & Wins"
                className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                {(() => {
                  const claimedPinsSet = new Set(claimedPins);
                  return Array.from(inboxMessages, (win, i) => ({
                    win,
                    i,
                  })).flatMap(({ win, i }) => {
                    if (!(win.color === "yellow" || win.title?.includes("Win")))
                      return [];
                    const pinMatch = win.desc?.match(/PIN: (\d+)/);
                    const pin = pinMatch ? pinMatch[1] : null;

                    let isClaimed = false;
                    if (pin) {
                      try {
                        isClaimed = claimedPinsSet.has(pin);
                      } catch {}
                    }

                    return [
                      <div
                        key={i}
                        className={`border-2 bg-gradient-to-br from-[#1a1a25] to-[#0a0a0f] ${isClaimed ? "border-white/10 opacity-60" : "border-yellow-500/30"} group relative overflow-hidden p-6`}
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10"></div>
                        <div className="relative z-10 flex items-start justify-between">
                          <div>
                            {isClaimed ? (
                              <span className="mb-6 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-emerald-500/10 px-3 py-1">
                                ✓ PRIZE CLAIMED
                              </span>
                            ) : (
                              <span className="mb-6 inline-flex items-center gap-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-yellow-500">
                                RAFFLE WINNER
                              </span>
                            )}
                            <h3 className="mb-2">
                              {win.title
                                .replace("You Won the Raffle!", "")
                                .trim() || "Prize Claim"}
                            </h3>
                            <p className="mb-6 max-w-[280px]">
                              {win.desc.split(". Your PIN")[0]}
                            </p>
                          </div>
                          {pin && (
                            <div className="flex flex-col items-center">
                              <div className="mb-3 bg-white p-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <div className="flex h-24 w-24 flex-wrap gap-1 p-1">
                                  {Array.from({ length: 16 }).map((_, j) => {
                                    // Deterministic pattern seeded by pin+index to avoid re-render flicker
                                    const seed = pin
                                      ? (parseInt(pin, 10) * 31 + j * 7) % 97
                                      : (j * 17) % 97;
                                    return (
                                      <div
                                        key={j}
                                        className={`h-5 w-5 ${seed > 48 ? "bg-white" : " "}`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="mb-1">Claim PIN</p>
                                <p
                                  className={`${isClaimed ? "text-emerald-400 line-through" : "text-yellow-500"} `}
                                >
                                  {pin}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                          <p>
                            {isClaimed
                              ? "Prize handed off successfully"
                              : "Show this at the merch table"}
                          </p>
                          <button
                            className={`${isClaimed ? "text-emerald-400" : "text-yellow-500"} transition-colors hover:text-white`}
                          >
                            {isClaimed ? "Completed ✓" : "Full Details "}
                          </button>
                        </div>
                      </div>,
                    ];
                  });
                })()}
              </section>
            )}

            {/* Next Show Countdown */}
            {(() => {
              const isHappeningNow = nextShow && countdown.status === "live";
              const isEnded = nextShow && countdown.status === "ended";
              return (
                <section
                  id="next-show-countdown"
                  aria-label="Next Show Countdown"
                  className="relative mb-6"
                >
                  <div className="relative z-10">
                    {nextShow ? (
                      (() => {
                        return (
                          <>
                            <div
                              className={`mt-4 flex flex-col items-start justify-between gap-6 rounded-lg md:flex-row md:items-center ${isHappeningNow ? "-mx-1 border border-white/10 bg-emerald-500/[0.03] p-4" : ""}`}
                            >
                              <div>
                                <h3 className="mb-1 text-xl sm:text-2xl md:text-3xl">
                                  {nextShow.venue}
                                </h3>
                                <p className=" ">
                                  {nextShow.city
                                    ? `${nextShow.city}${nextShow.state ? `, ${nextShow.state}` : ""} · `
                                    : nextShow.state
                                      ? `${nextShow.state} · `
                                      : ""}
                                  {nextShow.date
                                    ? new Date(
                                        nextShow.date + "T12:00:00",
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "TBA"}
                                  {nextShow.time ? ` · ${nextShow.time}` : ""}
                                </p>
                              </div>
                              {isHappeningNow ? (
                                <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                                  <span className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-lg bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-3 w-3 rounded-lg bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                  </span>
                                  <span className="text-emerald-400">
                                    Happening Now
                                  </span>
                                </div>
                              ) : isEnded ? (
                                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#00000029] px-5 py-3">
                                  <span className="text-white/40">
                                    Thanks for coming!
                                  </span>
                                </div>
                              ) : (
                                <div className="flex w-full items-center justify-between gap-6 sm:gap-10 md:gap-14 lg:w-auto lg:gap-16">
                                  {[
                                    { v: countdown.days, l: "Days" },
                                    { v: countdown.hours, l: "Hrs" },
                                    { v: countdown.mins, l: "Min" },
                                    { v: countdown.secs, l: "Sec" },
                                  ].map((u, i) => (
                                    <div
                                      key={u.l}
                                      className="flex flex-1 flex-col items-center lg:flex-initial"
                                    >
                                      <span className="flex min-w-[1.4em] items-center justify-center text-center text-4xl tracking-tight tabular-nums sm:text-5xl md:text-6xl lg:text-7xl">
                                        {String(u.v).padStart(2, "0")}
                                      </span>
                                      <span className="st mt-2 text-white/60 sm:text-lg md:text-xl">
                                        {u.l}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <div>
                        <p className="sm:text-lg">
                          Check back soon — new dates drop regularly
                        </p>
                        <Link
                          href="/#tour"
                          className="mt-3 text-base transition-colors hover:text-white sm:text-lg"
                        >
                          View Tour Page
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              );
            })()}

            {/* Upcoming Shows */}
            <section
              id="upcoming-shows"
              aria-label="Upcoming Shows"
              className="mb-6 max-w-6xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <Link
                  href="/#tour"
                  className="text-lg text-white/50 transition-colors hover:text-[var(--color-accent)] sm:text-xl md:text-2xl"
                >
                  All Dates
                </Link>
              </div>
              {shows.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 lg:gap-8">
                  {Array.from(shows.slice(0, 3), (show: any, i: number) => ({
                    show,
                    i,
                  })).map(({ show, i }) => (
                    <article
                      key={show.id || show.date || show.venue}
                      className="group flex items-start gap-5 border-b border-white/10 pb-6 pb-8 last:border-b-0 sm:gap-7 sm:pb-8 md:gap-9 md:border-b-0 md:pb-6"
                    >
                      <div className="flex shrink-0 flex-col items-center justify-center rounded-3xl border border-white/15 bg-[#00000029] px-6 py-3">
                        <span className="st mb-1 text-base font-black text-purple-300 sm:text-lg md:text-xl lg:text-2xl">
                          {show.date
                            ? new Date(
                                show.date + "T12:00:00Z",
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                timeZone: "UTC",
                              })
                            : ""}
                        </span>
                        <span className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
                          {show.date
                            ? new Date(show.date + "T12:00:00").getDate()
                            : ""}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 truncate font-black">{show.venue}</p>
                        {(show.city || show.state) && (
                          <p className="sm: .5">
                            {show.city
                              ? `${show.city}${show.state ? `, ${show.state}` : ""}`
                              : show.state}
                          </p>
                        )}
                        {(show.doorsTime || show.playTime || show.time) && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            {show.doorsTime && (
                              <span className="text-lg text-white/50 sm:text-xl md:text-2xl lg:text-3xl">
                                Doors: {show.doorsTime}
                              </span>
                            )}
                            {show.playTime && (
                              <span className="text-lg text-rose-400 sm:text-xl md:text-2xl lg:text-3xl">
                                Show: {show.playTime}
                              </span>
                            )}
                            {show.time && (show.doorsTime || show.playTime) ? (
                              <span className="text-lg text-white/50 sm:text-xl md:text-2xl lg:text-3xl">
                                Event: {show.time}
                              </span>
                            ) : show.time &&
                              !show.doorsTime &&
                              !show.playTime ? (
                              <span className="/90 text-lg sm:text-xl md:text-2xl lg:text-3xl">
                                {show.time}
                              </span>
                            ) : null}
                          </div>
                        )}
                        {/* Directions to event + Parking — shown below time info */}
                        {!show.isSoldOut &&
                          (show.venue || show.directionsLink || show.notes) && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {/* Directions to the event itself — always shown if we have venue info */}
                              {(show.venue || show.city) &&
                                (() => {
                                  const mapsHref =
                                    show.mapUrl &&
                                    !show.mapUrl.includes("maps.apple.com")
                                      ? show.mapUrl
                                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([show.venue, show.city, show.state].filter(Boolean).join(" "))}`;
                                  return (
                                    <a
                                      href={mapsHref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="! inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#00000029] px-2.5 py-1 text-xs shadow-sm backdrop-blur-[16px] transition-all hover:bg-white/15 hover:text-white"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5 shrink-0"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                      </svg>
                                      Directions
                                    </a>
                                  );
                                })()}
                              {/* Parking — smart button: link-only / note-only / both */}
                              {(show.directionsLink || show.notes) &&
                                (() => {
                                  const btnClass =
                                    "inline-flex items-center gap-1.5 text-xs     !  bg-[#00000029] border border-white/15 backdrop-blur-[16px] px-2.5 py-1 rounded-lg hover:bg-white/15 hover:text-white transition-all shadow-sm";
                                  if (show.directionsLink && !show.notes) {
                                    return (
                                      <a
                                        href={show.directionsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={btnClass}
                                      >
                                        {PIN_ICON} Parking
                                      </a>
                                    );
                                  }
                                  if (!show.directionsLink && show.notes) {
                                    return (
                                      <div className="relative">
                                        <button
                                          onClick={() =>
                                            setParkingNoteOpenIdx(
                                              parkingNoteOpenIdx === i
                                                ? null
                                                : i,
                                            )
                                          }
                                          className={btnClass}
                                        >
                                          {PIN_ICON} Parking
                                        </button>
                                        {parkingNoteOpenIdx === i && (
                                          <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg border border-white/10 bg-[#111] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.7)]">
                                            <div className="mb-1.5 flex items-center justify-between">
                                              <span className="text-xs text-white/40">
                                                Parking Info
                                              </span>
                                              <button
                                                onClick={() =>
                                                  setParkingNoteOpenIdx(null)
                                                }
                                                className="text-white/30 transition-colors hover:text-white"
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-3 w-3"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2.5"
                                                >
                                                  <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                              </button>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">
                                              {show.notes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                  // Both: link button + ⓘ for note popover
                                  return (
                                    <>
                                      <a
                                        href={show.directionsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={btnClass}
                                      >
                                        {PIN_ICON} Parking
                                      </a>
                                      <div className="relative">
                                        <button
                                          onClick={() =>
                                            setParkingNoteOpenIdx(
                                              parkingNoteOpenIdx === i
                                                ? null
                                                : i,
                                            )
                                          }
                                          className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-white/15 bg-[#00000029] text-white/60 shadow-sm transition-all hover:bg-white/15 hover:text-white"
                                          title="Parking notes"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 16v-4M12 8h.01" />
                                          </svg>
                                        </button>
                                        {parkingNoteOpenIdx === i && (
                                          <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg border border-white/10 bg-[#111] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.7)]">
                                            <div className="mb-1.5 flex items-center justify-between">
                                              <span className="text-xs text-white/40">
                                                Parking Info
                                              </span>
                                              <button
                                                onClick={() =>
                                                  setParkingNoteOpenIdx(null)
                                                }
                                                className="text-white/30 transition-colors hover:text-white"
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-3 w-3"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2.5"
                                                >
                                                  <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                              </button>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">
                                              {show.notes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
                            </div>
                          )}
                        {show.isSoldOut && (
                          <span className="mt-2.5 inline-block rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <p>No shows on the horizon yet.</p>
                  <p>Follow us for announcements on new dates!</p>
                </div>
              )}
            </section>

            {/* Proximity Alerts & Show Alerts — 50/50 Grid */}
            <section
              id="show-alerts"
              aria-label="Show & Location Alerts"
              className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <div>
                <ProximityPanel />
              </div>

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <SectionBadge label="Subscribed Show Alerts" />
                  <span className="text-[var(--font-size-2xs)] text-white/40">
                    Specific Tour Dates
                  </span>
                </div>

                {loadingAlerts ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-lg border-2 border-purple-500 border-t-transparent" />
                  </div>
                ) : subscribedShows.length > 0 ? (
                  <div className="space-y-3">
                    {subscribedShows.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="justify-betweenr group flex items-center gap-4 rounded-lg border border-white/10 bg-[#00000029] p-4 transition-colors hover:border-purple-500/30"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="min-w-0">
                            <p className="truncate">{sub.venueName}</p>
                            <p>
                              {sub.showDate ? sub.showDate : "Upcoming Date"}
                              {sub.city ? ` · ${sub.city}, ${sub.state}` : ""}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnsubscribeShow(sub.showId)}
                          className="hover: cursor-pointer rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-[var(--font-size-2xs)] text-rose-400 transition-colors hover:bg-rose-600"
                        >
                          Cancel Alert
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-lg border border-dashed border-white/10 bg-[#00000029] py-8">
                    <p>You aren&apos;t tracking any specific shows yet.</p>
                    <p>
                      Click the bell icon on the tour page to get date alerts.
                    </p>
                    <Link
                      href="/#tour"
                      className="mt-3 transition-colors hover:text-white"
                    >
                      Find Shows
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {!isCruiser && isCruiseBannerActive && (
              <Link href="/cruise" className="group mb-10 block">
                <div className="relative overflow-hidden border border-purple-500/20 p-6 transition-colors hover:border-purple-500/40 md:p-8">
                  <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-lg border border-purple-500/20 px-2.5 py-1 text-purple-400">
                            Limited Spots
                          </span>
                        </div>
                        <h3 className="mb-1">7th Heaven is Setting Sail!</h3>
                        <p className="max-w-lg">
                          7 nights, 3 islands, 6 live shows. Sign up for the
                          cruise and unlock your <span>Cruise Hub</span> right
                          here on your dashboard.
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 bg-cyan-500 px-6 py-3 text-[#0a0a0f] shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-colors group-hover:bg-cyan-400">
                      Learn More
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Live Alert SMS Opt-In */}
            {liveAlertsEnabled && (
              <section
                id="live-alert-optin"
                aria-label="Live Alert SMS Subscription"
                className="relative mb-8"
              >
                <div className="relative z-10">
                  <h3 className="mb-1">Never Miss a Live Feed</h3>
                  <p className="mb-5 w-full">
                    Get a text the moment 7th Heaven goes live — backstage
                    content, surprise streams, live Q&As, and more.
                  </p>

                  {liveAlertSubscribed ? (
                    <div className="flex w-full items-center gap-4 border border-white/10 bg-emerald-500/10 p-4">
                      <div>
                        <p>Live Alerts Active</p>
                        <p>
                          We&apos;ll text{" "}
                          <span>
                            ({liveAlertPhone.slice(0, 3)}) ***-
                            {liveAlertPhone.slice(-4)}
                          </span>{" "}
                          when a stream starts
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem("7h_live_alert_phone");
                          setLiveAlertSubscribed(false);
                          setLiveAlertStatus("idle");
                          setLiveAlertPhone("");
                        }}
                        className="ml-auto cursor-pointer text-white/40 transition-colors hover:text-red-400"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  ) : (
                    <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                      <div className="flex w-full items-center sm:max-w-[300px]">
                        <GlowInput
                          id="live-alert-phone-input"
                          aria-label="Phone number for live alerts"
                          type="tel"
                          placeholder="(312) 555-0199"
                          value={liveAlertPhone}
                          onChange={(e) => setLiveAlertPhone(e.target.value)}
                        />
                      </div>
                      <SeventhButton
                        onClick={handleLiveAlertSubscribe}
                        disabled={liveAlertStatus === "saving"}
                        icon={false}
                        className="w-full shrink-0 cursor-pointer justify-center px-6 py-3.5 text-center whitespace-nowrap sm:w-auto"
                      >
                        {liveAlertStatus === "saving"
                          ? "Saving..."
                          : "Alert Me"}
                      </SeventhButton>
                    </div>
                  )}
                  {liveAlertStatus === "error" && (
                    <p className="mt-3 text-red-400">
                      Something went wrong — please try again.
                    </p>
                  )}
                  <p className="mt-4">
                    Standard messaging rates apply. Reply STOP to unsubscribe at
                    any time.
                  </p>
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
              {/* Main Column */}
              <div className="space-y-0 lg:col-span-2">
                {/* Tour Memories Gallery & Upload */}
                <section
                  id="tour-memories"
                  aria-label="Tour Memories Gallery"
                  className="space-y-6 border-t border-white/10"
                >
                  {/* Photo Gallery Grid */}
                  {myPhotos.length > 0 && (
                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {myPhotos.map((photo) => {
                        const isVideo =
                          photo.type === "video" ||
                          photo.src.endsWith(".mp4") ||
                          photo.src.endsWith(".mov");
                        return (
                          <div
                            key={photo.id}
                            className={`group relative aspect-square overflow-hidden border ${photo.rejected ? "border-red-500/40" : "border-black/10"}`}
                          >
                            {isVideo ? (
                              <video
                                src={photo.src}
                                className="h-full w-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                              />
                            ) : (
                              <Image
                                width={200}
                                height={200}
                                unoptimized
                                src={photo.src}
                                alt={photo.venue}
                                className="h-full w-full object-cover"
                              />
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-2 right-2 z-10">
                              {photo.approved ? (
                                <span className="rounded bg-emerald-500 px-2 py-0.5 text-[0.9rem]">
                                  Live
                                </span>
                              ) : photo.rejected ? (
                                <span className="rounded bg-red-500 px-2 py-0.5 text-[0.9rem]">
                                  Declined
                                </span>
                              ) : (
                                <span className="rounded bg-yellow-500 px-2 py-0.5 text-[0.9rem]">
                                  Review
                                </span>
                              )}
                            </div>

                            {/* Rejected overlay details */}
                            {photo.rejected ? (
                              <div className="backdrop-blur-2xs absolute inset-0 z-20 flex flex-col justify-between bg-red-950/80 p-3.5 text-left">
                                <div>
                                  <p className="mb-1.5 flex items-center gap-1 text-red-400">
                                    <span>⚠️</span> Declined
                                  </p>
                                  <div className="rounded border border-red-500/10 bg-red-900/20 p-2">
                                    <p className="line-clamp-4 leading-normal text-red-100/90">
                                      {photo.rejection_reason ||
                                        "Content does not meet community guidelines."}
                                    </p>
                                  </div>
                                </div>
                                <p className="mt-auto truncate text-black/30">
                                  {photo.venue || "Live Event"}
                                </p>
                              </div>
                            ) : (
                              /* Hover overlay for approved/pending */
                              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <p className="truncate">
                                  {photo.venue || "Live Event"}
                                </p>
                                <p
                                  className={`mt-0.5 ${photo.approved ? "text-emerald-400" : "text-purple-300"}`}
                                >
                                  {photo.approved
                                    ? "Live on wall"
                                    : "In Review"}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <FanUploadForm />
                </section>
              </div>

              {/* Right Column / Sidebar */}
              <div className="space-y-8">
                {/* VIP Inbox */}
                <aside id="vip-inbox" className="flex flex-col justify-between">
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-purple-400">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        VIP Inbox
                      </span>
                      {inboxMessages.filter((m) => m.isNew).length > 0 && (
                        <span className="animate-pulse rounded-lg border border-white/10 bg-purple-500/10 px-3 py-1 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                          {inboxMessages.filter((m) => m.isNew).length} New
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="scrollbar-hide max-h-[300px] space-y-4 overflow-y-auto">
                    {inboxMessages.map((msg) => (
                      <div
                        key={msg.id || msg.title}
                        className={`group -mx-3 cursor-pointer border border-transparent border-white/10 bg-[#00000029] p-3 transition-colors ${msg.isNew ? "bg-white/[0.02]" : "opacity-60"}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg ${msg.color === "yellow" ? "border-yellow-500/30 bg-yellow-500/20" : "border-emerald-500/30 bg-emerald-500/20"} flex shrink-0 items-center justify-center`}
                          >
                            <span>{msg.icon}</span>
                          </div>
                          <div>
                            <p
                              className={`transition-colors ${msg.color === "yellow" ? "group-hover:text-yellow-400" : "group-hover:text-blue-400"}`}
                            >
                              {msg.title}
                            </p>
                            <p>{msg.desc}</p>
                            <p
                              className={`mt-2 ${msg.isNew ? "text-[var(--color-accent)]" : "text-white/40"}`}
                            >
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty state */}
                    {inboxMessages.length === 0 && (
                      <div className="flex flex-col items-center py-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mb-2 h-7 w-7 text-white/20"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p>No messages yet.</p>
                        <p>Raffle wins, alerts & updates will appear here.</p>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </div>

            {/* 🛍️ Merch Quick Shop */}
            {merch.length > 0 && (
              <section
                id="merch-quick-shop"
                aria-label="Merch Quick Shop"
                className="mt-8"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-fuchsia-400">
                    🛍️ Quick Shop
                  </span>
                  <Link
                    href="/merch"
                    className="text-white/40 transition-colors"
                  >
                    Full Store
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {merch.map((item: any) => (
                    <article
                      key={item.id}
                      className="group overflow-hidden border border-white/10 bg-[#00000029] transition-colors hover:border-fuchsia-500/30"
                    >
                      {item.image && (
                        <div className="aspect-square overflow-hidden bg-black/40">
                          <Image
                            width={200}
                            height={200}
                            unoptimized
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="truncate">{item.title}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-lg text-fuchsia-400">
                            ${parseFloat(item.price).toFixed(0)}
                          </span>
                          <Link
                            href={`/merch`}
                            className="hover: rounded border border-white/10 bg-white/10 px-3 py-1.5 text-white/70 transition-colors hover:border-fuchsia-500 hover:bg-fuchsia-500"
                          >
                            Buy Now
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
