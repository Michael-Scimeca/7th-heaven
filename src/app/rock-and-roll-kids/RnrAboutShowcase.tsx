"use client";

import { useState } from "react";

export type AboutLayoutId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

export interface AboutPillar {
  title: string;
  desc: string;
  tag: string;
}

export interface CastCharacter {
  name: string;
  role: string;
  desc: string;
  image: string;
}

interface RnrAboutShowcaseProps {
  badge: string;
  para1: string;
  para2: string;
  pillars: AboutPillar[];
  cast: CastCharacter[];
}

const ABOUT_LAYOUTS: Array<{
  id: AboutLayoutId;
  name: string;
  tag: string;
}> = [
  { id: 1, name: "Triptych + Tiered Cast (5 Band + 3 Crew)", tag: "1. Story/Ensemble/Pillars Triptych → 2. 5 Band Kids → 3. 3 Crew & Villains" },
  { id: 2, name: "F-Pattern Sticky Sidebar + Cast Inspector", tag: "Left sticky Story & Pillars rail • Right interactive Character Hero + 4x2 grid" },
  { id: 3, name: "Inverted Pyramid (Hero Panorama → Pillars → Cast)", tag: "Full-width Ensemble Hero on top → 4 Pillar Strip → 4x2 Character Grid" },
  { id: 4, name: "Asymmetric 12-Col Bento Mosaic", tag: "Card size mapped to UX priority: 7-col Story/Cast + 5-col Spotlight + 4 Pillars + 8 Cast" },
  { id: 5, name: "Split Trading Card Inspector Deck", tag: "Top Story/Ensemble split • Bottom oversized Issue Card + 4x2 clickable selector" },
  { id: 6, name: "Band-First 5-Col Arena Stage", tag: "Leads with the 5 Band Kids on stage → Story & Pillars Triptych → 3 Rivals" },
  { id: 7, name: "Z-Pattern Alternating Story Chapters", tag: "Zig-zag visual flow: Story/Ensemble → 2x2 Pillars/Band → 2-Col Horizontal Bios" },
  { id: 8, name: "Center Spine Hub & Flanking Cast Wings", tag: "Left: 5 Band Kids • Center: Ensemble & Story Spine • Right: 4 Pillars & 3 Crew" },
  { id: 9, name: "Progressive Disclosure 4-Tab Console", tag: "Zero-scroll tabbed console: 01 Overview • 02 The Band • 03 Crew & Villains • 04 All 8" },
  { id: 10, name: "3 Horizontal Swimlanes (Story • Cast • Pills)", tag: "Swimlane 1: Story & Ensemble • Swimlane 2: 8 Trading Cards • Swimlane 3: 4 Gold Pills" },
  { id: 11, name: "Sun-Yellow Hero Manifesto + Dark Cast Grid", tag: "High-contrast yellow Story/Ensemble header banner + 4 Pillars + 8 Dark Bento Cards" },
  { id: 12, name: "Heroes vs. Villain Split Matrix", tag: "Top Story & Pillars • Bottom 5 Band Heroes vs. Spotlight XEC Villain & Crew" },
  { id: 13, name: "Numbered 01–04 Vertical Storyboard Spine", tag: "Step-by-step narrative spine: 01 Origin → 02 Band → 03 Crew & Rivals → 04 Universe" },
  { id: 14, name: "Cinema Widescreen Letterbox + 8-Avatar Dock", tag: "Letterbox Ensemble + Story caption bar → 8-Avatar selector dock → Active Bio + 4 Pillars" },
  { id: 15, name: "Strict 4-Column Swiss Grid Architecture", tag: "Row 1: 2+2 Story/Ensemble • Row 2: 4 Pillars • Rows 3–4: 8 Character Cards" },
  { id: 16, name: "Dual Interactive Spotlight (Cast + Pillar)", tag: "3-Col live explorer: Left Story/Ensemble • Center Cast Inspector • Right Pillar Preview" },
  { id: 17, name: "Dogelon Open Poster + Speech-Bubble Cutouts", tag: "Skewed yellow ribbons + 2x2 gold oval pills + 8 borderless cutouts with cloud tags" },
  { id: 18, name: "5px Blurred Comic World + Glass Dossiers", tag: "Full-bleed 5px blurred comic backdrop with glassmorphic Story, Pillars & 2x4 Bios" },
  { id: 19, name: "Scannable Character Index + Live Stage", tag: "Top Story/Pillars • Bottom 8-row scannable character index table + live portrait stage" },
  { id: 20, name: "Superhero HQ Master Command Console", tag: "All-in-one gold-framed studio console with status bar, Triptych deck & 8-cast dock" },
];

const PILLAR_BG_IMAGES = [
  "/images/7hrrk/book-bg/1.png",
  "/images/7hrrk/book-bg/2.png",
  "/images/7hrrk/book-bg/3.png",
  "/images/7hrrk/book-bg/4.png",
];

const BAND_KIDS_META = [
  { name: "Mark", role: "Lead Guitar", src: "/images/7hrrk/individuals/Mark.png" },
  { name: "Nick", role: "Bass Guitar", src: "/images/7hrrk/individuals/Nick.png" },
  { name: "Adam", role: "Lead Vocals", src: "/images/7hrrk/individuals/Adam.png" },
  { name: "Rich", role: "Rhythm Guitar", src: "/images/7hrrk/individuals/Rich.png" },
  { name: "Franky", role: "Drums", src: "/images/7hrrk/individuals/Franky.png" },
];

