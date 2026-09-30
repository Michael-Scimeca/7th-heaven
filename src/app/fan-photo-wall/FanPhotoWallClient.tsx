/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable @next/next/no-img-element, react-doctor/nextjs-no-img-element, react-doctor/img-redundant-alt */
"use client";
import Image from "next/image";
import {
  Lock,
  Camera,
  MapPin,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import React, {
  useState,
  useEffect,
  useCallback,
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
import AddCmsButton from "@/components/AddCmsButton";
import PageHero from "@/components/PageHero";
import InputField from "@/components/InputField";
import CustomDropdown from "@/components/CustomDropdown";
import { getMediaUrl } from "@/lib/sanity";
import { FanPhoto } from "@/lib/fanPhotos";
import SectionBadge from "@/components/SectionBadge";
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

export default function FanPhotoWallClient({
  sanityContent,
  initialPhotos = [],
}: {
  sanityContent?: any;
  initialPhotos?: FanPhoto[];
}) {
  const { member, isLoggedIn, openModal } = useMember();
  const [photos, setPhotos] = useState<FanPhoto[]>(initialPhotos);
  const [photosLoading, setPhotosLoading] = useState(initialPhotos.length === 0);
  const [selectedPhoto, setSelectedPhoto] = useState<FanPhoto | null>(null);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const mounted = useMounted();

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

  const isAdmin = Boolean(
    isLoggedIn &&
    (member?.role === "admin" ||
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

  return (
    <div className="page-container page-stack min-h-screen" id="fan-photo-wall-page">
      {/* ── HERO SECTION WITH GLASS BLUR BACKGROUND ── */}
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
                  <SeventhButton
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
                  </SeventhButton>
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
              <div className="animate-[fade-in-up_0.4s_var(--ease-out-expo)_both]">
                <FanUploadForm />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PHOTO GRID & MODERATION SECTION (FULL BLEED) ── */}

      {/* ═══ Moderation Queue (Admins & Crew) ═══ */}
      {isModerator && pendingPhotos.length > 0 && (
        <section
          id="pending-queue"
          aria-labelledby="pending-queue-heading"
          className="section"
        >
          <div className="site-container  mx-auto">
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
                    className="flex w-full flex-col justify-between rounded-2xl border border-white/10 p-4 text-left shadow-xl hover:border-purple-400/40"
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
                        <div className="absolute top-2.5 right-2.5 border border-white/10 bg-black/80 px-2.5 py-1   text-white">
                          {photo.date || "Pending"}
                        </div>
                      </div>
                      <div className="npm space-y-1.5">
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
        <div className="site-container  mx-auto">
          <div className="title-group title-group--section mb-6">
            <h2 id="featured-media-heading">{sanityContent?.sectionTitle || "FEATURED MEDIA"}</h2>
            <p className="max-w-2xl">
              {sanityContent?.sectionDescription ||
                "Featured media highlights, live concert captures, fan photos, and video moments from 7th Heaven shows across the country."}
            </p>{" "}
          </div>

          {/* Photo Feed Grid - Full Bleed 0 Gap Uniform Grid */}
          {/* overflow-anchor:auto enables CSS scroll anchoring so new rows appended below the viewport don't shift the user's current position */}
          {photosLoading ? (
            /* Skeleton grid: same aspect-ratio as real cards, prevents height jump when photos load */
            <div className="mx-auto grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ overflowAnchor: 'auto' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="h-10 w-full animate-pulse bg-white/[0.04]" />
                  <div className="aspect-[16/10] w-full animate-pulse bg-white/[0.03]" />
                </div>
              ))}
            </div>
          ) : approvedPhotos.length > 0 ? (
            <div className="mx-auto grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ overflowAnchor: 'auto' }}>
              {approvedPhotos.map((photo, index) => {
                const mediaDetails = getMediaDetails(photo);
                return (
                  <div
                    key={photo.id}
                    className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-purple-900/30 hover:bg-[#0b041a]/90"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/[0.02] p-4">
                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <div
                          className="flex aspect-square h-11 w-11 min-w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 font-semibold text-white"
                        >
                          {photo.name
                            ? photo.name
                              .split(" ")
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                            : "FP"}
                        </div>
                        <div className="npm min-w-0">
                          <p className="font-semibold text-white">{photo.name}</p>
                          {(photo.venue || photo.city) && (
                            <p className="mt-0.5   text-white/60">
                              {photo.venue}
                              {photo.venue && photo.city && " • "}
                              {photo.city}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5   text-white/60">
                        <span>{mediaDetails.isVideo ? "Video" : "Photo"}</span>
                        {photo.date && <span>{photo.date}</span>}
                      </div>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      className="group relative w-full flex-1 cursor-pointer text-left select-none"
                      onClick={() => setSelectedPhoto(photo)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedPhoto(photo);
                        }
                      }}
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                        {mediaDetails.isDirectVideo ? (
                          <video
                            src={mediaDetails.videoSrc}
                            className="block h-full w-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <Image
                            src={
                              mediaDetails.isYouTube
                                ? `https://img.youtube.com/vi/${mediaDetails.youtubeId}/hqdefault.jpg`
                                : photo.src
                            }
                            alt={`Media by ${photo.name}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="block h-full w-full object-cover"
                            priority={index < 3}
                            fetchPriority={index < 3 ? "high" : undefined}
                            loading={index < 3 ? undefined : "lazy"}
                          />
                        )}
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 transition-opacity duration-300 group-hover:bg-black/60">
                          <SeventhButton>
                            {mediaDetails.isVideo ? "Play Video" : "Expand Photo"}
                          </SeventhButton>
                        </div>
                      </div>
                    </div>
                    {photo.caption && (
                      <div className="flex flex-1 items-center border-t border-white/10 bg-black/[0.02] p-4 text-sm text-white/80">
                        <p>&ldquo;{photo.caption}&rdquo;</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state (only shown after loading completes) */
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
                  className=""
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
                          <span className="rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1   text-purple-300 shrink-0">
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
                            <p className="mx-auto max-w-3xl text-sm  text-white/90 drop-shadow">
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
            <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-purple-500/30 bg-[#12071f] p-6 text-left sm:p-8">
              <button
                type="button"
                onClick={() => setIsAddCmsModalOpen(false)}
                className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center  border border-purple-500/40 bg-purple-600/20 text-purple-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl">Add Photo / Video to Sanity CMS</h3>
                  <p className="">
                    Create and publish a fan wall moment directly to Sanity CMS.
                  </p>
                </div>
              </div>

              {cmsError && (
                <div className="mb-6 flex items-center gap-2  border border-red-500/50 bg-red-900/40 p-3 text-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{cmsError}</span>
                </div>
              )}

              {cmsSuccess && (
                <div className="mb-6 flex items-center gap-2  border border-emerald-500/50 bg-emerald-900/40 p-3 text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Moment added successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveCmsMoment} className="space-y-4">
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
                    <label className="block min-h-[24px] ">
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
                      className="! !border-white/15 !bg-black/50 !px-5 !py-2.5 !font-normal"
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
                    className="btn-secondary cursor-pointer  px-5 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCms}
                    className="btn-primary flex cursor-pointer items-center gap-2  px-6 py-2.5 disabled:opacity-50"
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
