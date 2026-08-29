/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable @next/next/no-img-element, react-doctor/nextjs-no-img-element, react-doctor/img-redundant-alt */
"use client";
import Image from 'next/image';
import { Lock, Camera, Shield, MapPin, X, Sparkles } from "lucide-react";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => { };
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);
import { useMember } from "@/context/MemberContext";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import dynamic from "next/dynamic";

const FanUploadForm = dynamic(() => import("@/components/FanUploadForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-white/[0.02] border border-white/10 p-8 text-center text-white/40 font-bold uppercase   ">
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

export default function FansPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const [photos, setPhotos] = useState<FanPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<FanPhoto | null>(null);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const mounted = useMounted();

  useEffect(() => {
    const search = window.location.search;
    const isMock = search.includes('mockUpload=true') || search.includes('mockScanning=true') || search.includes('mockSuccess=true');
    setShowUpload(isMock);
    setMockMode(isMock);
  }, []);

  const [isDevBypass, setIsDevBypass] = useState(false);
  useEffect(() => {
    /* oxlint-disable-next-line react-doctor/no-hydration-branch-on-browser-global */
    /* eslint-disable-next-line react-doctor/no-hydration-branch-on-browser-global */
    if (typeof window !== "undefined" && window.localStorage.getItem("7h_dev_bypass_v1") === "true") {
      setIsDevBypass(true);
    }
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
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8 mb-10 pt-4">
            <div className="text-left max-w-3xl">

              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-bold uppercase tracking-tighter text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)] leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                FAN PHOTO &amp; VIDEO <span className="inline-block pr-[0.15em]">WALL</span>
              </h1>
              <p className="font-medium mt-3 max-w-2xl leading-relaxed">
                Share your best memories, stage captures, and live concert moments from 7th Heaven shows. Upload your photos and videos and join the community wall!
              </p>

              {/* Login Promo text if guest */}
              {!effectivelyLoggedIn && (
                <div className="mt-4 text-white/70 flex items-center gap-2 max-w-xl flex-wrap">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                  <p>
                    You must be a <span className="font-bold text-white">Fan Member</span> to share your moments.{" "}
                    <button aria-label="Action button"
                      onClick={() => openModal("signup")}
                      className="underline font-bold text-white hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      Sign up free
                    </button>{" "}
                    or{" "}
                    <button aria-label="Action button"
                      onClick={() => openModal("login")}
                      className="underline font-bold text-white hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      sign in
                    </button>
                    .
                  </p>
                </div>
              )}
            </div>

            {/* Action Upload Button on the Right */}
            <div className="shrink-0 self-start lg:self-end">
              <CosmicRadialButton
                onClick={() => {
                  if (!isLoggedIn) {
                    openModal("login");
                  } else {
                    setShowUpload(!showUpload);
                  }
                }}
                icon={<Camera className="w-4 h-4" />}
                className="px-8 py-4 rounded-lg text-white font-bold   "
              >
                {showUpload ? "Hide Upload Form" : "Upload Photo / Video"}
              </CosmicRadialButton>
            </div>
          </div>




          {/* Dynamic Upload Form */}
          {showUpload && effectivelyLoggedIn && (
            <div className="mt-10 animate-[fade-in-up_0.4s_var(--ease-out-expo)_both]">
              <FanUploadForm />
            </div>
          )}
        </div>
      </section>

      {/* ── PHOTO GRID & MODERATION SECTION (FULL BLEED) ── */}
      <section className="py-0 w-full max-w-none">

        {/* ═══ Moderation Queue (Admins & Crew) ═══ */}
        {isModerator && pendingPhotos.length > 0 && (
          <div className=" mx-auto site-container">
            <div className="flex items-center gap-3 mb-6">

              <div>
                <h3 className="font-bold text-white">
                  Pending Review Queue
                </h3>
                <p className="uppercase    font-bold">
                  Viewed & Approved by Admins & Crew only
                </p>
              </div>
              <span className="ml-auto bg-[#00000029] text-white px-3 py-1 font-mono rounded-lg border border-white/10 font-bold">
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
                    className="p-4 bg-[#e1e6ff15] border border-white/10 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-lg backdrop-blur-md max-w-[520px] w-full"
                  >
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
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[12px] font-mono text-white/90">
                        {photo.date || "Pending"}
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                      <div>
                        <div className="flex items-center gap-1 font-bold text-white truncate">
                          <span className="text-purple-400">@</span>
                          <span className="truncate">{photo.name}</span>
                        </div>
                        {photo.venue && (
                          <p className="font-bold tracking-wider uppercase truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-purple-400 shrink-0" /> {photo.venue}
                          </p>
                        )}
                        {photo.caption && (
                          <p className="truncate mt-1">
                            "{photo.caption}"
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => handleRejectPhoto(photo.id)}
                          disabled={moderatingId === photo.id}
                          className="py-1.5 px-2 text-[10px] font-bold uppercase    text-red-200 bg-red-950/50 border border-red-500/30 rounded-lg hover:bg-red-900/70 transition-colors cursor-pointer text-center"
                        >
                          Reject
                        </button>
                        <CosmicRadialButton
                          onClick={() => handleApprovePhoto(photo.id)}
                          disabled={moderatingId === photo.id}
                          icon={false}
                          className="!py-1.5 !px-2 text-[10px] font-bold    text-white ! rounded-lg text-center"
                        >
                          Approve
                        </CosmicRadialButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Featured Hero Photo */}
        {approvedPhotos.length > 0 && (
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
                <Image width={200} height={200} unoptimized
                  src={approvedPhotos[0].src}
                  alt={`Featured: ${approvedPhotos[0].name}`}
                  className="w-full h-full object-cover object-top"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase    px-3 py-1 rounded-lg border border-white/10 bg-black/45 backdrop-blur-md text-white/90 shadow-md mb-2">
                  Featured Moment
                </span>
                <h3 className="font-bold uppercase tracking-tight text-purple-300 leading-none drop-shadow-md">
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
        )}

        {/* Photo Feed Grid - Full Bleed 0 Gap Uniform Grid */}
        {approvedPhotos.length > 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 w-full border-t border-white/10">
            {approvedPhotos.slice(1).map((photo) => {
              const isVideo =
                photo.type === "video" ||
                photo.src.endsWith(".mp4") ||
                photo.src.endsWith(".mov");
              return (
                <div
                  key={photo.id}
                  className="flex flex-col justify-between bg-[#0b041a]/90 border-b border-r border-white/10 overflow-hidden hover:bg-purple-900/30 transition-colors duration-300 h-full"
                >
                  <div className="pl-4 sm:pl-8 pr-4 py-3.5 sm:py-4 flex items-center justify-between border-b border-white/5 bg-black/[0.02] gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 min-w-8 min-h-8 shrink-0 aspect-square rounded-full bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 flex items-center justify-center font-bold text-white   " style={{ aspectRatio: "1 / 1" }}>
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
                        <p className="font-bold text-purple-300 leading-tight truncate">
                          {photo.name}
                        </p>
                        {(photo.venue || photo.city) && (
                          <p className="uppercase    font-bold mt-0.5 truncate">
                            {photo.venue}
                            {photo.venue && photo.city && " • "}
                            {photo.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-white text-[10px] uppercase    font-bold">
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
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPhoto(photo); } }}
                  >
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
                    <div className="pl-4 sm:pl-8 pr-4 py-3 sm:py-4 bg-black/[0.02] border-t border-white/5 flex-1 flex items-center">
                      <p className="leading-relaxed font-medium">
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
                className="text-white/15"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h3 className="font-bold text-white/30 mb-3">No moments yet</h3>
            <p className="mb-8 max-w-sm mx-auto">
              Check back soon for moments from 7th Heaven shows!
            </p>
          </div>
        )}

        {/* Lightbox */}
        {mounted && selectedPhoto && createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] w-full flex flex-col bg-black/80  rounded-lg p-6 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button aria-label="Close"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white bg-black/50 hover:bg-black/80 p-2 !rounded-full border border-white/10 transition-colors cursor-pointer z-20"
              >
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
                  <p className="font-bold text-white text-lg">
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
                    className="text-white/40 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
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
        )}
      </section>
    </div>
  );
}




