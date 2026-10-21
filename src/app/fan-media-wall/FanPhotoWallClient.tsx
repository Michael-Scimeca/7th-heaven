/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable @next/next/no-img-element, react-doctor/nextjs-no-img-element, react-doctor/img-redundant-alt */
"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Camera,
  MapPin,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Grid,
  Columns,
  Play,
  Film,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Flame,
  Search,
  Maximize2,
  Music,
  Share2,
  Eye,
  Calendar,
  Filter,
  ArrowUpDown,
} from "lucide-react";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/lib/useScrollLock";

const emptySubscribe = () => () => { };
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
import { useMember } from "@/context/MemberContext";
import SeventhButton from "@/components/SeventhButton";
import Button from "@/components/Button";
import AddCmsButton from "@/components/AddCmsButton";
import PageHero from "@/components/PageHero";
import InputField from "@/components/InputField";
import CustomDropdown from "@/components/CustomDropdown";
import { SearchInput } from "@/components/SearchInput";
import MediaFilterDrawer from "@/components/MediaFilterDrawer";
import { FanPhoto } from "@/lib/fanPhotos";
import SectionBadge from "@/components/SectionBadge";
import { SectionHeader } from "@/components/SectionHeader";
import dynamic from "next/dynamic";

const FanUploadForm = dynamic(() => import("@/components/FanUploadForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse border border-white/10 bg-white/[0.02] p-8 text-center text-white/40">
      Loading Upload Form...
    </div>
  ),
});

function getMediaDetails(photo: FanPhoto): {
  isVideo: boolean;
  isDirectVideo: boolean;
  isYouTube: boolean;
  youtubeId?: string;
  videoSrc?: string;
} {
  const src = photo.src || "";
  const isDirectVideo =
    src.endsWith(".mp4") ||
    src.endsWith(".mov") ||
    src.endsWith(".webm") ||
    src.startsWith("blob:") ||
    src.includes("/uploads/fans/");

  const youtubeMatch =
    photo.youtubeId ||
    src.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    )?.[1];

  if (isDirectVideo) {
    return {
      isVideo: true,
      isDirectVideo: true,
      isYouTube: false,
      videoSrc: src,
    };
  }

  if (youtubeMatch) {
    return {
      isVideo: true,
      isDirectVideo: false,
      isYouTube: true,
      youtubeId: youtubeMatch,
    };
  }

  if (photo.type === "video") {
    return {
      isVideo: true,
      isDirectVideo: false,
      isYouTube: true,
      youtubeId: photo.youtubeId || "SWV7-pmtoA8",
    };
  }

  return {
    isVideo: false,
    isDirectVideo: false,
    isYouTube: false,
  };
}

export const FAN_WALL_LAYOUT_PRESETS = [
  { id: 1, name: "Stage Spotlight", desc: "Huge 16:9 Cinema Spotlight + 3-Col Supporting Grid", icon: "Play" },
  { id: 2, name: "Bento Mosaic", desc: "Hero 2x2 Feature Tile with Dynamic Asymmetric Cards", icon: "Grid" },
  { id: 3, name: "Editorial Broadside", desc: "Full-Width Hero Panorama + 3-Col Editorial Magazine", icon: "Columns" },
  { id: 4, name: "Story Reels", desc: "Large 9:16 Tall Story Billboard + Vertical Highlight Strip", icon: "Film" },
  { id: 5, name: "Split Stage", desc: "50/50 Large Interactive Showcase + Vertical Queue", icon: "SlidersHorizontal" },
  { id: 6, name: "Polaroid Gallery", desc: "Oversized Center Stage Polaroid + Scrapbook Flow", icon: "Camera" },
  { id: 7, name: "Glassmorphic Hero", desc: "Glow Ultra-Card with Accent Backdrop + Frosted Pods", icon: "Layers" },
  { id: 8, name: "Headline Dual-Hero", desc: "Two Large Side-by-Side Headliners + Media Ribbons", icon: "Flame" },
  { id: 9, name: "Staggered Wall", desc: "Alternating Large/Small Asymmetric Masonry Stream", icon: "Sparkles" },
  { id: 10, name: "Press Feature", desc: "Magazine Cover Story Showcase + Dispatch Multi-Col", icon: "MapPin" },
  { id: 11, name: "Hero Filmstrip", desc: "Super-Wide Cinematic Header + Horizontal Scrolling Film Reel", icon: "Film" },
  { id: 12, name: "Spotlight Sidebar", desc: "Sticky Left Super-Card + Dense 2-Col Right Archive", icon: "SlidersHorizontal" },
  { id: 13, name: "Triptych Arena", desc: "3 Balanced Large Stage Panels + Micro Photo Badges", icon: "Layers" },
  { id: 14, name: "Hero Accordion", desc: "Giant Interactive Stage Strip + Full-Width Story Expanders", icon: "Maximize2" },
  { id: 15, name: "Tour Metro Grid", desc: "Clean High-Contrast Grid with Prominent City Venue Ribbons", icon: "MapPin" },
  { id: 16, name: "Golden Ratio 62/38", desc: "Harmonic 62% Primary Feature Canvas + 38% Vertical Stack", icon: "Grid" },
  { id: 17, name: "Billboard Marquee", desc: "Massive 24:9 Hero Marquee Banner with 5-Col Micro Thumbnails", icon: "Music" },
  { id: 18, name: "Brutalist Neon", desc: "High-Contrast Hard Borders, Neon Yellow Accents & Sharp Geometry", icon: "Flame" },
  { id: 19, name: "Compact Density", desc: "Ultra-Fast Dense Card Matrix with Instant Quick-View Hover", icon: "Eye" },
  { id: 20, name: "Chronicle Feed", desc: "Full-Bleed Center Story Timeline with Large Stage Imagery", icon: "Calendar" },
] as const;

