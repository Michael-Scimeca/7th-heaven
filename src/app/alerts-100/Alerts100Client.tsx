"use client";

/**
 * Show-alert form — 100 layouts (10 layouts × 10 control styles).
 * Every variant is live: same fields, same options, its own state.
 * Site rules: Anton / LT Lemon / Inter only, no background fills on surfaces.
 * Not wired to /api/web-push/subscribe yet — pick one and it gets wired into FooterProximityAlerts.
 */

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import IphoneClipMask from "@/components/IphoneClipMask";
import ShowRadiusRings, { type RadiusValue } from "@/components/ShowRadiusRings";
import "./alerts-100.css";

/* ── data (same as FooterProximityAlerts) ───────────────────────────── */
const RADII = [
  { v: "all", label: "All Shows", short: "All", miles: 0 },
  { v: "15", label: "15 Miles", short: "15", miles: 15 },
  { v: "30", label: "30 Miles", short: "30", miles: 30 },
  { v: "50", label: "50 Miles", short: "50", miles: 50 },
  { v: "100", label: "100 Miles", short: "100", miles: 100 },
];
const TYPES = [
  { id: "full", label: "Full Band", desc: "Electric 5-piece rock sets" },
  { id: "unplugged", label: "Unplugged", desc: "Acoustic & vocal sets" },
  { id: "special", label: "Special Feature", desc: "Guest stars & anniversaries" },
  { id: "outdoor", label: "Outdoor Fest", desc: "Festivals & parks" },
  { id: "casino", label: "Casino & Resort", desc: "Lounges & showrooms" },
  { id: "tv", label: "TV Broadcast", desc: "Televised live sets" },
  { id: "fundraiser", label: "Fundraiser", desc: "Charity & benefits" },
];

export const LAYOUTS = [
  { id: "stack", name: "Stack" },
  { id: "split", name: "Split headline" },
  { id: "sentence", name: "Sentence" },
  { id: "wizard", name: "Three steps" },
  { id: "columns", name: "Two columns" },
  { id: "accordion", name: "Accordion" },
  { id: "bar", name: "Signup bar" },
  { id: "ticket", name: "Ticket stub" },
  { id: "tabs", name: "Tabs" },
  { id: "numbered", name: "Numbered" },
] as const;
export const CONTROLS = [
  { id: "pills", name: "Pills" },
  { id: "underline", name: "Underlined words" },
  { id: "rows", name: "Check rows" },
  { id: "slider", name: "Slider + tag cloud" },
  { id: "anton", name: "Big type toggles" },
  { id: "icons", name: "Icon tiles" },
  { id: "segmented", name: "Segmented" },
  { id: "rings", name: "Radar rings" },
  { id: "switches", name: "Switches + stepper" },
  { id: "keys", name: "Keycaps" },
] as const;
type LayoutId = (typeof LAYOUTS)[number]["id"];
type ControlId = (typeof CONTROLS)[number]["id"];

