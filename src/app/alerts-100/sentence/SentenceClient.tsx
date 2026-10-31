"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import "./sentence.css";

interface FormState {
  name: string;
  zip: string;
  channels: string[];
  email: string;
  radius: string;
  types: string[];
}

const DEFAULT_STATE: FormState = {
  name: "",
  zip: "60067",
  channels: ["email"],
  email: "",
  radius: "50",
  types: ["festivals", "clubs"],
};

const SAMPLE_STATE: FormState = {
  name: "Alex",
  zip: "60067",
  channels: ["email", "app"],
  email: "alex@example.com",
  radius: "50",
  types: ["festivals", "clubs"],
};

function bSize(val: string, ph: string): number {
  return Math.max(1, (val ? val : ph).length);
}

export default function SentenceClient() {
  const [globalData, setGlobalData] = useState<FormState>(DEFAULT_STATE);
  const [synced, setSynced] = useState(true);

  const toggleChannel = (state: FormState, setState: (s: FormState) => void, ch: string) => {
    const next = state.channels.includes(ch)
      ? state.channels.filter((c) => c !== ch)
      : [...state.channels, ch];
    setState({ ...state, channels: next });
  };

  const toggleType = (state: FormState, setState: (s: FormState) => void, tp: string) => {
    const next = state.types.includes(tp)
      ? state.types.filter((t) => t !== tp)
      : [...state.types, tp];
    setState({ ...state, types: next });
  };

  const handleFillAll = () => {
    setGlobalData(SAMPLE_STATE);
  };

  const handleClearAll = () => {
    setGlobalData({
      name: "",
      zip: "",
      channels: [],
      email: "",
      radius: "50",
      types: [],
    });
  };

  return (
    <main className="st" data-no-text-anim>
      <header>
        <p className="st-label">Interactive Explorations · 20 Styles</p>
        <h1 className="st-anton st-h1">20 Versions of the Conversational Form</h1>
        <p className="st-lede">
          Natural language Mad-Libs style alert forms: line-by-line, bold poster, continuous prose,
          terminal CLI, lyric stanzas, and interactive capsules. All 20 are fully live.
        </p>
      </header>

      <section aria-label="Version Controls" className="st-toolbar">
        <div className="st-links">
          <Link href="/alerts-100" className="st-link">
            ← 100 Main Layouts
          </Link>
          <Link href="/alerts-100/rings" className="st-link">
            20 Radius Rings
          </Link>
          <span className="st-link active">20 Conversational Forms</span>
        </div>

        <div className="st-actions">
          <button type="button" className="st-btn-pill" onClick={handleFillAll}>
            Prefill Sample Data
          </button>
          <button type="button" className="st-btn-pill" onClick={handleClearAll}>
            Clear Fields
          </button>
          <button
            type="button"
            className="st-btn-pill"
            onClick={() => setSynced(!synced)}
            aria-pressed={synced}
          >
            {synced ? "Linked Inputs (All Sync)" : "Independent Inputs"}
          </button>
        </div>
      </section>

      <section aria-label="20 Variations Grid" className="st-grid">
        {VERSIONS.map((v, i) => (
          <VersionWrapper
            key={v.id}
            num={i + 1}
            name={v.name}
            tagline={v.tagline}
            globalData={globalData}
            synced={synced}
            renderForm={(state, setState) =>
              v.render({
                state,
                setState,
                toggleChannel: (ch) => toggleChannel(state, setState, ch),
                toggleType: (tp) => toggleType(state, setState, tp),
                uid: `v${i + 1}`,
              })
            }
          />
        ))}
      </section>
    </main>
  );
}

interface VersionProps {
  state: FormState;
  setState: (s: FormState) => void;
  toggleChannel: (ch: string) => void;
  toggleType: (tp: string) => void;
  uid: string;
}

interface VersionDef {
  id: string;
  name: string;
  tagline: string;
  render: (p: VersionProps) => ReactNode;
}

function VersionWrapper({
  num,
  name,
  tagline,
  globalData,
  synced,
  renderForm,
}: {
  num: number;
  name: string;
  tagline: string;
  globalData: FormState;
  synced: boolean;
  renderForm: (state: FormState, setState: (s: FormState) => void) => ReactNode;
}) {
  const [localData, setLocalData] = useState<FormState>(globalData);
  const [submitted, setSubmitted] = useState(false);

  const activeState = synced ? globalData : localData;
  const activeSetter = synced ? () => {} : setLocalData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <article className="st-card" id={`version-${num}`}>
      <header className="st-head">
        <span className="st-anton st-num">{String(num).padStart(2, "0")}</span>
        <h2 className="st-name">{name}</h2>
        <span className="st-tagline">{tagline}</span>
      </header>

      <form onSubmit={handleSubmit} className="st-stage" noValidate>
        {renderForm(activeState, activeSetter)}

        <footer className="st-foot">
          <button type="submit" className="st-submit-mini">
            Keep Me Posted
          </button>
          <span className="st-status" role="status">
            {submitted
              ? `✓ Alert primed for ${activeState.name || "you"} (${activeState.zip || "anywhere"})`
              : "No spam. Unsubscribe anytime."}
          </span>
        </footer>
      </form>
    </article>
  );
}