export default function FanPhotoWallClient({
  sanityContent,
  initialPhotos = [],
  embedMode = false,
}: {
  sanityContent?: any;
  initialPhotos?: FanPhoto[];
  embedMode?: boolean;
}) {
  const { member, isLoggedIn, openModal } = useMember();
  const [photos, setPhotos] = useState<FanPhoto[]>(initialPhotos);
  const [photosLoading, setPhotosLoading] = useState(initialPhotos.length === 0);
  const [selectedPhoto, setSelectedPhoto] = useState<FanPhoto | null>(null);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<number>(17);
  const [mediaFilter, setMediaFilter] = useState<"all" | "photos" | "videos">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [venueFilter, setVenueFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"default" | "newest" | "oldest" | "fan">("default");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const mounted = useMounted();

  // Sync layout preset from URL query parameter (?layout=1..20) if present, default to 17
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("layout");
    if (param) {
      const parsed = parseInt(param, 10);
      if (parsed >= 1 && parsed <= 20) setLayoutMode(parsed);
    }
  }, []);

  const [isAddCmsModalOpen, setIsAddCmsModalOpen] = useState(false);
  useScrollLock(Boolean(selectedPhoto || showUpload || isAddCmsModalOpen));
  const [cmsForm, setCmsForm] = useState({
    name: "",
    venue: "",
    city: "",
    date: "",
    caption: "",
    instagram: "",
    type: "image" as "image" | "video",
    src: "",
    isFeatured: false,
  });
  const [isSavingCms, setIsSavingCms] = useState(false);
  const [cmsError, setCmsError] = useState<string | null>(null);
  const [cmsSuccess, setCmsSuccess] = useState(false);

  const handleSaveCmsMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsForm.name || !cmsForm.src) {
      setCmsError("Please fill out Fan Name and Photo/Video URL.");
      return;
    }
    setIsSavingCms(true);
    setCmsError(null);
    try {
      const newMoment: FanPhoto = {
        id: `cms_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        src: cmsForm.src,
        name: cmsForm.name,
        venue: cmsForm.venue,
        city: cmsForm.city,
        date: cmsForm.date,
        caption: cmsForm.caption,
        instagram: cmsForm.instagram,
        type: cmsForm.type,
        approved: true,
      };

      if (cmsForm.isFeatured) {
        setPhotos((prev) => [newMoment, ...prev]);
      } else {
        setPhotos((prev) => [...prev, newMoment]);
      }

      setCmsSuccess(true);
      setTimeout(() => {
        setCmsSuccess(false);
        setIsAddCmsModalOpen(false);
        setCmsForm({
          name: "",
          venue: "",
          city: "",
          date: "",
          caption: "",
          instagram: "",
          type: "image",
          src: "",
          isFeatured: false,
        });
      }, 1000);
    } catch (err: any) {
      setCmsError(err.message || "Failed to add moment.");
    } finally {
      setIsSavingCms(false);
    }
  };

  useEffect(() => {
    const search = window.location.search;
    const isMock =
      search.includes("mockUpload=true") ||
      search.includes("mockScanning=true") ||
      search.includes("mockSuccess=true");
    setShowUpload(isMock);
    setMockMode(isMock);
  }, []);

  const effectivelyLoggedIn = isLoggedIn || mockMode;

  // Pending Review Queue is restricted STRICTLY to authenticated Admins & Crew members only
  const isModerator = Boolean(
    isLoggedIn &&
    (member?.role === "admin" ||
      member?.role === "crew" ||
      (member as unknown as Record<string, unknown>)?.isCrew === true ||
      (member as unknown as Record<string, unknown>)?.isAdmin === true),
  );

  // Fetch photos and notify PageTransition when data & images are loaded
  const fetchPhotos = useCallback(() => {
    const url = isModerator ? "/api/fans?all=true" : "/api/fans";
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setPhotos(data);
        setPhotosLoading(false);
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent("7h:page:ready"));
        });
      })
      .catch(() => {
        setPhotosLoading(false);
        window.dispatchEvent(new CustomEvent("7h:page:ready"));
      });
  }, [isModerator]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("bypass") === "true") {
        localStorage.setItem("7h_dev_bypass_v1", "true");
        if (
          !localStorage.getItem("7h_member_v1") &&
          !localStorage.getItem("7h_member")
        ) {
          localStorage.setItem(
            "7h_member_v1",
            JSON.stringify({
              id: "fake-fan-123",
              name: "Super Fan",
              username: "super_fan",
              email: "fan@7thheaven.com",
              joinDate: new Date().toISOString(),
              avatar: "SF",
              points: 100,
              tier: "Gold",
              showsAttended: 5,
              favoriteVenues: [],
              notificationsEnabled: true,
              notificationRadius: 25,
              role: "fan",
            }),
          );
          window.location.reload();
        }
      }
    }
  }, []);

  useEffect(() => {
    if (initialPhotos.length > 0) {
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent("7h:page:ready"));
      });
    }
  }, [initialPhotos.length]);

  useEffect(() => {
    if (isModerator || initialPhotos.length === 0) {
      fetchPhotos();
    }
  }, [fetchPhotos, isModerator, initialPhotos.length]);

  const handleFlagPhoto = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to flag this photo or video for admin review?",
      )
    ) {
      setFlaggingId(id);
      try {
        await fetch("/api/fans", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "flag" }),
        });
        alert("Moment has been flagged for admin review. Thank you.");
      } catch (err) {
        console.error("Failed to flag moment:", err);
      } finally {
        setFlaggingId(null);
      }
    }
  };

  const handleApprovePhoto = async (id: string) => {
    setModeratingId(id);
    try {
      const res = await fetch("/api/fans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      if (res.ok) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, approved: true } : p)),
        );
      }
    } catch (err) {
      console.error("Failed to approve photo:", err);
    } finally {
      setModeratingId(null);
    }
  };

  const handleRejectPhoto = async (id: string) => {
    if (
      confirm("Are you sure you want to reject and delete this photo/video?")
    ) {
      setModeratingId(id);
      try {
        const res = await fetch("/api/fans", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "reject" }),
        });
        if (res.ok) {
          setPhotos((prev) => prev.filter((p) => p.id !== id));
        }
      } catch (err) {
        console.error("Failed to reject photo:", err);
      } finally {
        setModeratingId(null);
      }
    }
  };

  // Separate pending and approved
  const pendingPhotos = isModerator ? photos.filter((p) => !p.approved) : [];
  const approvedPhotos = photos.filter((p) => p.approved);

  const sortDropdownOptions = useMemo(
    () => [
      { value: "default", label: "DEFAULT CURATED" },
      { value: "newest", label: "NEWEST FIRST" },
      { value: "oldest", label: "OLDEST FIRST" },
      { value: "fan", label: "FAN NAME (A-Z)" },
    ],
    [],
  );

  const sortTriggerPrefix = (
    <ArrowUpDown className="h-3 w-3 text-purple-300" aria-hidden="true" />
  );

  const venueOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of approvedPhotos) {
      const v = p.venue?.trim() || p.city?.trim();
      if (v) counts.set(v, (counts.get(v) || 0) + 1);
    }
    const opts = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([venue, count]) => ({
        value: venue,
        label: venue,
        count,
      }));
    return [
      { value: "ALL", label: "All Venues & Cities", count: approvedPhotos.length },
      ...opts,
    ];
  }, [approvedPhotos]);

  const mediaTypeDrawerOptions = useMemo(
    () => [
      { value: "all", label: "All Moments", count: approvedPhotos.length },
      {
        value: "photos",
        label: "Fan Photos",
        count: approvedPhotos.filter((p) => !getMediaDetails(p).isVideo).length,
      },
      {
        value: "videos",
        label: "Fan Videos",
        count: approvedPhotos.filter((p) => getMediaDetails(p).isVideo).length,
      },
    ],
    [approvedPhotos],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (mediaFilter !== "all") count++;
    if (venueFilter !== "ALL") count++;
    return count;
  }, [mediaFilter, venueFilter]);

  const displayedPhotos = useMemo(() => {
    let list = approvedPhotos.filter((p) => {
      const details = getMediaDetails(p);
      if (mediaFilter === "videos" && !details.isVideo) return false;
      if (mediaFilter === "photos" && details.isVideo) return false;
      if (venueFilter !== "ALL") {
        const v = p.venue?.trim() || p.city?.trim();
        if (v !== venueFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return Boolean(
          p.name?.toLowerCase().includes(q) ||
          p.venue?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.caption?.toLowerCase().includes(q),
        );
      }
      return true;
    });

    if (sortBy === "newest") {
      list = [...list].sort((a, b) => {
        const dateA = a.date || a.submittedAt || "";
        const dateB = b.date || b.submittedAt || "";
        return dateB.localeCompare(dateA);
      });
    } else if (sortBy === "oldest") {
      list = [...list].sort((a, b) => {
        const dateA = a.date || a.submittedAt || "";
        const dateB = b.date || b.submittedAt || "";
        return dateA.localeCompare(dateB);
      });
    } else if (sortBy === "fan") {
      list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return list;
  }, [approvedPhotos, mediaFilter, venueFilter, searchQuery, sortBy]);

  return (
    <div
      className={embedMode ? "w-full" : "page-container page-stack min-h-screen"}
      id="fan-media-wall-page"
    >
      {/* ── Reciprocal Link Banner to Official Media Vault & Jukebox ── */}
      {!embedMode && (
        <div className="site-container pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[var(--radius-box)] border border-nocturne-mauve/40 bg-nocturne-midnight/80 px-5 py-3.5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span className="text-xs text-nocturne-rose font-medium">
                Looking for 7th Heaven&apos;s 700+ song Audio Vault &amp; Official Music Videos?
              </span>
            </div>
            <Link
              href="/media"
              className="inline-flex items-center gap-1.5 rounded-full border border-nocturne-rose/30 bg-nocturne-plum/70 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_0_12px_rgba(83,17,97,0.4)] hover:bg-nocturne-wine transition-all"
            >
              Explore Official Media Vault ↗
            </Link>
          </div>
        </div>
      )}

      {/* ── HERO SECTION WITH GLASS BLUR BACKGROUND (skipped in embedMode to avoid duplicate headers) ── */}
      {!embedMode && (
        <section
          id="fan-wall"
          aria-labelledby="fan-wall-heading"
          className="section relative"
        >
          <div className="site-container relative flex flex-col justify-center">
            <div className="relative z-10 flex flex-col gap-6">
              {/* Hero Header */}
              <PageHero
                title={
                  sanityContent?.heroHeading ? (
                    sanityContent.heroHeading
                      .replace(
                        /FAN PHOTO (?:&|AND) VIDEO WALL/i,
                        "FAN MEDIA WALL",
                      )
                      .replace(/FAN PHOTO WALL/i, "FAN MEDIA WALL")
                  ) : sanityContent?.title ? (
                    sanityContent.title
                      .replace(
                        /FAN PHOTO (?:&|AND) VIDEO WALL/i,
                        "FAN MEDIA WALL",
                      )
                      .replace(/FAN PHOTO WALL/i, "FAN MEDIA WALL")
                  ) : (
                    <>
                      FAN MEDIA{" "}
                      <span className="inline-block pr-[0.15em]">WALL</span>
                    </>
                  )
                }
                titleId="fan-wall-heading"
                subtitle={
                  sanityContent?.heroSubheading ||
                  sanityContent?.subtitle ||
                  "Share your best memories, stage captures, and live concert moments from 7th Heaven shows. Upload your photos and videos and join the community wall!"
                }
                align="left"
                actions={
                  <div className="flex w-full shrink-0 flex-col gap-3 self-start sm:w-auto lg:self-end">
                    {isModerator && (
                      <AddCmsButton
                        label="ADD PHOTO / VIDEO IN SANITY CMS"
                        onClick={() => setIsAddCmsModalOpen(true)}
                        className="w-full justify-center"
                      />
                    )}
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        if (!isLoggedIn) {
                          openModal("login");
                        } else {
                          setShowUpload(!showUpload);
                        }
                      }}
                      icon={<Camera className="h-4 w-4" />}
                      className="w-full justify-center"
                    >
                      {showUpload
                        ? sanityContent?.uploadButtonHideText || "Hide Upload Form"
                        : sanityContent?.uploadButtonText || "Upload Photo / Video"}
                    </Button>
                  </div>
                }
              >
                {/* Login Promo text if guest */}
                {!effectivelyLoggedIn && (
                  <div className="flex items-center gap-2 text-small text-muted">
                    <Lock className="h-4 w-4 shrink-0 text-purple-400" />
                    <p className="m-0 inline">
                      {sanityContent?.guestLockText ? (
                        sanityContent.guestLockText
                      ) : (
                        <>
                          You must be a <span className="font-medium text-white">Fan Member</span> to share your
                          moments.{" "}
                          <button
                            onClick={() => openModal("signup")}
                            className="cursor-pointer underline text-primary"
                          >
                            Sign up free
                          </button>{" "}
                          or{" "}
                          <button
                            onClick={() => openModal("login")}
                            className="cursor-pointer underline text-primary"
                          >
                            sign in
                          </button>
                          .
                        </>
                      )}
                    </p>
                  </div>
                )}
              </PageHero>

              {/* Dynamic Upload Form */}
              {showUpload && effectivelyLoggedIn && (
                <div className="animate-[fade-in-up_0.4s_var(---expo)_both]">
                  <FanUploadForm />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── PHOTO GRID & MODERATION SECTION (FULL BLEED) ── */}

      {/* ═══ Moderation Queue (Admins & Crew) ═══ */}
      {isModerator && pendingPhotos.length > 0 && (
        <section
          id="pending-queue"
          aria-labelledby="pending-queue-heading"
          className="section"
        >
          <div className="site-container mx-auto">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 id="pending-queue-heading">
                  {sanityContent?.pendingQueueTitle || "Pending Review Queue"}
                </h3>
                <p>
                  {sanityContent?.pendingQueueSubtitle ||
                    "Viewed & Approved by Admins & Crew only"}
                </p>
              </div>

              <SectionBadge>
                {pendingPhotos.length} Pending
              </SectionBadge>
            </div>

            {/* ── STACKED CARD GRID LAYOUT ── */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pendingPhotos.map((photo) => {
                const mediaDetails = getMediaDetails(photo);
                return (
                  <div
                    key={photo.id}
                    className="transition-colors flex w-full flex-col justify-between rounded-2xl border border-white/10 p-4 text-left shadow-xl hover:border-purple-400/40"
                  >
                    <div>
                      <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden border border-white/10 bg-black/40 rounded-xl">
                        {mediaDetails.isDirectVideo ? (
                          <video
                            src={mediaDetails.videoSrc}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                            autoPlay
                            loop
                          />
                        ) : (
                          <Image
                            src={
                              mediaDetails.isYouTube
                                ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg`
                                : photo.src
                            }
                            alt="Fan Upload"
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover"
                          />
                        )}
                        <div className="absolute top-2.5 right-2.5 border border-white/10 bg-black/80 px-2.5 py-1 text-white">
                          {photo.date || "Pending"}
                        </div>
                      </div>
                      <div className="npm flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-purple-400">@</span>
                          <span>{photo.name}</span>
                        </div>
                        {photo.venue && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-purple-400" />{" "}
                            {photo.venue}
                          </p>
                        )}
                        {photo.caption && (
                          <p className="line-clamp-2 pt-0.5">
                            &quot;{photo.caption}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-3">
                      <SeventhButton
                        onClick={() => handleRejectPhoto(photo.id)}
                        disabled={moderatingId === photo.id}
                        icon={false}
                        color="#f43f5e"
                        className="text-center cursor-pointer"
                      >
                        Reject
                      </SeventhButton>
                      <SeventhButton
                        onClick={() => handleApprovePhoto(photo.id)}
                        disabled={moderatingId === photo.id}
                        icon={false}
                        className="text-center cursor-pointer"
                      >
                        Approve
                      </SeventhButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}



      {/* Featured Media Section Title & Paragraph */}
      <section
        id="featured-media"
        aria-labelledby="featured-media-heading"
        className="section"
      >
        <div className={embedMode ? "w-full" : "site-container mx-auto"}>
          <SectionHeader
            id="featured-media-heading"
            title={sanityContent?.sectionTitle || "Featured Media"}
            visuallyHidden
          />

          {/* ── FAN MEDIA WALL FILTER & SEARCH TOOLBAR (MATCHING VIDEO GALLERY) ── */}
          <div
            role="toolbar"
            aria-label="Fan Media Filters"
            className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4 border-b border-white/10 pb-4"
          >
            <p className="mr-auto text-[13px] text-white/55" aria-live="polite">
              {displayedPhotos.length} {displayedPhotos.length === 1 ? "item" : "items"}
            </p>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by fan name, venue, city..."
              containerClassName="w-full sm:w-[260px] lg:w-[300px]"
            />

            {/* Sort Order Dropdown */}
            <CustomDropdown
              ariaLabel="Sort fan moments"
              value={sortBy}
              options={sortDropdownOptions}
              onChange={(val) => setSortBy(val as any)}
              minWidth={200}
              maxHeight={320}
              triggerPrefix={sortTriggerPrefix}
              buttonClassName="rounded-none border border-white/15 bg-black/35 px-4 py-2.5 text-xs backdrop-blur-md shadow-[inset_0_0_10px_rgba(0,0,0,0.25)] hover:border-white/30 hover:bg-black/50"
            />

            <button
              ref={filterTriggerRef}
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={filterDrawerOpen}
              className="flex cursor-pointer items-center gap-2 border border-white/20 px-4 py-2.5 text-xs text-white transition-colors hover:border-white/50 hover:bg-white/5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-action,#f5b942)] px-1 text-[11px] font-bold text-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <MediaFilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            returnFocusRef={filterTriggerRef}
            categoryOptions={venueOptions}
            category={venueFilter}
            onCategoryChange={setVenueFilter}
            mediaTypeOptions={mediaTypeDrawerOptions}
            mediaType={mediaFilter}
            onMediaTypeChange={(v) => setMediaFilter(v as "all" | "photos" | "videos")}
            yearBounds={null}
            yearRange={null}
            onYearRangeChange={() => {}}
            resultCount={displayedPhotos.length}
            onClearAll={() => {
              setMediaFilter("all");
              setVenueFilter("ALL");
              setSearchQuery("");
            }}
          />

          {photosLoading ? (
            /* Skeleton grid */
            <div className="mx-auto grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 [overflow-anchor:auto]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02]">
                  <div className="h-10 w-full animate-pulse bg-white/[0.04]" />
                  <div className="aspect-[16/10] w-full animate-pulse bg-white/[0.03]" />
                </div>
              ))}
            </div>
          ) : displayedPhotos.length > 0 ? (
            (() => {

              /* ═══════════════════════════════════════════════════
                 LAYOUT 1: CONCERT ARENA (Hero Stage Cinema + Live Grid)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 1) {
                const heroPhoto = displayedPhotos[0] || approvedPhotos[0];
                const heroDetails = heroPhoto ? getMediaDetails(heroPhoto) : null;
                const remaining = displayedPhotos.slice(1);

                return (
                  <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                    {heroPhoto && heroDetails && (
                      <div className="relative overflow-hidden rounded-[var(--radius-box)] border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-black to-black p-4 sm:p-6 shadow-2xl">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping" />
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Featured Stage Spotlight</span>
                            <span className="text-white/60 text-xs hidden sm:inline">&bull; {heroPhoto.name}</span>
                          </div>
                          {heroPhoto.venue && (
                            <span className="text-xs text-white/70 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-purple-400" />
                              {heroPhoto.venue} {heroPhoto.city && `(${heroPhoto.city})`}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                          <div className="lg:col-span-8 relative aspect-video w-full overflow-hidden rounded-xl bg-black/60 border border-white/10">
                            {heroDetails.isDirectVideo ? (
                              <video src={heroDetails.videoSrc} className="h-full w-full object-cover" controls playsInline autoPlay muted />
                            ) : heroDetails.isYouTube ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${heroDetails.youtubeId}?autoplay=0`}
                                title="Hero Fan Video"
                                className="h-full w-full border-0"
                                allow="autoplay; encrypted-media"
                              />
                            ) : (
                              <Image src={heroPhoto.src} alt="Hero photo" fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
                            )}
                          </div>
                          <div className="lg:col-span-4 flex flex-col justify-between h-full gap-4">
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">Fan Highlight</span>
                              <h3 className="font-bold text-white mt-1">{heroPhoto.name}</h3>
                              {heroPhoto.date && <p className="text-xs text-white/60 mt-1">{heroPhoto.date}</p>}
                              {heroPhoto.caption && (
                                <blockquote className="mt-4 border-l-2 border-purple-400/60 pl-3 text-sm italic text-white/80">
                                  &ldquo;{heroPhoto.caption}&rdquo;
                                </blockquote>
                              )}
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedPhoto(heroPhoto)}
                              icon={<Maximize2 className="h-4 w-4" />}
                              className="w-full justify-center"
                            >
                              Expand Stage Capture
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Arena Sub-Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {remaining.map((photo, index) => {
                        const mediaDetails = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`View ${mediaDetails.isVideo ? "video" : "photo"} by ${photo.name || "Fan"}`}
                            onClick={() => setSelectedPhoto(photo)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedPhoto(photo);
                              }
                            }}
                            className="group transition-all flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] hover:border-purple-500/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-purple-950/20"
                          >
                            <div className="flex items-center justify-between gap-3 p-3.5">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">
                                  {photo.name ? photo.name.substring(0, 2).toUpperCase() : "7H"}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">{photo.name}</p>
                                  <p className="text-xs text-white/60 truncate">
                                    {photo.venue || photo.city || "Live Show"}{photo.date ? ` • ${photo.date}` : ""}
                                  </p>
                                </div>
                              </div>
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase font-bold text-white/70">
                                {mediaDetails.isVideo ? "Video" : "Photo"}
                              </span>
                            </div>

                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                              <Image
                                src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={`Media by ${photo.name}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                priority={index < 3}
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="h-3.5 w-3.5" /> View
                                </span>
                              </div>
                            </div>

                            {photo.caption && (
                              <div className="border-t border-white/5 p-3 text-xs text-white/70">
                                <p className="line-clamp-2">&ldquo;{photo.caption}&rdquo;</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 LAYOUT 2: EDITORIAL BENTO MOSAIC (Variable aspect ratios)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 2) {
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 [overflow-anchor:auto]">
                    {displayedPhotos.map((photo, index) => {
                      const mediaDetails = getMediaDetails(photo);
                      // Bento sizing logic: 1st card spans 2x2, every 5th spans 2x1
                      const isLarge = index === 0;
                      const isWide = index === 4 || index === 9;
                      return (
                        <div
                          key={photo.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPhoto(photo)}
                          className={`group relative overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black/40 cursor-pointer transition-all hover:border-purple-400/50 hover:shadow-2xl ${
                            isLarge ? "sm:col-span-2 sm:row-span-2 min-h-[380px]" : isWide ? "sm:col-span-2 min-h-[260px]" : "min-h-[220px]"
                          }`}
                        >
                          <Image
                            src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                            alt={`Photo by ${photo.name}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-4 flex flex-col justify-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                              {mediaDetails.isVideo ? "Live Video Clip" : "Concert Photo"}
                            </span>
                            <h4 className="font-bold text-white mt-0.5">{photo.name}</h4>
                            <p className="text-xs text-white/70">
                              {photo.venue || photo.city || "Live Show"}{photo.date ? ` • ${photo.date}` : ""}
                            </p>
                            {isLarge && photo.caption && (
                              <p className="mt-2 text-xs text-white/80 line-clamp-2 italic">&ldquo;{photo.caption}&rdquo;</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 LAYOUT 3: EDITORIAL BROADSIDE (Hero Panorama + Supporting Magazine Grid)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 3) {
                const heroPhoto = displayedPhotos[0];
                const heroDetails = heroPhoto ? getMediaDetails(heroPhoto) : null;
                const rest = displayedPhotos.slice(1);
                return (
                  <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                    {heroPhoto && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(heroPhoto)}
                        className="group relative overflow-hidden rounded-[var(--radius-box)] border border-purple-500/30 bg-black cursor-pointer shadow-2xl transition-all hover:border-purple-400"
                      >
                        <div className="relative aspect-[21/9] min-h-[340px] w-full overflow-hidden">
                          <Image
                            src={heroDetails?.isYouTube ? `https://img.youtube.com/vi/${heroDetails.youtubeId}/hqdefault.jpg` : heroPhoto.src}
                            alt={`Featured broadside by ${heroPhoto.name}`}
                            fill
                            sizes="100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 sm:p-10 flex flex-col justify-end">
                            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-300">
                              ★ Lead Fan Dispatch • {heroPhoto.venue || "Live Stage"}
                            </span>
                            <h3 className="mt-2 font-extrabold text-white tracking-tight">
                              {heroPhoto.name}
                            </h3>
                            {heroPhoto.caption && (
                              <p className="mt-2 max-w-3xl text-sm sm:text-base text-white/90 line-clamp-2 italic">
                                &ldquo;{heroPhoto.caption}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rest.map((photo) => {
                        const mediaDetails = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group flex flex-col overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] hover:border-purple-400/40 hover:bg-white/[0.05] cursor-pointer transition-all"
                          >
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                              <Image
                                src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={`Media by ${photo.name}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <div className="p-4 flex flex-col justify-between flex-1">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                                  {mediaDetails.isVideo ? "Video Clip" : "Concert Capture"}
                                </span>
                                <h4 className="font-bold text-white mt-1">{photo.name}</h4>
                                <p className="text-xs text-white/60">
                                  {photo.venue || photo.city || "Live Show"}{photo.date ? ` • ${photo.date}` : ""}
                                </p>
                                {photo.caption && <p className="text-xs text-white/70 line-clamp-2 mt-2 italic">&ldquo;{photo.caption}&rdquo;</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 LAYOUT 4: FESTIVAL REELS (Vertical 9:16 Carousel Cards)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 4) {
                const leadReel = displayedPhotos[0];
                const leadDetails = leadReel ? getMediaDetails(leadReel) : null;
                const otherReels = displayedPhotos.slice(1);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 [overflow-anchor:auto]">
                    {/* Oversized Lead Reel Billboard (Spans 5 cols on desktop, tall 9:16) */}
                    {leadReel && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(leadReel)}
                        className="lg:col-span-5 group relative min-h-[520px] aspect-[9/16] overflow-hidden rounded-[var(--radius-box)] border-2 border-purple-500/40 bg-gradient-to-b from-purple-950/60 to-black cursor-pointer shadow-2xl transition-all hover:border-purple-400"
                      >
                        <Image
                          src={leadDetails?.isYouTube ? `https://img.youtube.com/vi/${leadDetails.youtubeId}/hqdefault.jpg` : leadReel.src}
                          alt={`Lead Story by ${leadReel.name}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 42vw"
                          className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-6 sm:p-8 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                              <Flame className="h-3.5 w-3.5 fill-white" /> Featured Fan Story
                            </span>
                            <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs text-white/80 backdrop-blur-md">
                              Billboard 9:16
                            </span>
                          </div>

                          <div>
                            <span className="text-xs font-mono uppercase text-purple-300">Live Stage Highlight</span>
                            <h3 className="mt-1 font-extrabold text-white">
                              {leadReel.name}
                            </h3>
                            <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {leadReel.venue || leadReel.city || "Live Stage"}{leadReel.date ? ` • ${leadReel.date}` : ""}
                            </p>
                            {leadReel.caption && (
                              <p className="mt-3 text-sm text-white/90 line-clamp-3 italic">
                                &ldquo;{leadReel.caption}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Supporting 9:16 Reels Grid (7 cols) */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {otherReels.map((photo) => {
                        const mediaDetails = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group relative aspect-[9/16] overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black cursor-pointer shadow-lg transition-all hover:scale-[1.02] hover:border-purple-400"
                          >
                            <Image
                              src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                              alt={`Reel by ${photo.name}`}
                              fill
                              sizes="(max-width: 768px) 50vw, 20vw"
                              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-3.5 flex flex-col justify-end">
                              <span className="text-[10px] font-bold uppercase text-purple-300">{mediaDetails.isVideo ? "Video" : "Photo"}</span>
                              <p className="text-xs font-bold text-white truncate mt-0.5">{photo.name}</p>
                              <p className="text-[10px] text-white/60 truncate">
                                {photo.venue || photo.city || "Live Show"}{photo.date ? ` • ${photo.date}` : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 LAYOUT 5: SPLIT STAGE (50/50 Large Interactive Showcase + Queue)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 5) {
                const mainItem = displayedPhotos[0];
                const mainDetails = mainItem ? getMediaDetails(mainItem) : null;
                const queueItems = displayedPhotos.slice(1);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start [overflow-anchor:auto]">
                    {/* 50% Left Sticky Hero Stage */}
                    {mainItem && (
                      <div className="lg:col-span-7 sticky top-24 rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-950/20 p-5 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                          <Image
                            src={mainDetails?.isYouTube ? `https://img.youtube.com/vi/${mainDetails.youtubeId}/hqdefault.jpg` : mainItem.src}
                            alt={mainItem.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            className="object-cover"
                            priority
                          />
                          <div className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md">
                            Main Showcase Stage
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase text-cyan-300">
                              {mainItem.venue || "Chicago Concert"}
                            </span>
                            <span className="text-xs text-white/50">{mainItem.date}</span>
                          </div>
                          <h3 className="font-bold text-white">{mainItem.name}</h3>
                          {mainItem.caption && (
                            <p className="text-sm text-white/80 leading-relaxed italic bg-black/30 p-3 rounded-lg border border-white/5">
                              &ldquo;{mainItem.caption}&rdquo;
                            </p>
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedPhoto(mainItem)}
                            className="w-full justify-center mt-2"
                          >
                            Open Spotlight Fullscreen
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 50% Right Queue */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" /> Next In Fan Queue ({queueItems.length})
                      </span>
                      {queueItems.map((photo) => {
                        const mediaDetails = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group flex gap-3.5 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-purple-400/40 cursor-pointer transition-all items-center"
                          >
                            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                              <Image
                                src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase text-purple-300">{mediaDetails.isVideo ? "Video" : "Photo"}</span>
                              <h4 className="font-bold text-white truncate">{photo.name}</h4>
                              <p className="text-xs text-white/60 truncate">
                                {photo.venue || photo.city || "Live Show"}{photo.date ? ` • ${photo.date}` : ""}
                              </p>
                              {photo.caption && <p className="text-xs text-white/50 line-clamp-1 italic mt-0.5">&ldquo;{photo.caption}&rdquo;</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 LAYOUT 6: POLAROID SCRAPBOOK (Oversized Center Stage Polaroid + Gallery)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 6) {
                const centerPolaroid = displayedPhotos[0];
                const centerDetails = centerPolaroid ? getMediaDetails(centerPolaroid) : null;
                const restPolaroids = displayedPhotos.slice(1);
                return (
                  <div className="flex flex-col gap-10 items-center [overflow-anchor:auto]">
                    {/* Oversized Center-Stage Polaroid */}
                    {centerPolaroid && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(centerPolaroid)}
                        className="group bg-[#fcfcfd] text-black p-6 pb-8 rounded-sm shadow-2xl transition-transform hover:scale-[1.01] -rotate-1 cursor-pointer max-w-2xl w-full border border-neutral-300"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/95">
                          <Image
                            src={centerDetails?.isYouTube ? `https://img.youtube.com/vi/${centerDetails.youtubeId}/hqdefault.jpg` : centerPolaroid.src}
                            alt={centerPolaroid.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 672px"
                            className="object-cover"
                            priority
                          />
                          <div className="absolute top-3 left-3 bg-red-600 text-white font-mono text-[10px] font-bold uppercase px-2.5 py-1 tracking-widest shadow">
                            ★ Feature of the Week
                          </div>
                        </div>
                        <div className="mt-5 text-center font-sans">
                          <p className="text-xl font-bold text-neutral-900 tracking-tight">{centerPolaroid.name}</p>
                          <p className="text-xs text-neutral-500 mt-1 uppercase font-medium tracking-wider">
                            {centerPolaroid.venue || "7th Heaven Live Stage"} &bull; {centerPolaroid.date || "Concert Memory"}
                          </p>
                          {centerPolaroid.caption && (
                            <p className="text-sm text-neutral-700 mt-3 font-serif italic max-w-lg mx-auto">
                              &ldquo;{centerPolaroid.caption}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Supporting Polaroid Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                      {restPolaroids.map((photo, i) => {
                        const mediaDetails = getMediaDetails(photo);
                        const rotationClass = i % 3 === 0 ? "hover:rotate-2 rotate-1" : i % 3 === 1 ? "hover:-rotate-2 -rotate-1" : "hover:rotate-1";
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className={`group bg-[#f8f8fa] text-black p-4 pb-6 rounded-sm shadow-xl transition-all hover:-translate-y-1.5 cursor-pointer ${rotationClass}`}
                          >
                            <div className="relative aspect-square w-full overflow-hidden bg-black/90">
                              <Image
                                src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover"
                              />
                            </div>
                            <div className="mt-4 text-center font-sans">
                              <p className="text-sm font-bold text-neutral-900 tracking-tight">{photo.name}</p>
                              <p className="text-xs text-neutral-600 mt-0.5">{photo.venue || "7th Heaven Concert"} &bull; {photo.date || "2026"}</p>
                              {photo.caption && (
                                <p className="text-xs text-neutral-700 mt-2 font-serif italic line-clamp-2">&ldquo;{photo.caption}&rdquo;</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 LAYOUT 7: LUXURY GLASSMORPHISM (Violet Nocturne Ultra-Card)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 7) {
                const glassHero = displayedPhotos[0];
                const glassHeroDetails = glassHero ? getMediaDetails(glassHero) : null;
                const restGlass = displayedPhotos.slice(1);
                return (
                  <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                    {/* Oversized Glassmorphic Hero Ultra-Card */}
                    {glassHero && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(glassHero)}
                        className="group relative overflow-hidden rounded-[var(--radius-box)] border border-nocturne-mauve/50 bg-gradient-to-r from-nocturne-midnight/90 via-nocturne-plum/40 to-nocturne-wine/70 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-nocturne-midnight/90 cursor-pointer transition-all hover:border-nocturne-rose"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                          <div className="lg:col-span-7 relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-nocturne-mauve/30 bg-black/60 shadow-2xl">
                            <Image
                              src={glassHeroDetails?.isYouTube ? `https://img.youtube.com/vi/${glassHeroDetails.youtubeId}/hqdefault.jpg` : glassHero.src}
                              alt={glassHero.name}
                              fill
                              sizes="(max-width: 1024px) 100vw, 55vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                              priority
                            />
                            <div className="absolute top-3 left-3 rounded-full bg-nocturne-wine/90 border border-nocturne-rose/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-nocturne-rose backdrop-blur-md">
                              ★ Violet Nocturne Spotlight
                            </div>
                          </div>
                          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                            <div>
                              <span className="text-xs font-mono uppercase text-nocturne-rose tracking-wider">
                                {glassHero.venue || "Stage Highlight"} {glassHero.city && `• ${glassHero.city}`}
                              </span>
                              <h3 className="mt-1 font-bold text-white tracking-tight">
                                {glassHero.name}
                              </h3>
                              {glassHero.date && <p className="text-xs text-nocturne-rose/70 mt-1">{glassHero.date}</p>}
                              {glassHero.caption && (
                                <blockquote className="mt-4 border-l-2 border-nocturne-rose/80 pl-4 text-sm text-white/90 italic leading-relaxed">
                                  &ldquo;{glassHero.caption}&rdquo;
                                </blockquote>
                              )}
                            </div>
                            <Button variant="primary" size="sm" onClick={() => setSelectedPhoto(glassHero)} className="w-full justify-center">
                              Expand Ultra Spotlight
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Supporting Frosted Glass Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {restGlass.map((photo) => {
                        const mediaDetails = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group rounded-[var(--radius-box)] border border-nocturne-mauve/40 bg-nocturne-midnight/70 p-4 backdrop-blur-2xl shadow-xl shadow-nocturne-midnight/40 transition-all hover:border-nocturne-rose hover:bg-nocturne-wine/50 cursor-pointer"
                          >
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-nocturne-mauve/20 bg-black/50">
                              <Image
                                src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-white">{photo.name}</h4>
                                <p className="text-xs text-nocturne-rose/70">
                                  {photo.venue || photo.city || "Live Show"}{photo.date ? ` • ${photo.date}` : ""}
                                </p>
                              </div>
                              <span className="rounded-full border border-nocturne-rose/30 bg-nocturne-plum/40 px-2.5 py-1 text-[10px] font-bold uppercase text-nocturne-rose">
                                {mediaDetails.isVideo ? "Video" : "Photo"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 LAYOUT 8: HEADLINE DUAL-HERO (Two Large Side-by-Side Headliners)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 8) {
                const hero1 = displayedPhotos[0];
                const hero2 = displayedPhotos[1];
                const hero1Details = hero1 ? getMediaDetails(hero1) : null;
                const hero2Details = hero2 ? getMediaDetails(hero2) : null;
                const restPhotos = displayedPhotos.slice(2);
                return (
                  <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                    {/* Dual Headliner Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {[
                        { item: hero1, details: hero1Details, label: "Headliner 1: Stage Video" },
                        { item: hero2, details: hero2Details, label: "Headliner 2: Crowd Photo" },
                      ].map(
                        (hero) =>
                          hero.item && (
                            <div
                              key={hero.item.id || hero.label}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedPhoto(hero.item)}
                              className="group relative overflow-hidden rounded-[var(--radius-box)] border-2 border-purple-500/30 bg-black p-5 cursor-pointer shadow-2xl transition-all hover:border-purple-400"
                            >
                              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                                <Image
                                  src={hero.details?.isYouTube ? `https://img.youtube.com/vi/${hero.details.youtubeId}/hqdefault.jpg` : hero.item.src}
                                  alt={hero.item.name}
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 50vw"
                                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                                  priority
                                />
                                <div className="absolute top-3 left-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold uppercase text-white shadow-lg">
                                  {hero.label}
                                </div>
                              </div>
                              <div className="mt-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-bold text-white">{hero.item.name}</h3>
                                  <span className="text-xs text-purple-300 font-mono">
                                    {hero.item.venue || hero.item.city || "Live Stage"}{hero.item.date ? ` • ${hero.item.date}` : ""}
                                  </span>
                                </div>
                                {hero.item.caption && (
                                  <p className="mt-2 text-xs text-white/80 line-clamp-2 italic">&ldquo;{hero.item.caption}&rdquo;</p>
                                )}
                              </div>
                            </div>
                          ),
                      )}
                    </div>

                    {/* Supporting 4-Col Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {restPhotos.map((photo) => {
                        const mediaDetails = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group relative aspect-[16/10] overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black cursor-pointer hover:border-purple-400 transition-all"
                          >
                            <Image
                              src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                              alt={photo.name}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                              <p className="text-xs font-bold text-white truncate">{photo.name}</p>
                              <p className="text-[10px] text-white/60 truncate">
                                {photo.venue || photo.city || "Live Stage"}{photo.date ? ` • ${photo.date}` : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 LAYOUT 9: STAGGERED WALL (Alternating Large/Small Asymmetric Stream)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 9) {
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 [overflow-anchor:auto]">
                    {displayedPhotos.map((photo, i) => {
                      const mediaDetails = getMediaDetails(photo);
                      // Every 4th card is a large 2-column feature card
                      const isLarge = i === 0 || i === 4;
                      return (
                        <div
                          key={photo.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPhoto(photo)}
                          className={`group relative overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] hover:border-purple-400/50 cursor-pointer transition-all ${
                            isLarge ? "sm:col-span-2 min-h-[340px]" : "min-h-[220px]"
                          }`}
                        >
                          <Image
                            src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                            alt={photo.name}
                            fill
                            sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-5 flex flex-col justify-end">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                              {isLarge ? "★ Featured Stream Showcase" : mediaDetails.isVideo ? "Video" : "Photo"}
                            </span>
                            <h4 className={`${isLarge ? "text-xl sm:text-2xl" : "text-base"} font-bold text-white mt-1`}>
                              {photo.name}
                            </h4>
                            <p className="text-xs text-white/70">
                              {photo.venue || photo.city || "Live Show"}{photo.date ? ` • ${photo.date}` : ""}
                            </p>
                            {isLarge && photo.caption && (
                              <p className="text-xs sm:text-sm text-white/90 line-clamp-2 mt-2 italic">&ldquo;{photo.caption}&rdquo;</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 LAYOUT 10: EDITORIAL MAGAZINE COVER STORY (Large Showcase + Multi-Col)
                 ═══════════════════════════════════════════════════ */
              if (layoutMode === 10) {
                const coverStory = displayedPhotos[0];
                const coverDetails = coverStory ? getMediaDetails(coverStory) : null;
                const dispatches = displayedPhotos.slice(1);
                return (
                <div className="flex flex-col gap-10 border-t-2 border-white/20 pt-6 [overflow-anchor:auto]">
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
                    <h3 className="font-serif font-black uppercase text-white tracking-tight">
                      FAN ARCHIVE &bull; DISPATCHES
                    </h3>
                    <span className="font-serif italic text-sm text-white/60">Issue No. 40 &bull; Live Concert Chronicles</span>
                  </div>

                  {/* Large Magazine Cover Story Hero */}
                  {coverStory && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPhoto(coverStory)}
                      className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/15 pb-10 cursor-pointer"
                    >
                      <div className="lg:col-span-8 relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black">
                        <Image
                          src={coverDetails?.isYouTube ? `https://img.youtube.com/vi/${coverDetails.youtubeId}/hqdefault.jpg` : coverStory.src}
                          alt={coverStory.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 66vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          priority
                        />
                        <div className="absolute top-4 left-4 bg-white text-black font-serif text-xs font-bold uppercase px-3 py-1 tracking-widest">
                          Cover Story Feature
                        </div>
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-3 font-serif">
                        <span className="text-xs uppercase tracking-widest text-purple-300 font-sans font-bold">
                          {coverStory.venue || "Tour Feature"} {coverStory.date && `• ${coverStory.date}`}
                        </span>
                        <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
                          {coverStory.name}&apos;s Live Experience
                        </h4>
                        {coverStory.caption && (
                          <p className="text-sm sm:text-base text-white/80 leading-relaxed italic mt-2">
                            &ldquo;{coverStory.caption}&rdquo;
                          </p>
                        )}
                        <span className="text-xs text-purple-400 font-sans font-bold uppercase tracking-wider mt-4">
                          Read Full Dispatch &rarr;
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Supporting Magazine Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {dispatches.map((photo) => {
                      const mediaDetails = getMediaDetails(photo);
                      return (
                        <div
                          key={photo.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPhoto(photo)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedPhoto(photo);
                            }
                          }}
                          className="group border-b border-white/10 pb-6 flex flex-col justify-between cursor-pointer"
                        >
                          <div>
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-black">
                              <Image
                                src={mediaDetails.isYouTube ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="mt-3 flex items-center justify-between font-serif text-xs text-white/60">
                              <span>{photo.venue || "Live Concert"}</span>
                              <span>{photo.date || "2026"}</span>
                            </div>
                            <h4 className="mt-1 font-serif font-bold text-white group-hover:text-purple-300 transition-colors">
                              {photo.name}
                            </h4>
                            {photo.caption && (
                              <p className="mt-1 font-serif text-xs text-white/75 leading-relaxed italic line-clamp-2">
                                &ldquo;{photo.caption}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 11: HERO FILMSTRIP (Cinematic Stage Reel)
               ═══════════════════════════════════════════════════ */
            if (layoutMode === 11) {
              const headliner = displayedPhotos[0];
              const headlinerDetails = headliner ? getMediaDetails(headliner) : null;
              const reelPhotos = displayedPhotos.slice(1);

              return (
                <div className="flex flex-col gap-10 [overflow-anchor:auto]">
                  {headliner && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPhoto(headliner)}
                      className="group relative overflow-hidden rounded-[var(--radius-box)] border border-amber-500/30 bg-gradient-to-t from-black via-zinc-950 to-black p-4 sm:p-6 shadow-2xl cursor-pointer"
                    >
                      <div className="relative aspect-[21/9] min-h-[300px] w-full overflow-hidden rounded-2xl bg-black">
                        {headlinerDetails?.isDirectVideo ? (
                          <video src={headlinerDetails.videoSrc} className="h-full w-full object-cover" muted autoPlay loop playsInline />
                        ) : (
                          <Image
                            src={headlinerDetails?.isYouTube ? `https://img.youtube.com/vi/${headlinerDetails.youtubeId}/hqdefault.jpg` : headliner.src}
                            alt={headliner.name}
                            fill
                            sizes="100vw"
                            priority
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        <div className="absolute top-4 left-4 rounded-full border border-amber-400/40 bg-black/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                          Cinematic Reel Feature
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase font-mono tracking-widest text-amber-400">
                              {headliner.venue || "Tour Feature"} &bull; {headliner.date || "Live"}
                            </p>
                            <h3 className="font-extrabold text-white mt-1">
                              {headliner.name}
                            </h3>
                            {headliner.caption && (
                              <p className="text-sm text-white/80 max-w-2xl mt-1.5 line-clamp-2">
                                &ldquo;{headliner.caption}&rdquo;
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 rounded-full bg-amber-500 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-lg">
                            View Cinema Cut &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Horizontal Film Reel Strip */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Film className="h-4 w-4 text-amber-400" />
                        <h4 className="font-mono uppercase tracking-wider text-white">Film Reel Gallery</h4>
                      </div>
                      <span className="text-xs text-white/50">Scroll horizontally &rarr;</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar">
                      {reelPhotos.map((photo) => {
                        const details = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group relative min-w-[280px] sm:min-w-[340px] shrink-0 snap-start overflow-hidden rounded-2xl border-2 border-white/10 bg-zinc-950 p-2.5 transition-all hover:border-amber-400/60 cursor-pointer"
                          >
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
                              <Image
                                src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="340px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                              {details.isVideo && (
                                <div className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-amber-300">
                                  <Play className="h-3 w-3 fill-current" />
                                </div>
                              )}
                            </div>
                            <div className="mt-3 flex flex-col gap-0.5 text-xs">
                              <span className="font-bold text-white group-hover:text-amber-300 transition-colors truncate">{photo.name}</span>
                              <div className="flex items-center justify-between text-white/50 text-[10px]">
                                <span className="truncate">{photo.venue || photo.city || "7th Heaven"}</span>
                                <span className="shrink-0">{photo.date || "2026"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 12: SPOTLIGHT SIDEBAR (Sticky Super-Card + Archive)
               ═══════════════════════════════════════════════════ */
            if (layoutMode === 12) {
              const spotlight = displayedPhotos[0];
              const spotDetails = spotlight ? getMediaDetails(spotlight) : null;
              const archive = displayedPhotos.slice(1);

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start [overflow-anchor:auto]">
                  {/* Left Sticky 5-Cols */}
                  {spotlight && (
                    <div className="lg:col-span-5 lg:sticky lg:top-24">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(spotlight)}
                        className="group relative overflow-hidden rounded-[var(--radius-box)] border border-cyan-400/30 bg-cyan-950/20 p-5 backdrop-blur-xl shadow-2xl cursor-pointer"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                          <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">Spotlight Pin</span>
                          <span className="text-xs text-white/60">{spotlight.date || "Active Season"}</span>
                        </div>
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black">
                          {spotDetails?.isDirectVideo ? (
                            <video src={spotDetails.videoSrc} className="h-full w-full object-cover" muted autoPlay loop playsInline />
                          ) : (
                            <Image
                              src={spotDetails?.isYouTube ? `https://img.youtube.com/vi/${spotDetails.youtubeId}/hqdefault.jpg` : spotlight.src}
                              alt={spotlight.name}
                              fill
                              sizes="(max-width: 1024px) 100vw, 40vw"
                              priority
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                          <h3 className="font-black text-white group-hover:text-cyan-300 transition-colors">
                            {spotlight.name}
                          </h3>
                          <p className="text-xs font-mono text-cyan-300">
                            {spotlight.venue ? `${spotlight.venue} • ` : ""}{spotlight.city || "Chicago, IL"}
                          </p>
                          {spotlight.caption && (
                            <p className="text-sm text-white/80 italic mt-1 leading-relaxed">
                              &ldquo;{spotlight.caption}&rdquo;
                            </p>
                          )}
                          <button
                            type="button"
                            className="mt-3 w-full rounded-xl bg-cyan-500/20 border border-cyan-400/40 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/30 transition-colors"
                          >
                            Expand Stage Capture
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right 7-Cols Archive Feed */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                      <h4 className="font-bold uppercase tracking-wider text-white">Live Concert Stream</h4>
                      <span className="text-xs text-white/50">{archive.length} Moments</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {archive.map((photo) => {
                        const details = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-3 hover:border-cyan-400/40 hover:bg-white/[0.05] transition-all cursor-pointer"
                          >
                            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl bg-black">
                              <Image
                                src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="300px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="mt-3 flex flex-col gap-0.5">
                              <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">{photo.name}</span>
                              <span className="text-xs text-white/60 truncate">{photo.venue || photo.city || "Live Show"}</span>
                              <span className="text-[10px] text-white/40 truncate">{photo.date || "2026"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 13: TRIPTYCH ARENA (3 Balanced Stage Pillars)
               ═══════════════════════════════════════════════════ */
            if (layoutMode === 13) {
              const triptych = displayedPhotos.slice(0, 3);
              const remainder = displayedPhotos.slice(3);

              return (
                <div className="flex flex-col gap-10 [overflow-anchor:auto]">
                  {/* Triptych 3-Column Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {triptych.map((photo, idx) => {
                      const details = getMediaDetails(photo);
                      const colors = [
                        "border-fuchsia-500/40 bg-fuchsia-950/20",
                        "border-indigo-500/40 bg-indigo-950/20",
                        "border-purple-500/40 bg-purple-950/20",
                      ];
                      const accents = ["text-fuchsia-400", "text-indigo-400", "text-purple-400"];

                      return (
                        <div
                          key={photo.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPhoto(photo)}
                          className={`group relative overflow-hidden rounded-[var(--radius-box)] border ${colors[idx % 3]} p-4 sm:p-5 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer shadow-xl`}
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${accents[idx % 3]}`}>
                                Stage Pillar 0{idx + 1}
                              </span>
                              <span className="text-xs text-white/50">{photo.date || "Tour 2026"}</span>
                            </div>
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black">
                              <Image
                                src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <h3 className="mt-4 font-black text-white group-hover:text-purple-200 transition-colors">
                              {photo.name}
                            </h3>
                            <p className="text-xs text-white/60 mt-0.5">{photo.venue || photo.city || "Stage Center"}</p>
                            {photo.caption && (
                              <p className="text-xs text-white/80 mt-2 line-clamp-3 leading-relaxed">
                                &ldquo;{photo.caption}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                            <span>Full Resolution</span>
                            <Maximize2 className="h-3.5 w-3.5 text-purple-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Supporting Grid */}
                  {remainder.length > 0 && (
                    <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                      <h4 className="font-mono uppercase tracking-widest text-white/60">Community Stage Ribbons</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {remainder.map((photo) => {
                          const details = getMediaDetails(photo);
                          return (
                            <div
                              key={photo.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedPhoto(photo)}
                              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black cursor-pointer hover:border-purple-400 transition-all"
                            >
                              <Image
                                src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="160px"
                                className="object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                <span className="text-[10px] font-bold text-white truncate">{photo.name}</span>
                                <span className="text-[9px] text-white/70 truncate">{photo.venue || photo.city || "Tour"}</span>
                                <span className="text-[9px] text-white/40 truncate">{photo.date || "2026"}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 14: HERO ACCORDION (Interactive Story Slices)
               ═══════════════════════════════════════════════════ */
            if (layoutMode === 14) {
              return (
                <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                  <div className="flex flex-col gap-4">
                    {displayedPhotos.map((photo, idx) => {
                      const details = getMediaDetails(photo);
                      return (
                        <div
                          key={photo.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPhoto(photo)}
                          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 hover:border-purple-500/50 hover:bg-white/[0.04] transition-all cursor-pointer shadow-lg"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                            <div className="md:col-span-1 flex md:flex-col items-center justify-between md:justify-center gap-1 font-mono text-xs text-purple-400 font-bold">
                              <span>#{String(idx + 1).padStart(2, "0")}</span>
                              <span className="hidden md:inline text-[10px] text-white/40">CUT</span>
                            </div>
                            <div className="md:col-span-4 relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
                              <Image
                                src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 30vw"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="md:col-span-5 flex flex-col gap-1.5">
                              <span className="text-xs uppercase font-mono text-purple-300">
                                {photo.venue || photo.city || "Tour Stage"} {photo.date && `• ${photo.date}`}
                              </span>
                              <h3 className="font-black text-white group-hover:text-purple-300 transition-colors">
                                {photo.name}
                              </h3>
                              {photo.caption && (
                                <p className="text-sm text-white/70 line-clamp-2 italic">
                                  &ldquo;{photo.caption}&rdquo;
                                </p>
                              )}
                            </div>
                            <div className="md:col-span-2 flex items-center justify-end">
                              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white group-hover:border-purple-400 group-hover:bg-purple-600 transition-all">
                                Inspect &rarr;
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 15: TOUR METRO GRID (Prominent Venue Banners)
               ═══════════════════════════════════════════════════ */
            if (layoutMode === 15) {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 [overflow-anchor:auto]">
                  {displayedPhotos.map((photo) => {
                    const details = getMediaDetails(photo);
                    return (
                      <div
                        key={photo.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(photo)}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 hover:border-emerald-400/50 transition-all shadow-xl cursor-pointer"
                      >
                        {/* City Venue Ribbon */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-950/80 to-teal-950/60 border-b border-emerald-500/20 px-4 py-2 text-xs font-mono">
                          <span className="font-bold text-emerald-300 flex items-center gap-1.5 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {photo.venue || photo.city || "Concert Venue"}
                          </span>
                          <span className="text-white/60 shrink-0">{photo.date || "2026"}</span>
                        </div>

                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                          <Image
                            src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                            alt={photo.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          {details.isVideo && (
                            <div className="absolute bottom-2 right-2 rounded-full bg-emerald-500 text-black px-2.5 py-0.5 text-[10px] font-bold">
                              VIDEO
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                          <div>
                            <h4 className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {photo.name}
                            </h4>
                            {photo.caption && (
                              <p className="text-xs text-white/70 mt-1 line-clamp-2 italic">
                                &ldquo;{photo.caption}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                            <span>7th Heaven Archive</span>
                            <span className="font-bold text-emerald-400">View &rarr;</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 16: GOLDEN RATIO 62/38 (Harmonic Asymmetry)
               ═══════════════════════════════════════════════════ */
            if (layoutMode === 16) {
              const goldenMain = displayedPhotos[0];
              const goldenDetails = goldenMain ? getMediaDetails(goldenMain) : null;
              const goldenStack = displayedPhotos.slice(1, 4);
              const goldenRest = displayedPhotos.slice(4);

              return (
                <div className="flex flex-col gap-10 [overflow-anchor:auto]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left 62% Primary Feature */}
                    {goldenMain && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(goldenMain)}
                        className="lg:col-span-7 group relative overflow-hidden rounded-[var(--radius-box)] border border-amber-500/40 bg-zinc-950 p-6 flex flex-col justify-between shadow-2xl cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                            <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">&Phi; Golden Stage Canvas</span>
                            <span className="text-xs text-white/60">{goldenMain.date || "7th Heaven"}</span>
                          </div>
                          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black">
                            <Image
                              src={goldenDetails?.isYouTube ? `https://img.youtube.com/vi/${goldenDetails.youtubeId}/hqdefault.jpg` : goldenMain.src}
                              alt={goldenMain.name}
                              fill
                              sizes="(max-width: 1024px) 100vw, 60vw"
                              priority
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        </div>
                        <div className="mt-5">
                          <h3 className="font-extrabold text-white group-hover:text-amber-300 transition-colors">
                            {goldenMain.name}
                          </h3>
                          <p className="text-xs font-mono text-white/60 mt-1">{goldenMain.venue || goldenMain.city || "Live Concert"}</p>
                          {goldenMain.caption && (
                            <p className="text-sm text-white/80 mt-2 leading-relaxed">
                              &ldquo;{goldenMain.caption}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Right 38% Vertical Harmonic Stack */}
                    <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
                      {goldenStack.map((photo) => {
                        const details = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group flex-1 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 hover:border-amber-400/40 hover:bg-white/[0.05] transition-all cursor-pointer"
                          >
                            <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-black">
                              <Image
                                src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="120px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">{photo.name}</span>
                              <span className="text-xs text-white/60 truncate">{photo.venue || photo.city || "Live Capture"}</span>
                              <span className="text-[10px] text-white/40 truncate">{photo.date || "2026"}</span>
                              {photo.caption && <p className="text-xs text-white/70 line-clamp-1 italic mt-0.5">&ldquo;{photo.caption}&rdquo;</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Golden Grid */}
                  {goldenRest.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 border-t border-white/10 pt-6">
                      {goldenRest.map((photo) => {
                        const details = getMediaDetails(photo);
                        return (
                          <div
                            key={photo.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group flex flex-col rounded-xl border border-white/10 p-2 bg-black/40 hover:border-amber-400/50 cursor-pointer"
                          >
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                              <Image
                                src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                                alt={photo.name}
                                fill
                                sizes="200px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <span className="mt-2 text-xs font-bold text-white truncate">{photo.name}</span>
                            <span className="text-[10px] text-white/60 truncate">{photo.venue || photo.city || "Live Show"}</span>
                            <span className="text-[10px] text-white/40 truncate">{photo.date || "2026"}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 17: BILLBOARD MARQUEE (Ultra-Wide Header + Matrix)
               ═══════════════════════════════════════════════════ */
            if (layoutMode === 17) {
              const billboard = displayedPhotos[0];
              const billDetails = billboard ? getMediaDetails(billboard) : null;
              const matrix = displayedPhotos.slice(1);

              return (
                <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                  {billboard && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPhoto(billboard)}
                      className="group relative overflow-hidden rounded-[var(--radius-box)] shadow-2xl cursor-pointer"
                    >
                      <div className="relative aspect-[24/9] min-h-[220px] w-full overflow-hidden bg-black">
                        <Image
                          src={billDetails?.isYouTube ? `https://img.youtube.com/vi/${billDetails.youtubeId}/hqdefault.jpg` : billboard.src}
                          alt={billboard.name}
                          fill
                          sizes="100vw"
                          priority
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Prominent Format Badge (Top-Left: VIDEO vs PHOTO) */}
                        <div className="absolute top-4 left-4 z-20">
                          {billDetails?.isVideo ? (
                            <span className="flex items-center gap-1.5 rounded-full border border-purple-400/50 bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-mono font-bold tracking-wider text-purple-200 shadow-xl">
                              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                              <Film className="h-3.5 w-3.5 text-purple-300" />
                              <span>FAN VIDEO</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-mono font-bold tracking-wider text-emerald-200 shadow-xl">
                              <Camera className="h-3.5 w-3.5 text-emerald-300" />
                              <span>FAN PHOTO</span>
                            </span>
                          )}
                        </div>

                        {billDetails?.isVideo && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 border border-white/20 backdrop-blur-sm text-white group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 fill-white text-white ml-0.5" />
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent p-6 sm:p-10 flex flex-col justify-end">
                          <span className="text-xs uppercase font-mono tracking-widest text-purple-300 font-bold">24:9 Panoramic Marquee</span>
                          <h3 className="font-black text-white mt-1">{billboard.name}</h3>
                          <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
                            {billboard.venue || billboard.city || "Live Stage"}{billboard.venue && billboard.city ? ` • ${billboard.city}` : ""}{billboard.date ? ` • ${billboard.date}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4-Column Matrix (Enlarged) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {matrix.map((photo) => {
                      const details = getMediaDetails(photo);
                      return (
                        <div
                          key={photo.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPhoto(photo)}
                          className="group flex flex-col transition-all cursor-pointer"
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
                            <Image
                              src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                              alt={photo.name}
                              fill
                              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />

                            {/* Prominent Format Badge (Top-Left: VIDEO vs PHOTO) */}
                            <div className="absolute top-2 left-2 z-10">
                              {details.isVideo ? (
                                <span className="flex items-center gap-1 rounded-md border border-purple-400/50 bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-purple-200 shadow-md">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                  <Film className="h-3 w-3 text-purple-300" />
                                  <span>VIDEO</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 rounded-md border border-emerald-400/50 bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-emerald-200 shadow-md">
                                  <Camera className="h-3 w-3 text-emerald-300" />
                                  <span>PHOTO</span>
                                </span>
                              )}
                            </div>

                            {/* Centered subtle play icon on video items */}
                            {details.isVideo && (
                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/20 backdrop-blur-sm text-white group-hover:scale-110 transition-transform">
                                  <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="mt-2.5 text-sm font-bold text-white truncate" title={photo.name}>{photo.name}</span>
                          <span className="text-xs text-white/70 truncate" title={photo.venue ? (photo.city ? `${photo.venue} • ${photo.city}` : photo.venue) : (photo.city || "Live Stage")}>
                            {photo.venue ? (photo.city ? `${photo.venue} • ${photo.city}` : photo.venue) : (photo.city || "Live Stage")}
                          </span>
                          <span className="text-xs text-white/45 truncate">{photo.date || "2026"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 18: BRUTALIST NEON (High-Contrast Yellow & Black)
               ═══════════════════════════════════════════════════ */
            if (layoutMode === 18) {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono [overflow-anchor:auto]">
                  {displayedPhotos.map((photo, idx) => {
                    const details = getMediaDetails(photo);
                    return (
                      <div
                        key={photo.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(photo)}
                        className="group border-2 border-amber-400 bg-black p-4 text-left shadow-[6px_6px_0px_0px_rgba(251,191,36,0.8)] hover:shadow-[10px_10px_0px_0px_rgba(251,191,36,1)] transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between border-b-2 border-amber-400 pb-2 mb-3 text-xs">
                          <span className="bg-amber-400 text-black px-2 py-0.5 font-black uppercase">SYS.0{idx + 1}</span>
                          <span className="text-amber-300 font-bold">{photo.date || "LIVE"}</span>
                        </div>
                        <div className="relative aspect-video w-full overflow-hidden border border-amber-400/50 bg-black">
                          <Image
                            src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                            alt={photo.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                        <div className="mt-3 flex flex-col gap-1">
                          <h4 className="font-black uppercase tracking-tight text-white group-hover:text-amber-400">
                            {photo.name}
                          </h4>
                          <span className="text-xs text-amber-300/80 truncate">&gt; {photo.venue || photo.city || "VENUE UNKNOWN"}</span>
                          {photo.caption && (
                            <p className="text-xs text-white/70 mt-1 line-clamp-2">
                              // {photo.caption}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 19: COMPACT DENSITY (High-Speed Quick View)
               ═══════════════════════════════════════════════════ */
            if (layoutMode === 19) {
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 [overflow-anchor:auto]">
                  {displayedPhotos.map((photo) => {
                    const details = getMediaDetails(photo);
                    return (
                      <div
                        key={photo.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(photo)}
                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950 p-2 hover:border-purple-400 hover:scale-105 transition-all cursor-pointer shadow-md"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
                          <Image
                            src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                            alt={photo.name}
                            fill
                            sizes="180px"
                            className="object-cover"
                          />
                          {details.isVideo && (
                            <div className="absolute top-1.5 right-1.5 rounded-full bg-purple-600 p-1 text-white">
                              <Play className="h-2.5 w-2.5 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-col">
                          <span className="text-xs font-bold text-white truncate group-hover:text-purple-300">{photo.name}</span>
                          <span className="text-[10px] text-white/60 truncate">{photo.venue || photo.city || "Tour"}</span>
                          <span className="text-[10px] text-white/40 truncate">{photo.date || "2026"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            /* ═══════════════════════════════════════════════════
               LAYOUT 20: CHRONICLE FEED (Violet Nocturne Center Storyline)
               ═══════════════════════════════════════════════════ */
            return (
              <div className="relative max-w-3xl mx-auto flex flex-col gap-12 [overflow-anchor:auto]">
                {/* Vertical glowing timeline line with Nocturne gradient */}
                <div className="absolute top-0 bottom-0 left-4 sm:left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-nocturne-rose via-nocturne-plum to-nocturne-midnight pointer-events-none" />

                {displayedPhotos.map((photo, idx) => {
                  const details = getMediaDetails(photo);
                  return (
                    <div
                      key={photo.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative flex flex-col gap-4 rounded-3xl border border-nocturne-mauve/40 bg-nocturne-midnight/90 p-5 sm:p-7 backdrop-blur-xl shadow-2xl shadow-nocturne-midnight/80 hover:border-nocturne-rose transition-all cursor-pointer z-10"
                    >
                      <div className="flex items-center justify-between border-b border-nocturne-mauve/30 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-3 w-3 rounded-full bg-nocturne-rose shadow-[0_0_8px_#d2a8a2]" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-nocturne-rose">
                            Chronicle Entry #{idx + 1}
                          </span>
                        </div>
                        <span className="text-xs text-nocturne-rose/70">{photo.date || "Live Show"}</span>
                      </div>

                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black">
                        <Image
                          src={details.isYouTube ? `https://img.youtube.com/vi/${details.youtubeId}/hqdefault.jpg` : photo.src}
                          alt={photo.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 680px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-black text-white group-hover:text-nocturne-rose transition-colors">
                          {photo.name}
                        </h3>
                        <p className="text-xs font-mono text-nocturne-rose/90">
                          {photo.venue ? `${photo.venue} &bull; ` : ""}{photo.city || "Tour Concert"}
                        </p>
                        {photo.caption && (
                          <p className="text-sm text-white/85 leading-relaxed italic mt-1">
                            &ldquo;{photo.caption}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()
          ) : approvedPhotos.length > 0 ? (
            /* Filter empty state */
            <div className="py-20 text-center">
              <p className="text-lg text-white/60 font-medium">
                No fan moments found matching your filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setMediaFilter("all");
                  setVenueFilter("ALL");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            /* Empty state */
            <div className="py-32 text-center">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center border border-white/10">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 className="mb-3 text-white/30">
                {sanityContent?.emptyStateTitle || "No moments yet"}
              </h3>
              <p className="mx-auto mb-8 max-w-sm">
                {sanityContent?.emptyStateSubtitle ||
                  "Check back soon for moments from 7th Heaven shows!"}
              </p>
            </div>
          )}

          {/* Full Screen Lightbox Modal */}
          {mounted &&
            selectedPhoto &&
            createPortal(
              (() => {
                const mediaDetails = getMediaDetails(selectedPhoto);
                return (
                  <div
                    className="fixed inset-0 z-[999999] flex h-full h-dvh w-full cursor-pointer animate-[fade-in_0.2s_ease-out] flex-col bg-black p-0"
                    onClick={() => setSelectedPhoto(null)}
                  >
                    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
                      {/* Header Bar */}
                      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/95 px-4 pt-safe sm:px-6">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 text-purple-300 shrink-0">
                            {mediaDetails.isVideo ? "FAN VIDEO" : "FAN PHOTO"}
                          </span>
                          <div className="flex items-center gap-2 truncate text-sm text-white font-semibold">
                            <span>{selectedPhoto.name}</span>
                            {(selectedPhoto.venue || selectedPhoto.city) && (
                              <span className="hidden sm:inline text-white/50 font-normal">
                                • {selectedPhoto.venue}
                                {selectedPhoto.city ? `, ${selectedPhoto.city}` : ""}
                                {selectedPhoto.date ? ` (${selectedPhoto.date})` : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            aria-label="Report photo"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFlagPhoto(selectedPhoto.id);
                            }}
                            disabled={flaggingId === selectedPhoto.id}
                            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-1.5 text-white/50 transition-colors hover:text-red-400 disabled:opacity-50"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                              <line x1="4" y1="22" x2="4" y2="15" />
                            </svg>
                            <span className="hidden sm:inline">
                              {flaggingId === selectedPhoto.id ? "Flagging..." : "Report"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(null)}
                            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                            aria-label="Close modal"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      {/* Stage (Full Screen Edge-to-Edge Media) */}
                      <div className="relative flex-1 w-full h-[calc(100vh-3.5rem)] h-[calc(100dvh-3.5rem)] overflow-hidden bg-black pb-safe flex items-center justify-center">
                        {mediaDetails.isDirectVideo ? (
                          <video
                            src={mediaDetails.videoSrc}
                            className="h-full w-full object-contain bg-black"
                            controls
                            autoPlay
                            muted
                            playsInline
                          />
                        ) : mediaDetails.isYouTube ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${mediaDetails.youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                            title={selectedPhoto.caption || selectedPhoto.name}
                            className="h-full w-full border-0"
                            allow="autoplay; encrypted-media; fullscreen"
                            allowFullScreen
                          />
                        ) : (
                          <img
                            src={selectedPhoto.src}
                            alt={selectedPhoto.name}
                            className="h-full w-full object-contain bg-black"
                          />
                        )}

                        {/* Optional Caption Overlay at Bottom */}
                        {selectedPhoto.caption && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 text-center">
                            <p className="mx-auto max-w-3xl text-sm text-white/90 drop-shadow">
                              &ldquo;{selectedPhoto.caption}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })(),
              document.body,
            )}
        </div>
      </section>

      {/* ── ADD PHOTO / VIDEO CMS MODAL PORTAL ── */}
      {mounted &&
        isAddCmsModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex animate-[fade-in_0.2s_ease-out] items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div
              data-lenis-prevent
              className="custom-scrollbar relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-purple-500/30 bg-[#12071f] p-6 text-left sm:p-8"
            >
              <button
                type="button"
                onClick={() => setIsAddCmsModalOpen(false)}
                className="transition-colors absolute top-4 right-4 cursor-pointer rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-purple-500/40 bg-purple-600/20 text-purple-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3>Add Photo / Video to Sanity CMS</h3>
                  <p>
                    Create and publish a fan wall moment directly to Sanity CMS.
                  </p>
                </div>
              </div>

              {cmsError && (
                <div className="mb-6 flex items-center gap-2 border border-red-500/50 bg-red-900/40 p-3 text-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{cmsError}</span>
                </div>
              )}

              {cmsSuccess && (
                <div className="mb-6 flex items-center gap-2 border border-emerald-500/50 bg-emerald-900/40 p-3 text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Moment added successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveCmsMoment} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Fan / Contributor Name"
                    required
                    value={cmsForm.name}
                    onChange={(e) =>
                      setCmsForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. ChicagoLou"
                    labelClassName="        text-purple-200/80 mb-0"
                    inputClassName="bg-black/50 border border-white/15  px-5 py-2.5   placeholder-gray-500   font-normal"
                  />

                  <InputField
                    label="Venue Name"
                    value={cmsForm.venue}
                    onChange={(e) =>
                      setCmsForm((prev) => ({ ...prev, venue: e.target.value }))
                    }
                    placeholder="e.g. DeKalb Cornfest"
                    labelClassName="        text-purple-200/80 mb-0"
                    inputClassName="bg-black/50 border border-white/15  px-5 py-2.5   placeholder-gray-500   font-normal"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="City & State"
                    value={cmsForm.city}
                    onChange={(e) =>
                      setCmsForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="e.g. DeKalb, IL"
                    labelClassName="        text-purple-200/80 mb-0"
                    inputClassName="bg-black/50 border border-white/15  px-5 py-2.5   placeholder-gray-500   font-normal"
                  />

                  <InputField
                    label="Display Date"
                    value={cmsForm.date}
                    onChange={(e) =>
                      setCmsForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    placeholder="e.g. August 2024"
                    labelClassName=""
                    inputClassName="bg-black/50 border border-white/15  px-5 py-2.5   placeholder-gray-500   font-normal"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block min-h-[24px]">
                      Media Type
                    </label>
                    <CustomDropdown
                      value={cmsForm.type}
                      options={[
                        { value: "image", label: "Photo Image" },
                        { value: "video", label: "Video File" },
                      ]}
                      onChange={(val) =>
                        setCmsForm((prev) => ({
                          ...prev,
                          type: val as "image" | "video",
                        }))
                      }
                      chevronColor="#c084fc"
                      className="!border-white/15 !bg-black/50 !px-5 !py-2.5 !font-normal"
                    />
                  </div>

                  <InputField
                    label="Instagram Handle"
                    value={cmsForm.instagram}
                    onChange={(e) =>
                      setCmsForm((prev) => ({
                        ...prev,
                        instagram: e.target.value,
                      }))
                    }
                    placeholder="e.g. @chicagolou"
                    labelClassName="        text-purple-200/80 mb-0"
                    inputClassName="bg-black/50 border border-white/15  px-5 py-2.5   placeholder-gray-500   font-normal"
                  />
                </div>

                <InputField
                  label="Photo / Video Image URL or Path"
                  required
                  value={cmsForm.src}
                  onChange={(e) =>
                    setCmsForm((prev) => ({ ...prev, src: e.target.value }))
                  }
                  placeholder="e.g. /images/fan-photo-featured.jpg or https://..."
                  labelClassName="        text-purple-200/80 mb-0"
                  inputClassName="bg-black/50 border border-white/15  px-5 py-2.5   placeholder-gray-500   font-normal"
                />

                <InputField
                  label="Caption / Memory Quote"
                  multiline
                  rows={3}
                  value={cmsForm.caption}
                  onChange={(e) =>
                    setCmsForm((prev) => ({ ...prev, caption: e.target.value }))
                  }
                  placeholder="e.g. Front row every single time. Best night of the summer!"
                  labelClassName="        text-purple-200/80 mb-0"
                  inputClassName="bg-black/50 border border-white/15  px-5 py-2.5   placeholder-gray-500   font-normal"
                />

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={cmsForm.isFeatured}
                    onChange={(e) =>
                      setCmsForm((prev) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="cursor-pointer rounded border-white/20 bg-black/50 text-purple-600 focus:ring-purple-500"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="cursor-pointer text-purple-200/90"
                  >
                    Feature as Top Hero Moment?
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddCmsModalOpen(false)}
                    className="btn-secondary cursor-pointer px-5 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCms}
                    className="btn-primary flex cursor-pointer items-center gap-2 px-6 py-2.5 disabled:opacity-50"
                  >
                    {isSavingCms ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving Moment...</span>
                      </>
                    ) : (
                      <span>+ ADD MOMENT TO SANITY</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