/* ── form state ─────────────────────────────────────────────────────── */
function useAlertForm() {
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [radius, setRadius] = useState("all");
  const [types, setTypes] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const toggleChannel = (c: string) =>
    setChannels((ch) => (ch.includes(c) ? (ch.length > 1 ? ch.filter((x) => x !== c) : ch) : [...ch, c]));
  const toggle = (id: string) => setTypes((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const summary = () => {
    const r = radius === "all" ? "every distance" : `within ${radius} miles`;
    const k = types.length ? TYPES.filter((t) => types.includes(t.id)).map((t) => t.label).join(", ") : "every kind of show";
    return `${k}, ${r}`;
  };
  const by = () => (channels.length === 2 ? "by email and app notification" : channels[0] === "app" ? "by app notification" : "by email");
  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (channels.includes("email") && !/^\S+@\S+\.\S+$/.test(email))
      return setMsg({ ok: false, text: "Add your email so we know where to send alerts." });
    if (!terms) return setMsg({ ok: false, text: "Tick the Terms and Privacy box to turn alerts on." });
    if (channels.includes("app")) {
      if (typeof Notification === "undefined")
        return setMsg({ ok: false, text: "This browser can't show app notifications. Pick email instead, or install the 7th Heaven app." });
      const p = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      if (p !== "granted")
        return setMsg({
          ok: false,
          text: channels.includes("email")
            ? "Notifications are blocked in your browser settings, so we'll stick to email for now."
            : "Notifications are blocked in your browser settings. Allow them for this site, or pick email.",
        });
    }
    setMsg({ ok: true, text: `Alerts on for ${summary()}, ${by()}.` });
  };
  return { name, setName, zip, setZip, email, setEmail, radius, setRadius, types, toggle, terms, setTerms, channels, toggleChannel, msg, submit, summary, by };
}
type Form = ReturnType<typeof useAlertForm>;

/* ── icons for the icon-tile control ────────────────────────────────── */
const ICON: Record<string, ReactNode> = {
  full: <path d="M4 18V8l4-2v12M10 18V5l4-2v15M16 18v-8l4-2v10" />,
  unplugged: <path d="M9 3v7a3 3 0 0 0 6 0V3M12 13v8M8 21h8" />,
  special: <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />,
  outdoor: <path d="M3 20l6-10 4 6 3-4 5 8zM17 7a2 2 0 1 0 0-.1" />,
  casino: <path d="M5 5h14v14H5zM9 9h.01M15 15h.01M12 12h.01M9 15h.01M15 9h.01" />,
  tv: <path d="M3 7h18v11H3zM8 3l4 4 4-4" />,
  fundraiser: <path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20z" />,
};
const Icon = ({ id }: { id: string }) => (
  <svg viewBox="0 0 24 24" className="a1-icon" aria-hidden="true">
    {ICON[id]}
  </svg>
);

/* ── radius pickers ─────────────────────────────────────────────────── */
function Radius({ f, c, uid }: { f: Form; c: ControlId; uid: string }) {
  const idx = RADII.findIndex((r) => r.v === f.radius);
  if (c === "slider")
    return (
      <div className="a1-slider">
        <input
          id={`${uid}-rs`}
          type="range"
          min={0}
          max={4}
          step={1}
          value={idx}
          onChange={(e) => f.setRadius(RADII[+e.target.value].v)}
          aria-label="Travel radius"
          aria-valuetext={RADII[idx].label}
        />
        <div className="a1-slider-ticks" aria-hidden="true">
          {RADII.map((r, i) => (
            <span key={r.v} className={i === idx ? "on" : ""}>
              {r.short}
            </span>
          ))}
        </div>
      </div>
    );
  if (c === "rings") {
    // bigger distance = bigger ring: 15 mi is the inner ring, "All Shows" the outer one
    const sizes = [100, 30, 48, 66, 84];
    return (
      <div className="a1-rings" role="radiogroup" aria-label="Travel radius">
        <div className="a1-rings-stage">
          {RADII.map((r, i) => (
            <button
              key={r.v}
              type="button"
              role="radio"
              aria-checked={f.radius === r.v}
              aria-label={r.label}
              className={`a1-ring${f.radius === r.v ? " on" : ""}`}
              style={{ width: `${sizes[i]}%`, height: `${sizes[i]}%`, zIndex: i === 0 ? 0 : 6 - i }}
              onClick={() => f.setRadius(r.v)}
            />
          ))}
          <span className="a1-ring-dot" aria-hidden="true" />
        </div>
        <span className="a1-rings-read">{RADII[idx].label}</span>
      </div>
    );
  }
  if (c === "switches")
    return (
      <div className="a1-stepper" aria-label="Travel radius">
        <button type="button" onClick={() => f.setRadius(RADII[Math.max(0, idx - 1)].v)} aria-label="Smaller radius" disabled={idx === 0}>
          −
        </button>
        <output aria-live="polite">{RADII[idx].label}</output>
        <button type="button" onClick={() => f.setRadius(RADII[Math.min(4, idx + 1)].v)} aria-label="Bigger radius" disabled={idx === 4}>
          +
        </button>
      </div>
    );
  if (c === "segmented")
    return (
      <div className="a1-seg" role="radiogroup" aria-label="Travel radius" style={{ ["--n" as string]: RADII.length, ["--i" as string]: idx }}>
        <span className="a1-seg-thumb" aria-hidden="true" />
        {RADII.map((r) => (
          <button key={r.v} type="button" role="radio" aria-checked={f.radius === r.v} onClick={() => f.setRadius(r.v)}>
            {r.label}
          </button>
        ))}
      </div>
    );
  if (c === "rows")
    return (
      <div className="a1-rows" role="radiogroup" aria-label="Travel radius">
        {RADII.map((r) => (
          <button key={r.v} type="button" role="radio" aria-checked={f.radius === r.v} onClick={() => f.setRadius(r.v)} className="a1-row">
            <span className="a1-mark a1-mark--round" aria-hidden="true" />
            <span>{r.label}</span>
          </button>
        ))}
      </div>
    );
  const cls = { pills: "a1-pill", underline: "a1-word", anton: "a1-big", icons: "a1-tilesm", keys: "a1-key" }[c as string] ?? "a1-pill";
  return (
    <div className={`a1-opts a1-opts--${c}`} role="radiogroup" aria-label="Travel radius">
      {RADII.map((r, i) => (
        <button key={r.v} type="button" role="radio" aria-checked={f.radius === r.v} className={cls} onClick={() => f.setRadius(r.v)}>
          {c === "keys" && <kbd>{i === 0 ? "∞" : i}</kbd>}
          {c === "anton" ? (r.v === "all" ? "Any" : r.short) : r.label}
          {c === "anton" && r.v !== "all" && <small>mi</small>}
        </button>
      ))}
    </div>
  );
}

/* ── show-type pickers ──────────────────────────────────────────────── */
function Types({ f, c }: { f: Form; c: ControlId }) {
  const on = (id: string) => f.types.includes(id);
  const common = (t: (typeof TYPES)[number]) => ({
    type: "button" as const,
    role: "checkbox" as const,
    "aria-checked": on(t.id),
    onClick: () => f.toggle(t.id),
  });
  switch (c) {
    case "pills":
      return (
        <div className="a1-cards" role="group" aria-label="Show types">
          {TYPES.map((t) => (
            <button key={t.id} {...common(t)} className="a1-card">
              <b>{t.label}</b>
              <small>{t.desc}</small>
            </button>
          ))}
        </div>
      );
    case "underline":
      return (
        <p className="a1-wordlist" role="group" aria-label="Show types">
          {TYPES.map((t, i) => (
            <span key={t.id}>
              <button {...common(t)} className="a1-word a1-word--lg" title={t.desc}>
                {t.label}
              </button>
              {i < TYPES.length - 1 && <span className="a1-sep"> / </span>}
            </span>
          ))}
        </p>
      );
    case "rows":
      return (
        <div className="a1-rows a1-rows--types" role="group" aria-label="Show types">
          {TYPES.map((t) => (
            <button key={t.id} {...common(t)} className="a1-row">
              <span className="a1-mark" aria-hidden="true" />
              <span className="a1-row-l">{t.label}</span>
              <span className="a1-row-d">{t.desc}</span>
            </button>
          ))}
        </div>
      );
    case "slider":
      return (
        <p className="a1-cloud" role="group" aria-label="Show types">
          {TYPES.map((t, i) => (
            <button key={t.id} {...common(t)} className={`a1-cloud-w s${(i * 3) % 4}`} title={t.desc}>
              {t.label}
            </button>
          ))}
        </p>
      );
    case "anton":
      return (
        <div className="a1-bigs" role="group" aria-label="Show types">
          {TYPES.map((t) => (
            <button key={t.id} {...common(t)} className="a1-big a1-big--type" title={t.desc}>
              {t.label}
            </button>
          ))}
        </div>
      );
    case "icons":
      return (
        <div className="a1-tiles" role="group" aria-label="Show types">
          {TYPES.map((t) => (
            <button key={t.id} {...common(t)} className="a1-tile">
              <Icon id={t.id} />
              <b>{t.label}</b>
              <small>{t.desc}</small>
            </button>
          ))}
        </div>
      );
    case "segmented":
      return (
        <div className="a1-seggrid" role="group" aria-label="Show types">
          {TYPES.map((t) => (
            <button key={t.id} {...common(t)} className="a1-segcell">
              <b>{t.label}</b>
              <small>{t.desc}</small>
            </button>
          ))}
        </div>
      );
    case "rings":
      return (
        <div className="a1-dots" role="group" aria-label="Show types">
          {TYPES.map((t) => (
            <button key={t.id} {...common(t)} className="a1-dotrow">
              <span className="a1-dot" aria-hidden="true" />
              <b>{t.label}</b>
              <small>{t.desc}</small>
            </button>
          ))}
        </div>
      );
    case "switches":
      return (
        <div className="a1-switches" role="group" aria-label="Show types">
          {TYPES.map((t) => (
            <button key={t.id} {...common(t)} role="switch" aria-checked={on(t.id)} className="a1-switchrow">
              <span>
                <b>{t.label}</b>
                <small>{t.desc}</small>
              </span>
              <span className="a1-switch" aria-hidden="true" />
            </button>
          ))}
        </div>
      );
    case "keys":
      return (
        <div className="a1-keys" role="group" aria-label="Show types">
          {TYPES.map((t, i) => (
            <button key={t.id} {...common(t)} className="a1-key a1-key--type" title={t.desc}>
              <kbd>{String.fromCharCode(65 + i)}</kbd>
              {t.label}
            </button>
          ))}
        </div>
      );
  }
}

/* ── shared pieces ──────────────────────────────────────────────────── */
function Field({ uid, k, label, f, type = "text", ph, auto }: { uid: string; k: "name" | "zip" | "email"; label: string; f: Form; type?: string; ph: string; auto: string }) {
  const value = f[k];
  const set = { name: f.setName, zip: f.setZip, email: f.setEmail }[k];
  return (
    <label className="a1-field" htmlFor={`${uid}-${k}`}>
      <span>{label}</span>
      <input id={`${uid}-${k}`} type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={ph} autoComplete={auto} />
    </label>
  );
}
const Fields = ({ f, uid, dir = "row" }: { f: Form; uid: string; dir?: "row" | "col" }) => (
  <div className={`a1-fields a1-fields--${dir}`}>
    <Field uid={uid} k="name" label="Full name" f={f} ph="Jane Rocker" auto="name" />
    <Field uid={uid} k="zip" label="Zip code / city" f={f} ph="60067" auto="postal-code" />
    <Field uid={uid} k="email" label="Email" f={f} type="email" ph="you@email.com" auto="email" />
  </div>
);
const CHANNELS = [
  { id: "email", label: "Email" },
  { id: "app", label: "App notification" },
];
const Channels = ({ f }: { f: Form }) => (
  <div className="a1-block">
    <Label>Send alerts by</Label>
    <div className="a1-opts" role="group" aria-label="How to send alerts">
      {CHANNELS.map((c) => (
        <button key={c.id} type="button" role="checkbox" aria-checked={f.channels.includes(c.id)} className="a1-pill" onClick={() => f.toggleChannel(c.id)}>
          {c.label}
        </button>
      ))}
    </div>
    {f.channels.includes("app") && <p className="a1-hint">Your browser will ask to allow notifications when you turn alerts on.</p>}
  </div>
);
const Terms = ({ f, uid }: { f: Form; uid: string }) => (
  <>
  <Channels f={f} />
  <label className="a1-terms" htmlFor={`${uid}-t`}>
    <input id={`${uid}-t`} type="checkbox" checked={f.terms} onChange={(e) => f.setTerms(e.target.checked)} />
    <span>
      I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
    </span>
  </label>
  </>
);
const Submit = ({ f, label = "Enable alerts" }: { f: Form; label?: string }) => (
  <div className="a1-submit">
    <button type="submit" className="a1-cta">
      {label}
    </button>
    {f.msg && (
      <p className={`a1-msg${f.msg.ok ? " ok" : ""}`} role="status">
        {f.msg.text}
      </p>
    )}
  </div>
);
const Hint = () => <p className="a1-hint">Leave all unselected to hear about every show. Pick some to get only those.</p>;
const Label = ({ children }: { children: ReactNode }) => <p className="a1-label">{children}</p>;

/* ── the footer's iPhone video, same markup as FooterProximityAlerts ── */
function PhoneVideo() {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // load when close, and only play while on screen (100 phones on one page)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          vid.current?.play().catch(() => {});
        } else {
          vid.current?.pause();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="a1-phone" aria-hidden="true">
      <div className="relative aspect-[9/19.5] w-full select-none">
        <IphoneClipMask insetXPercent={0} insetTopPercent={0} insetBottomPercent={0} borderRadiusPx={36} className="flex h-full w-full items-center justify-center">
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[34px] border border-purple-500/30 bg-[#12071f] p-2 shadow-[inset_0_0_20px_rgba(168,85,247,0.15)]">
            <div ref={box} className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28px] bg-black">
              {load && (
                <video
                  ref={vid}
                  src="/movie/notefication.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                  className="h-full w-full rounded-[28px] bg-black object-contain"
                />
              )}
            </div>
          </div>
        </IphoneClipMask>
      </div>
    </div>
  );
}

