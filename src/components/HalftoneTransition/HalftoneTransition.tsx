"use client";

/**
 * Halftone page transition (Buttermax-style).
 *
 * Two ways to use it:
 * - <HalftoneTransitionProvider contentId="..."> around a section, with <HalftoneLink> links (always on).
 * - <HalftoneTransitionProvider contentId="page-content-wrapper" optIn autoRoutes={[...]}> in the root
 *   layout: navigations between the autoRoutes pages always use it. Every other navigation uses it only
 *   if the visitor opened a page with ?halftone=on (remembered in localStorage; ?halftone=off undoes it).
 *   TransitionContext.requestTransition asks handles(href) and hands matching navigations over.
 *
 * How it works:
 * 1. The visible part of the content element is snapshotted (fixed widgets and anything below the
 *    fold are skipped). Hovering a link starts this early, so most clicks start instantly.
 * 2. A fixed WebGL canvas shows that snapshot, the real content is hidden and the route changes.
 * 3. Once the new page has rendered (and its on-screen images have loaded) it is snapshotted too.
 * 4. The shader runs the transition from the click point for 2.6s, then the real page is shown.
 *
 * The site's background canvas (HomeShaderGradient) sits outside the content and is never moved.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HALFTONE_FRAG, HALFTONE_VERT } from "./shader";
import {
  HALFTONE_DEFAULTS,
  HALFTONE_EASES,
  loadSettings,
  saveSettings,
  type HalftoneSettings,
} from "./settings";
import HalftoneTuner from "./HalftoneTuner";

const SNAPSHOT_MAX_AGE_MS = 5000;
// Long enough for a first-visit compile in `next dev`; built pages arrive almost instantly.
const ROUTE_TIMEOUT_MS = 20000;
const IMAGE_WAIT_MS = 4000; // the effect crawls while it waits, so a longer wait doesn't freeze anything
const ANIMATION_WAIT_MS = 1400;
// progress (0..1, before easing) where holes start opening; the effect crawls here until the new page is ready
const HOLD_AT = 0.2;
const STORAGE_KEY = "7h_halftone";
const TUNER_KEY = "7h_halftone_tuner";

type Pointer = { x: number; y: number }; // 0..1 of the viewport, y from the top
type Rect = [number, number, number, number]; // x, y, w, h as viewport fractions
type Snapshot = { canvas: HTMLCanvasElement; rect: Rect };
type Cached = { promise: Promise<Snapshot>; path: string; scrollY: number; time: number };

type GLState = {
  gl: WebGLRenderingContext;
  u: Record<string, WebGLUniformLocation | null>;
  texFrom: WebGLTexture;
  texTo: WebGLTexture;
};

type HalftoneContextValue = {
  enabled: boolean;
  settings: HalftoneSettings;
  setSettings: (patch: Partial<HalftoneSettings>) => void;
  resetSettings: () => void;
  /** play the transition in place (no navigation), from `pointer` */
  preview: (pointer?: Pointer) => void;
  closeTuner: () => void;
  /** true when a navigation to `href` should use the halftone transition */
  handles: (href: string) => boolean;
  navigate: (href: string, pointer?: Pointer) => void;
  prepare: () => void;
};

const HalftoneContext = createContext<HalftoneContextValue | null>(null);

export function useHalftone() {
  const ctx = useContext(HalftoneContext);
  if (!ctx) throw new Error("useHalftone must be used inside <HalftoneTransitionProvider>");
  return ctx;
}

