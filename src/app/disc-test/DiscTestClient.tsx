"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => { };
const getBody = () => (typeof document !== "undefined" ? document.body : null);
const getBodyServer = () => null;
import * as THREE from "three";
import {
  TILT,
  aimCamera,
  createDisc,
  createDiscKit,
  createRenderer,
  disposeDisc,
  placeShadow,
  screenDiscToWorld,
  updateShadowTexture,
  type Disc,
  type DiscKit,
  type ShadowConfig,
  DEFAULT_SHADOW_CONFIG,
} from "./discScene";
import DiscShadowTuner from "./DiscShadowTuner";
import { ALBUMS, type Album } from "./data";
import { InfoLayout } from "./layouts";
import { TRANSITIONS, type TransitionName } from "./transitions";

import type { DiscItem } from "./data";
export type { DiscItem };

/** Viewport position (px, center) and diameter of an on-page disc that the
 *  first 3D disc should launch from and return to. */
export type DiscOrigin = { x: number; y: number; size: number };

const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------------------------ */
/*  Tunables                                                           */
/* ------------------------------------------------------------------ */
const SPACING_X = 2.75;
const SPACING_Y = 0.8;
const DEPTH = 0.9;
const EASE = 0.085;

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
export default function DiscTestClient({
  items,
  fontClass = "",
  onClose,
  transition = "scatter",
  origin,
  onHandoff,
}: {
  items: DiscItem[];
  fontClass?: string;
  /** when provided, Esc / tapping empty space exits the stage */
  onClose?: () => void;
  transition?: TransitionName;
  /** on-page disc the first 3D disc grows out of (and returns to) */
  origin?: DiscOrigin;
  /** fired once the 3D disc is drawn on top of the origin disc, so the page can hide its copy */
  onHandoff?: () => void;
}) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // Render outside the site's transformed page wrapper so `fixed` is truly viewport-fixed.
    const el = document.createElement("div");
    el.className = fontClass;
    document.body.appendChild(el);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("vault-open");
    document.body.classList.add("vault-open");
    setHost(el);
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("vault-open", "vault-closing");
      document.body.classList.remove("vault-open", "vault-closing");
      el.remove();
    };
  }, [fontClass]);
  if (!host) return null;
  return createPortal(
    <DiscStage items={items} onClose={onClose} transition={transition} origin={origin} onHandoff={onHandoff} />,
    host,
  );
}