/* ── #010: a calm, conversational version ───────────────────────────
   Reads like you're telling us about yourself. No uppercase field labels,
   no key letters, choices sit inside the sentences, and every finished line gets a soft check. */
function CalmForm() {
  const f = useAlertForm();
  const uid = useId().replace(/:/g, "");
  const okEmail = /^\S+@\S+\.\S+$/.test(f.email);
  const Line = ({ done, children }: { done: boolean; children: ReactNode }) => (
    <p className={`a1-calm-line${done ? " done" : ""}`}>
      {children}
      <span className="a1-calm-check" aria-hidden="true">
        ✓
      </span>
    </p>
  );
  const blank = (k: "name" | "zip" | "email", ph: string, label: string, type = "text", auto = "on") => {
    const value = f[k];
    const set = { name: f.setName, zip: f.setZip, email: f.setEmail }[k];
    return (
      <input
        id={`${uid}-${k}`}
        aria-label={label}
        className="a1-calm-blank"
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={ph}
        autoComplete={auto}
        size={Math.max(ph.length, value.length) + 1}
      />
    );
  };
  return (
    <form className="a1-form a1-calm" onSubmit={f.submit} noValidate>
      <p className="a1-calm-hi">Hi there. Tell us a little about you and we&apos;ll let you know when we&apos;re playing nearby.</p>

      <Line done={!!f.name.trim()}>My name is {blank("name", "your first name", "Your name", "text", "given-name")}.</Line>
      <Line done={!!f.zip.trim()}>My zip code is {blank("zip", "60067", "Zip code or city", "text", "postal-code")}.</Line>

      <div className="a1-calm-line a1-calm-line--choice done">
        <span>Let me know by</span>
        <span className="a1-calm-chips" role="group" aria-label="How to send alerts">
          {[
            ["email", "email"],
            ["app", "app notification"],
          ].map(([id, label]) => (
            <button key={id} type="button" role="checkbox" aria-checked={f.channels.includes(id)} className="a1-calm-chip" onClick={() => f.toggleChannel(id)}>
              {label}
            </button>
          ))}
        </span>
        {f.channels.includes("app") && (
          <span className="a1-calm-note">Your browser will ask if it&apos;s okay to send notifications. Just press Allow.</span>
        )}
      </div>

      {f.channels.includes("email") && (
        <Line done={okEmail}>You can reach me at {blank("email", "you@email.com", "Email address", "email", "email")}.</Line>
      )}

      <div className="a1-calm-line a1-calm-line--choice done">
        <span>I&apos;m happy to travel</span>
        <span className="a1-calm-chips" role="radiogroup" aria-label="How far you'll travel">
          {RADII.map((r) => (
            <button key={r.v} type="button" role="radio" aria-checked={f.radius === r.v} className="a1-calm-chip" onClick={() => f.setRadius(r.v)}>
              {r.v === "all" ? "any distance" : `${r.v} miles`}
            </button>
          ))}
        </span>
        <span className="a1-calm-rings">
          <ShowRadiusRings value={f.radius as RadiusValue} onChange={f.setRadius} zip={f.zip} showList={false} />
        </span>
      </div>

      <div className="a1-calm-line a1-calm-line--choice done">
        <span>and I&apos;d love to hear about</span>
        <span className="a1-calm-chips" role="group" aria-label="Kinds of shows">
          {TYPES.map((t) => (
            <button key={t.id} type="button" role="checkbox" aria-checked={f.types.includes(t.id)} className="a1-calm-chip" title={t.desc} onClick={() => f.toggle(t.id)}>
              {t.label.toLowerCase()}
            </button>
          ))}
        </span>
        <span className="a1-calm-note">{f.types.length ? "Just these ones." : "Nothing picked means every show — that's fine too."}</span>
      </div>

      <label className="a1-terms a1-calm-terms" htmlFor={`${uid}-t`}>
        <input id={`${uid}-t`} type="checkbox" checked={f.terms} onChange={(e) => f.setTerms(e.target.checked)} />
        <span>
          Sounds good, and I&apos;m okay with the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
        </span>
      </label>

      <div className="a1-submit">
        <button type="submit" className="a1-cta">
          Keep me posted
        </button>
        <span className="a1-calm-note">No spam. Turn it off any time.</span>
        {f.msg && (
          <p className={`a1-msg${f.msg.ok ? " ok" : ""}`} role="status">
            {f.msg.ok ? `You're all set. We'll let you know about ${f.summary()}, ${f.by()}.` : f.msg.text}
          </p>
        )}
      </div>
    </form>
  );
}

