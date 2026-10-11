/* eslint-disable react-doctor/no-giant-component, react-doctor/no-high-complexity-react-function, react-doctor/iframe-missing-sandbox, react-doctor/prefer-html-dialog */
"use client";

import Image from "next/image";

import {
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useMember } from "@/context/MemberContext";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Toggle } from "@/components/Toggle";
import SeventhButton from "@/components/SeventhButton";
import InputField from "@/components/InputField";
import QRCode from "react-qr-code";
import { SectionBadge } from "@/components/SectionBadge";
import { DotChevronRight } from "@/components/ui/DotArrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import SectionHeader from "@/components/SectionHeader";
import { useScrollLock } from "@/lib/useScrollLock";
import { X, Play, Camera, Upload } from "lucide-react";

export interface RelatedShow {
  id: string;
  venue_name: string;
  city: string;
  state: string;
  date: string;
  time?: string | null;
}

export interface VenueMediaItem {
  id: string;
  src: string;
  type?: "image" | "video";
  youtubeId?: string;
  name: string;
  caption?: string;
  date?: string;
  venue?: string;
  city?: string;
  instagram?: string;
  isUserUploaded?: boolean;
}

export interface PastVenueShow {
  date: string;
  raw: string;
  year?: string;
}

interface Attendee {
  id: string;
  status: string;
  anonymous: boolean;
  checked_in_at: string | null;
  profiles: {
    id: string;
    full_name: string;
    profile_photo_url: string | null;
    tier: string;
  };
}

interface LiveFeed {
  room: string;
  title: string;
  viewers: number;
  host: string;
}

interface Show {
  id: string;
  venue_name: string;
  city: string;
  state: string;
  date: string;
  time: string;
  doors_time: string | null;
  all_ages: boolean | null;
  cover: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
}

const tierColors: Record<string, string> = {
  Bronze: "border-purple-700/40  text-[var(--color-accent)]",
  Silver: "border-slate-400/40 text-slate-300",
  Gold: "border-yellow-500/40 text-yellow-400",
  Platinum: "border-purple-500/40  text-[var(--color-accent)]",
};
const tierGlow: Record<string, string> = {
  Gold: "shadow-[0_0_12px_rgba(234,179,8,0.2)]",
  Platinum: "shadow-[0_0_12px_rgba(255,10,61,0.2)]",
};

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatShowBadge(dateStr: string) {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const month = MONTH_NAMES[m] || "TBD";
    const day = String(d);
    const dateObj = new Date(Date.UTC(y, m, d, 12, 0, 0));
    const weekday = WEEKDAYS[dateObj.getUTCDay()] || "";
    return { month, day, weekday };
  }
  return { month: "TBD", day: "", weekday: "" };
}

const EMPTY_RELATED_SHOWS: RelatedShow[] = [];
const EMPTY_VENUE_MEDIA: VenueMediaItem[] = [];
const EMPTY_PAST_SHOWS: PastVenueShow[] = [];

