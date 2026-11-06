"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import { resolveBookBgImg } from "./RockNRollKidsClient";

export interface ComicBookItem {
  id?: string;
  ep?: string;
  title: string;
  subtitle?: string;
  desc: string;
  amazonUrl: string;
  coverImg: string;
  bgImg?: string;
  badge: string;
}

export interface ComicLayoutPreset {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly tag: string;
}

export type ComicFontMode = "dogelon" | "avengeance" | "falcon-all";

export const COMIC_LAYOUT_PRESETS: readonly ComicLayoutPreset[] = [
  {
    id: 1,
    code: "01",
    name: "Dogelon Split Dock",
    tag: "Left skewed ribbons + giant right floating cover + 2-part bottom dock",
  },
  {
    id: 2,
    code: "02",
    name: "Alternating Zig-Zag Stage",
    tag: "Alternates giant left/right cover & CTA dock orientation every issue",
  },
  {
    id: 3,
    code: "03",
    name: "Colossal Center Shrine",
    tag: "Monumental centered hero cover above skewed title ribbons & capsule dock",
  },
  {
    id: 4,
    code: "04",
    name: "Diagonal Slash Dossier",
    tag: "Angled comic-ink dossier on left + oversized cover dominating the right stage",
  },
  {
    id: 5,
    code: "05",
    name: "Giant Issue Numeral Strip",
    tag: "Monumental #01–#12 gold stamp + giant cover + inline editorial stack",
  },
  {
    id: 6,
    code: "06",
    name: "Dogelon Dual-Frame Breakout",
    tag: "Framed inner panorama over blurred world with giant cover breaking the border",
  },
  {
    id: 7,
    code: "07",
    name: "Cinema Letterbox Marquee",
    tag: "Oversized cover on open full-bleed canvas above a 100vw comic letterbox bar",
  },
  {
    id: 8,
    code: "08",
    name: "3-Column Storyboard Triptych",
    tag: "Left skewed title ribbons • Giant center collector cover • Right story card",
  },
  {
    id: 9,
    code: "09",
    name: "Comic Caption Box & Double Stack",
    tag: "Giant double-stacked issue covers + cream-yellow comic caption box",
  },
  {
    id: 10,
    code: "10",
    name: "Sticky Graphic Novel Deck",
    tag: "Each full-bleed issue pins at the top and slides over the previous chapter",
  },
  {
    id: 11,
    code: "11",
    name: "Left Hero Cover Monolith",
    tag: "Massive cover anchored on the left + right-aligned ribbons & story dossier",
  },
  {
    id: 12,
    code: "12",
    name: "Dock-Overlap Cover Breakout",
    tag: "Colossal right cover drops down and overlaps across the 2-part bottom dock",
  },
  {
    id: 13,
    code: "13",
    name: "Top Marquee & Twin Showcase",
    tag: "Full-width top title banner above a giant cover + side-by-side story slab",
  },
  {
    id: 14,
    code: "14",
    name: "3D Collector Slab",
    tag: "Deep-tilted 3D perspective comic slab with gold rim & floating dock",
  },
  {
    id: 15,
    code: "15",
    name: "Magazine Spread Editorial",
    tag: "Oversized cover paired with a high-contrast sun-yellow editorial column",
  },
  {
    id: 16,
    code: "16",
    name: "Triple-Fan Collector Spread",
    tag: "Giant foreground cover with a fanned 3-issue collector stack behind it",
  },
  {
    id: 17,
    code: "17",
    name: "Floating Glass HUD Stage",
    tag: "Massive right cover with a translucent glass HUD bar floating on the left",
  },
  {
    id: 18,
    code: "18",
    name: "50/50 Split Poster Showcase",
    tag: "Left half stacked ribbons & synopsis • Right half colossal poster cover",
  },
  {
    id: 19,
    code: "19",
    name: "Gold Spotlight Halo Frame",
    tag: "Giant cover framed by a radiant gold comic spotlight aura + left dossier",
  },
  {
    id: 20,
    code: "20",
    name: "Ultra-Max Cover Command",
    tag: "Maximum-scale 700px hero cover dominating the stage with compact left dock",
  },
];

