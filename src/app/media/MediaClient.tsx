/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import Image from "next/image";
import { videoThumb } from "@/lib/videoThumb";
import staticVideoCategories from "../../../public/data/videos.json";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import {
  X,
  Video as VideoIcon,
  Camera,
  CheckCircle2,
  Check,
  Play,
  Film,
  ArrowUpDown,
  Clock,
  Maximize2,
  SlidersHorizontal,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMember } from "@/context/MemberContext";
import PageHero from "@/components/PageHero";
import AddCmsButton from "@/components/AddCmsButton";
import CustomDropdown from "@/components/CustomDropdown";
import { SearchInput } from "@/components/SearchInput";
import { SectionHeader } from "@/components/SectionHeader";
import { SeventhButton } from "@/components/SeventhButton";
import GlowInput, { GlowSelect, GlowTextarea } from "@/components/GlowInput";
import MediaLayoutContainer from "@/components/MediaLayoutContainer";
import GlassPlayButton from "@/components/GlassPlayButton";
import VideoArchiveRenderer, { VIDEO_LAYOUT_PRESETS } from "@/components/VideoArchiveRenderer";
import { useScrollLock } from "@/lib/useScrollLock";
import MediaFilterDrawer, { type MediaFilterOption } from "@/components/MediaFilterDrawer";
import MediaPagination, {
  PAGINATION_INFO,
  PAGINATION_VARIANTS,
  type PaginationVariant,
} from "@/components/MediaPagination";
import type { FanPhoto } from "@/lib/fanPhotos";

const CustomVideoPlayer = dynamic(
  () => import("@/components/CustomVideoPlayer"),
  { ssr: false },
);
const AudioPlayer = dynamic(() => import("@/components/AudioPlayer"), {
  ssr: false,
});
const FanPhotoWallClient = dynamic(
  () => import("@/app/fan-media-wall/FanPhotoWallClient"),
  { ssr: false },
);

interface Video {
  id: string;
  title: string;
  year: number;
  duration?: string;
  description?: string;
  viewCount?: string;
  category?: string;
  mediaType?: "video" | "photo";
  photoSrc?: string;
  photographer?: string;
  venue?: string;
  city?: string;
}

interface VideoCategory {
  category: string;
  videos: Video[];
}

interface CardVariant {
  aspectClass: string;
}

export type MediaColumnItem =
  | {
    type: "video";
    video: Video;
    aspectClass: string;
    widthClass: string;
    alignClass: string;
    marginClass: string;
    offsetClass: string;
    key: string;
    priority: boolean;
  }
  | {
    type: "spacer";
    heightClass: string;
    key: string;
  };

// Organic varied aspect-ratios matching high-fashion editorial collage / House of Yellow
const ORGANIC_ASPECTS = [
  "aspect-[16/9]",    // Standard widescreen
  "aspect-[4/3]",     // Vintage broadcast / classic CRT
  "aspect-[16/10]",   // Cinematic golden
  "aspect-square",    // Album square
  "aspect-[4/5]",     // Tall editorial portrait
  "aspect-[21/9]",    // Cinematic ultra-wide letterbox
  "aspect-[3/4]",     // Subtle vertical frame
  "aspect-[3/2]",     // Classic 35mm photography
  "aspect-[1.18/1]",  // Soft square
  "aspect-[1.85/1]",  // Flat widescreen
];

// Varied card widths, alignments & horizontal drift to shatter the rigid column grid
const ORGANIC_LAYOUTS = [
  { width: "w-full", align: "self-stretch", offset: "translate-x-0" },
  { width: "w-[94%] sm:w-[92%]", align: "self-start", offset: "md:translate-x-1" },
  { width: "w-[92%] sm:w-[90%]", align: "self-end", offset: "md:-translate-x-1" },
  { width: "w-[88%] sm:w-[86%]", align: "self-center", offset: "translate-x-0" },
  { width: "w-full", align: "self-stretch", offset: "translate-x-0" },
  { width: "w-[96%] sm:w-[94%]", align: "self-start", offset: "md:translate-x-2" },
  { width: "w-[90%] sm:w-[88%]", align: "self-end", offset: "md:-translate-x-2" },
  { width: "w-[95%] sm:w-[92%]", align: "self-center", offset: "translate-x-0" },
  { width: "w-[86%] sm:w-[84%]", align: "self-start", offset: "md:translate-x-3" },
  { width: "w-full", align: "self-stretch", offset: "translate-x-0" },
];

// Dynamic vertical rhythm: varied margin-bottom to create artistic syncopation
const ORGANIC_MARGINS = [
  "mb-4 md:mb-6",
  "mb-8 md:mb-12",
  "mb-12 md:mb-18",
  "mb-6 md:mb-10",
  "mb-16 md:mb-24",
  "mb-4 md:mb-8",
  "mb-10 md:mb-14",
  "mb-14 md:mb-20",
];

const COLUMN_TOP_STAGGERS = [
  "pt-0",
  "pt-14 md:pt-24 lg:pt-32",
  "pt-6 md:pt-10 lg:pt-14",
  "pt-20 md:pt-36 lg:pt-48",
];