export default function ShowPageClient({
  show,
  initialAttendees,
  relatedShows = EMPTY_RELATED_SHOWS,
  defaultImage = "/images/tour/fan-concert-photo.jpg",
  venueMedia = EMPTY_VENUE_MEDIA,
  pastVenueShows = EMPTY_PAST_SHOWS,
}: {
  show: Show;
  initialAttendees: Attendee[];
  relatedShows?: RelatedShow[];
  defaultImage?: string;
  venueMedia?: VenueMediaItem[];
  pastVenueShows?: PastVenueShow[];
}) {
  const { member, isLoggedIn, openModal } = useMember();
  const supabase = createClient();

  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [attendeeListOpen, setAttendeeListOpen] = useState(false);
  const [goingFilter, setGoingFilter] = useState<"all" | "going" | "there">(
    "all",
  );
  const [wantAnonymous, setWantAnonymous] = useState(false);
  const [liveFeeds, setLiveFeeds] = useState<LiveFeed[]>([]);
  const autoRsvpDoneRef = useRef(false);

  // ── Show Media & Upload States ──────────────────────────────────
  const [uploadedPhotos, setUploadedPhotos] = useState<VenueMediaItem[]>([]);
  const [activeHeroImage, setActiveHeroImage] = useState<string>(defaultImage);
  const [heroImageCaption, setHeroImageCaption] = useState<string>("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [videoModalId, setVideoModalId] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Upload Form States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState(() => member?.name || "");
  const [uploaderCaption, setUploaderCaption] = useState("");
  const [uploaderInstagram, setUploaderInstagram] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useScrollLock(uploadModalOpen || !!videoModalId);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(`7h_show_photos_v1_${show.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUploadedPhotos(parsed);
          setActiveHeroImage(parsed[0].src);
          if (parsed[0].caption) {
            setHeroImageCaption(parsed[0].caption);
          }
        }
      }
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUploadModalOpen(false);
        setVideoModalId(null);
      }
    };
    if (uploadModalOpen || !!videoModalId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [uploadModalOpen, videoModalId]);

  const allMedia = useMemo(() => {
    const existingIds = new Set<string>();
    const list: VenueMediaItem[] = [];

    for (const item of uploadedPhotos) {
      if (!existingIds.has(item.id)) {
        existingIds.add(item.id);
        list.push(item);
      }
    }

    for (const item of venueMedia) {
      if (!existingIds.has(item.id)) {
        existingIds.add(item.id);
        list.push(item);
      }
    }

    return list;
  }, [uploadedPhotos, venueMedia]);

  const handleFileSelect = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select a photo to upload.");
      return;
    }
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);
      const name = uploaderName.trim() || member?.name || "7th Heaven Fan";
      formData.append("name", name);
      formData.append("venue", show.venue_name);
      formData.append("date", show.date || "2026");
      if (uploaderCaption.trim()) {
        formData.append("caption", uploaderCaption.trim());
      }

      const res = await fetch("/api/fans", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed. Please try again.");
      }

      const data = await res.json().catch(() => ({}));
      const serverPhoto = data.photos?.[0];

      const newMediaItem: VenueMediaItem = {
        id: serverPhoto?.id || `user_up_${Date.now()}`,
        src: serverPhoto?.src || previewUrl || defaultImage,
        type: "image",
        name,
        caption: uploaderCaption.trim() || `Concert snapshot at ${show.venue_name}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        venue: show.venue_name,
        city: show.city,
        instagram: uploaderInstagram.trim() || undefined,
        isUserUploaded: true,
      };

      const updated = [newMediaItem, ...uploadedPhotos];
      try {
        localStorage.setItem(
          `7h_show_photos_v1_${show.id}`,
          JSON.stringify(updated.slice(0, 10)),
        );
      } catch {}

      setUploadedPhotos(updated);
      setActiveHeroImage(newMediaItem.src);
      setHeroImageCaption(newMediaItem.caption || "");

      setUploadSuccessMessage("Photo uploaded successfully! It is now featured on this show page.");
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploaderCaption("");

      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccessMessage(null);
      }, 1600);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  // ── Notify Me Next Time States ──────────────────────────────────
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyError, setNotifyError] = useState("");

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    setNotifyLoading(true);
    setNotifyError("");
    try {
      const res = await fetch("/api/shows/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: show.id,
          email: notifyEmail,
          venueName: show.venue_name,
        }),
      });
      if (res.ok) {
        setNotifySuccess(true);
        setNotifyEmail("");
      } else {
        const data = await res.json();
        setNotifyError(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setNotifyError("Network error. Please try again.");
    } finally {
      setNotifyLoading(false);
    }
  };

  // ── Auto-RSVP from ?rsvp=going|there SMS link ──────────────────
  const handleAutoRsvp = useCallback(
    async (rsvpParam: string) => {
      try {
        await fetch("/api/proximity/attendees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showId: show.id,
            status: rsvpParam,
            anonymous: false,
          }),
        });
        const r = await fetch(`/api/proximity/attendees?showId=${show.id}`);
        if (r.ok) {
          const d = await r.json();
          setAttendees(d.attendees || []);
          setAttendeeListOpen(true);
        }
      } catch { }
    },
    [show.id],
  );

  useEffect(() => {
    if (autoRsvpDoneRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const rsvpParam = params.get("rsvp");
    if (rsvpParam !== "going" && rsvpParam !== "there") return;

    if (isLoggedIn) {
      autoRsvpDoneRef.current = true;
      handleAutoRsvp(rsvpParam);
    } else {
      openModal("login");
    }
  }, [isLoggedIn, show.id, openModal, handleAutoRsvp]);

  const myAttendee = attendees.find((a) => a.profiles?.id === member?.id);
  const isGoing = !!myAttendee;
  const goingCount = attendees.filter((a) => a.status === "going").length;
  const thereCount = attendees.filter((a) => a.status === "there").length;
  const totalCount = goingCount + thereCount;

  const showDate = new Date(show.date + "T12:00:00Z");
  const isPast = showDate < new Date();
  const dateStr = showDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const mapsUrl =
    show.latitude && show.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${show.latitude},${show.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue_name} ${show.city} ${show.state}`)}`;

  // shareUrl: use a safe default on SSR, update to real URL after hydration
  const shareUrl = useSyncExternalStore(
    () => () => { },
    () => window.location.href,
    () => `https://7thheavenband.com/shows/${show.id}`,
  );

  // ── Live feed polling ────────────────────────────────────────────
  const checkLiveFeeds = useCallback(async () => {
    try {
      const feeds: LiveFeed[] = [];
      const seenRooms = new Set<string>();

      // Get active LiveKit rooms
      const activeLkRooms = new Set<string>();
      try {
        const res = await fetch("/api/live-rooms");
        if (res.ok) {
          const data = await res.json();
          if (data.rooms?.length)
            data.rooms.forEach((r: { name: string }) =>
              activeLkRooms.add(r.name),
            );
        }
      } catch { }

      // Check Supabase live_streams
      try {
        const { data: streams } = await supabase
          .from("live_streams")
          .select("*")
          .eq("status", "live");
        if (streams?.length) {
          for (const st of streams) {
            const roomName = st.stream_url || `live_${st.user_id}`;
            if (activeLkRooms.has(roomName) && !seenRooms.has(roomName)) {
              seenRooms.add(roomName);
              feeds.push({
                room: roomName,
                title: st.title || "Crew Broadcast",
                viewers: st.viewer_count || 0,
                host: st.title?.split(" — ")[0] || "Crew",
              });
            }
          }
        }
      } catch { }

      // Fallback: raw LiveKit rooms not matched in Supabase
      activeLkRooms.forEach((roomName) => {
        if (!seenRooms.has(roomName)) {
          seenRooms.add(roomName);
          const hostName = roomName
            .replace(/^live_/, "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          feeds.push({
            room: roomName,
            title: "Crew Broadcast",
            viewers: 0,
            host: hostName,
          });
        }
      });

      setLiveFeeds(feeds);
    } catch { }
  }, [supabase]);

  useEffect(() => {
    checkLiveFeeds();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") checkLiveFeeds();
    }, 60000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkLiveFeeds();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [checkLiveFeeds]);

  // ── RSVP ────────────────────────────────────────────────────────
  const handleRsvp = async () => {
    if (!isLoggedIn) {
      openModal("login");
      return;
    }
    setRsvpLoading(true);
    try {
      if (isGoing) {
        await fetch(`/api/proximity/attendees?showId=${show.id}`, {
          method: "DELETE",
        });
        setAttendees((prev) =>
          prev.filter((a) => a.profiles?.id !== member?.id),
        );
      } else {
        await fetch("/api/proximity/attendees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showId: show.id,
            status: "going",
            anonymous: wantAnonymous,
          }),
        });
        const res = await fetch(`/api/proximity/attendees?showId=${show.id}`);
        if (res.ok) {
          const data = await res.json();
          setAttendees(data.attendees || []);
          setAttendeeListOpen(true);
        }
      }
    } finally {
      setRsvpLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Filtered attendee list ───────────────────────────────────────
  const filteredAttendees = attendees.filter((a) =>
    goingFilter === "all" ? true : a.status === goingFilter,
  );

  const renderAttendee = (a: Attendee) => {
    const isMe = a.profiles?.id === member?.id;
    const isAnon = a.anonymous && !isMe;
    const tier = a.profiles?.tier || "Bronze";
    const initials = isAnon
      ? "?"
      : a.profiles?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    return (
      <div
        key={a.id}
        className={`flex items-center gap-4 border p-4 ${a.status === "there"
          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
          : isMe
            ? "border-purple-500/40 bg-purple-500/5"
            : `border-white/10 border-white/[0.06] bg-white/[0.02] ${tierGlow[tier] || ""}`
          }`}
      >
        {/* Avatar */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center border-2 ${isAnon ? "border-white/10 text-white/30" : tierColors[tier] || "border-white/10"} bg-white/[0.04]`}
        >
          {!isAnon && a.profiles?.profile_photo_url ? (
            <Image
              width={200}
              height={200}
              unoptimized
              src={a.profiles.profile_photo_url}
              alt="7th Heaven Media"
              className="h-full w-full object-cover"
            />
          ) : isAnon ? (
            "👤"
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p>
            {isAnon ? "Anonymous Fan" : a.profiles?.full_name || "Fan"}
            {isMe && (
              <span className="ml-2 text-[var(--color-accent)] text-[var(--font-size-2xs)]">
                You
              </span>
            )}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            {!isAnon && tier !== "Bronze" && (
              <span
                className={`text-[var(--font-size-2xs)] ${tierColors[tier]?.split(" ")[1] || "text-white/30"}`}
              >
                {tier}
              </span>
            )}
            {a.status === "there" ? (
              <span className="text-[var(--color-accent)] text-[var(--font-size-2xs)]">
                ✓ Here Now
              </span>
            ) : (
              <span className="text-[var(--font-size-2xs)]">Going</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main
      className="min-h-screen bg-[#050505] pt-[123px]"
      id="show-details-page"
    >
      {/* ── LIVE FEED BANNER ─────────────────────────────────────── */}
      {liveFeeds.length > 0 && (
        <div className="border-b border-red-500/20 bg-gradient-to-r from-red-950/60 via-red-900/40 to-red-950/60">
          <div className="site-container py-3">
            {liveFeeds.map((feed) => (
              <Link
                key={feed.room}
                href={`/live/${feed.room}`}
                className="group flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  </span>
                  <span>
                    🎥 {feed.host} is LIVE from the show
                    {feed.title && feed.title !== "Crew Broadcast"
                      ? ` — ${feed.title}`
                      : ""}
                  </span>
                  {feed.viewers > 0 && (
                    <span className="text-red-300/70">
                      {feed.viewers} watching
                    </span>
                  )}
                </div>
                <span className="transition-colors shrink-0 bg-red-500 px-4 py-1.5 group-hover:bg-white group-hover:text-red-600">
                  Watch Now →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0d0718] to-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,10,61,0.2)_0%,_transparent_60%)]" />
        <div className="site-container relative z-10 py-14 md:py-20">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Breadcrumbs
              id={`show-breadcrumbs-${show.id}`}
              className="mb-0 py-0"
              items={[
                { name: "Home", href: "/" },
                { name: "Tour Dates", href: "/#tour" },
                { name: `${show.venue_name}${show.city ? ` (${show.city})` : ""}` },
              ]}
            />
            <Link
              href="/#tour"
              className="transition-colors inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
            >
              ← All Shows
            </Link>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {/* Status badge */}
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {isPast ? (
                  <SectionBadge label="Past Show" />
                ) : show.status === "live" ? (
                  <SectionBadge className="gap-2 border-purple-500/40">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span>HAPPENING NOW</span>
                  </SectionBadge>
                ) : (
                  <SectionBadge label="Upcoming Show" isActive />
                )}
              </div>

              <div className="title-group title-group--page">
                <h1>{show.venue_name}</h1>
                <p>
                  {show.city}
                  {show.state ? `, ${show.state}` : ""}
                </p>
                <p>{dateStr}</p>
              </div>

              {/* Detail pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {show.doors_time && (
                  <span className="flex items-center gap-1.5 border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    🚪 Doors {show.doors_time}
                  </span>
                )}
                {show.time && (
                  <span className="flex items-center gap-1.5 border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    🎸 Show {show.time}
                  </span>
                )}
                {show.all_ages !== null && (
                  <span
                    className={`flex items-center gap-1.5 border px-3 py-1.5 ${show.all_ages ? "border-emerald-500/30 bg-emerald-500/10 text-[var(--color-accent)]" : "border-purple-500/30 bg-purple-600/10"}`}
                  >
                    {show.all_ages ? "✅ All Ages" : "🔞 21+"}
                  </span>
                )}
                {show.cover && (
                  <span className="flex items-center gap-1.5 border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    💵 Cover: {show.cover}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {!isPast && (
                  <>
                    {isGoing ? (
                      <button
                        onClick={handleRsvp}
                        disabled={rsvpLoading}
                        id="rsvp-btn"
                        className="transition-colors cursor-pointer border border-white/10 bg-white/10 px-8 py-3.5 hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                      >
                        {rsvpLoading ? "…" : "✓ Going (tap to cancel)"}
                      </button>
                    ) : (
                      <SeventhButton
                        onClick={handleRsvp}
                        disabled={rsvpLoading}
                        icon={false}
                        id="rsvp-btn"
                        className="disabled:opacity-50"
                      >
                        {rsvpLoading ? "…" : "🎸 I'm Going"}
                      </SeventhButton>
                    )}

                    {/* Anonymous toggle — only before RSVP */}
                    {!isGoing && isLoggedIn && (
                      <div className="flex items-center gap-2 border border-white/10 bg-[#00000029] px-3 py-1.5">
                        <Toggle
                          id="show-anonymous-toggle"
                          label="Go anonymously"
                          checked={wantAnonymous}
                          onChange={setWantAnonymous}
                        />
                      </div>
                    )}
                  </>
                )}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="directions-btn"
                  className="transition-colors border border-white/10 px-6 py-3 text-center text-xs hover:border-white/30 hover:text-white"
                >
                  📍 Directions
                </a>
                <button
                  onClick={copyLink}
                  id="share-show-btn"
                  className="transition-colors border border-white/10 px-6 py-3 text-xs hover:border-white/30 hover:text-white"
                >
                  {copied ? "✓ Copied!" : "🔗 Share"}
                </button>
                <SeventhButton
                  onClick={() => setUploadModalOpen(true)}
                  icon={false}
                  id="hero-upload-photo-btn"
                  className="text-xs"
                >
                  📸 Upload Photo
                </SeventhButton>
              </div>
            </div>

            {/* Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-box)] border border-white/15 bg-white/[0.03] shadow-2xl transition-all duration-300 hover:border-[var(--color-accent)]/50">
                <Image
                  src={activeHeroImage}
                  alt={`${show.venue_name} Concert Preview`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

                {/* Top Badge & Action */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                    {uploadedPhotos.length > 0 ? "✨ Fan Photo Featured" : `📍 ${show.venue_name}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 hover:text-white"
                    aria-label="Upload a photo from this show"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Upload Photo</span>
                  </button>
                </div>

                {/* Bottom Caption & Credit */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-semibold text-white drop-shadow-md">
                    {heroImageCaption || `${show.venue_name} • ${show.city || "Live Performance"}${show.state ? `, ${show.state}` : ""}`}
                  </p>
                  <p className="mt-0.5 text-xs text-white/70">
                    {uploadedPhotos.length > 0
                      ? `Shared by ${uploadedPhotos[0].name}`
                      : venueMedia.length > 0 && venueMedia[0].name
                        ? `Photo courtesy of ${venueMedia[0].name}`
                        : "Official Concert Archive"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ATTENDANCE SECTION ────────────────────────────────────── */}
      <div className="site-container py-14">
        <div className="mx-auto max-w-[900px]">
          {/* Past Show - Notify Me & Video Embed */}
          {isPast && (
            <div className="mb-12 grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
              {/* Notify Me Column */}
              <div className="group relative flex flex-col justify-between overflow-hidden border border-white/10 bg-[var(--color-bg-surface)] p-6">
                <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 bg-[var(--color-accent)]/5 blur-3xl" />
                <div>
                  <span className="mb-6 inline-flex items-center gap-1.5 border border-white/10 bg-purple-500/10 px-3 py-1 text-[var(--font-size-2xs)]">
                    Missed this show?
                  </span>
                  <h3 className="mb-2">Notify Me Next Time</h3>
                  <p className="mb-6">
                    Enter your email to receive priority alerts when 7th Heaven
                    schedules a new tour date at{" "}
                    <strong>{show.venue_name}</strong>.
                  </p>
                </div>
                <div>
                  {notifySuccess ? (
                    <div className="rounded-[var(--radius-box)] border border-white/10 bg-emerald-500/10 p-4 text-center">
                      <p className="text-emerald-400">
                        ✓ Successfully subscribed!
                      </p>
                      <p>We will alert you when new dates are announced.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleNotifyMe} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <InputField
                          type="email"
                          required
                          placeholder="yourname@domain.com"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          containerClassName="flex-1"
                          glow={true}
                          inputClassName="bg-black/40 border border-white/10 px-4 py-3 placeholder:text-white/40 text-white outline-none rounded-xl"
                        />
                        <SeventhButton
                          type="submit"
                          disabled={notifyLoading}
                          icon={false}
                          className="shrink-0 disabled:opacity-50"
                        >
                          {notifyLoading ? "Submitting..." : "Keep Me Posted"}
                        </SeventhButton>
                      </div>
                      {notifyError && (
                        <p className="rounded-[var(--radius-box)] border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-rose-400">
                          {notifyError}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>

              {/* Video Embed Column */}
              <div className="group relative flex flex-col justify-between overflow-hidden border border-white/10 bg-[var(--color-bg-surface)] p-6">
                <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 bg-red-500/5 blur-3xl" />
                <div>
                  <span className="mb-6 inline-flex items-center gap-1.5 border border-red-500/20 bg-red-500/10 px-3 py-1 text-[var(--font-size-2xs)] text-red-400">
                    Live Performance
                  </span>
                  <h3 className="mb-3">Live Show Clips</h3>
                </div>
                <div className="aspect-video w-full overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/Dnic7xeXrQo?autoplay=0&rel=0&modestbranding=1"
                    title="7th Heaven Live Performance Video"
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {/* Clickable count summary */}
          <button
            id="attendee-toggle-btn"
            onClick={() => setAttendeeListOpen(!attendeeListOpen)}
            className="group mb-1 flex w-full cursor-pointer items-center justify-between border border-white/10 border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex items-center gap-6">
              <div className="text-left">
                <p className="mb-1">Fans Going</p>
                <p>{goingCount}</p>
              </div>
              {thereCount > 0 && (
                <>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-left">
                    <p className="mb-1 text-[var(--color-accent)]/60">
                      Here Now
                    </p>
                    <p>{thereCount}</p>
                  </div>
                </>
              )}
              {totalCount === 0 && <p>Be the first to RSVP!</p>}
            </div>
            <div className="flex items-center gap-3">
              {!isLoggedIn && (
                <span className="border border-purple-500/30 bg-purple-500/5 px-3 py-1">
                  Login to RSVP
                </span>
              )}
              <span
                className={`text-xl text-white/40 ${attendeeListOpen ? "rotate-180" : ""}`}
              >
                ↓
              </span>
            </div>
          </button>

          {/* Expandable attendee list */}
          {attendeeListOpen && (
            <div className="border border-t-0 border-white/[0.06] bg-white/[0.01] p-6">
              {/* Filter tabs */}
              {totalCount > 0 && (
                <div className="mb-6 flex w-fit items-center gap-1 border border-white/10 bg-white/[0.03] p-1">
                  {(["all", "going", "there"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setGoingFilter(f)}
                      className={`cursor-pointer px-4 py-1.5 ${goingFilter === f ? "bg-white/10" : "text-white/30"}`}
                    >
                      {f === "all"
                        ? `All (${totalCount})`
                        : f === "going"
                          ? `Going (${goingCount})`
                          : `Here Now (${thereCount})`}
                    </button>
                  ))}
                </div>
              )}

              {totalCount === 0 ? (
                <div className="flex flex-col items-center py-16">
                  <span className="mb-6 text-5xl opacity-20">🎸</span>
                  <p>Nobody&apos;s RSVPed yet.</p>
                  <p className="mt-2">
                    Be the first — hit &ldquo;I&apos;m Going&rdquo; above!
                  </p>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <p className="py-8 text-center">
                  No fans in this category yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredAttendees.map(renderAttendee)}
                </div>
              )}

              {/* Anonymous note */}
              <p className="mt-4 text-center">
                Fans who chose to go anonymously appear as &ldquo;Anonymous
                Fan&rdquo;
              </p>
            </div>
          )}

          {/* Share CTA */}
          {!isPast && (
            <div className="border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <p className="mb-1">Know someone who might be going?</p>
              <p className="mb-6">Share this show page</p>

              {/* QR Code */}
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3 inline-block bg-white p-4 shadow-[0_0_40px_rgba(255,10,61,0.25)]">
                  <QRCode
                    value={shareUrl}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#0a0a0a"
                    level="M"
                  />
                </div>
                <p>Scan to open the show page</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <SeventhButton
                  onClick={copyLink}
                  icon={false}
                >
                  {copied ? "✓ Link Copied!" : "🔗 Copy Link"}
                </SeventhButton>
                <SeventhButton
                  href={`sms:?body=${encodeURIComponent(`7th Heaven is playing at ${show.venue_name} in ${show.city}! I'm going — see who else is: ${shareUrl}`)}`}
                  icon={false}
                >
                  💬 Text a Friend
                </SeventhButton>
              </div>
            </div>
          )}

          {/* ── VENUE MEDIA & MEMORIES SECTION ────────────────────────── */}
          <section
            id="venue-media"
            aria-labelledby="venue-media-heading"
            className="mt-12 border-t border-white/10 pt-10"
          >
            <div className="mb-8">
              <SectionHeader
                id="venue-media-heading"
                badge="Venue Media & Memories"
                title={`Photos & Videos from ${show.venue_name}`}
                subtitle={`Concert memories, fan snapshots, and live footage from 7th Heaven performances at ${show.venue_name}${show.city ? ` in ${show.city}` : ""}.`}
                action={
                  <SeventhButton
                    onClick={() => setUploadModalOpen(true)}
                    icon={false}
                    className="text-xs"
                  >
                    📸 Upload Photo
                  </SeventhButton>
                }
              />
            </div>

            {/* Media Items Grid */}
            {allMedia.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allMedia.map((item) => {
                  const isVideo = item.type === "video" || !!item.youtubeId;
                  const posterUrl =
                    isVideo && item.youtubeId
                      ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`
                      : item.src;

                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] transition-all hover:border-[var(--color-accent)]/40 hover:bg-white/[0.06] hover:shadow-[0_0_25px_rgba(255,10,61,0.15)]"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <Image
                          src={posterUrl}
                          alt={item.caption || item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                        {isVideo ? (
                          <button
                            type="button"
                            onClick={() => setVideoModalId(item.youtubeId || null)}
                            className="cursor-pointer absolute inset-0 flex items-center justify-center"
                            aria-label={`Play video clip by ${item.name}`}
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg transition-transform group-hover:scale-110">
                              <Play className="h-5 w-5 fill-white translate-x-0.5" />
                            </div>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveHeroImage(item.src);
                              if (item.caption) setHeroImageCaption(item.caption);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="cursor-pointer absolute inset-0"
                            aria-label={`Feature photo by ${item.name} in hero`}
                          />
                        )}

                        <div className="absolute top-3 left-3">
                          <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
                            {isVideo
                              ? "🎬 Live Video"
                              : item.isUserUploaded
                                ? "✨ Fan Upload"
                                : "📸 Venue Photo"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold text-white">
                              {item.name}
                            </h3>
                            {item.date && (
                              <span className="text-[11px] text-white/50">
                                {item.date}
                              </span>
                            )}
                          </div>
                          {item.caption && (
                            <p className="mt-1.5 text-xs text-white/70 line-clamp-2">
                              {item.caption}
                            </p>
                          )}
                        </div>

                        {item.instagram && (
                          <p className="mt-3 text-[11px] text-[var(--color-accent)]">
                            {item.instagram}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[var(--radius-box)] border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-2xl">
                  📸
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Be the First to Share a Photo from {show.venue_name}!
                </h3>
                <p className="mx-auto mb-6 max-w-md text-xs text-white/60">
                  Are you attending this show or have memories from past 7th
                  Heaven performances at this venue? Share your photos with the band and fans!
                </p>
                <SeventhButton
                  onClick={() => setUploadModalOpen(true)}
                  icon={false}
                >
                  Upload First Photo
                </SeventhButton>
              </div>
            )}

            {/* Past shows timeline at this venue */}
            {pastVenueShows.length > 0 && (
              <div className="mt-12 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
                <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <span>🗓️</span> 7th Heaven Concert History at {show.venue_name}
                    </h3>
                    <p className="text-xs text-white/60">
                      7th Heaven has rocked {show.venue_name} across multiple Midwest tour runs.
                    </p>
                  </div>
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
                    {pastVenueShows.length} Past Appearance{pastVenueShows.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {pastVenueShows.map((ps) => (
                    <div
                      key={`${ps.year || "tour"}-${ps.date}`}
                      className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <span className="text-[11px] font-bold text-[var(--color-accent)]">
                        {ps.year || "Past Tour"}
                      </span>
                      <p className="mt-1 text-sm font-semibold text-white">{ps.date}</p>
                      <p className="mt-0.5 text-xs text-white/50 truncate">
                        {ps.raw.replace(/^[^-]+-\s*/, "") || show.venue_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── RELATED SHOWS SECTION ────────────────────────────────── */}
          {relatedShows && relatedShows.length > 0 && (
            <section
              id="related-shows"
              aria-labelledby="related-shows-heading"
              className="mt-12 border-t border-white/10 pt-10"
            >
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="title-group title-group--section">
                  <h2 id="related-shows-heading" className="flex items-center gap-2">
                    <span className="text-[var(--color-accent)]">🎸</span>
                    {show.city ? `More Shows in & Near ${show.city}` : "Related Tour Dates"}
                  </h2>
                  <p>
                    Catch 7th Heaven live at other upcoming Midwest concerts and festivals.
                  </p>
                </div>
                <Link
                  href="/#tour"
                  className="transition-colors hidden items-center gap-1.5 text-xs text-white/50 hover:text-white sm:inline-flex"
                >
                  View Full Schedule <DotChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedShows.map((rel) => {
                  const { month, day, weekday } = formatShowBadge(rel.date);

                  return (
                    <Link
                      key={rel.id}
                      href={`/shows/${rel.id}`}
                      className="group flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-[var(--color-accent)]/50 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(255,10,61,0.15)]"
                    >
                      <div>
                        {/* Date badge */}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-accent)]">
                            {month} {day} &bull; {weekday}
                          </span>
                          {rel.time && (
                            <span className="text-xs text-white/50">{rel.time}</span>
                          )}
                        </div>

                        <h3 className="mb-1 text-base font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                          {rel.venue_name}
                        </h3>

                        <p className="text-xs text-white/60">
                          {rel.city}{rel.state ? `, ${rel.state}` : ""}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50 group-hover:text-white transition-colors">
                        <span>Show Details</span>
                        <DotChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 text-center sm:hidden">
                <Link
                  href="/#tour"
                  className="transition-colors inline-flex items-center gap-1 text-xs text-[var(--color-accent)]"
                >
                  View Full Schedule <DotChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── UPLOAD MODAL ──────────────────────────────────────────── */}
      {mounted &&
        uploadModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setUploadModalOpen(false);
              }
            }}
          >
            <div className="relative w-full max-w-lg overflow-hidden rounded-[var(--radius-box)] border border-white/15 bg-[#0e0e12] p-6 shadow-2xl sm:p-8">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="cursor-pointer absolute top-5 right-5 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-[var(--color-accent)]">
                  📸 Concert Memories
                </span>
                <h2
                  id="upload-modal-title"
                  className="mt-2 text-xl font-bold text-white"
                >
                  Upload Show Photo
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  Share your photo from {show.venue_name}
                  {show.city ? ` in ${show.city}` : ""} with 7th Heaven fans!
                </p>
              </div>

              {uploadSuccessMessage ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                  <p className="text-base font-semibold text-emerald-400">
                    ✓ Upload Complete!
                  </p>
                  <p className="mt-2 text-xs text-white/70">
                    {uploadSuccessMessage}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleUploadSubmit}
                  className="flex flex-col gap-4"
                >
                  {/* File Dropzone */}
                  <div>
                    <label
                      htmlFor="photo-upload-input"
                      className="block mb-2 text-xs font-semibold text-white/80"
                    >
                      Select Photo{" "}
                      <span className="text-[var(--color-accent)]">*</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileSelect(e.target.files?.[0] || null)
                      }
                      className="sr-only"
                    />

                    {previewUrl ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/15 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt="Upload preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleFileSelect(null)}
                          className="cursor-pointer absolute top-3 right-3 rounded-full bg-black/70 p-1.5 text-white/80 backdrop-blur-md hover:bg-black hover:text-white"
                          aria-label="Remove selected image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        className="cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/[0.02] p-8 text-center transition-colors hover:border-[var(--color-accent)]/60 hover:bg-white/[0.04]"
                      >
                        <Upload className="mb-2 h-8 w-8 text-white/40" />
                        <p className="text-sm font-semibold text-white">
                          Click or drag a photo here
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="uploader-name"
                      className="block mb-1.5 text-xs font-semibold text-white/80"
                    >
                      Your Name
                    </label>
                    <InputField
                      id="uploader-name"
                      type="text"
                      placeholder="e.g. Sarah M."
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                      inputClassName="bg-black/40 border border-white/10 px-4 py-2.5 placeholder:text-white/40 text-white outline-none rounded-xl w-full text-xs"
                    />
                  </div>

                  {/* Caption */}
                  <div>
                    <label
                      htmlFor="uploader-caption"
                      className="block mb-1.5 text-xs font-semibold text-white/80"
                    >
                      Caption or Memory
                    </label>
                    <InputField
                      id="uploader-caption"
                      type="text"
                      placeholder="e.g. Front row at Station 34! Best setlist ever!"
                      value={uploaderCaption}
                      onChange={(e) => setUploaderCaption(e.target.value)}
                      inputClassName="bg-black/40 border border-white/10 px-4 py-2.5 placeholder:text-white/40 text-white outline-none rounded-xl w-full text-xs"
                    />
                  </div>

                  {/* Instagram (optional) */}
                  <div>
                    <label
                      htmlFor="uploader-instagram"
                      className="block mb-1.5 text-xs font-semibold text-white/80"
                    >
                      Instagram Handle{" "}
                      <span className="text-white/40">(Optional)</span>
                    </label>
                    <InputField
                      id="uploader-instagram"
                      type="text"
                      placeholder="@yourhandle"
                      value={uploaderInstagram}
                      onChange={(e) => setUploaderInstagram(e.target.value)}
                      inputClassName="bg-black/40 border border-white/10 px-4 py-2.5 placeholder:text-white/40 text-white outline-none rounded-xl w-full text-xs"
                    />
                  </div>

                  {uploadError && (
                    <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                      {uploadError}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(false)}
                      className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-xs text-white/60 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <SeventhButton
                      type="submit"
                      disabled={uploading || !selectedFile}
                      icon={false}
                      className="disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Upload Photo"}
                    </SeventhButton>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* ── VIDEO LIGHTBOX MODAL ──────────────────────────────────── */}
      {mounted &&
        !!videoModalId &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Video Player Lightbox"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setVideoModalId(null)}
          >
            <div
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-[var(--radius-box)] border border-white/20 bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setVideoModalId(null)}
                className="cursor-pointer absolute top-4 right-4 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black transition-colors"
                aria-label="Close video"
              >
                <X className="h-5 w-5" />
              </button>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoModalId}?autoplay=1&rel=0&modestbranding=1`}
                title="7th Heaven Video Performance"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                allowFullScreen
              />
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
