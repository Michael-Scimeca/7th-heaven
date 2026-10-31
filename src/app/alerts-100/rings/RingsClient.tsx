"use client";

/**
 * Travel radius — 20 radar-ring pickers. All live, bigger distance = bigger ring.
 * Fonts: Anton / LT Lemon / Inter only. No surface fills.
 */

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactElement } from "react";
import Link from "next/link";
import ShowRadiusRings, { type RadiusValue } from "@/components/ShowRadiusRings";
import "./rings.css";

type V = "15" | "30" | "50" | "100" | "all";
const ORDER: V[] = ["15", "30", "50", "100", "all"];
const LABEL: Record<V, string> = { "15": "15 Miles", "30": "30 Miles", "50": "50 Miles", "100": "100 Miles", all: "All Shows" };
const SHORT: Record<V, string> = { "15": "15", "30": "30", "50": "50", "100": "100", all: "∞" };
// ring radius in a 200×200 viewBox, centre 100,100
const R: Record<V, number> = { "15": 24, "30": 42, "50": 60, "100": 78, all: 94 };
const C = 100;
const inside = (v: V, sel: V) => ORDER.indexOf(v) <= ORDER.indexOf(sel);

// rough driving-ish distances from Palatine, IL, for the upcoming tour stops (approximate, example only)
const STOPS = [
  { name: "Durty Nellies", mi: 1, a: 20 },
  { name: "Home Bar", mi: 7, a: 120 },
  { name: "Sundance Saloon", mi: 14, a: 300 },
  { name: "Broken Oar", mi: 15, a: 220 },
  { name: "Bannerman's", mi: 13, a: 250 },
  { name: "Joe's Live", mi: 14, a: 150 },
  { name: "Old Republic", mi: 17, a: 200 },
  { name: "Stage 119", mi: 20, a: 165 },
  { name: "Huntley Fest", mi: 24, a: 235 },
  { name: "Basecamp", mi: 27, a: 185 },
  { name: "Tailgaters", mi: 33, a: 180 },
  { name: "Jamo's Live", mi: 42, a: 160 },
  { name: "Hollywood Casino", mi: 44, a: 175 },
  { name: "Hard Rock Gary", mi: 52, a: 135 },
  { name: "Bourbonnais Benefit", mi: 66, a: 170 },
  { name: "Hard Rock Rockford", mi: 70, a: 255 },
];
const countIn = (v: V) => (v === "all" ? STOPS.length : STOPS.filter((s) => s.mi <= Number(v)).length);
const stopXY = (s: (typeof STOPS)[number]) => {
  // place a stop between the rings for its distance band
  const t = s.mi <= 15 ? (s.mi / 15) * R["15"] : s.mi <= 30 ? R["15"] + ((s.mi - 15) / 15) * (R["30"] - R["15"]) : s.mi <= 50 ? R["30"] + ((s.mi - 30) / 20) * (R["50"] - R["30"]) : R["50"] + Math.min(1, (s.mi - 50) / 50) * (R["100"] - R["50"]);
  const rad = (s.a * Math.PI) / 180;
  return { x: C + Math.cos(rad) * t, y: C + Math.sin(rad) * t };
};

type P = { v: V; set: (v: V) => void };

/* keyboard: arrows step the radius on any focused picker */
const keys = ({ v, set }: P) => (e: KeyboardEvent) => {
  const i = ORDER.indexOf(v);
  if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); set(ORDER[Math.min(4, i + 1)]); }
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); set(ORDER[Math.max(0, i - 1)]); }
};

/* shared: clickable ring set in an SVG */
function Rings({ v, set, dashed = true, showLabels = false, glow = true, labelAt = "top", className = "" }: P & { dashed?: boolean; showLabels?: boolean; glow?: boolean; labelAt?: "top" | "right"; className?: string }) {
  return (
    <g className={className}>
      {[...ORDER].reverse().map((o) => (
        <g key={o}>
          <circle
            cx={C}
            cy={C}
            r={R[o]}
            className={`rg-ring${o === v ? " on" : ""}${inside(o, v) ? " in" : ""}${dashed ? " dash" : ""}${glow ? " glow" : ""}${o === "all" ? " inf" : ""}`}
            onClick={() => set(o)}
          />
          {showLabels && (
            <text
              x={labelAt === "top" ? C : C + R[o] * 0.82 + 3}
              y={labelAt === "top" ? C - R[o] - 3 : C - R[o] * 0.574 + 2}
              className={`rg-ringlabel${o === v ? " on" : ""}`}
              textAnchor={labelAt === "top" ? "middle" : "start"}
              onClick={() => set(o)}
            >
              {o === "all" ? "any" : o}
            </text>
          )}
        </g>
      ))}
      <circle cx={C} cy={C} r={3.2} className="rg-home" />
    </g>
  );
}
const Read = ({ v, sub }: { v: V; sub?: string }) => (
  <div className="rg-read">
    <span className="rg-anton">{LABEL[v]}</span>
    {sub && <span className="rg-sub">{sub}</span>}
  </div>
);

