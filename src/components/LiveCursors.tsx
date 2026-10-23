"use client";

/**
 * LiveCursors — shows other visitors on the site in real time.
 *
 * Modeled on carterogunsola.com's live presence:
 *  - one shared Supabase Realtime channel ("site_live")
 *  - presence → global "N here" count
 *  - broadcast "cursor" → other visitors' pointers on the SAME page
 *  - cursors glide toward their latest target (time-based easing, k=18)
 *  - throttled to 1 send / 50ms, 4s keepalive, 12s stale sweep
 *
 * Positions: x is a 0–1 fraction of viewport width (so layouts line up across
 * window sizes); y is the absolute page Y in px, so you only see a peer's
 * cursor when you're scrolled to the same part of the page.
 *
 * Visibility: every visitor starts HIDDEN — they see others, but don't send
 * a cursor and aren't counted. Tapping the pill makes them visible.
 *
 * Testing: add ?fakecursors=5 to any URL to spawn 5 local fake visitors
 * (only you see them; nothing is sent to anyone else). Max 20.
 *
 * Rendering is imperative (refs + one rAF loop) so cursor motion never
 * triggers React re-renders. Names are set with textContent, never innerHTML.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CHANNEL = "site_live";
const SEND_EVERY_MS = 50;
const KEEPALIVE_MS = 4000;
const STALE_MS = 12000;
const SMOOTHING = 18;

const COLORS = [
  "#c084fc", // purple
  "#f472b6", // pink
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#38bdf8", // sky
  "#a78bfa", // violet
  "#f87171", // red
];
const ADJECTIVES = [
  "Neon", "Electric", "Loud", "Cosmic", "Velvet", "Midnight", "Golden",
  "Wild", "Lucky", "Rockin'", "Purple", "Stellar",
];
const NOUNS = [
  "Drummer", "Roadie", "Guitarist", "Bassist", "Fan", "Singer", "Keytar",
  "Groupie", "Headliner", "Encore", "Amp", "Setlist",
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function identityFor(id: string) {
  const h = hash(id);
  return {
    color: COLORS[h % COLORS.length],
    name: `${ADJECTIVES[(h >>> 3) % ADJECTIVES.length]} ${NOUNS[(h >>> 7) % NOUNS.length]}`,
  };
}

/**
 * Chat pages share one layout per section but have per-user URLs
 * (/cruise/mikey, /cruise/sam…), so cursors are grouped by the first path
 * segment: everyone on any /cruise/* page is in the same "room".
 */
export function roomFor(pathname: string | null) {
  return "/" + ((pathname ?? "/").split("/")[1] ?? "");
}

type Peer = {
  el: HTMLDivElement;
  tx: number; // target x fraction
  ty: number; // target page y px
  rx: number; // rendered x fraction
  ry: number; // rendered page y px
  lastSeen: number;
  facingLeft: boolean;
};

type CursorMsg = { id: string; path: string; x: number; y: number };

function makeCursorEl(id: string) {
  const { color, name } = identityFor(id);
  const el = document.createElement("div");
  el.className = "live-cursor";
  el.style.cssText =
    "position:fixed;left:0;top:0;pointer-events:none;will-change:transform;transition:opacity .25s;opacity:0;";
  const arrow = document.createElement("div");
  arrow.className = "live-cursor-arrow";
  arrow.style.cssText = "transform-origin:2px 2px;transition:transform .15s;";
  arrow.innerHTML = `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true"><path d="M2 2L18 9.5L10.5 11.5L7.5 19.5L2 2Z" fill="${color}" stroke="rgba(0,0,0,.55)" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const label = document.createElement("div");
  label.style.cssText = `position:absolute;left:16px;top:18px;white-space:nowrap;font:600 11px/1 var(--font-inter),system-ui,sans-serif;letter-spacing:.02em;padding:4px 7px;border-radius:999px;color:#14061c;background:${color};box-shadow:0 2px 10px rgba(0,0,0,.35);`;
  label.textContent = name;
  el.append(arrow, label);
  return el;
}

