"use client";
import Image from 'next/image';

import { useState } from "react";
import dynamic from "next/dynamic";
import CosmicRadialButton from "./CosmicRadialButton";

const InlineYTPlayer = dynamic(() => import("./InlineYTPlayer"), { ssr: false });

const FALLBACK_BTS = [
  {
    id: "BzHUNTZ66zY",
    title: "Making of 'Ain't That Just Beautiful'",
    subtitle: "Behind the scenes of our latest music video shoot in Chicago",
    director: "Michael Scimeca",
    year: 2025,
  },
  {
    id: "QIYHp2QpjkQ",
    title: "Rehearsal Session",
    subtitle: "A raw look at how 7th Heaven prepares for the stage",
    director: "7th Heaven",
    year: 2019,
  },
];

interface BTSVideo {
  youtubeId: string;
  title: string;
  subtitle: string;
  director: string;
  year: number;
}

interface BehindTheScenesProps {
  btsVideos?: BTSVideo[];
}

export default function BehindTheScenes({ btsVideos: sanityBts }: BehindTheScenesProps) {
  const btsVideos = sanityBts?.length
    ? sanityBts.map(v => ({ id: v.youtubeId, title: v.title, subtitle: v.subtitle, director: v.director, year: v.year }))
    : FALLBACK_BTS;
  const [playingId, setPlayingId] = useState<string | null>(null);
  const featured = btsVideos[0];

  return (
    <section className="relative overflow-hidden" id="behind-the-scenes">
      {/* Featured BTS Hero */}
      <div className="relative w-full min-h-[70vh] flex items-end">
        {/* Background thumbnail */}
        {playingId === featured.id ? (
          <div className="absolute inset-0 z-[2]">
            <InlineYTPlayer
              videoId={featured.id}
              title={featured.title}
              onClose={() => setPlayingId(null)}
            />
          </div>
        ) : (
          <>
            <Image width={200} height={200} unoptimized
              src={`https://img.youtube.com/vi/${featured.id}/maxresdefault.jpg`}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-[1]" />
          </>
        )}

        {/* Content overlay */}
        {playingId !== featured.id && (
          <div className="relative z-[3] w-full px-8 md:px-16 pb-16 pt-32">
            <div className="max-w-[700px]">
              {/* Label */}
              <span className="inline-block font-bold tracking-[0.2em] uppercase text-white/50 mb-4">
                Official YouTube
              </span>

              {/* Heading */}
              <h2 className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight mb-6">
                Explore Behind the{" "}
                <span className="gradient-text">Scenes</span>
              </h2>

              {/* Subtitle */}
              <p className="max-w-[500px] mb-10 leading-relaxed">
                {featured.subtitle}
              </p>

              {/* Play CTA */}
              <button aria-label="Action button"
                onClick={() => setPlayingId(featured.id)}
                className="group inline-flex items-center gap-3 bg-white text-black font-bold uppercase tracking-[0.15em] px-8 py-4 hover:bg-[var(--color-accent)] hover:text-white transition-colors duration-300 cursor-pointer"
              >
                <svg width="14" height="16" viewBox="0 0 20 22" fill="none" className="transition-colors">
                  <path d="M19 11L1 21V1L19 11Z" fill="currentColor" strokeLinejoin="round" />
                </svg>
                Watch Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </button>

              {/* Director credit */}
              <div className="mt-10 border-t border-white/10 pt-6">
                <p className="font-bold tracking-[0.15em] uppercase mb-1">
                  Directed by
                </p>
                <p className="font-bold tracking-tight">
                  {featured.director}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BTS Grid — additional clips */}
      {btsVideos.length > 1 && (
        <div className="px-8 md:px-16 py-16">
          <p className="font-bold uppercase tracking-[0.15em] mb-6">
            More Behind the Scenes
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {btsVideos.slice(1).map((video) => (
              <div key={video.id} className="group">
                <div className="relative aspect-video overflow-hidden bg-[var(--color-bg-card)] border border-white/10">
                  {playingId === `bts-${video.id}` ? (
                    <InlineYTPlayer
                      videoId={video.id}
                      title={video.title}
                      onClose={() => setPlayingId(null)}
                    />
                  ) : (
                    <button className="absolute inset-0 w-full h-full cursor-pointer"
                      onClick={() => setPlayingId(`bts-${video.id}`)}
                      aria-label={`Play ${video.title}`}
                    >
                      <Image width={200} height={200} unoptimized
                        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                        alt={video.title}
                        className="absolute inset-0 z-[1] w-full h-full object-cover grayscale group-hover:grayscale-0 transition-colors duration-500"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/images/video-placeholder.jpg'; }}
                      />
                      <div className="absolute inset-0 z-[2] bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
                      <div className="absolute top-4 right-4 z-[3]">
                        <CosmicRadialButton
                          icon={false}
                          className="w-10 h-10 ! rounded-lg !p-0 flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-purple-300/40"
                        >
                          <svg width="12" height="14" viewBox="0 0 20 22" fill="none">
                            <path d="M19 11L1 21V1L19 11Z" fill="white" strokeLinejoin="round" />
                          </svg>
                        </CosmicRadialButton>
                      </div>
                    </button>
                  )}
                </div>
                <div className="mt-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold uppercase tracking-[0.05em] text-white leading-tight line-clamp-1">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0 text-white/40 tabular-nums">
                      <span>{video.year}</span>
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-1">{video.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