/* ── 20 Distinct Version Definitions ───────────────────────────────── */

const VERSIONS: VersionDef[] = [
  // 01: The Pure Underline (Editorial Baseline)
  {
    id: "underline",
    name: "Pure Underline Baseline",
    tagline: "The original line-by-line editorial rhythm",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v1-flow">
        <div>
          My name is{" "}
          <input
            id={`${uid}-name`}
            aria-label="Your first name"
            className="st-blank"
            type="text"
            placeholder="your first name"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            size={bSize(state.name, "placeholder")}
          />.
        </div>
        <div>
          My zip code is{" "}
          <input
            id={`${uid}-zip`}
            aria-label="Your zip code"
            className="st-blank"
            type="text"
            placeholder="60067"
            value={state.zip}
            onChange={(e) => setState({ ...state, zip: e.target.value })}
            size={bSize(state.zip, "placeholder")}
          />.
        </div>
        <div>
          Let me know by{" "}
          <span role="group" aria-label="Notification channels">
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("email")}
              className="st-chip"
              onClick={() => toggleChannel("email")}
            >
              email
            </button>{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("app")}
              className="st-chip"
              onClick={() => toggleChannel("app")}
            >
              app notification
            </button>
          </span>
        </div>
        {state.channels.includes("email") && (
          <div>
            You can reach me at{" "}
            <input
              id={`${uid}-email`}
              aria-label="Email address"
              className="st-blank"
              type="email"
              placeholder="you@email.com"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              size={bSize(state.email, "placeholder")}
            />.
          </div>
        )}
      </div>
    ),
  },

  // 02: Big Type Poster (Anton Display)
  {
    id: "poster",
    name: "Big Type Poster",
    tagline: "Gigantic condensed Anton display cuts",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v2-flow">
        <div>
          CALL ME{" "}
          <input
            id={`${uid}-name-2`}
            aria-label="Your first name"
            className="st-blank"
            type="text"
            placeholder="NAME"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            size={bSize(state.name, "placeholder")}
          />
        </div>
        <div>
          NEAR ZIP{" "}
          <input
            id={`${uid}-zip-2`}
            aria-label="Your zip code"
            className="st-blank"
            type="text"
            placeholder="60067"
            value={state.zip}
            onChange={(e) => setState({ ...state, zip: e.target.value })}
            size={bSize(state.zip, "placeholder")}
          />
        </div>
        <div>
          PING VIA{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("email")}
            className="st-chip"
            onClick={() => toggleChannel("email")}
          >
            EMAIL
          </button>{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("app")}
            className="st-chip"
            onClick={() => toggleChannel("app")}
          >
            APP PUSH
          </button>
        </div>
        <div>
          AT{" "}
          <input
            id={`${uid}-email-2`}
            aria-label="Email address"
            className="st-blank"
            type="email"
            placeholder="EMAIL@ADDR"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            size={bSize(state.email, "placeholder")}
          />
        </div>
      </div>
    ),
  },

  // 03: Continuous Flowing Prose (The Story Paragraph)
  {
    id: "prose",
    name: "Continuous Flowing Prose",
    tagline: "A single uninterrupted running paragraph",
    render: ({ state, setState, toggleChannel, uid }) => (
      <p className="st-v3-flow">
        Hey 7th Heaven, my name is{" "}
        <input
          id={`${uid}-name-3`}
          aria-label="Your first name"
          className="st-blank"
          type="text"
          placeholder="your first name"
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
          size={bSize(state.name, "placeholder")}
        />{" "}
        and I live around zip code{" "}
        <input
          id={`${uid}-zip-3`}
          aria-label="Your zip code"
          className="st-blank"
          type="text"
          placeholder="60067"
          value={state.zip}
          onChange={(e) => setState({ ...state, zip: e.target.value })}
          size={bSize(state.zip, "placeholder")}
        />
        . Please notify me by{" "}
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("email")}
          className="st-chip"
          onClick={() => toggleChannel("email")}
        >
          email
        </button>{" "}
        or{" "}
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("app")}
          className="st-chip"
          onClick={() => toggleChannel("app")}
        >
          app alert
        </button>{" "}
        at{" "}
        <input
          id={`${uid}-email-3`}
          aria-label="Email address"
          className="st-blank"
          type="email"
          placeholder="you@email.com"
          value={state.email}
          onChange={(e) => setState({ ...state, email: e.target.value })}
          size={bSize(state.email, "placeholder")}
        />{" "}
        when you announce tour stops within {state.radius} miles.
      </p>
    ),
  },

  // 04: The Mad Libs Bracketed Punchcard
  {
    id: "madlibs",
    name: "Mad-Libs Punchcard",
    tagline: "Boxed fill-ins with sub-labels underneath",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v4-flow">
        <div>
          My name is
          <span className="st-v4-slot">
            <input
              id={`${uid}-name-4`}
              aria-label="Your first name"
              className="st-blank"
              type="text"
              placeholder="first name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              size={bSize(state.name, "placeholder")}
            />
            <span className="st-v4-meta">First Name</span>
          </span>
          and I call
          <span className="st-v4-slot">
            <input
              id={`${uid}-zip-4`}
              aria-label="Your zip code"
              className="st-blank"
              type="text"
              placeholder="60067"
              value={state.zip}
              onChange={(e) => setState({ ...state, zip: e.target.value })}
              size={bSize(state.zip, "placeholder")}
            />
            <span className="st-v4-meta">Zip Code</span>
          </span>
          home.
        </div>
        <div>
          Send alerts to
          <span className="st-v4-slot">
            <input
              id={`${uid}-email-4`}
              aria-label="Email address"
              className="st-blank"
              type="email"
              placeholder="you@email.com"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              size={bSize(state.email, "placeholder")}
            />
            <span className="st-v4-meta">Email Address</span>
          </span>
          via
          <span className="st-v4-slot">
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("email")}
              className="st-chip"
              onClick={() => toggleChannel("email")}
            >
              email
            </button>
            <span className="st-v4-meta">Direct</span>
          </span>
          <span className="st-v4-slot">
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("app")}
              className="st-chip"
              onClick={() => toggleChannel("app")}
            >
              app
            </button>
            <span className="st-v4-meta">Instant</span>
          </span>
        </div>
      </div>
    ),
  },

  // 05: Monospace Hacker Terminal (CLI Prompt)
  {
    id: "terminal",
    name: "Terminal CLI Prompt",
    tagline: "Developer shell syntax with key/value pairs",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v5-flow">
        <div className="st-v5-line">
          <span className="st-v5-prompt">7thHeaven:~$</span>
          <span className="st-v5-key">set user.name =</span>
          <input
            id={`${uid}-name-5`}
            aria-label="User name"
            className="st-blank"
            type="text"
            placeholder={`"Alex"`}
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            size={bSize(state.name, "placeholder")}
          />
        </div>
        <div className="st-v5-line">
          <span className="st-v5-prompt">7thHeaven:~$</span>
          <span className="st-v5-key">set location.zip =</span>
          <input
            id={`${uid}-zip-5`}
            aria-label="Zip code"
            className="st-blank"
            type="text"
            placeholder={`"60067"`}
            value={state.zip}
            onChange={(e) => setState({ ...state, zip: e.target.value })}
            size={bSize(state.zip, "placeholder")}
          />
        </div>
        <div className="st-v5-line">
          <span className="st-v5-prompt">7thHeaven:~$</span>
          <span className="st-v5-key">set dispatch.method = [</span>
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("email")}
            className="st-v5-chip"
            onClick={() => toggleChannel("email")}
          >
            &quot;email&quot;
          </button>
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("app")}
            className="st-v5-chip"
            onClick={() => toggleChannel("app")}
          >
            &quot;app_push&quot;
          </button>
          <span className="st-v5-key">]</span>
        </div>
        <div className="st-v5-line">
          <span className="st-v5-prompt">7thHeaven:~$</span>
          <span className="st-v5-key">set contact.endpoint =</span>
          <input
            id={`${uid}-email-5`}
            aria-label="Contact email"
            className="st-blank"
            type="email"
            placeholder={`"you@email.com"`}
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            size={bSize(state.email, "placeholder")}
          />
        </div>
      </div>
    ),
  },

  // 06: Backstage VIP Pass / Rider Contract
  {
    id: "rider",
    name: "VIP Rider Clause",
    tagline: "Formal concert contract phrasing with left gold accent",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v6-flow">
        <span className="st-v6-clause">SECTION 1 · FAN RECOGNITION</span>
        The attendee known as{" "}
        <input
          id={`${uid}-name-6`}
          aria-label="Attendee name"
          className="st-blank"
          type="text"
          placeholder="your full name"
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
          size={bSize(state.name, "placeholder")}
        />
        , stationed within postal perimeter{" "}
        <input
          id={`${uid}-zip-6`}
          aria-label="Postal code"
          className="st-blank"
          type="text"
          placeholder="60067"
          value={state.zip}
          onChange={(e) => setState({ ...state, zip: e.target.value })}
          size={bSize(state.zip, "placeholder")}
        />
        , hereby requisitions priority show notifications by means of{" "}
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("email")}
          className="st-chip"
          onClick={() => toggleChannel("email")}
        >
          electronic mail
        </button>{" "}
        or{" "}
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("app")}
          className="st-chip"
          onClick={() => toggleChannel("app")}
        >
          push transmission
        </button>{" "}
        delivered to{" "}
        <input
          id={`${uid}-email-6`}
          aria-label="Email address"
          className="st-blank"
          type="email"
          placeholder="you@email.com"
          value={state.email}
          onChange={(e) => setState({ ...state, email: e.target.value })}
          size={bSize(state.email, "placeholder")}
        />
        .
      </div>
    ),
  },

  // 07: Minimalist Floating Tag / Capsule Slots
  {
    id: "capsule",
    name: "Embedded Capsule Slots",
    tagline: "Rounded pill inputs sitting neatly inside the text",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v7-flow">
        <div>
          I&apos;m{" "}
          <input
            id={`${uid}-name-7`}
            aria-label="Your first name"
            className="st-blank"
            type="text"
            placeholder="first name"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            size={bSize(state.name, "placeholder")}
          />{" "}
          and my home base is{" "}
          <input
            id={`${uid}-zip-7`}
            aria-label="Zip code"
            className="st-blank"
            type="text"
            placeholder="60067"
            value={state.zip}
            onChange={(e) => setState({ ...state, zip: e.target.value })}
            size={bSize(state.zip, "placeholder")}
          />.
        </div>
        <div>
          Dispatch alerts to{" "}
          <input
            id={`${uid}-email-7`}
            aria-label="Email address"
            className="st-blank"
            type="email"
            placeholder="you@email.com"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            size={bSize(state.email, "placeholder")}
          />{" "}
          via{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("email")}
            className="st-chip"
            onClick={() => toggleChannel("email")}
          >
            email
          </button>{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("app")}
            className="st-chip"
            onClick={() => toggleChannel("app")}
          >
            app
          </button>{" "}
          .
        </div>
      </div>
    ),
  },

  // 08: Question & Answer Ping-Pong Dialogue
  {
    id: "dialogue",
    name: "Q&A Ping-Pong Dialogue",
    tagline: "Conversational call-and-response between band and fan",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v8-flow">
        <div className="st-v8-row">
          <span className="st-v8-q">Who&apos;s rocking?</span>
          <div className="st-v8-a">
            My name is{" "}
            <input
              id={`${uid}-name-8`}
              aria-label="Your first name"
              className="st-blank"
              type="text"
              placeholder="your name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              size={bSize(state.name, "placeholder")}
            />.
          </div>
        </div>
        <div className="st-v8-row">
          <span className="st-v8-q">Where from?</span>
          <div className="st-v8-a">
            My zip code is{" "}
            <input
              id={`${uid}-zip-8`}
              aria-label="Zip code"
              className="st-blank"
              type="text"
              placeholder="60067"
              value={state.zip}
              onChange={(e) => setState({ ...state, zip: e.target.value })}
              size={bSize(state.zip, "placeholder")}
            />.
          </div>
        </div>
        <div className="st-v8-row">
          <span className="st-v8-q">How to reach you?</span>
          <div className="st-v8-a">
            Ping me via{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("email")}
              className="st-chip"
              onClick={() => toggleChannel("email")}
            >
              email
            </button>{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("app")}
              className="st-chip"
              onClick={() => toggleChannel("app")}
            >
              app
            </button>{" "}
            at{" "}
            <input
              id={`${uid}-email-8`}
              aria-label="Email address"
              className="st-blank"
              type="email"
              placeholder="you@email.com"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              size={bSize(state.email, "placeholder")}
            />.
          </div>
        </div>
      </div>
    ),
  },

  // 09: Stepped Lyric Verse (Song Lyric Stanzas)
  {
    id: "lyrics",
    name: "Stepped Lyric Stanzas",
    tagline: "Indented verses styled like album lyric liner notes",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v9-flow">
        <div className="st-v9-line-0">
          My name is{" "}
          <input
            id={`${uid}-name-9`}
            aria-label="Your first name"
            className="st-blank"
            type="text"
            placeholder="your first name"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            size={bSize(state.name, "placeholder")}
          />
        </div>
        <div className="st-v9-line-1">
          under the sky of zip{" "}
          <input
            id={`${uid}-zip-9`}
            aria-label="Zip code"
            className="st-blank"
            type="text"
            placeholder="60067"
            value={state.zip}
            onChange={(e) => setState({ ...state, zip: e.target.value })}
            size={bSize(state.zip, "placeholder")}
          />
        </div>
        <div className="st-v9-line-2">
          sing to me through{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("email")}
            className="st-chip"
            onClick={() => toggleChannel("email")}
          >
            email
          </button>{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("app")}
            className="st-chip"
            onClick={() => toggleChannel("app")}
          >
            app
          </button>
        </div>
        <div className="st-v9-line-3">
          at{" "}
          <input
            id={`${uid}-email-9`}
            aria-label="Email address"
            className="st-blank"
            type="email"
            placeholder="you@email.com"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            size={bSize(state.email, "placeholder")}
          />
        </div>
        <div className="st-v9-line-4">whenever the stage lights turn on.</div>
      </div>
    ),
  },

  // 10: Neon Cyber Glow (Electric Nightclub)
  {
    id: "neon",
    name: "Neon Cyber Glow",
    tagline: "Vibrant yellow glow with electric drop shadows",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v10-flow">
        <div>
          My name is{" "}
          <input
            id={`${uid}-name-10`}
            aria-label="Your first name"
            className="st-blank"
            type="text"
            placeholder="your first name"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            size={bSize(state.name, "placeholder")}
          />.
        </div>
        <div>
          My zip code is{" "}
          <input
            id={`${uid}-zip-10`}
            aria-label="Zip code"
            className="st-blank"
            type="text"
            placeholder="60067"
            value={state.zip}
            onChange={(e) => setState({ ...state, zip: e.target.value })}
            size={bSize(state.zip, "placeholder")}
          />.
        </div>
        <div>
          Let me know by{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("email")}
            className="st-chip"
            onClick={() => toggleChannel("email")}
          >
            email
          </button>{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("app")}
            className="st-chip"
            onClick={() => toggleChannel("app")}
          >
            app notification
          </button>
        </div>
        <div>
          You can reach me at{" "}
          <input
            id={`${uid}-email-10`}
            aria-label="Email address"
            className="st-blank"
            type="email"
            placeholder="you@email.com"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            size={bSize(state.email, "placeholder")}
          />.
        </div>
      </div>
    ),
  },

  // 11: Numbered Editorial Steps (01 / 02 / 03 / 04)
  {
    id: "numbered",
    name: "Numbered Editorial Steps",
    tagline: "Clean numbered indexing with sentence lines",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v11-flow">
        <div className="st-v11-step">
          <span className="st-v11-idx">01</span>
          <div className="st-v11-body">
            My name is{" "}
            <input
              id={`${uid}-name-11`}
              aria-label="Your first name"
              className="st-blank"
              type="text"
              placeholder="first name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              size={bSize(state.name, "placeholder")}
            />.
          </div>
        </div>
        <div className="st-v11-step">
          <span className="st-v11-idx">02</span>
          <div className="st-v11-body">
            My zip code is{" "}
            <input
              id={`${uid}-zip-11`}
              aria-label="Zip code"
              className="st-blank"
              type="text"
              placeholder="60067"
              value={state.zip}
              onChange={(e) => setState({ ...state, zip: e.target.value })}
              size={bSize(state.zip, "placeholder")}
            />.
          </div>
        </div>
        <div className="st-v11-step">
          <span className="st-v11-idx">03</span>
          <div className="st-v11-body">
            Let me know by{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("email")}
              className="st-chip"
              onClick={() => toggleChannel("email")}
            >
              email
            </button>{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("app")}
              className="st-chip"
              onClick={() => toggleChannel("app")}
            >
              app notification
            </button>
          </div>
        </div>
        <div className="st-v11-step">
          <span className="st-v11-idx">04</span>
          <div className="st-v11-body">
            You can reach me at{" "}
            <input
              id={`${uid}-email-11`}
              aria-label="Email address"
              className="st-blank"
              type="email"
              placeholder="you@email.com"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              size={bSize(state.email, "placeholder")}
            />.
          </div>
        </div>
      </div>
    ),
  },

  // 12: Dual Highlight Marker (Sun Gold Highlighter)
  {
    id: "highlighter",
    name: "Gold Highlighter Marker",
    tagline: "Warm yellow marker wash behind active filled words",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v12-flow">
        <div>
          My name is{" "}
          <input
            id={`${uid}-name-12`}
            aria-label="Your first name"
            className="st-blank"
            type="text"
            placeholder="your first name"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            size={bSize(state.name, "placeholder")}
          />.
        </div>
        <div>
          My zip code is{" "}
          <input
            id={`${uid}-zip-12`}
            aria-label="Zip code"
            className="st-blank"
            type="text"
            placeholder="60067"
            value={state.zip}
            onChange={(e) => setState({ ...state, zip: e.target.value })}
            size={bSize(state.zip, "placeholder")}
          />.
        </div>
        <div>
          Let me know by{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("email")}
            className="st-chip"
            onClick={() => toggleChannel("email")}
          >
            email
          </button>{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("app")}
            className="st-chip"
            onClick={() => toggleChannel("app")}
          >
            app notification
          </button>
        </div>
        <div>
          You can reach me at{" "}
          <input
            id={`${uid}-email-12`}
            aria-label="Email address"
            className="st-blank"
            type="email"
            placeholder="you@email.com"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            size={bSize(state.email, "placeholder")}
          />.
        </div>
      </div>
    ),
  },

  // 13: Vintage Typewriter Manuscript
  {
    id: "typewriter",
    name: "Vintage Typewriter",
    tagline: "Courier letterpress with monospaced underscores",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v13-flow">
        <div>
          MY NAME IS{" "}
          <input
            id={`${uid}-name-13`}
            aria-label="Your name"
            className="st-blank"
            type="text"
            placeholder="FIRST_NAME"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            size={bSize(state.name, "placeholder")}
          />.
        </div>
        <div>
          MY ZIP CODE IS{" "}
          <input
            id={`${uid}-zip-13`}
            aria-label="Zip code"
            className="st-blank"
            type="text"
            placeholder="60067"
            value={state.zip}
            onChange={(e) => setState({ ...state, zip: e.target.value })}
            size={bSize(state.zip, "placeholder")}
          />.
        </div>
        <div>
          DISPATCH METHOD: [
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("email")}
            className="st-chip"
            onClick={() => toggleChannel("email")}
          >
            EMAIL
          </button>{" "}
          <button
            type="button"
            role="checkbox"
            aria-checked={state.channels.includes("app")}
            className="st-chip"
            onClick={() => toggleChannel("app")}
          >
            APP_PUSH
          </button>
          ]
        </div>
        <div>
          DISPATCH ADDRESS:{" "}
          <input
            id={`${uid}-email-13`}
            aria-label="Email address"
            className="st-blank"
            type="email"
            placeholder="YOU@EMAIL.COM"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            size={bSize(state.email, "placeholder")}
          />.
        </div>
      </div>
    ),
  },

  // 14: Drop-Cap Magazine Feature
  {
    id: "dropcap",
    name: "Drop-Cap Editorial",
    tagline: "Oversized decorative initial letter leading the narrative",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v14-flow">
        <span className="st-v14-drop">M</span>y name is{" "}
        <input
          id={`${uid}-name-14`}
          aria-label="Your first name"
          className="st-blank"
          type="text"
          placeholder="your first name"
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
          size={bSize(state.name, "placeholder")}
        />
        , and my hometown postal zip is{" "}
        <input
          id={`${uid}-zip-14`}
          aria-label="Zip code"
          className="st-blank"
          type="text"
          placeholder="60067"
          value={state.zip}
          onChange={(e) => setState({ ...state, zip: e.target.value })}
          size={bSize(state.zip, "placeholder")}
        />
        . Keep me in the loop by{" "}
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("email")}
          className="st-chip"
          onClick={() => toggleChannel("email")}
        >
          email
        </button>{" "}
        or{" "}
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("app")}
          className="st-chip"
          onClick={() => toggleChannel("app")}
        >
          app notification
        </button>{" "}
        sent straight to{" "}
        <input
          id={`${uid}-email-14`}
          aria-label="Email address"
          className="st-blank"
          type="email"
          placeholder="you@email.com"
          value={state.email}
          onChange={(e) => setState({ ...state, email: e.target.value })}
          size={bSize(state.email, "placeholder")}
        />
        .
      </div>
    ),
  },

  // 15: Click-to-Cycle Quick Presets
  {
    id: "cycle",
    name: "Click-to-Cycle Presets",
    tagline: "One-click rotating word selector inside sentence blanks",
    render: ({ state, setState, toggleChannel, uid }) => {
      const RADIUS_OPTIONS = ["15", "30", "50", "100", "any distance"];
      const cycleRadius = () => {
        const idx = RADIUS_OPTIONS.indexOf(state.radius);
        const next = RADIUS_OPTIONS[(idx + 1) % RADIUS_OPTIONS.length];
        setState({ ...state, radius: next });
      };

      return (
        <div className="st-v15-flow">
          <div>
            My name is{" "}
            <input
              id={`${uid}-name-15`}
              aria-label="Your first name"
              className="st-blank"
              type="text"
              placeholder="your first name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              size={bSize(state.name, "placeholder")}
            />.
          </div>
          <div>
            My zip code is{" "}
            <input
              id={`${uid}-zip-15`}
              aria-label="Zip code"
              className="st-blank"
              type="text"
              placeholder="60067"
              value={state.zip}
              onChange={(e) => setState({ ...state, zip: e.target.value })}
              size={bSize(state.zip, "placeholder")}
            />.
          </div>
          <div>
            I&apos;ll travel up to{" "}
            <button
              type="button"
              className="st-v15-cycle"
              onClick={cycleRadius}
              aria-label="Click to cycle travel distance"
            >
              {state.radius === "any distance" ? "any distance" : `${state.radius} miles`}
            </button>{" "}
            for shows.
          </div>
          <div>
            Let me know by{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("email")}
              className="st-chip"
              onClick={() => toggleChannel("email")}
            >
              email
            </button>{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("app")}
              className="st-chip"
              onClick={() => toggleChannel("app")}
            >
              app
            </button>{" "}
            at{" "}
            <input
              id={`${uid}-email-15`}
              aria-label="Email address"
              className="st-blank"
              type="email"
              placeholder="you@email.com"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              size={bSize(state.email, "placeholder")}
            />.
          </div>
        </div>
      );
    },
  },

  // 16: Two-Column Greeting & Dispatch
  {
    id: "twocol",
    name: "Two-Column Fan & Dispatch",
    tagline: "Who you are on the left, how to ping you on the right",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v16-flow">
        <div className="st-v16-col">
          <span className="st-v16-badge">1. Who You Are</span>
          <p>
            My name is{" "}
            <input
              id={`${uid}-name-16`}
              aria-label="Your first name"
              className="st-blank"
              type="text"
              placeholder="first name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              size={bSize(state.name, "placeholder")}
            />.
          </p>
          <p>
            My zip code is{" "}
            <input
              id={`${uid}-zip-16`}
              aria-label="Zip code"
              className="st-blank"
              type="text"
              placeholder="60067"
              value={state.zip}
              onChange={(e) => setState({ ...state, zip: e.target.value })}
              size={bSize(state.zip, "placeholder")}
            />.
          </p>
        </div>
        <div className="st-v16-col">
          <span className="st-v16-badge">2. How to Reach You</span>
          <p>
            Let me know by{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("email")}
              className="st-chip"
              onClick={() => toggleChannel("email")}
            >
              email
            </button>{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("app")}
              className="st-chip"
              onClick={() => toggleChannel("app")}
            >
              app
            </button>
          </p>
          <p>
            Reach me at{" "}
            <input
              id={`${uid}-email-16`}
              aria-label="Email address"
              className="st-blank"
              type="email"
              placeholder="you@email.com"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              size={bSize(state.email, "placeholder")}
            />.
          </p>
        </div>
      </div>
    ),
  },

  // 17: Speech Bubble Dialogue Balloon
  {
    id: "bubble",
    name: "Dialogue Speech Balloon",
    tagline: "Chat bubble framing with conversational tail",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v17-balloon">
        &ldquo;Hey 7th Heaven! My name is{" "}
        <input
          id={`${uid}-name-17`}
          aria-label="Your first name"
          className="st-blank"
          type="text"
          placeholder="your first name"
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
          size={bSize(state.name, "placeholder")}
        />
        . My zip code is{" "}
        <input
          id={`${uid}-zip-17`}
          aria-label="Zip code"
          className="st-blank"
          type="text"
          placeholder="60067"
          value={state.zip}
          onChange={(e) => setState({ ...state, zip: e.target.value })}
          size={bSize(state.zip, "placeholder")}
        />
        . Hit me up by{" "}
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("email")}
          className="st-chip"
          onClick={() => toggleChannel("email")}
        >
          email
        </button>{" "}
        or{" "}
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("app")}
          className="st-chip"
          onClick={() => toggleChannel("app")}
        >
          app notification
        </button>{" "}
        at{" "}
        <input
          id={`${uid}-email-17`}
          aria-label="Email address"
          className="st-blank"
          type="email"
          placeholder="you@email.com"
          value={state.email}
          onChange={(e) => setState({ ...state, email: e.target.value })}
          size={bSize(state.email, "placeholder")}
        />
        !&rdquo;
      </div>
    ),
  },

  // 18: Compact Sentence Bar (One-Liner Linear Ribbon)
  {
    id: "ribbon",
    name: "Compact Horizontal Ribbon",
    tagline: "Scrollable linear stream where the sentence fits on one line",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v18-flow">
        <span>My name is</span>
        <input
          id={`${uid}-name-18`}
          aria-label="Your first name"
          className="st-blank"
          type="text"
          placeholder="first name"
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
          size={bSize(state.name, "placeholder")}
        />
        <span>•</span>
        <span>Zip code</span>
        <input
          id={`${uid}-zip-18`}
          aria-label="Zip code"
          className="st-blank"
          type="text"
          placeholder="60067"
          value={state.zip}
          onChange={(e) => setState({ ...state, zip: e.target.value })}
          size={bSize(state.zip, "placeholder")}
        />
        <span>•</span>
        <span>Notify by</span>
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("email")}
          className="st-chip"
          onClick={() => toggleChannel("email")}
        >
          email
        </button>
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("app")}
          className="st-chip"
          onClick={() => toggleChannel("app")}
        >
          app
        </button>
        <span>•</span>
        <span>Reach at</span>
        <input
          id={`${uid}-email-18`}
          aria-label="Email address"
          className="st-blank"
          type="email"
          placeholder="you@email.com"
          value={state.email}
          onChange={(e) => setState({ ...state, email: e.target.value })}
          size={bSize(state.email, "placeholder")}
        />
      </div>
    ),
  },

  // 19: Badge Token Assembler
  {
    id: "tokens",
    name: "Badge Token Assembler",
    tagline: "Inputs assemble into tactile rounded token chips as you type",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div className="st-v19-flow">
        <span>I am</span>
        {state.name ? (
          <span className="st-v19-token">👤 {state.name}</span>
        ) : (
          <input
            id={`${uid}-name-19`}
            aria-label="Your first name"
            className="st-blank"
            type="text"
            placeholder="your name"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            size={10}
          />
        )}
        <span>located at</span>
        {state.zip ? (
          <span className="st-v19-token">📍 {state.zip}</span>
        ) : (
          <input
            id={`${uid}-zip-19`}
            aria-label="Zip code"
            className="st-blank"
            type="text"
            placeholder="60067"
            value={state.zip}
            onChange={(e) => setState({ ...state, zip: e.target.value })}
            size={6}
          />
        )}
        <span>. Keep me posted via</span>
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("email")}
          className="st-chip"
          onClick={() => toggleChannel("email")}
        >
          email
        </button>
        <button
          type="button"
          role="checkbox"
          aria-checked={state.channels.includes("app")}
          className="st-chip"
          onClick={() => toggleChannel("app")}
        >
          app
        </button>
        <span>at</span>
        {state.email ? (
          <span className="st-v19-token">✉️ {state.email}</span>
        ) : (
          <input
            id={`${uid}-email-19`}
            aria-label="Email address"
            className="st-blank"
            type="email"
            placeholder="you@email.com"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            size={14}
          />
        )}
        <span>.</span>
      </div>
    ),
  },

  // 20: Teleprompter Realtime Synthesizer
  {
    id: "teleprompter",
    name: "Teleprompter Synthesizer",
    tagline: "Live synced real-time summary card that updates as you type",
    render: ({ state, setState, toggleChannel, uid }) => (
      <div>
        <div className="st-v20-top">
          <div>
            My name is{" "}
            <input
              id={`${uid}-name-20`}
              aria-label="Your first name"
              className="st-blank"
              type="text"
              placeholder="your first name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              size={bSize(state.name, "placeholder")}
            />.
          </div>
          <div>
            My zip code is{" "}
            <input
              id={`${uid}-zip-20`}
              aria-label="Zip code"
              className="st-blank"
              type="text"
              placeholder="60067"
              value={state.zip}
              onChange={(e) => setState({ ...state, zip: e.target.value })}
              size={bSize(state.zip, "placeholder")}
            />.
          </div>
          <div>
            Let me know by{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("email")}
              className="st-chip"
              onClick={() => toggleChannel("email")}
            >
              email
            </button>{" "}
            <button
              type="button"
              role="checkbox"
              aria-checked={state.channels.includes("app")}
              className="st-chip"
              onClick={() => toggleChannel("app")}
            >
              app notification
            </button>{" "}
            at{" "}
            <input
              id={`${uid}-email-20`}
              aria-label="Email address"
              className="st-blank"
              type="email"
              placeholder="you@email.com"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              size={bSize(state.email, "placeholder")}
            />.
          </div>
        </div>

        <div className="st-v20-preview">
          <span className="st-v20-preview-label">Live Pass Readout</span>
          &ldquo;7th Heaven alert activated for{" "}
          <strong>{state.name || "[Your Name]"}</strong> in{" "}
          <strong>{state.zip || "[Zip 60067]"}</strong> via{" "}
          <strong>
            {state.channels.length > 0 ? state.channels.join(" + ") : "no channel selected yet"}
          </strong>{" "}
          to <strong>{state.email || "[Your Email]"}</strong>.&rdquo;
        </div>
      </div>
    ),
  },
];
