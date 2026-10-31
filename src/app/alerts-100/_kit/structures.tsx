"use client";

import { useState, type JSX } from "react";
import { RADII, TYPES, type StructureId, type StyleId } from "./data";
import { Consent, Fields, Label, Radius, Submit, Types, TypesNote, useAlertForm, type AlertForm } from "./controls";
import "./alerts100.css";

type P = { f: AlertForm; s: StyleId };

const Title = ({ children = "Show alerts" }: { children?: string }) => (
  <div className="a1-head">
    <h2 className="a1-title" data-no-text-anim>{children}</h2>
    <p className="a1-sub">Get notified only for shows inside your distance and the kinds of sets you like.</p>
  </div>
);

/* 1. stacked */
function Stacked({ f, s }: P) {
  return (
    <div className="a1-stack">
      <Title />
      <Fields f={f} style={s} />
      <section><Label>Travel radius</Label><Radius f={f} style={s} /></section>
      <section><Label>Format, feature and venue</Label><Types f={f} style={s} /><TypesNote /></section>
      <Consent f={f} />
      <Submit f={f} style={s} />
    </div>
  );
}

/* 2. split */
function Split({ f, s }: P) {
  return (
    <div className="a1-split">
      <div className="a1-split-l">
        <Title />
        <Fields f={f} style={s} layout="col" />
        <Consent f={f} />
        <Submit f={f} style={s} />
      </div>
      <div className="a1-split-r">
        <section><Label>Travel radius</Label><Radius f={f} style={s} /></section>
        <section><Label>Format, feature and venue</Label><Types f={f} style={s} /><TypesNote /></section>
      </div>
    </div>
  );
}

