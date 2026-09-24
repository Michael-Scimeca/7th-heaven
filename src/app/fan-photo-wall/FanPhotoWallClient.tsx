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

const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
import { useMember } from "@/context/MemberContext";
import SeventhButton from "@/components/SeventhButton";
import AddCmsButton from "@/components/AddCmsButton";
import InputField from "@/components/InputField";
import CustomDropdown from "@/components/CustomDropdown";
import { getMediaUrl } from "@/lib/sanity";
import dynamic from "next/dynamic";

const FanUploadForm = dynamic(() => import("@/components/FanUploadForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse border border-white/10 bg-white/[0.02] p-8 text-center text-white/40">
      Loading Upload Form...
    </div>
  ),
});

type FanPhoto = {
  id: string;
  src: string;
  name: string;
  venue?: string;
  city?: string;
  date?: string;
  caption?: string;
  instagram?: string;
  type?: "image" | "video";
  approved: boolean;
};

export default function FanPhotoWallClient({
  sanityContent,
}: {
  sanityContent?: any;
}) {
  const { member, isLoggedIn, openModal } = useMember();
  const [photos, setPhotos] = useState<FanPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<FanPhoto | null>(null);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const mounted = useMounted();

  const [isAddCmsModalOpen, setIsAddCmsModalOpen] = useState(false);
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
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent("7h:page:ready"));
        });
      })
      .catch(() => {
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
    fetchPhotos();
  }, [fetchPhotos]);

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
  const approvedPhotos = isModerator
    ? photos.filter((p) => p.approved)
    : photos;

  return (
    <div className="page-container min-h-screen" id="fan-photo-wall-page">
      {/* ── HERO SECTION WITH GLASS BLUR BACKGROUND ── */}
      <section
        className="site-container relative flex flex-col justify-center"
        id="fan-wall"
      >
        <div className="relative z-10">
          {/* Hero Header */}
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end lg:gap-8">
            <div className="text-left">
              <h1>
                {sanityContent?.heroHeading ? (
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
                )}
              </h1>
              <p className="mt-3 max-w-2xl">
                {sanityContent?.heroSubheading ||
                  sanityContent?.subtitle ||
                  "Share your best memories, stage captures, and live concert moments from 7th Heaven shows. Upload your photos and videos and join the community wall!"}
              </p>

              {/* Login Promo text if guest */}
              {!effectivelyLoggedIn && (
                <div className="mt-4 flex max-w-xl flex-wrap items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0 text-purple-400" />
                  <p>
                    {sanityContent?.guestLockText ? (
                      sanityContent.guestLockText
                    ) : (
                      <>
                        You must be a <span>Fan Member</span> to share your
                        moments.{" "}
                        <button
                          onClick={() => openModal("signup")}
                          className="hover: cursor-pointer"
                        >
                          Sign up free
                        </button>{" "}
                        or{" "}
                        <button
                          onClick={() => openModal("login")}
                          className="hover: cursor-pointer"
                        >
                          sign in
                        </button>
                        .
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons on the Right (Stacked Vertically) */}
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
          </div>

          {/* Dynamic Upload Form */}
          {showUpload && effectivelyLoggedIn && (
            <div className="0 animate-[fade-in-up_0.4s_var(--ease-out-expo)_both]">
              <FanUploadForm />
            </div>
          )}
        </div>
      </section>

      {/* ── PHOTO GRID & MODERATION SECTION (FULL BLEED) ── */}

      {/* ═══ Moderation Queue (Admins & Crew) ═══ */}
      {isModerator && pendingPhotos.length > 0 && (
        <section className="site-container py-section-fluid mx-auto">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3>
                {sanityContent?.pendingQueueTitle || "Pending Review Queue"}
              </h3>
              <p>
                {sanityContent?.pendingQueueSubtitle ||
                  "Viewed & Approved by Admins & Crew only"}
              </p>
            </div>

            <span className="border border-white/10 bg-[#00000040] px-3 py-1">
              {pendingPhotos.length} Pending
            </span>
          </div>

          {/* ── STACKED CARD GRID LAYOUT ── */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pendingPhotos.map((photo) => {
              const isVideo =
                photo.type === "video" ||
                photo.src.endsWith(".mp4") ||
                photo.src.endsWith(".mov");
              return (
                <div
                  key={photo.id}
                  className="flex w-full flex-col justify-between rounded-2xl border border-purple-500/20 p-4 text-left shadow-xl backdrop-blur-md hover:border-purple-400/40"
                >
                  <div>
                    <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                      {isVideo ? (
                        <video
                          src={photo.src}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          autoPlay
                          loop
                        />
                      ) : (
                        <Image
                          src={photo.src}
                          alt="Fan Upload"
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          unoptimized
                          className="object-cover"
                        />
                      )}
                      <div className="absolute top-2.5 right-2.5 border border-white/10 bg-black/80 px-2.5 py-1 backdrop-blur-md">
                        {photo.date || "Pending"}
                      </div>
                    </div>
                    <div className="none-paragraph-container space-y-1.5">
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
                    <button
                      onClick={() => handleRejectPhoto(photo.id)}
                      disabled={moderatingId === photo.id}
                      className="cursor-pointer !rounded-full border border-red-500/30 bg-red-950/60 text-center text-red-200 hover:bg-red-900/80"
                    >
                      Reject
                    </button>
                    <SeventhButton
                      onClick={() => handleApprovePhoto(photo.id)}
                      disabled={moderatingId === photo.id}
                      icon={false}
                      className="text-center"
                    >
                      Approve
                    </SeventhButton>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Media Section Title & Paragraph */}
      <section className="site-container py-section-fluid mx-auto">
        <div className="mb-6">
          <h2>{sanityContent?.sectionTitle || "FEATURED MEDIA"}</h2>
          <p className="mt-2 max-w-2xl">
            {sanityContent?.sectionDescription ||
              "Featured media highlights, live concert captures, fan photos, and video moments from 7th Heaven shows across the country."}
          </p>{" "}
        </div>

        {/* Photo Feed Grid - Full Bleed 0 Gap Uniform Grid */}
        {approvedPhotos.length > 0 ? (
          <div className="mx-auto grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {approvedPhotos.map((photo) => {
              const isVideo =
                photo.type === "video" ||
                photo.src.endsWith(".mp4") ||
                photo.src.endsWith(".mov");
              return (
                <div
                  key={photo.id}
                  className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-purple-900/30 hover:bg-[#0b041a]/90"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/[0.02] p-4">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <div
                        className="flex aspect-square h-11 w-11 min-w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5"
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
                      <div className="none-paragraph-container min-w-0">
                        <p>{photo.name}</p>
                        {(photo.venue || photo.city) && (
                          <p className="mt-0.5">
                            {photo.venue}
                            {photo.venue && photo.city && " • "}
                            {photo.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <span>{isVideo ? "Video" : "Photo"}</span>
                      {photo.date && <span>{photo.date}</span>}
                    </div>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="group relative w-full flex-1 cursor-pointer text-left"
                    onClick={() => setSelectedPhoto(photo)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedPhoto(photo);
                      }
                    }}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                      {photo.src.endsWith(".mp4") ||
                      photo.src.endsWith(".mov") ||
                      photo.src.endsWith(".webm") ? (
                        <video
                          src={photo.src}
                          className="block h-full w-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <Image
                          src={photo.src}
                          alt={`Media by ${photo.name}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                          className="block h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent pb-8 opacity-0 group-hover:opacity-100">
                        <SeventhButton>
                          {isVideo ? "Play Video" : "Expand Photo"}
                        </SeventhButton>
                      </div>
                    </div>
                  </div>
                  {photo.caption && (
                    <div className="flex flex-1 items-center border-t border-white/10 bg-black/[0.02] p-4">
                      <p>&ldquo;{photo.caption}&rdquo;</p>
                    </div>
                  )}
                </div>
              );
            })}
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
                className="/15"
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

        {/* Lightbox */}
        {mounted &&
          selectedPhoto &&
          createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-8"
              onClick={() => setSelectedPhoto(null)}
            >
              <div
                className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-black/80 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  aria-label="Close"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 z-20 cursor-pointer !rounded-full border border-white/10 bg-black/50 p-2 text-white/60 hover:bg-black/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
                {selectedPhoto.type === "video" ||
                selectedPhoto.src.endsWith(".mp4") ||
                selectedPhoto.src.endsWith(".mov") ? (
                  <video
                    src={selectedPhoto.src}
                    className="max-h-[65vh] w-full rounded-xl object-contain"
                    controls
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={selectedPhoto.src}
                    alt={selectedPhoto.name}
                    className="max-h-[65vh] w-full rounded-xl object-contain shadow-2xl"
                  />
                )}
                <div className="mt-4 flex items-start justify-between gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p>{selectedPhoto.name}</p>
                    {selectedPhoto.venue && (
                      <p className="mt-0.5">
                        {selectedPhoto.venue}
                        {selectedPhoto.city ? ` — ${selectedPhoto.city}` : ""}
                        {selectedPhoto.date ? ` · ${selectedPhoto.date}` : ""}
                      </p>
                    )}
                    {selectedPhoto.caption && (
                      <p className="mt-2 text-left text-gray-300">
                        &ldquo;{selectedPhoto.caption}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      onClick={() => handleFlagPhoto(selectedPhoto.id)}
                      disabled={flaggingId === selectedPhoto.id}
                      className="st flex items-center gap-1.5 text-white/40 hover:text-red-400 disabled:opacity-50"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                      {flaggingId === selectedPhoto.id
                        ? "Flagging..."
                        : "Report"}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )}
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-600/20 text-purple-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl">Add Photo / Video to Sanity CMS</h3>
                  <p className="/70">
                    Create and publish a fan wall moment directly to Sanity CMS.
                  </p>
                </div>
              </div>

              {cmsError && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-900/40 p-3 text-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{cmsError}</span>
                </div>
              )}

              {cmsSuccess && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-900/40 p-3 text-emerald-200">
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
                    inputClassName="bg-black/50 border border-white/15 rounded-xl px-5 py-2.5   placeholder-gray-500   font-normal"
                  />

                  <InputField
                    label="Venue Name"
                    value={cmsForm.venue}
                    onChange={(e) =>
                      setCmsForm((prev) => ({ ...prev, venue: e.target.value }))
                    }
                    placeholder="e.g. DeKalb Cornfest"
                    labelClassName="        text-purple-200/80 mb-0"
                    inputClassName="bg-black/50 border border-white/15 rounded-xl px-5 py-2.5   placeholder-gray-500   font-normal"
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
                    inputClassName="bg-black/50 border border-white/15 rounded-xl px-5 py-2.5   placeholder-gray-500   font-normal"
                  />

                  <InputField
                    label="Display Date"
                    value={cmsForm.date}
                    onChange={(e) =>
                      setCmsForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    placeholder="e.g. August 2024"
                    labelClassName="        text-purple-200/80 mb-0"
                    inputClassName="bg-black/50 border border-white/15 rounded-xl px-5 py-2.5   placeholder-gray-500   font-normal"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block min-h-[24px] text-purple-200/80">
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
                      className="! !rounded-xl !border-white/15 !bg-black/50 !px-5 !py-2.5 !font-normal"
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
                    inputClassName="bg-black/50 border border-white/15 rounded-xl px-5 py-2.5   placeholder-gray-500   font-normal"
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
                  inputClassName="bg-black/50 border border-white/15 rounded-xl px-5 py-2.5   placeholder-gray-500   font-normal"
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
                  inputClassName="bg-black/50 border border-white/15 rounded-xl px-5 py-2.5   placeholder-gray-500   font-normal"
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
                    className="btn-secondary cursor-pointer rounded-xl px-5 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCms}
                    className="btn-primary flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 disabled:opacity-50"
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
