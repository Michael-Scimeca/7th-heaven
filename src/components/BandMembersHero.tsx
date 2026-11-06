/* eslint-disable react-doctor/exhaustive-deps, react-doctor/effect-needs-cleanup, react-doctor/effect-observer-needs-disconnect, react-doctor/effect-raf-loop-needs-cancel, react-doctor/html-label-has-single-control, react-doctor/no-unguarded-browser-global-in-render-or-hook-init */
"use client";

/**
 * Home page members section: the band in one row. Clicking a member melts the others away on a WebGL canvas,
 * scales that member up on the left and opens their fact sheet on the right.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FALLBACK_MEMBERS } from "@/data/bandMembers";
import MemberFactSheetDrawer, { type BandMemberFactSheet } from "@/components/MemberFactSheetDrawer";
import "./band-members-hero.css";

const MEMBERS = [
  { name: "Frankie Harchut", image: "/images/members/desktop-frank.webp" },
  { name: "Nick Cox", image: "/images/members/desktop-nick.webp" },
  { name: "Adam Heisler", image: "/images/members/desktop-adam.webp" },
  { name: "Richard Hofherr", image: "/images/members/desktop-richy.webp" },
  { name: "Mark Kennetz", image: "/images/members/desktop-mark.webp" },
];
/* How far along each member's width the next one starts, so shoulders overlap */
const FACT_SHEETS = FALLBACK_MEMBERS as BandMemberFactSheet[];
const STEP = 0.58;
const PHOTO_ASPECT = 1200 / 1001;
/* Middle members are drawn last so they sit in front */
const DRAW_ORDER = [0, 4, 1, 3, 2];
/* Size from the feet up, so the center member stands tallest and the row steps down to the edges */
const MEMBER_SCALE = [1, 1.1, 1.22, 1.1, 1];
/* The layered image is this much taller than a full-size member, to leave room for the taller ones */
const UNDER_SHEET = 0.12; // the most of an open member photo that may sit behind the fact sheet
const HEADROOM = 1.3;
/* Opening and closing are the same move played forward and backward. Matches .lrt and .lrt-sheet in the CSS. */
const MOVE_SECONDS = 0.7;
/* Phones run the whole sequence about twice as fast. Match MeltAvatar and the phone rules in the CSS. */
const AVATAR_OUT_SECONDS = 0.25;
const PHONE_SHEET_SECONDS = 0.4;
const PHONE_SPEED = 2;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* Open member photo: size in %, move in % of the screen. Each screen type has its own set. */
const DEFAULTS = {
  vanish: 0.7,
  sizeDesktop: 100,
  xDesktop: 0,
  yDesktop: 0,
  sizeTablet: 181,
  xTablet: -9,
  yTablet: 0,
  sizePhone: 100,
  xPhone: 0,
  yPhone: 0,
};
type Layout = "Desktop" | "Tablet" | "Phone";
const layoutFor = (w: number): Layout => (w < 640 ? "Phone" : w <= 1180 ? "Tablet" : "Desktop");
const IMAGE_SLIDERS = [
  { name: "size", label: "Image size (%)", min: 40, max: 200, step: 1 },
  { name: "x", label: "Left / right (%)", min: -60, max: 60, step: 0.5 },
  { name: "y", label: "Down / up (%)", min: -60, max: 60, step: 0.5 },
] as const;
type Params = typeof DEFAULTS;
type NumKey = keyof Params;

const SLIDERS: { key: NumKey; label: string; min: number; max: number; step: number }[] = [
  { key: "vanish", label: "Disappear time (sec)", min: 0.3, max: 5, step: 0.05 },
];
const STORE = "lrt-controls-v4";

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.0; a *= 0.5; }
    return v;
  }
`;

const QUAD = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const COMP = /* glsl */ `
  uniform sampler2D uPhoto;
  uniform vec4 uRect;
  uniform float uPhotoFade;
  varying vec2 vUv;
  void main() {
    vec4 c = vec4(0.0);
    vec2 tuv = (vUv - uRect.xy) / uRect.zw;
    if (tuv.x > 0.0 && tuv.x < 1.0 && tuv.y > 0.0 && tuv.y < 1.0) c = texture2D(uPhoto, tuv) * uPhotoFade;
    gl_FragColor = c;
  }