/* 3. wizard */
function Wizard({ f, s }: P) {
  const [step, setStep] = useState(0);
  const steps = ["You", "Distance", "Shows"];
  return (
    <div className="a1-wizard">
      <Title />
      <ol className="a1-steps">
        {steps.map((x, i) => (
          <li key={x} className={i === step ? "on" : i < step ? "done" : ""}>
            <button type="button" onClick={() => setStep(i)}>
              <span>{String(i + 1).padStart(2, "0")}</span> {x}
            </button>
          </li>
        ))}
      </ol>
      <div className="a1-wizard-body" key={step}>
        {step === 0 && <Fields f={f} style={s} layout="col" />}
        {step === 1 && <section><Label>How far will you travel?</Label><Radius f={f} style={s} /></section>}
        {step === 2 && (
          <section>
            <Label>Which shows?</Label>
            <Types f={f} style={s} />
            <TypesNote />
            <Consent f={f} />
          </section>
        )}
      </div>
      <div className="a1-wizard-nav">
        {step > 0 && <button type="button" className="a1-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
        {step < 2 ? (
          <button type="button" className={`a1-submit a1-submit--${s}`} onClick={() => setStep(step + 1)}>Next →</button>
        ) : (
          <Submit f={f} style={s} />
        )}
      </div>
    </div>
  );
}

/* 4. sentence */
function Sentence({ f, s }: P) {
  return (
    <div className="a1-sentence">
      <Title>Tell us where to find you</Title>
      <p className="a1-madlib">
        Hi, I&apos;m{" "}
        <input aria-label="Full name" placeholder="your name" value={f.name} onChange={(e) => f.setName(e.target.value)} autoComplete="name" /> . Send
        alerts to{" "}
        <input aria-label="Email" type="email" placeholder="you@email.com" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="email" />{" "}
        for shows near{" "}
        <input aria-label="ZIP code or city" placeholder="60067" value={f.zip} onChange={(e) => f.setZip(e.target.value)} className="a1-short" autoComplete="postal-code" />
        .
      </p>
      <section><Label>I&apos;ll travel</Label><Radius f={f} style={s} /></section>
      <section><Label>…for these kinds of shows</Label><Types f={f} style={s} /><TypesNote /></section>
      <Consent f={f} />
      <Submit f={f} style={s}>Send me alerts</Submit>
    </div>
  );
}

/* 5. accordion */
function Accordion({ f, s }: P) {
  const [open, setOpen] = useState(0);
  const { where, what } = f.summary();
  const items = [
    { t: "About you", sum: f.email || "Name, ZIP, email", body: <Fields f={f} style={s} /> },
    { t: "Distance", sum: where, body: <Radius f={f} style={s} /> },
    { t: "Shows", sum: what, body: (<><Types f={f} style={s} /><TypesNote /></>) },
  ];
  return (
    <div className="a1-accordion">
      <Title />
      {items.map((it, i) => (
        <section key={it.t} className={`a1-acc ${open === i ? "on" : ""}`}>
          <button type="button" className="a1-acc-head" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span className="a1-acc-n">{String(i + 1).padStart(2, "0")}</span>
            <span className="a1-acc-t">{it.t}</span>
            <span className="a1-acc-sum">{it.sum}</span>
            <span className="a1-acc-pm" aria-hidden="true">+</span>
          </button>
          {open === i && <div className="a1-acc-body">{it.body}</div>}
        </section>
      ))}
      <Consent f={f} />
      <Submit f={f} style={s} />
    </div>
  );
}

/* 6. tabs */
function Tabs({ f, s }: P) {
  const [tab, setTab] = useState(0);
  const tabs = ["Who", "Where", "What"];
  return (
    <div className="a1-tabs">
      <Title />
      <div className="a1-tablist" role="tablist">
        {tabs.map((t, i) => (
          <button key={t} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>
            {t}
            <small>{i === 0 ? (f.email ? "✓" : "") : i === 1 ? RADII.find((r) => r.id === f.radius)!.short : f.types.length || "all"}</small>
          </button>
        ))}
      </div>
      <div className="a1-tabpanel" role="tabpanel" key={tab}>
        {tab === 0 && <Fields f={f} style={s} />}
        {tab === 1 && <Radius f={f} style={s} />}
        {tab === 2 && (<><Types f={f} style={s} /><TypesNote /></>)}
      </div>
      <Consent f={f} />
      <Submit f={f} style={s} />
    </div>
  );
}

/* 7. compact bar + drawer */
function Bar({ f, s }: P) {
  const [open, setOpen] = useState(false);
  return (
    <div className="a1-bar-wrap">
      <Title />
      <div className="a1-bar">
        <Fields f={f} style={s} only={["email", "zip"]} />
        <button type="button" className="a1-ghost a1-filter-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
          Filters{f.types.length ? ` (${f.types.length})` : ""} {open ? "▴" : "▾"}
        </button>
        <button type="button" className={`a1-submit a1-submit--${s}`} onClick={f.submit}>Enable alerts</button>
      </div>
      {open && (
        <div className="a1-drawer">
          <Fields f={f} style={s} only={["name"]} />
          <section><Label>Travel radius</Label><Radius f={f} style={s} /></section>
          <section><Label>Show types</Label><Types f={f} style={s} compact /></section>
        </div>
      )}
      <Consent f={f} />
      {f.status !== "idle" && <Submit f={f} style={s} />}
    </div>
  );
}

/* 8. summary sidebar */
function Sidebar({ f, s }: P) {
  const { where, what } = f.summary();
  return (
    <div className="a1-sidebar">
      <div className="a1-sidebar-main">
        <Title />
        <Fields f={f} style={s} />
        <section><Label>Travel radius</Label><Radius f={f} style={s} /></section>
        <section><Label>Format, feature and venue</Label><Types f={f} style={s} /></section>
      </div>
      <aside className="a1-sidebar-card">
        <p className="a1-micro">Your alert</p>
        <p className="a1-preview">
          <b>{f.name || "You"}</b> will hear about <b>{where}</b>, for <b>{what}</b>.
        </p>
        <p className="a1-micro a1-to">{f.email || "you@email.com"}</p>
        <Consent f={f} />
        <Submit f={f} style={s} />
      </aside>
    </div>
  );
}

/* 9. email first */
function Reveal({ f, s }: P) {
  const ready = /^\S+@\S+\.\S+$/.test(f.email);
  return (
    <div className="a1-reveal">
      <Title>Never miss a show near you</Title>
      <label className="a1-hero-input">
        <span className="a1-micro">Your email</span>
        <input type="email" autoComplete="email" placeholder="you@email.com" value={f.email} onChange={(e) => f.setEmail(e.target.value)} />
      </label>
      <div className={`a1-reveal-rest ${ready ? "on" : ""}`} aria-hidden={!ready}>
        <Fields f={f} style={s} only={["name", "zip"]} />
        <section><Label>Travel radius</Label><Radius f={f} style={s} /></section>
        <section><Label>Show types</Label><Types f={f} style={s} /><TypesNote /></section>
        <Consent f={f} />
        <Submit f={f} style={s} />
      </div>
      {!ready && <p className="a1-note">Type your email to choose distance and show types.</p>}
    </div>
  );
}

/* 10. bento */
function Bento({ f, s }: P) {
  return (
    <div className="a1-bento">
      <div className="a1-cell a1-cell--title"><Title /></div>
      <div className="a1-cell a1-cell--fields"><Fields f={f} style={s} layout="col" /></div>
      <div className="a1-cell a1-cell--radius"><Label>Travel radius</Label><Radius f={f} style={s} /></div>
      <div className="a1-cell a1-cell--types"><Label>Format, feature and venue</Label><Types f={f} style={s} /><TypesNote /></div>
      <div className="a1-cell a1-cell--go"><Consent f={f} /><Submit f={f} style={s} /></div>
    </div>
  );
}

const MAP: Record<StructureId, (p: P) => JSX.Element> = {
  stacked: Stacked,
  split: Split,
  wizard: Wizard,
  sentence: Sentence,
  accordion: Accordion,
  tabs: Tabs,
  bar: Bar,
  sidebar: Sidebar,
  reveal: Reveal,
  bento: Bento,
};

export default function AlertLayout({ structure, style }: { structure: StructureId; style: StyleId }) {
  const f = useAlertForm();
  const C = MAP[structure];
  return (
    <form className={`a1 a1--${style} a1--${structure}`} onSubmit={(e) => { e.preventDefault(); f.submit(); }} noValidate>
      <C f={f} s={style} />
    </form>
  );
}

export { TYPES };