function DiscStage({
  items,
  onClose,
  transition = "snappy",
  origin,
  onHandoff,
}: {
  items: DiscItem[];
  onClose?: () => void;
  transition?: TransitionName;
  origin?: DiscOrigin;
  onHandoff?: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  // read inside the render loop, so the three.js effect doesn't rebuild when these change
  const originRef = useRef(origin);
  const handoffRef = useRef(onHandoff);
  const closedRef = useRef(false);
  const targetRef = useRef(0);
  const goToRef = useRef<(i: number) => void>(() => { });
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const bodyEl = useSyncExternalStore(emptySubscribe, getBody, getBodyServer);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Active fast transition state (versioned localStorage persistence)
  const [currentTransition] = useState<TransitionName>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("7thheaven_vault_transition_v1") as TransitionName;
        if (saved && TRANSITIONS[saved]) return saved;
      } catch {
        // ignore storage restrictions
      }
    }
    return transition && TRANSITIONS[transition] ? transition : "snappy";
  });

  const transitionRef = useRef(currentTransition);

  // 3D Disc Shadow Config & Tuner state (persisted in localStorage)
  const [shadowConfig, setShadowConfig] = useState<ShadowConfig>(DEFAULT_SHADOW_CONFIG);
  const shadowConfigRef = useRef(shadowConfig);
  const kitRef = useRef<DiscKit | null>(null);

  useEffect(() => {
    shadowConfigRef.current = shadowConfig;
    if (kitRef.current) {
      updateShadowTexture(kitRef.current, shadowConfig.softness, shadowConfig.opacity);
    }
  }, [shadowConfig]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("disc_shadow_config_v2");
      if (saved) {
        setShadowConfig((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {
      // ignore
    }
  }, []);

  // preview player: first track of whichever album disc is centered
  const [preview, setPreview] = useState<{ title: string; playing: boolean; pct: number } | null>(null);
  const lastPreviewed = useRef<number | null>(null);

  /**
   * Opening is always triggered by a click/tap/keypress, so starting playback
   * here — synchronously, inside that gesture — is what lets iOS allow it.
   */
  const openDisc = (i: number) => {
    setOpen(i);
    lastPreviewed.current = i;
    const audio = audioRef.current;
    const id = items[i]?.albumId;
    const first = id ? ALBUMS.find((a) => a.id === id)?.tracks[0] : undefined;
    if (!audio || !first) return;
    audio.src = first.audioUrl;
    void audio.play().catch(() => { });
  };
  const openDiscRef = useRef(openDisc);

  const closeDisc = () => {
    setOpen(null);
    audioRef.current?.pause();
  };

  const togglePreview = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => { });
    else audio.pause();
  };
  const closeRef = useRef(closeDisc);
  // 1 = coming in, 0 = going out; the render loop eases toward this
  const phaseTarget = useRef(1);
  const [closing, setClosing] = useState(false);
  const finishExit = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose?.();
  };
  const finishRef = useRef(finishExit);
  const requestExit = () => {
    if (!onClose || phaseTarget.current === 0) return;
    phaseTarget.current = 0;
    setClosing(true);
    document.documentElement.classList.remove("vault-open");
    document.documentElement.classList.add("vault-closing");
    document.body.classList.remove("vault-open");
    document.body.classList.add("vault-closing");
    audioRef.current?.pause();
    // with an origin the render loop closes once the disc has landed back home;
    // this timer is only a safety net (e.g. the tab is hidden and rAF is paused)
    const outTime = (TRANSITIONS[transitionRef.current] || TRANSITIONS.snappy).outMs;
    window.setTimeout(finishExit, outTime + (originRef.current ? 400 : 0));
  };
  const exitRef = useRef<(() => void) | undefined>(undefined);
  const [hovering, setHovering] = useState(false);
  const openRef = useRef<number | null>(null);

  useEffect(() => {
    originRef.current = origin;
    handoffRef.current = onHandoff;
    transitionRef.current = currentTransition;
    openDiscRef.current = openDisc;
    closeRef.current = closeDisc;
    finishRef.current = finishExit;
    exitRef.current = onClose ? requestExit : undefined;
    openRef.current = open;
  });


  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = items.length;

    /* renderer / scene / camera — built from the same kit as the page's banner disc */
    const renderer = createRenderer();
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const kit = createDiscKit(renderer, scene);
    kitRef.current = kit;
    updateShadowTexture(kit, shadowConfigRef.current.softness, shadowConfigRef.current.opacity);

    const discs: Disc[] = [];
    const hitMeshes: THREE.Mesh[] = [];
    // the hand-off from the page's disc waits for the first disc's artwork,
    // so the swap is invisible; never wait longer than this
    let firstLabelReady = false;
    const readyTimer = window.setTimeout(() => (firstLabelReady = true), 900);

    items.forEach((item, i) => {
      const d = createDisc(kit, item, i, i === 0 ? () => (firstLabelReady = true) : undefined);
      // the disc launched from the page starts upright, like the page's copy
      d.spin.rotation.z = i === 0 && originRef.current ? 0 : Math.random() * Math.PI * 2;
      discs.push(d);
      hitMeshes.push(d.hitMesh);
    });

    /* sizing */
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      aimCamera(camera, w, h);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    /* input */
    let progress = 0;
    let lastActive = -1;
    let snapTimer: number | undefined;
    const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));
    const scheduleSnap = (delay = 140) => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        targetRef.current = Math.round(targetRef.current);
      }, delay);
    };
    goToRef.current = (i: number) => {
      window.clearTimeout(snapTimer);
      targetRef.current = clamp(i);
    };

    const onWheel = (e: WheelEvent) => {
      if (openRef.current !== null) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 800 : 1;
      const d = (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
      targetRef.current = clamp(targetRef.current + d * 0.0016);
      scheduleSnap();
    };

    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    const pointer = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const pick = (cx: number, cy: number) => {
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(hitMeshes, false)[0];
      return hit ? (hit.object.userData.index as number) : -1;
    };
    const onDown = (e: PointerEvent) => {
      if (openRef.current !== null) return;
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        const w = mount.clientWidth;
        targetRef.current = clamp(targetRef.current - (dx / w) * 3 - (dy / w) * 1.5);
      } else if (e.pointerType === "mouse") {
        setHovering(pick(e.clientX, e.clientY) !== -1);
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (moved < 18) {
        const i = pick(e.clientX, e.clientY);
        if (i !== -1) {
          // Immediately center the target disc and open its songs panel
          targetRef.current = i;
          openDiscRef.current(i);
          return;
        }
        // a tap on empty space (no disc, and the nav/caption sit above the
        // canvas so their clicks never reach here) dismisses the vault
        if (exitRef.current) {
          exitRef.current();
          return;
        }
      }
      scheduleSnap(0);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openRef.current !== null) closeRef.current();
        else exitRef.current?.();
        return;
      }
      if (openRef.current !== null) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goToRef.current(Math.round(targetRef.current) + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goToRef.current(Math.round(targetRef.current) - 1);
      if (e.key === "Enter") openDiscRef.current(Math.round(targetRef.current));
    };

    const el = renderer.domElement;
    el.style.touchAction = "none";
    mount.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);

    /* loop */
    const clock = new THREE.Clock();
    let phase = reduce ? 1 : 0; // raw 0..1
    let raf = 0;


    // launch-from-page state: disc 0 starts on top of the page's disc and
    // flies into its slot, then flies back home on exit
    const fromPage = Boolean(originRef.current);
    let handedOff = !fromPage;
    let exiting = false;
    let exitPhase = 1;
    let exitWeight = 1;
    let exitSpin = 0;
    /** the page disc's center + scale, converted to world units on the z=0 plane */
    const pageDisc = () => {
      const o = originRef.current;
      if (!o) return null;
      return screenDiscToWorld(camera, mount.clientWidth || 1, mount.clientHeight || 1, o);
    };

    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      // hold everything until the launched disc's artwork is on the GPU
      const waiting = !handedOff && !firstLabelReady;
      // discs sweep in from the back on first paint
      const dir = phaseTarget.current;
      const T = TRANSITIONS[transitionRef.current] || TRANSITIONS.snappy;
      const span = (dir === 1 ? T.inMs : T.outMs) / 1000;
      if (!waiting) {
        phase = reduce ? dir : Math.max(0, Math.min(1, phase + (dir === 1 ? dt / span : -dt / span)));
      }
      const ease = T.ease ?? ((t: number) => t);
      const intro = ease(phase);
      const tf = T.at(intro);
      const fade = Math.min(1, intro * 1.6);
      if (dir === 0 && !exiting) {
        exiting = true;
        exitPhase = phase || 1;
        exitWeight = intro;
        const r = discs[0]?.spin.rotation.z ?? 0;
        exitSpin = Math.atan2(Math.sin(r), Math.cos(r));
      }
      // 0 = sitting on the page disc, 1 = in its carousel slot.
      // Use smoothstep for takeoff so it starts with 0 velocity (no sudden jolt/snap),
      // and decelerates softly when returning home.
      const smoothstep = (t: number) => Math.max(0, Math.min(1, t)) * Math.max(0, Math.min(1, t)) * (3 - 2 * Math.max(0, Math.min(1, t)));
      const launch = fromPage
        ? (exiting ? exitWeight * (1 - outCubic(1 - phase / exitPhase)) : smoothstep(phase))
        : intro;
      if (stageRef.current) stageRef.current.style.opacity = fromPage ? "1" : String(fade);
      if (bgRef.current) bgRef.current.style.opacity = fromPage ? String(fade) : "1";
      const k = reduce ? 1 : 1 - Math.pow(1 - EASE, dt * 60);
      progress += (targetRef.current - progress) * k;
      const vel = targetRef.current - progress;
      const home = fromPage ? pageDisc() : null;

      discs.forEach((d, i) => {
        const off = i - progress;
        const a = Math.abs(off);
        let x = off * SPACING_X * tf.spread;
        let y = off * SPACING_Y * tf.spread + 0.12 + tf.y;
        let z = -a * DEPTH + tf.z;
        let s = (1 - Math.min(a, 1.5) * 0.12) * tf.scale;
        let rx = TILT.x + vel * 0.25;
        let ry = TILT.y - off * 0.08;
        let vis = a < 3.5;

        if (i === 0 && home) {
          x = lerp(home.x, x, launch);
          y = lerp(home.y, y, launch);
          z = lerp(0, z, launch);
          s = lerp(home.s, s, launch);
          rx = lerp(TILT.x, rx, launch);
          ry = lerp(TILT.y, ry, launch);
          vis = !waiting && (vis || launch < 1);
          if (exiting) {
            // unwind the spin so it lands upright, matching the page disc
            d.spin.rotation.z = exitWeight > 0 ? exitSpin * (launch / exitWeight) : 0;
          } else if (!reduce && !waiting) {
            d.spin.rotation.z -= dt * (0.12 + Math.abs(vel) * 6 + tf.spin * 0.3);
          }
        } else if (!reduce) {
          d.spin.rotation.z -= dt * (0.12 + Math.abs(vel) * 6 + tf.spin);
        }

        d.group.position.set(x, y, z);
        d.group.scale.setScalar(s);
        d.group.rotation.set(rx, ry, TILT.z);
        d.group.visible = vis;

        d.shadow.visible = vis;
        const carouselShadow = Math.max(0, 0.95 - a * 0.16) * intro;
        const pageShadow = 0.95;
        const currentShadow = i === 0 && home ? lerp(pageShadow, carouselShadow, launch) : carouselShadow;
        placeShadow(d, x, y, z, s, currentShadow, rx, ry, shadowConfigRef.current);
      });

      const now = Math.round(clamp(progress));
      if (now !== lastActive) {
        lastActive = now;
        setActive(now);
      }
      renderer.render(scene, camera);

      // the 3D disc is now drawn exactly over the page's disc: let the page hide its copy
      if (!handedOff && !waiting) {
        handedOff = true;
        handoffRef.current?.();
      }
      // landed back on the page disc: unmount on this exact frame
      if (fromPage && exiting && phase === 0) finishRef.current();

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(snapTimer);
      window.clearTimeout(readyTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      mount.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      discs.forEach(disposeDisc);
      kitRef.current = null;
      kit.dispose();
      renderer.dispose();
      el.remove();
    };
  }, [items]);

  // when a new album disc lands in the center, cue up (and play) its first song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || open !== null) return;
    if (lastPreviewed.current === active) return;
    lastPreviewed.current = active;

    const id = items[active]?.albumId;
    const first = id ? ALBUMS.find((a) => a.id === id)?.tracks[0] : undefined;
    if (!first) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setPreview(null);
      return;
    }
    audio.src = first.audioUrl;
    setPreview({ title: first.title, playing: false, pct: 0 });

    // wait for the carousel to settle before starting, so flicking past
    // several discs doesn't machine-gun play()/pause()
    const t = window.setTimeout(() => {
      // always try; the browser refuses until the visitor has interacted,
      // and that rejection is harmless
      void audio.play().catch(() => { });
    }, 320);
    return () => window.clearTimeout(t);
  }, [active, open, items]);

  // mirror the audio element into the preview UI
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () =>
      setPreview((p) =>
        p
          ? {
            ...p,
            playing: !audio.paused,
            pct: audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
          }
          : p,
      );
    const evts = ["play", "playing", "pause", "timeupdate", "ended"] as const;
    evts.forEach((e) => audio.addEventListener(e, sync));
    return () => evts.forEach((e) => audio.removeEventListener(e, sync));
  }, []);

  const item = items[active];
  const detail = open !== null ? items[open] : null;
  const album = detail?.albumId ? ALBUMS.find((a) => a.id === detail.albumId) : undefined;
  const pad = (v: number) => String(v).padStart(2, "0");
  const iconBtn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-[background-color,transform] duration-150 hover:scale-105 hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-ring)]";

  return (
    <section
      data-lenis-prevent
      ref={stageRef}
      className={`disc-stage fixed inset-x-0 top-0 h-[100dvh] z-[90000] overflow-hidden text-[var(--color-text-primary)] select-none ${closing ? "is-closing" : ""}`}
    >
      <h1 className="sr-only">Disc library</h1>

      {/* opened over a real page, so it needs its own backdrop; it fades on its
          own so a disc launched from the page is never faded with it */}
      {onClose && (
        <div
          ref={bgRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 backdrop-blur-2xl backdrop-saturate-150 bg-[radial-gradient(ellipse_at_30%_15%,rgba(83,17,97,0.72)_0%,rgba(35,10,45,0.84)_45%,rgba(5,3,10,0.92)_100%)]"
        />
      )}

      {/* WebGL stage */}
      <div
        ref={mountRef}
        className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full"
        style={{ cursor: hovering ? "pointer" : "grab" }}
        aria-label="Disc library. Scroll, drag or use arrow keys to browse. Press Enter to open."
        role="region"
      />

      {/* 3D Disc Shadow UI Tuner */}
      <DiscShadowTuner
        config={shadowConfig}
        onChange={setShadowConfig}
        onReset={() => setShadowConfig(DEFAULT_SHADOW_CONFIG)}
      />

      {/* Info layout */}
      <InfoLayout
        item={item}
        items={items}
        active={active}
        onOpen={() => openDiscRef.current(active)}
        onGo={(i) => goToRef.current(i)}
        preview={preview}
        onTogglePreview={togglePreview}
      />

      {/* Detail panel — docked right, portaled to body with higher z-index than the site nav */}
      {detail &&
        bodyEl &&
        createPortal(
          <dialog
            open
            className="fixed inset-0 z-[2147483020] m-0 h-full w-full max-h-none max-w-none border-0 bg-transparent p-0 block"
            aria-modal="false"
            aria-label={detail.title}
          >
            {/* click-away: transparent, so the discs stay visible */}
            <button aria-label="Close" onClick={closeDisc} className="absolute inset-0 cursor-default" />
            <div className="disc-panel disc-panel-glass absolute inset-y-0 right-0 flex w-full flex-col overflow-hidden sm:w-[min(92vw,24rem)] sm:border-l sm:border-white/15 shadow-[-24px_0_60px_rgba(0,0,0,0.85)] z-10">
              <button
                onClick={closeDisc}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-[background-color,transform] duration-150 hover:scale-105 hover:bg-white/15 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-ring)]"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              {album ? <TrackModal album={album} item={detail} audioRef={audioRef} /> : null}
            </div>
          </dialog>,
          bodyEl,
        )}

      {/* one audio element for the whole stage, so playback can start inside the click */}
      <audio ref={audioRef} preload="none">
        <track kind="captions" />
      </audio>

      <style>{`
        body:has(.disc-stage) .preloader-overlay { display: none !important; }
        /* the stage is transparent, so keep the page's own footer from showing through */
        body:has(.disc-stage) > div > footer { display: none !important; }
        .disc-seek { -webkit-appearance: none; appearance: none; height: 16px; background: transparent; }
        .disc-seek::-webkit-slider-runnable-track { height: 3px; border-radius: 999px; background: linear-gradient(to right, var(--color-action) var(--pct, 0%), rgba(255,255,255,0.2) var(--pct, 0%)); }
        .disc-seek::-moz-range-track { height: 3px; border-radius: 999px; background: linear-gradient(to right, var(--color-action) var(--pct, 0%), rgba(255,255,255,0.2) var(--pct, 0%)); }
        .disc-seek::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; margin-top: -4.5px; height: 12px; width: 12px; border-radius: 999px; background: #fff; }
        .disc-seek::-moz-range-thumb { height: 12px; width: 12px; border: 0; border-radius: 999px; background: #fff; }
        .disc-seek:focus-visible { outline: 2px solid var(--color-action-ring); outline-offset: 4px; }
        .disc-bar { height: 10px; animation: discBar .9s ease-in-out infinite; }
        @keyframes discBar { 0%,100% { height: 4px; } 50% { height: 11px; } }
        @keyframes discThumbSpin { to { transform: rotate(360deg); } }
        .disc-stage { opacity: 0; }
        .disc-chrome { animation: discChromeIn .6s .25s cubic-bezier(.22,1,.36,1) both; }
        .is-closing .disc-chrome, .is-closing .disc-panel, .is-closing .disc-nav-glass { animation: discChromeOut .32s ease both; }
        @keyframes discChromeOut {
          to {
            opacity: 0;
            filter: blur(12px);
            transform: translate3d(0, 10px, 0);
          }
        }
        @keyframes discChromeIn {
          from {
            opacity: 0;
            filter: blur(14px);
            transform: translate3d(0, 12px, 0);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0);
          }
        }
        .disc-blink { animation: discBlink 1s steps(1) infinite; }
        @keyframes discBlink { 50% { opacity: 0; } }
        .disc-panel { animation: discPanelIn .35s cubic-bezier(.22,1,.36,1) both; }
        @keyframes discPanelIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
        .disc-card { will-change: opacity, transform, filter; }
        .disc-card > * {
          animation: discIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: opacity, transform, filter;
        }
        .disc-card > :nth-child(1) { animation-delay: 0ms; }
        .disc-card > :nth-child(2) { animation-delay: 45ms; animation-duration: 0.6s; }
        .disc-card > :nth-child(3) { animation-delay: 90ms; }
        .disc-card > :nth-child(4) { animation-delay: 135ms; }
        .disc-pop { animation: discIn .25s cubic-bezier(.22,1,.36,1) both; }
        @keyframes discIn {
          from {
            opacity: 0;
            filter: blur(14px);
            transform: translate3d(0, 12px, 0);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0);
          }
        }
        .disc-detail { animation: discFade .3s ease both; }
        @keyframes discFade {
          from {
            opacity: 0;
            filter: blur(10px);
          }
          to {
            opacity: 1;
            filter: blur(0);
          }
        }
        .disc-nav-glass {
          isolation: auto !important;
          transform: none !important;
        }
        .disc-panel-glass {
          background: rgba(15, 8, 28, 0.68) !important;
          background-image: radial-gradient(120% 45% at 50% 0%, rgba(140, 25, 170, 0.35) 0%, transparent 70%),
                            linear-gradient(180deg, rgba(50, 15, 65, 0.35) 0%, rgba(12, 7, 22, 0.72) 100%) !important;
          -webkit-backdrop-filter: blur(32px) saturate(180%) !important;
          backdrop-filter: blur(32px) saturate(180%) !important;
          isolation: auto !important;
        }
        @media (prefers-reduced-motion: reduce) { .disc-stage, .disc-chrome, .disc-card, .disc-pop, .disc-detail, .disc-panel, .disc-bar, .disc-blink, [style*="discThumbSpin"] { animation: none !important; } }
      `}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Songs modal                                                        */