`;

/* Layers the five cutouts into one image, with each member's own opacity */
const COMPOSE = /* glsl */ `
  uniform sampler2D uPeople[5];
  uniform float uFades[5];
  uniform float uStart[5];
  uniform float uWidth;
  uniform float uScales[5];
  uniform float uHeadroom;
  uniform int uOrder[5];
  uniform float uTime;
  varying vec2 vUv;
  ${NOISE}
  vec3 iris(float t) {
    return 0.55 + 0.5 * cos(6.2832 * (t + vec3(0.0, 0.36, 0.62)));
  }
  vec4 sampleBottomBlur(sampler2D map, vec2 uv) {
    float botFade = smoothstep(0.01, 0.24, uv.y);
    float blurAmt = 1.0 - smoothstep(0.0, 0.26, uv.y);
    blurAmt *= blurAmt;
    if (blurAmt < 0.001) {
      return texture2D(map, uv) * botFade;
    }
    vec2 rad = vec2(0.018, 0.024) * blurAmt;
    vec4 sum = texture2D(map, uv) * 0.22;
    sum += texture2D(map, clamp(uv + vec2(-rad.x, 0.0), 0.001, 0.999)) * 0.13;
    sum += texture2D(map, clamp(uv + vec2( rad.x, 0.0), 0.001, 0.999)) * 0.13;
    sum += texture2D(map, clamp(uv + vec2(0.0, -rad.y), 0.001, 0.999)) * 0.13;
    sum += texture2D(map, clamp(uv + vec2(0.0,  rad.y), 0.001, 0.999)) * 0.13;
    sum += texture2D(map, clamp(uv + vec2(-rad.x, -rad.y) * 0.7, 0.001, 0.999)) * 0.065;
    sum += texture2D(map, clamp(uv + vec2( rad.x, -rad.y) * 0.7, 0.001, 0.999)) * 0.065;
    sum += texture2D(map, clamp(uv + vec2(-rad.x,  rad.y) * 0.7, 0.001, 0.999)) * 0.065;
    sum += texture2D(map, clamp(uv + vec2( rad.x,  rad.y) * 0.7, 0.001, 0.999)) * 0.065;
    return sum * botFade;
  }
  vec4 person(sampler2D map, float start, float fade, float size) {
    vec2 q = vec2((vUv.x - start - uWidth * 0.5) / (uWidth * size) + 0.5, vUv.y * uHeadroom / size);
    if (q.x < 0.0 || q.x > 1.0 || q.y > 1.0) return vec4(0.0);
    if (fade >= 0.999) return sampleBottomBlur(map, q);
    if (fade <= 0.001) return vec4(0.0);
    // The melt climbs from the shoulders up, along an uneven noise front
    float seed = start * 37.0;
    vec2 st = vec2(q.x * 1.2, q.y);
    float n = fbm(st * 5.0 + seed + vec2(0.0, uTime * 0.25));
    float d = n * 0.55 + q.y * 0.45;
    float thr = mix(-0.03, 1.03, 1.0 - fade);
    float edge = d - thr;

    // Liquid wobble just ahead of the front
    float band = exp(-edge * edge / 0.012);
    vec2 w = q + vec2(sin(q.y * 26.0 + uTime * 5.0), cos(q.x * 22.0 + uTime * 4.0)) * 0.016 * band;
    vec4 tex = sampleBottomBlur(map, w);

    if (edge < 0.0) {
      // Behind the front the person breaks into glowing dots that drift upward
      vec2 g = st * 95.0;
      g.y -= uTime * 7.0;
      vec2 id = floor(g);
      float spark = step(length(fract(g) - 0.5), 0.3) * step(hash(id + seed), 0.42);
      spark *= smoothstep(-0.2, 0.0, edge);
      float sa = spark * sampleBottomBlur(map, q).a;
      return vec4(iris(n * 2.0 + q.y + uTime * 0.2) * sa, sa);
    }
    float rim = 1.0 - smoothstep(0.0, 0.085, edge);
    vec3 col = mix(tex.rgb, iris(n * 2.4 + q.y * 1.5 + uTime * 0.25) * tex.a, rim);
    return vec4(col, tex.a) * smoothstep(0.0, 0.012, edge);
  }
  void main() {
    vec4 c = vec4(0.0);
    for (int n = 0; n < 5; n++) {
      vec4 src = vec4(0.0);
      int i = uOrder[n];
      if (i == 0) src = person(uPeople[0], uStart[0], uFades[0], uScales[0]);
      else if (i == 1) src = person(uPeople[1], uStart[1], uFades[1], uScales[1]);
      else if (i == 2) src = person(uPeople[2], uStart[2], uFades[2], uScales[2]);
      else if (i == 3) src = person(uPeople[3], uStart[3], uFades[3], uScales[3]);
      else src = person(uPeople[4], uStart[4], uFades[4], uScales[4]);
      c = src + c * (1.0 - src.a);
    }
    gl_FragColor = c;
  }
