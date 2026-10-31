"use client";

/**
 * Travel-radius rings with the band's real upcoming shows on them, live.
 *
 * - Shows come from /api/tour (Sanity, the same list as the tour page), re-fetched every
 *   60s and whenever the tab regains focus. A show drops off 4h after it starts (isShowOver).
 * - Each dot sits at the show's real compass bearing and distance from the visitor:
 *   their zip (via /api/proximity/geocode) or "Use my location"; Chicago until then.
 * - Private events are never plotted. A show without coordinates borrows them from the
 *   same venue's other dates; if none exist it's counted as "location not set".
 * - Bigger distance = bigger ring. Rings, dots and keyboard arrows all work.
 */

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { isShowOver } from "@/lib/tour-helpers";
import { distanceMiles } from "@/lib/geo";
import "./ShowRadiusRings.css";

export type RadiusValue = "15" | "30" | "50" | "100" | "all";
const ORDER: RadiusValue[] = ["15", "30", "50", "100", "all"];
const LABEL: Record<RadiusValue, string> = { "15": "15 Miles", "30": "30 Miles", "50": "50 Miles", "100": "100 Miles", all: "All Shows" };
const R: Record<RadiusValue, number> = { "15": 24, "30": 42, "50": 60, "100": 78, all: 94 };
const C = 100;
const CHICAGO = { lat: 41.8781, lng: -87.6298 };
const POLL_MS = 60_000;
// radar: a wave leaves the centre every PULSE_GAP and reaches the chosen ring in PULSE_TRAVEL
const PULSE_TRAVEL = 2.4; // seconds
const PULSE_GAP = 1.2; // seconds (two waves in flight)

type TourShow = {
  id?: string | null;
  _id?: string;
  venue: string;
  city?: string;
  state?: string;
  date: string;
  startDate?: string;
  time: string;
  day?: string;
  isPrivate?: boolean;
  lat?: number | null;
  lng?: number | null;
};
type Origin = { lat: number; lng: number; label: string; source: "zip" | "device" | "default" };
type Spot = { key: string; venue: string; city: string; mi: number; bearing: number; dates: TourShow[] };

