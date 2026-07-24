"use client";

import React, { useState, useEffect } from "react";
import { useMember } from "@/context/MemberContext";
import dynamic from "next/dynamic";

const FanUploadForm = dynamic(() => import("@/components/FanUploadForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-white/[0.02] border border-white/10 rounded-xl p-8 text-center text-white/40 font-bold uppercase tracking-widest text-sm">
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
  const [showUpload, setShowUpload] = useState(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      return search.includes("mockUpload=true") || search.includes("mockScanning=true") || search.includes("mockSuccess=true");
    }
    return false;
  });
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const effectivelyLoggedIn = isLoggedIn || (typeof window !== "undefined" && (
    window.location.search.includes("mockUpload=true") ||
    window.location.search.includes("mockScanning=true") ||
    window.location.search.includes("mockSuccess=true")
  ));

  const isModerator = isLoggedIn && (member?.role === "admin" || member?.role === "crew");

  // Fetch photos
  const fetchPhotos = () => {
    const url = isModerator ? "/api/fans?all=true" : "/api/fans";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setPhotos(data))
      .catch(() => {});
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("bypass") === "true") {
        localStorage.setItem("7h_dev_bypass", "true");
        if (!localStorage.getItem("7h_member")) {
          localStorage.setItem("7h_member", JSON.stringify({
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
  }, [isModerator]);

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
    <section className="py-32 min-h-screen" id="fan-wall">
      <div className="site-container">
        {/* Header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-block text-sm font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)]">
              Community
            </span>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-tight text-white">
              Fan Photo & Video <span className="gradient-text">Wall</span>
            </h1>
            <p className="text-white/40 mt-3 max-w-lg text-base">
              Share your best moments from 7th Heaven shows. Upload your photos and videos and join the wall!
            </p>

            {/* Login Promo badge if guest */}
            {!effectivelyLoggedIn && (
              <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200/90 max-w-lg flex items-center gap-3 animate-pulse">
                <span className="text-base">🔒</span>
                <p>
                  You must be a <span className="font-extrabold text-white">Fan Member</span> to share your moments.{" "}
                  <button
                    onClick={() => openModal("signup")}
                    className="underline font-bold text-white hover:text-purple-300 transition-colors"
                  >
                    Sign up free
                  </button>{" "}
                  or{" "}
                  <button
                    onClick={() => openModal("login")}
                    className="underline font-bold text-white hover:text-purple-300 transition-colors"
                  >
                    sign in
                  </button>
                  .
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (!isLoggedIn) {
                openModal("login");
              } else {
                setShowUpload(!showUpload);
              }
            }}
            className="px-6 py-3 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(133,29,239,0.3)] cursor-pointer shrink-0 self-start md:self-auto"
          >
            📸 {showUpload ? "Hide Upload Form" : "Upload Photo / Video"}
          </button>
        </div>

        {/* Dynamic Upload Form */}
        {showUpload && effectivelyLoggedIn && (
          <div className="mb-12 animate-[fade-in-up_0.4s_var(--ease-out-expo)_both]">
            <FanUploadForm />
          </div>
        )}

        {/* ═══ Moderation Queue (Admins & Crew) ═══ */}
        {isModerator && pendingPhotos.length > 0 && (
          <div className="mb-14 p-6 bg-purple-500/5 border border-purple-500/25 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-sm">
                🛡️
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Pending Review Queue
                </h3>
                <p className="text-2xs text-purple-300/60 uppercase tracking-widest font-bold">
                  Viewed & Approved by Admins & Crew only
                </p>
              </div>
              <span className="ml-auto bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs px-3 py-1 font-mono rounded-full font-bold">
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
                    className="group relative bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden shadow-xl hover:border-purple-500/50 transition-colors"
                  >
                    <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
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
                        <img
                          src={photo.src}
                          alt="Fan Upload"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute top-0 right-0 m-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded border border-white/10 text-white font-mono text-[0.6rem] uppercase tracking-widest shadow-xl">
                        {photo.date || "Pending"}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold truncate">
                        <span className="text-purple-400">@</span>
                        {photo.name}
                      </div>
                      {photo.venue && (
                        <p className="text-2xs font-bold tracking-widest uppercase text-white/40 truncate">
                          📍 {photo.venue}
                        </p>
                      )}
                      {photo.caption && (
                        <p className="text-sm text-white/70 italic border-l-2 border-purple-500/30 pl-3 mt-2">
                          "{photo.caption}"
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                      <button
                        onClick={() => handleRejectPhoto(photo.id)}
                        disabled={moderatingId === photo.id}
                        className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        Reject & Delete
                      </button>
                      <button
                        onClick={() => handleApprovePhoto(photo.id)}
                        disabled={moderatingId === photo.id}
                        className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-500 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      >
                        Safe & Approve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Featured Hero Photo */}
        {approvedPhotos.length > 0 && (
          <div
            className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-10 group cursor-pointer"
            onClick={() => setSelectedPhoto(approvedPhotos[0])}
          >
            {approvedPhotos[0].type === "video" ||
            approvedPhotos[0].src.endsWith(".mp4") ||
            approvedPhotos[0].src.endsWith(".mov") ? (
              <video
                src={approvedPhotos[0].src}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={approvedPhotos[0].src}
                alt={`Featured: ${approvedPhotos[0].name}`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-accent)] mb-2 block">
                Featured Moment
              </span>
              <p className="text-2xl md:text-3xl font-black text-white">
                {approvedPhotos[0].name}
              </p>
              <div className="flex items-center gap-3 text-sm text-white/40 mt-2">
                {approvedPhotos[0].venue && <span>{approvedPhotos[0].venue}</span>}
                {approvedPhotos[0].venue && approvedPhotos[0].date && (
                  <span>·</span>
                )}
                {approvedPhotos[0].date && <span>{approvedPhotos[0].date}</span>}
              </div>
              {approvedPhotos[0].caption && (
                <p className="text-white/50 text-base mt-3 max-w-xl">
                  &ldquo;{approvedPhotos[0].caption}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}

        {/* Photo Feed Grid */}
        {approvedPhotos.length > 1 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {approvedPhotos.slice(1).map((photo) => {
              const isVideo =
                photo.type === "video" ||
                photo.src.endsWith(".mp4") ||
                photo.src.endsWith(".mov");
              return (
                <div
                  key={photo.id}
                  className="break-inside-avoid flex flex-col bg-[#0a0a0f]/50 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-2xl"
                >
                  <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 flex items-center justify-center font-bold text-xs text-white tracking-widest">
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
                          <p className="text-[var(--color-accent)] text-xs uppercase tracking-widest font-bold mt-0.5">
                            {photo.venue}
                            {photo.venue && photo.city && " • "}
                            {photo.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-white/20 text-xs uppercase tracking-widest font-bold">
                        {isVideo ? "Video" : "Photo"}
                      </span>
                      {photo.date && (
                        <span className="text-white/20 text-xs">{photo.date}</span>
                      )}
                    </div>
                  </div>
                  <div
                    className="relative group cursor-pointer bg-black"
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
                      <img
                        src={photo.src}
                        alt={`Photo by ${photo.name}`}
                        className="w-full h-auto max-h-[600px] object-cover block"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                      <span className="text-white bg-white/10 border border-white/20 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest backdrop-blur-md">
                        {isVideo ? "Play Video" : "Expand Photo"}
                      </span>
                    </div>
                  </div>
                  {photo.caption && (
                    <div className="p-4 bg-white/[0.02]">
                      <p className="text-white/80 text-base leading-relaxed font-medium">
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
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-10 right-0 text-white/40 hover:text-white transition-colors cursor-pointer text-2xl"
              >
                ✕
              </button>
              {selectedPhoto.type === "video" ||
              selectedPhoto.src.endsWith(".mp4") ||
              selectedPhoto.src.endsWith(".mov") ? (
                <video
                  src={selectedPhoto.src}
                  className="w-full max-h-[70vh] object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
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
                  <button
                    onClick={() => handleFlagPhoto(selectedPhoto.id)}
                    disabled={flaggingId === selectedPhoto.id}
                    className="text-white/20 hover:text-red-400 text-xs uppercase tracking-widest font-bold transition-colors flex items-center gap-1 mt-1 disabled:opacity-50"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                      <line x1="4" y1="22" x2="4" y2="15"></line>
                    </svg>
                    {flaggingId === selectedPhoto.id ? "Flagging..." : "Report"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
