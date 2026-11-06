/* eslint-disable react-doctor/iframe-missing-sandbox */
"use client";

/**
 * Rock 'n' Roll Kids — dogelonmars.com layout, with this site's fonts, colors and art.
 *
 * Centered poster hero with a cartoon scene that shrinks into a wall of art on scroll,
 * side tabs, big centered section titles, pill-shaped feature stats, image cards with
 * a footer bar, a "screen" video player and jagged ground dividers.
 *
 * Other layouts: ?layout=services, ?layout=stories, ?layout=circles, ?layout=classic.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ABOUT_DATA,
  getCharactersList,
  getFoundersList,
  getMusicSinglesList,
  getProductsList,
} from "./RockNRollKidsClient";
import RnrComicBookShowcase from "./RnrComicBookShowcase";
import RnrBeginningsShowcase from "./RnrBeginningsShowcase";
import RnrAboutShowcase from "./RnrAboutShowcase";
import { getMediaUrl } from "@/lib/sanity";
import "./rnr-mission.css";

const PILLARS = [
  {
    title: "Animated TV Series",
    desc: "Multi-episode animated adventures teaching positivity through rock.",
    tag: "TV Series",
  },
  {
    title: "Mobile Games & Apps",
    desc: "Interactive video games, mobile apps, and coloring books.",
    tag: "Games & Apps",
  },
  {
    title: "12 Published Comic Books",
    desc: "Action-packed superhero graphic novels available worldwide.",
    tag: "Comic Books",
  },
  {
    title: "Original Rock Soundtracks",
    desc: "Original band songs, music videos, and animated singles.",
    tag: "Rock Music",
  },
];

/* Dogelon-style surrounding bento wall tiles around the center hero card:
   [left %, top %, width %, height %, imageSrc] */
const HERO_BENTO_TILES: readonly {
  readonly id: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly img: string;
}[] = [
  // Top row (4 tiles above the center stage)
  { id: "t1", left: -3.3, top: -10.5, width: 28.0, height: 31, img: "/images/7hrrk/book-bg/1.png" },
  { id: "t2", left: 25.9, top: -10.5, width: 23.5, height: 31, img: "/images/7hrrk/book-bg/2.png" },
  { id: "t3", left: 50.6, top: -10.5, width: 23.5, height: 31, img: "/images/7hrrk/book-bg/3.png" },
  { id: "t4", left: 75.3, top: -10.5, width: 28.0, height: 31, img: "/images/7hrrk/book-bg/4.png" },
  // Middle row (2 tiles left + 2 tiles right flanking the center hero stage)
  { id: "m1", left: -15.1, top: 23, width: 19.2, height: 54, img: "/images/7hrrk/book1.jpg" },
  { id: "m2", left: 5.3, top: 23, width: 19.4, height: 54, img: "/images/7hrrk/book2.jpg" },
  { id: "m3", left: 75.3, top: 23, width: 19.4, height: 54, img: "/images/7hrrk/book3.jpg" },
  { id: "m4", left: 95.9, top: 23, width: 19.2, height: 54, img: "/images/7hrrk/book4.jpg" },
  // Bottom row (4 tiles below the center stage)
  { id: "b1", left: -3.3, top: 79.5, width: 28.0, height: 31, img: "/images/7hrrk/book-bg/5.png" },
  { id: "b2", left: 25.9, top: 79.5, width: 23.5, height: 31, img: "/images/7hrrk/book-bg/6.png" },
  { id: "b3", left: 50.6, top: 79.5, width: 23.5, height: 31, img: "/images/7hrrk/book-bg/7.png" },
  { id: "b4", left: 75.3, top: 79.5, width: 28.0, height: 31, img: "/images/7hrrk/book-bg/8.png" },
];

/** Jagged cartoon ground, drawn in the site's accent colors. */
function Ground({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className={`rnrm-ground${flip ? " rnrm-ground--flip" : ""}`}
      viewBox="0 0 1400 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="rnrm-ground-back"
        d="M0 120V58l90-20 70 26 120-36 90 30 110-40 80 28 130-34 100 34 120-38 90 30 130-30 90 26 90-22 90 22v74z"
      />
      <path
        className="rnrm-ground-front"
        d="M0 120V84l110-16 80 22 130-28 100 24 120-30 90 26 140-26 110 28 110-30 100 26 130-22 90 20 90-16v62z"
      />
    </svg>
  );
}