/* ------------------------------------------------------------------ */
function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const r = Math.floor(sec % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

function TrackModal({
  album,
  item,
  audioRef,
}: {
  album: Album;
  item: DiscItem;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const track = album.tracks[index];
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // the <audio> lives on the stage (so playback can begin inside the opening
  // click); mirror its state here.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setTime(audio.currentTime);
    const onMeta = () => {
      setLength(audio.duration);
      setDurations((d) => ({ ...d, [album.tracks[indexRef.current].id]: audio.duration }));
    };
    const onPlay = () => {
      setIsPlaying(true);
      setLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setLoading(true);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    setIsPlaying(!audio.paused);
    if (audio.duration) setLength(audio.duration);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
    };
  }, [audioRef, album]);

  const play = async (i: number) => {
    const audio = audioRef.current;
    const t = album.tracks[i];
    if (!audio || !t) return;
    if (i !== index) {
      setIndex(i);
      setTime(0);
      setLength(0);
    }
    if (!audio.src.endsWith(t.audioUrl) && audio.src !== t.audioUrl) {
      audio.src = t.audioUrl;
    }
    setLoading(true);
    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const advance = (i: number) => {
    if (i >= 0 && i < album.tracks.length) void play(i);
    else setIsPlaying(false);
  };

  // auto-advance to the next song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => advance(index + 1);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  });

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else void play(index);
  };
  const step = (d: number) => advance(index + d);
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !length) return;
    const v = Number(e.target.value);
    audio.currentTime = (v / 100) * length;
    setTime(audio.currentTime);
  };

  const pct = length ? (time / length) * 100 : 0;

  return (
    <>
      {/* Player */}
      <div className="relative flex shrink-0 flex-col items-center gap-3 px-5 pb-5 pt-14 text-center after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={album.coverImage}
          alt={`${item.title} album cover`}
          className={`aspect-square w-40 rounded-[calc(var(--radius-box)-4px)] border border-white/15 object-cover transition-transform duration-500 ${isPlaying ? "scale-[1.02]" : ""
            }`}
        />
        <div className="flex w-full flex-col items-center gap-0.5">
          <p className="text-xs uppercase text-[var(--color-text-muted)]">
            {item.title} · {album.year}
          </p>
          <p className="w-full truncate text-sm uppercase text-white">{track.title}</p>
        </div>

        {/* Seek */}
        <div className="w-full">
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={pct}
            onChange={seek}
            aria-label="Seek"
            className="disc-seek pointer-events-auto w-full"
            style={{ ["--pct" as string]: `${pct}%` }}
          />
          <div className="flex justify-between text-[10px] tabular-nums text-[var(--color-text-muted)]">
            <span>{fmt(time)}</span>
            <span>{length ? fmt(length) : "--:--"}</span>
          </div>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => step(-1)}
            disabled={index === 0}
            aria-label="Previous track"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M13 2L5 8l8 6zM4 2v12" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-action)] text-black shadow-[0_0_24px_var(--color-action-ring)] transition-transform duration-150 hover:scale-105 active:scale-95"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            ) : isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <rect x="3" y="2" width="4" height="14" fill="currentColor" />
                <rect x="11" y="2" width="4" height="14" fill="currentColor" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M4 2l12 7-12 7z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            onClick={() => step(1)}
            disabled={index === album.tracks.length - 1}
            aria-label="Next track"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 2l8 6-8 6zM12 2v12" fill="currentColor" />
            </svg>
          </button>
        </div>

        <a
          href={album.storeUrl}
          className="pointer-events-auto text-xs font-semibold !text-[var(--color-action)] underline-offset-4 hover:underline"
        >
          Get the album
        </a>
      </div>

      {/* Tracklist */}
      <ol className="min-h-0 flex-1 overflow-y-auto p-2" data-lenis-prevent>
        {album.tracks.map((t, i) => {
          const isOn = i === index;
          return (
            <li key={t.id}>
              <button
                onClick={() => play(i)}
                aria-current={isOn}
                className={`group flex min-h-[48px] w-full items-center gap-3 rounded-[calc(var(--radius-box)-6px)] px-3 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-ring)] ${isOn ? "bg-white/10" : ""
                  }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs tabular-nums text-[var(--color-text-muted)] group-hover:text-white">
                  {isOn && isPlaying ? (
                    <span className="flex items-end gap-[2px]" aria-hidden="true">
                      <span className="disc-bar block w-[2px] bg-[var(--color-action)]" />
                      <span className="disc-bar block w-[2px] bg-[var(--color-action)]" style={{ animationDelay: ".15s" }} />
                      <span className="disc-bar block w-[2px] bg-[var(--color-action)]" style={{ animationDelay: ".3s" }} />
                    </span>
                  ) : (
                    <>
                      <span className="group-hover:hidden">{String(t.number).padStart(2, "0")}</span>
                      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="hidden group-hover:block">
                        <path d="M2 1l7 4-7 4z" fill="currentColor" />
                      </svg>
                    </>
                  )}
                </span>
                <span className={`flex-1 truncate text-sm uppercase ${isOn ? "text-[var(--color-action)]" : "text-white"}`}>
                  {t.title}
                </span>
                <span className="text-xs tabular-nums text-[var(--color-text-muted)]">{durations[t.id] ? fmt(durations[t.id]) : "--:--"}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}