// Deterministic seed hash from string so SSR and client always produce identical layout
function getDeterministicHash(str: string, salt: number = 0): number {
  let hash = 0;
  const combined = `${str}_${salt}`;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getOrganicItemStyle(videoId: string, index: number) {
  const hash = getDeterministicHash(videoId, index);
  const aspectClass = ORGANIC_ASPECTS[hash % ORGANIC_ASPECTS.length];
  const layout = ORGANIC_LAYOUTS[(hash >> 2) % ORGANIC_LAYOUTS.length];
  const marginClass = ORGANIC_MARGINS[(hash >> 4) % ORGANIC_MARGINS.length];

  // Rough aspect ratio multipliers for height estimation
  let ratio = 0.5625; // 16/9
  if (aspectClass.includes("4/3")) ratio = 0.75;
  else if (aspectClass.includes("16/10")) ratio = 0.625;
  else if (aspectClass.includes("square")) ratio = 1.0;
  else if (aspectClass.includes("4/5")) ratio = 1.25;
  else if (aspectClass.includes("21/9")) ratio = 0.428;
  else if (aspectClass.includes("3/4")) ratio = 1.333;
  else if (aspectClass.includes("3/2")) ratio = 0.667;
  else if (aspectClass.includes("1.18/1")) ratio = 0.847;
  else if (aspectClass.includes("1.85/1")) ratio = 0.54;

  return {
    aspectClass,
    widthClass: layout.width,
    alignClass: layout.align,
    offsetClass: layout.offset,
    marginClass,
    ratio,
  };
}

function extractYouTubeId(urlOrId: string): string {
  const match = urlOrId.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  if (match && match[1]) return match[1];
  const clean = urlOrId.trim();
  if (clean.length === 11 && /^[\w-]+$/.test(clean)) return clean;
  return clean;
}

const EMPTY_FAN_PHOTOS: FanPhoto[] = [];

type LengthKey = "all" | "short" | "mid" | "full";

const LENGTH_BUCKETS: { value: Exclude<LengthKey, "all">; label: string; test: (s: number) => boolean }[] = [
  { value: "short", label: "Short clips (under 5 min)", test: (s) => s < 300 },
  { value: "mid", label: "Mid-length (5–20 min)", test: (s) => s >= 300 && s < 1200 },
  { value: "full", label: "Full shows (20 min +)", test: (s) => s >= 1200 },
];

function parseDurationSeconds(d?: string): number | undefined {
  if (!d) return undefined;
  return String(d).split(":").map(Number).reduce((a, b) => a * 60 + b, 0);
}

function matchesMediaType(v: Video, t: "all" | "videos" | "photos") {
  if (t === "all") return true;
  return t === "videos" ? v.mediaType !== "photo" : v.mediaType === "photo";
}

function matchesLength(v: Video, l: LengthKey) {
  if (l === "all") return true;
  const s = parseDurationSeconds(v.duration);
  if (s === undefined || v.mediaType === "photo") return false;
  const bucket = LENGTH_BUCKETS.find((b) => b.value === l);
  return bucket ? bucket.test(s) : false;
}

const toTitleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

// Curated high-res live concert, stage, cruise, and band photography
const CURATED_BAND_PHOTOS: Video[] = [
  {
    id: "photo_band_performance",
    title: "Stage Breakdown at DeKalb Cornfest",
    year: 2024,
    category: "Live Concert Archive",
    mediaType: "photo",
    photoSrc: "/images/hero/band-performance.png",
    photographer: "Official 7th Heaven Crew",
    venue: "DeKalb Cornfest Main Stage",
    city: "DeKalb, IL",
    description: "High energy guitar breakdown with crowd hands in the air under festival lighting.",
  },
  {
    id: "photo_rock_n_wheels",
    title: "Electric Night at Addison Rock N' Wheels",
    year: 2024,
    category: "Rock N' Wheels",
    mediaType: "photo",
    photoSrc: "/images/tour/fan-concert-photo.jpg",
    photographer: "Live Show Archive",
    venue: "Village Green Stage",
    city: "Addison, IL",
    description: "Unforgettable summer festival night rocking Addison with thousands of fans.",
  },
  {
    id: "photo_cozumel_cruise",
    title: "Annual Band Cruise Sail-Away Party",
    year: 2024,
    category: "Cruise Videos",
    mediaType: "photo",
    photoSrc: "/images/cruise/cozumel.png",
    photographer: "7th Heaven Travel Crew",
    venue: "Royal Caribbean Deck Stage",
    city: "Cozumel, Mexico",
    description: "Tropical Caribbean waters and band fans celebrating the annual 7th Heaven Cruise.",
  },
  {
    id: "photo_soldier_field_arena",
    title: "Soldier Field Stadium Showcase",
    year: 2024,
    category: "Full Concerts",
    mediaType: "photo",
    photoSrc: "/images/hero/hero-band-bg.png",
    photographer: "Stadium Tour Media",
    venue: "Soldier Field Stadium",
    city: "Chicago, IL",
    description: "Rocking Soldier Field with over 80,000 cheering rock fans under the lights.",
  },
  {
    id: "photo_cococay_stage",
    title: "Private Island Beach Concert",
    year: 2023,
    category: "Cruise Videos",
    mediaType: "photo",
    photoSrc: "/images/cruise/ports/cococay.jpg",
    photographer: "Cruise Tour Photographer",
    venue: "Perfect Day Beach Stage",
    city: "CocoCay, Bahamas",
    description: "Exclusive fan concert on the white sands of the Bahamas.",
  },
  {
    id: "photo_musichall_lounge",
    title: "Music Hall Late Night Jam",
    year: 2023,
    category: "Live Footage",
    mediaType: "photo",
    photoSrc: "/images/cruise/ship/musichallbar.jpg",
    photographer: "Backstage Media",
    venue: "Music Hall Lounge",
    city: "At Sea",
    description: "Intimate late-night acoustic sets and rock classics with the die-hard fans.",
  },
  {
    id: "photo_band_hero_banner",
    title: "7th Heaven Official Headline Tour",
    year: 2025,
    category: "Official Music Videos",
    mediaType: "photo",
    photoSrc: "/images/hero/hero-banner.png",
    photographer: "Studio & Live Archive",
    venue: "Midwest Arena Tour",
    city: "Chicago, IL",
    description: "Official promotional band photo capturing four decades of Midwest rock heritage.",
  },
  {
    id: "photo_at_sea_sunset",
    title: "Sunset Rock Deck Party",
    year: 2024,
    category: "Cruise Videos",
    mediaType: "photo",
    photoSrc: "/images/cruise/at-sea.png",
    photographer: "7th Heaven Cruise Club",
    venue: "Open Deck Pool Stage",
    city: "Caribbean Sea",
    description: "Sunset performance surrounded by open ocean and hundreds of singing fans.",
  },
];

export default function MediaClient({
  sanityContent,
  fanSanityContent,
  initialFanPhotos = EMPTY_FAN_PHOTOS,
}: {
  sanityContent?: any;
  fanSanityContent?: any;
  initialFanPhotos?: FanPhoto[];
}) {
  const { member, isLoggedIn } = useMember();
  const isAdmin = Boolean(
    isLoggedIn &&
    (member?.role === "admin" || member?.role === "crew"),
  );

  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
  );

  // Fixed layout: Layout 2 (Fixed Bottom Audio Dock + Hero Video + Fan Mosaic)
  const [layoutVariant, setLayoutVariant] = useState<number>(2);
  const [paginationVariant, setPaginationVariant] = useState<PaginationVariant>("text");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const layoutParam = parseInt(p.get("layout") || p.get("style") || "2", 10);
    if (!isNaN(layoutParam) && layoutParam >= 1 && layoutParam <= 20) {
      setLayoutVariant(layoutParam);
    }
    const pagParam = p.get("pagination") as PaginationVariant;
    if (pagParam && PAGINATION_VARIANTS.includes(pagParam)) {
      setPaginationVariant(pagParam);
    }
  }, []);

  const handlePaginationVariantChange = (v: PaginationVariant) => {
    setPaginationVariant(v);
    localStorage.setItem("7th_pagination_variant", v);
  };

  const [categories, setCategories] = useState<VideoCategory[]>(
    staticVideoCategories as VideoCategory[],
  );
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Video | null>(null);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "videos" | "photos">("all");
  const [yearRange, setYearRange] = useState<[number, number] | null>(null);
  const [lengthFilter, setLengthFilter] = useState<LengthKey>("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [sortBy, setSortBy] = useState<"default" | "newest" | "oldest" | "title" | "duration">("default");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Reset pagination to page 1 when filter, year range, length, sort or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, yearRange, lengthFilter, sortBy, mediaTypeFilter]);

  // Add video modal state (for Sanity CMS admins)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("OFFICIAL MUSIC VIDEOS");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [newYear, setNewYear] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const projectsContainerRef = useRef<HTMLElement>(null);

  const handleScrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      const lenis = typeof window !== "undefined" ? (window as any).__lenis : null;
      // Default: scroll to gallery with clearance for sticky/fixed navigation bar
      const el = projectsContainerRef.current;
      if (el) {
        if (lenis?.scrollTo) {
          lenis.scrollTo(el, { offset: -96, duration: 0.85 });
        } else {
          const rect = el.getBoundingClientRect();
          const targetY = rect.top + window.scrollY - 96;
          window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
        }
      } else {
        if (lenis?.scrollTo) {
          lenis.scrollTo(0, { duration: 0.85 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    });
  }, []);

  useScrollLock(Boolean(playingVideo || selectedPhoto || isAddModalOpen));

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (playingVideo) setPlayingVideo(null);
        if (selectedPhoto) setSelectedPhoto(null);
        if (isAddModalOpen) setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playingVideo, selectedPhoto, isAddModalOpen]);

  // Fetch updated videos from Sanity and localStorage
  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch("/data/videos.json");
      let baseCategories: VideoCategory[] = [];
      if (r.ok) {
        baseCategories = await r.json();
      }

      try {
        const sanityRes = await fetch("/api/videos");
        if (sanityRes.ok) {
          const { videos: sanityVids } = await sanityRes.json();
          if (Array.isArray(sanityVids) && sanityVids.length > 0) {
            sanityVids.forEach((sv: any) => {
              const targetCat = baseCategories.find(
                (c) => c.category.toLowerCase() === sv.category?.toLowerCase(),
              );
              const formattedVideo: Video = {
                id: sv.youtubeId,
                title: sv.title,
                year: sv.year || new Date().getFullYear(),
                duration: sv.duration || "3:30",
                description: sv.description || "",
                category: sv.category,
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
            setCategories(baseCategories);
          }
        }
      } catch { }
    } catch { }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Flatten and organically interleave videos and photos across categories for an eclectic mix
  const allVideos = useMemo(() => {
    const list: Video[] = [];
    const seen = new Set<string>();

    // Prepare queues per category
    const categoryQueues = categories.map((cat) =>
      cat.videos.map((v) => ({ ...v, category: v.category || cat.category, mediaType: "video" as const }))
    );

    let hasRemaining = true;
    let round = 0;
    let photoIdx = 0;

    while (hasRemaining) {
      hasRemaining = false;
      for (const queue of categoryQueues) {
        if (round < queue.length) {
          const v = queue[round];
          if (!seen.has(v.id)) {
            seen.add(v.id);
            list.push(v);

            // Interleave a curated high-res photo every 2-3 videos for a rich blend
            if (list.length % 3 === 0 && photoIdx < CURATED_BAND_PHOTOS.length) {
              const photo = CURATED_BAND_PHOTOS[photoIdx];
              if (!seen.has(photo.id)) {
                seen.add(photo.id);
                list.push(photo);
                photoIdx++;
              }
            }
          }
          hasRemaining = true;
        }
      }
      round++;
    }

    // Append any remaining photos so they are completely discoverable
    while (photoIdx < CURATED_BAND_PHOTOS.length) {
      const photo = CURATED_BAND_PHOTOS[photoIdx];
      if (!seen.has(photo.id)) {
        seen.add(photo.id);
        list.push(photo);
      }
      photoIdx++;
    }

    return list;
  }, [categories]);

  // Year bounds re-scope to category + media type + length (like Flux's price slider)
  const yearBounds = useMemo<[number, number] | null>(() => {
    const activeUpper = activeFilter.toUpperCase();
    const years = allVideos
      .filter(
        (v) =>
          matchesMediaType(v, mediaTypeFilter) &&
          matchesLength(v, lengthFilter) &&
          (activeUpper === "ALL" || (v.category && v.category.toUpperCase() === activeUpper)) &&
          (Number(v.year) || 0) > 0,
      )
      .map((v) => Number(v.year));
    return years.length ? [Math.min(...years), Math.max(...years)] : null;
  }, [allVideos, activeFilter, mediaTypeFilter, lengthFilter]);

  // Clamp the chosen range into the current bounds
  const effectiveYearRange = useMemo<[number, number] | null>(() => {
    if (!yearBounds) return null;
    if (!yearRange) return yearBounds;
    const lo = Math.min(Math.max(yearRange[0], yearBounds[0]), yearBounds[1]);
    const hi = Math.max(Math.min(yearRange[1], yearBounds[1]), lo);
    return [lo, hi];
  }, [yearRange, yearBounds]);

  const yearActive =
    !!yearBounds &&
    !!effectiveYearRange &&
    (effectiveYearRange[0] !== yearBounds[0] || effectiveYearRange[1] !== yearBounds[1]);

  const activeFilterCount =
    (activeFilter.toUpperCase() !== "ALL" ? 1 : 0) +
    (mediaTypeFilter !== "all" ? 1 : 0) +
    (lengthFilter !== "all" ? 1 : 0) +
    (yearActive ? 1 : 0);

  const clearDrawerFilters = useCallback(() => {
    setActiveFilter("ALL");
    setMediaTypeFilter("all");
    setLengthFilter("all");
    setYearRange(null);
  }, []);
  const closeFilterDrawer = useCallback(() => setFilterDrawerOpen(false), []);

  // Facet counts for the drawer
  const scopedForCategory = useMemo(
    () => allVideos.filter((v) => matchesMediaType(v, mediaTypeFilter)),
    [allVideos, mediaTypeFilter],
  );
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    scopedForCategory.forEach((v) => {
      const key = (v.category || "").toUpperCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [scopedForCategory]);

  const mediaTypeDrawerOptions = useMemo<MediaFilterOption[]>(() => {
    const activeUpper = activeFilter.toUpperCase();
    const inCat = allVideos.filter(
      (v) => activeUpper === "ALL" || (v.category && v.category.toUpperCase() === activeUpper),
    );
    return [
      { value: "all", label: "All", count: inCat.length },
      { value: "videos", label: "Videos", count: inCat.filter((v) => v.mediaType !== "photo").length },
      { value: "photos", label: "Photos", count: inCat.filter((v) => v.mediaType === "photo").length },
    ];
  }, [allVideos, activeFilter]);

  // Length facet hidden entirely when only photos are in view
  const lengthDrawerOptions = useMemo<MediaFilterOption[]>(() => {
    const activeUpper = activeFilter.toUpperCase();
    const scoped = allVideos.filter(
      (v) =>
        matchesMediaType(v, mediaTypeFilter) &&
        (activeUpper === "ALL" || (v.category && v.category.toUpperCase() === activeUpper)) &&
        parseDurationSeconds(v.duration) !== undefined,
    );
    if (scoped.length === 0) return [];
    return [
      { value: "all", label: "Any length", count: scoped.length },
      ...LENGTH_BUCKETS.map((b) => ({
        value: b.value,
        label: b.label,
        count: scoped.filter((v) => b.test(parseDurationSeconds(v.duration)!)).length,
      })),
    ];
  }, [allVideos, activeFilter, mediaTypeFilter]);

  // Set of video/photo IDs matching active filter, year range, media type, length, and search query
  const visibleVideoIds = useMemo(() => {
    const ids = new Set<string>();
    const q = searchQuery.toLowerCase().trim();
    const activeUpper = activeFilter.toUpperCase();

    allVideos.forEach((v) => {
      if (!matchesMediaType(v, mediaTypeFilter)) return;
      if (!matchesLength(v, lengthFilter)) return;

      const matchesCategory =
        activeUpper === "ALL" ||
        (v.category && v.category.toUpperCase() === activeUpper);

      const year = Number(v.year) || 0;
      const matchesEra =
        !effectiveYearRange || (year >= effectiveYearRange[0] && year <= effectiveYearRange[1]);

      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        (v.category && v.category.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q)) ||
        (v.venue && v.venue.toLowerCase().includes(q)) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        String(v.year).includes(q);

      if (matchesCategory && matchesEra && matchesSearch) {
        ids.add(v.id);
      }
    });
    return ids;
  }, [allVideos, activeFilter, effectiveYearRange, mediaTypeFilter, lengthFilter, searchQuery]);

  // Filtered and sorted videos based on active filter, era, and sort selection
  const filteredVideos = useMemo(() => {
    const list = allVideos.filter((v) => visibleVideoIds.has(v.id));

    if (sortBy === "newest") {
      return [...list].sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
    }
    if (sortBy === "oldest") {
      return [...list].sort((a, b) => (Number(a.year) || 9999) - (Number(b.year) || 9999));
    }
    if (sortBy === "title") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === "duration") {
      const parseDuration = (d?: string) => {
        if (!d) return 0;
        const parts = d.split(":").map(Number);
        return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] || 0;
      };
      return [...list].sort((a, b) => parseDuration(b.duration) - parseDuration(a.duration));
    }

    return list;
  }, [allVideos, visibleVideoIds, sortBy]);

  const totalPages = Math.ceil(filteredVideos.length / pageSize) || 1;

  // Paginated videos: displays exactly 20 videos for the active page
  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredVideos.slice(startIndex, startIndex + pageSize);
  }, [filteredVideos, currentPage, pageSize]);

  // Stable pre-computed organic styles per video so style calculation is memoized
  const videoStyles = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getOrganicItemStyle>>();
    allVideos.forEach((v, idx) => {
      map.set(v.id, getOrganicItemStyle(v.id, idx));
    });
    return map;
  }, [allVideos]);

  // Responsive grid: 3-column stack on large screens, 2 on medium screens as it gets smaller, 1 on mobile
  const containerColumnClass = useMemo(() => {
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12 items-start";
  }, []);


  // Dropdown options for category filter
  const categoryDropdownOptions = useMemo(() => {
    const list: Array<{ value: string; label: string; badge?: number | string }> =
      [
        {
          value: "ALL",
          label: "ALL",
        },
      ];

    categories.forEach((cat) => {
      if (!cat.category || !cat.category.trim() || cat.videos.length === 0) {
        return;
      }
      const catUpper = cat.category.toUpperCase();
      list.push({
        value: catUpper,
        label: catUpper,
        badge: cat.videos.length,
      });
    });

    return list;
  }, [categories]);


  // Dropdown options for sorting
  const sortDropdownOptions = useMemo(() => {
    return [
      { value: "default", label: "DEFAULT CURATED" },
      { value: "newest", label: "RELEASE: NEWEST FIRST" },
      { value: "oldest", label: "RELEASE: OLDEST FIRST" },
      { value: "title", label: "ALPHABETICAL (A-Z)" },
      { value: "duration", label: "LONGEST RUNTIME" },
    ];
  }, []);

  const sortTriggerPrefix = useMemo(
    () => (
      <span className="flex items-center gap-1.5 min-w-0">
        <ArrowUpDown className="h-3.5 w-3.5 text-purple-300/80" />
        <span className="text-[11px] font-semibold text-white/50 tracking-wider uppercase">
          Sort:
        </span>
      </span>
    ),
    [],
  );

  // Available categories for add form
  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(
        categories
          .map((c) => c.category)
          .filter((cat) => cat && cat.trim() !== ""),
      ),
    );
  }, [categories]);



  const handleFilterChange = (cat: string) => {
    setActiveFilter(cat);
  };

  const handleCloseVideo = () => {
    setPlayingVideo(null);
  };

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYouTubeId(newUrl);
    if (!ytId || ytId.length !== 11) {
      alert("Please enter a valid YouTube Video URL or 11-character ID.");
      return;
    }
    if (!newTitle.trim()) {
      alert("Please enter a video title.");
      return;
    }
    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || "Official Music Videos"
      : newCategory;

    setSubmitting(true);
    try {
      const videoObj: Video = {
        id: ytId,
        title: newTitle.trim(),
        year: Number(newYear) || new Date().getFullYear(),
        duration: "3:30",
        description: newDesc.trim(),
        category: finalCategory,
      };

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeId: videoObj.id,
          title: videoObj.title,
          year: videoObj.year,
          duration: videoObj.duration,
          description: videoObj.description,
          category: videoObj.category,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to publish video to Sanity");
      }

      setCategories((prev) => {
        const next = [...prev];
        let cat = next.find(
          (c) => c.category.toLowerCase() === videoObj.category?.toLowerCase(),
        );
        if (!cat) {
          cat = { category: videoObj.category || "Misc", videos: [] };
          next.push(cat);
        }
        if (!cat.videos.some((v) => v.id === videoObj.id)) {
          cat.videos.unshift(videoObj);
        }
        return next;
      });

      setActiveFilter(videoObj.category ? videoObj.category.toUpperCase() : "ALL");
      setIsAddModalOpen(false);
      setIsCustomCategory(false);
      setCustomCategoryInput("");
      setNewTitle("");
      setNewUrl("");
      setNewDesc("");
      setToastMessage(
        `🎉 Video "${videoObj.title}" successfully added under "${videoObj.category}"!`,
      );
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: any) {
      alert(err?.message || "Failed to save video.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderCard = (
    video: Video,
    style: ReturnType<typeof getOrganicItemStyle>,
    isVisible: boolean,
    priority: boolean = false,
  ) => {
    const isHovered = !playingVideo && !selectedPhoto && hoveredVideoId === video.id;
    const isPhoto = video.mediaType === "photo";
    const imgSrc = isPhoto && video.photoSrc
      ? video.photoSrc
      : videoThumb(video.id);

    const handleCardClick = () => {
      setHoveredVideoId(null);
      if (isPhoto) {
        setSelectedPhoto(video);
      } else {
        setPlayingVideo(video);
      }
    };

    return (
      <div
        key={`video-card-${video.id}`}
        className={`w-full transition-opacity duration-300 ${isVisible ? "block" : "!hidden pointer-events-none select-none"
          }`}
      >
        <div className="w-full">
          <div
            role="button"
            tabIndex={isVisible ? 0 : -1}
            aria-label={isPhoto ? `View photo: ${video.title}` : `Play video: ${video.title}`}
            onMouseEnter={() => {
              if (!playingVideo && !selectedPhoto) setHoveredVideoId(video.id);
            }}
            onMouseLeave={() => setHoveredVideoId(null)}
            onClick={handleCardClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick();
              }
            }}
            className="group block w-full cursor-pointer text-left select-none"
          >
            {/* Media Video or Photo Box */}
            <div
              className="relative block w-full overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] transition-[transform,box-shadow] duration-300 aspect-[16/10] sm:aspect-[16/9]"
            >
              {/* Media Thumbnail Image */}
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={imgSrc}
                  alt={video.title}
                  fill
                  priority={priority}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover transition-transform duration-700 ease-out ${isHovered ? "scale-[1.05]" : "scale-100"
                    }`}
                />

                {/* Center Overlay: Play Button for Videos, Zoom / Inspect for Photos */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {isPhoto ? (
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border border-purple-400/40 bg-black/60 backdrop-blur-md text-purple-200 transition-all duration-300 ${
                        isHovered ? "scale-110 bg-purple-600 text-white shadow-lg shadow-purple-600/50" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Maximize2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <div
                      className={`transition-all duration-300 ${
                        isHovered
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                      }`}
                    >
                      <GlassPlayButton
                        size="lg"
                        as="div"
                        glow
                        className="pointer-events-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Meta Row (Split Left/Right matching reference) */}
            <div className="mt-3.5 flex items-start justify-between gap-3 px-0.5">
              {/* Left: Bold All-Caps Title & Subtext in Quisas */}
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl uppercase text-white group-hover:text-[#f2efa3] transition-colors duration-150 line-clamp-1 leading-tight tracking-normal">
                  {video.title}
                </h2>
                <div className="font-quisas text-sm sm:text-base text-white/90 tracking-wide line-clamp-1 mt-0.5">
                  {video.category || "7th Heaven Official Release"}
                </div>
              </div>

              {/* Right: Credits / Production context dynamically matching video or photo info */}
              <div className="text-right shrink-0">
                <span className="block text-xs sm:text-sm font-semibold text-white/50 tracking-normal">
                  {isPhoto
                    ? video.venue || (video.year ? `Captured • ${video.year}` : "Band Archive")
                    : video.year
                      ? `Release Year • ${video.year}`
                      : video.category || "Official Release"}
                </span>
                <span className="block text-xs sm:text-sm font-medium text-white/90 tracking-wide leading-none mt-0.5">
                  {isPhoto
                    ? video.city || video.photographer || "Live Show Photography"
                    : video.category === "Cruise Videos"
                      ? "Annual Band Cruise"
                      : video.category === "TV Appearances"
                        ? "Television Broadcast"
                        : video.category === "Full Concerts" || video.category === "Live Footage"
                          ? "Live Concert Archive"
                          : "7th Heaven Records"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  };

  return (
    <main
      className="page-container relative min-h-screen overflow-x-hidden selection:bg-[#f2efa3] selection:text-[#1d1d1b]"
      id="media-page"
    >
      <div className="site-container page-stack-sm relative z-10">
        {/* ── 2-COLUMN HEADER ROW: TITLE ON LEFT, AUDIO PLAYER BOX ON RIGHT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-[var(--header-cols-gap,2rem)] items-center w-full">
          <div className="w-full">
            <PageHero
              title={
                (
                  sanityContent?.heroHeading ||
                  sanityContent?.title ||
                  "MEDIA VAULT"
                )
                  .replace(/7TH HEAVEN\s*/i, "")
                  .trim() || "MEDIA VAULT"
              }
              titleId="media-heading"
              subtitle={
                sanityContent?.heroSubheading ||
                sanityContent?.subtitle ||
                "40 years of music, live performances, official music videos, and fan community memories."
              }
              align="left"
              className="w-full"
            />
          </div>
          <div className="w-full flex justify-start lg:justify-end">
            <section id="audio-vault" aria-labelledby="audio-vault-heading" className="w-full">
              <SectionHeader id="audio-vault-heading" title="Audio Vault Player" visuallyHidden />
              <AudioPlayer />
            </section>
          </div>
        </div>

        {/* ── 3-WAY INTEGRATED MEDIA ARCHITECTURE (ALL 3 PILLARS ON ONE PAGE) ── */}
        <MediaLayoutContainer
          layoutId={layoutVariant}
          audioPlayerNode={null}
          officialMediaNode={
            <section
              ref={projectsContainerRef}
              id="media-gallery"
              aria-labelledby="media-gallery-heading"
              className="relative w-full scroll-mt-24"
            >
              <SectionHeader id="media-gallery-heading" title="Media Gallery" visuallyHidden />
              {/* ── MEDIA TOOLBAR: SEARCH, ERA, SORT, CATEGORY DROPDOWN & CMS BUTTON ── */}
              <div
                role="toolbar"
                aria-label="Media Filters"
                className="mb-6 flex flex-col gap-4"
              >
                {/* Top Row: CMS action */}
                <div className="flex flex-wrap items-center justify-end gap-3 border-b border-white/10 pb-4">

                  <AddCmsButton
                    label={sanityContent?.addVideoButtonText || "ADD VIDEO / MEDIA IN SANITY CMS"}
                    onClick={() => setIsAddModalOpen(true)}
                  />
                </div>

                {/* Main Filter & Search Control Row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <p className="mr-auto text-[13px] text-white/55" aria-live="polite">
                    {filteredVideos.length} {filteredVideos.length === 1 ? "item" : "items"}
                  </p>
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={sanityContent?.searchPlaceholder || "Search by title, category, year..."}
                    containerClassName="w-full sm:w-[260px] lg:w-[300px]"
                  />

                  {/* Sort Order Dropdown */}
                  <CustomDropdown
                    ariaLabel="Sort videos"
                    value={sortBy}
                    options={sortDropdownOptions}
                    onChange={(val) => setSortBy(val as any)}
                    minWidth={200}
                    maxHeight={320}
                    triggerPrefix={sortTriggerPrefix}
                    buttonClassName="rounded-none border border-white/15 bg-black/35 px-4 py-2.5 text-xs backdrop-blur-md shadow-[inset_0_0_10px_rgba(0,0,0,0.25)] hover:border-white/30 hover:bg-black/50"
                  />

                  <button
                    ref={filterTriggerRef}
                    type="button"
                    onClick={() => setFilterDrawerOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={filterDrawerOpen}
                    className="flex cursor-pointer items-center gap-2 border border-white/20 px-4 py-2.5 text-xs text-white transition-colors hover:border-white/50 hover:bg-white/5"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-action,#f5b942)] px-1 text-[11px] font-bold text-black">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <MediaFilterDrawer
                open={filterDrawerOpen}
                onClose={closeFilterDrawer}
                returnFocusRef={filterTriggerRef}
                categoryOptions={categoryDropdownOptions.map((o) => ({
                  value: o.value,
                  label: o.value === "ALL" ? "All" : toTitleCase(o.label),
                  count: o.value === "ALL" ? scopedForCategory.length : categoryCounts.get(o.value) || 0,
                }))}
                category={activeFilter.toUpperCase()}
                onCategoryChange={handleFilterChange}
                mediaTypeOptions={mediaTypeDrawerOptions}
                mediaType={mediaTypeFilter}
                onMediaTypeChange={(v) => {
                  setMediaTypeFilter(v as "all" | "videos" | "photos");
                  if (v === "photos") setLengthFilter("all");
                }}
                lengthOptions={lengthDrawerOptions}
                length={lengthFilter}
                onLengthChange={(v) => setLengthFilter(v as LengthKey)}
                yearBounds={yearBounds}
                yearRange={effectiveYearRange}
                onYearRangeChange={setYearRange}
                resultCount={filteredVideos.length}
                onClearAll={clearDrawerFilters}
              />

              {/* Active Filter Indicator banner if any filter is active */}
              {(activeFilterCount > 0 || sortBy !== "default" || searchQuery.trim() !== "") && (
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f2efa3]/30 bg-[#f2efa3]/10 px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#f2efa3]" />
                    <span className="text-xs font-bold tracking-wider text-[#f2efa3] uppercase">
                      Active Filters:
                    </span>
                    {activeFilter !== "ALL" && (
                      <span className="rounded-md border border-[#f2efa3]/40 bg-[#f2efa3]/20 px-2 py-0.5 text-xs font-mono font-semibold text-white">
                        Category: {activeFilter}
                      </span>
                    )}
                    {mediaTypeFilter !== "all" && (
                      <span className="rounded-md border border-white/30 bg-white/10 px-2 py-0.5 text-xs font-mono font-semibold text-white">
                        Type: {mediaTypeFilter}
                      </span>
                    )}
                    {lengthFilter !== "all" && (
                      <span className="rounded-md border border-white/30 bg-white/10 px-2 py-0.5 text-xs font-mono font-semibold text-white">
                        Length: {lengthFilter}
                      </span>
                    )}
                    {yearActive && effectiveYearRange && (
                      <span className="rounded-md border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-amber-200">
                        Years: {effectiveYearRange[0]}–{effectiveYearRange[1]}
                      </span>
                    )}
                    {sortBy !== "default" && (
                      <span className="rounded-md border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-200">
                        Sort: {sortBy}
                      </span>
                    )}
                    {searchQuery.trim() !== "" && (
                      <span className="rounded-md border border-purple-400/40 bg-purple-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-purple-200">
                        &quot;{searchQuery}&quot;
                      </span>
                    )}
                    <span className="text-xs text-white/60">
                      ({filteredVideos.length} matching {filteredVideos.length === 1 ? "video" : "videos"})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearDrawerFilters();
                      setSortBy("default");
                      setSearchQuery("");
                    }}
                    className="cursor-pointer text-xs font-semibold text-white/80 transition-colors duration-150 hover:text-white underline"
                  >
                    Reset all filters ✕
                  </button>
                </div>
              )}

              {/* =================== DYNAMIC 20-LAYOUT VIDEO SHOWCASE =================== */}
              <div className="relative mx-auto w-full">
                <VideoArchiveRenderer
                  layoutId={layoutVariant}
                  videos={paginatedVideos}
                  allVideos={filteredVideos}
                  activeCategory={activeFilter}
                  onSelectCategory={(cat) => handleFilterChange(cat)}
                  onPlayVideo={(v) => {
                    setHoveredVideoId(null);
                    setPlayingVideo(v as any);
                  }}
                  renderStandardCard={(v, isPriority) => {
                    const style = videoStyles.get(v.id) || getOrganicItemStyle(v.id, 0);
                    return renderCard(v as any, style, true, isPriority);
                  }}
                />

                {/* ── PAGINATION CONTROLS ── */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col items-center justify-center gap-5">
                    <MediaPagination
                      variant={paginationVariant}
                      page={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredVideos.length}
                      pageSize={pageSize}
                      onPageChange={(nextPage) => {
                        setCurrentPage(nextPage);
                        handleScrollToTop();
                      }}
                      label="videos"
                    />
                  </div>
                )}

                {filteredVideos.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-lg text-white/60 font-medium">
                      No videos found matching your filter
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("ALL");
                        setSearchQuery("");
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Reset all filters
                    </button>
                  </div>
                )}
              </div>
            </section>
          }
          fanWallNode={
            <section
              id="fan-media-wall"
              aria-labelledby="fan-wall-heading"
              className="relative w-full"
            >
              <div className="site-container mx-auto">
                <SectionHeader
                  id="fan-wall-heading"
                  title="Fan Media Wall & Live Concert Moments"
                  subtitle="Discover crowd photos, fan memories, and live concert footage captured by 7th Heaven fans across the country."
                />
              </div>
              <div className="mt-8 w-full px-4 sm:px-6 lg:px-8">
                <FanPhotoWallClient
                  sanityContent={fanSanityContent}
                  initialPhotos={initialFanPhotos}
                  embedMode
                />
              </div>
            </section>
          }
        />
      </div>


      {/* FULL SCREEN VIDEO MODAL */}
      {mounted &&
        playingVideo &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex h-full h-dvh w-full cursor-pointer animate-[fade-in_0.2s_ease-out] flex-col bg-black p-0"
            onClick={handleCloseVideo}
          >
            <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
              {/* Modal Header Bar */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/90 px-4 pt-safe sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-[#f2efa3]/30 bg-[#f2efa3]/20 px-3 py-1 text-xs font-bold tracking-wider text-[#f2efa3] uppercase">
                    {playingVideo.category || "7TH HEAVEN"}
                  </span>
                  <span className="line-clamp-1 text-white sm:text-lg">
                    {playingVideo.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseVideo}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Full-Screen Edge-to-Edge Video Player Stage */}
              <div className="relative flex-1 w-full h-[calc(100vh-3.5rem)] h-[calc(100dvh-3.5rem)] overflow-hidden bg-black pb-safe">
                <CustomVideoPlayer
                  videoId={playingVideo.id}
                  title={playingVideo.title}
                  hideTitle
                  onClose={handleCloseVideo}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* FULL SCREEN PHOTO LIGHTBOX MODAL */}
      {mounted &&
        selectedPhoto &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex h-full h-dvh w-full cursor-pointer animate-[fade-in_0.2s_ease-out] flex-col bg-black/95 backdrop-blur-xl p-0"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative flex h-full w-full flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Bar */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/90 px-4 pt-safe sm:px-6">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center gap-1.5 rounded-full border border-purple-400/50 bg-purple-500/20 px-3 py-1 text-xs font-mono font-bold tracking-wider text-purple-200 uppercase shrink-0">
                    <Camera className="h-3 w-3 text-purple-300" />
                    <span>PHOTO ARCHIVE</span>
                  </span>
                  <span className="line-clamp-1 text-white font-heading text-lg sm:text-xl uppercase tracking-wide">
                    {selectedPhoto.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Close photo view"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Lightbox Image Stage */}
              <div className="relative flex-1 w-full flex items-center justify-center p-4 sm:p-8 bg-black/60">
                <div className="relative max-h-full max-w-full w-auto h-auto flex items-center justify-center">
                  <Image
                    src={selectedPhoto.photoSrc || videoThumb(selectedPhoto.id)}
                    alt={selectedPhoto.title}
                    width={1600}
                    height={1000}
                    priority
                    className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
                  />
                </div>
              </div>

              {/* Bottom Metadata Bar */}
              <div className="shrink-0 border-t border-white/10 bg-black/90 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    {selectedPhoto.title}
                  </span>
                  <span className="text-xs text-white/70">
                    {selectedPhoto.description || "Official 7th Heaven Photography Archive"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-white/60">
                  {selectedPhoto.venue && (
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white/80">
                      📍 {selectedPhoto.venue}
                    </span>
                  )}
                  {selectedPhoto.city && (
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white/80">
                      {selectedPhoto.city}
                    </span>
                  )}
                  {selectedPhoto.year && (
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-emerald-300">
                      {selectedPhoto.year}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-[999999] flex items-center gap-3 rounded-[var(--radius-box)] border border-purple-500/50 bg-gradient-to-r from-purple-950 to-black px-5 py-3.5 shadow-2xl">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add Video Modal */}
      {mounted &&
        isAddModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex animate-[fade-in_0.15s_ease-out] items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-purple-500/40 bg-[#0f0921] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center border border-purple-500/40 bg-purple-500/20">
                    <VideoIcon className="h-4 w-4" />
                  </div>
                  <div>
                    {/* heading-size-ok: admin modal title */}
                    <h3 className="font-bold text-white">
                      {sanityContent?.modalTitle || "Add Video to Media Vault"}
                    </h3>
                    <p className="text-xs text-purple-300/70">
                      {sanityContent?.modalSubtitle ||
                        "Syncs to Sanity CMS & Media Hub"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-ghost cursor-pointer p-1"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <form onSubmit={handleAddVideoSubmit} className="space-y-4">
                <div>
                  <GlowInput
                    label="Video URL or ID *"
                    type="text"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Paste video link or ID..."
                    wrapperClassName="w-full"
                  />
                </div>

                {(() => {
                  const parsed = extractYouTubeId(newUrl);
                  if (parsed && parsed.length === 11) {
                    return (
                      <div className="flex items-center gap-4 rounded-[var(--radius-box)] border border-purple-500/40 bg-purple-950/40 p-3">
                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black">
                          <Image
                            src={`https://img.youtube.com/vi/${parsed}/hqdefault.jpg`}
                            alt="Thumbnail preview"
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400">Valid Video Link Detected</span>
                          </div>
                          <p className="mt-0.5 text-xs text-purple-200/80 font-mono">
                            ID: {parsed}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div>
                  <GlowInput
                    label="Video Title *"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Ain't That Just Beautiful (Official Video)"
                    wrapperClassName="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="block text-xs font-medium text-white/80">
                        Category <span className="text-pink-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(!isCustomCategory);
                          if (!isCustomCategory) {
                            setCustomCategoryInput("");
                          }
                        }}
                        className="cursor-pointer text-[10px] text-purple-400"
                      >
                        {isCustomCategory ? "← Select List" : "+ New Category"}
                      </button>
                    </div>

                    {isCustomCategory ? (
                      <GlowInput
                        type="text"
                        required
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="e.g. Acoustic Sessions"
                        wrapperClassName="w-full"
                      />
                    ) : (
                      <GlowSelect
                        value={newCategory}
                        onChange={(e: any) => {
                          const val = typeof e === "string" ? e : e.target.value;
                          if (val === "__CUSTOM__") {
                            setIsCustomCategory(true);
                            setCustomCategoryInput("");
                          } else {
                            setNewCategory(val);
                          }
                        }}
                        wrapperClassName="w-full"
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__CUSTOM__">
                          ✨ + Add Custom Category...
                        </option>
                      </GlowSelect>
                    )}
                  </div>

                  <div>
                    <GlowInput
                      label="Release Year"
                      type="number"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      placeholder="2026"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>

                <div>
                  <GlowTextarea
                    label="Description / Notes (Optional)"
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g. Filmed live at Frontier Days..."
                    wrapperClassName="w-full"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="transition-colors cursor-pointer text-xs text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="transition-colors flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                  >
                    {submitting
                      ? sanityContent?.modalSavingText || "Saving to Sanity..."
                      : sanityContent?.modalSubmitText ||
                      "+ PUBLISH VIDEO TO SANITY"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