/* where the phone sits in each layout */
const PHONE_AT: Record<LayoutId, "left" | "right" | "inside"> = {
  stack: "left",
  split: "inside",
  sentence: "right",
  wizard: "left",
  columns: "inside",
  accordion: "right",
  bar: "left",
  ticket: "inside",
  tabs: "right",
  numbered: "left",
};

/* ── one variant ────────────────────────────────────────────────────── */
function Variant({ n, l, c }: { n: number; l: LayoutId; c: ControlId }) {
  const f = useAlertForm();
  const uid = useId().replace(/:/g, "");
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState(0);

  // #007: the segmented radius bar merged with the live show radar; no show-type picker
  const merged = n === 7;
  const radiusBlock = (
    <div className="a1-block">
      <Label>Travel radius</Label>
      <Radius f={f} c={c} uid={uid} />
      {merged && (
        <div className="a1-merged-radar">
          <ShowRadiusRings value={f.radius as RadiusValue} onChange={f.setRadius} zip={f.zip} showList={false} />
        </div>
      )}
    </div>
  );
  const typesBlock = (
    <div className="a1-block">
      <Label>Format, feature and venue</Label>
      <Types f={f} c={c} />
      <Hint />
    </div>
  );

  let body: ReactNode;
  switch (l) {
    case "stack":
      body = (
        <>
          <Fields f={f} uid={uid} />
          {radiusBlock}
          {!merged && typesBlock}
          <Terms f={f} uid={uid} />
          <Submit f={f} />
        </>
      );
      break;
    case "split":
      body = (
        <div className="a1-split">
          <div className="a1-split-head">
            <h3 className="a1-anton">Never miss a show</h3>
            <p className="a1-lede">Get a ping when 7th Heaven plays near you, only for the kinds of shows you like.</p>
            <PhoneVideo />
          </div>
          <div className="a1-split-form">
            <Fields f={f} uid={uid} dir="col" />
            {radiusBlock}
            {typesBlock}
            <Terms f={f} uid={uid} />
            <Submit f={f} />
          </div>
        </div>
      );
      break;
    case "sentence":
      body = (
        <>
          <p className="a1-madlib">
            Hi, I&apos;m{" "}
            <input aria-label="Full name" id={`${uid}-name`} value={f.name} onChange={(e) => f.setName(e.target.value)} placeholder="your name" size={Math.max(9, f.name.length + 1)} />{" "}
            near{" "}
            <input aria-label="Zip code or city" id={`${uid}-zip`} value={f.zip} onChange={(e) => f.setZip(e.target.value)} placeholder="zip or city" size={Math.max(9, f.zip.length + 1)} />. Email me at{" "}
            <input aria-label="Email" id={`${uid}-email`} type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} placeholder="you@email.com" size={Math.max(13, f.email.length + 1)} />{" "}
            when you play <em>{f.radius === "all" ? "anywhere" : `within ${f.radius} miles`}</em>.
          </p>
          {radiusBlock}
          {typesBlock}
          <Terms f={f} uid={uid} />
          <Submit f={f} label="Deal — turn alerts on" />
        </>
      );
      break;
    case "wizard": {
      const steps = ["You", "Distance", "Shows"];
      body = (
        <>
          <ol className="a1-steps">
            {steps.map((s, i) => (
              <li key={s} className={i === step ? "on" : i < step ? "done" : ""}>
                <button type="button" onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined}>
                  <span>{String(i + 1).padStart(2, "0")}</span> {s}
                </button>
              </li>
            ))}
          </ol>
          <div className="a1-progress" aria-hidden="true">
            <span style={{ width: `${((step + 1) / 3) * 100}%` }} />
          </div>
          <div className="a1-steppanel">
            {step === 0 && <Fields f={f} uid={uid} />}
            {step === 1 && radiusBlock}
            {step === 2 && (
              <>
                {typesBlock}
                <Terms f={f} uid={uid} />
              </>
            )}
          </div>
          <div className="a1-wiznav">
            {step > 0 && (
              <button type="button" className="a1-ghost" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )}
            {step < 2 ? (
              <button type="button" className="a1-cta" onClick={() => setStep(step + 1)}>
                Next →
              </button>
            ) : (
              <Submit f={f} />
            )}
          </div>
        </>
      );
      break;
    }
    case "columns":
      body = (
        <div className="a1-cols">
          <div>
            <PhoneVideo />
            <Label>Where to reach you</Label>
            <Fields f={f} uid={uid} dir="col" />
            <Terms f={f} uid={uid} />
            <Submit f={f} />
          </div>
          <div>
            {radiusBlock}
            {typesBlock}
          </div>
        </div>
      );
      break;
    case "accordion":
      body = (
        <>
          <details className="a1-acc" open>
            <summary>
              <span>Who you are</span>
              <em>{f.email || "Add your email"}</em>
            </summary>
            <Fields f={f} uid={uid} />
          </details>
          <details className="a1-acc">
            <summary>
              <span>How far you&apos;ll travel</span>
              <em>{RADII.find((r) => r.v === f.radius)?.label}</em>
            </summary>
            <Radius f={f} c={c} uid={uid} />
          </details>
          <details className="a1-acc">
            <summary>
              <span>What kind of shows</span>
              <em>{f.types.length ? `${f.types.length} picked` : "Every show"}</em>
            </summary>
            <Types f={f} c={c} />
            <Hint />
          </details>
          <Terms f={f} uid={uid} />
          <Submit f={f} />
        </>
      );
      break;
    case "bar":
      body = (
        <>
          <div className="a1-bar">
            <Fields f={f} uid={uid} />
            <button type="submit" className="a1-cta">
              Enable alerts
            </button>
          </div>
          <div className="a1-bar-under">
            {radiusBlock}
            {typesBlock}
            <Terms f={f} uid={uid} />
            {f.msg && (
              <p className={`a1-msg${f.msg.ok ? " ok" : ""}`} role="status">
                {f.msg.text}
              </p>
            )}
          </div>
        </>
      );
      break;
    case "ticket":
      body = (
        <div className="a1-ticket">
          <div className="a1-stub">
            <span className="a1-lemon">Admit one</span>
            <span className="a1-anton a1-anton--sm">Show alerts</span>
            <PhoneVideo />
            <span className="a1-stub-meta">No. {String(n).padStart(3, "0")} · 7th Heaven</span>
          </div>
          <div className="a1-ticket-main">
            <Fields f={f} uid={uid} />
            {radiusBlock}
            {typesBlock}
            <Terms f={f} uid={uid} />
            <Submit f={f} label="Punch my ticket" />
          </div>
        </div>
      );
      break;
    case "tabs": {
      const tabs = ["You", "Distance", "Shows"];
      body = (
        <>
          <div className="a1-tabs" role="tablist" aria-label="Alert settings">
            {tabs.map((t, i) => (
              <button key={t} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>
                {t}
              </button>
            ))}
          </div>
          <div className="a1-tabpanel" role="tabpanel">
            {tab === 0 && <Fields f={f} uid={uid} />}
            {tab === 1 && radiusBlock}
            {tab === 2 && typesBlock}
          </div>
          <p className="a1-summary">You&apos;ll hear about {f.summary()}.</p>
          <Terms f={f} uid={uid} />
          <Submit f={f} />
        </>
      );
      break;
    }
    case "numbered":
      body = (
        <div className="a1-num">
          {[
            ["01", "You", <Fields key="f" f={f} uid={uid} />],
            ["02", "Distance", <Radius key="r" f={f} c={c} uid={uid} />],
            [
              "03",
              "Shows",
              <div key="t">
                <Types f={f} c={c} />
                <Hint />
              </div>,
            ],
            [
              "04",
              "Go",
              <div key="g">
                <Terms f={f} uid={uid} />
                <Submit f={f} />
              </div>,
            ],
          ].map(([no, t, el]) => (
            <div className="a1-num-row" key={no as string}>
              <div className="a1-num-k">
                <span className="a1-anton a1-anton--num">{no}</span>
                <span className="a1-label">{t}</span>
              </div>
              <div>{el}</div>
            </div>
          ))}
        </div>
      );
      break;
  }

  const at = PHONE_AT[l];
  if (n === 10)
    return (
      <div className="a1-withphone a1-withphone--left">
        <PhoneVideo />
        <CalmForm />
      </div>
    );
  const form = (
    <form className={`a1-form a1-l-${l} a1-c-${c}`} onSubmit={f.submit} noValidate>
      {body}
    </form>
  );
  if (at === "inside") return form;
  return (
    <div className={`a1-withphone a1-withphone--${at}`}>
      <PhoneVideo />
      {form}
    </div>
  );
}