/* ── 20 versions ───────────────────────────────────────────────────── */
const V1 = (p: P) => (
  <div className="rg-row">
    <svg viewBox="0 0 200 200" className="rg-svg"><Rings {...p} /></svg>
    <Read v={p.v} />
  </div>
);

const V2 = (p: P) => (
  <div className="rg-row">
    <svg viewBox="0 0 200 200" className="rg-svg"><Rings {...p} showLabels dashed={false} /></svg>
    <Read v={p.v} sub="Tap a ring" />
  </div>
);

function V3(p: P) {
  return (
    <div className="rg-row">
      <svg viewBox="0 0 200 200" className="rg-svg">
        <Rings {...p} />
        <g className="rg-sweep" style={{ transformOrigin: "100px 100px" }}>
          <line x1={C} y1={C} x2={C} y2={C - R[p.v]} className="rg-sweepline" />
        </g>
        {STOPS.filter((s) => p.v === "all" || s.mi <= Number(p.v)).map((s) => {
          const { x, y } = stopXY(s);
          return <circle key={s.name} cx={x} cy={y} r={2.2} className="rg-blip" />;
        })}
      </svg>
      <Read v={p.v} sub={`${countIn(p.v)} upcoming shows inside`} />
    </div>
  );
}

const V4 = (p: P) => (
  <div className="rg-row">
    <svg viewBox="0 0 200 200" className="rg-svg"><Rings {...p} showLabels labelAt="right" /></svg>
    <Read v={p.v} />
  </div>
);

function V5({ v, set }: P) {
  // gauge: half rings, needle points to the chosen arc
  const ang = { "15": -150, "30": -120, "50": -90, "100": -60, all: -30 }[v];
  return (
    <div className="rg-col">
      <svg viewBox="0 0 200 120" className="rg-svg rg-svg--wide">
        {ORDER.map((o) => (
          <path key={o} d={`M ${C - R[o]} 110 A ${R[o]} ${R[o]} 0 0 1 ${C + R[o]} 110`} className={`rg-ring dash glow${o === v ? " on" : ""}${inside(o, v) ? " in" : ""}`} onClick={() => set(o)} />
        ))}
        <line x1={C} y1={110} x2={C + Math.cos((ang * Math.PI) / 180) * 92} y2={110 + Math.sin((ang * Math.PI) / 180) * 92} className="rg-needle" />
        <circle cx={C} cy={110} r={4} className="rg-home" />
      </svg>
      <div className="rg-ticks">
        {ORDER.map((o) => (
          <button key={o} type="button" aria-pressed={o === v} onClick={() => set(o)}>{o === "all" ? "Any" : `${o} mi`}</button>
        ))}
      </div>
    </div>
  );
}

function V6({ v, set }: P) {
  // drag the handle outward; snaps to the nearest ring
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const move = (e: RPointerEvent) => {
    if (drag === null || !svg.current) return;
    const b = svg.current.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width) * 200 - C;
    const y = ((e.clientY - b.top) / b.height) * 200 - C;
    const d = Math.min(96, Math.hypot(x, y));
    setDrag(d);
    const near = ORDER.reduce((a, o) => (Math.abs(R[o] - d) < Math.abs(R[a] - d) ? o : a), ORDER[0]);
    if (near !== v) set(near);
  };
  const r = drag ?? R[v];
  return (
    <div className="rg-row">
      <svg ref={svg} viewBox="0 0 200 200" className="rg-svg rg-drag" onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
        <Rings v={v} set={set} />
        <circle cx={C} cy={C} r={r} className="rg-live" />
        <line x1={C} y1={C} x2={C + r * 0.707} y2={C - r * 0.707} className="rg-sweepline" />
        <circle cx={C + r * 0.707} cy={C - r * 0.707} r={7} className="rg-handle" onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); setDrag(R[v]); }} />
      </svg>
      <Read v={v} sub="Drag the handle" />
    </div>
  );
}

