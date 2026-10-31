"use client";

import { useId, useState, type ReactNode } from "react";
import { RADII, TYPES, type RadiusId, type StyleId, type TypeId } from "./data";

/* ── shared form state ───────────────────────────────────────────── */
export function useAlertForm() {
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [radius, setRadius] = useState<RadiusId>("all");
  const [types, setTypes] = useState<TypeId[]>([]);
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");
  const [error, setError] = useState("");
  const toggle = (t: TypeId) => setTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  const submit = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      setError("Add an email we can send alerts to.");
      return;
    }
    if (!agree) {
      setStatus("error");
      setError("Tick the box to agree to the Terms and Privacy Policy.");
      return;
    }
    setError("");
    setStatus("done");
  };
  const summary = () => {
    const r = RADII.find((x) => x.id === radius)!;
    const where = radius === "all" ? "every show" : `shows within ${r.miles} miles of ${zip || "you"}`;
    const what = types.length ? TYPES.filter((t) => types.includes(t.id)).map((t) => t.label).join(", ") : "any kind of set";
    return { where, what };
  };
  return { name, setName, zip, setZip, email, setEmail, radius, setRadius, types, toggle, agree, setAgree, status, error, submit, summary };
}
export type AlertForm = ReturnType<typeof useAlertForm>;

/* ── inputs ──────────────────────────────────────────────────────── */
const inputVariant: Record<StyleId, string> = {
  pills: "line",
  underline: "line",
  slider: "box",
  segmented: "box",
  tiles: "big",
  rings: "pill",
  dropdown: "box",
  stickers: "line",
  text: "big",
  ticket: "box",
};

export function Fields({ f, style, only, layout = "row" }: { f: AlertForm; style: StyleId; only?: ("name" | "zip" | "email")[]; layout?: "row" | "col" }) {
  const id = useId();
  const all = [
    { k: "name" as const, label: "Full name", ph: "Jane Rocker", v: f.name, set: f.setName, type: "text", ac: "name" },
    { k: "zip" as const, label: "ZIP code / city", ph: "60067", v: f.zip, set: f.setZip, type: "text", ac: "postal-code" },
    { k: "email" as const, label: "Email", ph: "you@email.com", v: f.email, set: f.setEmail, type: "email", ac: "email" },
  ].filter((x) => !only || only.includes(x.k));
  return (
    <div className={`a1-fields a1-fields--${layout}`}>
      {all.map((x) => (
        <label key={x.k} className={`a1-field a1-field--${inputVariant[style]}`}>
          <span className="a1-micro">{x.label}</span>
          <input id={`${id}-${x.k}`} type={x.type} autoComplete={x.ac} placeholder={x.ph} value={x.v} onChange={(e) => x.set(e.target.value)} />
        </label>
      ))}
    </div>
  );
}

