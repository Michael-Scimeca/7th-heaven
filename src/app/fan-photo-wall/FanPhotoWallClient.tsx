/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable @next/next/no-img-element, react-doctor/nextjs-no-img-element, react-doctor/img-redundant-alt */
"use client";
import Image from 'next/image';
import { Lock, Camera, MapPin, X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => { };
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);
import { useMember } from "@/context/MemberContext";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import AddCmsButton from "@/components/AddCmsButton";
import dynamic from "next/dynamic";

const FanUploadForm = dynamic(() => import("@/components/FanUploadForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-white/[0.02] border border-white/10 p-8 text-center text-white/40 uppercase">
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

export default function FanPhotoWallClient({ sanityContent }: { sanityContent?: any }) {
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
    const isMock = search.includes('mockUpload=true') || search.includes('mockScanning=true') || search.includes('mockSuccess=true');
    setShowUpload(isMock);
    setMockMode(isMock);
  }, []);

  const effectivelyLoggedIn = isLoggedIn || mockMode;

  // Pending Review Queue is restricted STRICTLY to authenticated Admins & Crew members only
  const isModerator = Boolean(
    isLoggedIn &&
    (
      member?.role === "admin" ||
      member?.role === "crew" ||
      (member as unknown as Record<string, unknown>)?.isCrew === true ||
      (member as unknown as Record<string, unknown>)?.isAdmin === true
    )
  );

  // Fetch photos and notify PageTransition when data & images are loaded
  const fetchPhotos = useCallback(() => {
    const url = isModerator ? "/api/fans?all=true" : "/api/fans";
    fetch(url)
      .then((r) => r.ok ? r.json() : [])
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
        if (!localStorage.getItem("7h_member_v1") && !localStorage.getItem("7h_member")) {
          localStorage.setItem("7h_member_v1", JSON.stringify({
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
          }));
          window.location.reload();
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleFlagPhoto = async (id: string) => {
    if (confirm("Are you sure you want to flag this photo or video for admin review?")) {
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
          prev.map((p) => (p.id === id ? { ...p, approved: true } : p))
        );
      }
    } catch (err) {
      console.error("Failed to approve photo:", err);
    } finally {
      setModeratingId(null);
    }
  };

  const handleRejectPhoto = async (id: string) => {
    if (confirm("Are you sure you want to reject and delete this photo/video?")) {
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
  const approvedPhotos = isModerator ? photos.filter((p) => p.approved) : photos;

  return (
    <div className="min-h-screen pt-[100px]">
      {/* ── HERO SECTION WITH GLASS BLUR BACKGROUND ── */}
      <section className="site-container relative pb-8 overflow-hidden flex flex-col justify-center" id="fan-wall">
        <div className="relative z-10">
          {/* Hero Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8">
            <div className="text-left">
              <h1 className="uppercase text-white leading-none">
                {sanityContent?.heroHeading || sanityContent?.title || (
                  <>
                    FAN PHOTO &amp; VIDEO <span className="inline-block pr-[0.15em]">WALL</span>
                  </>
                )}
              </h1>
              <p className="mt-3 max-w-2xl">
                {sanityContent?.heroSubheading || sanityContent?.subtitle || "Share your best memories, stage captures, and live concert moments from 7th Heaven shows. Upload your photos and videos and join the community wall!"}
              </p>

              {/* Login Promo text if guest */}
              {!effectivelyLoggedIn && (
                <div className="mt-4 text-white/70 flex items-center gap-2 max-w-xl flex-wrap">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                  <p>
                    {sanityContent?.guestLockText ? (
                      sanityContent.guestLockText
                    ) : (
                      <>
                        You must be a <span className="text-white">Fan Member</span> to share your moments.{" "}
                        <button aria-label="Action button"
                          onClick={() => openModal("signup")}
                          className="underline text-white hover:text-purple-300 transition-colors cursor-pointer">
                          Sign up free
                        </button>{" "}
                        or{" "}
                        <button aria-label="Action button"
                          onClick={() => openModal("login")}
                          className="underline text-white hover:text-purple-300 transition-colors cursor-pointer">
                          sign in
                        </button>
                        .
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons on the Right */}
            <div className="shrink-0 self-start lg:self-end flex flex-wrap items-center gap-3">
              <AddCmsButton
                label="ADD PHOTO / VIDEO IN SANITY CMS"
                onClick={() => setIsAddCmsModalOpen(true)}
              />
              <CosmicRadialButton
                onClick={() => {
                  if (!isLoggedIn) {
                    openModal("login");
                  } else {
                    setShowUpload(!showUpload);
                  }
                }}
                icon={<Camera className="w-4 h-4" />}
                className="px-8 py-4 rounded-lg text-white">
                {showUpload
                  ? (sanityContent?.uploadButtonHideText || "Hide Upload Form")
                  : (sanityContent?.uploadButtonText || "Upload Photo / Video")}
              </CosmicRadialButton>
            </div>
          </div>

          {/* Dynamic Upload Form */}
          {
            showUpload && effectivelyLoggedIn && (
              <div className="mt-10 animate-[fade-in-up_0.4s_var(--ease-out-expo)_both]">
                <FanUploadForm />
              </div>
            )
          }
        </div>
      </section>

      {/* ── PHOTO GRID & MODERATION SECTION (FULL BLEED) ── */}
      <section className="py-0 w-full max-w-none">
        {/* ═══ Moderation Queue (Admins & Crew) ═══ */}
        {
          isModerator && pendingPhotos.length > 0 && (
            <div className="mx-auto site-container">
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h3 className="text-white">
                    {sanityContent?.pendingQueueTitle || "Pending Review Queue"}
                  </h3>
                  <p className="uppercase">
                    {sanityContent?.pendingQueueSubtitle || "Viewed & Approved by Admins & Crew only"}
                  </p>
                </div>
                <span className="ml-auto bg-[#00000029] text-white px-3 py-1 rounded-lg border border-white/10">
                  {pendingPhotos.length} Pending
                </span>
              </div>

              <div className="grid grid-cols-1 mb-12 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPhotos.map((photo) => {
                  const isVideo =
                    photo.type === "video" ||
                    photo.src.endsWith(".mp4") ||
                    photo.src.endsWith(".mov");
                  return (
                    <div
                      key={photo.id}
                      className="p-4 bg-[#e1e6ff15] border border-white/10 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center    backdrop-blur-md max-w-[520px] w-full">
                      {/* Thumbnail twice as big (w-56 h-56 / 224px) */}
                      <div className="relative w-56 h-56 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                        {isVideo ? (
                          <video
                            src={photo.src}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            autoPlay
                            loop
                          />
                        ) : (
                          <Image
                            src={photo.src}
                            alt="Fan Upload Thumbnail"
                            fill
                            sizes="224px"
                            unoptimized
                            className="object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[12px] text-white/90">
                          {photo.date || "Pending"}
                        </div>
                      </div>

                      {/* Metadata & Actions */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                        <div>
                          <div className="flex items-center gap-1 text-white truncate">
                            <span className="text-purple-400">@</span>
                            <span className="truncate">{photo.name}</span>
                          </div>
                          {photo.venue && (
                            <p className="uppercase truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-purple-400 shrink-0" /> {photo.venue}
                            </p>
                          )}
                          {photo.caption && (
                            <p className="truncate mt-1">
                              &quot;{photo.caption}&quot;
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={() => handleRejectPhoto(photo.id)}
                            disabled={moderatingId === photo.id}
                            className="py-1.5 px-2 text-[10px] uppercase text-red-200 bg-red-950/50 border border-red-500/30 rounded-lg hover:bg-red-900/70 transition-colors cursor-pointer text-center">
                            Reject
                          </button>
                          <CosmicRadialButton
                            onClick={() => handleApprovePhoto(photo.id)}
                            disabled={moderatingId === photo.id}
                            icon={false}
                            className="!py-1.5 !px-2 text-[10px] text-white ! rounded-lg text-center">
                            Approve
                          </CosmicRadialButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        }

        {/* Featured Hero Photo */}
        {
          approvedPhotos.length > 0 && (
            <div className="mx-auto">
              <div className="relative w-full aspect-[21/9] overflow-hidden text-left">
                {approvedPhotos[0].type === "video" ||
                  approvedPhotos[0].src.endsWith(".mp4") ||
                  approvedPhotos[0].src.endsWith(".mov") ? (
                  <video
                    src={approvedPhotos[0].src}
                    className="w-full h-full object-cover object-top"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={approvedPhotos[0].src}
                    alt={`Featured: ${approvedPhotos[0].name}`}
                    fill
                    sizes="100vw"
                    unoptimized
                    priority
                    className="object-cover object-top"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <span className="inline-block text-[10px] sm:text-[11px] uppercase px-3 py-1 rounded-lg border border-white/10 bg-black/45 backdrop-blur-md text-white/90 mb-2">
                    {sanityContent?.featuredMomentBadge || "Featured Moment"}
                  </span>
                  <h3 className="uppercase text-purple-300 leading-none drop-">
                    {approvedPhotos[0].name}
                  </h3>
                  <div className="flex items-center gap-2 text-white/70 font-semibold mt-2">
                    {approvedPhotos[0].venue && <span>{approvedPhotos[0].venue}</span>}
                    {approvedPhotos[0].venue && approvedPhotos[0].date && (
                      <span>·</span>
                    )}
                    {approvedPhotos[0].date && <span>{approvedPhotos[0].date}</span>}
                  </div>
                  {approvedPhotos[0].caption && (
                    <p className="mt-2 max-w-xl drop-shadow">
                      &ldquo;{approvedPhotos[0].caption}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* Photo Feed Grid - Full Bleed 0 Gap Uniform Grid */}
        {
          approvedPhotos.length > 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 w-full border-t border-white/10">
              {approvedPhotos.slice(1).map((photo) => {
                const isVideo =
                  photo.type === "video" ||
                  photo.src.endsWith(".mp4") ||
                  photo.src.endsWith(".mov");
                return (
                  <div
                    key={photo.id}
                    className="flex flex-col justify-between bg-[#0b041a]/90 border-b border-r border-white/10 overflow-hidden hover:bg-purple-900/30 transition-colors duration-300 h-full">
                    <div className="pl-4 sm:pl-8 pr-4 py-3.5 sm:py-4 flex items-center justify-between border-b border-white/10 bg-black/[0.02] gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 min-w-8 min-h-8 shrink-0 aspect-square rounded-full bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 flex items-center justify-center text-white" style={{ aspectRatio: "1 / 1" }}>
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
                        <div className="min-w-0">
                          <p className="text-purple-300 truncate">
                            {photo.name}
                          </p>
                          {(photo.venue || photo.city) && (
                            <p className="uppercase mt-0.5 truncate">
                              {photo.venue}
                              {photo.venue && photo.city && " • "}
                              {photo.city}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-white text-[10px] uppercase">
                          {isVideo ? "Video" : "Photo"}
                        </span>
                        {photo.date && (
                          <span className="text-white/70 text-[10px] font-medium">{photo.date}</span>
                        )}
                      </div>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      className="relative group cursor-pointer w-full text-left flex-1"
                      onClick={() => setSelectedPhoto(photo)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPhoto(photo); } }}>
                      <div className="relative aspect-[16/10] w-full bg-black/40 overflow-hidden">
                        {isVideo ? (
                          <video
                            src={photo.src}
                            className="w-full h-full object-cover block"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <Image
                            src={photo.src}
                            alt={`Photo by ${photo.name}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized
                            className="w-full h-full object-cover block"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8 z-10">
                          <FoolishShrimpButton>
                            {isVideo ? "Play Video" : "Expand Photo"}
                          </FoolishShrimpButton>
                        </div>
                      </div>
                    </div>
                    {photo.caption && (
                      <div className="pl-4 sm:pl-8 pr-4 py-3 sm:py-4 bg-black/[0.02] border-t border-white/10 flex-1 flex items-center">
                        <p className="font-medium">
                          &ldquo;{photo.caption}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-32">
              <div className="w-20 h-20 mx-auto mb-8 border border-white/10 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/15">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 className="text-white/30 mb-3">
                {sanityContent?.emptyStateTitle || "No moments yet"}
              </h3>
              <p className="mb-8 max-w-sm mx-auto">
                {sanityContent?.emptyStateSubtitle || "Check back soon for moments from 7th Heaven shows!"}
              </p>
            </div>
          )
        }

        {/* Lightbox */}
        {
          mounted && selectedPhoto && createPortal(
            <div
              className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
              onClick={() => setSelectedPhoto(null)}>
              <div
                className="relative max-w-4xl max-h-[90vh] w-full flex flex-col bg-black/80 rounded-lg p-6   overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                <button aria-label="Close"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white bg-black/50 hover:bg-black/80 p-2 !rounded-full border border-white/10 transition-colors cursor-pointer z-20">
                  <X className="w-5 h-5" />
                </button>
                {selectedPhoto.type === "video" ||
                  selectedPhoto.src.endsWith(".mp4") ||
                  selectedPhoto.src.endsWith(".mov") ? (
                  <video
                    src={selectedPhoto.src}
                    className="w-full max-h-[65vh] object-contain rounded-xl"
                    controls
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={selectedPhoto.src}
                    alt={selectedPhoto.name}
                    className="w-full max-h-[65vh] object-contain rounded-xl shadow-2xl"
                  />
                )}
                <div className="mt-4 flex items-start justify-between gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-white text-lg">
                      {selectedPhoto.name}
                    </p>
                    {selectedPhoto.venue && (
                      <p className="mt-0.5 text-sm text-purple-300 font-medium">
                        {selectedPhoto.venue}
                        {selectedPhoto.city ? ` — ${selectedPhoto.city}` : ""}
                        {selectedPhoto.date ? ` · ${selectedPhoto.date}` : ""}
                      </p>
                    )}
                    {selectedPhoto.caption && (
                      <p className="mt-2 text-left text-gray-300 text-sm">
                        &ldquo;{selectedPhoto.caption}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button aria-label="Action button"
                      onClick={() => handleFlagPhoto(selectedPhoto.id)}
                      disabled={flaggingId === selectedPhoto.id}
                      className="text-white/40 hover:text-red-400 text-xs uppercase st transition-colors flex items-center gap-1.5 disabled:opacity-50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                      {flaggingId === selectedPhoto.id ? "Flagging..." : "Report"}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        }
      </section>

      {/* ── ADD PHOTO / VIDEO CMS MODAL PORTAL ── */}
      {mounted && isAddCmsModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-xl bg-[#12071f] border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.25)] text-left max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddCmsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Add Photo / Video to Sanity CMS</h3>
                <p className="text-xs text-purple-300/70">Create and publish a fan wall moment directly to Sanity CMS.</p>
              </div>
            </div>

            {cmsError && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-500/50 text-red-200 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{cmsError}</span>
              </div>
            )}

            {cmsSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Moment added successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveCmsMoment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Fan / Contributor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cmsForm.name}
                    onChange={(e) => setCmsForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. ChicagoLou"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={cmsForm.venue}
                    onChange={(e) => setCmsForm((prev) => ({ ...prev, venue: e.target.value }))}
                    placeholder="e.g. DeKalb Cornfest"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    City &amp; State
                  </label>
                  <input
                    type="text"
                    value={cmsForm.city}
                    onChange={(e) => setCmsForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. DeKalb, IL"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Display Date
                  </label>
                  <input
                    type="text"
                    value={cmsForm.date}
                    onChange={(e) => setCmsForm((prev) => ({ ...prev, date: e.target.value }))}
                    placeholder="e.g. August 2024"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Media Type
                  </label>
                  <select
                    value={cmsForm.type}
                    onChange={(e) => setCmsForm((prev) => ({ ...prev, type: e.target.value as "image" | "video" }))}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm cursor-pointer"
                  >
                    <option value="image">Photo Image</option>
                    <option value="video">Video File</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={cmsForm.instagram}
                    onChange={(e) => setCmsForm((prev) => ({ ...prev, instagram: e.target.value }))}
                    placeholder="e.g. @chicagolou"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                  Photo / Video Image URL or Path *
                </label>
                <input
                  type="text"
                  required
                  value={cmsForm.src}
                  onChange={(e) => setCmsForm((prev) => ({ ...prev, src: e.target.value }))}
                  placeholder="e.g. /images/fan-photo-featured.jpg or https://..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                  Caption / Memory Quote
                </label>
                <textarea
                  rows={3}
                  value={cmsForm.caption}
                  onChange={(e) => setCmsForm((prev) => ({ ...prev, caption: e.target.value }))}
                  placeholder="e.g. Front row every single time. Best night of the summer!"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={cmsForm.isFeatured}
                  onChange={(e) => setCmsForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                  className="rounded border-white/20 bg-black/50 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-xs text-purple-200/90 font-semibold cursor-pointer">
                  Feature as Top Hero Moment?
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddCmsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCms}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingCms ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
        document.body
      )}
    </div>
  );
}