export default function LiveCursors() {
  const pathname = usePathname();
  const pathRef = useRef(roomFor(pathname));
  const layerRef = useRef<HTMLDivElement>(null);
  const peersRef = useRef(new Map<string, Peer>());
  const fakeRespawnRef = useRef<() => void>(() => {});
  const [online, setOnline] = useState(0);
  // Start hidden on every visit; the visitor opts in to being seen.
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const leaveRef = useRef<() => void>(() => {});

  // On client-side navigation, drop cursors from the previous page.
  useEffect(() => {
    pathRef.current = roomFor(pathname);
    peersRef.current.forEach((p) => p.el.remove());
    peersRef.current.clear();
    fakeRespawnRef.current(); // fake visitors follow you to the new page
  }, [pathname]);

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return () => {};

    const supabase = createClient();
    const myId =
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)) as string;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const peers = peersRef.current;

    // ---- fake visitors for testing (?fakecursors=N) ----
    const fakeParam = new URLSearchParams(window.location.search).get(
      "fakecursors",
    );
    const fakeCount = Math.min(20, Math.max(0, parseInt(fakeParam ?? "", 10) || 0));
    const fakes = Array.from({ length: fakeCount }, (_, i) => ({
      id: `fake-${i + 1}-${Math.random().toString(36).slice(2, 6)}`,
      speed: 0.25 + Math.random() * 0.5,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      ax: 0.2 + Math.random() * 0.25,
      ay: 0.2 + Math.random() * 0.25,
    }));
    const spawnFakes = () => {
      fakes.forEach((f) => {
        if (peers.has(f.id)) return;
        const el = makeCursorEl(f.id);
        layer.appendChild(el);
        const y = window.scrollY + window.innerHeight / 2;
        peers.set(f.id, { el, tx: 0.5, ty: y, rx: 0.5, ry: y, lastSeen: performance.now(), facingLeft: false });
        requestAnimationFrame(() => (el.style.opacity = "1"));
      });
    };
    spawnFakes();
    fakeRespawnRef.current = spawnFakes;
    if (fakeCount) setOnline((n) => n + fakeCount);

    const channel = supabase.channel(CHANNEL, {
      config: { broadcast: { self: false }, presence: { key: myId } },
    });

    const removePeer = (id: string) => {
      const p = peers.get(id);
      if (!p) return;
      p.el.remove();
      peers.delete(id);
    };

    // Broadcasts are only sent over the websocket once joined; sending earlier
    // makes supabase-js fall back to the REST API (deprecated, logs a warning).
    let joined = false;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        // Count only people in my room (section), e.g. everyone on /cruise/*.
        const here = Object.values(state).filter((metas) =>
          (metas as Array<{ room?: string }>).some(
            (m) => m.room === pathRef.current,
          ),
        ).length;
        setOnline(here + fakeCount);
        // Anyone who left presence entirely loses their cursor.
        peers.forEach((_, id) => {
          if (!state[id] && !id.startsWith("fake-")) removePeer(id);
        });
      })
      .on("broadcast", { event: "cursor" }, ({ payload }: { payload: CursorMsg }) => {
        if (!payload || typeof payload.id !== "string" || payload.id === myId) return;
        if (payload.path !== pathRef.current) {
          removePeer(payload.id);
          return;
        }
        const x = Math.min(1, Math.max(0, Number(payload.x) || 0));
        const y = Math.max(0, Number(payload.y) || 0);
        let p = peers.get(payload.id);
        if (!p) {
          const el = makeCursorEl(payload.id);
          layer.appendChild(el);
          p = { el, tx: x, ty: y, rx: x, ry: y, lastSeen: 0, facingLeft: false };
          peers.set(payload.id, p);
          requestAnimationFrame(() => (p!.el.style.opacity = "1"));
        }
        const dx = x - p.tx;
        if (Math.abs(dx) > 0.002) p.facingLeft = dx < 0;
        p.tx = x;
        p.ty = y;
        p.lastSeen = performance.now();
      })
      .on("broadcast", { event: "leave" }, ({ payload }: { payload: { id: string } }) => {
        if (payload?.id) removePeer(payload.id);
      })
      .subscribe(async (status: string) => {
        joined = status === "SUBSCRIBED";
        if (joined && visibleRef.current) {
          await channel.track({ room: pathRef.current, at: Date.now() });
        }
      });

    // ---- sending my cursor ----
    let last: { x: number; y: number } | null = null;
    let lastSent = 0;
    let pending: ReturnType<typeof setTimeout> | null = null;

    const send = () => {
      if (!joined || !last || !visibleRef.current) return;
      lastSent = performance.now();
      channel.send({
        type: "broadcast",
        event: "cursor",
        payload: { id: myId, path: pathRef.current, x: last.x, y: last.y },
      });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      last = {
        x: e.clientX / window.innerWidth,
        y: e.clientY + window.scrollY,
      };
      const since = performance.now() - lastSent;
      if (since >= SEND_EVERY_MS) send();
      else if (!pending)
        pending = setTimeout(() => {
          pending = null;
          send();
        }, SEND_EVERY_MS - since);
    };
    const sendLeave = () => {
      if (!joined) return;
      channel.send({ type: "broadcast", event: "leave", payload: { id: myId } });
    };
    leaveRef.current = sendLeave;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendLeave();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sendLeave);
    const keepalive = setInterval(() => {
      if (last && document.visibilityState === "visible") send();
    }, KEEPALIVE_MS);

    // ---- render loop ----
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const a = reduceMotion ? 1 : 1 - Math.exp(-SMOOTHING * dt);
      const w = window.innerWidth;
      const sy = window.scrollY;
      const t = now / 1000;
      fakes.forEach((f) => {
        const p = peers.get(f.id);
        if (!p) return;
        const nx = 0.5 + f.ax * Math.sin(t * f.speed + f.px);
        if (Math.abs(nx - p.tx) > 0.0005) p.facingLeft = nx < p.tx;
        p.tx = nx;
        p.ty =
          sy + window.innerHeight * (0.5 + f.ay * Math.sin(t * f.speed * 1.3 + f.py));
        p.lastSeen = now;
      });
      peers.forEach((p, id) => {
        if (now - p.lastSeen > STALE_MS) {
          removePeer(id);
          return;
        }
        p.rx += (p.tx - p.rx) * a;
        p.ry += (p.ty - p.ry) * a;
        p.el.style.transform = `translate3d(${p.rx * w}px, ${p.ry - sy}px, 0)`;
        (p.el.firstChild as HTMLElement).style.transform = p.facingLeft
          ? "scaleX(-1)"
          : "none";
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(keepalive);
      if (pending) clearTimeout(pending);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sendLeave);
      sendLeave();
      channel.unsubscribe();
      supabase.removeChannel(channel);
      peers.forEach((p) => p.el.remove());
      peers.clear();
    };
  }, []);

  // Show / hide myself: join or leave presence, and stop my cursor.
  useEffect(() => {
    visibleRef.current = visible;
    const supabase = createClient();
    const ch = supabase
      .getChannels()
      .find((c: { topic: string }) => c.topic === `realtime:${CHANNEL}`);
    if (!ch) return;
    if (visible) {
      ch.track({ room: roomFor(pathname), at: Date.now() }).catch(() => {});
    } else {
      ch.untrack().catch(() => {});
      leaveRef.current();
    }
  }, [visible, pathname]);

  const toggle = () => setVisible((v) => !v);

  return (
    <>
      <div
        ref={layerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden"
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={visible}
        aria-label={`${online} ${online === 1 ? "person" : "people"} here now. You are ${visible ? "visible" : "hidden"}. ${visible ? "Hide" : "Show"} yourself`}
        title={visible ? "Others can see you — tap to hide" : "You're hidden — tap to show yourself"}
        className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-md transition-colors duration-200 hover:bg-black/70 hover:text-white"
      >
        <span className="relative flex h-2 w-2">
          {visible && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${visible ? "bg-emerald-400" : "bg-white/40"}`}
          />
        </span>
        {online} here
        <span className="text-white/40">·</span>
        <span className={visible ? "text-emerald-300" : "text-white/50"}>
          {visible ? "You're visible" : "You're hidden"}
        </span>
      </button>
    </>
  );
}
