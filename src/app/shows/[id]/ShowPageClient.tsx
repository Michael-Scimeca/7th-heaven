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
import { SectionBadge } from "@/components/SectionBadge";
import { DotChevronRight } from "@/components/ui/DotArrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import SectionHeader from "@/components/SectionHeader";
import GlassPlayButton from "@/components/GlassPlayButton";
import { useScrollLock } from "@/lib/useScrollLock";
import { X, Play, Camera, Upload, MapPin, Navigation, Car, ExternalLink, LayoutGrid, Route, Layers, Split, Compass, ChevronRight, Calendar, Bell } from "lucide-react";

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
  isBandMedia?: boolean;
}

export interface PastVenueShow {
  id?: string;
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
  address?: string | null;
  parkingAddress?: string | null;
  parking_address?: string | null;
  parkingNotes?: string | null;
  parking_notes?: string | null;
  parkingInfo?: string | null;
  parking_info?: string | null;
  parkingUrl?: string | null;
  parking_url?: string | null;
  parkingType?: string | null;
  ticketLink?: string | null;
  directionsLink?: string | null;
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
const EMPTY_UPCOMING_VENUE_SHOWS: RelatedShow[] = [];
const EMPTY_VENUE_MEDIA: VenueMediaItem[] = [];
const EMPTY_PAST_SHOWS: PastVenueShow[] = [];

function renderDateBadge(month: string, day: string, weekday: string) {
  return (
    <span className="inline-flex rounded-none overflow-hidden border border-white/10 text-[10px] font-bold">
      <span className="bg-white/10 px-2 py-0.5 text-white/80 uppercase">{month} {day}</span>
      <span className="bg-purple-600/30 px-2 py-0.5 text-purple-200 border-l border-white/10 uppercase">{weekday}</span>
    </span>
  );
}

export const UPCOMING_SHOW_STYLES = [
  { id: 1, name: "1. Neon Ticket Stub", desc: "Perforated ticket cutout with barcode notch & glowing date punch" },
  { id: 2, name: "2. Compact Horizontal Strip", desc: "Low-profile streamlined banner rows with badge & time" },
  { id: 3, name: "3. Split Calendar Block", desc: "Prominent high-contrast calendar tile on left, concert details on right" },
  { id: 4, name: "4. Unified Venue Stage Ribbon", desc: "Connected stage timeline ribbon uniting all venue dates" },
  { id: 5, name: "5. Cyberpunk Monospace Telemetry", desc: "Monospace digital schedule with coordinates, status indicator & scan lines" },
  { id: 6, name: "6. Glassmorphism Holographic Glow", desc: "Backdrop blur frosted glass with iridescent magenta-purple halo" },
  { id: 7, name: "7. VIP Backstage Pass Lanyard", desc: "All-access laminate pass with punch-hole & VIP foil border" },
  { id: 8, name: "8. Bold Poster Typography", desc: "Vintage rock gig poster aesthetic with oversized bold typography" },
  { id: 9, name: "9. Minimalist Outline Wireframe", desc: "Ultra-clean thin outline grid with subtle accent underline" },
  { id: 10, name: "10. Dark Horizon Floating Orb", desc: "Gradient orb glow backdrop with floating elevated show cards" },
  { id: 11, name: "11. Stepped Countdown Corridor", desc: "Shows days/weeks remaining badge alongside tour date" },
  { id: 12, name: "12. Vintage Vinyl Record Jacket", desc: "Vinyl groove ring texture with retro gold accent spine" },
  { id: 13, name: "13. Festival Wristband Pill", desc: "Slender horizontal festival entry wristband badge style" },
  { id: 14, name: "14. Soundwave Visualizer Bar", desc: "Animated eq audio frequency bars accenting each show date" },
  { id: 15, name: "15. Stadium Jumbotron Display", desc: "Digital stadium matrix LED board styling with amber/red glow" },
  { id: 16, name: "16. Magnetic Polaroid Snap", desc: "Slight angle live-feel card with taped/pinned edge aesthetic" },
  { id: 17, name: "17. Sunset Gradient Duotone", desc: "Rich purple-to-crimson linear horizon sunset gradient backdrop" },
  { id: 18, name: "18. Split Metro Transit Tile", desc: "High-contrast subway route stop tile with route line connector" },
  { id: 19, name: "19. Carbon Fiber Rocker", desc: "Subtle carbon weave texture with brushed metallic chrome borders" },
  { id: 20, name: "20. Clean Modern Minimalist Card", desc: "Refined modern border, generous padding, and sleek hover state" },
];

const CLEAN_LAYOUTS = [
  // ── DEDICATED PARKING & DISTANCE FROM SHOW LAYOUTS ──
  { id: 18, name: "★ W1. Pedestrian Telemetry Stepper (Parking & Distance)", desc: "Left vertical corridor with parking origin, distance (350 ft / 2 min), and venue stage" },
  { id: 21, name: "★ W2. Dual Maps + Dynamic Walking Bridge", desc: "Twin parking & stage maps bridged with live walk distance HUD (~350 ft / 2 min walk)" },
  { id: 22, name: "★ W3. Full Walking Route & Distance Embed", desc: "Single live walking route map connecting parking garage directly to stage" },
  { id: 23, name: "★ W4. Split Horizon + Central Pedometer HUD", desc: "Top parking deck, bottom concert stage, bisected by 350 FT • 2 MIN WALK distance bar" },
  { id: 24, name: "★ W5. Waypoint Chrono Switcher (Park ➔ Walk ➔ Stage)", desc: "Zero-card waypoint switcher showing exact distance and step-by-step path" },
  { id: 25, name: "★ W6. Asymmetric Radar (70% Walk Map + 30% Thumbnails)", desc: "Primary route map with distance indicator plus parking & venue thumbnails" },
  { id: 26, name: "★ W7. Tactical Monospace HUD (Coords, Distance & Bearing)", desc: "Monospace telemetry showing 350 FT distance, 120s walk time, coordinates, and live GPS" },
  { id: 27, name: "★ W8. 3-Phase Route Ribbon (Park ➔ 350ft Walk ➔ Arrive)", desc: "3-column chronological sequence with distance and path details" },
  { id: 28, name: "★ W9. Clean Bottom Walk Ribbon Overlay", desc: "Full-bleed map with edge-to-edge floating parking distance & walk bar" },
  { id: 29, name: "★ W10. Inverted Night Walk (Lit Sidewalk Distance HUD)", desc: "High-contrast night arrival maps with distance telemetry and pedestrian waypoints" },

  // ── ADDITIONAL GENERAL VENUE & PARKING LAYOUTS ──
  { id: 1, name: "1. Vertical Pure Stack", desc: "Two full-width unboxed maps stacked right with minimal text captions" },
  { id: 2, name: "2. Side-by-Side Horizontal Duo", desc: "Side-by-side 50/50 dual maps sharing equal width without cards" },
  { id: 3, name: "3. Minimalist Toggle Strip", desc: "Direct single viewport with inline text toggles [📍 Venue (Station 34)] [🚗 Parking]" },
  { id: 4, name: "4. Asymmetric Wide Venue + Slim Garage", desc: "65% primary venue map with 35% parking corridor map" },
  { id: 5, name: "5. Split-Screen Hero", desc: "Show details in left column, venue map center, parking map right" },
  { id: 6, name: "6. Panoramic Dual Belt", desc: "Left headline, full-width side-by-side ultra-wide 21:9 dual map ribbons below" },
  { id: 7, name: "7. Single Unified Map + Quick Focus", desc: "One map viewport displaying both pins with instant 1-click focus toggle" },
  { id: 8, name: "8. Photo & Maps Triptych", desc: "Featured live photo on left, venue map center, parking map right" },
  { id: 9, name: "9. Raw Overlay Navigator", desc: "Full-bleed venue map with edge-to-edge parking inset strip" },
  { id: 10, name: "10. Compact Micro-Maps Grid", desc: "Ultra-compact twin 16:6 map viewports matching the title block height" },
  { id: 11, name: "11. Clean Waypoint Sequence", desc: "Step 1: Garage map ➔ Step 2: Venue map arranged chronologically" },
  { id: 12, name: "12. Equal Tall Columns", desc: "Two tall vertical aspect maps placed side-by-side" },
  { id: 13, name: "13. Floating Action Strip", desc: "Clean map viewport with bottom transparent navigation button bar" },
  { id: 14, name: "14. Venue Hero with Below-Fold Parking", desc: "Only venue map in hero; dedicated parking map pinned below next to details" },
  { id: 15, name: "15. Headline Map Bar", desc: "Two horizontal map bands stretching cleanly across the screen width" },
  { id: 16, name: "16. Inverted Flow (Details Right, Maps Left)", desc: "Left column dual maps, right column show details & RSVP" },
  { id: 17, name: "17. Photo Focus with Inline Maps", desc: "Live concert photo with clean dual maps embedded directly below" },
  { id: 19, name: "19. Tabbed Minimalist Switcher", desc: "Zero-padding tab strip switching between Venue, Garage, and Live Photo" },
  { id: 20, name: "20. Terminal Minimal", desc: "Raw monospace headers with high-contrast borderless map viewports" },
];

const WALKING_LAYOUTS = [
  { id: 1, name: "W1. Pedestrian Telemetry Stepper", desc: "Vertical walk corridor on left (Step 1 ➔ Walk ➔ Step 2) with wide route viewport" },
  { id: 2, name: "W2. Dual Maps with Dynamic Walking Bridge", desc: "Twin square viewports bridged by an animated pedestrian compass and dashed connector" },
  { id: 3, name: "W3. Direct Google Walking Route Embed", desc: "Single live walking directions route map with start/end pin callouts" },
  { id: 4, name: "W4. Split Horizon + Central Pedometer", desc: "Top parking viewport, bottom stage viewport, separated by a live walk distance HUD" },
  { id: 5, name: "W5. Waypoint Stage Slider / Switcher", desc: "Single viewport with zero-card floating waypoint pills: [Step 1: Park] ➔ [Step 2: Enter]" },
  { id: 6, name: "W6. Asymmetric Radar (70% Walk Map + 30% Thumbnails)", desc: "Primary route map flanked by stacked arrival portal previews" },
  { id: 7, name: "W7. Tactical Monospace HUD Corridor", desc: "Military/cyber coordinate telemetry, bearing, distance, and direct walking triggers" },
  { id: 8, name: "W8. 3-Phase Route Ribbon", desc: "3-column chronological sequence: [1. Park Deck] ➔ [2. Walk Path] ➔ [3. Venue Stage]" },
  { id: 9, name: "W9. Clean Bottom Walk Ribbon Overlay", desc: "Full-bleed venue viewport with an edge-to-edge floating walk banner" },
  { id: 10, name: "W10. Inverted Night Walk High-Contrast", desc: "High-contrast dark-mode route viewports with neon pedestrian waypoint indicators" },
];

export default function ShowPageClient({
  show,
  initialAttendees,
  upcomingVenueShows = EMPTY_UPCOMING_VENUE_SHOWS,
  relatedShows = EMPTY_RELATED_SHOWS,
  defaultImage = "/images/tour/fan-concert-photo.jpg",
  venueMedia = EMPTY_VENUE_MEDIA,
  pastVenueShows = EMPTY_PAST_SHOWS,
  jsonLd,
}: {
  show: Show;
  initialAttendees: Attendee[];
  upcomingVenueShows?: RelatedShow[];
  relatedShows?: RelatedShow[];
  defaultImage?: string;
  venueMedia?: VenueMediaItem[];
  pastVenueShows?: PastVenueShow[];
  jsonLd?: Record<string, any>;
}) {
  const { member, isLoggedIn, openModal } = useMember();
  const supabase = createClient();

  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [wantAnonymous, setWantAnonymous] = useState(false);
  const [liveFeeds, setLiveFeeds] = useState<LiveFeed[]>([]);
  const autoRsvpDoneRef = useRef(false);

  // ── 20 Distinct Upcoming Show Section Styles State ──────────────
  const [upcomingShowStyle, setUpcomingShowStyle] = useState<number>(1);

  // ── Show Media & Upload States ──────────────────────────────────
  const [uploadedPhotos, setUploadedPhotos] = useState<VenueMediaItem[]>([]);
  const [activeHeroImage, setActiveHeroImage] = useState<string>(defaultImage);
  const [heroImageCaption, setHeroImageCaption] = useState<string>("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [videoModalId, setVideoModalId] = useState<string | null>(null);
  const [activeFullscreenMedia, setActiveFullscreenMedia] = useState<VenueMediaItem | null>(null);
  const mounted = useSyncExternalStore(
    () => () => { },
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

  useScrollLock(uploadModalOpen || !!videoModalId || !!activeFullscreenMedia);

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
    } catch { }
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
        setActiveFullscreenMedia(null);
      }
    };
    if (uploadModalOpen || !!videoModalId || !!activeFullscreenMedia) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [uploadModalOpen, videoModalId, activeFullscreenMedia]);

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

  const handleOpenUploadModal = () => {
    if (!isLoggedIn) {
      openModal("login");
      return;
    }
    setUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openModal("login");
      return;
    }
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
      } catch { }

      setUploadedPhotos(updated);
      setActiveHeroImage(newMediaItem.src);
      setHeroImageCaption(newMediaItem.caption || "");

      setUploadSuccessMessage("Photo submitted! All fan photos are reviewed before appearing publicly in the gallery.");
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploaderCaption("");

      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccessMessage(null);
      }, 2500);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  // ── Notify Me Next Time States ──────────────────────────────────
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
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

  const effectiveAddress = show.address || `${show.venue_name}, ${show.city}${show.state ? `, ${show.state}` : ""}`;
  const effectiveParkingAddress = (show.parkingAddress || show.parking_address || "").trim();
  const effectiveParkingNotes = (show.parkingNotes || show.parking_notes || show.parkingInfo || show.parking_info || "").trim();

  const mapsUrl =
    show.latitude && show.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${show.latitude},${show.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue_name} ${show.city} ${show.state}`)}`;

  const parkingMapsUrl =
    show.parkingUrl ||
    (effectiveParkingAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(effectiveParkingAddress)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parking near ${show.venue_name} ${show.city} ${show.state}`)}`);

  const venueEmbedQuery =
    show.latitude && show.longitude
      ? `${show.latitude},${show.longitude}`
      : encodeURIComponent(`${show.venue_name}, ${show.city} ${show.state}`);

  const parkingEmbedQuery = effectiveParkingAddress
    ? encodeURIComponent(effectiveParkingAddress)
    : encodeURIComponent(`parking near ${show.venue_name}, ${show.city} ${show.state}`);

  const walkingDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(effectiveParkingAddress || `parking near ${show.venue_name}`)}&destination=${encodeURIComponent(effectiveAddress)}&travelmode=walking`;

  const walkingRouteEmbedQuery = `saddr=${encodeURIComponent(effectiveParkingAddress || `parking near ${show.venue_name}`)}&daddr=${encodeURIComponent(effectiveAddress)}&dirflg=w`;

  // shareUrl: use a safe default on SSR, update to real URL after hydration
  const shareUrl = useSyncExternalStore(
    () => () => { },
    () => window.location.href,
    () => `https://7thheavenband.com/shows/${show.id}`,
  );

  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);

  // Calendar Event generation
  const { gcalUrl, icsUrl } = useMemo(() => {
    const start = new Date(show.date + "T12:00:00Z");
    if (show.time) {
      const match = show.time.match(/(\d+):?(\d*)\s*(am|pm)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const mins = match[2] ? parseInt(match[2], 10) : 0;
        const meridian = match[3]?.toLowerCase();
        if (meridian === "pm" && hours < 12) hours += 12;
        if (meridian === "am" && hours === 12) hours = 0;
        start.setUTCHours(hours, mins, 0, 0);
      } else {
        start.setUTCHours(20, 0, 0, 0);
      }
    } else {
      start.setUTCHours(20, 0, 0, 0);
    }
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    const formatGCal = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const title = `7th Heaven Live at ${show.venue_name}`;
    const details = `Catch 7th Heaven live at ${show.venue_name}!\nLocation: ${effectiveAddress}\nMore info: https://7thheavenband.com/shows/${show.id}`;

    const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCal(start)}/${formatGCal(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(effectiveAddress)}`;

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//7th Heaven//Concert Calendar//EN",
      "BEGIN:VEVENT",
      `UID:${show.id}-${Date.now()}@7thheavenband.com`,
      `DTSTAMP:${formatGCal(new Date())}`,
      `DTSTART:${formatGCal(start)}`,
      `DTEND:${formatGCal(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details.replace(/\n/g, "\\n")}`,
      `LOCATION:${effectiveAddress}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsLines.join("\r\n"))}`;

    return { gcalUrl: gcal, icsUrl: ics };
  }, [show.date, show.time, show.venue_name, show.id, effectiveAddress]);

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
        }
      }
    } finally {
      setRsvpLoading(false);
    }
  };



  // ── Filtered attendee list ───────────────────────────────────────

  return (
    <main
      className="min-h-screen bg-[#050505] pt-[123px]"
      id="show-details-page"
    >
      {jsonLd && (
        <script
          id={`show-event-jsonld-${show.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
              .replace(/</g, "\\u003c")
              .replace(/>/g, "\\u003e")
              .replace(/&/g, "\\u0026"),
          }}
        />
      )}
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
      <div className="site-container page-stack relative z-10 py-6">
        <section id="show-hero" aria-labelledby="show-hero-heading" className="section">
          <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-14 xl:gap-16">
            {/* ── LEFT COLUMN: ALL SHOW & WAYPOINT INFORMATION ── */}
            <div className="w-full lg:w-[540px] xl:w-[620px] shrink-0 flex flex-col gap-6">
              <div>
                <Breadcrumbs
                  id={`show-breadcrumbs-${show.id}`}
                  className="mb-3 py-0"
                  items={[
                    { name: "Home", href: "/" },
                    { name: "Tour Dates", href: "/#tour" },
                    { name: `${show.venue_name}${show.city ? ` (${show.city})` : ""}` },
                  ]}
                />
                <h1 id="show-hero-heading" className="leading-tight text-white mb-2 text-pretty [text-wrap:pretty] hyphens-none break-words">{show.venue_name}</h1>
                <div className="flex flex-col gap-0.5 mt-1">
                  <span className="font-heading text-2xl sm:text-3xl uppercase tracking-wide text-white">
                    {show.city}{show.state ? `, ${show.state}` : ""}
                  </span>
                  <span className="font-quisas text-2xl sm:text-3xl text-purple-300 font-normal tracking-wide">{dateStr}</span>
                </div>
              </div>



              {/* ─────────────────────────────────────────────────────────── */}
              {/* UNIFIED HUD: 2-COLUMN SPACIOUS GRID                         */}
              {/* ─────────────────────────────────────────────────────────── */}
              <div className="text-sm text-white/90">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div className="min-w-0">
                    <span className="font-quisas text-lg sm:text-xl text-purple-400 block tracking-wide leading-none">
                      Concert Schedule
                    </span>
                    <p className="font-heading text-xl sm:text-2xl uppercase tracking-wide text-white mt-1.5 whitespace-nowrap">
                      {show.time ? `Show ${show.time}` : "Time TBA"}
                    </p>
                    <p className="text-xs sm:text-sm text-white/60 mt-0.5 font-body">
                      {show.doors_time ? `Doors ${show.doors_time}` : "Doors TBA"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <span className="font-quisas text-lg sm:text-xl text-purple-400 block tracking-wide leading-none">
                      Access & Age
                    </span>
                    <p className="font-heading text-xl sm:text-2xl uppercase tracking-wide text-white mt-1.5 whitespace-nowrap">
                      {show.all_ages !== null ? (show.all_ages ? "All Ages" : "21+ Event") : "All Ages"}
                    </p>
                    <p className="text-xs sm:text-sm text-white/60 mt-0.5 font-body">
                      {show.cover ? `Cover: ${show.cover}` : "Free / No Cover"}
                    </p>
                  </div>
                  {effectiveParkingAddress ? (
                    <>
                      <div className="min-w-0">
                        <span className="font-quisas text-lg sm:text-xl text-purple-400 block tracking-wide leading-none">
                          Recommended Parking
                        </span>
                        <p className="font-heading text-lg sm:text-xl uppercase tracking-wide text-white mt-1.5 truncate" title={effectiveParkingAddress}>
                          {effectiveParkingAddress.split(",")[0]}
                        </p>
                        <p className="text-xs sm:text-sm text-purple-300 font-medium mt-0.5 font-body truncate">
                          🅿️ {effectiveParkingAddress.split(",").slice(1, 2).join("").trim() || "Surface Deck"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <span className="font-quisas text-lg sm:text-xl text-purple-400 block tracking-wide leading-none">
                          Pedestrian Corridor
                        </span>
                        <p className="font-heading text-lg sm:text-xl lg:text-2xl uppercase tracking-wide text-emerald-400 mt-1.5 whitespace-nowrap">
                          🚶 ~350 FT • 2 MIN
                        </p>
                        <p className="text-xs sm:text-sm text-white/60 mt-0.5 font-body truncate">
                          Sidewalk west on Central
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="min-w-0 sm:col-span-2">
                      <span className="font-quisas text-lg sm:text-xl text-purple-400 block tracking-wide leading-none">
                        Venue Address
                      </span>
                      <p className="font-heading text-lg sm:text-xl uppercase tracking-wide text-white mt-1.5 truncate" title={effectiveAddress}>
                        {effectiveAddress.split(",")[0]}
                      </p>
                      <p className="text-xs sm:text-sm text-purple-300 font-medium mt-0.5 font-body">
                        📍 Direct Entrance
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
                {/* Primary navigation buttons */}
                <SeventhButton
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={false}
                  id="venue-directions-btn"
                  className="text-xs"
                >
                  📍 Get Directions
                </SeventhButton>

                {effectiveParkingAddress && (
                  <SeventhButton
                    href={walkingDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={false}
                    id="walk-directions-btn"
                    className="text-xs"
                  >
                    🚶 Walking GPS
                  </SeventhButton>
                )}

                {/* Add to Calendar button & dropdown */}
                <div className="relative">
                  <SeventhButton
                    type="button"
                    onClick={() => setCalendarMenuOpen((prev) => !prev)}
                    icon={false}
                    id="add-to-calendar-btn"
                    className="text-xs"
                  >
                    📅 Add to Calendar
                  </SeventhButton>

                  {calendarMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setCalendarMenuOpen(false)}
                      />
                      <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-2 z-40 w-52 rounded-xl border border-white/10 bg-[#0d0914] p-1.5 shadow-2xl backdrop-blur-xl font-mono text-xs">
                        <a
                          href={gcalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setCalendarMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/80 hover:bg-purple-600/30 hover:text-white transition-colors"
                        >
                          <span>🗓️</span> Google Calendar ↗
                        </a>
                        <a
                          href={icsUrl}
                          download={`7th-heaven-${show.venue_name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`}
                          onClick={() => setCalendarMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/80 hover:bg-purple-600/30 hover:text-white transition-colors"
                        >
                          <span>🍏</span> Apple / iCal (.ics)
                        </a>
                      </div>
                    </>
                  )}
                </div>

                {/* Get Notifications Button */}
                <SeventhButton
                  type="button"
                  onClick={() => setNotifyModalOpen(true)}
                  icon={false}
                  id="get-notifications-btn"
                  className="text-xs"
                >
                  🔔 Get Notifications
                </SeventhButton>
              </div>
            </div>

            {/* ── RIGHT COLUMN: FULL EXPANDED MAP ── */}
            <div className="flex-1 flex flex-col justify-center min-w-0 w-full">
              {effectiveParkingAddress ? (
                /* Walking route trajectory embed */
                <div className="h-[420px] lg:h-[480px] w-full bg-black overflow-hidden rounded-[var(--radius-box)] border border-white/10 shadow-2xl relative">
                  <iframe
                    src={`https://maps.google.com/maps?saddr=${encodeURIComponent(effectiveParkingAddress.replace(/^[^,]+,\s*/, ""))}&daddr=${encodeURIComponent(effectiveAddress)}&dirflg=w&output=embed`}
                    title="Walking Directions Route"
                    className="h-full w-full border-0 map-tour-theme"
                    loading="lazy"
                  />
                  {/* Subtle GPS route overlay pill badge moved to bottom-left to not collide with Google directions card */}
                  <div className="absolute bottom-6 left-3 z-10 flex items-center gap-2 rounded-full border border-purple-500/30 bg-black/85 px-3 py-1 font-mono text-[11px] text-purple-200 backdrop-blur-md shadow-lg pointer-events-none">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>🚶 Walking GPS Corridor</span>
                  </div>
                </div>
              ) : (
                /* Single venue location map */
                <div className="h-[420px] lg:h-[480px] w-full bg-black overflow-hidden rounded-[var(--radius-box)] border border-white/10 shadow-2xl relative">
                  <iframe
                    src={`https://maps.google.com/maps?q=${venueEmbedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    title="Venue Location Map"
                    className="h-full w-full border-0 map-tour-theme"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
        <section
          id="venue-media"
          aria-labelledby="venue-media-heading"
          className="section"
        >
          <SectionHeader
            id="venue-media-heading"
            divider={false}
            title={`Media from ${show.venue_name}`}
            subtitle={`Concert memories, fan snapshots, and live footage from 7th Heaven performances at ${show.venue_name}${show.city ? ` in ${show.city}` : ""}.`}
            action={
              isLoggedIn ? (
                <SeventhButton
                  onClick={handleOpenUploadModal}
                  icon={false}
                  className="text-xs"
                >
                  📸 Upload Photo
                </SeventhButton>
              ) : null
            }
          />

          {/* Media Items List */}
          {allMedia.length > 0 ? (
            <div className="bg-transparent font-body text-xs divide-y divide-white/10">
              {allMedia.map((item, idx) => {
                const isVideo = item.type === "video" || !!item.youtubeId;
                const posterUrl =
                  isVideo && item.youtubeId
                    ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`
                    : item.src;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row items-stretch md:items-start justify-between py-8 px-2 gap-8 md:gap-10 bg-transparent"
                  >
                    {/* Enlarged Cinematic Video / Media Viewport */}
                    <div className="relative aspect-video w-full md:w-[450px] lg:w-[520px] shrink-0 overflow-hidden rounded-md bg-transparent shadow-xl">
                      <Image
                        src={posterUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 450px, 520px"
                        className="object-cover"
                      />
                      {isVideo ? (
                        <button
                          type="button"
                          onClick={() => setVideoModalId(item.youtubeId || null)}
                          className="cursor-pointer group absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
                          aria-label={`Play track video ${item.name}`}
                        >
                          <GlassPlayButton size="lg" as="div" glow />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveFullscreenMedia(item)}
                          className="cursor-pointer group absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-colors"
                          aria-label={`Open photo ${item.name} full screen`}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md border border-white/20">
                            🔍 View Fullscreen
                          </span>
                        </button>
                      )}

                      {/* Top Track Pill */}
                      <div className="absolute top-2.5 left-2.5 pointer-events-none">
                        <span className="inline-flex rounded-none overflow-hidden border border-white/20 text-[9px] font-bold backdrop-blur-xs">
                          <span className="bg-black/60 px-2 py-0.5 text-purple-300 font-mono">
                            TRK A0{idx + 1}
                          </span>
                          <span className="bg-purple-600/40 px-2 py-0.5 text-white border-l border-white/20 uppercase font-mono">
                            {isVideo ? "LIVE VIDEO" : "PHOTO"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Title, Date & Captions Top-Aligned with Video */}
                    <div className="flex flex-1 flex-col justify-start pt-0.5 min-w-0">
                      <div>
                        <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-wide text-white font-bold leading-tight">
                          {item.name}
                        </h3>
                        {item.date && (
                          <p className="font-mono text-xs sm:text-sm font-semibold text-white/70 mt-1">
                            {item.date}
                          </p>
                        )}
                      </div>
                      {item.caption && (
                        <p className="mt-2.5 text-base sm:text-lg text-white font-medium font-body leading-relaxed line-clamp-2">
                          "{item.caption}"
                        </p>
                      )}
                      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-semibold text-white/60 font-mono">
                        <span className="text-purple-300 font-bold">{item.instagram || "@7THHEAVEN"}</span>
                        <span className="text-white/40">&bull;</span>
                        <span className="text-white/80">{item.venue || show.venue_name}{item.city || show.city ? ` · ${item.city || show.city}` : ""}</span>
                        <span className="text-white/40">&bull;</span>
                        <span className="text-purple-300/90">{isVideo ? "Live Concert Video" : "Concert Photo"}</span>
                      </div>
                    </div>

                    {/* Right Play / View Action */}
                    <div className="shrink-0 text-left md:text-right pt-3 md:pt-1 border-t border-white/5 md:border-t-0 md:ml-4">
                      {isVideo ? (
                        <SeventhButton
                          type="button"
                          onClick={() => setVideoModalId(item.youtubeId || null)}
                          icon={false}
                          className="text-xs"
                        >
                          Play Track ♫
                        </SeventhButton>
                      ) : (
                        <SeventhButton
                          type="button"
                          onClick={() => setActiveFullscreenMedia(item)}
                          icon={false}
                          className="text-xs"
                        >
                          View Fullscreen ↗
                        </SeventhButton>
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
              <h3 className="mb-2 font-semibold text-white">
                Be the First to Share a Photo from {show.venue_name}!
              </h3>
              <p className="mx-auto mb-6 max-w-md text-xs text-white/60">
                Are you attending this show or have memories from past 7th
                Heaven performances at this venue? Share your photos with the band and fans!
              </p>
              {isLoggedIn ? (
                <SeventhButton
                  onClick={handleOpenUploadModal}
                  icon={false}
                >
                  Upload First Photo
                </SeventhButton>
              ) : (
                <SeventhButton
                  onClick={() => openModal("login")}
                  icon={false}
                >
                  Login to Upload Photo
                </SeventhButton>
              )}
            </div>
          )}
        </section>

        {/* ── UPCOMING DATES AT THIS VENUE WITH 20 DISTINCT STYLES ──── */}
        {upcomingVenueShows && upcomingVenueShows.length > 0 && (
          <section
            id="venue-upcoming-shows"
            aria-labelledby="venue-upcoming-shows-heading"
            className="section"
          >
            <SectionHeader
              id="venue-upcoming-shows-heading"
              title={
                <span className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">🗓️</span>
                  Upcoming Dates at {show.venue_name}
                </span>
              }
              subtitle={`More upcoming tour appearances scheduled at ${show.venue_name}.`}
              action={
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md">
                    <span className="pl-2 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                      Style {upcomingShowStyle}/20:
                    </span>
                    <select
                      value={upcomingShowStyle}
                      onChange={(e) => setUpcomingShowStyle(Number(e.target.value))}
                      aria-label="Select Upcoming Dates Card Style"
                      className="cursor-pointer rounded-lg border border-purple-500/30 bg-black/80 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    >
                      {UPCOMING_SHOW_STYLES.map((st) => (
                        <option key={st.id} value={st.id} className="bg-neutral-900 text-white">
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
                    {upcomingVenueShows.length} Upcoming Date{upcomingVenueShows.length !== 1 ? "s" : ""}
                  </span>
                </div>
              }
            />

            {/* Sub-label describing the active style */}
            <div className="mb-6 flex items-center gap-2 text-xs text-purple-300/80">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span>
                <strong>{UPCOMING_SHOW_STYLES.find((s) => s.id === upcomingShowStyle)?.name}:</strong>{" "}
                {UPCOMING_SHOW_STYLES.find((s) => s.id === upcomingShowStyle)?.desc}
              </span>
            </div>

            {/* ─────────────────────────────────────────────────────────── */}
            {/* 20 LIVE STYLE RENDERERS                                     */}
            {/* ─────────────────────────────────────────────────────────── */}

            {/* STYLE 1: Neon Ticket Stub with Perforated Cutouts & Barcode */}
            {upcomingShowStyle === 1 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group relative flex overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-neutral-950 to-neutral-950 p-0 shadow-lg transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-[0_0_25px_rgba(255,10,61,0.25)] hover:-translate-y-1"
                    >
                      {/* Left Ticket Stub Notch */}
                      <div className="relative flex w-24 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-white/20 bg-purple-950/60 p-3 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">{weekday}</span>
                        <span className="text-2xl font-black text-white">{day}</span>
                        <span className="text-xs font-black uppercase text-[var(--color-accent)]">{month}</span>
                        <span className="mt-2 text-[10px] text-white/40">{vShow.date.split("-")[0]}</span>
                        <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[#050505] border border-white/10" />
                        <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-[#050505] border border-white/10" />
                      </div>

                      {/* Right Details with Simulated Barcode */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-center justify-between text-xs text-white/50">
                            <span className="font-mono text-[10px] uppercase text-purple-400">ADM-ONE • LIVE</span>
                            <span>{vShow.time || "Show TBA"}</span>
                          </div>
                          <h3 className="mt-1 font-bold text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                            {vShow.venue_name}
                          </h3>
                          <p className="text-xs text-white/60">{vShow.city}, {vShow.state}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 font-mono text-[10px] text-white/40">
                          <span className="tracking-widest">||| | |||| | |||</span>
                          <span className="flex items-center gap-1 text-[var(--color-accent)] font-sans text-xs">
                            Details <DotChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 2: Compact Horizontal Strip */}
            {upcomingShowStyle === 2 && (
              <div className="flex flex-col gap-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-[var(--color-accent)]/50 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10">
                          <span className="text-[10px] font-bold text-[var(--color-accent)]">{month}</span>
                          <span className="text-base font-black text-white leading-none">{day}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors">
                              {vShow.venue_name}
                            </h3>
                            <span className="text-xs text-white/40">• {weekday}</span>
                          </div>
                          <p className="text-xs text-white/60">{vShow.city}, {vShow.state}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:justify-end">
                        <span className="rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-xs font-mono text-purple-300">
                          {vShow.time || "Time TBA"}
                        </span>
                        <span className="text-xs font-medium text-[var(--color-accent)] group-hover:underline flex items-center gap-1">
                          Show Details <DotChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 3: Split Calendar Block */}
            {upcomingShowStyle === 3 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group flex overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 transition-all hover:border-purple-400 hover:shadow-xl"
                    >
                      <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-gradient-to-b from-[var(--color-accent)] to-purple-800 p-3 text-white">
                        <span className="text-[11px] font-bold uppercase tracking-wider">{month}</span>
                        <span className="text-3xl font-black">{day}</span>
                        <span className="text-[10px] uppercase opacity-90">{weekday}</span>
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <span className="text-[11px] font-mono text-purple-400 block">{vShow.time || "Evening Show"}</span>
                          <h3 className="font-bold text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                            {vShow.venue_name}
                          </h3>
                          <p className="text-xs text-white/60">{vShow.city}, {vShow.state}</p>
                        </div>
                        <span className="mt-3 text-xs text-white/50 group-hover:text-white flex items-center gap-1">
                          View details <DotChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 4: Unified Venue Stage Ribbon */}
            {upcomingShowStyle === 4 && (
              <div className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-black p-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
                <div className="flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-white/10 gap-4 md:gap-0">
                  {upcomingVenueShows.map((vShow, idx) => {
                    const { month, day, weekday } = formatShowBadge(vShow.date);
                    return (
                      <Link
                        key={vShow.id}
                        href={`/shows/${vShow.id}`}
                        className={`group flex-1 ${idx > 0 ? "md:pl-6 pt-4 md:pt-0" : ""} flex flex-col justify-between transition-colors`}
                      >
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)]">
                            Appearance 0{idx + 1}
                          </span>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
                              {month} {day}
                            </span>
                            <span className="text-xs text-white/50 font-medium">{weekday}</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-white">{vShow.venue_name}</p>
                          <p className="text-xs text-white/60">{vShow.city}, {vShow.state}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/50 group-hover:text-white">
                          <span>{vShow.time || "8:30pm"}</span>
                          <span className="text-[var(--color-accent)]">Select Date →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STYLE 5: Cyberpunk Monospace Telemetry */}
            {upcomingShowStyle === 5 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 font-mono">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group rounded-lg border border-emerald-500/30 bg-black/90 p-4 relative overflow-hidden transition-all hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    >
                      <div className="flex items-center justify-between text-[10px] text-emerald-400/80 mb-2">
                        <span>SYS.LOC // CONFIRMED</span>
                        <span className="animate-pulse">● LIVE RUN</span>
                      </div>
                      <div className="text-xl font-bold text-emerald-300">
                        [{month}.{day} // {weekday.toUpperCase()}]
                      </div>
                      <div className="mt-1 text-xs text-white uppercase">{vShow.venue_name}</div>
                      <div className="text-[11px] text-emerald-500/70">{vShow.city}, {vShow.state} // {vShow.time || "TBA"}</div>
                      <div className="mt-4 flex items-center justify-between border-t border-emerald-900/50 pt-2 text-[10px] text-emerald-400 group-hover:text-white">
                        <span>ROUTE &gt;&gt; ACTIVE</span>
                        <span>[VIEW PASS]</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 6: Glassmorphism Holographic Glow */}
            {upcomingShowStyle === 6 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-300/60 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                    >
                      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl group-hover:scale-150 transition-transform" />
                      <div className="relative z-10 flex items-center justify-between mb-4">
                        <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                          {month} {day}
                        </span>
                        <span className="text-xs text-purple-200/70">{weekday}</span>
                      </div>
                      <h3 className="relative z-10 text-lg font-bold text-white group-hover:text-pink-200 transition-colors">
                        {vShow.venue_name}
                      </h3>
                      <p className="relative z-10 text-xs text-white/60">{vShow.city}, {vShow.state}</p>
                      <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-purple-300">
                        <span>{vShow.time || "Evening Performance"}</span>
                        <span>Reserve Spot →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 7: VIP Backstage Pass Lanyard */}
            {upcomingShowStyle === 7 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group relative rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-b from-yellow-950/20 via-black to-neutral-950 p-5 shadow-xl transition-all hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(234,179,8,0.2)]"
                    >
                      {/* Lanyard Hole */}
                      <div className="mx-auto mb-3 h-2.5 w-12 rounded-full bg-black border border-white/20" />
                      <div className="text-center border-b border-yellow-500/20 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                          ★ 7TH HEAVEN ALL-ACCESS ★
                        </span>
                        <div className="text-2xl font-black text-white mt-1">
                          {month} {day}
                        </div>
                        <span className="text-xs text-yellow-300/80">{weekday} • {vShow.time || "8:30PM"}</span>
                      </div>
                      <div className="mt-3 text-center">
                        <h3 className="font-bold text-white group-hover:text-yellow-300 transition-colors">
                          {vShow.venue_name}
                        </h3>
                        <p className="text-xs text-white/60">{vShow.city}, {vShow.state}</p>
                      </div>
                      <div className="mt-4 rounded-lg bg-yellow-500/10 py-1.5 text-center text-xs font-bold text-yellow-400 group-hover:bg-yellow-500/20">
                        CLAIM VIP ENTRY
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 8: Bold Rock Gig Poster Typography */}
            {upcomingShowStyle === 8 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group rounded-none border-2 border-white bg-black p-5 transition-all hover:bg-white hover:text-black"
                    >
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[var(--color-accent)] group-hover:text-red-600">
                        <span>LIVE CONCERT</span>
                        <span>{weekday}</span>
                      </div>
                      <div className="my-2 text-4xl font-black uppercase tracking-tight text-white group-hover:text-black">
                        {month} {day}
                      </div>
                      <h3 className="text-lg font-black uppercase text-white group-hover:text-black line-clamp-1">
                        {vShow.venue_name}
                      </h3>
                      <p className="text-xs font-bold uppercase text-white/60 group-hover:text-black/70">
                        {vShow.city}, {vShow.state} // {vShow.time || "SHOWTIME"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 9: Minimalist Outline Wireframe */}
            {upcomingShowStyle === 9 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group rounded-xl border border-white/10 p-4 transition-all hover:border-[var(--color-accent)] hover:bg-white/[0.02]"
                    >
                      <span className="text-[11px] font-medium text-white/40 block">{weekday}</span>
                      <span className="text-xl font-bold text-white group-hover:text-[var(--color-accent)] transition-colors">
                        {month} {day}
                      </span>
                      <p className="mt-1 font-semibold text-sm text-white truncate">{vShow.venue_name}</p>
                      <p className="text-xs text-white/50">{vShow.city}</p>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 10: Dark Horizon Floating Orb */}
            {upcomingShowStyle === 10 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-neutral-900 to-black p-6 shadow-2xl transition-all hover:border-purple-400/50 hover:-translate-y-1"
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-[var(--color-accent)]/20 blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-bold text-sm">
                          {month}
                        </span>
                        <div>
                          <div className="text-2xl font-black text-white">{day}</div>
                          <div className="text-[11px] text-white/50">{weekday}</div>
                        </div>
                      </div>
                      <h3 className="mt-4 font-bold text-white group-hover:text-purple-300 transition-colors">
                        {vShow.venue_name}
                      </h3>
                      <p className="text-xs text-white/60">{vShow.city}, {vShow.state}</p>
                      <div className="mt-4 text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1">
                        View Show Route <DotChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 11: Stepped Countdown Corridor */}
            {upcomingShowStyle === 11 && (
              <div className="flex flex-col gap-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-purple-500/50 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="rounded-lg bg-purple-950/80 px-3 py-1 font-mono text-xs font-bold text-purple-300 border border-purple-500/30">
                          {vShow.date}
                        </span>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-[var(--color-accent)]">
                            {vShow.venue_name}
                          </h3>
                          <p className="text-xs text-white/50">{vShow.city}, {vShow.state}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 md:mt-0">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                          Upcoming Tour Date
                        </span>
                        <span className="text-xs text-white/70 group-hover:text-white">
                          Details →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 12: Vintage Vinyl Record Jacket */}
            {upcomingShowStyle === 12 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group relative flex overflow-hidden rounded-xl border-l-4 border-l-amber-500 border-y border-r border-white/10 bg-[#111] p-5 shadow-lg transition-all hover:border-l-[var(--color-accent)] hover:bg-[#151515]"
                    >
                      <div className="flex flex-col justify-between flex-1">
                        <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                          <span>SIDE A • TRACK 01</span>
                          <span>{vShow.time || "8:30 PM"}</span>
                        </div>
                        <div className="my-2">
                          <span className="text-2xl font-black text-white">{month} {day}</span>
                          <span className="text-xs text-white/50 ml-2">({weekday})</span>
                          <h3 className="text-sm font-bold text-white/90 group-hover:text-amber-300 truncate mt-1">
                            {vShow.venue_name}
                          </h3>
                        </div>
                        <p className="text-xs text-white/50">{vShow.city}, {vShow.state}</p>
                      </div>
                      <div className="shrink-0 flex items-center pl-3">
                        <div className="h-10 w-10 rounded-full border-2 border-dashed border-amber-500/30 flex items-center justify-center text-[10px] text-amber-400">
                          33RPM
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 13: Festival Wristband Pill */}
            {upcomingShowStyle === 13 && (
              <div className="flex flex-col gap-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group flex flex-wrap items-center justify-between gap-3 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black to-purple-950/40 px-6 py-3 transition-all hover:border-[var(--color-accent)] hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[var(--color-accent)] px-3 py-0.5 text-xs font-black text-white">
                          {month} {day}
                        </span>
                        <span className="font-bold text-white text-sm group-hover:text-purple-300">
                          {vShow.venue_name}
                        </span>
                        <span className="text-xs text-white/50 hidden sm:inline">• {vShow.city}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span>{vShow.time || "8:30pm"}</span>
                        <span className="text-[var(--color-accent)] font-semibold">Entry Details →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 14: Soundwave Visualizer Bar */}
            {upcomingShowStyle === 14 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    >
                      {/* Fake Equalizer Bars */}
                      <div className="flex items-end gap-1 h-6 mb-3">
                        <span className="w-1 bg-cyan-500 h-3 group-hover:h-5 transition-all" />
                        <span className="w-1 bg-cyan-400 h-5 group-hover:h-3 transition-all" />
                        <span className="w-1 bg-cyan-300 h-2 group-hover:h-6 transition-all" />
                        <span className="w-1 bg-cyan-500 h-6 group-hover:h-4 transition-all" />
                        <span className="w-1 bg-cyan-400 h-4 group-hover:h-5 transition-all" />
                        <span className="text-[10px] text-cyan-400 font-mono ml-2">LIVE AUDIO EQ</span>
                      </div>
                      <div className="text-xl font-black text-white">{month} {day} &bull; {weekday}</div>
                      <h3 className="mt-1 font-semibold text-white group-hover:text-cyan-300 truncate">
                        {vShow.venue_name}
                      </h3>
                      <p className="text-xs text-white/60">{vShow.city}, {vShow.state}</p>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 15: Stadium Jumbotron Display */}
            {upcomingShowStyle === 15 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group rounded-xl border-2 border-amber-500/40 bg-black p-5 shadow-2xl transition-all hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-amber-500 tracking-wider">
                        <span>● JUMBOTRON FEED</span>
                        <span>{weekday.toUpperCase()}</span>
                      </div>
                      <div className="my-2 text-3xl font-black tracking-wider text-amber-400 font-mono">
                        {month} {day}
                      </div>
                      <h3 className="text-sm font-bold uppercase text-white group-hover:text-amber-300 truncate">
                        {vShow.venue_name}
                      </h3>
                      <div className="mt-3 flex items-center justify-between border-t border-amber-900/40 pt-2 text-[11px] font-mono text-amber-400/80">
                        <span>{vShow.city}</span>
                        <span>ENTER ARENA →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 16: Magnetic Polaroid Snap */}
            {upcomingShowStyle === 16 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group rounded-xl border border-white/20 bg-neutral-900 p-4 shadow-xl transition-all hover:rotate-1 hover:border-white"
                    >
                      <div className="rounded-lg bg-black/60 p-4 text-center border border-white/10 mb-3">
                        <span className="text-2xl font-black text-white">{month} {day}</span>
                        <div className="text-xs text-purple-300 font-medium">{weekday} • {vShow.time || "8:30pm"}</div>
                      </div>
                      <h3 className="font-bold text-white group-hover:text-[var(--color-accent)] truncate">
                        {vShow.venue_name}
                      </h3>
                      <p className="text-xs text-white/50">{vShow.city}, {vShow.state}</p>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 17: Sunset Gradient Duotone */}
            {upcomingShowStyle === 17 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-rose-950/40 via-purple-950/40 to-indigo-950/40 p-5 transition-all hover:border-rose-400/50 hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]"
                    >
                      <div className="text-xs font-bold text-rose-300 uppercase tracking-widest">{weekday}</div>
                      <div className="text-3xl font-black text-white my-1">{month} {day}</div>
                      <h3 className="font-semibold text-white group-hover:text-rose-200 truncate">{vShow.venue_name}</h3>
                      <p className="text-xs text-white/60">{vShow.city}, {vShow.state}</p>
                      <div className="mt-4 text-xs font-medium text-rose-400 group-hover:underline">
                        Concert Details →
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 18: Split Metro Transit Tile */}
            {upcomingShowStyle === 18 && (
              <div className="flex flex-col gap-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group flex items-center justify-between rounded-xl border border-white/10 bg-neutral-950 p-4 transition-all hover:border-blue-400"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-black text-white text-xs">
                          {month}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{day} ({weekday})</span>
                            <span className="text-xs text-blue-400 font-mono">STOP // 7TH HEAVEN</span>
                          </div>
                          <p className="text-xs text-white/60">{vShow.venue_name} &bull; {vShow.city}</p>
                        </div>
                      </div>
                      <span className="text-xs text-blue-400 font-semibold group-hover:text-white">
                        Board Tour →
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 19: Carbon Fiber Rocker */}
            {upcomingShowStyle === 19 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group rounded-2xl border-2 border-neutral-700 bg-neutral-900 p-5 shadow-2xl transition-all hover:border-[var(--color-accent)]"
                    >
                      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                        <span>STAGE PASS</span>
                        <span>{vShow.time || "8:30 PM"}</span>
                      </div>
                      <div className="my-2 text-2xl font-black text-white">{month} {day}</div>
                      <h3 className="font-bold text-white group-hover:text-[var(--color-accent)] truncate">
                        {vShow.venue_name}
                      </h3>
                      <p className="text-xs text-white/50">{vShow.city}, {vShow.state}</p>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* STYLE 20: Clean Modern Minimalist Card (Default Project Style) */}
            {upcomingShowStyle === 20 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {upcomingVenueShows.map((vShow) => {
                  const { month, day, weekday } = formatShowBadge(vShow.date);
                  return (
                    <Link
                      key={vShow.id}
                      href={`/shows/${vShow.id}`}
                      className="group flex flex-col justify-between rounded-none bg-purple-950/[0.15] p-5 transition-all hover:bg-purple-900/[0.25]"
                    >
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          {renderDateBadge(month, day, weekday)}
                          {vShow.time && (
                            <span className="text-xs text-white/50">{vShow.time}</span>
                          )}
                        </div>
                        <h3 className="mb-1 font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                          {vShow.venue_name}
                        </h3>
                        <p className="text-xs text-white/60">
                          {vShow.city}{vShow.state ? `, ${vShow.state}` : ""}
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
            )}
          </section>
        )}

        {/* ── RELATED / NEARBY SHOWS SECTION ────────────────────────── */}
        {relatedShows && relatedShows.length > 0 && (
          <section
            id="related-shows"
            aria-labelledby="related-shows-heading"
            className="mt-12 border-t border-white/10 pt-10"
          >
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="title-group title-group--section">
                <h2 id="related-shows-heading" className="flex items-center">
                  <span className="text-[var(--color-accent)]"></span>
                  {show.city ? `More Shows in & Near ${show.city}` : "Shows in this Area"}
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
                    className="group flex flex-col justify-between rounded-none bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06]"
                  >
                    <div>
                      {/* Date badge */}
                      <div className="mb-3 flex items-center justify-between">
                        {renderDateBadge(month, day, weekday)}
                        {rel.time && (
                          <span className="text-xs text-white/50">{rel.time}</span>
                        )}
                      </div>

                      <h3 className="mb-1 font-heading text-lg sm:text-xl uppercase tracking-wide text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                        {rel.venue_name}
                      </h3>

                      <p className="font-body text-xs text-white/60">
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

        {/* ── CONCERT HISTORY TIMELINE AT THIS VENUE (AT BOTTOM) ───── */}
        {pastVenueShows.length > 0 && (
          <section
            id="venue-concert-history"
            aria-labelledby="venue-concert-history-heading"
            className="section"
          >
            <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <SectionHeader
                as="h3"
                divider={false}
                className="!mb-6"
                id="venue-concert-history-heading"
                title={
                  <span className="flex items-center gap-2">
                    <span>🗓️</span> 7th Heaven Concert History at {show.venue_name}
                  </span>
                }
                subtitle={`7th Heaven has rocked ${show.venue_name} across multiple Midwest tour runs.`}
                action={
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-[var(--color-accent)] self-start sm:self-auto">
                    {pastVenueShows.length} Past Appearance{pastVenueShows.length !== 1 ? "s" : ""}
                  </span>
                }
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {pastVenueShows.map((ps) => (
                  <div
                    key={ps.id || `${ps.year || "tour"}-${ps.date}`}
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
          </section>
        )}
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
                  📸 Fan Photo Upload
                </span>
                <h2
                  id="upload-modal-title"
                  className="mt-2 font-bold text-white text-xl"
                >
                  Upload Concert Photo
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  Share your memories from {show.venue_name}{show.city ? ` in ${show.city}` : ""}.
                </p>

                {/* Moderation Review Notice */}
                <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-purple-200">
                  <span className="text-base shrink-0">🛡️</span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">Community Review Notice</p>
                    <p className="text-[11px] text-white/70 leading-relaxed font-sans">
                      To keep the fan gallery high-quality and safe, all submitted photos are reviewed by our team before going live on the show page.
                    </p>
                  </div>
                </div>
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
      {/* ── IMAGE / MEDIA FULLSCREEN LIGHTBOX MODAL ────────────────── */}
      {mounted &&
        !!activeFullscreenMedia &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen View: ${activeFullscreenMedia.name}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md"
            onClick={() => setActiveFullscreenMedia(null)}
          >
            <div
              className="relative flex flex-col items-center justify-center max-w-5xl max-h-[92vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveFullscreenMedia(null)}
                className="cursor-pointer absolute -top-12 right-0 sm:top-4 sm:right-4 z-20 rounded-full bg-black/80 p-2.5 text-white hover:bg-black border border-white/20 transition-colors"
                aria-label="Close fullscreen view"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="relative w-full max-h-[78vh] aspect-video overflow-hidden rounded-[var(--radius-box)] border border-white/20 bg-black shadow-2xl flex items-center justify-center">
                <Image
                  src={activeFullscreenMedia.src}
                  alt={activeFullscreenMedia.name}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="mt-4 w-full text-center">
                <h3 className="font-heading text-xl sm:text-2xl uppercase tracking-wide text-white">
                  {activeFullscreenMedia.name}
                </h3>
                {activeFullscreenMedia.caption && (
                  <p className="mt-1 text-sm sm:text-base text-white/80 font-body max-w-2xl mx-auto">
                    "{activeFullscreenMedia.caption}"
                  </p>
                )}
                {activeFullscreenMedia.date && (
                  <p className="mt-1 font-mono text-xs text-purple-300">
                    {activeFullscreenMedia.date} {activeFullscreenMedia.instagram ? `• ${activeFullscreenMedia.instagram}` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
      {/* ── NOTIFICATION MODAL ────────────────────────────────────── */}
      {mounted &&
        notifyModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Concert Notifications Modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setNotifyModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-box)] border border-purple-500/30 bg-[#0c0817] p-6 shadow-2xl font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setNotifyModalOpen(false)}
                className="cursor-pointer absolute top-4 right-4 z-10 rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-2">
                  <span>🔔</span> Live Show Alerts
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Get Notified for {show.venue_name}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans">
                  Be the first to know about upcoming concerts, ticket drops, door times, and special announcements for 7th Heaven at this venue.
                </p>
              </div>

              {notifySuccess ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <p className="text-sm font-bold text-emerald-400 mb-1">✓ You're on the VIP list!</p>
                  <p className="text-xs text-white/70 font-sans">We will notify you with show updates and announcements.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifyModalOpen(false);
                      setNotifySuccess(false);
                    }}
                    className="mt-4 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleNotifyMe} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-purple-300 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@domain.com"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  {notifyError && (
                    <p className="text-xs text-red-400">{notifyError}</p>
                  )}

                  <SeventhButton
                    type="submit"
                    disabled={notifyLoading}
                    icon={false}
                    className="w-full text-xs py-2.5 disabled:opacity-50"
                  >
                    {notifyLoading ? "Subscribing..." : "🔔 Keep Me Posted"}
                  </SeventhButton>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
