"use client";

import { useState, useEffect } from "react";
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
};

export default function FansPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const [photos, setPhotos] = useState<FanPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<FanPhoto | null>(null);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetch("/api/fans")
      .then(r => r.json())
      .then(data => setPhotos(data))
      .catch(() => {});
  }, []);

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

  return (
    <section className="py-32 bg-[var(--color-bg-primary)] min-h-screen" id="fan-wall">
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
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-6 py-3 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(133,29,239,0.3)] cursor-pointer shrink-0 self-start md:self-auto"
          >
            📸 {showUpload ? "Hide Upload Form" : "Upload Photo / Video"}
          </button>
        </div>

        {/* Dynamic Upload Form */}
        {showUpload && (
          <div className="mb-12 animate-[fade-in-up_0.4s_var(--ease-out-expo)_both]">
            <FanUploadForm />
          </div>
        )}

        {/* Featured Hero Photo */}
        {photos.length > 0 && (
          <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-10 group cursor-pointer" onClick={() => setSelectedPhoto(photos[0])}>
            {photos[0].type === "video" || photos[0].src.endsWith(".mp4") || photos[0].src.endsWith(".mov") ? (
              <video src={photos[0].src} className="w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={photos[0].src} alt={`Featured: ${photos[0].name}`} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-accent)] mb-2 block">Featured Moment</span>
              <p className="text-2xl md:text-3xl font-black text-white">{photos[0].name}</p>
              <div className="flex items-center gap-3 text-sm text-white/40 mt-2">
                {photos[0].venue && <span>{photos[0].venue}</span>}
                {photos[0].venue && photos[0].date && <span>·</span>}
                {photos[0].date && <span>{photos[0].date}</span>}
              </div>
              {photos[0].caption && <p className="text-white/50 text-base mt-3 max-w-xl">&ldquo;{photos[0].caption}&rdquo;</p>}
            </div>
          </div>
        )}

        {/* Photo Feed Grid */}
        {photos.length > 1 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {photos.slice(1).map(photo => {
                const isVideo = photo.type === "video" || photo.src.endsWith(".mp4") || photo.src.endsWith(".mov");
                return (
                  <div key={photo.id} className="break-inside-avoid flex flex-col bg-[#0a0a0f]/50 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-2xl">
                    <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 flex items-center justify-center font-bold text-xs text-white tracking-widest">
                          {photo.name ? photo.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'FP'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold leading-tight">{photo.name}</p>
                          {(photo.venue || photo.city) && <p className="text-[var(--color-accent)] text-xs uppercase tracking-widest font-bold mt-0.5">{photo.venue}{photo.venue && photo.city && " • "}{photo.city}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-white/20 text-xs uppercase tracking-widest font-bold">{isVideo ? "Video" : "Photo"}</span>
                        {photo.date && <span className="text-white/20 text-xs">{photo.date}</span>}
                      </div>
                    </div>
                    <div className="relative group cursor-pointer bg-black" onClick={() => setSelectedPhoto(photo)}>
                      {isVideo ? (
                        <video src={photo.src} className="w-full h-auto max-h-[600px] object-cover block" autoPlay loop muted playsInline />
                      ) : (
                        <img src={photo.src} alt={`Photo by ${photo.name}`} className="w-full h-auto max-h-[600px] object-cover block" loading="lazy" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                        <span className="text-white bg-white/10 border border-white/20 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest backdrop-blur-md">
                          {isVideo ? "Play Video" : "Expand Photo"}
                        </span>
                      </div>
                    </div>
                    {photo.caption && <div className="p-4 bg-white/[0.02]"><p className="text-white/80 text-base leading-relaxed font-medium">&ldquo;{photo.caption}&rdquo;</p></div>}
                  </div>
                );
              })}
            </div>
        ) : (
          /* Empty state */
          <div className="text-center py-32">
            <div className="w-20 h-20 mx-auto mb-8 border border-white/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
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
            <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-10 right-0 text-white/40 hover:text-white transition-colors cursor-pointer text-2xl"
              >
                ✕
              </button>
              {selectedPhoto.type === "video" || selectedPhoto.src.endsWith(".mp4") || selectedPhoto.src.endsWith(".mov") ? (
                <video src={selectedPhoto.src} className="w-full max-h-[70vh] object-contain" controls autoPlay playsInline />
              ) : (
                <img src={selectedPhoto.src} alt={`Photo by ${selectedPhoto.name}`} className="w-full max-h-[70vh] object-contain" />
              )}
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-base">{selectedPhoto.name}</p>
                  {selectedPhoto.venue && (
                    <p className="text-white/40 text-sm mt-0.5">{selectedPhoto.venue}{selectedPhoto.city ? ` — ${selectedPhoto.city}` : ""}{selectedPhoto.date ? ` · ${selectedPhoto.date}` : ""}</p>
                  )}
                  {selectedPhoto.caption && (
                    <p className="text-white/30 text-sm mt-2 italic">&ldquo;{selectedPhoto.caption}&rdquo;</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">

                  <button 
                    onClick={() => handleFlagPhoto(selectedPhoto.id)}
                    disabled={flaggingId === selectedPhoto.id}
                    className="text-white/20 hover:text-red-400 text-xs uppercase tracking-widest font-bold transition-colors flex items-center gap-1 mt-1 disabled:opacity-50"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                    {flaggingId === selectedPhoto.id ? 'Flagging...' : 'Report'}
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