function SectionHead({ kicker, title, children }: { kicker?: string; title: string; children?: ReactNode }) {
  return (
    <div className="rnrm-head">
      {kicker && <p className="rnrm-kicker">{kicker}</p>}
      <h2 className="rnrm-title">{title}</h2>
      {children && <div className="rnrm-sub">{children}</div>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RnrMissionClient({ sanityContent }: { sanityContent: any }) {
  const comics = useMemo(() => getProductsList(sanityContent), [sanityContent]);
  const cast = useMemo(() => getCharactersList(sanityContent), [sanityContent]);
  const founders = useMemo(() => getFoundersList(sanityContent), [sanityContent]);
  const singles = useMemo(() => getMusicSinglesList(sanityContent), [sanityContent]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findSection = (id: string) => sanityContent?.sections?.find((x: any) => x.sectionId === id);
  const aboutSection = findSection("about");
  const comicsSection = findSection("comics");
  const foundersSection = findSection("founders");
  const badge = aboutSection?.badge || "We love art";
  const para1 = aboutSection?.subtitle || ABOUT_DATA.paragraph1;
  const para2 = aboutSection?.body || ABOUT_DATA.paragraph2;

  const [selectedVideo, setSelectedVideo] = useState<string | undefined>(singles[0]?.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const artBook = comics.find((c: any) => /art book/i.test(c.title)) || comics[0];

  const musicBgVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeVideoId = selectedVideo || "3ZhqLJDRxQ8";

  useEffect(() => {
    const video = musicBgVideoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.currentTime = 0;
    video.play().catch(() => { });

    let rafId = 0;
    const tick = () => {
      if (video.currentTime >= 2) {
        video.currentTime = 0;
        if (video.paused) {
          video.play().catch(() => { });
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [activeVideoId]);

  return (
    <div className="rnrm" data-no-text-anim>
      {/* ── hero (Dogelon-style bento mosaic framing the center stage) ── */}
      <div className="rnrm-hero-wrap">
        <div className="rnrm-hero-stage">
          <div className="rnrm-wall" aria-hidden="true">
            {HERO_BENTO_TILES.map((tile) => (
              <div
                key={tile.id}
                className="rnrm-tile"
                style={
                  {
                    "--tile-left": `${tile.left}%`,
                    "--tile-top": `${tile.top}%`,
                    "--tile-w": `${tile.width}%`,
                    "--tile-h": `${tile.height}%`,
                  } as React.CSSProperties
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tile.img} alt="" loading="eager" />
              </div>
            ))}
          </div>

          <header className="rnrm-hero">
            <div className="rnrm-hero-copy">
              <h1 className="rnrm-giant" aria-label="The Rock 'n' Roll Kids">
                <span aria-hidden="true">The Rock &apos;n&apos; Roll</span>
                <span aria-hidden="true">Kids.</span>
              </h1>
              <p className="rnrm-intro">
                7th Heaven as kids, bringing fun, positivity and social consciousness to life through <b>comics</b>,{" "}
                <b>music</b> &amp; <b>animation</b>.
              </p>
            </div>
            <div className="rnrm-scene" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getMediaUrl(sanityContent?.heroBannerImage, "/images/7hrrk/All-c.png")} alt="" />
              <Ground />
            </div>
          </header>
        </div>
      </div>

      <main className="rnrm-main">
        {/* ── about ──────────────────────────────────────── */}
        <section id="about" className="rnrm-section site-container" aria-labelledby="about-title">
          <div className="rnrm-head">
            <p className="rnrm-kicker">7th Heaven &amp; The Rock &apos;n&apos; Roll Kids</p>
            <h2 className="rnrm-title" id="about-title">
              {badge}
            </h2>
            <p className="rnrm-lead">
              {sanityContent?.heroSubheading ||
                "An animated adventure series communicating messages of fun, positivity, and social consciousness through music and imagination."}
            </p>
          </div>

          <RnrAboutShowcase badge={badge} para1={para1} para2={para2} pillars={PILLARS} cast={cast} />
        </section>

        {/* ── comics ─────────────────────────────────────── */}
        <section id="comics" className="rnrm-section rnrm-section--comics" aria-labelledby="comics-title">
          <div className="rnrm-head site-container">
            <p className="rnrm-kicker">Comic books &amp; publications</p>
            <h2 className="rnrm-title" id="comics-title">
              Our comic books
            </h2>
            <p className="rnrm-lead">
              {comicsSection?.body ||
                "Explore the official collection of 7th Heaven & The Rock 'n' Roll Kids comic books, digital e-books, coloring books, and exclusive concept art books. Each release follows the band on superhero adventures combining rock music, problem-solving, and positive life lessons for kids and families worldwide. All titles are available now on Amazon in print and digital formats."}
            </p>
          </div>
          <RnrComicBookShowcase comics={comics} />
        </section>

        {/* ── animated singles ───────────────────────────── */}
        <section id="music" className="rnrm-section rnrm-music-section" aria-labelledby="music-title">
          <div className="rnrm-music-bg" aria-hidden="true">
            <video
              ref={musicBgVideoRef}
              key={activeVideoId}
              src={`/movie/previews/${activeVideoId}.mp4`}
              poster={`https://i.ytimg.com/vi/${activeVideoId}/hqdefault.jpg`}
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => { });
              }}
              onTimeUpdate={(e) => {
                if (e.currentTarget.currentTime >= 2) {
                  e.currentTarget.currentTime = 0;
                  if (e.currentTarget.paused) {
                    e.currentTarget.play().catch(() => { });
                  }
                }
              }}
            />
            <div className="rnrm-music-bg-scrim" />
          </div>
          <div className="rnrm-music-inner site-container">
            <div className="rnrm-head">
              <h2 className="rnrm-title" id="music-title">
                Featured animated singles
              </h2>
              <p className="rnrm-lead">Select a song below to switch the animated music video player.</p>
            </div>
            <div className="rnrm-screen">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}`}
                title="Rock and Roll Kids Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
            <div className="rnrm-grid rnrm-grid--4 rnrm-tracks">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {singles.map((single: any) => (
                <button
                  key={single.id}
                  type="button"
                  className="rnrm-track"
                  aria-pressed={selectedVideo === single.id}
                  onClick={() => setSelectedVideo(single.id)}
                >
                  <span className="rnrm-cloud rnrm-cloud--inline">{single.tag}</span>
                  <span className="rnrm-card-title">{single.title}</span>
                  <span className="rnrm-track-sub">{single.subtitle}</span>
                  <span className="rnrm-body">{single.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── beginnings ─────────────────────────────────── */}
        <section id="story" className="rnrm-section site-container" aria-labelledby="story-title">
          <SectionHead kicker="The story" title="Beginnings." />
          <RnrBeginningsShowcase artBook={artBook} comics={comics} studios={ABOUT_DATA.studios} />
        </section>

        {/* ── team ───────────────────────────────────────── */}
        <section id="team" className="rnrm-section site-container" aria-labelledby="team-title">
          <div className="rnrm-head">
            <p className="rnrm-kicker">{foundersSection?.title || "Series Founders & Contact"}</p>
            <h2 className="rnrm-title" id="team-title">
              The team
            </h2>
            <p className="rnrm-lead">
              {foundersSection?.subtitle ||
                "Meet the creators and co-founders behind 7th Heaven and the Rock 'n' Roll Kids franchise, bringing animated music adventures, comic books, and live rock performances to life."}
            </p>
          </div>
          <div className="rnrm-grid rnrm-grid--2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {founders.map((f: any) => (
              <article key={f.name} className="rnrm-card">
                <div className="rnrm-card-img rnrm-card-img--square rnrm-card-img--cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.desktopImg || f.mobileImg} alt={f.name} loading="lazy" />
                </div>
                <div className="rnrm-card-bar">
                  <p className="rnrm-card-title" role="heading" aria-level={3}>
                    {f.name}
                  </p>
                  <p className="rnrm-stat-label">{f.role}</p>
                  <p className="rnrm-body">{f.desc}</p>
                  {f.email && (
                    <p className="rnrm-contact">
                      <span className="rnrm-kicker">Email</span>
                      <a href={`mailto:${f.email}`}>{f.email}</a>
                    </p>
                  )}
                  {f.phone && (
                    <p className="rnrm-contact">
                      <span className="rnrm-kicker">Call {f.name ? f.name.split(" ")[0] : ""}</span>
                      <a href={`tel:${f.phone.replace(/[^\d+]/g, "")}`}>{f.phone}</a>
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