function V7(p: P) {
  return (
    <div className="rg-row">
      <svg viewBox="0 0 200 200" className="rg-svg">
        <Rings {...p} glow={false} />
        {STOPS.map((s) => {
          const { x, y } = stopXY(s);
          const on = p.v === "all" || s.mi <= Number(p.v);
          return (
            <g key={s.name}>
              <circle cx={x} cy={y} r={on ? 2.6 : 1.6} className={`rg-stop${on ? " on" : ""}`}><title>{`${s.name} · ~${s.mi} mi`}</title></circle>
            </g>
          );
        })}
      </svg>
      <div className="rg-read">
        <span className="rg-anton">{countIn(p.v)} shows</span>
        <span className="rg-sub">{p.v === "all" ? "on the whole calendar" : `within ${p.v} miles of Palatine (approx.)`}</span>
      </div>
    </div>
  );
}

function V8(p: P) {
  const i = ORDER.indexOf(p.v);
  return (
    <div className="rg-col">
      <svg viewBox="0 0 200 200" className="rg-svg rg-svg--sm"><Rings {...p} /></svg>
      <input type="range" min={0} max={4} step={1} value={i} onChange={(e) => p.set(ORDER[+e.target.value])} className="rg-range" aria-label="Travel radius" aria-valuetext={LABEL[p.v]} />
      <div className="rg-ticks rg-ticks--flat">{ORDER.map((o) => <span key={o} className={o === p.v ? "on" : ""}>{o === "all" ? "Any" : o}</span>)}</div>
    </div>
  );
}

const V9 = (p: P) => (
  <div className="rg-row">
    <svg viewBox="0 0 200 200" className="rg-svg">
      <Rings {...p} />
      <circle cx={C} cy={C} r={R[p.v]} className="rg-pulse" key={p.v} />
      <circle cx={C} cy={C} r={R[p.v]} className="rg-pulse rg-pulse--2" key={`${p.v}-2`} />
    </svg>
    <Read v={p.v} />
  </div>
);

const V10 = ({ v, set }: P) => (
  <div className="rg-row">
    <svg viewBox="0 0 200 200" className="rg-svg">
      {[...ORDER].reverse().map((o, i) => (
        <circle key={o} cx={C} cy={C} r={R[o]} className={`rg-ring rg-spin${o === v ? " on" : ""}${inside(o, v) ? " in" : ""}`} style={{ animationDuration: `${18 + i * 7}s`, animationDirection: i % 2 ? "reverse" : "normal" }} onClick={() => set(o)} />
      ))}
      <circle cx={C} cy={C} r={3.2} className="rg-home" />
    </svg>
    <Read v={v} />
  </div>
);

const V11 = ({ v, set }: P) => (
  <div className="rg-bubbles" role="radiogroup" aria-label="Travel radius">
    {ORDER.map((o) => (
      <button key={o} type="button" role="radio" aria-checked={o === v} onClick={() => set(o)} style={{ width: `${R[o] * 1.25}px`, height: `${R[o] * 1.25}px` }}>
        <span>{o === "all" ? "Any" : o}</span>
        {o !== "all" && <small>mi</small>}
      </button>
    ))}
  </div>
);

function V12({ v, set }: P) {
  const i = ORDER.indexOf(v);
  return (
    <div className="rg-row">
      <button type="button" className="rg-step" onClick={() => set(ORDER[Math.max(0, i - 1)])} disabled={i === 0} aria-label="Smaller radius">−</button>
      <svg viewBox="0 0 200 200" className="rg-svg">
        <Rings v={v} set={set} />
        <text x={C} y={C + 9} textAnchor="middle" className="rg-centre">{SHORT[v]}</text>
        {v !== "all" && <text x={C} y={C + 22} textAnchor="middle" className="rg-centre-sub">miles</text>}
      </svg>
      <button type="button" className="rg-step" onClick={() => set(ORDER[Math.min(4, i + 1)])} disabled={i === 4} aria-label="Bigger radius">+</button>
    </div>
  );
}