`;

function loadParams(): Params {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    // storage unavailable: use defaults
  }
  return { ...DEFAULTS };
}

export default function BandMembersHero({ showControls = false }: { showControls?: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const paramsRef = useRef<Params>(DEFAULTS);
  const [params, setParams] = useState<Params>(DEFAULTS);
  const [active, setActive] = useState(-1);
  const [selected, setSelected] = useState<number | null>(null);
  const [sheetMember, setSheetMember] = useState<number | null>(null);
  const [sheetClosing, setSheetClosing] = useState(false);
  const [avatarLeaving, setAvatarLeaving] = useState(false);
  const [returning, setReturning] = useState(false);
  const selectRef = useRef<(i: number | null) => void>(() => { });
  const [panelOpen, setPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState<Layout>("Desktop");

  useEffect(() => {
    if (!showControls) return; // the home page always uses the defaults
    const loaded = loadParams();
    paramsRef.current = loaded;
    setParams(loaded);
  }, []);

  const change = useCallback((next: Partial<Params>) => {
    const merged = { ...paramsRef.current, ...next };
    paramsRef.current = merged;
    setParams(merged);
    try {
      localStorage.setItem(STORE, JSON.stringify(merged));
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
    const hero = heroRef.current;
    const host = hostRef.current;
    const row = rowRef.current;
    if (!hero || !host || !row) return;
    let cancelled = false;
    let cleanup = () => { };

    (async () => {
      const THREE = await import("three");
      if (cancelled) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      host.appendChild(renderer.domElement);

      const camera = new THREE.Camera();
      const geometry = new THREE.PlaneGeometry(2, 2);
      const compMat = new THREE.ShaderMaterial({
        vertexShader: QUAD,
        fragmentShader: COMP,
        blending: THREE.NoBlending,
        uniforms: {
          uPhoto: { value: null },
          uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
          uPhotoFade: { value: 0 },
        },
      });
      const compScene = new THREE.Scene();
      compScene.add(new THREE.Mesh(geometry, compMat));

      let W = 1;
      let H = 1;
      const rowAspect = (1 + (MEMBERS.length - 1) * STEP) * PHOTO_ASPECT;
      /* All sizes are in pixels with one height and a width derived from it, so the photos always
         keep their true shape, even while the section changes height. */
      const widthOf = (h: number) => (h / HEADROOM) * rowAspect;
      const rowRect = { x: 0, y: 0, h: 1 };
      const view = { x: 0, y: 0, h: 0 };
      let moveT = 0; // 0 = whole band in its row, 1 = chosen member fully open
      let focus: { x: number; y: number; h: number } | null = null;
      let focusMember: number | null = null;
      let awaitingRow = false;
      let heroStart = 0; // where the section sat on screen when it was clicked
      let sheetClosingNow = false;
      let sheetGoneAt = 0;
      let phoneCloseTimer = 0;
      let redraw = () => { };
      const placePhoto = () => {
        // The whole band in one row across the bottom
        // Phones: the row runs wider than the screen, so the outer members are slightly cut off at both ends
        const wFrac = W < 640 ? 1.25 : W / H < 1 ? 1 : 0.96;
        const memberH = Math.min((wFrac * W) / rowAspect, window.innerHeight * 0.62);
        rowRect.h = memberH * HEADROOM;
        const fitted = widthOf(rowRect.h);
        rowRect.x = (W - fitted) / 2;
        if (focusMember !== null && focus) {
          focus = zoomGoal(focusMember);
        }
        const eased = easeInOut(moveT);
        view.x = rowRect.x + ((focus?.x ?? rowRect.x) - rowRect.x) * eased;
        view.y = (focus?.y ?? 0) * eased;
        view.h = rowRect.h + ((focus?.h ?? rowRect.h) - rowRect.h) * eased;
        row.style.setProperty("--row-width", `${(fitted / W) * ((MEMBERS.length * STEP * PHOTO_ASPECT) / rowAspect) * 100}%`);
      };
      /* With a member chosen, the whole row zooms so that person fills the space left of the fact sheet */
      const zoomGoal = (i: number) => {
        // Sheet widths match .lrt-sheet. Beside a sheet, the photo centers in the free space when it
        // fits. On narrower screens its left side stays whole and its right tucks under the sheet.
        const tablet = W >= 640 && W <= 1180;
        const sheet = tablet ? W * 0.48 : W >= 640 ? W / 3 : 0;
        const free = W - sheet;
        const beside = sheet > 0;
        const shown = beside
          ? Math.min(0.92 * H, free / ((1 - UNDER_SHEET) * PHOTO_ASPECT))
          : Math.min(0.92 * H, (free * 0.94) / PHOTO_ASPECT);
        const photoW = shown * PHOTO_ASPECT;
        const layout = layoutFor(W);
        const tune = paramsRef.current;
        const center = (beside ? Math.max(0, (free - photoW) / 2) + photoW / 2 : free / 2) + (tune[`x${layout}`] / 100) * W;
        const h = (shown * HEADROOM * (tune[`size${layout}`] / 100)) / MEMBER_SCALE[i];
        const start = (i * STEP * PHOTO_ASPECT) / rowAspect;
        const width = PHOTO_ASPECT / rowAspect;
        return { x: center - (start + width / 2) * widthOf(h), y: (tune[`y${layout}`] / 100) * H, h };
      };
      const resize = () => {
        W = host.clientWidth;
        setLayout(layoutFor(W));
        H = host.clientHeight;
        renderer.setSize(W, H);
        placePhoto();
        // Resizing clears the canvas, so draw again now or it flashes empty while the section changes height
        redraw();
      };
      resize();
      // The section changes height when a fact sheet opens, not only when the window resizes
      const sizeWatch = new ResizeObserver(resize);
      sizeWatch.observe(host);

      const people: import("three").Texture[] = [];
      let composed: import("three").WebGLRenderTarget | null = null;
      let composeMat: import("three").ShaderMaterial | null = null;
      let composeScene: import("three").Scene | null = null;
      let masks: { data: Uint8ClampedArray; w: number; h: number }[] = [];
      let targetFade = 0;
      const fades = MEMBERS.map(() => 1);
      let picked: number | null = null;
      let needsCompose = true;
      const memberW = PHOTO_ASPECT / rowAspect;
      const memberStart = MEMBERS.map((_, i) => i * STEP * memberW);

      Promise.all(
        MEMBERS.map(
          (m) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = m.image;
            }),
        ),
      ).then((imgs) => {
        if (cancelled) return;
        // Low-res alpha maps, so a click only counts on the person and not the air around them
        masks = imgs.map((img) => {
          const c = document.createElement("canvas");
          c.width = 72;
          c.height = 60;
          const ctx = c.getContext("2d");
          ctx?.drawImage(img, 0, 0, c.width, c.height);
          return { data: ctx ? ctx.getImageData(0, 0, c.width, c.height).data : new Uint8ClampedArray(0), w: c.width, h: c.height };
        });
        imgs.forEach((img) => {
          const tex = new THREE.Texture(img);
          tex.colorSpace = THREE.NoColorSpace;
          tex.premultiplyAlpha = true;
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          people.push(tex);
        });
        const ch = 1001;
        const cw = Math.min(4096, Math.round(ch * rowAspect));
        const rtH = Math.round((cw / rowAspect) * HEADROOM);
        composed = new THREE.WebGLRenderTarget(cw, rtH, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: false,
        });
        composeMat = new THREE.ShaderMaterial({
          vertexShader: QUAD,
          fragmentShader: COMPOSE,
          blending: THREE.NoBlending,
          uniforms: {
            uPeople: { value: people },
            uFades: { value: fades },
            uStart: { value: memberStart },
            uWidth: { value: memberW },
            uScales: { value: MEMBER_SCALE },
            uHeadroom: { value: HEADROOM },
            uOrder: { value: DRAW_ORDER },
            uTime: { value: 0 },
          },
        });
        composeScene = new THREE.Scene();
        composeScene.add(new THREE.Mesh(geometry, composeMat));
        compMat.uniforms.uPhoto.value = composed.texture;
        needsCompose = true;
        targetFade = 1;
      });

      const hitAt = (nx: number, ny: number) => {
        const rect = compMat.uniforms.uRect.value;
        const u = (nx - rect.x) / rect.z;
        const v = (ny - rect.y) / rect.w;
        if (u < 0 || u > 1 || v < 0 || v > 1 || !masks.length) return -1;
        for (let n = DRAW_ORDER.length - 1; n >= 0; n--) {
          const i = DRAW_ORDER[n];
          if (fades[i] < 0.5) continue;
          const size = MEMBER_SCALE[i];
          const lu = (u - memberStart[i] - memberW / 2) / (memberW * size) + 0.5;
          const lv = (v * HEADROOM) / size;
          if (lu < 0 || lu >= 1 || lv > 1) continue;
          const m = masks[i];
          const px = Math.floor(lu * m.w);
          const py = Math.min(m.h - 1, Math.floor((1 - lv) * m.h));
          if (m.data[(py * m.w + px) * 4 + 3] > 128) return i;
        }
        return -1;
      };
      // Members go one after another, spreading outward from the chosen person
      const delays = MEMBERS.map(() => 0);
      let changedAt = 0;
      let revealAt = 0;
      let sheetShown = false;
      const select = (i: number | null) => {
        const center = i ?? picked ?? 2;
        const opening = picked === null && i !== null;
        const tablet = W >= 640 && W <= 1180;
        // Phones: the sheet slides in over the band, then its small photo melts in. Closing plays it backward.
        const phone = W < 640;
        if (opening && phone) heroStart = hero.getBoundingClientRect().top;
        picked = i;
        changedAt = performance.now();
        const spread = Math.abs(MEMBERS.length - 1 - center) > center ? MEMBERS.length - 1 - center : center;
        delays.forEach((_, m) => {
          const away = (Math.abs(m - center) * 0.1) / (phone ? PHONE_SPEED : 1);
          // Closing plays the melt backward: whoever left last comes back first.
          // On tablets the zoom came after the melt, so going back it comes first.
          delays[m] = i === null
            ? (spread * 0.1) / (phone ? PHONE_SPEED : 1) - away + (tablet ? MOVE_SECONDS : phone ? AVATAR_OUT_SECONDS : 0)
            : away;
        });
        // On tablets the sheet would hide the row, so the others melt away in full view first
        const melt = Math.max(...delays) + paramsRef.current.vanish / (phone ? PHONE_SPEED : 1);
        revealAt = opening && tablet && !reduced ? changedAt + melt * 1000 : changedAt;
        setSelected(i);
        awaitingRow = i === null;
        setReturning(i === null);
        if (i === null) {
          // Let the sheet slide away before it is removed
          sheetShown = false;
          sheetClosingNow = true;
          window.clearTimeout(phoneCloseTimer);
          if (phone && !reduced) {
            setAvatarLeaving(true);
            sheetGoneAt = performance.now() + (AVATAR_OUT_SECONDS + PHONE_SHEET_SECONDS) * 1000;
            phoneCloseTimer = window.setTimeout(() => setSheetClosing(true), AVATAR_OUT_SECONDS * 1000);
          } else {
            sheetGoneAt = 0;
            setSheetClosing(true);
          }
        } else {
          sheetClosingNow = false;
          window.clearTimeout(phoneCloseTimer);
          setAvatarLeaving(false);
          setSheetClosing(false);
          if (sheetShown) setSheetMember(i);
        }
      };
      selectRef.current = select;
      const onClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest?.("a, button, input, select, label, .lrt-panel")) return;
        const r = host.getBoundingClientRect();
        const hit = hitAt((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
        if (picked !== null) select(null);
        else if (hit >= 0) select(hit);
      };
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") select(null);
      };
      hero.addEventListener("click", onClick);
      window.addEventListener("keydown", onEsc);

      const pointer = { x: 0.5, y: 0.5, inside: false };
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width;
        pointer.y = 1 - (e.clientY - r.top) / r.height;
        pointer.inside = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1;
      };
      const onLeave = () => { pointer.inside = false; };
      // On window, because the open fact sheet sits in a layer above the hero
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerdown", onMove);
      document.documentElement.addEventListener("pointerleave", onLeave);

      let visible = true;
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
      io.observe(hero);

      let raf = 0;
      let shownOver = -1;
      let lastFrame = performance.now();
      let transitioning = false;
      let startedAt = -1;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        if (startedAt < 0) startedAt = now; // the rise-in intro waits until the section is on screen
        const p = paramsRef.current;
        const time = (now - startedAt) / 1000;

        const rect = compMat.uniforms.uRect.value;
        if (picked !== null && !sheetShown && now >= revealAt) {
          sheetShown = true;
          setSheetMember(picked);
        }
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;

        // One timeline drives the zoom: forward to open, backward to close
        const opening = picked !== null && sheetShown && W >= 640;
        if (opening && moveT === 0) heroStart = hero.getBoundingClientRect().top;
        moveT = reduced ? (opening ? 1 : 0) : Math.min(1, Math.max(0, moveT + ((opening ? 1 : -1) * dt) / MOVE_SECONDS));
        if (picked !== null) focusMember = picked;
        if (focusMember !== null) {
          const z = zoomGoal(focusMember);
          if (!focus || moveT === 0) focus = z;
          else {
            // Paging to another member while open glides across
            focus = {
              x: focus.x + (z.x - focus.x) * 0.075,
              y: focus.y + (z.y - focus.y) * 0.075,
              h: focus.h + (z.h - focus.h) * 0.075,
            };
          }
        }
        const eased = easeInOut(moveT);
        view.x = rowRect.x + ((focus?.x ?? rowRect.x) - rowRect.x) * eased;
        view.y = (focus?.y ?? 0) * eased;
        view.h = rowRect.h + ((focus?.h ?? rowRect.h) - rowRect.h) * eased;
        rect.set(view.x / W, view.y / H, widthOf(view.h) / W, view.h / H);
        // The sheet leaves the page only when the move has fully played back, so the scroll lock
        // lets go with the page exactly where it started
        if (sheetClosingNow && moveT === 0 && now >= sheetGoneAt) {
          sheetClosingNow = false;
          setSheetMember(null);
          setSheetClosing(false);
          setAvatarLeaving(false);
        }
        // Highlight the name of whoever the cursor is over
        const over = pointer.inside ? hitAt(pointer.x, pointer.y) : -1;
        if (over !== shownOver) {
          shownOver = over;
          setActive(over);
          hero.style.cursor = over >= 0 ? "pointer" : "";
        }

        // Fade members in and out, rebuilding the layered image only while something changes
        fades.forEach((f, i) => {
          // Phones keep the whole band in place; the sheet simply slides over it
          const goal = W < 640 || picked === null || picked === i ? 1 : 0;
          if (f === goal) return;
          if (!reduced && (now - changedAt) / 1000 < delays[i]) return;
          const step = dt / Math.max(0.05, p.vanish / (W < 640 ? PHONE_SPEED : 1));
          const next = goal > f ? Math.min(1, f + step) : Math.max(0, f - step);
          fades[i] = reduced ? goal : next;
        });
        if (fades.some((f) => f > 0 && f < 1) || transitioning) needsCompose = true;
        transitioning = fades.some((f) => f > 0 && f < 1);
        if (composeMat) composeMat.uniforms.uTime.value = time;
        if (awaitingRow && moveT === 0 && fades.every((f) => f >= 1)) {
          awaitingRow = false;
          focusMember = null;
          focus = null;
          setReturning(false);
        }
        // The section glides from where it was clicked up to the top of the screen, and back.
        // This also holds it in place if page content above loads in while the sheet is open.
        if (focusMember !== null && document.body.style.position === "fixed") {
          const offset = hero.getBoundingClientRect().top - heroStart * (1 - eased);
          if (Math.abs(offset) > 0.5) document.body.style.top = `${(parseFloat(document.body.style.top) || 0) - offset}px`;
        }
        if (needsCompose && composed && composeScene) {
          needsCompose = false;
          renderer.setRenderTarget(composed);
          renderer.render(composeScene, camera);
          renderer.setRenderTarget(null);
        }
        const introT = reduced ? 1 : Math.min(1, time / 2.2);

        const c = compMat.uniforms;
        c.uPhotoFade.value += (targetFade - c.uPhotoFade.value) * 0.07;
        // The photo rises into place during the intro
        const e = 1 - Math.pow(1 - introT, 3);
        rect.y += -0.22 * (1 - e);
        renderer.render(compScene, camera);
      };
      redraw = () => {
        compMat.uniforms.uRect.value.set(view.x / W, view.y / H, widthOf(view.h) / W, view.h / H);
        renderer.render(compScene, camera);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        sizeWatch.disconnect();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        selectRef.current = () => { };
        hero.removeEventListener("click", onClick);
        window.removeEventListener("keydown", onEsc);
        people.forEach((t) => t.dispose());
        composed?.dispose();
        composeMat?.dispose();
        compMat.dispose();
        geometry.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="band"
      className="lrt"
      data-open={sheetMember !== null && !sheetClosing}
      data-transitioning={selected !== null || returning}
      data-no-text-anim
      aria-labelledby="lrt-title"
    >
      <h2 className="lrt-giant" id="lrt-title" data-hidden={selected !== null || returning}>
        Members
      </h2>

      <div ref={hostRef} className="lrt-canvas" aria-hidden="true" />

      <div className="lrt-copy" data-hidden={selected !== null || returning}>
        <p className="lrt-tag">40 years of live rock. 700+ songs.</p>
        <p className="lrt-lead">Playing since 1985. Four decades in the band, and still on stage.</p>
      </div>

      <ul ref={rowRef} className="lrt-names" aria-label="The band" data-hidden={selected !== null || returning}>
        {MEMBERS.map((m, i) => (
          <li key={m.name} data-active={i === active || i === selected}>
            <button
              type="button"
              aria-pressed={i === selected}
              onClick={() => selectRef.current(i === selected ? null : i)}
            >
              {m.name}
            </button>
          </li>
        ))}
      </ul>

      {showControls && (
        <aside className="lrt-panel" aria-label="Controls">
          <button type="button" className="lrt-panel-toggle" aria-expanded={panelOpen} onClick={() => setPanelOpen((o) => !o)}>
            Controls <span aria-hidden="true">{panelOpen ? "−" : "+"}</span>
          </button>
          {panelOpen && (
            <div className="lrt-panel-body">
              {SLIDERS.map((s) => (
                <label key={s.key} className="lrt-slider">
                  <span>
                    {s.label}
                    <output>{params[s.key]}</output>
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
              <div className="lrt-panel-actions">
                <button type="button" onClick={() => change({ ...DEFAULTS })}>
                  Reset
                </button>
                <button type="button" onClick={copyValues}>
                  {copied ? "Copied" : "Copy values"}
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {showControls &&
        sheetMember !== null &&
        createPortal(
          <aside className="lrt-image-panel" aria-label={`${layout} image controls`}>
            <p>{layout} image</p>
            {IMAGE_SLIDERS.map((s) => {
              const key = `${s.name}${layout}` as const;
              return (
                <label key={s.name} className="lrt-slider">
                  <span>
                    {s.label}
                    <output>{params[key]}</output>
                  </span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={params[key]}
                    onChange={(e) => change({ [key]: Number(e.target.value) } as Partial<Params>)}
                  />
                </label>
              );
            })}
            <div className="lrt-panel-actions">
              <button
                type="button"
                onClick={() =>
                  change({
                    [`size${layout}`]: DEFAULTS[`size${layout}`],
                    [`x${layout}`]: DEFAULTS[`x${layout}`],
                    [`y${layout}`]: DEFAULTS[`y${layout}`],
                  } as Partial<Params>)
                }
              >
                Reset
              </button>
              <button type="button" onClick={copyValues}>
                {copied ? "Copied" : "Copy values"}
              </button>
            </div>
          </aside>,
          document.body,
        )}

      <MemberFactSheetDrawer
        isOpen={sheetMember !== null}
        member={sheetMember !== null ? FACT_SHEETS[sheetMember] : null}
        allMembers={FACT_SHEETS}
        panelClassName={`lrt-sheet${sheetClosing ? " lrt-sheet--closing" : ""}`}
        avatarLeaving={avatarLeaving}
        onClose={() => selectRef.current(null)}
        onSelectMember={(m) => {
          const i = FACT_SHEETS.findIndex((x) => x.name === m.name);
          if (i >= 0) selectRef.current(i);
        }}
      />
    </section>
  );
}
