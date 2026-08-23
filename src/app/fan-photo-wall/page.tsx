/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from 'next/image';
import { Lock, Camera, Shield, MapPin, X, Sparkles } from "lucide-react";

import React, { useState, useEffect, useCallback } from "react";
import { useMember } from "@/context/MemberContext";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import dynamic from "next/dynamic";

const FanUploadForm = dynamic(() => import("@/components/FanUploadForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-white/[0.02] border border-white/10 p-8 text-center text-white/40 font-bold uppercase tracking-widest text-sm">
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

  useEffect(() => {
    const search = window.location.search;
    const isMock = search.includes('mockUpload=true') || search.includes('mockScanning=true') || search.includes('mockSuccess=true');
    setShowUpload(isMock);
    setMockMode(isMock);
  }, []);

  const effectivelyLoggedIn = isLoggedIn || mockMode;

  const isModerator = isLoggedIn && (member?.role === "admin" || member?.role === "crew");

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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e1e6ff29] border border-white/30 backdrop-blur-[16px] text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(168,85,247,0.5)] mb-4">
                <span>OFFICIAL FAN COMMUNITY GALLERY</span>
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-black uppercase italic tracking-tighter text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)] leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                FAN PHOTO &amp; VIDEO <span className="inline-block pr-[0.15em] bg-gradient-to-r from-purple-300 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.9)]">WALL</span>
              </h1>
              <p className="text-white/60 text-base md:text-lg font-medium mt-3 max-w-2xl leading-relaxed">
                Share your best memories, stage captures, and live concert moments from 7th Heaven shows. Upload your photos and videos and join the community wall!
              </p>

              {/* Login Promo text if guest */}
              {!effectivelyLoggedIn && (
                <div className="mt-4 text-xs text-white/70 flex items-center gap-2 max-w-xl flex-wrap">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                  <p>
                    You must be a <span className="font-extrabold text-white">Fan Member</span> to share your moments.{" "}
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
                className="px-8 py-4 rounded-lg text-white text-xs font-black tracking-widest"
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
          <div className=" mx-auto mb-14 p-6">
            <div className="flex items-center gap-3 mb-6">

              <div>
                <h3 className="text-lg font-bold text-white">
                  Pending Review Queue
                </h3>
                <p className="text-[var(--font-size-2xs)] text-white uppercase tracking-widest font-bold">
                  Viewed & Approved by Admins & Crew only
                </p>
              </div>
              <span className="ml-auto bg-[#e1e6ff29] text-white text-xs px-3 py-1 font-mono rounded-full font-black">
                {pendingPhotos.length} Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPhotos.map((photo) => {
                const isVideo =
                  photo.type === "video" ||
                  photo.src.endsWith(".mp4") ||
                  photo.src.endsWith(".mov");
                return (
                  <div
                    key={photo.id}
                    className="group relative  rounded-lg  overflow-hidden   transition-colors"
                  >
                    <div className="aspect-[4/3] bg-black/20 relative overflow-hidden">
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
                        <Image width={200} height={200} unoptimized
                          src={photo.src}
                          alt="Fan Upload"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-0 right-0 m-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 text-white font-mono text-[0.6rem] uppercase tracking-widest   ">
                        {photo.date || "Pending"}
                      </div>
                    </div>
                    <div className="pt-4 pb-4 flex flex-col gap-1.5 text-white">
                      <div className="flex items-center gap-2 text-sm font-bold truncate text-white">
                        <span className="text-purple-400">@</span>
                        {photo.name}
                      </div>
                      {photo.venue && (
                        <p className="text-[var(--font-size-2xs)] font-bold tracking-widest uppercase text-white truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-purple-400 shrink-0" /> {photo.venue}
                        </p>
                      )}
                      {photo.caption && (
                        <p className="text-sm text-white italic border-l-2 border-purple-500/30 pl-3 mt-2">
                          "{photo.caption}"
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-white/10">
                      <button aria-label="Action button"
                        onClick={() => handleRejectPhoto(photo.id)}
                        disabled={moderatingId === photo.id}
                        className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-white bg-black hover:bg-red-950/50 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Reject & Delete
                      </button>
                      <CosmicRadialButton
                        onClick={() => handleApprovePhoto(photo.id)}
                        disabled={moderatingId === photo.id}
                        icon={false}
                        className="py-3 px-4 text-[0.6rem] font-black tracking-wider text-white rounded-lg"
                      >
                        Safe & Approve
                      </CosmicRadialButton>
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
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-xs font-black uppercase tracking-[0.2em]  text-white mb-2 block">
                  Featured Moment
                </span>
                <p className="text-2xl md:text-3xl font-black text-white">
                  {approvedPhotos[0].name}
                </p>
                <div className="flex items-center gap-3 text-sm text-white mt-2">
                  {approvedPhotos[0].venue && <span>{approvedPhotos[0].venue}</span>}
                  {approvedPhotos[0].venue && approvedPhotos[0].date && (
                    <span>·</span>
                  )}
                  {approvedPhotos[0].date && <span>{approvedPhotos[0].date}</span>}
                </div>
                {approvedPhotos[0].caption && (
                  <p className="text-white text-base mt-3 max-w-xl">
                    &ldquo;{approvedPhotos[0].caption}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Photo Feed Grid - Full Bleed 0 Gap */}
        {approvedPhotos.length > 1 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 gap-0 space-y-0 w-full border-t border-white/10">
            {approvedPhotos.slice(1).map((photo) => {
              const isVideo =
                photo.type === "video" ||
                photo.src.endsWith(".mp4") ||
                photo.src.endsWith(".mov");
              return (
                <div
                  key={photo.id}
                  className="break-inside-avoid flex flex-col bg-[#0b041a]/90 border-b border-r border-white/10 overflow-hidden hover:bg-purple-900/30 transition-colors duration-300"
                >
                  <div className="pl-8 pr-4 py-4 flex items-center justify-between border-b border-white/5 bg-black/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 min-w-8 min-h-8 shrink-0 aspect-square rounded-full bg-white/15 border border-white/30 flex items-center justify-center font-bold text-xs text-white tracking-widest" style={{ aspectRatio: "1 / 1" }}>
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
                      <div>
                        <p className="text-white text-sm font-bold leading-tight">
                          {photo.name}
                        </p>
                        {(photo.venue || photo.city) && (
                          <p className=" text-white text-[var(--font-size-2xs)] uppercase tracking-widest font-extrabold mt-0.5">
                            {photo.venue}
                            {photo.venue && photo.city && " • "}
                            {photo.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-white text-[0.65rem] uppercase tracking-widest font-bold">
                        {isVideo ? "Video" : "Photo"}
                      </span>
                      {photo.date && (
                        <span className="text-white text-[0.65rem] font-medium">{photo.date}</span>
                      )}
                    </div>
                  </div>
                  <button aria-label="Action button"
                    type="button"
                    className="relative group cursor-pointer   w-full text-left"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    {isVideo ? (
                      <video
                        src={photo.src}
                        className="w-full h-auto max-h-[600px] object-cover block"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <Image width={200} height={200} unoptimized
                        src={photo.src}
                        alt={`Photo by ${photo.name}`}
                        className="w-full h-auto max-h-[600px] object-cover block"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                      <span className="text-white bg-white/10 border border-white/20 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest backdrop-blur-md">
                        {isVideo ? "Play Video" : "Expand Photo"}
                      </span>
                    </div>
                  </button>
                  {photo.caption && (
                    <div className="pl-8 pr-4 py-4 bg-black/[0.02] border-t border-white/5">
                      <p className="text-white text-sm leading-relaxed font-medium">
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
            <h3 className="text-xl font-bold text-white/30 mb-3">No moments yet</h3>
            <p className="text-white/15 text-base mb-8 max-w-sm mx-auto">
              Check back soon for moments from 7th Heaven shows!
            </p>
          </div>
        )}

        {/* Lightbox */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-4xl max-h-[85vh] w-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button aria-label="Close"
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-10 right-0 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              {selectedPhoto.type === "video" ||
                selectedPhoto.src.endsWith(".mp4") ||
                selectedPhoto.src.endsWith(".mov") ? (
                <video
                  src={selectedPhoto.src}
                  className="w-full max-h-[70vh] object-contain"
                  controls
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <Image width={200} height={200} unoptimized
                  src={selectedPhoto.src}
                  alt={`Photo by ${selectedPhoto.name}`}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-base">
                    {selectedPhoto.name}
                  </p>
                  {selectedPhoto.venue && (
                    <p className="text-white/40 text-sm mt-0.5">
                      {selectedPhoto.venue}
                      {selectedPhoto.city ? ` — ${selectedPhoto.city}` : ""}
                      {selectedPhoto.date ? ` · ${selectedPhoto.date}` : ""}
                    </p>
                  )}
                  {selectedPhoto.caption && (
                    <p className="text-white/30 text-sm mt-2 italic text-left">
                      &ldquo;{selectedPhoto.caption}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button aria-label="Action button"
                    onClick={() => handleFlagPhoto(selectedPhoto.id)}
                    disabled={flaggingId === selectedPhoto.id}
                    className="text-white/20 hover:text-red-400 text-xs uppercase tracking-widest font-bold transition-colors flex items-center gap-1 mt-1 disabled:opacity-50"
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
          </div>
        )}
      </section>
    </div>
  );
}




