/* eslint-disable react-doctor/exhaustive-deps, react-doctor/effect-needs-cleanup, react-doctor/effect-raf-loop-needs-cancel, react-doctor/html-label-has-single-control, react-doctor/no-noninteractive-element-interactions */
"use client";

/**
 * Test page: projects made of two rows of three images on one WebGL canvas, in a free-scrolling
 * loop. Rows shrink and dim as they rise, and the whole field bends with scroll speed. A big header
 * band collapses into a pill menu. Every setting is live in the Controls panel.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORIES_DATA } from "@/components/media/PartnershipsMediaVault";
import { getProductsList } from "@/app/rock-and-roll-kids/RockNRollKidsClient";
import TileOpener, { type TileRect } from "./TileOpener";
import "./scroll-rows.css";

interface Tile {
  title: string;
  label: string;
  image: string;
  youtubeId?: string;
  href?: string;
  contain?: boolean;
}
interface Project {
  name: string;
  tiles: Tile[];
}

/* Hover frost style (Purple Frost).
   radius (share of tile), jitter, grain, grainSize, saturation, brightness, stretchX, stretchY,
   tint rgb + amount, ripple, rippleSize, reedX, reedY, cells, live grain, bloom */
const F = (name: string, o: Partial<Omit<Frost, "name">> = {}): Frost => ({
  name, radius: 0.09, jitter: 1, grain: 0.05, grainSize: 1.5, saturation: 1, brightness: 0.8, stretchX: 1, stretchY: 1,
  tint: [0.05, 0.04, 0.09], tintAmount: 0, ripple: 0, rippleSize: 12, reedX: 0, reedY: 0, cells: 0, live: false, bloom: 0, ...o,
});
interface Frost {
  name: string; radius: number; jitter: number; grain: number; grainSize: number; saturation: number; brightness: number;
  stretchX: number; stretchY: number; tint: [number, number, number]; tintAmount: number; ripple: number; rippleSize: number;
  reedX: number; reedY: number; cells: number; live: boolean; bloom: number;
}
const PURPLE_FROST: Frost = F("Purple Frost", {
  radius: 0.11,
  tint: [0.3, 0.1, 0.62],
  tintAmount: 0.42,
  grain: 0.07,
});

const WIDE = 1.54;
const ROW_PATTERNS = [
  [WIDE, 1, 1],
  [1, 1, WIDE],
];

const DEFAULTS = {
  wheel: 2.5,
  ease: 0.08,
  flare: 1,
  curl: 1,
  shrink: 1,
  dim: 0.6,
  margin: 2.5,
  tileGap: 1,
  projectGap: 0,
  radius: 10,
  background: false,
  clips: true,
  marquee: true,
  followCursor: true,
  mosaic: false,
  snap: false,
};
type Params = typeof DEFAULTS;
type NumKey = { [K in keyof Params]: Params[K] extends number ? K : never }[keyof Params];
type BoolKey = { [K in keyof Params]: Params[K] extends boolean ? K : never }[keyof Params];

const SLIDERS: { key: NumKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: "wheel", label: "Scroll speed", min: 0.5, max: 5, step: 0.1 },
  { key: "ease", label: "Scroll smoothing", min: 0.02, max: 0.3, step: 0.005 },
  { key: "flare", label: "Bend amount", min: 0, max: 3, step: 0.05 },
  { key: "curl", label: "Corner lag", min: 0, max: 4, step: 0.05 },
  { key: "shrink", label: "Top row shrink", min: 0, max: 3, step: 0.05 },
  { key: "dim", label: "Top row dim", min: 0, max: 1, step: 0.01 },
  { key: "margin", label: "Side margin", min: 0, max: 12, step: 0.1, unit: "%" },
  { key: "tileGap", label: "Tile gap", min: 0, max: 4, step: 0.05, unit: "%" },
  { key: "projectGap", label: "Project gap", min: 0, max: 70, step: 0.5, unit: "%" },
  { key: "radius", label: "Corner radius", min: 0, max: 40, step: 1, unit: "px" },
];
const TOGGLES: { key: BoolKey; label: string }[] = [
  { key: "background", label: "Flat dark background" },
  { key: "clips", label: "Play clips in view" },
  { key: "marquee", label: "Scrolling tag text" },
  { key: "followCursor", label: "Tag follows cursor" },
  { key: "mosaic", label: "Pixel mosaic reveal" },
  { key: "snap", label: "Snap to rows" },
];
const LAYOUT_KEYS: (keyof Params)[] = ["margin", "tileGap", "projectGap"];
const STORE = "srt-controls-v3";
const NAV_LOOKS = [
  "Side Line", "Numbered", "Filled Pill", "Stacked Cards", "Small Thumbnails",
  "Big Anton", "Right Aligned", "Dot Rail", "Glass Panel", "Tiny Caps",
  "Active Grows", "Spotlight", "Image Cards", "Two Columns", "Arrow Marker",
  "Number Badges", "Edge Tab", "Divider Rows", "Timeline", "Script",
];
const NAV_STORE = "srt-nav-look";

