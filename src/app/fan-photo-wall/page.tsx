"use client";

import { useState, useEffect } from "react";
import { useMember } from "@/context/MemberContext";

type FanPhoto = {
  id: string;
  src: string;
  name: string;
  venue: string;
  city: string;
  date: string;
  caption: string;
  instagram: string;
};

export default function FansPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const [photos, setPhotos] = useState<FanPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<FanPhoto | null>(null);

  useEffect(() => {
    fetch("/api/fans")
      .then(r => r.json())
      .then(data => setPhotos(data))
      .catch(() => {});
  }, []);


  return (
    <section className="py-32 bg-[var(--color-bg-primary)] min-h-screen" id="fan-wall">
      <div className="site-container">



        {/* Header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)]">
              Community
            </span>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-tight text-white">
              Fan Photo <span className="gradient-text">Wall</span>
            </h1>
            <p className="text-white/40 mt-3 max-w-lg text-[0.9rem]">
              Share your best moments from 7th Heaven shows. Upload your photos and join the wall!
            </p>
          </div>
        </div>



        {/* Photo Feed Grid */}
        {photos.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="break-inside-avoid flex flex-col bg-[#0a0a0f]/50 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-2xl"
              >
                {/* Feed Header (Persisted Identity & Location) */}
                <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 flex items-center justify-center font-bold text-[0.65rem] text-white tracking-widest">
                      {photo.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-[0.8rem] font-bold leading-tight">{photo.name}</p>
                      {(photo.venue || photo.city) && (
                        <p className="text-[var(--color-accent)] text-[0.65rem] uppercase tracking-widest font-bold mt-0.5">
                          {photo.venue}{photo.venue && photo.city && " • "}{photo.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-white/20 text-[0.6rem] uppercase tracking-widest font-bold">Fan Wall</span>
                </div>
                
                {/* Photo Payload */}
                <div className="relative group cursor-pointer bg-black" onClick={() => setSelectedPhoto(photo)}>
                  <img src={photo.src} alt={`Photo by ${photo.name}`} className="w-full h-auto max-h-[600px] object-cover block group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                    <span className="text-white bg-white/10 border border-white/20 px-6 py-2 rounded-full font-bold text-[0.7rem] uppercase tracking-widest backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">Expand Photo</span>
                  </div>
                </div>

                {/* Feed Footer (Captions & Tags) */}
                {(photo.caption || photo.instagram) && (
                  <div className="p-4 bg-white/[0.02]">
                    {photo.caption && <p className="text-white/80 text-[0.85rem] leading-relaxed mb-3 font-medium">&ldquo;{photo.caption}&rdquo;</p>}
                    {photo.instagram && (
                      <a href={`https://instagram.com/${photo.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white/70 hover:text-white text-[0.65rem] uppercase tracking-widest font-bold transition-all">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        {photo.instagram}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-32">
            <div className="w-20 h-20 mx-auto mb-8 border border-white/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white/30 mb-3">No photos yet</h3>
            <p className="text-white/15 text-[0.85rem] mb-8 max-w-sm mx-auto">
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
              <img src={selectedPhoto.src} alt={`Photo by ${selectedPhoto.name}`} className="w-full max-h-[70vh] object-contain" />
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-[0.9rem]">{selectedPhoto.name}</p>
                  {selectedPhoto.venue && (
                    <p className="text-white/40 text-[0.75rem] mt-0.5">{selectedPhoto.venue}{selectedPhoto.city ? ` — ${selectedPhoto.city}` : ""}{selectedPhoto.date ? ` · ${selectedPhoto.date}` : ""}</p>
                  )}
                  {selectedPhoto.caption && (
                    <p className="text-white/30 text-[0.8rem] mt-2 italic">&ldquo;{selectedPhoto.caption}&rdquo;</p>
                  )}
                </div>
                {selectedPhoto.instagram && (
                  <a href={`https://instagram.com/${selectedPhoto.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] text-[0.75rem] font-bold hover:text-white transition-colors shrink-0">
                    {selectedPhoto.instagram}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}



      </div>
    </section>
  );
}