/** compass bearing from a to b, degrees clockwise from north */
function bearing(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
/** miles → ring radius, piecewise so each band matches its ring */
function toR(mi: number) {
  const bands: [number, number, number, number][] = [
    [0, 15, 0, R["15"]],
    [15, 30, R["15"], R["30"]],
    [30, 50, R["30"], R["50"]],
    [50, 100, R["50"], R["100"]],
  ];
  for (const [a, b, ra, rb] of bands) if (mi <= b) return ra + ((mi - a) / (b - a)) * (rb - ra);
  return R["100"] + Math.min(1, (mi - 100) / 250) * (R.all - 4 - R["100"]);
}
const inRadius = (mi: number, v: RadiusValue) => v === "all" || mi <= Number(v);
const fmtDate = (s: TourShow) => {
  const iso = s.startDate || "";
  const d = /^\d{4}-\d{2}-\d{2}/.test(iso) ? new Date(`${iso}T12:00:00`) : null;
  return d ? d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : s.date;
};
const ago = (t: number | null, now: number) => {
  if (!t) return "loading…";
  const s = Math.max(0, Math.round((now - t) / 1000));
  return s < 10 ? "just now" : s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
};

export default function ShowRadiusRings({
  value,
  onChange,
  zip,
  showList = true,
}: {
  value: RadiusValue;
  onChange: (v: RadiusValue) => void;
  zip?: string;
  showList?: boolean;
}) {
  const [shows, setShows] = useState<TourShow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [origin, setOrigin] = useState<Origin>({ ...CHICAGO, label: "Chicago", source: "default" });
  const [locMsg, setLocMsg] = useState("");
  const [hover, setHover] = useState<Spot | null>(null);
  const [ringHover, setRingHover] = useState<RadiusValue | null>(null);

  /* live show list */
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/tour", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as TourShow[];
      if (Array.isArray(data)) {
        setShows(data);
        setUpdatedAt(Date.now());
        setFailed(false);
      }
    } catch {
      setFailed(true);
    }
  }, []);
  useEffect(() => {
    load();
    const poll = window.setInterval(load, POLL_MS);
    const onFocus = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    const clock = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  /* zip → origin */
  useEffect(() => {
    const z = (zip || "").replace(/\D/g, "");
    if (z.length !== 5) return;
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/proximity/geocode?zip=${z}`);
        const j = await res.json();
        if (res.ok && typeof j.lat === "number") {
          setOrigin({ lat: j.lat, lng: j.lng, label: `zip ${z}`, source: "zip" });
          setLocMsg("");
        } else setLocMsg(j.error || "We couldn't find that zip code.");
      } catch {
        setLocMsg("We couldn't look up that zip code right now.");
      }
    }, 450);
    return () => window.clearTimeout(t);
  }, [zip]);

  const useDevice = () => {
    if (typeof window === "undefined" || !("geolocation" in window.navigator)) {
      return setLocMsg("This browser can't share your location.");
    }
    setLocMsg("Finding you…");
    window.navigator.geolocation.getCurrentPosition(
      (p) => {
        setOrigin({ lat: p.coords.latitude, lng: p.coords.longitude, label: "your location", source: "device" });
        setLocMsg("");
      },
      () => setLocMsg("Location is blocked. Type your zip code instead."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    );
  };

  /* shows → spots */
  const { spots, unplaced } = useMemo(() => {
    void now; // re-evaluate "upcoming" as time passes
    const upcoming = shows.filter((s) => !s.isPrivate && !isShowOver({ startDate: s.startDate, date: s.date, time: s.time || "" }));
    const vkey = (s: TourShow) => `${(s.venue || "").toLowerCase().trim()}|${(s.city || "").toLowerCase().trim()}`;
    const known = new Map<string, { lat: number; lng: number }>();
    for (const s of shows) if (typeof s.lat === "number" && typeof s.lng === "number") known.set(vkey(s), { lat: s.lat, lng: s.lng });
    const by = new Map<string, Spot>();
    let missing = 0;
    for (const s of upcoming) {
      const ll = typeof s.lat === "number" && typeof s.lng === "number" ? { lat: s.lat, lng: s.lng } : known.get(vkey(s));
      if (!ll) {
        missing++;
        continue;
      }
      const k = vkey(s);
      const spot = by.get(k);
      if (spot) spot.dates.push(s);
      else
        by.set(k, {
          key: k,
          venue: s.venue,
          city: [s.city, s.state].filter(Boolean).join(", "),
          mi: distanceMiles(origin.lat, origin.lng, ll.lat, ll.lng),
          bearing: bearing(origin, ll),
          dates: [s],
        });
    }
    return { spots: [...by.values()].sort((a, b) => a.mi - b.mi), unplaced: missing };
  }, [shows, origin, now]);

  const inside = spots.filter((s) => inRadius(s.mi, value));
  const showCount = inside.reduce((n, s) => n + s.dates.length, 0);
  const previewCount = ringHover
    ? spots.filter((s) => inRadius(s.mi, ringHover)).reduce((n, s) => n + s.dates.length, 0)
    : 0;
  const next = [...inside].sort((a, b) => (a.dates[0].startDate || "").localeCompare(b.dates[0].startDate || ""))[0];
  const mostUpcomingKey = useMemo(() => {
    if (next) return next.key;
    if (spots.length === 0) return null;
    return (
      [...spots].sort((a, b) =>
        (a.dates[0]?.startDate || a.dates[0]?.date || "").localeCompare(
          b.dates[0]?.startDate || b.dates[0]?.date || ""
        )
      )[0]?.key ?? null
    );
  }, [next, spots]);

  const onKey = (e: KeyboardEvent) => {
    const i = ORDER.indexOf(value);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(ORDER[Math.min(4, i + 1)]);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(ORDER[Math.max(0, i - 1)]);
    }
  };

  const where = origin.source === "default" ? "Chicago" : origin.label;

  return (
    <div className="srr" data-no-text-anim>
      <div className="srr-row">
        <svg
          viewBox="0 0 200 200"
          className="srr-svg"
          role="slider"
          tabIndex={0}
          aria-label="Travel radius"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={ORDER.indexOf(value)}
          aria-valuetext={`${LABEL[value]}, ${showCount} upcoming shows`}
          onKeyDown={onKey}
        >
          {[...ORDER].reverse().map((o) => (
            <circle
              key={o}
              cx={C}
              cy={C}
              r={R[o]}
              className={`srr-ring${o === value ? " on" : ""}${ORDER.indexOf(o) < ORDER.indexOf(value) ? " in" : ""}${ringHover === o ? " hov" : ""}`}
              onClick={() => onChange(o)}
              onMouseEnter={() => setRingHover(o)}
              onMouseLeave={() => setRingHover((h) => (h === o ? null : h))}
            />
          ))}
          {/* radar pulse: waves travel out to the chosen ring */}
          <g className="srr-radar" key={`radar-${value}`} aria-hidden="true">
            {[0, 1].map((i) => (
              <circle
                key={i}
                cx={C}
                cy={C}
                r={R[value]}
                className="srr-wave"
                style={{ animationDuration: `${PULSE_TRAVEL}s`, animationDelay: `${i * PULSE_GAP}s` }}
              />
            ))}
            <circle cx={C} cy={C} r={R[value]} className="srr-wash" style={{ animationDuration: `${PULSE_GAP}s` }} />
          </g>
          {/* Compass cardinal directions */}
          <g className="srr-cardinal" aria-hidden="true">
            <text x={C} y={C - R.all - 3.5} textAnchor="middle">
              N
            </text>
            <text x={C + R.all + 5.5} y={C} textAnchor="middle" dominantBaseline="central">
              E
            </text>
            <text x={C} y={C + R.all + 8} textAnchor="middle">
              S
            </text>
            <text x={C - R.all - 5.5} y={C} textAnchor="middle" dominantBaseline="central">
              W
            </text>
          </g>
          {spots.map((s) => {
            const r = toR(s.mi);
            const a = ((s.bearing - 90) * Math.PI) / 180;
            const on = inRadius(s.mi, value);
            const isMostUpcoming = s.key === mostUpcomingKey;
            return (
              <circle
                key={s.key}
                cx={C + Math.cos(a) * r}
                cy={C + Math.sin(a) * r}
                r={on || isMostUpcoming ? 2.6 + Math.min(2, (s.dates.length - 1) * 0.6) : 1.7}
                className={`srr-dot${on ? " on" : ""}${isMostUpcoming ? " ping" : ""}${hover?.key === s.key ? " hov" : ""}`}
                tabIndex={0}
                aria-label={`${s.venue}, ${s.city}, ${Math.round(s.mi)} miles, ${s.dates.length} upcoming${isMostUpcoming ? ", next upcoming show" : ""}`}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(s)}
                onBlur={() => setHover(null)}
              />
            );
          })}
          <circle cx={C} cy={C} r={3.2} className="srr-home" />
          {ringHover && (
            <text x={C} y={C - R[ringHover] + 3.6} textAnchor="middle" className="srr-ringtip" aria-hidden="true">
              {ringHover === "all" ? "ANY DISTANCE" : `${ringHover} MILES`}
            </text>
          )}
        </svg>

        <div className="srr-read">
          <span className="srr-big">{LABEL[value]}</span>
          <span className="srr-sub" aria-live="polite">
            {failed && !updatedAt
              ? "Couldn't load the tour dates right now."
              : `${showCount} upcoming show${showCount === 1 ? "" : "s"} ${value === "all" ? "on the calendar" : `within ${value} miles of ${where}`}`}
          </span>
          {/* line 1: the dot you're on, otherwise the next show */}
          {hover ? (
            <span className="srr-detail">
              <b>{hover.venue}</b> · {hover.city} · {Math.round(hover.mi)} mi · {fmtDate(hover.dates[0])}
              {hover.dates.length > 1 ? ` +${hover.dates.length - 1} more` : ""}
            </span>
          ) : next ? (
            <span className="srr-detail">
              Next: <b>{next.venue}</b> · {fmtDate(next.dates[0])} · {Math.round(next.mi)} mi
            </span>
          ) : (
            updatedAt && <span className="srr-detail">Nothing on the calendar that close yet. Try a bigger ring.</span>
          )}
          {/* line 2: the ring under your mouse, shown at the same time */}
          <span className="srr-detail srr-detail--preview" aria-live="polite">
            {ringHover && ringHover !== value ? (
              <>
                <b>{ringHover === "all" ? "Any distance" : `${ringHover} miles`}</b> · {previewCount} upcoming show
                {previewCount === 1 ? "" : "s"} · tap to choose
              </>
            ) : null}
          </span>

          <span className="srr-where">
            {origin.source === "default" ? "Measured from Chicago. " : `Measured from ${origin.label}. `}
            <button type="button" onClick={useDevice}>
              Use my location
            </button>
            {locMsg && <em> {locMsg}</em>}
          </span>
        </div>
      </div>

      {showList && inside.length > 0 && (
        <ul className="srr-list">
          {inside
            .flatMap((s) => s.dates.map((d) => ({ s, d })))
            .sort((a, b) => (a.d.startDate || "").localeCompare(b.d.startDate || ""))
            .slice(0, 5)
            .map(({ s, d }) => (
              <li key={`${s.key}-${d.startDate}-${d.time}`}>
                <a href={d.id ? `/shows/${d.id}` : "/shows"}>
                  <span className="srr-list-date">{fmtDate(d)}</span>
                  <span className="srr-list-venue">{s.venue}</span>
                  <span className="srr-list-mi">{Math.round(s.mi)} mi</span>
                </a>
              </li>
            ))}
          {unplaced > 0 && <li className="srr-list-note">+ {unplaced} upcoming shows without a map location yet</li>}
        </ul>
      )}
    </div>
  );
}
