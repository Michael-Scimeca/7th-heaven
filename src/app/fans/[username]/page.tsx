/* eslint-disable react-doctor/no-giant-component, react-doctor/no-high-complexity-react-function */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
import Image from "next/image";

import { useMember } from "@/context/MemberContext";
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  use,
  useSyncExternalStore,
} from "react";
import {
  MapPin,
  Navigation,
  Calendar,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { geocodeZip, distanceMiles } from "@/lib/geo";
import { getVenueCoords } from "@/lib/venue-coords";
import {
  getShowDateTime,
  ensureUpcomingTourDates,
  isShowOver,
} from "@/lib/tour-helpers";
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
import { SectionHeader } from "@/components/SectionHeader";
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

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

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
  const [userZip, setUserZip] = useState<string>("");
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [sortByDistance, setSortByDistance] = useState<boolean>(true);
  const [isEditingZip, setIsEditingZip] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [geoLocating, setGeoLocating] = useState(false);
  const [isSavingZip, setIsSavingZip] = useState(false);
  const [visibleShowCount, setVisibleShowCount] = useState(6);
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
    () => () => { },
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
  const effectiveMember = isDemoMode ? demoMember : member;

  // Initialize user's ZIP / location from member profile or localStorage
  useEffect(() => {
    let savedZip: string | undefined = undefined;
    try {
      const memberZip = (effectiveMember as any)?.zip || (member as any)?.zip;
      if (typeof window !== "undefined") {
        savedZip =
          localStorage.getItem("7h_fan_zip") ||
          localStorage.getItem("7h_proximity_zip") ||
          localStorage.getItem("7h_sms_zip") ||
          memberZip;
      } else {
        savedZip = memberZip;
      }
    } catch { }
    const initial = savedZip || "60611";
    setUserZip(initial);
    setZipInput(initial);
  }, [effectiveMember, member]);

  // Geocode userZip whenever it changes (unless GPS "Current Location")
  useEffect(() => {
    if (!userZip || userZip === "Current Location") return;
    let active = true;
    geocodeZip(userZip).then((coords) => {
      if (!active) return;
      if (coords) {
        setUserCoords(coords);
      }
    });
    return () => {
      active = false;
    };
  }, [userZip]);

  const handleUseMyLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    if (geoLocating) return;
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setUserZip("Current Location");
        setSortByDistance(true);
        setGeoLocating(false);
        setIsEditingZip(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setGeoLocating(false);
        alert("Unable to detect location. Please enter a 5-digit ZIP code.");
      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  }, [geoLocating]);

  const handleSaveZip = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (isSavingZip) return;
      const clean = zipInput.replace(/\D/g, "").slice(0, 5);
      if (clean.length !== 5) {
        alert("Please enter a valid 5-digit US ZIP code");
        return;
      }
      setIsSavingZip(true);
      setUserZip(clean);
      setIsEditingZip(false);
      setSortByDistance(true);
      try {
        localStorage.setItem("7h_fan_zip", clean);
        if (member?.id) {
          const res = await fetch("/api/proximity/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ zip: clean }),
          });
          if (!res.ok) {
            console.warn("Failed to sync profile zip");
          }
        }
      } catch (err) {
        console.warn("Error saving zip:", err);
      } finally {
        setIsSavingZip(false);
      }
    },
    [zipInput, isSavingZip, member?.id],
  );

  const showsWithDistance = useMemo(() => {
    return shows.map((show: any) => {
      const coords = getVenueCoords(show.venue, show.city, show.lat, show.lng);
      let distanceMilesNum: number | null = null;
      if (coords && userCoords) {
        const d = distanceMiles(
          userCoords.lat,
          userCoords.lng,
          coords[0],
          coords[1],
        );
        distanceMilesNum = Math.round(d * 10) / 10;
      }
      const showDt = getShowDateTime(show.startDate, show.date, show.time);
      const hasValidDate = !isNaN(showDt.getTime()) && showDt.getTime() > 0;
      const monthLabel = hasValidDate
        ? MONTHS_SHORT[showDt.getMonth()]
        : show.date
          ? show.date.split(" ")[0].slice(0, 3)
          : "";
      const dayNumber = hasValidDate
        ? String(showDt.getDate())
        : show.date
          ? show.date.split(" ")[1] || ""
          : "";
      const dayName =
        show.day || (hasValidDate ? DAYS_SHORT[showDt.getDay()] : "");
      const fullDayName = hasValidDate ? DAYS_FULL[showDt.getDay()] : "";
      const fullMonthName = hasValidDate ? MONTHS_FULL[showDt.getMonth()] : "";
      const formattedFullDate = hasValidDate
        ? `${fullDayName}, ${fullMonthName} ${showDt.getDate()}`
        : show.date || "TBA";

      return {
        ...show,
        distanceMiles: distanceMilesNum,
        venueCoords: coords,
        monthLabel,
        dayNumber,
        dayName,
        formattedFullDate,
      };
    });
  }, [shows, userCoords]);

  const displayShows = useMemo(() => {
    const list = [...showsWithDistance];
    if (sortByDistance && userCoords) {
      list.sort((a, b) => {
        const distA = a.distanceMiles ?? 99999;
        const distB = b.distanceMiles ?? 99999;
        if (distA !== distB) return distA - distB;
        const timeA = getShowDateTime(a.startDate, a.date, a.time).getTime();
        const timeB = getShowDateTime(b.startDate, b.date, b.time).getTime();
        return timeA - timeB;
      });
    } else {
      list.sort((a, b) => {
        const timeA = getShowDateTime(a.startDate, a.date, a.time).getTime();
        const timeB = getShowDateTime(b.startDate, b.date, b.time).getTime();
        return timeA - timeB;
      });
    }
    return list;
  }, [showsWithDistance, sortByDistance, userCoords]);

  const nextShow = useMemo(() => {
    return displayShows.length > 0 ? displayShows[0] : null;
  }, [displayShows]);

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
        .catch(() => { });

      // Load announcement
      fetch("/api/cruise/announcement?t=" + Date.now(), { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.message) setCruiseAnnouncement(d.message);
          else setCruiseAnnouncement(null);
        })
        .catch(() => { });
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
    } catch { }
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
        const ensured = ensureUpcomingTourDates(data || []);
        const upcoming = (ensured || []).filter((s: any) => !isShowOver(s));
        const listToUse = upcoming.length > 0 ? upcoming : ensured;
        setShows(listToUse);
      }
    } catch { }

    try {
      const merchRes = await fetch("/api/merch");
      if (merchRes.ok) {
        const data = await merchRes.json();
        if (data) setMerch(data);
      }
    } catch { }

    try {
      const alertRes = await fetch(
        "/api/admin/settings?key=live_alerts_enabled",
      );
      if (alertRes.ok) {
        const data = await alertRes.json();
        if (data?.value === "off") setLiveAlertsEnabled(false);
      }
    } catch { }

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
    } catch { }

    try {
      const claimed = JSON.parse(
        localStorage.getItem("claimed_raffle_pins") || "[]",
      );
      setClaimedPins(Array.isArray(claimed) ? claimed : []);
    } catch { }
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
    } catch { }
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
      } catch { }

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
              .then(null, () => { });
          }
        }
      } catch { }
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
    if (!nextShow?.date && !nextShow?.startDate) return;
    const target = getShowDateTime(
      nextShow.startDate,
      nextShow.date,
      nextShow.time,
    );
    if (isNaN(target.getTime()) || target.getTime() === 0) return;

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
          <div className="title-group title-group--page mb-8 items-center text-center">
            <h1>
              Fan <span className="gradient-text">Account</span>
            </h1>
            <p className="max-w-sm">
              Access your VIP dashboard, exclusive deals, and photo submission
              tools.
            </p>
          </div>
          <button
            onClick={() => openModal("login")}
            className="transition-[filter] bg-[var(--color-accent)] px-8 py-3 shadow-[0_0_15px_rgba(255,10,61,0.3)] hover:brightness-110"
          >
            Login to Access
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="site-container page-container page-stack min-h-screen"
      id="fan-profile-page"
    >
      {/* ── DEMO BANNER — DELETE BEFORE GO-LIVE ────────────────────────────── */}
      {isDemoMode && (
        <aside className="mb-8 flex items-start gap-3 rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-600/10 px-5 py-3">
          <span className="shrink-0">⚠ DEMO MODE</span>
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
      <header className="border-b border-[var(--border-color)]">
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
          <div className="inline-flex items-center rounded-[var(--radius-box)] border border-white/10 bg-[#00000029] p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setDashboardView("fan")}
              className={`cursor-pointer px-6 py-2 ${dashboardView === "fan" ? "bg-[var(--color-accent)] shadow-[0_0_15px_rgba(255,10,61,0.4)]" : "text-white/40 hover:text-white"} `}
            >
              Fan Dashboard
            </button>
            <button
              onClick={() => setDashboardView("cruise")}
              className={`cursor-pointer px-6 py-2 ${dashboardView === "cruise" ? "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "text-white/40"} `}
            >
              Cruise Hub
            </button>
          </div>
        </div>
      )}

      {dashboardView === "cruise" ? (
        <div>
          {/* Cruise Header */}
          <header className="flex flex-col justify-between gap-8 border-b border-[var(--border-color)] pb-8 md:flex-row md:items-end">
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
            <div className="relative mb-8 overflow-hidden rounded-[var(--radius-box)] border border-purple-500/30 bg-gradient-to-br from-cyan-50 to-[#0a0a0f]">
              <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 blur-3xl" />
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-cyan-500" />
              <div className="relative z-10 p-6 md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <h3 className="text-black">Captain&apos;s Log</h3>
                  <span className="ml-auto rounded border border-white/10 px-2 py-1 text-cyan-500/60">
                    Priority Update
                  </span>
                </div>
                <div
                  className="[&_a]:text-cyan-600 [&_a]:underline [&_strong]:font-semibold space-y-4 text-black/80 [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
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
                    <span className="not-italic ml-2 text-white/40">
                      Subject to Change
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {cruiseItinerary.map((day) => (
                      <div
                        key={day.id}
                        className="group relative overflow-hidden rounded-[var(--radius-box)] border border-[var(--border-color)] p-6"
                        style={
                          {
                            "--tw-border-opacity": "0.4",
                            borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)`,
                          } as React.CSSProperties
                        }
                      >
                        <div
                          className="transition-opacity pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 opacity-10 blur-3xl group-hover:opacity-20"
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
                <div className="group relative overflow-hidden rounded-[var(--radius-box)] border border-[var(--border-color)] p-6">
                  <div className="transition-colors pointer-events-none absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 bg-[var(--color-accent)]/10 blur-3xl group-hover:bg-[var(--color-accent)]/20" />
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
                            "bg- purple-white/20  ",
                            "bg-cyan-500/20   ",
                            "bg-amber-500/20 text-amber-300",
                            "bg-emerald-500/20 text-emerald-300",
                            "bg-indigo-500/20 text-indigo-300",
                          ];
                          return (
                            <div
                              key={`fan-avatar-${i}-${initials}`}
                              className={`h-11 w-11 rounded-full border-2 border-[var(--color-bg-surface)] ${colors[i % colors.length]} transition-transform flex cursor-pointer items-center justify-center overflow-hidden hover:-translate-y-1`}
                              style={{ zIndex: 10 - i }}
                            >
                              <span>{initials}</span>
                            </div>
                          );
                        },
                      )}
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--color-bg-surface)] bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
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
            aria-labelledby="backstage-feed-heading"
            className="section"
          >
            <SectionHeader id="backstage-feed-heading" title="Backstage Live Feed" visuallyHidden />
            <div className="">
              {isLive && liveFeeds.length > 0 ? (
                <div className="space-y-3">
                  {liveFeeds.map((feed) => (
                    <Link
                      key={feed.room}
                      href={`/live/${feed.room}`}
                      className="group relative block overflow-hidden rounded-[var(--radius-box)]"
                    >
                      <div className="transition-colors flex items-center justify-between rounded-[var(--radius-box)] border border-red-500/40 bg-red-950/40 px-6 py-4 hover:border-red-500/60">
                        <div className="flex items-center gap-4">
                          <span className="relative flex h-4 w-4">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
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
                        <span className="transition-colors rounded-[var(--radius-box)] bg-red-500 px-4 py-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:bg-red-400">
                          Watch Now{" "}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link href="/live" className="group block">
                  <div className="transition-colors flex flex-col items-start justify-between gap-4 rounded-[var(--radius-box)] border border-white/10 bg-[#00000029] px-4 py-4 hover:border-white/20 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <span className="relative flex h-4 w-4 shrink-0">
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-white/30" />
                      </span>
                      <div>
                        <p>Backstage is Quiet</p>
                        <p className="mt-0.5">
                          No crew feeds are live right now — check back during
                          the next show
                        </p>
                      </div>
                    </div>
                    <span className="transition-colors w-full shrink-0 rounded-[var(--radius-box)] border border-white/10 bg-white/10 px-4 py-2 text-center whitespace-nowrap group-hover:bg-white/20 group-hover:text-white sm:w-auto">
                      Live Hub
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </section>

          {/* Rewards & Raffle Wins */}
          {inboxMessages.some(
            (m) => m.color === "yellow" || m.title?.includes("Win"),
          ) && (
              <section
                id="raffle-rewards"
                aria-labelledby="raffle-rewards-heading"
                className="section"
              >
                <SectionHeader id="raffle-rewards-heading" title="Raffle Rewards & Wins" visuallyHidden />
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        } catch { }
                      }

                      return [
                        <div
                          key={i}
                          className={`border-2 bg-gradient-to-br from-[#1a1a25] to-[#0a0a0f] ${isClaimed ? "border-white/10 opacity-60" : "border-yellow-500/30"} group relative overflow-hidden rounded-[var(--radius-box)] p-6`}
                        >
                          <div className="transition-opacity absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10"></div>
                          <div className="relative z-10 flex items-start justify-between">
                            <div>
                              {isClaimed ? (
                                <span className="mb-6 inline-flex items-center gap-1.5 rounded-[var(--radius-box)] border border-white/10 bg-emerald-500/10 px-3 py-1">
                                  ✓ PRIZE CLAIMED
                                </span>
                              ) : (
                                <span className="mb-6 inline-flex items-center gap-1.5 rounded-[var(--radius-box)] border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-yellow-500">
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
                                          className={`h-5 w-5 ${seed > 48 ? "bg-white" : " "} `}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="mb-1">Claim PIN</p>
                                  <p
                                    className={` ${isClaimed ? "text-emerald-400 line-through" : "text-yellow-500"} `}
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
                              className={` ${isClaimed ? "text-emerald-400" : "text-yellow-500"} transition-colors hover:text-white`}
                            >
                              {isClaimed ? "Completed ✓" : "Full Details "}
                            </button>
                          </div>
                        </div>,
                      ];
                    });
                  })()}
                </div>
              </section>
            )}

          {/* Next Show Countdown */}
          {(() => {
            const isHappeningNow = nextShow && countdown.status === "live";
            const isEnded = nextShow && countdown.status === "ended";
            const formattedDate =
              nextShow?.formattedFullDate || nextShow?.date || "TBA";

            return (
              <section
                id="next-show-countdown"
                aria-labelledby="next-show-countdown-heading"
                className="section relative"
              >
                <SectionHeader id="next-show-countdown-heading" title="Next Show Countdown" visuallyHidden />
                <div className="relative mb-6">
                  <div className="relative z-10">
                    {nextShow ? (
                      <>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase tracking-wider bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                            {sortByDistance ? "Closest Upcoming Show" : "Next Show on Tour"}
                          </span>
                          {nextShow.distanceMiles !== undefined && nextShow.distanceMiles !== null && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/15">
                              <MapPin className="h-3 w-3 text-[var(--color-accent)]" />
                              {nextShow.distanceMiles} miles from {userZip}
                            </span>
                          )}
                        </div>
                        <div
                          className={`mt-2 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center ${isHappeningNow ? "-mx-1 rounded-[var(--radius-box)] border border-white/10 bg-emerald-500/[0.03] p-4" : ""} `}
                        >
                          <div>
                            <h3 className="mb-1 text-xl sm:text-2xl md:text-3xl">
                              {nextShow.venue}
                            </h3>
                            <p className="text-white/70">
                              {nextShow.city
                                ? `${nextShow.city}${nextShow.state ? `, ${nextShow.state}` : ""} · `
                                : nextShow.state
                                  ? `${nextShow.state} · `
                                  : ""}
                              {formattedDate}
                              {nextShow.time ? ` · ${nextShow.time}` : ""}
                            </p>
                          </div>
                          {isHappeningNow ? (
                            <div className="flex items-center gap-3 rounded-[var(--radius-box)] border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                              <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                              </span>
                              <span className="text-emerald-400">
                                Happening Now
                              </span>
                            </div>
                          ) : isEnded ? (
                            <div className="flex items-center gap-3 rounded-[var(--radius-box)] border border-white/10 bg-[#00000029] px-5 py-3">
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
                              ].map((u) => (
                                <div
                                  key={u.l}
                                  className="flex flex-1 flex-col items-center lg:flex-initial"
                                >
                                  <span className="flex min-w-[1.4em] items-center justify-center text-center text-4xl tracking-tight tabular-nums sm:text-5xl md:text-6xl lg:text-7xl">
                                    {String(u.v).padStart(2, "0")}
                                  </span>
                                  <span className="mt-2 text-white/60 md:text-xl">
                                    {u.l}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="">
                          Check back soon — new dates drop regularly
                        </p>
                        <Link
                          href="/#tour"
                          className="transition-colors mt-3 hover:text-white"
                        >
                          View Tour Page
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })()}

          {/* Upcoming Shows */}
          <section
            id="upcoming-shows"
            aria-labelledby="upcoming-shows-heading"
            className="section"
          >
            <SectionHeader
              id="upcoming-shows-heading"
              title={sortByDistance ? "Closest Shows" : "Upcoming Tour Dates"}
              subtitle={
                userZip && userZip !== "Current Location"
                  ? `Showing tour dates relative to ZIP ${userZip}`
                  : userZip === "Current Location"
                    ? "Showing tour dates relative to your current location"
                    : "Explore 7th Heaven tour dates"
              }

              action={
                <Link
                  href="/#tour"
                  className="text-xs sm:text-sm font-semibold text-white/60 hover:text-[var(--color-accent)] transition-colors"
                >
                  Full Tour Schedule →
                </Link>
              }
            />

            {/* Location & Sorting Filter Bar */}
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: Location indicator & ZIP editor */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70">
                  <MapPin className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
                  <span>Location:</span>
                </div>

                {isEditingZip ? (
                  <form onSubmit={handleSaveZip} className="flex items-center gap-2">
                    <input
                      type="text"
                      pattern="[0-9]*"
                      maxLength={5}
                      value={zipInput}
                      onChange={(e) =>
                        setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))
                      }
                      placeholder="5-digit ZIP"
                      className="w-28 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs sm:text-sm font-mono text-white placeholder-white/40 focus:border-[var(--color-accent)] focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSavingZip}
                      className="transition-[filter] rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setZipInput(userZip);
                        setIsEditingZip(false);
                      }}
                      className="transition-colors rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                      {userZip || "Not set"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingZip(true)}
                      className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                    >
                      Change ZIP
                    </button>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={geoLocating}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                      title="Detect location using browser GPS"
                    >
                      {geoLocating ? (
                        <Loader2 className="h-3 w-3 animate-spin text-[var(--color-accent)]" />
                      ) : (
                        <Navigation className="h-3 w-3 text-sky-400" />
                      )}
                      <span>Use GPS</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Sort toggles */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-white/15 bg-black/40 p-1">
                  <button
                    type="button"
                    onClick={() => setSortByDistance(true)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs transition-[background-color,color,border-color,box-shadow,transform] ${sortByDistance
                      ? "bg-[var(--color-accent)] text-white shadow-sm font-semibold"
                      : "text-white/60 hover:text-white"
                      } `}
                  >
                    <MapPin className="h-3 w-3" />
                    <span>Closest to You</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortByDistance(false)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs transition-[background-color,color,border-color,box-shadow,transform] ${!sortByDistance
                      ? "bg-[var(--color-accent)] text-white shadow-sm font-semibold"
                      : "text-white/60 hover:text-white"
                      } `}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>By Date</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Shows Grid */}
            {displayShows.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {displayShows.slice(0, visibleShowCount).map((show: any, i: number) => {
                    const isClosest = i === 0 && sortByDistance;
                    const isNearby =
                      show.distanceMiles !== undefined &&
                      show.distanceMiles !== null &&
                      show.distanceMiles <= 25;

                    const mapsHref =
                      show.mapUrl && !show.mapUrl.includes("maps.apple.com")
                        ? show.mapUrl
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([show.venue, show.city, show.state].filter(Boolean).join(" "))}`;

                    const cardKey =
                      show._id ||
                      show.id ||
                      `${show.venue}-${show.startDate || show.date}`;

                    return (
                      <article
                        key={cardKey}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-colors hover:border-white/25 hover:bg-white/[0.04] ${isClosest
                          ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/[0.05] shadow-[0_0_25px_rgba(255,10,61,0.1)]"
                          : "border-white/10 bg-white/[0.02]"
                          } `}
                      >
                        <div>
                          {/* Top row: Distance badge + Tag / notes */}
                          <div className="mb-3 flex items-center justify-between gap-2">
                            {show.distanceMiles !== undefined &&
                              show.distanceMiles !== null ? (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isClosest
                                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                                  : isNearby
                                    ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                                    : "border border-white/15 bg-white/5 text-white/70"
                                  } `}
                              >
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span>
                                  {isClosest
                                    ? `Closest Show · ${show.distanceMiles} mi`
                                    : `${show.distanceMiles} miles away`}
                                </span>
                              </span>
                            ) : (
                              <span className="text-xs text-white/40">Tour Date</span>
                            )}
                            {show.notes && (
                              <span className="text-[11px] font-medium text-white/50 truncate max-w-[120px]">
                                {show.notes}
                              </span>
                            )}
                          </div>

                          {/* Show Date and Details */}
                          <div className="flex items-start gap-4">
                            <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-center min-w-[64px]">
                              <span className="text-xs uppercase tracking-wider text-[var(--color-accent)]">
                                {show.monthLabel}
                              </span>
                              <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                                {show.dayNumber}
                              </span>
                              {show.dayName && (
                                <span className="text-[10px] font-semibold uppercase text-white/50">
                                  {show.dayName}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-base text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                                {show.venue}
                              </h3>
                              {(show.city || show.state) && (
                                <p className="text-xs text-white/60">
                                  {show.city}
                                  {show.state ? `, ${show.state}` : ""}
                                </p>
                              )}

                              {(show.doorsTime || show.playTime || show.time) && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                  {show.playTime ? (
                                    <span className="font-semibold text-rose-400">
                                      Show: {show.playTime}
                                    </span>
                                  ) : show.time ? (
                                    <span className="text-white/80">{show.time}</span>
                                  ) : null}
                                  {show.doorsTime && (
                                    <span className="text-white/40">
                                      (Doors: {show.doorsTime})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer: Directions, Parking, Tickets */}
                        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={mapsHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white border border-white/15 bg-white/[0.04] px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <Navigation className="h-3 w-3 text-sky-400" />
                              <span>Directions</span>
                            </a>
                            {show.notes && (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setParkingNoteOpenIdx(
                                      parkingNoteOpenIdx === i ? null : i,
                                    )
                                  }
                                  className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white border border-white/15 bg-white/[0.04] px-2 py-1 rounded-lg transition-colors"
                                  title="Venue & parking notes"
                                >
                                  <span>Notes</span>
                                </button>
                                {parkingNoteOpenIdx === i && (
                                  <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-white/15 bg-[#141416] p-3 shadow-2xl backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/10">
                                      <span className="text-xs font-semibold text-white/60">
                                        Venue Info
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setParkingNoteOpenIdx(null)}
                                        className="transition-colors text-white/40 hover:text-white text-xs"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <p className="text-xs text-white/80 whitespace-pre-wrap">
                                      {show.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {show.ticketLink && !show.isSoldOut && (
                            <a
                              href={show.ticketLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:underline"
                            >
                              <span>Tickets</span>
                              <span>→</span>
                            </a>
                          )}

                          {show.isSoldOut && (
                            <span className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {displayShows.length > visibleShowCount && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleShowCount((prev) => prev + 6)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      <span>
                        Show More Nearby Dates ({displayShows.length - visibleShowCount} more)
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
                <MapPin className="h-8 w-8 text-white/20 mb-3" />
                <p className="font-semibold text-white/90">No upcoming shows found</p>
                <p className="mt-1 text-sm text-white/50">
                  Follow 7th Heaven for announcements on new tour dates!
                </p>
                <Link
                  href="/#tour"
                  className="transition-[filter] mt-4 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
                >
                  View Full Tour Schedule
                </Link>
              </div>
            )}
          </section>

          {/* Proximity Alerts & Show Alerts — 50/50 Grid */}
          <section
            id="show-alerts"
            aria-labelledby="show-alerts-heading"
            className="section"
          >
            <SectionHeader id="show-alerts-heading" title="Show & Location Alerts" visuallyHidden />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                    <div className="h-6 w-6 animate-spin border-2 border-purple-500 border-t-transparent" />
                  </div>
                ) : subscribedShows.length > 0 ? (
                  <div className="space-y-3">
                    {subscribedShows.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="transition-colors justify-between group flex items-center gap-4 border border-white/10 bg-[#00000029] p-4 hover:border-purple-500/30"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="min-w-0">
                            <p>{sub.venueName}</p>
                            <p>
                              {sub.showDate ? sub.showDate : "Upcoming Date"}
                              {sub.city ? ` · ${sub.city}, ${sub.state}` : ""}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnsubscribeShow(sub.showId)}
                          className="transition-colors cursor-pointer border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-[var(--font-size-2xs)] text-rose-400 hover:bg-rose-600"
                        >
                          Cancel Alert
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center border border-dashed border-white/10 bg-[#00000029] py-8">
                    <p>You aren&apos;t tracking any specific shows yet.</p>
                    <p>
                      Click the bell icon on the tour page to get date alerts.
                    </p>
                    <Link href="/#tour" className="transition-colors mt-3 hover:text-white">
                      Find Shows
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {!isCruiser && isCruiseBannerActive && (
            <Link href="/cruise" className="group mb-10 block">
              <div className="transition-colors relative overflow-hidden border border-white/10 p-6 hover:border-purple-500/40 md:p-8">
                <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                  <div className="flex items-start gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-lg border border-white/10 px-2.5 py-1 text-purple-400">
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
                  <span className="transition-colors shrink-0 bg-cyan-500 px-6 py-3 text-[#0a0a0f] shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:bg-cyan-400">
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
              aria-labelledby="live-alert-optin-heading"
              className="section relative"
            >
              <SectionHeader id="live-alert-optin-heading" title="Live Alert SMS Subscription" visuallyHidden />
              <div className="relative">
                <div className="relative z-10">
                  <SectionHeader
                    as="h3"
                    title="Never Miss a Live Feed"
                    subtitle="Get a text the moment 7th Heaven goes live — backstage content, surprise streams, live Q&As, and more."
                    divider={false}
                  />

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
                        className="transition-colors ml-auto cursor-pointer text-white/40 hover:text-red-400"
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
                        className="w-full shrink-0 cursor-pointer justify-center text-center whitespace-nowrap sm:w-auto"
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
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Column */}
            <div className="space-y-0 lg:col-span-2">
              {/* Tour Memories Gallery & Upload */}
              <section
                id="tour-memories"
                aria-labelledby="tour-memories-heading"
                className="section"
              >
                <SectionHeader id="tour-memories-heading" title="Tour Memories Gallery" visuallyHidden />
                <div className="space-y-6">
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
                            className={`group relative aspect-square overflow-hidden border ${photo.rejected ? "border-red-500/40" : "border-black/10"} `}
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
                              <div className="absolute inset-0 z-20 flex flex-col justify-between bg-red-950/80 p-3.5 text-left">
                                <div>
                                  <p className="flex items-center gap-1 text-red-400">
                                    <span>⚠️</span> Declined
                                  </p>
                                  <div className="rounded border border-red-500/10 bg-red-900/20 p-2">
                                    <p className="line-clamp-4 leading-normal text-red-100/90">
                                      {photo.rejection_reason ||
                                        "Content does not meet community guidelines."}
                                    </p>
                                  </div>
                                </div>
                                <p className="mt-auto text-black/30">
                                  {photo.venue || "Live Event"}
                                </p>
                              </div>
                            ) : (
                              /* Hover overlay for approved/pending */
                              <div className="transition-opacity absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 opacity-0 group-hover:opacity-100">
                                <p>{photo.venue || "Live Event"}</p>
                                <p
                                  className={`mt-0.5 ${photo.approved ? "text-emerald-400" : " "} `}
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
                </div>
              </section>
            </div>

            {/* Right Column / Sidebar */}
            <div className="space-y-8">
              {/* VIP Inbox */}
              <aside id="vip-inbox" className="flex flex-col justify-between">
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
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
                      <span className="animate-pulse border border-white/10 bg-purple-500/10 px-3 py-1 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        {inboxMessages.filter((m) => m.isNew).length} New
                      </span>
                    )}
                  </div>
                </div>

                <div className="scrollbar-hide max-h-[300px] space-y-4 overflow-y-auto">
                  {inboxMessages.map((msg) => (
                    <div
                      key={msg.id || msg.title}
                      className={`group -mx-3 cursor-pointer border border-transparent border-white/10 bg-[#00000029] p-3 ${msg.isNew ? "bg-white/[0.02]" : "opacity-60"} `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 ${msg.color === "yellow" ? "border-yellow-500/30 bg-yellow-500/20" : "border-emerald-500/30 bg-emerald-500/20"} flex shrink-0 items-center justify-center`}
                        >
                          <span>{msg.icon}</span>
                        </div>
                        <div>
                          <p
                            className={` ${msg.color === "yellow" ? "group-hover:text-yellow-400" : "group-hover:text-blue-400"} `}
                          >
                            {msg.title}
                          </p>
                          <p>{msg.desc}</p>
                          <p
                            className={`mt-2 ${msg.isNew ? "text-[var(--color-accent)]" : "text-white/40"} `}
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
              aria-labelledby="merch-quick-shop-heading"
              className="section"
            >
              <SectionHeader id="merch-quick-shop-heading" title="Merch Quick Shop" visuallyHidden />
              <div className="mt-8">
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-fuchsia-400">
                    🛍️ Quick Shop
                  </span>
                  <Link href="/merch" className="text-white/40">
                    Full Store
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {merch.map((item: any) => (
                    <article
                      key={item.id}
                      className="transition-colors group overflow-hidden border border-white/10 bg-[#00000029] hover:border-fuchsia-500/30"
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
                        <p>{item.title}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-fuchsia-400">
                            ${parseFloat(item.price).toFixed(0)}
                          </span>
                          <Link
                            href={`/merch`}
                            className="transition-colors rounded border border-white/10 bg-white/10 px-3 py-1.5 hover:border-fuchsia-500 hover:bg-fuchsia-500"
                          >
                            Buy Now
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
