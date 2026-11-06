/* eslint-disable react-doctor/prefer-html-dialog */
"use client";

/**
 * Lets you browse every clip on the site and use one as the page background.
 * Thumbnails load only as they scroll into view, because there are about 100 clips.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BACKDROP_EVENT_KEY,
  BACKDROP_STORAGE_KEY,
  DEFAULT_BACKDROP_SETTINGS,
  VIDEO_LOOP_PRESETS,
} from "@/components/GlobalVideoBackdrop";

interface Clip {
  src: string;
  title: string;
  group: string;
}

const SITE_CLIPS: Clip[] = [
  ...VIDEO_LOOP_PRESETS.map((p) => ({ src: p.videoSrc, title: p.title, group: "Background loops" })),
  ...[
    ["band-loop-v1.webm", "Band Loop"],
    ["be-here-clip.mp4", "Be Here"],
    ["color-in-motion-clip.mp4", "Color in Motion"],
    ["hero-colorinmostion.mp4", "Color in Motion (hero)"],
    ["cruise-desktop.mp4", "Cruise"],
    ["fest1-clip.mp4", "Festival"],
    ["luminous-clip.mp4", "Luminous"],
    ["luminous.mp4", "Luminous (full)"],
    ["next.mp4", "Next"],
  ].map(([file, title]) => ({ src: `/movie/${file}`, title, group: "Site clips" })),
];

interface VideoCategory {
  category: string;
  videos: { id: string; title: string }[];
}

function Thumbnail({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          watcher.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    watcher.observe(el);
    return () => watcher.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={near ? `${src}#t=0.5` : undefined}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      className="block aspect-video w-full bg-black object-cover"
      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
      onMouseLeave={(e) => e.currentTarget.pause()}
    />
  );
}

export default function BackdropVideoPicker({ onClose }: { onClose: () => void }) {
  const [clips, setClips] = useState<Clip[]>(SITE_CLIPS);
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState("");

  useEffect(() => {
    const playing = document.querySelectorAll<HTMLVideoElement>('video[class*="backdrop-video-crossfade"]');
    const last = playing[playing.length - 1];
    if (last) setCurrent(new URL(last.currentSrc || last.src, location.href).pathname);

    let cancelled = false;
    Promise.all([
      fetch("/data/videos.json").then((r) => (r.ok ? (r.json() as Promise<VideoCategory[]>) : Promise.resolve([]))),
      fetch("/data/available-previews.json").then((r) => (r.ok ? (r.json() as Promise<string[]>) : Promise.resolve([]))),
    ])
      .then(([categories, available]) => {
        if (cancelled) return;
        const ready = new Set(available);
        const seen = new Set<string>();
        const library: Clip[] = [];
        categories.forEach((c) =>
          c.videos.forEach((v) => {
            if (!ready.has(v.id) || seen.has(v.id)) return;
            seen.add(v.id);
            library.push({ src: `/movie/previews/${v.id}.mp4`, title: v.title, group: c.category });
          }),
        );
        setClips([...SITE_CLIPS, ...library]);
      })
      .catch(() => {
        // the video library is unavailable: the site clips are still listed
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const choose = (src: string) => {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(BACKDROP_STORAGE_KEY) || "{}");
    } catch {
      // unreadable saved settings: start from the defaults
    }
    const next = { ...DEFAULT_BACKDROP_SETTINGS, ...saved, videoSrc: src };
    try {
      localStorage.setItem(BACKDROP_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable: the choice lasts for this visit
    }
    window.dispatchEvent(new CustomEvent(BACKDROP_EVENT_KEY, { detail: next }));
    setCurrent(src);
  };

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const map = new Map<string, Clip[]>();
    clips
      .filter((c) => !query || c.title.toLowerCase().includes(query))
      .forEach((c) => map.set(c.group, [...(map.get(c.group) ?? []), c]));
    return [...map.entries()];
  }, [clips, search]);

  return (
    <div
      role="dialog"
      aria-label="Choose a background video"
      data-lenis-prevent="true"
      className="fixed bottom-8 left-[200px] z-[999999] flex max-h-[80vh] w-[min(760px,calc(100vw-216px))] flex-col overflow-hidden rounded-xl border border-white/25 bg-[#100e14]/95 text-white backdrop-blur-md max-sm:left-2 max-sm:w-[calc(100vw-16px)]"
    >
      <div className="flex items-center gap-2 border-b border-white/15 p-3">
        <h2 className="m-0 mr-auto font-sans text-sm font-bold">Background videos ({clips.length})</h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search titles"
          aria-label="Search video titles"
          className="w-40 rounded border border-white/25 bg-transparent px-2 py-1 text-xs text-white"
        />
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded border border-white/25 bg-transparent px-2 py-1 text-xs text-white hover:border-[#f5b942]"
        >
          Close
        </button>
      </div>
      <div className="overflow-y-auto p-3">
        {groups.length === 0 && <p className="m-0 text-sm text-white/80">No videos match that search.</p>}
        {groups.map(([group, list]) => (
          <section key={group} className="mb-4">
            <h3 className="m-0 mb-2 font-sans text-xs font-bold text-[#fffbb5]">{group}</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {list.map((clip) => (
                <button
                  key={clip.src}
                  type="button"
                  aria-pressed={current === clip.src}
                  onClick={() => choose(clip.src)}
                  className={`cursor-pointer overflow-hidden rounded-md border-2 bg-transparent p-0 text-left text-white ${current === clip.src ? "border-[#f5b942]" : "border-transparent hover:border-white/50"}`}
                >
                  <Thumbnail src={clip.src} />
                  <span className="block truncate px-1 py-1 text-[11px]">{clip.title}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