function V13({ v, set }: P) {
  const [hov, setHov] = useState<V | null>(null);
  return (
    <div className="rg-row">
      <svg viewBox="0 0 200 200" className="rg-svg">
        <Rings v={hov ?? v} set={set} />
      </svg>
      <ul className="rg-list">
        {[...ORDER].reverse().map((o) => (
          <li key={o}>
            <button type="button" aria-pressed={o === v} onMouseEnter={() => setHov(o)} onMouseLeave={() => setHov(null)} onFocus={() => setHov(o)} onBlur={() => setHov(null)} onClick={() => set(o)}>
              {LABEL[o]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const V14 = ({ v, set }: P) => (
  <div className="rg-row">
    <svg viewBox="0 0 200 200" className="rg-svg">
      <Rings v={v} set={set} dashed={false} glow={false} />
      {ORDER.map((o, i) => {
        const prev = i === 0 ? 0 : R[ORDER[i - 1]];
        const mid = (R[o] + prev) / 2;
        return (
          <text key={o} x={C} y={C - mid + 4} textAnchor="middle" className={`rg-band${inside(o, v) ? " in" : ""}`} onClick={() => set(o)}>
            {o === "all" ? "∞" : o}
          </text>
        );
      })}
    </svg>
    <Read v={v} sub="Bullseye" />
  </div>
);

function V15(p: P) {
  const ref = useRef<HTMLDivElement>(null);
  const vRef = useRef(p.v);
  useEffect(() => {
    vRef.current = p.v;
  }, [p.v]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now - last < 220) return;
      last = now;
      const i = ORDER.indexOf(vRef.current);
      p.set(ORDER[Math.max(0, Math.min(4, i + (e.deltaY < 0 ? 1 : -1)))]);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [p]);
  return (
    <div className="rg-row" ref={ref}>
      <svg viewBox="0 0 200 200" className="rg-svg"><Rings {...p} /></svg>
      <Read v={p.v} sub="Scroll over the rings, or tap one" />
    </div>
  );
}

const V16 = (p: P) => (
  <div className="rg-row rg-neon">
    <svg viewBox="0 0 200 200" className="rg-svg"><Rings {...p} dashed={false} /></svg>
    <Read v={p.v} />
  </div>
);

function V17({ v, set }: P) {
  return (
    <div className="rg-col">
      <svg viewBox="0 0 200 200" className="rg-svg rg-svg--sm">
        <circle cx={C} cy={C} r={94} className="rg-ring dash" />
        <circle cx={C} cy={C} r={R[v]} className="rg-grow" />
        <circle cx={C} cy={C} r={3.2} className="rg-home" />
      </svg>
      <div className="rg-words" role="radiogroup" aria-label="Travel radius">
        {ORDER.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={o === v} onClick={() => set(o)}>{o === "all" ? "Any distance" : `${o} mi`}</button>
        ))}
      </div>
    </div>
  );
}

function V18({ v, set }: P) {
  const ang = { "15": -90, "30": -18, "50": 54, "100": 126, all: 198 }[v];
  return (
    <div className="rg-row">
      <svg viewBox="0 0 200 200" className="rg-svg">
        <circle cx={C} cy={C} r={84} className="rg-ring" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 * Math.PI) / 180;
          const long = i % 12 === 0;
          return <line key={i} x1={C + Math.cos(a) * 84} y1={C + Math.sin(a) * 84} x2={C + Math.cos(a) * (long ? 74 : 79)} y2={C + Math.sin(a) * (long ? 74 : 79)} className="rg-tick" />;
        })}
        {ORDER.map((o, i) => {
          const a = ((-90 + i * 72) * Math.PI) / 180;
          return (
            <text key={o} x={C + Math.cos(a) * 60} y={C + Math.sin(a) * 60 + 4} textAnchor="middle" className={`rg-dial${o === v ? " on" : ""}`} onClick={() => set(o)}>
              {SHORT[o]}
            </text>
          );
        })}
        <line x1={C} y1={C} x2={C + Math.cos((ang * Math.PI) / 180) * 44} y2={C + Math.sin((ang * Math.PI) / 180) * 44} className="rg-needle rg-needle--anim" />
        <circle cx={C} cy={C} r={4} className="rg-home" />
      </svg>
      <Read v={v} sub="Tap a number" />
    </div>
  );
}

