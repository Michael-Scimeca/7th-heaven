/* eslint-disable react-doctor/iframe-missing-sandbox */
"use client";

/**
 * Rock 'n' Roll Kids — 1minus1.com/services layout.
 *
 * Giant two-line title with the intro beside it, a jump-to bar, then framed
 * sections that alternate media left/right, each with a kicker, title, copy and
 * a two-column pill list. A numbered rail tracks the active section.
 *
 * Other layouts: ?layout=stories, ?layout=circles, ?layout=classic.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ABOUT_DATA,
  getCharactersList,
  getFoundersList,
  getMusicSinglesList,
  getProductsList,
} from "./RockNRollKidsClient";
import { getMediaUrl } from "@/lib/sanity";
import "./rnr-services.css";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "comics", label: "Comic books" },
  { id: "music", label: "Singles" },
  { id: "story", label: "Beginnings" },
  { id: "cast", label: "The cast" },
  { id: "team", label: "The team" },
];

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

const BOOK_FILTERS = [
  { id: "all", label: "All Items" },
  { id: "episodes", label: "Episodes 1-9" },
  { id: "art", label: "Art & Volumes" },
] as const;

function Frame({
  id,
  flip = false,
  player = false,
  kicker,
  title,
  media,
  copy,
  children,
}: {
  id: string;
  flip?: boolean;
  player?: boolean;
  kicker: string;
  title: string;
  media: ReactNode;
  copy?: ReactNode;
  children: ReactNode;
}) {
  const cls = ["rnrv-frame", flip && "rnrv-frame--flip", !copy && "rnrv-frame--wide", player && "rnrv-frame--player"].filter(Boolean).join(" ");
  return (
    <section id={id} className={cls} aria-labelledby={`${id}-title`}>
      <i className="rnrv-corner rnrv-corner--tl" />
      <i className="rnrv-corner rnrv-corner--tr" />
      <i className="rnrv-corner rnrv-corner--bl" />
      <i className="rnrv-corner rnrv-corner--br" />
      <div className="rnrv-head">
        <p className="rnrv-kicker">{kicker}</p>
        <h2 className="rnrv-title" id={`${id}-title`}>
          {title}
        </h2>
      </div>
      {copy && <div className="rnrv-copy">{copy}</div>}
      <div className="rnrv-items">{children}</div>
      <div className="rnrv-media">{media}</div>
    </section>
  );
}

function Spotlight({ src, alt, cover = false }: { src?: string; alt: string; cover?: boolean }) {
  return (
    <div className="rnrv-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={src} className={cover ? "rnrv-image-cover" : undefined} src={src} alt={alt} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RnrServicesClient({ sanityContent }: { sanityContent: any }) {
  const comics = useMemo(() => getProductsList(sanityContent), [sanityContent]);
  const cast = useMemo(() => getCharactersList(sanityContent), [sanityContent]);
  const founders = useMemo(() => getFoundersList(sanityContent), [sanityContent]);
  const singles = useMemo(() => getMusicSinglesList(sanityContent), [sanityContent]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findSection = (id: string) => sanityContent?.sections?.find((x: any) => x.sectionId === id);
  const aboutSection = findSection("about");
  const comicsSection = findSection("comics");
  const foundersSection = findSection("founders");
  const para1 = aboutSection?.subtitle || ABOUT_DATA.paragraph1;
  const para2 = aboutSection?.body || ABOUT_DATA.paragraph2;

  const [bookFilter, setBookFilter] = useState<"all" | "episodes" | "art">("all");
  const [selectedVideo, setSelectedVideo] = useState<string | undefined>(singles[0]?.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredComics = comics.filter((c: any) => {
    if (bookFilter === "episodes") return c.badge?.startsWith("Episode");
    if (bookFilter === "art") return !c.badge?.startsWith("Episode");
    return true;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const artBook = comics.find((c: any) => /art book/i.test(c.title)) || comics[0];

  const [comicIndex, setComicIndex] = useState(0);
  const [castIndex, setCastIndex] = useState(0);
  const [founderIndex, setFounderIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="rnrv">
      {/* ── hero ─────────────────────────────────────────── */}
      <header className="rnrv-hero">
        <div className="rnrv-hero-art" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getMediaUrl(sanityContent?.heroBannerImage, "/images/7hrrk/All-c.png")} alt="" />
        </div>
        <div className="rnrv-giant">
          <h1 className="rnrv-giant-line" aria-label="The Rock 'n' Roll Kids">
            <span aria-hidden="true">Rock &apos;n&apos;</span>
          </h1>
          <div className="rnrv-intro">
            <h2 className="rnrv-kicker">An animated series</h2>
            <p>
              7th Heaven as kids, bringing fun, positivity and social consciousness to life through <b>comics</b>,{" "}
              <b>music</b> &amp; <b>animation</b>.
            </p>
          </div>
          <span className="rnrv-giant-line rnrv-giant-line--right" aria-hidden="true">
            Roll Kids
          </span>
        </div>

        <nav className="rnrv-jump" aria-label="Jump to section">
          <p className="rnrv-kicker rnrv-kicker--small">Jump to</p>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── numbered rail ────────────────────────────────── */}
      <nav className="rnrv-rail" aria-label="Page sections">
        {SECTIONS.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rnrv-rail-link"
            aria-current={activeSection === s.id ? "true" : undefined}
            aria-label={s.label}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {activeSection === s.id && <em>{s.label}</em>}
          </a>
        ))}
      </nav>

      <main className="rnrv-sections">
        {/* ── about ──────────────────────────────────────── */}
        <Frame
          id="about"
          kicker="7th Heaven & The Rock 'n' Roll Kids"
          title={aboutSection?.badge || "We love art"}
          media={<Spotlight src="/images/7hrrk/All-c.png" alt="The Rock 'n' Roll Kids cast" cover />}
          copy={
            <>
              <p className="rnrv-lead">
                {sanityContent?.heroSubheading ||
                  "An animated adventure series communicating messages of fun, positivity, and social consciousness through music and imagination."}
              </p>
              {/* the CMS "subtitle" can just repeat the badge used as the title */}
              {para1 !== (aboutSection?.badge || "We love art") && <p className="rnrv-body">{para1}</p>}
            </>
          }
        >
          <p className="rnrv-body rnrv-span">{para2}</p>
          {PILLARS.map((pillar, i) => (
            <article key={pillar.title} className="rnrv-card rnrv-card--plain">
              <p className="rnrv-kicker rnrv-kicker--small">0{i + 1}.</p>
              <p className="rnrv-card-title" role="heading" aria-level={3}>
                {pillar.title}
              </p>
              <span className="rnrv-tag">{pillar.tag}</span>
              <p className="rnrv-body">{pillar.desc}</p>
            </article>
          ))}
          <div className="rnrv-span rnrv-ctas">
            <a className="rnrv-more" href="#comics">
              Explore Comic Books ({comics.length})
            </a>
            <a className="rnrv-more" href="#music">
              Watch Animated Singles
            </a>
          </div>
        </Frame>

        {/* ── comics ─────────────────────────────────────── */}
        <Frame
          id="comics"
          flip
          kicker={`Comic books & publications (${String(comics.length).padStart(2, "0")})`}
          title="Our comic books"
          media={
            <Spotlight
              src={filteredComics[comicIndex]?.coverImg}
              alt={`${filteredComics[comicIndex]?.title} cover`}
            />
          }
          copy={
            <>
              <p className="rnrv-body">
                {comicsSection?.body ||
                  "Explore the official collection of 7th Heaven & The Rock 'n' Roll Kids comic books, digital e-books, coloring books, and exclusive concept art books. Each release follows the band on superhero adventures combining rock music, problem-solving, and positive life lessons for kids and families worldwide. All titles are available now on Amazon in print and digital formats."}
              </p>
              <div className="rnrv-filters">
                {BOOK_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="rnrv-filter"
                    aria-pressed={bookFilter === f.id}
                    onClick={() => {
                      setBookFilter(f.id);
                      setComicIndex(0);
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          }
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filteredComics.map((c: any, i: number) => (
            <article
              key={c.id ?? c.title}
              className="rnrv-card"
              onMouseEnter={() => setComicIndex(i)}
              onFocus={() => setComicIndex(i)}
            >
              <a
                className="rnrv-thumb"
                href={c.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${c.title} on Amazon`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.coverImg} alt={`${c.title} cover`} loading="lazy" />
              </a>
              <div>
                <p className="rnrv-card-title" role="heading" aria-level={3}>
                  {c.title}
                </p>
                <span className="rnrv-tag">{c.badge}</span>
                <p className="rnrv-body">{c.desc}</p>
                <a className="rnrv-action" href={c.amazonUrl} target="_blank" rel="noopener noreferrer">
                  Buy on Amazon <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </Frame>

        {/* ── animated singles ───────────────────────────── */}
        <Frame
          id="music"
          player
          kicker="Select a song below to switch the animated music video player."
          title="Featured animated singles"
          media={
            <div className="rnrv-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}`}
                title="Rock and Roll Kids Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          }
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {singles.map((single: any) => (
            <button
              key={single.id}
              type="button"
              className="rnrv-card rnrv-card--track"
              aria-pressed={selectedVideo === single.id}
              onClick={() => setSelectedVideo(single.id)}
            >
              <span className="rnrv-card-title">{single.title}</span>
              <span className="rnrv-tag">{single.tag}</span>
              <span className="rnrv-track-sub">{single.subtitle}</span>
              <span className="rnrv-body">{single.desc}</span>
            </button>
          ))}
        </Frame>

        {/* ── beginnings ─────────────────────────────────── */}
        <Frame
          id="story"
          flip
          kicker="The story"
          title="Beginnings."
          media={<Spotlight src={artBook?.coverImg} alt={`${artBook?.title} cover`} />}
          copy={
            <>
              <p className="rnrv-lead">
                7th Heaven &amp; the Rock &apos;n&apos; Roll Kids is based on the band, as young kids who bring{" "}
                <b>positivity to other kids</b>.
              </p>
              <p className="rnrv-lead">
                Each episode is <strong>a problem, an adventure and a resolution</strong>, told through music and
                imagination.
              </p>
            </>
          }
        >
          <p className="rnrv-lead rnrv-span">
            In a world filled with so much negativity, we want to bring <b>a breath of fresh air</b> and help influence
            kids in a positive light through rock and roll.
          </p>
          <p className="rnrv-lead rnrv-span">
            It&apos;s growing into an animated TV series, comic books, games, apps, videos and{" "}
            <strong>original music</strong>, built with:
          </p>
          {ABOUT_DATA.studios.map((st) => (
            <a key={st.name} className="rnrv-pill" href={st.url} target="_blank" rel="noopener noreferrer">
              <span className="rnrv-pill-mark" aria-hidden="true">
                ×
              </span>
              {st.name}
            </a>
          ))}
        </Frame>

        {/* ── cast ───────────────────────────────────────── */}
        <Frame
          id="cast"
          kicker={`Character cast lineup (${String(cast.length).padStart(2, "0")})`}
          title="The cast"
          media={<Spotlight src={cast[castIndex]?.image} alt={cast[castIndex]?.name} />}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {cast.map((c: any, i: number) => (
            <article
              key={c.name}
              className="rnrv-card"
              tabIndex={0}
              onMouseEnter={() => setCastIndex(i)}
              onFocus={() => setCastIndex(i)}
            >
              <div className="rnrv-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.name} loading="lazy" />
              </div>
              <div>
                <p className="rnrv-card-title" role="heading" aria-level={3}>
                  {c.name}
                </p>
                <span className="rnrv-tag">{c.role}</span>
                <p className="rnrv-body">{c.desc}</p>
              </div>
            </article>
          ))}
        </Frame>

        {/* ── team ───────────────────────────────────────── */}
        <Frame
          id="team"
          flip
          kicker={foundersSection?.title || "Series Founders & Contact"}
          title="The team"
          copy={
            <p className="rnrv-body">
              {foundersSection?.subtitle ||
                "Meet the creators and co-founders behind 7th Heaven and the Rock 'n' Roll Kids franchise, bringing animated music adventures, comic books, and live rock performances to life."}
            </p>
          }
          media={
            <Spotlight
              src={founders[founderIndex]?.desktopImg || founders[founderIndex]?.mobileImg}
              alt={founders[founderIndex]?.name}
              cover
            />
          }
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {founders.map((f: any, i: number) => (
            <article
              key={f.name}
              className="rnrv-card"
              onMouseEnter={() => setFounderIndex(i)}
              onFocus={() => setFounderIndex(i)}
            >
              <div className="rnrv-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="rnrv-image-cover" src={f.desktopImg || f.mobileImg} alt={f.name} loading="lazy" />
              </div>
              <div>
                <p className="rnrv-card-title" role="heading" aria-level={3}>
                  {f.name}
                </p>
                <span className="rnrv-tag">{f.role}</span>
                <p className="rnrv-body">{f.desc}</p>
                {f.email && (
                  <div className="rnrv-contact">
                    <span className="rnrv-kicker rnrv-kicker--small">Email</span>
                    <a href={`mailto:${f.email}`}>{f.email}</a>
                  </div>
                )}
                {f.phone && (
                  <div className="rnrv-contact">
                    <span className="rnrv-kicker rnrv-kicker--small">Call {f.name ? f.name.split(" ")[0] : ""}</span>
                    <a href={`tel:${f.phone.replace(/[^\d+]/g, "")}`}>{f.phone}</a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </Frame>
      </main>

      {/* ── cover strip ──────────────────────────────────── */}
      <div className="rnrv-strip" aria-hidden="true">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {comics.slice(0, 3).map((c: any, i: number) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={c.coverImg} alt="" loading="lazy" />
        ))}
      </div>
    </div>
  );
}
