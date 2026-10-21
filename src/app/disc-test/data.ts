import raw from "../../../public/data/albums.json";

export type Track = {
  id: string;
  number: number;
  title: string;
  audioUrl: string;
};

export type Album = {
  id: string;
  title: string;
  year: string;
  coverImage: string;
  storeUrl: string;
  tracks: Track[];
};

export type DiscItem = {
  slug: string;
  title: string;
  category: string;
  image: string;
  /** small copy for the side nav */
  thumb: string;
  meta: [string, string][];
  albumId: string;
};

type RawAlbum = {
  id: string;
  title: string;
  image: string;
  year: string;
  tracks: { title: string; file: string }[];
  storeUrl?: string;
};

/** Same split the media-page audio player uses for "Original CD's". */
function isOriginal(a: RawAlbum) {
  const t = a.title.toLowerCase();
  return !(
    t.includes("medley") ||
    t.includes("cover") ||
    t === "unplugged" ||
    t.includes("christmas") ||
    t.includes("holiday")
  );
}

const entities: [RegExp, string][] = [
  [/&apos;/g, "’"],
  [/&amp;/g, "&"],
  [/&quot;/g, '"'],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
];

function clean(title: string) {
  let t = title.replace(/^\s*\d+[\s.-]+/, "").trim();
  for (const [re, to] of entities) t = t.replace(re, to);
  return t;
}

/** Served through Next's image endpoint so the cover is same-origin —
 *  a cross-origin image would taint the canvas the disc texture is drawn on. */
function cover(url: string, w = 640) {
  return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;
}

/** The band's own streaming proxy (same one the media-page player uses). */
function audio(file: string) {
  return `/api/audio?t=${typeof window === "undefined" ? Buffer.from(file).toString("base64") : btoa(file)}`;
}

const originals = (raw as RawAlbum[])
  .filter(isOriginal)
  .sort((a, b) => Number(b.year) - Number(a.year));

const thumbs = new Map(originals.map((a) => [a.id, cover(a.image, 96)]));

export const ALBUMS: Album[] = originals.map((a) => ({
  id: a.id,
  title: a.title,
  year: a.year,
  coverImage: cover(a.image),
  storeUrl: a.storeUrl ?? "/merch",
  tracks: a.tracks.map((t, i) => ({
    id: `${a.id}-${i}`,
    number: i + 1,
    title: clean(t.title),
    audioUrl: audio(t.file),
  })),
}));

export const ITEMS: DiscItem[] = ALBUMS.map((a) => ({
  slug: a.id,
  albumId: a.id,
  title: a.title,
  category: "Album",
  image: a.coverImage,
  thumb: thumbs.get(a.id) ?? a.coverImage,
  meta: [
    ["Year", a.year],
    ["Tracks", String(a.tracks.length)],
  ],
}));