/* ── gallery ────────────────────────────────────────────────────────── */
export default function Alerts100Client() {
  const all = useMemo(
    () => LAYOUTS.flatMap((l, li) => CONTROLS.map((c, ci) => ({ n: li * 10 + ci + 1, l, c }))),
    [],
  );
  const [lf, setLf] = useState<string>("all");
  const [cf, setCf] = useState<string>("all");
  const shown = all.filter((v) => (lf === "all" || v.l.id === lf) && (cf === "all" || v.c.id === cf));

  // ?n=37 jumps to a version
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("n");
    if (!n) return;
    const t = window.setTimeout(() => document.getElementById(`v-${n}`)?.scrollIntoView({ block: "start" }), 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="a1" data-no-text-anim>
      <header className="a1-top">
        <p className="a1-label">Show alert form</p>
        <h1 className="a1-anton a1-h1">100 layouts</h1>
        <p className="a1-lede">
          10 layouts × 10 control styles. Every one works: fill it in and press the button. Tell me the number you want and it
          becomes the real form.
        </p>
        <div className="flex flex-wrap gap-3 mt-4 text-xs font-semibold uppercase tracking-wider">
          <Link href="/alerts-100/sentence" className="px-3.5 py-1.5 rounded-full border border-[var(--sun)] text-[var(--sun)] bg-[rgba(255,251,181,0.06)] hover:bg-[rgba(255,251,181,0.12)] transition-colors">
            ✦ 20 Conversational Sentence Forms
          </Link>
          <Link href="/alerts-100/rings" className="px-3.5 py-1.5 rounded-full border border-[var(--line)] text-[var(--soft)] hover:text-[var(--sun)] hover:border-[var(--sun)] transition-colors">
            ✦ 20 Travel Radius Rings
          </Link>
        </div>
        <div className="a1-filters">
          <label className="a1-field a1-field--select" htmlFor="a1-lf">
            <span>Layout</span>
            <select id="a1-lf" value={lf} onChange={(e) => setLf(e.target.value)}>
              <option value="all">All 10 layouts</option>
              {LAYOUTS.map((l, i) => (
                <option key={l.id} value={l.id}>
                  {String(i * 10 + 1).padStart(3, "0")}–{String(i * 10 + 10).padStart(3, "0")} · {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="a1-field a1-field--select" htmlFor="a1-cf">
            <span>Control style</span>
            <select id="a1-cf" value={cf} onChange={(e) => setCf(e.target.value)}>
              <option value="all">All 10 styles</option>
              {CONTROLS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <p className="a1-count">{shown.length} shown</p>
        </div>
      </header>

      {shown.map(({ n, l, c }) => (
        <section key={n} id={`v-${n}`} className="a1-variant" aria-labelledby={`v-${n}-t`}>
          <div className="a1-variant-head">
            <span className="a1-anton a1-vnum">{String(n).padStart(3, "0")}</span>
            <span id={`v-${n}-t`} className="a1-vname">
              {n === 10 ? (
                <>
                  Conversation <i>×</i> Soft choices
                </>
              ) : n === 7 ? (
                <>
                  Stack <i>×</i> Segmented + live show radar
                </>
              ) : (
                <>
                  {l.name} <i>×</i> {c.name}
                </>
              )}
            </span>
            <a className="a1-vlink" href={`?n=${n}`}>
              Link
            </a>
          </div>
          <Variant n={n} l={l.id} c={c.id} />
        </section>
      ))}
    </div>
  );
}