/* ── radius, in ten styles ───────────────────────────────────────── */
export function Radius({ f, style }: { f: AlertForm; style: StyleId }) {
  const name = useId();
  const idx = RADII.findIndex((r) => r.id === f.radius);
  if (style === "slider") {
    return (
      <div className="a1-slider">
        <input
          type="range"
          min={0}
          max={RADII.length - 1}
          step={1}
          value={idx}
          aria-label="Travel radius"
          aria-valuetext={RADII[idx].label}
          onChange={(e) => f.setRadius(RADII[Number(e.target.value)].id)}
          style={{ ["--a1-fill" as string]: `${(idx / (RADII.length - 1)) * 100}%` }}
        />
        <div className="a1-slider-ticks" aria-hidden="true">
          {RADII.map((r, i) => (
            <span key={r.id} className={i === idx ? "on" : ""}>{r.id === "all" ? "All" : `${r.miles} mi`}</span>
          ))}
        </div>
      </div>
    );
  }
  if (style === "dropdown") {
    return (
      <label className="a1-field a1-field--box a1-select">
        <span className="a1-micro">Travel radius</span>
        <select value={f.radius} onChange={(e) => f.setRadius(e.target.value as RadiusId)}>
          {RADII.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </label>
    );
  }
  if (style === "rings") {
    return (
      <div className="a1-rings" role="radiogroup" aria-label="Travel radius">
        {[...RADII].reverse().map((r, i) => (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={f.radius === r.id}
            className={`a1-ring ${f.radius === r.id ? "on" : ""}`}
            style={{ ["--s" as string]: `${100 - i * 18}%` }}
            onClick={() => f.setRadius(r.id)}
          >
            <span>{r.id === "all" ? "All" : r.miles}</span>
          </button>
        ))}
        <span className="a1-ring-you" aria-hidden="true">you</span>
      </div>
    );
  }
  return (
    <div className={`a1-radius a1-radius--${style}`} role="radiogroup" aria-label="Travel radius">
      {RADII.map((r, i) => (
        <label key={r.id} className={`a1-r ${f.radius === r.id ? "on" : ""}`} style={{ ["--i" as string]: i }}>
          <input type="radio" name={name} checked={f.radius === r.id} onChange={() => f.setRadius(r.id)} />
          {style === "tiles" ? (
            <span className="a1-r-in">
              <b>{r.id === "all" ? "All" : r.miles}</b>
              <small>{r.id === "all" ? "shows" : "miles"}</small>
            </span>
          ) : style === "ticket" ? (
            <span className="a1-r-in">
              <small>Admit</small>
              <b>{r.id === "all" ? "All" : `${r.miles} mi`}</b>
            </span>
          ) : (
            <span className="a1-r-in">{r.label}</span>
          )}
        </label>
      ))}
    </div>
  );
}

/* ── show types, in ten styles ───────────────────────────────────── */
export function Types({ f, style, compact = false }: { f: AlertForm; style: StyleId; compact?: boolean }) {
  if (style === "dropdown") {
    return (
      <fieldset className="a1-listbox">
        <legend className="a1-micro">Show types · {f.types.length ? `${f.types.length} picked` : "all"}</legend>
        {TYPES.map((t) => (
          <label key={t.id} className="a1-listrow">
            <input type="checkbox" checked={f.types.includes(t.id)} onChange={() => f.toggle(t.id)} />
            <span>{t.label}</span>
            <small>{t.desc}</small>
          </label>
        ))}
      </fieldset>
    );
  }
  return (
    <div className={`a1-types a1-types--${style} ${compact ? "a1-types--compact" : ""}`} role="group" aria-label="Show types">
      {TYPES.map((t, i) => {
        const on = f.types.includes(t.id);
        return (
          <label key={t.id} className={`a1-t ${on ? "on" : ""}`} style={{ ["--i" as string]: i, ["--dot" as string]: t.dot }}>
            <input type="checkbox" checked={on} onChange={() => f.toggle(t.id)} />
            {style === "slider" ? (
              <>
                <span className="a1-t-text"><b>{t.label}</b><small>{t.desc}</small></span>
                <span className="a1-switch" aria-hidden="true" />
              </>
            ) : style === "underline" ? (
              <>
                <span className="a1-check" aria-hidden="true" />
                <span className="a1-t-text"><b>{t.label}</b><small>{t.desc}</small></span>
                <span className="a1-micro a1-t-group">{t.group}</span>
              </>
            ) : style === "rings" ? (
              <>
                <span className="a1-badge" aria-hidden="true">{t.label.split(" ").map((w) => w[0]).join("")}</span>
                <span className="a1-t-text"><b>{t.label}</b></span>
              </>
            ) : style === "ticket" ? (
              <span className="a1-t-text">
                <small>{t.group}</small>
                <b>{t.label}</b>
                <small>{t.desc}</small>
              </span>
            ) : style === "text" || style === "stickers" || style === "segmented" ? (
              <span className="a1-t-text"><b>{t.label}</b></span>
            ) : (
              <span className="a1-t-text"><b>{t.label}</b>{!compact && <small>{t.desc}</small>}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}

/* ── consent, submit, result ─────────────────────────────────────── */
export function Consent({ f }: { f: AlertForm }) {
  return (
    <label className="a1-consent">
      <input type="checkbox" checked={f.agree} onChange={(e) => f.setAgree(e.target.checked)} />
      <span>
        I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
      </span>
    </label>
  );
}

export function Submit({ f, style, children = "Enable alerts" }: { f: AlertForm; style: StyleId; children?: ReactNode }) {
  return (
    <div className="a1-submit-wrap">
      <button type="button" className={`a1-submit a1-submit--${style}`} onClick={f.submit}>
        {children}
      </button>
      <p className="a1-hint">Instant browser &amp; proximity alerts for nearby shows.</p>
      {f.status === "error" && <p className="a1-error" role="alert">{f.error}</p>}
      {f.status === "done" && (
        <p className="a1-done" role="status">
          You&apos;re in. We&apos;ll alert {f.email} about {f.summary().where}, for {f.summary().what}.
        </p>
      )}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="a1-micro a1-label">{children}</p>;
}

export const TypesNote = () => <p className="a1-note">Leave all unselected to hear about every show. Pick some to get only those.</p>;