function V19(p: P) {
  return (
    <div className="rg-row">
      <svg viewBox="0 0 200 200" className="rg-svg"><Rings {...p} /></svg>
      <ul className="rg-list rg-list--count">
        {ORDER.map((o) => (
          <li key={o}>
            <button type="button" aria-pressed={o === p.v} onClick={() => p.set(o)}>
              <span>{o === "all" ? "Any distance" : `${o} mi`}</span>
              <em>{countIn(o)} shows</em>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const V20 = ({ v, set }: P) => (
  <div className="rg-row">
    <svg viewBox="0 0 200 200" className="rg-svg rg-svg--bleed">
      {["15", "30", "50", "100"].map((o) => (
        <circle key={o} cx={C} cy={C} r={R[o as V]} className={`rg-ring dash glow${o === v ? " on" : ""}${inside(o as V, v) ? " in" : ""}`} onClick={() => set(o as V)} />
      ))}
      <circle cx={C} cy={C} r={130} className={`rg-ring rg-horizon${v === "all" ? " on" : ""}`} onClick={() => set("all")} />
      <circle cx={C} cy={C} r={3.2} className="rg-home" />
    </svg>
    <div className="rg-read">
      <span className="rg-anton">{LABEL[v]}</span>
      <button type="button" className="rg-anywhere" aria-pressed={v === "all"} onClick={() => set("all")}>Or anywhere — I&apos;ll travel ↗</button>
    </div>
  </div>
);

const VERSIONS: { name: string; C: (p: P) => ReactElement }[] = [
  { name: "Classic rings", C: V1 },
  { name: "Labels on the rings", C: V2 },
  { name: "Radar sweep with shows", C: V3 },
  { name: "Labels on the right edge", C: V4 },
  { name: "Gauge with a needle", C: V5 },
  { name: "Drag the radius", C: V6 },
  { name: "Shows in range", C: V7 },
  { name: "Rings + slider", C: V8 },
  { name: "Sonar pulse", C: V9 },
  { name: "Turning dashed rings", C: V10 },
  { name: "Bubbles in a row", C: V11 },
  { name: "Number in the middle", C: V12 },
  { name: "List that lights the ring", C: V13 },
  { name: "Bullseye bands", C: V14 },
  { name: "Scroll to resize", C: V15 },
  { name: "Neon", C: V16 },
  { name: "One growing ring", C: V17 },
  { name: "Dial with a needle", C: V18 },
  { name: "Show counts per ring", C: V19 },
  { name: "Horizon for 'anywhere'", C: V20 },
];

function Card({ i }: { i: number }) {
  const [v, set] = useState<V>("50");
  const { name, C: Comp } = VERSIONS[i];
  return (
    <section className="rg-card" id={`r-${i + 1}`} aria-label={`Version ${i + 1}: ${name}`}>
      <div className="rg-head">
        <span className="rg-anton rg-num">{String(i + 1).padStart(2, "0")}</span>
        <span className="rg-name">{name}</span>
      </div>
      <p className="rg-label">Travel radius</p>
      <div className="rg-stage" tabIndex={0} role="group" aria-label={`Travel radius, ${LABEL[v]}. Use arrow keys to change.`} onKeyDown={keys({ v, set })}>
        <Comp v={v} set={set} />
      </div>
    </section>
  );
}

function YourPick() {
  const [v, setV] = useState<RadiusValue>("50");
  const [zip, setZip] = useState("");
  return (
    <section className="rg-pick" aria-labelledby="rg-pick-t">
      <div className="rg-head">
        <span className="rg-anton rg-num">★</span>
        <span className="rg-name" id="rg-pick-t">Your pick — with real upcoming shows, live</span>
      </div>
      <label className="rg-zip" htmlFor="rg-zip">
        <span>Try a zip code</span>
        <input id="rg-zip" inputMode="numeric" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value)} placeholder="60067" />
      </label>
      <ShowRadiusRings value={v} onChange={setV} zip={zip} />
    </section>
  );
}

export default function RingsClient() {
  return (
    <div className="rg" data-no-text-anim>
      <header className="rg-top">
        <p className="rg-label">Show alert form</p>
        <h1 className="rg-anton rg-h1">Travel radius, 20 ways</h1>
        <p className="rg-lede">Every picker works. Bigger distance = bigger ring. Arrow keys work too once you click into one.</p>
        <div className="flex flex-wrap gap-3 mt-4 text-xs font-semibold uppercase tracking-wider">
          <Link href="/alerts-100" className="px-3.5 py-1.5 rounded-full border border-[var(--line)] text-[var(--soft)] hover:text-[var(--sun)] hover:border-[var(--sun)] transition-colors">
            ← 100 Layouts
          </Link>
          <Link href="/alerts-100/sentence" className="px-3.5 py-1.5 rounded-full border border-[var(--sun)] text-[var(--sun)] bg-[rgba(255,251,181,0.06)] hover:bg-[rgba(255,251,181,0.12)] transition-colors">
            ✦ 20 Conversational Sentence Forms
          </Link>
        </div>
      </header>
      <YourPick />
      <p className="rg-label" style={{ marginTop: 90 }}>The other 20</p>
      <div className="rg-grid" style={{ marginTop: 20 }}>
        {VERSIONS.map((_, i) => (
          <Card key={i} i={i} />
        ))}
      </div>
    </div>
  );
}