/** Same as useHalftone, but returns null outside a provider. */
export function useOptionalHalftone() {
  return useContext(HalftoneContext);
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const cleanPath = (href: string) => {
  let p = href;
  try {
    if (/^https?:\/\//.test(href)) p = new URL(href).pathname;
  } catch {}
  return p.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
};
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

type LenisLike = { scrollTo: (y: number, o?: object) => void; stop: () => void; start: () => void };
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

/** Freeze the page under the effect: hide the real content and the scrollbar thumb (it would jump as
 *  the new page's height and scroll position swap in underneath) and pause smooth scrolling. */
function freezePage(el: HTMLElement) {
  document.documentElement.classList.add("halftone-active");
  lenis()?.stop();
  // !important so other styles (e.g. the dev ?bypass=true override) can't reveal it early
  el.style.setProperty("opacity", "0", "important");
}
function unfreezePage(el: HTMLElement) {
  document.documentElement.classList.remove("halftone-active");
  lenis()?.start();
  el.style.removeProperty("opacity");
}

function readOptIn(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get("halftone");
    if (q === "on") {
      localStorage.setItem(STORAGE_KEY, "1");
      return true;
    }
    if (q === "off") {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function initGL(canvas: HTMLCanvasElement): GLState | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("[HalftoneTransition]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const v = compile(gl.VERTEX_SHADER, HALFTONE_VERT);
  const f = compile(gl.FRAGMENT_SHADER, HALFTONE_FRAG);
  const prog = gl.createProgram();
  if (!v || !f || !prog) return null;
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u: GLState["u"] = {};
  for (const n of [
    "uFrom", "uTo", "uFromRect", "uToRect", "uHasTo", "uRes", "uMouse", "uT", "uBlur", "uSize2", "uZoom", "uTime",
    "uDotBlur", "uSpread", "uAnchorPull", "uOldZoom", "uOldTurn", "uRGB", "uCRT", "uNewScale", "uNewTurn", "uRimWidth", "uRimEnd",
    "uTIn", "uNewRise", "uNewBlur", "uNewSplit",
  ]) {
    u[n] = gl.getUniformLocation(prog, n);
  }
  const makeTex = (unit: number) => {
    const tex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  };
  const texFrom = makeTex(0);
  const texTo = makeTex(1);
  gl.uniform1i(u.uFrom, 0);
  gl.uniform1i(u.uTo, 1);
  return { gl, u, texFrom, texTo };
}

const SKIP_ATTR = "data-halftone-skip";

// data: URLs of images already shown on the site, so repeat captures don't redo the work
const imageDataCache = new Map<string, string>();

/** Turn an image the page has already loaded into a data: URL for the snapshot (same-origin only). */
async function inlineLoadedImage(url: string): Promise<string | false> {
  if (url.startsWith("data:")) return false;
  const hit = imageDataCache.get(url);
  if (hit) return hit;
  let abs: string;
  try {
    abs = new URL(url, window.location.href).href;
  } catch {
    return false;
  }
  const img = Array.from(document.images).find(
    (i) => i.complete && i.naturalWidth > 0 && (i.currentSrc === abs || i.src === abs),
  );
  if (!img) return false;
  try {
    if (!img.complete) await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d")!.drawImage(img, 0, 0);
    const data = c.toDataURL("image/webp", 0.92); // keeps transparency; browsers without webp give png
    if (imageDataCache.size > 60) imageDataCache.clear();
    imageDataCache.set(url, data);
    return data;
  } catch {
    return false; // e.g. a cross-origin image: let the library fetch it
  }
}

/**
 * Mark (on the live page) everything the snapshot should leave out: scripts and styles, fixed-position
 * widgets, and anything entirely below the fold. The screenshot library tests nodes in its own
 * off-screen copy, where scroll position and layout differ, so the decision has to be made here.
 */
function markSkipped(root: HTMLElement, vh: number): Element[] {
  const marked: Element[] = [];
  const walk = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      // videos and iframes can stall the capture library indefinitely (it waits on their frames)
      let skip = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|VIDEO|IFRAME)$/.test(child.tagName);
      if (!skip && getComputedStyle(child).position === "fixed") skip = true;
      if (!skip) {
        const r = child.getBoundingClientRect();
        if (r.height > 0 && r.top >= vh + 40) skip = true;
      }
      if (skip) {
        child.setAttribute(SKIP_ATTR, "");
        marked.push(child);
      } else {
        walk(child);
      }
    }
  };
  walk(root);
  return marked;
}

/** Snapshot only the part of `el` that is on screen right now. */
async function snapshot(el: HTMLElement): Promise<Snapshot> {
  const { domToCanvas } = await import("modern-screenshot");
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r = el.getBoundingClientRect();
  const top = Math.max(0, r.top);
  const bottom = Math.min(vh, r.bottom);
  const height = Math.max(1, Math.round(bottom - top));
  const offset = top - r.top; // how much of the element is scrolled above the viewport
  const marked = markSkipped(el, vh);
  const capture = domToCanvas(el, {
    width: Math.max(1, Math.round(r.width)),
    height,
    scale: Math.min(window.devicePixelRatio || 1, 1.5),
    backgroundColor: null,
    // Reuse images the page has already loaded instead of downloading them again (faster, and big
    // photos can't time out half-way and show up as broken). Anything not on the page is fetched.
    fetchFn: inlineLoadedImage,
    timeout: 6000, // per image/font fallback fetch
    // the live element may be hidden mid-transition; the copy must not be. Shift it so the
    // visible slice lands at the top of the snapshot.
    style: {
      opacity: "1",
      visibility: "visible",
      // the library pins the copy to the capture height, which collapses the page layout; restore the
      // real height and shift the copy up instead, so only the on-screen slice falls inside the capture
      height: `${r.height}px`,
      transform: offset ? `translateY(${-offset}px)` : "none",
      transformOrigin: "0 0",
    },
    filter: (node) => !(node instanceof Element && node.hasAttribute(SKIP_ATTR)),
  });
  let canvas: HTMLCanvasElement;
  try {
    canvas = await capture;
  } finally {
    for (const m of marked) m.removeAttribute(SKIP_ATTR);
  }
  return { canvas, rect: [r.left / vw, top / vh, r.width / vw, height / vh] };
}

/** Wait (briefly) for on-screen entrance animations/transitions (e.g. a photo fading in) to finish,
 *  so the snapshot of the new page shows its settled state. Endless loops are ignored. */
async function settleAnimations(el: HTMLElement) {
  if (typeof document.getAnimations !== "function") return;
  await nextFrame();
  const vh = window.innerHeight;
  const anims = document.getAnimations().filter((a) => {
    const target = (a.effect as KeyframeEffect | null)?.target as Element | null | undefined;
    if (!target || !el.contains(target) || a.playState !== "running") return false;
    const end = Number(a.effect?.getComputedTiming().endTime);
    if (!Number.isFinite(end)) return false;
    const r = target.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh;
  });
  if (!anims.length) return;
  await Promise.race([
    Promise.all(anims.map((a) => a.finished.catch(() => {}))),
    new Promise((r) => setTimeout(r, ANIMATION_WAIT_MS)),
  ]);
}

/** Wait (briefly) for images that are on screen to finish loading. */
async function settleImages(el: HTMLElement) {
  const vh = window.innerHeight;
  const imgs = Array.from(el.querySelectorAll("img")).filter((img) => {
    const r = img.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh && !img.complete;
  });
  if (!imgs.length) return;
  await Promise.race([
    Promise.all(imgs.map((img) => img.decode().catch(() => {}))),
    new Promise((r) => setTimeout(r, IMAGE_WAIT_MS)),
  ]);
}

export function HalftoneTransitionProvider({
  children,
  contentId,
  optIn = false,
  autoRoutes,
}: {
  children: ReactNode;
  /** id of the element that holds the page content */
  contentId: string;
  /** off unless the visitor opted in with ?halftone=on */
  optIn?: boolean;
  /** pages that always use the transition between each other, even without opting in */
  autoRoutes?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<GLState | null>(null);
  const busyRef = useRef(false);
  const cacheRef = useRef<Cached | null>(null);
  const pendingRef = useRef<{ path: string; resolve: () => void } | null>(null);
  const pointerRef = useRef<{ p: Pointer; time: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(!optIn);
  const [settings, setSettingsState] = useState<HalftoneSettings>(HALFTONE_DEFAULTS);
  const settingsRef = useRef<HalftoneSettings>(HALFTONE_DEFAULTS);
  const [tunerOpen, setTunerOpen] = useState(false);
  const routesKey = (autoRoutes ?? []).map(cleanPath).join("|");
  const routes = useMemo(() => (routesKey ? routesKey.split("|") : []), [routesKey]);
  const active = enabled || routes.length > 0;
  const onAutoRoute = routes.includes(cleanPath(pathname || "/"));

  const handles = useCallback(
    (href: string) => {
      if (enabled) return true;
      const from = cleanPath(window.location.pathname);
      const to = cleanPath(href);
      return from !== to && routes.includes(from) && routes.includes(to);
    },
    [enabled, routes],
  );

  useEffect(() => {
    setMounted(true);
    const loaded = loadSettings();
    settingsRef.current = loaded;
    setSettingsState(loaded);
    if (optIn) {
      setEnabled(readOptIn());
      // ?halftone-tuner=on opens the control panel (remembered); ?halftone-tuner=off closes it
      try {
        const q = new URLSearchParams(window.location.search).get("halftone-tuner");
        if (q === "on") localStorage.setItem(TUNER_KEY, "1");
        if (q === "off") localStorage.removeItem(TUNER_KEY);
        setTunerOpen(localStorage.getItem(TUNER_KEY) === "1");
      } catch {}
    }
  }, [optIn]);

  const setSettings = useCallback((patch: Partial<HalftoneSettings>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettingsState(next);
    saveSettings(next);
  }, []);

  const resetSettings = useCallback(() => {
    settingsRef.current = HALFTONE_DEFAULTS;
    setSettingsState(HALFTONE_DEFAULTS);
    saveSettings(HALFTONE_DEFAULTS);
  }, []);

  const closeTuner = useCallback(() => {
    setTunerOpen(false);
    try {
      localStorage.removeItem(TUNER_KEY);
    } catch {}
  }, []);

  useEffect(() => {
    // Init once per canvas. No loseContext() on cleanup: React's dev double-mount would
    // hand the second mount a dead context. The browser frees it with the canvas.
    if (mounted && active && canvasRef.current && !glRef.current) glRef.current = initGL(canvasRef.current);
  }, [mounted, active]);

  // resolve a pending navigation once the new route has rendered
  useEffect(() => {
    const p = pendingRef.current;
    if (p && cleanPath(pathname || "/") === p.path) {
      pendingRef.current = null;
      p.resolve();
    }
    cacheRef.current = null;
  }, [pathname]);

  const contentEl = useCallback(() => document.getElementById(contentId), [contentId]);

  const prepare = useCallback(() => {
    if (busyRef.current) return;
    const el = contentEl();
    if (!el) return;
    const c = cacheRef.current;
    const path = cleanPath(window.location.pathname);
    if (c && c.path === path && c.scrollY === window.scrollY && performance.now() - c.time < SNAPSHOT_MAX_AGE_MS) return;
    const promise = snapshot(el);
    promise.catch(() => {
      if (cacheRef.current?.promise === promise) cacheRef.current = null;
    });
    cacheRef.current = { promise, path, scrollY: window.scrollY, time: performance.now() };
  }, [contentEl]);

  // Site-wide mode: remember where the visitor pressed, start snapshots on link hover, and keep the
  // site's text reveal from hiding text while pages are being captured.
  useEffect(() => {
    if (!optIn || !active) return;
    const onDown = (e: PointerEvent) => {
      pointerRef.current = { p: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }, time: performance.now() };
    };
    const onOver = (e: PointerEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const href = a?.getAttribute("href");
      if (href && href.startsWith("/") && handles(href)) prepare();
    };
    document.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onDown, { capture: true });
      document.removeEventListener("pointerover", onOver);
    };
  }, [optIn, active, prepare, handles]);

  // Keep the site's text reveal from hiding text while pages that use this transition are captured.
  useEffect(() => {
    if (!optIn) return;
    const el = contentEl();
    if (!el) return;
    if (enabled || onAutoRoute) el.setAttribute("data-no-text-anim", "");
    else el.removeAttribute("data-no-text-anim");
  }, [optIn, enabled, onAutoRoute, contentEl]);

  /** Sets up the canvas and uniforms for one run, using the current settings. */
  const makeRunner = useCallback((glState: GLState, canvas: HTMLCanvasElement, at: Pointer) => {
    const { gl, u, texFrom, texTo } = glState;
    const st = settingsRef.current;
    const ease = HALFTONE_EASES[st.ease]?.fn ?? HALFTONE_EASES.inOutCubic.fn;
    const upload = (tex: WebGLTexture, unit: number, src: HTMLCanvasElement) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform2f(u.uMouse, at.x, at.y);
    const portrait = window.innerHeight > window.innerWidth;
    gl.uniform1f(u.uZoom, portrait ? Math.max(3, (st.dotsAcross * 8) / 23) : st.dotsAcross);
    gl.uniform1f(u.uDotBlur, st.dotBlur);
    gl.uniform1f(u.uSpread, st.spread);
    gl.uniform1f(u.uAnchorPull, st.anchorPull);
    gl.uniform1f(u.uOldZoom, st.oldZoom);
    gl.uniform1f(u.uOldTurn, st.oldTurn);
    gl.uniform1f(u.uRGB, st.rgb);
    gl.uniform1f(u.uCRT, st.crt);
    gl.uniform1f(u.uNewScale, st.newScale);
    gl.uniform1f(u.uNewTurn, st.newTurn);
    gl.uniform1f(u.uRimWidth, st.rimWidth);
    gl.uniform1f(u.uRimEnd, st.rimEnd);
    gl.uniform1f(u.uNewRise, st.newRise);
    gl.uniform1f(u.uNewBlur, st.newBlur);
    gl.uniform1f(u.uNewSplit, st.newSplit);
    // The new page's own curve. It starts once holes begin to open, so the landing reads clearly.
    const arrive = (lin: number) => {
      if (st.arrival === "match") return ease(lin);
      const x = Math.min(1, Math.max(0, (lin - 0.12) / 0.88));
      if (st.arrival === "glide") return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); // ease-out expo
      const k = (st.overshoot / 0.1) * 1.70158; // ease-out back; overshoot 0.1 ≈ the classic 10%
      return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2);
    };
    gl.uniform1f(u.uHasTo, 0);
    const start = performance.now();
    let hasTo = false;
    let stopped = false;
    const draw = (lin: number) => {
      const e = easeOutCubic(lin);
      gl.uniform1f(u.uT, ease(lin));
      gl.uniform1f(u.uTIn, arrive(lin));
      gl.uniform1f(u.uBlur, 1 + 0.3 * e); // 1 -> 1.3
      gl.uniform1f(u.uSize2, 0.35 - 0.55 * e); // 0.35 -> -0.2
      gl.uniform1f(u.uTime, (performance.now() - start) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    return {
      setFrom(snap: Snapshot) {
        upload(texFrom, 0, snap.canvas);
        gl.uniform4f(u.uFromRect, ...snap.rect);
      },
      setTo(snap: Snapshot) {
        upload(texTo, 1, snap.canvas);
        gl.uniform4f(u.uToRect, ...snap.rect);
        gl.uniform1f(u.uHasTo, 1);
        hasTo = true;
      },
      stop() {
        stopped = true;
      },
      show() {
        canvas.style.display = "block";
        draw(0);
      },
      hide() {
        canvas.style.display = "none";
        gl.clear(gl.COLOR_BUFFER_BIT);
      },
      /** Runs the effect. Until the new page is ready, progress crawls once the holes start to open
       *  (instead of revealing empty holes or freezing), then carries on at full speed. */
      run() {
        const ms = Math.max(200, st.duration * 1000);
        let lin = 0;
        let last = performance.now();
        return new Promise<void>((resolve) => {
          const step = (now: number) => {
            if (stopped) return resolve();
            const dt = Math.min(64, Math.max(0, now - last)); // cap so a stalled frame doesn't jump ahead
            last = now;
            const speed = !hasTo && lin > HOLD_AT ? 0.06 : 1;
            lin = Math.min(1, lin + (dt / ms) * speed);
            draw(lin);
            if (lin < 1) requestAnimationFrame(step);
            else resolve();
          };
          requestAnimationFrame(step);
        });
      },
    };
  }, []);

  const navigate = useCallback(
    async (href: string, pointer?: Pointer) => {
      const target = cleanPath(href);
      if (busyRef.current || target === cleanPath(window.location.pathname)) return;
      const glState = glRef.current;
      const canvas = canvasRef.current;
      const el = contentEl();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!active || !glState || !canvas || !el || reduced) {
        router.push(href);
        return;
      }
      const recent = pointerRef.current && performance.now() - pointerRef.current.time < 1500 ? pointerRef.current.p : null;
      const at = pointer ?? recent ?? { x: 0.5, y: 0.5 };

      busyRef.current = true;
      const fx = makeRunner(glState, canvas, at);
      let running: Promise<void> | null = null;

      try {
        // 1. old page (usually already captured on hover) — start moving right away
        prepare();
        const from = await cacheRef.current!.promise;
        fx.setFrom(from);
        fx.show();
        freezePage(el);
        running = fx.run();

        // 2. change route underneath and wait for it to render
        await new Promise<void>((resolve) => {
          pendingRef.current = { path: target, resolve };
          router.push(href, { scroll: false });
          window.setTimeout(resolve, ROUTE_TIMEOUT_MS);
        });
        if (cleanPath(window.location.pathname) !== target) {
          // the route never arrived in time: drop the effect, let the navigation finish normally
          throw new Error("route change timed out");
        }
        lenis()?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo(0, 0);
        await nextFrame();
        await nextFrame();
        if (document.fonts) await document.fonts.ready;
        await settleImages(el);
        await settleAnimations(el);

        // 3. new page (captured while hidden), dropped into the effect already in motion
        fx.setTo(await snapshot(el));

        // 4. let the effect finish
        await running;
      } catch (err) {
        console.error("[HalftoneTransition]", err);
        fx.stop();
        await running;
        if (cleanPath(window.location.pathname) !== target) router.push(href);
      } finally {
        unfreezePage(el);
        fx.hide();
        cacheRef.current = null;
        busyRef.current = false;
      }
    },
    [contentEl, active, prepare, router, makeRunner],
  );

  /** Play the transition in place, with the current page as both "old" and "new". For tuning. */
  const preview = useCallback(
    async (pointer: Pointer = { x: 0.5, y: 0.5 }) => {
      const glState = glRef.current;
      const canvas = canvasRef.current;
      const el = contentEl();
      if (busyRef.current || !glState || !canvas || !el) return;
      busyRef.current = true;
      const fx = makeRunner(glState, canvas, pointer);
      try {
        const snap = await snapshot(el);
        fx.setFrom(snap);
        fx.setTo(snap);
        fx.show();
        freezePage(el);
        await fx.run();
      } catch (err) {
        console.error("[HalftoneTransition]", err);
      } finally {
        unfreezePage(el);
        fx.hide();
        busyRef.current = false;
      }
    },
    [contentEl, makeRunner],
  );

  const value = useMemo(
    () => ({ enabled, handles, navigate, prepare, settings, setSettings, resetSettings, preview, closeTuner }),
    [enabled, handles, navigate, prepare, settings, setSettings, resetSettings, preview, closeTuner],
  );

  return (
    <HalftoneContext.Provider value={value}>
      {children}
      {/* Portaled to <body>: an ancestor with a transform/filter would otherwise make
          "fixed" relative to the page wrapper and stretch the canvas to the page height. */}
      {mounted &&
        active &&
        createPortal(
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 h-[100vh] w-[100vw]"
            style={{ display: "none", zIndex: 60 }}
          />,
          document.body,
        )}
      {mounted && active && tunerOpen && createPortal(<HalftoneTuner />, document.body)}
    </HalftoneContext.Provider>
  );
}

type HalftoneLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

/** A link that runs the halftone transition from the point you clicked. */
export function HalftoneLink({ href, onClick, onPointerEnter, children, ...rest }: HalftoneLinkProps) {
  const { navigate, prepare } = useHalftone();

  const handleEnter = (e: ReactPointerEvent<HTMLAnchorElement>) => {
    onPointerEnter?.(e);
    prepare(); // start the snapshot early so the click feels instant
  };

  const handleClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    let x = e.clientX;
    let y = e.clientY;
    if (e.detail === 0) {
      // keyboard activation: use the link's centre
      const r = e.currentTarget.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    navigate(href, { x: x / window.innerWidth, y: y / window.innerHeight });
  };

  return (
    <Link href={href} onClick={handleClick} onPointerEnter={handleEnter} {...rest}>
      {children}
    </Link>
  );
}
