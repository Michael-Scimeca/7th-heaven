"use client";
import Image from 'next/image';
import staticVideoCategories from "../../../public/data/videos.json";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Palette, Search, Play, Plus, X, Video as VideoIcon, CheckCircle2, Sparkles } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMember } from "@/context/MemberContext";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import { useHeroParallax } from "@/lib/useHeroParallax";
import HeroParallaxCustomizer from "@/components/HeroParallaxCustomizer";

const CustomVideoPlayer = dynamic(() => import("@/components/CustomVideoPlayer"), { ssr: false });

interface Video {
  id: string;
  title: string;
  year: number;
  duration?: string;
  description?: string;
  viewCount?: string;
}

interface VideoCategory {
  category: string;
  videos: Video[];
}

const thumb = (id: string) => `https://img.youtube.com/vi/${id}/hq720.jpg`;
const thumbMax = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

function VideoThumbnail({ videoId, title, isActive, index = 0 }: { videoId: string; title: string; isActive?: boolean; index?: number }) {
  const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
  const [failed, setFailed] = useState(false);
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setShouldRenderIframe(false);
      return;
    }

    let isMounted = true;
    let timer: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isMounted) {
          // Stagger loading: item 0 loads first (100ms), item 1 loads second (500ms), item 2 loads third (900ms), etc.
          const delay = Math.min(index * 400 + 100, 2400);
          timer = setTimeout(() => {
            if (isMounted) setShouldRenderIframe(true);
          }, delay);
        }
      },
      { rootMargin: "250px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isActive, index]);

  const previewUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&start=10&end=16&playsinline=1&modestbranding=1&enablejsapi=1`;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gradient-to-br from-[#1a0f2e] via-[#0c0817] to-black flex items-center justify-center overflow-hidden">
      {/* 6-Second Video Preview Loop when active starting 10s into video */}
      {isActive && shouldRenderIframe && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <iframe
            key={videoId}
            src={previewUrl}
            title={`${title} Preview`}
            allow="autoplay; encrypted-media"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[177.77vh] min-h-[56.25vw] w-[160%] h-[160%] max-w-none pointer-events-none border-0 opacity-90 transition-opacity duration-700"
          />
        </div>
      )}

      {/* Static Fallback Thumbnail Image */}
      {!failed && (
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className={`object-cover transition-opacity duration-700 ${isActive ? "opacity-0" : "opacity-100"}`}
          unoptimized
          onError={() => {
            if (imgSrc.includes('maxresdefault')) {
              setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
            } else {
              setFailed(true);
            }
          }}
        />
      )}

      {failed && !isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#291645] via-[#120a24] to-[#05030a] flex flex-col items-center justify-center p-4 text-center z-10">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mb-2   ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
          <span className="text-white/90  font-bold  text-xs uppercase tracking-wider line-clamp-2 px-2">{title}</span>
          <span className="text-purple-300/60 text-[10px] uppercase tracking-widest font-mono mt-1">7th Heaven Vault</span>
        </div>
      )}
    </div>
  );
}

function extractYouTubeId(urlOrId: string): string {
  const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) return match[1];
  const clean = urlOrId.trim();
  if (clean.length === 11 && /^[\w-]+$/.test(clean)) return clean;
  return clean;
}

export default function MediaPage() {
  const { member } = useMember();
  const isAdmin = member?.role === 'admin' || member?.role === 'crew';

  const [categories, setCategories] = useState<VideoCategory[]>(staticVideoCategories as VideoCategory[]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>((staticVideoCategories as VideoCategory[])[0]?.category || "Official Music Videos");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Add Video Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Official Music Videos");
  const [newYear, setNewYear] = useState(() => new Date().getFullYear().toString());
  const [newDuration, setNewDuration] = useState("3:30");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Same shared parallax as the home page hero (src/lib/useHeroParallax.ts) —
  // tuning it via either page's customizer panel updates the default on both.
  // Disabled while the featured video is playing, since the background image
  // and foreground caption are both unmounted then (see the hero JSX below).
  const heroImgRef = useRef<HTMLImageElement>(null);
  const heroForegroundRef = useRef<HTMLDivElement>(null);
  const featuredVideo = categories.find(c => c.category === 'Official Music Videos')?.videos[0];
  const heroParallax = useHeroParallax({
    mediaRef: heroImgRef,
    foregroundRef: heroForegroundRef,
    triggerSelector: "#media-hero",
    enabled: !heroPlaying && Boolean(featuredVideo),
  });

  const fetchCategories = useCallback(async () => {
    try {
      // 1. Fetch base static video categories
      const r = await fetch("/data/videos.json");
      let baseCategories: VideoCategory[] = [];
      if (r.ok) {
        baseCategories = await r.json();
      }

      // 2. Fetch Sanity CMS videos from /api/videos
      try {
        const sanityRes = await fetch("/api/videos");
        if (sanityRes.ok) {
          const { videos: sanityVids } = await sanityRes.json();
          if (Array.isArray(sanityVids) && sanityVids.length > 0) {
            sanityVids.forEach((sv: any) => {
              const targetCat = baseCategories.find((c) => c.category.toLowerCase() === sv.category?.toLowerCase());
              const formattedVideo: Video = {
                id: sv.youtubeId,
                title: sv.title,
                year: sv.year || new Date().getFullYear(),
                duration: sv.duration || "3:30",
                description: sv.description || "",
              };
              if (targetCat) {
                if (!targetCat.videos.some((v) => v.id === formattedVideo.id)) {
                  targetCat.videos.unshift(formattedVideo);
                }
              } else {
                baseCategories.push({
                  category: sv.category || "Misc. / Various",
                  videos: [formattedVideo],
                });
              }
            });
          }
        }
      } catch { }

      // 3. Merge custom localStorage videos if present
      try {
        const rawLocal = localStorage.getItem("7th_heaven_custom_videos_v1");
        if (rawLocal) {
          const customVids: any[] = JSON.parse(rawLocal);
          customVids.forEach((cv) => {
            const targetCat = baseCategories.find((c) => c.category.toLowerCase() === cv.category?.toLowerCase());
            const formattedVideo: Video = {
              id: cv.id,
              title: cv.title,
              year: cv.year,
              duration: cv.duration,
              description: cv.description,
            };
            if (targetCat) {
              if (!targetCat.videos.some((v) => v.id === formattedVideo.id)) {
                targetCat.videos.unshift(formattedVideo);
              }
            } else {
              baseCategories.push({
                category: cv.category,
                videos: [formattedVideo],
              });
            }
          });
        }
      } catch { }

      setCategories(baseCategories);
      if (baseCategories.length > 0 && !activeFilter) {
        setActiveFilter(baseCategories[0].category);
      }
    } catch { }
  }, [activeFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const parsedId = extractYouTubeId(newUrl);
    if (!parsedId || parsedId.length !== 11) {
      alert("Please enter a valid 11-character YouTube video URL or ID.");
      return;
    }
    setSubmitting(true);

    const videoObj = {
      id: parsedId,
      title: newTitle.trim() || "Untitled Video",
      year: parseInt(newYear, 10) || new Date().getFullYear(),
      duration: newDuration.trim() || "3:30",
      description: newDesc.trim(),
      category: newCategory,
    };

    try {
      // 1. Send to Sanity CMS via API
      await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: videoObj.title,
          youtubeUrl: videoObj.id,
          category: videoObj.category,
          year: videoObj.year,
          duration: videoObj.duration,
          description: videoObj.description,
        }),
      });

      // 2. Save to localStorage fallback
      const rawLocal = localStorage.getItem("7th_heaven_custom_videos_v1");
      const existing: any[] = rawLocal ? JSON.parse(rawLocal) : [];
      const updated = [videoObj, ...existing.filter((v: any) => v.id !== videoObj.id)];
      localStorage.setItem("7th_heaven_custom_videos_v1", JSON.stringify(updated));

      // 3. Update state immediately
      setCategories((prev) => {
        const next = [...prev];
        let cat = next.find((c) => c.category === videoObj.category);
        if (!cat) {
          cat = { category: videoObj.category, videos: [] };
          next.push(cat);
        }
        if (!cat.videos.some((v) => v.id === videoObj.id)) {
          cat.videos.unshift(videoObj);
        }
        return next;
      });

      setActiveFilter(videoObj.category);
      setIsAddModalOpen(false);
      setNewTitle("");
      setNewUrl("");
      setNewDesc("");
      setToastMessage(`🎉 Video "${videoObj.title}" successfully added to ${videoObj.category}!`);
      setTimeout(() => setToastMessage(null), 4500);
    } catch {
      alert("Failed to save video.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.category === activeFilter) || categories[0];

  // Filter videos inside the selected category by search
  const filteredVideos = selectedCategory?.videos.filter(v => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return v.title.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q));
  }) || [];

  // 60 FPS focal line scroll sync setup for video list items to sticky video player
  useEffect(() => {
    if (typeof window === "undefined" || filteredVideos.length === 0) return;

    let rafId: number;

    function updateActiveOnScroll() {
      if (!videoItemRefs.current.length) return;
      // Focus line anchored at 22% viewport height (top-of-view list focal line)
      const targetY = Math.max(160, window.innerHeight * 0.22);
      let closestIdx = 0;
      let minDistance = Infinity;

      videoItemRefs.current.forEach((item, idx) => {
        if (!item) return;
        const rect = item.getBoundingClientRect();
        // Top-biased focal center of each item
        const focusPoint = rect.top + Math.min(rect.height / 2, 80);
        const dist = Math.abs(focusPoint - targetY);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      setActiveIndex(closestIdx);
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveOnScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateActiveOnScroll();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [filteredVideos.length, activeFilter, searchQuery]);

  const handleTitleClick = (index: number) => {
    const el = videoItemRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen">

      {/* ── FEATURED HERO (100vh Full Screen) ── */}
      {featuredVideo && (
        <section
          id="media-hero"
          className="relative overflow-hidden h-screen w-full py-section-flu"
          style={{
            marginLeft: "calc(-1 * var(--page-padding-x))",
            marginRight: "calc(-1 * var(--page-padding-x))",
            width: "calc(100% + 2 * var(--page-padding-x))",
          }}
        >
          <div className="absolute inset-0">
            {heroPlaying ? (
              <div className="absolute inset-0 w-full h-full z-20">
                <CustomVideoPlayer
                  videoId={featuredVideo.id}
                  title={featuredVideo.title}
                  onClose={() => setHeroPlaying(false)}
                />
              </div>
            ) : (
              <>
                <Image
                  ref={heroImgRef}
                  src={thumbMax(featuredVideo.id)}
                  alt="7th Heaven Media"
                  fill
                  priority
                  sizes="100vw"
                  unoptimized
                  className="w-full h-full object-cover scale-[1.3]"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = thumb(featuredVideo.id); }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none group/play">
                  <CosmicRadialButton
                    onClick={() => setHeroPlaying(true)}
                    aria-label="Play featured video"
                    icon={false}
                    className="w-24 h-24 !rounded-full !p-0 flex items-center justify-center group-hover/play:scale-110 transition-transform duration-300  border border-purple-300/40 pointer-events-auto cursor-pointer"
                  >
                    <Play className="w-9 h-9 text-white fill-white ml-1.5" />
                  </CosmicRadialButton>
                </div>
              </>
            )}
          </div>

          {!heroPlaying && (
            <>
              <HeroParallaxCustomizer {...heroParallax} />
              <div ref={heroForegroundRef} className="relative z-10  flex items-end pb-24 h-screen pointer-events-none site-container">
                <div className="max-w-lg pointer-events-auto transform-gpu isolate">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e1e6ff29] border  border-white/10    backdrop-blur-[45px] text-white text-xs  font-bold  uppercase tracking-[0.2em]  mb-4">
                    <span>FEATURED MEDIA</span>
                  </div>
                  <h1
                    className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem]  font-bold  italic uppercase tracking-tighter text-white leading-none mb-4 transform-gpu isolate"
                    style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}
                  >
                    <span className="inline-block pr-[0.15em] ">
                      {featuredVideo.title}
                    </span>
                  </h1>
                  {featuredVideo.description && (
                    <p className=" text-white  text-sm mb-4 leading-relaxed max-w-md">{featuredVideo.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-white/40 font-bold uppercase tracking-widest mb-6">
                    <span>{featuredVideo.year}</span>
                    {featuredVideo.duration && <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featuredVideo.duration}</span></>}
                    {featuredVideo.viewCount && <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featuredVideo.viewCount} views</span></>}
                  </div>
                  <CosmicRadialButton
                    onClick={() => setHeroPlaying(true)}
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
                    className="px-8 py-3.5 rounded-lg text-white  font-bold  text-xs uppercase tracking-widest"
                  >
                    Watch Featured Video
                  </CosmicRadialButton>
                </div>
              </div>
            </>
          )}
        </section>
      )}



      {/* ── CATEGORY FILTER TABS & SEARCH BAR ── */}
      <div className="mb-12 site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center pb-6 border-b border-white/10">
          {/* Category Tabs (7 Cols on LG) */}
          <div className="lg:col-span-7 relative">
            <div className="flex flex-nowrap sm:flex-wrap items-center gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => {
                if (cat.videos.length === 0) return null;
                const isActive = activeFilter === cat.category;
                return (
                  <button
                    key={cat.category}
                    onClick={() => {
                      setActiveFilter(cat.category);
                      setActiveIndex(0);
                    }}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${isActive
                      ? "bg-[var(--color-accent)] text-white "
                      : "bg-[#e1e6ff29]    text-white  hover:text-white hover:bg-white/10"
                      }`}
                  >
                    <span>{cat.category}</span>
                    <span className={`text-[10px] tabular-nums  font-bold  px-1.5 py-0.2 rounded-full ${isActive ? "bg-black/30 text-white" : "bg-purple-500/20 text-purple-300"
                      }`}>
                      {cat.videos.length}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Right Black Fade Mask on Mobile */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#06060c] via-[#06060c]/80 to-transparent sm:hidden z-10" />
          </div>

          {/* Search & Admin Add Video Button (5 Cols on LG) */}
          <div className="lg:col-span-5 flex flex-wrap sm:flex-nowrap items-center justify-start lg:justify-end gap-3 w-full">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="SEARCH MEDIA..."
              containerClassName="min-w-[220px] max-w-[300px] flex-1 sm:flex-initial"
            />
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider  rounded-lg transition-all  hover:scale-105 cursor-pointer shrink-0"
                title="Add a video to the Media Vault & Sanity CMS"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Video</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── GSAP SCROLL-DRIVEN NAME-LIST / VIDEO REVEAL SECTION ── */}
      <div ref={containerRef} className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">

          {/* LEFT COLUMN: SCROLLABLE TYPOGRAPHY VIDEO NAME LIST (5 COLS ON TABLET & DESKTOP, 12 ON MOBILE) */}
          <div className="md:col-span-5 space-y-4 md:space-y-24">
            {filteredVideos.map((video, index) => {
              const isActive = activeIndex === index;
              const isPlaying = playingId === video.id;

              return (
                <div
                  key={video.id}
                  ref={(el) => {
                    videoItemRefs.current[index] = el;
                  }}
                  onClick={() => handleTitleClick(index)}
                  className={`relative group cursor-pointer transition-all duration-300 select-none border-b min-h-[250px] sm:min-h-[280px] md:min-h-0 flex flex-col justify-end p-6 sm:p-8 md:p-0 md:pb-10 overflow-hidden transform-gpu origin-left ${isActive
                    ? "scale-[1.08] translate-x-3 z-20 opacity-100 border-purple-400"
                    : "scale-100 opacity-55 hover:opacity-90 border-white/10"
                    }`}
                >
                  {/* Full Section Background Video (Mobile Only) */}
                  <div className="md:hidden absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                    <VideoThumbnail videoId={video.id} title={video.title} isActive={true} index={index} />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40 z-10" />
                  </div>

                  {/* Content (Title, Year, Description, Play Button) Layered On Top */}
                  <div className="relative z-20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? "text-purple-300" : "text-[var(--color-accent)]"
                        }`}>
                        {video.year}
                      </span>
                    </div>

                    <h3
                      className={`text-3xl sm:text-4xl md:text-6xl font-bold uppercase tracking-tight transition-colors duration-300 ${isActive
                        ? "!text-[#c084fc] drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]"
                        : "text-white/60 group-hover:text-white"
                        }`}
                      style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}
                    >
                      {video.title}
                    </h3>

                    {video.description && (
                      <p
                        className={`mt-3 text-sm leading-relaxed max-w-lg transition-opacity duration-300 ${isActive ? "text-white/90 opacity-100" : "text-white/50 opacity-70"
                          }`}
                      >
                        {video.description}
                      </p>
                    )}

                    {isPlaying && (
                      <div className="md:hidden mt-4 relative aspect-[16/10] w-full  rounded-lg overflow-hidden    z-30 border  border-white/20 ">
                        <CustomVideoPlayer videoId={video.id} title={video.title} onClose={() => setPlayingId(null)} />
                      </div>
                    )}

                    {!isPlaying && (
                      <CosmicRadialButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingId(video.id);
                        }}
                        icon={<Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                        className={`mt-4 px-5 py-2.5 rounded-lg text-white text-xs  font-bold  uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
                      >
                        Play Video
                      </CosmicRadialButton>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredVideos.length === 0 && (
              <div className="py-16 text-center bg-[#e1e6ff29]   rounded-lg  border border-white/5">
                <p className=" text-white  text-sm font-semibold">No videos found matching &quot;{searchQuery}&quot;</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-bold uppercase text-[var(--color-accent)] hover:underline cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY VIDEO PREVIEW / PLAYER CONTAINER (7 COLS ON TABLET & DESKTOP) */}
          <div className="hidden md:block md:col-span-7 shrink-0 md:sticky md:top-[120px] z-20">
            <div className="relative aspect-[16/10] w-full rounded-lg  overflow-hidden border-0  bg-purple-950/20">
              {filteredVideos.map((video, index) => {
                const isActive = activeIndex === index;
                const isPlaying = playingId === video.id;

                return (
                  <div
                    key={video.id}
                    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out rounded-lg overflow-hidden ${isActive
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-105 pointer-events-none"
                      }`}
                  >
                    {isPlaying ? (
                      <CustomVideoPlayer videoId={video.id} title={video.title} onClose={() => setPlayingId(null)} />
                    ) : (
                      <div
                        onClick={() => setPlayingId(video.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setPlayingId(video.id); }}
                        role="button"
                        tabIndex={0}
                        className="relative w-full h-full cursor-pointer group/card block text-left"
                        aria-label={`Play ${video.title}`}
                      >
                        <VideoThumbnail videoId={video.id} title={video.title} isActive={isActive} index={index} />
                        <div className="absolute inset-0  group-hover/card:bg-black/50 transition-colors z-10" />

                        {/* Play Icon Badge */}
                        <div className="absolute inset-0 hidden group-hover/card:flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                          <CosmicRadialButton
                            icon={false}
                            className="w-16 h-16 !rounded-full !p-0 flex items-center justify-center  group-hover/card:scale-110 transition-transform border border-purple-300/40"
                          >
                            <Play className="w-7 h-7 fill-white ml-1 text-white" />
                          </CosmicRadialButton>
                        </div>

                        {/* Caption Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 z-20">
                          <span className="text-[10px]  font-bold  uppercase tracking-[0.2em] text-[var(--color-accent)] bg-black/70  backdrop-blur-[45px] px-2 py-0.5 rounded border border-white/10">
                            {selectedCategory?.category}
                          </span>
                          <h4 className="text-lg  font-bold  uppercase tracking-tight text-white mt-1 truncate">
                            {video.title}
                          </h4>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-gradient-to-r from-purple-950 to-black border border-purple-500/50 text-white px-5 py-3.5 rounded-lg  flex items-center gap-3 animate-[slideUp_0.3s_ease-out]">

          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ── ADD YOUTUBE VIDEO MODAL (Sanity CMS + Media Vault) ── */}
      {isAdmin && isAddModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/80  backdrop-blur-[45px] flex items-center justify-center p-4 animate-[fade-in_0.15s_ease-out]">
          <div className="bg-[#0f0921] border border-purple-500/40 rounded-lg  w-full max-w-lg overflow-hidden  p-6 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <VideoIcon className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-base  font-bold  uppercase tracking-wider text-white">Add Video to Media Vault</h3>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Syncs to Sanity CMS & Media Hub</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px]  font-bold  uppercase tracking-wider text-purple-300 mb-1">
                  Video URL or ID <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Paste video link or ID..."
                  className="w-full bg-black/60 border  border-white/20   rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Live Video Thumbnail Preview */}
              {(() => {
                const parsed = extractYouTubeId(newUrl);
                if (parsed && parsed.length === 11) {
                  return (
                    <div className="p-3 bg-purple-950/40 border border-purple-500/40  rounded-lg flex items-center gap-4">
                      <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 border  border-white/10  bg-black">
                        <Image
                          src={`https://img.youtube.com/vi/${parsed}/hqdefault.jpg`}
                          alt="Thumbnail preview"
                          fill
                          sizes="96px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Valid Video Link Detected</span>
                        </div>
                        <p className="text-[10px] text-white/50 font-mono mt-0.5">ID: {parsed}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <label className="block text-[10px]  font-bold  uppercase tracking-wider text-purple-300 mb-1">
                  Video Title <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ain't That Just Beautiful (Official Video)"
                  className="w-full bg-black/60 border  border-white/20   rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px]  font-bold  uppercase tracking-wider text-purple-300 mb-1">
                    Category <span className="text-pink-400">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-black/60 border  border-white/20   rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="Official Music Videos">Official Music Videos</option>
                    <option value="TV Appearances">TV Appearances</option>
                    <option value="Full Concerts">Full Concerts</option>
                    <option value="Cover Songs">Cover Songs</option>
                    <option value="Songs In Movies & TV">Songs In Movies & TV</option>
                    <option value="Cruise Videos">Cruise Videos</option>
                    <option value="College Shows">College Shows</option>
                    <option value="Misc. / Various">Misc. / Various</option>
                    <option value="Live Footage">Live Footage</option>
                    <option value="Medley's">Medley's</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px]  font-bold  uppercase tracking-wider text-purple-300 mb-1">
                    Release Year
                  </label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="2026"
                    className="w-full bg-black/60 border  border-white/20   rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px]  font-bold  uppercase tracking-wider text-purple-300 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Filmed live at Frontier Days..."
                  className="w-full bg-black/60 border  border-white/20   rounded-lg px-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold  text-white  hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white  font-bold  text-xs uppercase tracking-wider  rounded-lg transition-all  cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Saving to Sanity..." : "Publish Video to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