export default function RnrAboutShowcase({ badge, para1, para2, pillars, cast }: RnrAboutShowcaseProps) {
  const [layout, setLayout] = useState<AboutLayoutId>(1);
  const [activeCharIdx, setActiveCharIdx] = useState<number>(0);
  const [activePillarIdx, setActivePillarIdx] = useState<number>(0);
  const [consoleTab, setConsoleTab] = useState<"overview" | "band" | "crew" | "all">("overview");

  const activeMeta = ABOUT_LAYOUTS.find((l) => l.id === layout) || ABOUT_LAYOUTS[0];
  const showPara1 = para1 && para1 !== badge;
  const activeChar = cast[activeCharIdx] || cast[0];
  const activePillar = pillars[activePillarIdx] || pillars[0];

  const bandCast = cast.slice(0, 5);
  const crewCast = cast.slice(5);

  const cycleLayout = (dir: -1 | 1) => {
    setLayout((prev) => {
      const next = prev + dir;
      if (next < 1) return 20;
      if (next > 20) return 1;
      return next as AboutLayoutId;
    });
  };

  const cycleCharacter = (dir: -1 | 1) => {
    setActiveCharIdx((prev) => {
      const next = prev + dir;
      if (next < 0) return cast.length - 1;
      if (next >= cast.length) return 0;
      return next;
    });
  };

  const renderStoryBox = (variant: "default" | "yellow" = "default") => {
    if (variant === "yellow") {
      return (
        <div className="rnrm-abt-yellow-slab">
          <span className="rnrm-abt-yellow-kicker">THE STORY SO FAR</span>
          <h3 className="rnrm-abt-yellow-title">7TH HEAVEN AS YOUNG KIDS.</h3>
          {showPara1 && <p className="rnrm-abt-yellow-body">{para1}</p>}
          <p className="rnrm-abt-yellow-body">{para2}</p>
        </div>
      );
    }

    return (
      <div className="rnrm-abt-story-box">
        <span className="rnrm-beg-caption-pill">THE STORY SO FAR</span>
        <h3 className="rnrm-beg-big-head">7TH HEAVEN AS YOUNG KIDS.</h3>
        {showPara1 && <p className="rnrm-beg-panel-body">{para1}</p>}
        <p className="rnrm-beg-panel-body">{para2}</p>
      </div>
    );
  };

  const renderFiveBandTopEnsemble = () => (
    <div className="rnrm-abt-l2-left">
      <div className="rnrm-abt-mini-band rnrm-abt-mini-band--labeled">
        {BAND_KIDS_META.map((m, idx) => (
          <button
            key={m.name}
            type="button"
            className={`rnrm-abt-mini-avatar rnrm-abt-mini-avatar--btn${activeCharIdx === idx ? " is-active" : ""}`}
            onClick={() => setActiveCharIdx(idx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.src} alt={m.name} loading="lazy" />
            <div className="rnrm-abt-mini-meta">
              <strong className="rnrm-abt-mini-name">{m.name}</strong>
              <span className="rnrm-abt-mini-role">{m.role}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="rnrm-abt-wide-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
      </div>
    </div>
  );

  const renderFourPillarStack = () => (
    <div className="rnrm-abt-l2-left">
      {pillars.map((p, i) => (
        <article key={p.title} className="rnrm-beg-universe-tile">
          <span className="rnrm-beg-universe-code">
            0{i + 1}. {p.tag}
          </span>
          <strong className="rnrm-beg-universe-label">{p.title}</strong>
          <span className="rnrm-beg-universe-detail">{p.desc}</span>
        </article>
      ))}
    </div>
  );

  const renderCastCard = (
    c: CastCharacter,
    idx: number,
    variant: "bento" | "cutout" | "trading" | "horizontal" | "gold" | "glass" = "bento"
  ) => {
    if (variant === "cutout") {
      return (
        <article key={c.name} className="rnrm-card">
          <div className="rnrm-card-img rnrm-card-img--square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.name} loading="lazy" />
            <span className="rnrm-cloud">{c.role}</span>
          </div>
          <div className="rnrm-card-bar">
            <h3 className="rnrm-card-title">{c.name}</h3>
            <p className="rnrm-body">{c.desc}</p>
          </div>
        </article>
      );
    }

    if (variant === "horizontal") {
      return (
        <article key={c.name} className="rnrm-abt-cast-horiz">
          <div className="rnrm-abt-cast-horiz-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.name} loading="lazy" />
          </div>
          <div className="rnrm-abt-cast-horiz-body">
            <div className="rnrm-abt-cast-horiz-top">
              <span className="rnrm-beg-caption-pill">{c.role}</span>
              <span className="rnrm-abt-cast-num">0{idx + 1}</span>
            </div>
            <h3 className="rnrm-beg-panel-title">{c.name}</h3>
            <p className="rnrm-beg-panel-body">{c.desc}</p>
          </div>
        </article>
      );
    }

    if (variant === "trading") {
      return (
        <article key={c.name} className="rnrm-abt-cast-trading">
          <div className="rnrm-abt-cast-trading-top">
            <span>CHAR 0{idx + 1}</span>
            <span>{c.role}</span>
          </div>
          <div className="rnrm-abt-cast-trading-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.name} loading="lazy" />
          </div>
          <div className="rnrm-abt-cast-trading-body">
            <h3 className="rnrm-beg-panel-title">{c.name}</h3>
            <p className="rnrm-beg-panel-body">{c.desc}</p>
          </div>
        </article>
      );
    }

    return (
      <article
        key={c.name}
        className={`rnrm-abt-cast-bento${variant === "gold" ? " rnrm-abt-cast-bento--gold" : ""}${
          variant === "glass" ? " rnrm-abt-cast-bento--glass" : ""
        }`}
      >
        <div className="rnrm-abt-cast-bento-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.image} alt={c.name} loading="lazy" />
          <span className="rnrm-cloud">{c.role}</span>
        </div>
        <div className="rnrm-abt-cast-bento-body">
          <h3 className="rnrm-beg-panel-title">{c.name}</h3>
          <p className="rnrm-beg-panel-body">{c.desc}</p>
        </div>
      </article>
    );
  };

  return (
    <div className="rnrm-abt-root">
      {/* ── 20-Layout Switcher Bar ── */}
      <div className="rnrm-beg-switcher" role="region" aria-label="We Love Art and Cast merged layout switcher">
        <div className="rnrm-beg-switcher-top">
          <div className="rnrm-beg-switcher-meta">
            <span className="rnrm-beg-switcher-kicker">UX HIERARCHY LAYOUT {String(layout).padStart(2, "0")} OF 20</span>
            <span className="rnrm-beg-switcher-name">{activeMeta.name}</span>
            <span className="rnrm-beg-switcher-tag">— {activeMeta.tag}</span>
          </div>
          <div className="rnrm-beg-switcher-arrows">
            <button type="button" className="rnrm-layout-arrow" onClick={() => cycleLayout(-1)}>
              ← Prev
            </button>
            <button type="button" className="rnrm-layout-arrow" onClick={() => cycleLayout(1)}>
              Next →
            </button>
          </div>
        </div>
        <div className="rnrm-beg-pills" role="tablist" aria-label="Choose We Love Art and Cast layout">
          {ABOUT_LAYOUTS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={layout === item.id}
              className="rnrm-layout-pill"
              onClick={() => setLayout(item.id)}
            >
              <span className="rnrm-layout-pill-num">{String(item.id).padStart(2, "0")}</span>
              <span className="rnrm-layout-pill-label">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          01: Classic 3-Col Triptych (Exact Reference) + Tiered Cast (5 Band + 3 Crew)
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 1 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-triptych--wide-center">
            {renderStoryBox()}
            {renderFiveBandTopEnsemble()}
            {renderFourPillarStack()}
          </div>
          <div className="rnrm-abt-cast-subhead">
            <div className="rnrm-abt-cast-subhead-copy">
              <span className="rnrm-beg-caption-pill">PRIORITY 01 — STARRING BAND</span>
              <h3 className="rnrm-abt-cast-subhead-title">THE 5 ROCK &apos;N&apos; ROLL KIDS</h3>
            </div>
            <span className="rnrm-abt-cast-count">5 CORE BAND MEMBERS</span>
          </div>
          <div className="rnrm-abt-grid-5">
            {bandCast.map((c, i) => renderCastCard(c, i, "bento"))}
          </div>
          <div className="rnrm-abt-cast-subhead">
            <div className="rnrm-abt-cast-subhead-copy">
              <span className="rnrm-beg-caption-pill">PRIORITY 02 — SUPPORTING CAST &amp; RIVALS</span>
              <h3 className="rnrm-abt-cast-subhead-title">BACKSTAGE CREW &amp; VILLAINS</h3>
            </div>
            <span className="rnrm-abt-cast-count">3 SUPPORTING CHARACTERS</span>
          </div>
          <div className="rnrm-abt--l17">
            {crewCast.map((c, i) => renderCastCard(c, i + 5, "bento"))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          02: F-Pattern Sticky Sidebar + Interactive Cast Inspector & 4x2 Roster
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 2 && (
        <div className="rnrm-abt-stage rnrm-abt--l2">
          <aside className="rnrm-abt-l2-left rnrm-abt-sticky-col">
            <div className="rnrm-abt-wide-card rnrm-abt-wide-card--gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
            {renderStoryBox()}
            <div className="rnrm-beg-l7-grid">
              {pillars.map((p, i) => (
                <article key={p.title} className="rnrm-beg-universe-tile">
                  <span className="rnrm-beg-universe-code">
                    0{i + 1}. {p.tag}
                  </span>
                  <strong className="rnrm-beg-universe-label">{p.title}</strong>
                </article>
              ))}
            </div>
          </aside>
          <div className="rnrm-abt-l2-left">
            <div className="rnrm-abt-dossier-stage">
              <div className="rnrm-abt-dossier-portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeChar.image} alt={activeChar.name} loading="lazy" />
              </div>
              <div className="rnrm-abt-dossier-copy">
                <div className="rnrm-abt-cast-horiz-top">
                  <span className="rnrm-beg-caption-pill">{activeChar.role}</span>
                  <div className="rnrm-beg-switcher-arrows">
                    <button type="button" className="rnrm-layout-arrow" onClick={() => cycleCharacter(-1)}>
                      ← Prev
                    </button>
                    <button type="button" className="rnrm-layout-arrow" onClick={() => cycleCharacter(1)}>
                      Next →
                    </button>
                  </div>
                </div>
                <h3 className="rnrm-beg-big-head">{activeChar.name}</h3>
                <p className="rnrm-beg-panel-body">{activeChar.desc}</p>
              </div>
            </div>
            <div className="rnrm-beg-l7-grid">
              {cast.map((c, i) => renderCastCard(c, i, "horizontal"))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          03: Inverted Pyramid Editorial (Hero Panorama → 4 Pillar Strip → 4x2 Cast)
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 3 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-hero-pyramid">
            <div className="rnrm-abt-hero-pyramid-copy">
              <span className="rnrm-beg-caption-pill">01. THE PREMISE &amp; VISION</span>
              <h3 className="rnrm-beg-big-head">7TH HEAVEN AS YOUNG KIDS.</h3>
              <div className="rnrm-abt-story-2col">
                {showPara1 && <p className="rnrm-beg-panel-body">{para1}</p>}
                <p className="rnrm-beg-panel-body">{para2}</p>
              </div>
            </div>
            <div className="rnrm-abt-hero-pyramid-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
          </div>
          <div className="rnrm-abt-grid-4">
            {pillars.map((p, i) => (
              <article key={p.title} className="rnrm-beg-bento-card">
                <span className="rnrm-beg-bento-num">0{i + 1}</span>
                <span className="rnrm-beg-caption-pill">
                  0{i + 1}. {p.tag}
                </span>
                <h3 className="rnrm-beg-panel-title">{p.title}</h3>
                <p className="rnrm-beg-panel-body">{p.desc}</p>
              </article>
            ))}
          </div>
          <div className="rnrm-abt-grid-4">
            {cast.map((c, i) => renderCastCard(c, i, "bento"))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          04: Asymmetric 12-Col Bento Mosaic (Size Mapped to Priority)
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 4 && (
        <div className="rnrm-abt-stage rnrm-abt-bento-12">
          <div className="rnrm-abt-bento-span-7 rnrm-abt-story-box">
            <span className="rnrm-beg-caption-pill">01. THE STORY SO FAR</span>
            <h3 className="rnrm-beg-big-head">7TH HEAVEN AS YOUNG KIDS.</h3>
            {showPara1 && <p className="rnrm-beg-panel-body">{para1}</p>}
            <p className="rnrm-beg-panel-body">{para2}</p>
            <div className="rnrm-abt-wide-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
          </div>
          <div className="rnrm-abt-bento-span-5 rnrm-abt-dossier-stage rnrm-abt-dossier-stage--vertical">
            <div className="rnrm-abt-cast-horiz-top">
              <span className="rnrm-beg-caption-pill">CHARACTER SPOTLIGHT</span>
              <div className="rnrm-beg-switcher-arrows">
                <button type="button" className="rnrm-layout-arrow" onClick={() => cycleCharacter(-1)}>
                  ←
                </button>
                <button type="button" className="rnrm-layout-arrow" onClick={() => cycleCharacter(1)}>
                  →
                </button>
              </div>
            </div>
            <div className="rnrm-abt-dossier-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeChar.image} alt={activeChar.name} loading="lazy" />
            </div>
            <div className="rnrm-abt-dossier-copy">
              <span className="rnrm-beg-universe-code">{activeChar.role}</span>
              <h3 className="rnrm-beg-big-head">{activeChar.name}</h3>
              <p className="rnrm-beg-panel-body">{activeChar.desc}</p>
            </div>
          </div>
          {pillars.map((p, i) => (
            <article key={p.title} className="rnrm-abt-bento-span-3 rnrm-beg-bento-card">
              <span className="rnrm-beg-bento-num">0{i + 1}</span>
              <span className="rnrm-beg-caption-pill">{p.tag}</span>
              <h3 className="rnrm-beg-panel-title">{p.title}</h3>
              <p className="rnrm-beg-panel-body">{p.desc}</p>
            </article>
          ))}
          {cast.map((c, i) => (
            <div key={c.name} className="rnrm-abt-bento-span-3">
              {renderCastCard(c, i, "trading")}
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          05: Split-Screen Trading Card Inspector Deck
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 5 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-l6-top">
            {renderStoryBox()}
            <div className="rnrm-abt-l2-left">
              <div className="rnrm-abt-wide-card rnrm-abt-wide-card--gold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
              </div>
              <div className="rnrm-beg-l7-grid">
                {pillars.map((p, i) => (
                  <article key={p.title} className="rnrm-beg-universe-tile">
                    <span className="rnrm-beg-universe-code">
                      0{i + 1}. {p.tag}
                    </span>
                    <strong className="rnrm-beg-universe-label">{p.title}</strong>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div className="rnrm-abt-deck-split">
            <div className="rnrm-abt-cast-trading rnrm-abt-cast-trading--hero">
              <div className="rnrm-abt-cast-trading-top">
                <span>COLLECTIBLE CARD #0{activeCharIdx + 1}</span>
                <span>{activeChar.role}</span>
              </div>
              <div className="rnrm-abt-cast-trading-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeChar.image} alt={activeChar.name} loading="lazy" />
              </div>
              <div className="rnrm-abt-cast-trading-body">
                <h3 className="rnrm-beg-big-head">{activeChar.name}</h3>
                <p className="rnrm-beg-panel-body">{activeChar.desc}</p>
              </div>
            </div>
            <div className="rnrm-abt-grid-4" role="tablist" aria-label="Select character trading card">
              {cast.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  role="tab"
                  aria-selected={activeCharIdx === idx}
                  className={`rnrm-abt-roster-card${activeCharIdx === idx ? " is-active" : ""}`}
                  onClick={() => setActiveCharIdx(idx)}
                >
                  <div className="rnrm-abt-roster-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt={c.name} loading="lazy" />
                  </div>
                  <span className="rnrm-beg-universe-code">{c.role}</span>
                  <strong className="rnrm-abt-mini-name">{c.name}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          06: Band-First 5-Col Arena Stage (5 Band Kids → Triptych → 3 Rivals)
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 6 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-cast-subhead">
            <div className="rnrm-abt-cast-subhead-copy">
              <span className="rnrm-beg-caption-pill">MEET THE HEROES FIRST</span>
              <h3 className="rnrm-abt-cast-subhead-title">THE 5 BAND MEMBERS</h3>
            </div>
            <span className="rnrm-abt-cast-count">FRONT &amp; CENTER</span>
          </div>
          <div className="rnrm-abt-grid-5">
            {bandCast.map((c, i) => renderCastCard(c, i, "trading"))}
          </div>
          <div className="rnrm-abt-triptych--wide-center">
            {renderStoryBox()}
            <div className="rnrm-abt-wide-card rnrm-abt-wide-card--gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
            {renderFourPillarStack()}
          </div>
          <div className="rnrm-abt--l17">
            {crewCast.map((c, i) => renderCastCard(c, i + 5, "horizontal"))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          07: Z-Pattern Alternating Story Chapters
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 7 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          {/* Z-Pass 1: Story Left → Ensemble Right */}
          <div className="rnrm-abt-z-row">
            {renderStoryBox()}
            <div className="rnrm-abt-wide-card rnrm-abt-wide-card--gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
          </div>
          {/* Z-Pass 2: 2x2 Pillars Left ← 5 Band Lineup Right */}
          <div className="rnrm-abt-z-row rnrm-abt-z-row--reverse">
            <div className="rnrm-beg-l7-grid">
              {pillars.map((p, i) => (
                <article key={p.title} className="rnrm-beg-bento-card">
                  <span className="rnrm-beg-bento-num">0{i + 1}</span>
                  <span className="rnrm-beg-caption-pill">{p.tag}</span>
                  <h3 className="rnrm-beg-panel-title">{p.title}</h3>
                  <p className="rnrm-beg-panel-body">{p.desc}</p>
                </article>
              ))}
            </div>
            <div className="rnrm-abt-band-stage">
              {BAND_KIDS_META.map((m) => (
                <div key={m.name} className="rnrm-abt-band-member">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.src} alt={m.name} loading="lazy" />
                  <span className="rnrm-abt-band-name">{m.name}</span>
                  <span className="rnrm-abt-band-role">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Z-Pass 3: 2-Col Horizontal Bio Dossiers */}
          <div className="rnrm-beg-l7-grid">
            {cast.map((c, i) => renderCastCard(c, i, "horizontal"))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          08: Center Spine Hub & Flanking Cast Wings
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 8 && (
        <div className="rnrm-abt-stage rnrm-abt-triptych--wide-center">
          <div className="rnrm-abt-l2-left">
            <div className="rnrm-abt-col-header">
              <span className="rnrm-abt-col-num">BAND</span>
              <span className="rnrm-abt-col-title">THE 5 ROCK &apos;N&apos; ROLL KIDS</span>
            </div>
            {bandCast.map((c, i) => renderCastCard(c, i, "horizontal"))}
          </div>
          <div className="rnrm-abt-l2-left">
            <div className="rnrm-abt-wide-card rnrm-abt-wide-card--gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
            {renderStoryBox()}
            <div className="rnrm-beg-l7-grid">
              {pillars.map((p, i) => (
                <article key={p.title} className="rnrm-beg-bento-card">
                  <span className="rnrm-beg-bento-num">0{i + 1}</span>
                  <span className="rnrm-beg-caption-pill">{p.tag}</span>
                  <h3 className="rnrm-beg-panel-title">{p.title}</h3>
                  <p className="rnrm-beg-panel-body">{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="rnrm-abt-l2-left">
            <div className="rnrm-abt-col-header">
              <span className="rnrm-abt-col-num">WORLD</span>
              <span className="rnrm-abt-col-title">CREW &amp; RIVALS</span>
            </div>
            {crewCast.map((c, i) => renderCastCard(c, i + 5, "horizontal"))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          09: Progressive Disclosure 4-Tab Console (Zero Vertical Clutter)
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 9 && (
        <div className="rnrm-abt-stage">
          <div className="rnrm-beg-hud">
            <div className="rnrm-beg-hud-bar">
              <div className="rnrm-abt-cast-subhead-copy">
                <span className="rnrm-beg-caption-pill">INTERACTIVE SERIES BIBLE</span>
                <span className="rnrm-beg-hud-status">SELECT A CHAPTER TAB TO EXPLORE</span>
              </div>
              <div className="rnrm-abt-filter-tabs" role="tablist" aria-label="Series Bible Chapters">
                <button
                  type="button"
                  role="tab"
                  aria-selected={consoleTab === "overview"}
                  className="rnrm-layout-arrow"
                  onClick={() => setConsoleTab("overview")}
                >
                  01. Story &amp; Pillars
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={consoleTab === "band"}
                  className="rnrm-layout-arrow"
                  onClick={() => setConsoleTab("band")}
                >
                  02. The 5 Band Kids
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={consoleTab === "crew"}
                  className="rnrm-layout-arrow"
                  onClick={() => setConsoleTab("crew")}
                >
                  03. Crew &amp; Villains
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={consoleTab === "all"}
                  className="rnrm-layout-arrow"
                  onClick={() => setConsoleTab("all")}
                >
                  04. All 8 Character Bios
                </button>
              </div>
            </div>
            <div className="rnrm-abt-hud-body">
              {consoleTab === "overview" && (
                <div className="rnrm-abt-triptych--wide-center">
                  {renderStoryBox()}
                  {renderFiveBandTopEnsemble()}
                  {renderFourPillarStack()}
                </div>
              )}
              {consoleTab === "band" && (
                <div className="rnrm-abt-grid-5">
                  {bandCast.map((c, i) => renderCastCard(c, i, "trading"))}
                </div>
              )}
              {consoleTab === "crew" && (
                <div className="rnrm-abt--l17">
                  {crewCast.map((c, i) => renderCastCard(c, i + 5, "trading"))}
                </div>
              )}
              {consoleTab === "all" && (
                <div className="rnrm-abt-grid-4">
                  {cast.map((c, i) => renderCastCard(c, i, "bento"))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          10: 3 Horizontal Swimlanes (Story Track • Cast Track • Gold Pill Track)
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 10 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-swimlane">
            <div className="rnrm-abt-swimlane-head">
              <span className="rnrm-abt-col-num">LANE 01</span>
              <span className="rnrm-abt-col-title">THE PREMISE &amp; ENSEMBLE</span>
            </div>
            <div className="rnrm-abt-l6-top">
              {renderStoryBox()}
              <div className="rnrm-abt-wide-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
              </div>
            </div>
          </div>
          <div className="rnrm-abt-swimlane">
            <div className="rnrm-abt-swimlane-head">
              <span className="rnrm-abt-col-num">LANE 02</span>
              <span className="rnrm-abt-col-title">THE 8 CHARACTER TRADING CARDS</span>
            </div>
            <div className="rnrm-abt-grid-4">
              {cast.map((c, i) => renderCastCard(c, i, "trading"))}
            </div>
          </div>
          <div className="rnrm-abt-swimlane">
            <div className="rnrm-abt-swimlane-head">
              <span className="rnrm-abt-col-num">LANE 03</span>
              <span className="rnrm-abt-col-title">THE 4 MULTIMEDIA PILLARS</span>
            </div>
            <div className="rnrm-abt-grid-4">
              {pillars.map((p, i) => (
                <article key={p.title} className="rnrm-stat">
                  <p className="rnrm-pill" role="heading" aria-level={3}>
                    {p.title}
                  </p>
                  <p className="rnrm-stat-label">
                    0{i + 1}. {p.tag}
                  </p>
                  <p className="rnrm-body">{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          11: Sun-Yellow Hero Manifesto Banner + Dark Cast Bento
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 11 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-yellow-banner">
            <div className="rnrm-abt-yellow-banner-copy">
              <span className="rnrm-abt-yellow-kicker">PRIMARY STORY HOOK</span>
              <h3 className="rnrm-abt-yellow-title">7TH HEAVEN AS YOUNG KIDS.</h3>
              {showPara1 && <p className="rnrm-abt-yellow-body">{para1}</p>}
              <p className="rnrm-abt-yellow-body">{para2}</p>
            </div>
            <div className="rnrm-abt-yellow-banner-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
          </div>
          <div className="rnrm-abt-grid-4">
            {pillars.map((p, i) => (
              <article key={p.title} className="rnrm-beg-universe-tile">
                <span className="rnrm-beg-universe-code">
                  0{i + 1}. {p.tag}
                </span>
                <strong className="rnrm-beg-universe-label">{p.title}</strong>
                <span className="rnrm-beg-universe-detail">{p.desc}</span>
              </article>
            ))}
          </div>
          <div className="rnrm-abt-grid-4">
            {cast.map((c, i) => renderCastCard(c, i, "bento"))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          12: Heroes vs. Villain Split Matrix
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 12 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-triptych--wide-center">
            {renderStoryBox()}
            <div className="rnrm-abt-wide-card rnrm-abt-wide-card--gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
            {renderFourPillarStack()}
          </div>
          <div className="rnrm-abt-versus-grid">
            <div className="rnrm-abt-versus-side">
              <div className="rnrm-abt-col-header">
                <span className="rnrm-abt-col-num">HEROES</span>
                <span className="rnrm-abt-col-title">THE 5 BAND KIDS &amp; BACKSTAGE CREW</span>
              </div>
              <div className="rnrm-beg-l7-grid">
                {[...bandCast, crewCast[0], crewCast[2]].filter(Boolean).map((c, i) => renderCastCard(c, i, "horizontal"))}
              </div>
            </div>
            {crewCast[1] && (
              <div className="rnrm-abt-versus-villain">
                <div className="rnrm-abt-col-header">
                  <span className="rnrm-abt-col-num">VILLAIN</span>
                  <span className="rnrm-abt-col-title">THE CORPORATE ANTAGONIST</span>
                </div>
                {renderCastCard(crewCast[1], 6, "trading")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          13: Numbered 01–04 Vertical Storyboard Spine
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 13 && (
        <div className="rnrm-abt-stage rnrm-abt-spine-list">
          <div className="rnrm-abt-spine-row">
            <div className="rnrm-abt-spine-badge">01</div>
            <div className="rnrm-abt-l6-top">
              {renderStoryBox()}
              <div className="rnrm-abt-wide-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
              </div>
            </div>
          </div>
          <div className="rnrm-abt-spine-row">
            <div className="rnrm-abt-spine-badge">02</div>
            <div className="rnrm-abt-grid-5">
              {bandCast.map((c, i) => renderCastCard(c, i, "bento"))}
            </div>
          </div>
          <div className="rnrm-abt-spine-row">
            <div className="rnrm-abt-spine-badge">03</div>
            <div className="rnrm-abt--l17">
              {crewCast.map((c, i) => renderCastCard(c, i + 5, "bento"))}
            </div>
          </div>
          <div className="rnrm-abt-spine-row">
            <div className="rnrm-abt-spine-badge">04</div>
            <div className="rnrm-abt-grid-4">
              {pillars.map((p, i) => (
                <article key={p.title} className="rnrm-beg-bento-card">
                  <span className="rnrm-beg-bento-num">0{i + 1}</span>
                  <span className="rnrm-beg-caption-pill">{p.tag}</span>
                  <h3 className="rnrm-beg-panel-title">{p.title}</h3>
                  <p className="rnrm-beg-panel-body">{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          14: Cinema Widescreen Letterbox + 8-Avatar Dock + Live Bio & 4 Pillars
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 14 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-letterbox">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            <div className="rnrm-abt-letterbox-bar">
              {showPara1 && <p className="rnrm-beg-panel-body">{para1}</p>}
              <p className="rnrm-beg-panel-body">{para2}</p>
            </div>
          </div>
          <div className="rnrm-abt-dock-8" role="tablist" aria-label="Select cast member">
            {cast.map((c, idx) => (
              <button
                key={c.name}
                type="button"
                role="tab"
                aria-selected={activeCharIdx === idx}
                className={`rnrm-abt-mini-avatar rnrm-abt-mini-avatar--dock rnrm-abt-mini-avatar--btn${
                  activeCharIdx === idx ? " is-active" : ""
                }`}
                onClick={() => setActiveCharIdx(idx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.name} loading="lazy" />
                <div className="rnrm-abt-mini-meta">
                  <strong className="rnrm-abt-mini-name">{c.name}</strong>
                  <span className="rnrm-abt-mini-role">{c.role}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="rnrm-abt--l2">
            <div className="rnrm-abt-dossier-stage">
              <div className="rnrm-abt-dossier-portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeChar.image} alt={activeChar.name} loading="lazy" />
              </div>
              <div className="rnrm-abt-dossier-copy">
                <span className="rnrm-beg-caption-pill">{activeChar.role}</span>
                <h3 className="rnrm-beg-big-head">{activeChar.name}</h3>
                <p className="rnrm-beg-panel-body">{activeChar.desc}</p>
              </div>
            </div>
            <div className="rnrm-beg-l7-grid">
              {pillars.map((p, i) => (
                <article key={p.title} className="rnrm-beg-bento-card">
                  <span className="rnrm-beg-bento-num">0{i + 1}</span>
                  <span className="rnrm-beg-caption-pill">{p.tag}</span>
                  <h3 className="rnrm-beg-panel-title">{p.title}</h3>
                  <p className="rnrm-beg-panel-body">{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          15: Strict 4-Column Swiss Grid Architecture
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 15 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-grid-4">
            <div className="rnrm-abt-span-2">{renderStoryBox()}</div>
            <div className="rnrm-abt-span-2 rnrm-abt-wide-card rnrm-abt-wide-card--gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
            {pillars.map((p, i) => (
              <article key={p.title} className="rnrm-beg-bento-card">
                <span className="rnrm-beg-bento-num">0{i + 1}</span>
                <span className="rnrm-beg-caption-pill">
                  0{i + 1}. {p.tag}
                </span>
                <h3 className="rnrm-beg-panel-title">{p.title}</h3>
                <p className="rnrm-beg-panel-body">{p.desc}</p>
              </article>
            ))}
            {cast.map((c, i) => renderCastCard(c, i, "gold"))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          16: Dual Interactive Spotlight (Cast Inspector + Pillar World Preview)
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 16 && (
        <div className="rnrm-abt-stage rnrm-abt--l17">
          <div className="rnrm-abt-l2-left">
            {renderStoryBox()}
            <div className="rnrm-abt-wide-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
          </div>
          <div className="rnrm-abt-l2-left">
            <div className="rnrm-abt-dossier-stage rnrm-abt-dossier-stage--vertical">
              <span className="rnrm-beg-caption-pill">ACTIVE CHARACTER — {activeChar.role}</span>
              <div className="rnrm-abt-dossier-portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeChar.image} alt={activeChar.name} loading="lazy" />
              </div>
              <h3 className="rnrm-beg-big-head">{activeChar.name}</h3>
              <p className="rnrm-beg-panel-body">{activeChar.desc}</p>
            </div>
            <div className="rnrm-abt-mini-band-8" role="tablist" aria-label="Select character">
              {cast.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  role="tab"
                  aria-selected={activeCharIdx === idx}
                  className={`rnrm-abt-mini-avatar rnrm-abt-mini-avatar--btn${activeCharIdx === idx ? " is-active" : ""}`}
                  onClick={() => setActiveCharIdx(idx)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.name} loading="lazy" />
                  <div className="rnrm-abt-mini-meta">
                    <strong className="rnrm-abt-mini-name">{c.name}</strong>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="rnrm-abt-l2-left">
            <div className="rnrm-abt-preview-card">
              <div className="rnrm-abt-preview-art">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PILLAR_BG_IMAGES[activePillarIdx]} alt={activePillar.title} loading="lazy" />
                <span className="rnrm-beg-l8-num">0{activePillarIdx + 1}</span>
              </div>
              <div className="rnrm-abt-preview-body">
                <span className="rnrm-beg-caption-pill">{activePillar.tag}</span>
                <h3 className="rnrm-beg-panel-title">{activePillar.title}</h3>
                <p className="rnrm-beg-panel-body">{activePillar.desc}</p>
              </div>
            </div>
            <div className="rnrm-abt-l2-left" role="tablist" aria-label="Select pillar">
              {pillars.map((p, i) => (
                <button
                  key={p.title}
                  type="button"
                  role="tab"
                  aria-selected={activePillarIdx === i}
                  className={`rnrm-beg-universe-tile rnrm-abt-pillar-btn${activePillarIdx === i ? " is-active" : ""}`}
                  onClick={() => setActivePillarIdx(i)}
                >
                  <span className="rnrm-beg-universe-code">
                    0{i + 1}. {p.tag}
                  </span>
                  <strong className="rnrm-beg-universe-label">{p.title}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          17: Dogelon Open Poster + Speech-Bubble Cutouts
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 17 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt--l2">
            <div className="rnrm-abt-l3-left">
              <div className="rnrm-book-ribbons">
                <span className="rnrm-book-cat-pill">THE STORY SO FAR</span>
                <div className="rnrm-book-ribbon">
                  <span>7TH HEAVEN AS YOUNG KIDS</span>
                </div>
                <div className="rnrm-book-ribbon">
                  <span>POSITIVITY THROUGH ROCK</span>
                </div>
              </div>
              {showPara1 && <p className="rnrm-beg-panel-body">{para1}</p>}
              <p className="rnrm-beg-panel-body">{para2}</p>
              <div className="rnrm-abt-wide-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
              </div>
            </div>
            <div className="rnrm-stats">
              {pillars.map((p, i) => (
                <article key={p.title} className="rnrm-stat">
                  <p className="rnrm-pill" role="heading" aria-level={3}>
                    {p.title}
                  </p>
                  <p className="rnrm-stat-label">
                    0{i + 1}. {p.tag}
                  </p>
                  <p className="rnrm-body">{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="rnrm-grid rnrm-grid--4">
            {cast.map((c, i) => renderCastCard(c, i, "cutout"))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          18: 5px Blurred Comic World + Glass Dossiers
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 18 && (
        <div className="rnrm-abt-stage rnrm-beg--l5">
          <div className="rnrm-beg-l5-bg" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/7hrrk/book-bg/1.png" alt="" loading="lazy" />
            <div className="rnrm-beg-l5-scrim" />
          </div>
          <div className="rnrm-abt-l6-inner">
            <div className="rnrm-abt-triptych--wide-center">
              {renderStoryBox()}
              {renderFiveBandTopEnsemble()}
              {renderFourPillarStack()}
            </div>
            <div className="rnrm-beg-l7-grid">
              {cast.map((c, i) => renderCastCard(c, i, "horizontal"))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          19: Scannable Character Index Table + Live Portrait Stage
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 19 && (
        <div className="rnrm-abt-stage rnrm-abt--l1">
          <div className="rnrm-abt-triptych--wide-center">
            {renderStoryBox()}
            <div className="rnrm-abt-wide-card rnrm-abt-wide-card--gold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" loading="lazy" />
            </div>
            {renderFourPillarStack()}
          </div>
          <div className="rnrm-abt-index-layout">
            <div className="rnrm-abt-index-list" role="tablist" aria-label="Character directory">
              {cast.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  role="tab"
                  aria-selected={activeCharIdx === idx}
                  className={`rnrm-abt-index-row${activeCharIdx === idx ? " is-active" : ""}`}
                  onClick={() => setActiveCharIdx(idx)}
                >
                  <span className="rnrm-abt-index-num">0{idx + 1}</span>
                  <strong className="rnrm-abt-index-name">{c.name}</strong>
                  <span className="rnrm-beg-caption-pill">{c.role}</span>
                  <span className="rnrm-abt-index-desc">{c.desc}</span>
                </button>
              ))}
            </div>
            <div className="rnrm-abt-cast-trading">
              <div className="rnrm-abt-cast-trading-top">
                <span>SELECTED CHARACTER 0{activeCharIdx + 1}</span>
                <span>{activeChar.role}</span>
              </div>
              <div className="rnrm-abt-cast-trading-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeChar.image} alt={activeChar.name} loading="lazy" />
              </div>
              <div className="rnrm-abt-cast-trading-body">
                <h3 className="rnrm-beg-big-head">{activeChar.name}</h3>
                <p className="rnrm-beg-panel-body">{activeChar.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          20: Superhero HQ Master Command Console (All-in-One Framed Dashboard)
         ════════════════════════════════════════════════════════════════════════ */}
      {layout === 20 && (
        <div className="rnrm-abt-stage">
          <div className="rnrm-beg-hud">
            <div className="rnrm-beg-hud-bar">
              <span className="rnrm-beg-caption-pill">RNR STUDIOS — MASTER SERIES &amp; CAST COMMAND</span>
              <span className="rnrm-beg-hud-status">STORY • 5 BAND KIDS • 3 CREW • 4 PILLARS</span>
            </div>
            <div className="rnrm-abt-hud-body">
              <div className="rnrm-abt-triptych--wide-center">
                {renderStoryBox()}
                {renderFiveBandTopEnsemble()}
                {renderFourPillarStack()}
              </div>
              <div className="rnrm-abt-grid-4">
                {cast.map((c, i) => renderCastCard(c, i, "gold"))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