/* Every media category that has enough local images to fill its two rows */
function buildCategories(): Project[] {
  return CATEGORIES_DATA.flatMap((row) => {
    const cards = row.items.filter((c) => c.src.startsWith("/"));
    if (cards.length < 6) return [];
    return [
      {
        name: row.title,
        tiles: cards.slice(0, 6).map((c) => ({
          title: c.title,
          label: [c.title, c.year, c.duration].filter(Boolean).join(" • "),
          image: c.src,
          youtubeId: c.youtubeId,
        })),
      },
    ];
  });
}

function buildProjects(): Project[] {
  const rows: Project[] = [];
  CATEGORIES_DATA.filter((r) => r.categoryType === "video").forEach((row) => {
    const cards = row.items.filter((c) => c.youtubeId && c.src.startsWith("/"));
    if (cards.length < 6) return;
    rows.push({
      name: row.title,
      tiles: cards.slice(0, 6).map((c) => ({
        title: c.title,
        label: [c.title, c.year, c.duration].filter(Boolean).join(" • "),
        image: c.src,
        youtubeId: c.youtubeId,
      })),
    });
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comics: any[] = getProductsList(null);
  [0, 6].forEach((start, i) => {
    const set = comics.slice(start, start + 6);
    if (set.length < 6) return;
    rows.splice(1 + i * 3, 0, {
      name: i === 0 ? "Comic Books" : "More Comic Books",
      tiles: set.map((c) => ({
        title: c.title,
        label: `${c.title} • ${c.badge} • Buy on Amazon`,
        image: c.coverImg,
        href: c.amazonUrl,
        contain: true,
      })),
    });
  });
  return rows;
}

const VERT = /* glsl */ `
  uniform vec2 uCenter;
  uniform vec2 uSize;
  uniform vec2 uView;
  uniform float uScale;
  uniform float uVel;
  uniform float uFlare;
  uniform float uCurl;
  varying vec2 vUv;
  vec2 warp(vec2 p) {
    float yn = p.y / uView.y;
    float xn = p.x / (uView.x * 0.5);
    float a = abs(uVel) * uFlare;
    float low = max(yn, 0.0);
    float sx = 1.0 + a * (0.26 * yn + 0.4 * low * low);
    float sy = 1.0 + a * 0.26 * yn;
    return vec2(p.x * sx, p.y * sy + uVel * uCurl * 0.012 * uView.y * xn * xn);
  }
  void main() {
    vUv = uv;
    vec2 p = warp(uCenter + vec2(position.x, -position.y) * uSize * uScale);
    gl_Position = vec4(p.x / (uView.x * 0.5), -p.y / (uView.y * 0.5), 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uVideo;
  uniform vec2 uSize;
  uniform float uRadius;
  uniform float uImageAspect;
  uniform float uVideoAspect;
  uniform float uLoaded;
  uniform float uMix;
  uniform float uReveal;
  uniform float uSeed;
  uniform float uDim;
  uniform float uContain;
  uniform float uBlur;
  uniform vec4 uFrostA, uFrostB, uFrostC, uFrostD, uFrostE;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453); }
  vec2 fit(vec2 uv, float a, float contain) {
    float c = uSize.x / uSize.y;
    bool wider = contain > 0.5 ? c < a : c > a;
    vec2 s = wider ? vec2(1.0, a / c) : vec2(c / a, 1.0);
    return (uv - 0.5) * s + 0.5;
  }
  vec3 picture(vec2 uv) {
    vec3 col = vec3(0.006, 0.005, 0.005);
    if (uLoaded > 0.5) {
      vec2 tuv = fit(uv, uImageAspect, uContain);
      if (tuv.x >= 0.0 && tuv.x <= 1.0 && tuv.y >= 0.0 && tuv.y <= 1.0) col = texture2D(uMap, tuv).rgb;
    }
    if (uMix > 0.001) col = mix(col, texture2D(uVideo, fit(uv, uVideoAspect, 0.0)).rgb, uMix);
    return col;
  }
  float noise2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  /* Hover frost. Samples spiral outward, each pixel turning the spiral by its own random
     amount, so instead of doubled edges the blur breaks into fine frost. */
  vec3 frosted() {
    vec2 px = 1.0 / uSize;
    vec2 uv = vUv;
    vec2 p = vUv * uSize;
    if (uFrostE.x > 0.0) {
      vec2 id = floor(p / uFrostE.x);
      uv += (vec2(noise2(id), noise2(id + 3.1)) - 0.5) * uFrostE.x * 1.3 * px * uBlur;
    }
    if (uFrostD.x > 0.0) {
      uv += vec2(sin(p.y / uFrostD.y + sin(p.x / (uFrostD.y * 1.7))), cos(p.x / uFrostD.y + sin(p.y / (uFrostD.y * 1.3)))) * uFrostD.x * px * uBlur;
    }
    if (uFrostD.z > 0.0) uv.x += (fract(p.x / uFrostD.z) - 0.5) * uFrostD.z * 1.5 * px.x * uBlur;
    if (uFrostD.w > 0.0) uv.y += (fract(p.y / uFrostD.w) - 0.5) * uFrostD.w * 1.5 * px.y * uBlur;

    float radius = uBlur * uFrostA.x * min(uSize.x, uSize.y);
    float turn = noise2(gl_FragCoord.xy + uFrostE.y) * 6.2832 * uFrostA.y;
    vec3 col = vec3(0.0);
    for (int i = 0; i < 32; i++) {
      float n = float(i) + 0.5;
      float a = n * 2.39996 + turn;
      vec2 off = vec2(cos(a), sin(a)) * sqrt(n / 32.0) * radius * uFrostB.zw * px;
      col += picture(clamp(uv + off, 0.001, 0.999));
    }
    col /= 32.0;

    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 graded = mix(vec3(lum), col, uFrostB.x) * uFrostB.y;
    graded += max(graded - 0.4, 0.0) * uFrostE.z;
    graded = mix(graded, uFrostC.rgb, uFrostC.a);
    float g = noise2(floor(p / uFrostA.w) + uFrostE.y * 0.37) - 0.5;
    graded += g * uFrostA.z;
    return mix(col, graded, uBlur);
  }
  void main() {
    vec2 q = abs(vUv - 0.5) * uSize - (uSize * 0.5 - uRadius);
    float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
    // Soften the edge fully inside the tile, so the shape never gets cut by the mesh's own hard edge.
    // Measured in screen pixels, so it holds while the tile bends and scales.
    float aa = max(fwidth(dist), 0.001);
    float alpha = 1.0 - smoothstep(-aa * 2.0, 0.0, dist);
    vec3 col = uBlur > 0.003 ? frosted() : picture(vUv);
    if (uReveal < 0.999) {
      float cs = uSize.x / 11.0;
      vec2 cell = floor(vUv * uSize / cs);
      if (hash(cell) > uReveal) {
        float pick = hash(cell + 7.0);
        vec3 a = pick < 0.34 ? vec3(0.39, 0.09, 0.93) : pick < 0.67 ? vec3(0.91, 0.49, 0.05) : vec3(1.0, 0.96, 0.46);
        col = hash(cell + 3.0) < 0.6 ? a : col;
      }
    }
    gl_FragColor = vec4(col * uDim, alpha);
    #include <colorspace_fragment>
  }
`;

function loadParams(store: string, defaults: Params): Params {
  try {
    const raw = localStorage.getItem(store);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    // storage unavailable: use defaults
  }
  return { ...defaults };
}

/* "elevate" is the media test page: real categories, and the tag text stays put at the bottom */
export default function ScrollRowsClient({ variant = "rows" }: { variant?: "rows" | "elevate" }) {
  const elevate = variant === "elevate";
  const store = elevate ? "srt-elevate-controls-v2" : STORE;
  const defaults = useMemo<Params>(
    () => (elevate ? { ...DEFAULTS, followCursor: false } : DEFAULTS),
    [elevate],
  );
  const projects = useMemo(() => (elevate ? buildCategories() : buildProjects()), [elevate]);
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(!elevate);
  const [playing, setPlaying] = useState<Tile | null>(null);
  const [opened, setOpened] = useState<{ tile: Tile; rect: TileRect; time: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [navLook, setNavLook] = useState(0);
  const chooseNavLook = (i: number) => {
    setNavLook(i);
    try {
      localStorage.setItem(NAV_STORE, String(i));
    } catch {
      // storage unavailable: the choice lasts for this visit
    }
  };
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(NAV_STORE));
      if (saved >= 0 && saved < NAV_LOOKS.length) setNavLook(saved);
    } catch {
      // storage unavailable: start with the first layout
    }
  }, []);
  const closeOpened = useCallback(() => {
    setOpened(null);
    setRevealed(false);
  }, []);
  const revealOpened = useCallback(() => setRevealed(true), []);
  const [params, setParams] = useState<Params>(defaults);
  const [copied, setCopied] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const captionsRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const paramsRef = useRef<Params>(defaults);
  const jumpRef = useRef<(project: number) => void>(() => {});
  const applyRef = useRef<(relayout: boolean) => void>(() => {});

  useEffect(() => {
    const loaded = loadParams(store, defaults);
    paramsRef.current = loaded;
    setParams(loaded);
    setMounted(true);
  }, []);

  const change = useCallback((next: Partial<Params>) => {
    const merged = { ...paramsRef.current, ...next };
    const relayout = LAYOUT_KEYS.some((k) => merged[k] !== paramsRef.current[k]);
    paramsRef.current = merged;
    setParams(merged);
    applyRef.current(relayout);
    try {
      localStorage.setItem(store, JSON.stringify(merged));
    } catch {
      // storage unavailable: settings last for this visit
    }
  }, []);

  const copyValues = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(paramsRef.current, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (playing && !d.open) d.showModal();
    if (!playing && d.open) d.close();
  }, [playing]);

  const tagText = useMemo(
    () => (projects[current]?.tiles ?? []).map((t) => t.title).join("  •  "),
    [projects, current],
  );

  useEffect(() => {
    if (!mounted) return;
    const stage = stageRef.current;
    const host = hostRef.current;
    const tag = tagRef.current;
    const band = bandRef.current;
    const pill = pillRef.current;
    if (!stage || !host || !tag || !band || !pill) return;
    let cancelled = false;
    let cleanup = () => {};

    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    (async () => {
      const THREE = await import("three");
      if (cancelled) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const view = new THREE.Vector2(1, 1);
      const vel = { value: 0 };
      const frostU = {
        a: { value: new THREE.Vector4() },
        b: { value: new THREE.Vector4() },
        c: { value: new THREE.Vector4() },
        d: { value: new THREE.Vector4() },
        e: { value: new THREE.Vector4() },
      };
      let frostLive = false;
      const setFrost = (f: Frost) => {
        frostU.a.value.set(f.radius, f.jitter, f.grain, f.grainSize);
        frostU.b.value.set(f.saturation, f.brightness, f.stretchX, f.stretchY);
        frostU.c.value.set(f.tint[0], f.tint[1], f.tint[2], f.tintAmount);
        frostU.d.value.set(f.ripple, f.rippleSize, f.reedX, f.reedY);
        frostU.e.value.set(f.cells, 0, f.bloom, 0);
        frostLive = f.live;
      };
      setFrost(PURPLE_FROST);
      const flare = { value: paramsRef.current.flare };
      const curl = { value: paramsRef.current.curl };
      const radius = { value: paramsRef.current.radius };

      const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
      blank.needsUpdate = true;

      // One small pool of preview players, handed to the tiles of the project in view
      const pool = Array.from({ length: 6 }, () => {
        const el = document.createElement("video");
        el.muted = true;
        el.loop = true;
        el.playsInline = true;
        const texture = new THREE.VideoTexture(el);
        texture.colorSpace = THREE.SRGBColorSpace;
        const slot = { el, texture, ready: false };
        el.addEventListener("playing", () => { slot.ready = true; });
        return slot;
      });

      const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
      const loader = new THREE.TextureLoader();
      const textures: import("three").Texture[] = [];

      type Item = {
        mesh: import("three").Mesh;
        material: import("three").ShaderMaterial;
        captionEl: HTMLDivElement;
        tile: Tile;
        line: number;
        ox: number;
        w: number;
        h: number;
        first: boolean;
        requested: boolean;
        slot: number;
      };
      let items: Item[] = [];
      let lines: { center: number; top: number; h: number; project: number }[] = [];
      let total = 1;
      let W = 1;
      let H = 1;

      const layout = () => {
        items.forEach((it) => {
          scene.remove(it.mesh);
          it.material.dispose();
          it.captionEl.remove();
        });
        items = [];
        lines = [];
        W = host.clientWidth;
        H = host.clientHeight;
        renderer.setSize(W, H);
        view.set(W, H);
        const p = paramsRef.current;
        const single = W < 700;
        const gap = (W * p.tileGap) / 100;
        const captionSpace = 32;
        const rowGap = gap + captionSpace;
        const availW = W * (1 - (2 * p.margin) / 100);
        const projectGap = (H * p.projectGap) / 100 + rowGap;
        let y = 0;
        const captionsHost = captionsRef.current;
        const addLine = (project: number, tiles: Tile[], aspects: number[], after: number) => {
          const sum = aspects.reduce((a, b) => a + b, 0);
          const h = (availW - gap * (tiles.length - 1)) / sum;
          let x = -availW / 2;
          tiles.forEach((tile, i) => {
            const w = h * aspects[i];
            const material = new THREE.ShaderMaterial({
              vertexShader: VERT,
              fragmentShader: FRAG,
              transparent: true,
              uniforms: {
                uCenter: { value: new THREE.Vector2() },
                uSize: { value: new THREE.Vector2(w, h) },
                uView: { value: view },
                uVel: vel,
                uFlare: flare,
                uCurl: curl,
                uRadius: radius,
                uScale: { value: 1 },
                uDim: { value: 1 },
                uBlur: { value: 0 },
                uFrostA: frostU.a,
                uFrostB: frostU.b,
                uFrostC: frostU.c,
                uFrostD: frostU.d,
                uFrostE: frostU.e,
                uMap: { value: blank },
                uVideo: { value: blank },
                uImageAspect: { value: 16 / 9 },
                uVideoAspect: { value: 16 / 9 },
                uLoaded: { value: 0 },
                uMix: { value: 0 },
                uReveal: { value: 1 },
                uSeed: { value: lines.length * 3.7 },
                uContain: { value: tile.contain ? 1 : 0 },
              },
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.frustumCulled = false;
            scene.add(mesh);

            const captionEl = document.createElement("div");
            captionEl.className = "srt-caption";
            const titleSpan = document.createElement("span");
            titleSpan.className = "srt-caption-title";
            titleSpan.textContent = tile.title;
            captionEl.appendChild(titleSpan);
            if (tile.label) {
              const metaSpan = document.createElement("span");
              metaSpan.className = "srt-caption-meta";
              metaSpan.textContent = tile.label;
              captionEl.appendChild(metaSpan);
            }
            captionsHost?.appendChild(captionEl);

            items.push({
              mesh,
              material,
              captionEl,
              tile,
              line: lines.length,
              ox: x + w / 2,
              w,
              h,
              first: i === 0,
              requested: false,
              slot: -1,
            });
            x += w + gap;
          });
          lines.push({ center: y + h / 2, top: y, h, project });
          y += h + after;
        };
        projects.forEach((proj, pi) => {
          if (single) {
            proj.tiles.forEach((t, i) => addLine(pi, [t], [1.25], i === proj.tiles.length - 1 ? projectGap : rowGap));
          } else {
            addLine(pi, proj.tiles.slice(0, 3), ROW_PATTERNS[0], rowGap);
            addLine(pi, proj.tiles.slice(3, 6), ROW_PATTERNS[1], projectGap);
          }
        });
        total = y;
      };

      const startOffset = () => (elevate ? H * 0.39 : W < 700 ? H * 0.35 : H * 0.31);
      let scroll = 0;
      let target = 0;
      let lastInput = 0;
      layout();
      scroll = target = startOffset();

      applyRef.current = (relayout) => {
        const p = paramsRef.current;
        flare.value = p.flare;
        curl.value = p.curl;
        radius.value = p.radius;
        if (relayout) {
          const frac = target / total;
          layout();
          scroll = target = frac * total;
        }
        if (!p.clips) releaseClips();
      };

      const wrap = (v: number) => {
        const m = ((v % total) + total) % total;
        return m > total / 2 ? m - total : m;
      };
      const warp = (px: number, py: number) => {
        const yn = py / H;
        const xn = px / (W * 0.5);
        const a = Math.abs(vel.value) * flare.value;
        const low = Math.max(yn, 0);
        return [
          px * (1 + a * (0.26 * yn + 0.4 * low * low)) + W / 2,
          py * (1 + a * 0.26 * yn) + vel.value * curl.value * 0.012 * H * xn * xn + H / 2,
        ];
      };
      const nearestLine = () => {
        let best = 0;
        let bestD = Infinity;
        lines.forEach((l, i) => {
          const d = Math.abs(wrap(l.center - target));
          if (d < bestD) { bestD = d; best = i; }
        });
        return best;
      };

      jumpRef.current = (project) => {
        const l = lines.find((x) => x.project === project);
        if (l) target += wrap(l.top + startOffset() - target);
      };

      let clipProject = -1;
      const releaseClips = () => {
        clipProject = -1;
        items.forEach((it) => { it.slot = -1; });
        pool.forEach((s) => {
          s.ready = false;
          s.el.pause();
        });
      };
      const assignClips = (project: number) => {
        if (project === clipProject) return;
        releaseClips();
        clipProject = project;
        items
          .filter((it) => lines[it.line].project === project && it.tile.youtubeId)
          .slice(0, pool.length)
          .forEach((it, i) => {
            it.slot = i;
            it.material.uniforms.uVideo.value = pool[i].texture;
            pool[i].el.src = `/movie/previews/${it.tile.youtubeId}.mp4`;
            pool[i].el.play().catch(() => {});
          });
      };

      let pointerX = -1;
      let pointerY = -1;
      const hit = (): Item | null => {
        if (pointerX < 0) return null;
        for (const it of items) {
          if (!it.mesh.visible) continue;
          const u = it.material.uniforms;
          const s = u.uScale.value as number;
          const c = u.uCenter.value;
          const hw = (it.w * s) / 2;
          const hh = (it.h * s) / 2;
          const q = [
            warp(c.x - hw, c.y - hh),
            warp(c.x + hw, c.y - hh),
            warp(c.x + hw, c.y + hh),
            warp(c.x - hw, c.y + hh),
          ];
          let inside = true;
          for (let k = 0; k < 4 && inside; k++) {
            const [ax, ay] = q[k];
            const [bx, by] = q[(k + 1) % 4];
            if ((bx - ax) * (pointerY - ay) - (by - ay) * (pointerX - ax) < 0) inside = false;
          }
          if (inside) return it;
        }
        return null;
      };

      const overUi = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.(".srt-panel, .srt-list");
      const onWheel = (e: WheelEvent) => {
        if (overUi(e.target)) return;
        e.preventDefault();
        target += e.deltaY * (e.deltaMode === 1 ? 24 : 1) * paramsRef.current.wheel;
        lastInput = performance.now();
      };
      let drag: { y: number; start: number; moved: boolean } | null = null;
      const onDown = (e: PointerEvent) => {
        drag = { y: e.clientY, start: target, moved: false };
        host.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        if (e.pointerType === "mouse") { pointerX = e.clientX - r.left; pointerY = e.clientY - r.top; }
        if (!drag) return;
        const dy = e.clientY - drag.y;
        if (Math.abs(dy) > 6) drag.moved = true;
        if (drag.moved) { target = drag.start - dy * 1.4; lastInput = performance.now(); }
      };
      const onUp = (e: PointerEvent) => {
        const wasClick = drag && !drag.moved;
        drag = null;
        if (!wasClick) return;
        const r = host.getBoundingClientRect();
        pointerX = e.clientX - r.left;
        pointerY = e.clientY - r.top;
        const it = hit();
        if (e.pointerType !== "mouse") pointerX = -1;
        if (!it) return;
        if (it.tile.href) window.open(it.tile.href, "_blank", "noopener,noreferrer");
        else if (elevate) {
          const u = it.material.uniforms;
          const s = u.uScale.value as number;
          const c = u.uCenter.value;
          const hw = (it.w * s) / 2;
          const hh = (it.h * s) / 2;
          const corners = [warp(c.x - hw, c.y - hh), warp(c.x + hw, c.y + hh)];
          // The full-screen copy picks up the clip exactly where this tile is
          const playingClip = it.slot >= 0 ? pool[it.slot] : null;
          setOpened({
            tile: it.tile,
            time: playingClip?.ready ? playingClip.el.currentTime : 0,
            rect: {
              x: r.left + corners[0][0],
              y: r.top + corners[0][1],
              w: corners[1][0] - corners[0][0],
              h: corners[1][1] - corners[0][1],
            },
          });
        } else setPlaying(it.tile);
      };
      const onLeave = () => { pointerX = -1; };
      const onKey = (e: KeyboardEvent) => {
        if (document.querySelector("dialog[open]") || overUi(e.target)) return;
        const step = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : e.key === "ArrowUp" || e.key === "PageUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        target += step * H * 0.45;
      };
      const onResize = () => {
        const frac = target / total;
        layout();
        scroll = target = frac * total;
        releaseClips();
      };
      stage.addEventListener("wheel", onWheel, { passive: false });
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerup", onUp);
      host.addEventListener("pointerleave", onLeave);
      window.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);

      let raf = 0;
      let last = scroll;
      let shownProject = -1;
      let snapDone = false;
      let tagX = -1;
      let tagY = -1;
      let bandOn: boolean | null = null;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const p = paramsRef.current;

        if (p.snap) {
          const idle = now - lastInput > 160 && !drag;
          if (idle && !snapDone) {
            target += wrap(lines[nearestLine()].center - target);
            snapDone = true;
          }
          if (!idle) snapDone = false;
        }

        scroll = reduced ? target : scroll + (target - scroll) * p.ease;
        const speed = (scroll - last) / H;
        last = scroll;
        const v = Math.max(-1.8, Math.min(1.8, speed * 10));
        vel.value = reduced ? 0 : vel.value + (v - vel.value) * 0.14;

        items.forEach((it) => {
          const y = wrap(lines[it.line].center - scroll);
          const u = it.material.uniforms;
          const yn = y / H;
          // shrink and dim are per row, so a row keeps straight sides at rest
          const rise = Math.max(0, -yn - 0.06);
          const s = 1 - 0.2 * p.shrink * rise;
          u.uScale.value = s;
          u.uCenter.value.set(it.ox * s, y);
          const t = Math.max(0, Math.min(1, (yn + 0.3) / 0.23));
          const eased = t * t * (3 - 2 * t);
          u.uDim.value = 1 - p.dim * (1 - eased);
          it.mesh.visible = yn > -1.1 && yn < 1.1;
          if (it.mesh.visible) {
            const hw = (it.w * s) / 2;
            const hh = (it.h * s) / 2;
            const [x0, y0] = warp(it.ox * s - hw, y + hh);
            const [x1, y1] = warp(it.ox * s + hw, y + hh);
            const cw = Math.max(0, x1 - x0);
            const cy = (y0 + y1) * 0.5 + 8;
            it.captionEl.style.display = "flex";
            it.captionEl.style.transform = `translate3d(${x0.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
            it.captionEl.style.width = `${cw.toFixed(1)}px`;
            it.captionEl.style.opacity = String(u.uDim.value);
          } else {
            it.captionEl.style.display = "none";
          }
          if (!it.requested && Math.abs(yn) < 2) {
            it.requested = true;
            loader.load(it.tile.image, (tex) => {
              if (cancelled) { tex.dispose(); return; }
              tex.colorSpace = THREE.SRGBColorSpace;
              textures.push(tex);
              const img = tex.image as HTMLImageElement;
              u.uMap.value = tex;
              u.uImageAspect.value = img.width / img.height;
              u.uLoaded.value = 1;
            });
          }
          u.uReveal.value = p.mosaic && it.first && !reduced ? Math.max(0, Math.min(1, (0.6 - yn) / 0.42)) : 1;
          const slot = it.slot >= 0 ? pool[it.slot] : null;
          const live = !!slot?.ready;
          u.uMix.value += ((live ? 1 : 0) - u.uMix.value) * 0.08;
          if (slot && live && slot.el.videoWidth) u.uVideoAspect.value = slot.el.videoWidth / slot.el.videoHeight;
        });

        // The menu switches once a project reaches the middle of the screen
        let project = shownProject < 0 ? 0 : shownProject;
        let best = Infinity;
        lines.forEach((l) => {
          const d = Math.abs(wrap(l.top - scroll) - H * -0.05);
          if (d < best) { best = d; project = l.project; }
        });
        if (project !== shownProject) {
          shownProject = project;
          setCurrent(project);
        }
        if (p.clips && !reduced && Math.abs(vel.value) < 0.25) assignClips(project);

        // Header band scrolls away with the first rows, then the pill takes over
        const off = wrap(scroll - startOffset());
        const bandH = band.offsetHeight;
        const showBand = off > -1 && off < bandH;
        if (showBand) band.style.transform = `translate3d(0, ${-off}px, 0)`;
        if (showBand !== bandOn) {
          bandOn = showBand;
          band.style.visibility = showBand ? "visible" : "hidden";
        }
        pill.dataset.on = off > -1 && off < bandH * 0.6 ? "false" : "true";

        // Tag rests bottom-center and follows the mouse
        const tw = tag.offsetWidth;
        const th = tag.offsetHeight;
        const follow = p.followCursor && pointerX >= 0;
        const gx = follow ? pointerX + 14 : (W - tw) / 2;
        const gy = follow ? pointerY + 16 : H - th - H * 0.04;
        tagX = tagX < 0 ? gx : tagX + (gx - tagX) * 0.14;
        tagY = tagY < 0 ? gy : tagY + (gy - tagY) * 0.14;
        tag.style.transform = `translate3d(${Math.min(tagX, W - tw - 8)}px, ${Math.min(tagY, H - th - 8)}px, 0)`;

        const hovered = hit();
        host.style.cursor = hovered ? "pointer" : "";
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        applyRef.current = () => {};
        stage.removeEventListener("wheel", onWheel);
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerup", onUp);
        host.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        pool.forEach((s) => {
          s.el.pause();
          s.el.removeAttribute("src");
          s.el.load();
          s.texture.dispose();
        });
        blank.dispose();
        textures.forEach((t) => t.dispose());
        items.forEach((it) => {
          it.material.dispose();
          it.captionEl.remove();
        });
        geometry.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [mounted, projects]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={stageRef}
      className={`srt${elevate ? " srt--elevate" : ""}${params.background ? " srt--dark" : ""}${params.marquee ? " srt--marquee" : ""}`}
      data-lenis-prevent
      data-no-text-anim
      data-opened={revealed ? "true" : undefined}
    >
      {elevate && (
        <TileOpener opened={opened} onReveal={revealOpened} onClose={closeOpened}>
          <p aria-live="polite">Nav layout {navLook + 1}: {NAV_LOOKS[navLook]}</p>
          <div className="srt-nav-picker">
            {NAV_LOOKS.map((name, i) => (
              <button key={name} type="button" title={name} aria-label={name} aria-pressed={i === navLook} onClick={() => chooseNavLook(i)}>
                {i + 1}
              </button>
            ))}
          </div>
        </TileOpener>
      )}
      <div ref={hostRef} className="srt-canvas" aria-hidden="true" />
      <div ref={captionsRef} className="srt-captions" aria-hidden="true" />

      <div ref={tagRef} className="srt-tag" aria-hidden="true">
        <span className="srt-tag-track">
          <span>{tagText}  •  </span>
          <span>{tagText}  •  </span>
        </span>
      </div>

      <h1 className="srt-sr">{elevate ? "7th Heaven media categories" : "7th Heaven media rows"}</h1>

      <div ref={bandRef} className="srt-band">
        <p className="srt-band-side">Music Videos + Concerts</p>
        <p className="srt-band-logo">7th Heaven</p>
        <p className="srt-band-side">40 Years of Rock</p>
        <Link href="/media" className="srt-band-cta">
          All Media
        </Link>
      </div>

      <nav className="srt-corner" aria-label="Quick links">
        <Link href="/media">Media</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      {elevate && (
        <nav className="srt-sidenav" data-look={navLook + 1} aria-label="Media categories">
          <ul>
            {projects.map((p, i) => (
              <li key={p.name}>
                <button
                  type="button"
                  aria-current={i === current ? "true" : undefined}
                  onClick={() => jumpRef.current(i)}
                >
                  <span className="srt-nav-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="srt-nav-thumb" src={p.tiles[0]?.image} alt="" loading="lazy" />
                  <span className="srt-nav-name">{p.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <Link href="/media" className="srt-sidenav-all">
            All Media
          </Link>
        </nav>
      )}

      <div ref={pillRef} className="srt-menu" data-on="false">
        {!elevate && <span className="srt-logo">7th Heaven</span>}
        <button
          type="button"
          className="srt-select"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {elevate ? (
            <span className="srt-select-text">
              <small>Category {current + 1} of {projects.length}</small>
              <strong>{projects[current]?.name}</strong>
            </span>
          ) : (
            <span>{projects[current]?.name}</span>
          )}
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
            {elevate ? (
              <path d="M2 4.5 6 8.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M1 1.5h10L7.2 6.4V11L4.8 9.6V6.4z" fill="currentColor" />
            )}
          </svg>
        </button>
        <Link href="/media" className="srt-cta">
          All Media
        </Link>
        {menuOpen && (
          <ul className="srt-list">
            {projects.map((p, i) => (
              <li key={p.name}>
                <button
                  type="button"
                  aria-current={i === current ? "true" : undefined}
                  onClick={() => {
                    jumpRef.current(i);
                    setMenuOpen(false);
                  }}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="srt-panel" aria-label="Controls">
        <button
          type="button"
          className="srt-panel-toggle"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((o) => !o)}
        >
          Controls <span aria-hidden="true">{panelOpen ? "−" : "+"}</span>
        </button>
        {panelOpen && (
          <div className="srt-panel-body">
            {SLIDERS.map((s) => (
              <label key={s.key} className="srt-slider">
                <span>
                  {s.label}
                  <output>
                    {params[s.key]}
                    {s.unit ?? ""}
                  </output>
                </span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.key]}
                  onChange={(e) => change({ [s.key]: Number(e.target.value) } as Partial<Params>)}
                />
              </label>
            ))}
            {TOGGLES.map((t) => (
              <label key={t.key} className="srt-toggle">
                <input
                  type="checkbox"
                  checked={params[t.key]}
                  onChange={(e) => change({ [t.key]: e.target.checked } as Partial<Params>)}
                />
                {t.label}
              </label>
            ))}
            <div className="srt-panel-actions">
              <button type="button" onClick={() => change({ ...defaults })}>
                Reset
              </button>
              <button type="button" onClick={copyValues}>
                {copied ? "Copied" : "Copy values"}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* keyboard and screen-reader route to everything drawn on the canvas */}
      <ul className="srt-sr">
        {projects.flatMap((p, pi) =>
          p.tiles.map((t) => (
            <li key={`${p.name}-${t.title}`}>
              {t.href ? (
                <a href={t.href} target="_blank" rel="noopener noreferrer" onFocus={() => jumpRef.current(pi)}>
                  {t.label}
                </a>
              ) : (
                <button type="button" onFocus={() => jumpRef.current(pi)} onClick={() => {
                  if (!elevate) return setPlaying(t);
                  const w = window.innerWidth * 0.4;
                  const h = window.innerHeight * 0.4;
                  setOpened({ tile: t, time: 0, rect: { x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2, w, h } });
                }}>
                  Play {t.label}
                </button>
              )}
            </li>
          )),
        )}
      </ul>

      <dialog
        ref={dialogRef}
        className="srt-dialog"
        aria-label={playing?.title}
        onClose={() => setPlaying(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setPlaying(null);
        }}
      >
        {playing && (
          <>
            <div className="srt-video">
              <iframe
                src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="srt-dialog-info">
              <p>{playing.label}</p>
              <button type="button" onClick={() => setPlaying(null)}>
                Close
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>,
    document.body,
  );
}