function splitComicTitleRibbons(title: string): string[] {
  const cleaned = title.replace(/\s*-\s*/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [cleaned || "Comic Book"];
  if (words.length === 2) return [words[0], words[1]];
  const splitAt = Math.ceil(words.length / 2);
  return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")];
}

const INLINE_DOSSIER_LAYOUTS = new Set([4, 5, 9, 11, 13, 15, 17, 18, 19, 20]);
const STAMP_LAYOUTS = new Set([4, 5, 8, 10, 11, 14, 15, 18, 20]);

interface RnrComicBookShowcaseProps {
  readonly comics: readonly ComicBookItem[];
  readonly layoutId?: number;
  readonly fontMode?: ComicFontMode;
}

export default function RnrComicBookShowcase({
  comics,
  layoutId = 11,
  fontMode = "dogelon",
}: RnrComicBookShowcaseProps) {
  const activeLayout = layoutId;
  const showInlineDossier = INLINE_DOSSIER_LAYOUTS.has(activeLayout);
  const showStamp = STAMP_LAYOUTS.has(activeLayout);
  const showFooterDock = !showInlineDossier && activeLayout !== 8;

  return (
    <div className="rnrm-showcase-root">
      {/* Full-Bleed Comic Book Sections */}
      <div
        className={`rnrm-book-stack rnrm-book-stack--layout-${activeLayout}`}
        data-comic-layout={activeLayout}
        data-font-mode={fontMode}
      >
        {comics.map((c, i) => {
          const bgUrl = resolveBookBgImg(c, i);
          const titleRibbons = splitComicTitleRibbons(c.title || "Comic Book");
          const issueNum = String(i + 1).padStart(2, "0");
          const totalNum = String(comics.length).padStart(2, "0");
          const sectionSlug = `comic-issue-${c.id ?? i + 1}`;
          const headingId = `${sectionSlug}-heading`;
          const isEven = i % 2 === 1;

          return (
            <section
              key={c.id ?? c.title}
              id={sectionSlug}
              aria-labelledby={headingId}
              data-even={isEven ? "true" : "false"}
              className={`rnrm-book-feature rnrm-book-feature--l${activeLayout}`}
            >
              {/* Full-Bleed 100vw Background Image */}
              <div className="rnrm-book-bg" aria-hidden="true">
                <img src={bgUrl} alt="" loading="lazy" />
                <div className="rnrm-book-bg-scrim" />
              </div>

              {/* Layout 06 Extra Framed Window Panorama */}
              {activeLayout === 6 && (
                <div className="rnrm-l6-window" aria-hidden="true">
                  <img src={bgUrl} alt="" loading="lazy" />
                  <div className="rnrm-l6-window-scrim" />
                </div>
              )}

              <div className="rnrm-book-inner site-container">
                {/* Giant Issue Numeral Watermark / Stamp */}
                {showStamp && (
                  <div className="rnrm-issue-stamp" aria-hidden="true">
                    <span className="rnrm-issue-stamp-hash">#</span>
                    <span className="rnrm-issue-stamp-num">{issueNum}</span>
                    <span className="rnrm-issue-stamp-total">/ {totalNum}</span>
                  </div>
                )}

                <div className="rnrm-book-stage">
                  {/* Giant Cover Showcase Card */}
                  <a
                    href={c.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${c.title} cover on Amazon`}
                    className="rnrm-book-cover-showcase"
                  >
                    {(activeLayout === 9 || activeLayout === 16) && (
                      <span className="rnrm-cover-backstack" aria-hidden="true">
                        <img src={c.coverImg} alt="" loading="lazy" />
                      </span>
                    )}
                    {activeLayout === 16 && (
                      <span
                        className="rnrm-cover-backstack rnrm-cover-backstack--2"
                        aria-hidden="true"
                      >
                        <img src={c.coverImg} alt="" loading="lazy" />
                      </span>
                    )}
                    <img
                      src={c.coverImg}
                      alt={`${c.title} cover`}
                      loading="lazy"
                    />
                  </a>

                  {/* Title Ribbons & Cloud Badge */}
                  <div className="rnrm-book-overlay">
                    <div className="rnrm-book-badge-row">
                      <span className="rnrm-book-cloud">{c.badge}</span>
                      <span className="rnrm-book-issue-pill">
                        ISSUE #{issueNum}
                      </span>
                    </div>

                    <h3 id={headingId} className="rnrm-book-ribbons">
                      {titleRibbons.map((line) => (
                        <span key={line} className="rnrm-book-ribbon">
                          <span className="rnrm-book-ribbon-text">{line}</span>
                        </span>
                      ))}
                    </h3>

                    {/* Inline Story Dossier */}
                    {showInlineDossier && (
                      <div className="rnrm-book-inline-dossier">
                        {c.subtitle && (
                          <p className="rnrm-book-subtitle">{c.subtitle}</p>
                        )}
                        <p className="rnrm-body">{c.desc}</p>
                        <div className="rnrm-book-inline-actions">
                          <a
                            className="rnrm-btn rnrm-book-cta"
                            href={c.amazonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Buy on Amazon <span aria-hidden="true">→</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 3 Story Card for Layout 08 (3-Column Triptych) */}
                  {activeLayout === 8 && (
                    <div className="rnrm-l8-card">
                      <span className="rnrm-l8-kicker">
                        CHAPTER {issueNum} SYNOPSIS
                      </span>
                      {c.subtitle && (
                        <p className="rnrm-book-subtitle">{c.subtitle}</p>
                      )}
                      <p className="rnrm-body">{c.desc}</p>
                      <a
                        className="rnrm-btn rnrm-book-cta"
                        href={c.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Buy on Amazon <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom Split / Capsule / Letterbox Footer Bar */}
                {showFooterDock && (
                  <div className="rnrm-book-footer">
                    <div className="rnrm-book-info">
                      {c.subtitle && (
                        <p className="rnrm-book-subtitle">{c.subtitle}</p>
                      )}
                      <p className="rnrm-body">{c.desc}</p>
                    </div>
                    <div className="rnrm-book-action">
                      <a
                        className="rnrm-btn rnrm-book-cta"
                        href={c.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Buy on Amazon <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
