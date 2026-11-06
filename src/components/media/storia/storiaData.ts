export type StoriaThemeId =
  | "all"
  | "origins"
  | "live"
  | "discography"
  | "community"
  | "broadcast";

export interface StoriaGalleryTile {
  id: string;
  kind: "video" | "photo";
  src: string;
  posterSrc: string;
  alt: string;
  label: string;
}

export interface StoriaMilestone {
  id: string;
  year: string;
  yearNum: number;
  decade: string;
  theme: Exclude<StoriaThemeId, "all">;
  themeLabel: string;
  title: string;
  shortCaption: string;
  subtitle: string;
  story: string;
  venueMeta: string;
  statMeta: string;
  imageSrc: string;
  imageAlt: string;
  secondaryImageSrc: string;
  secondaryImageAlt: string;
  videoSrc?: string;
  mediaGallery?: readonly StoriaGalleryTile[];
}

export interface StoriaLayoutDef {
  index: number;
  code: string;
  name: string;
  tagline: string;
}

export const STORIA_THEMES: readonly { id: StoriaThemeId; label: string }[] = [
  { id: "all", label: "Storia (All)" },
  { id: "origins", label: "Origins" },
  { id: "live", label: "Live Stage" },
  { id: "discography", label: "Discography" },
  { id: "community", label: "Community" },
  { id: "broadcast", label: "Broadcast" },
];

export const STORIA_MILESTONES: readonly StoriaMilestone[] = [
  {
    id: "chicago-1985",
    year: "1985",
    yearNum: 1985,
    decade: "1980s",
    theme: "origins",
    themeLabel: "Origins",
    title: "Born on the Chicago Stage",
    shortCaption: "Founded in Chicago • Live phenomenon begins",
    subtitle: "Where 5,000+ live concerts began across packed Midwest rooms",
    story:
      "Founded in Chicago by guitarist and songwriter Richard Hofherr, 7th Heaven ignited a word-of-mouth live phenomenon across packed club rooms and neighborhood mainstages.",
    venueMeta: "Chicago, IL • Club Circuit",
    statMeta: "Year 01 • Founding Lineup",
    imageSrc: "/images/hero/hero-band-bg.png",
    imageAlt: "7th Heaven performing under stage lights in Chicago",
    secondaryImageSrc: "/images/hero/band-performance.webp",
    secondaryImageAlt: "7th Heaven live concert portrait",
    videoSrc: "/movie/loops/are-we-there-yet-30s.mp4",
  },
  {
    id: "festival-circuit-1992",
    year: "1992",
    yearNum: 1992,
    decade: "1990s",
    theme: "live",
    themeLabel: "Live Stage",
    title: "Midwest Festival Headliners",
    shortCaption: "200+ shows a year • Summer mainstages",
    subtitle: "Turning summer street fests into city-wide outdoor concerts",
    story:
      "Averaging more than 200 concerts a year, 7th Heaven became the definitive summer festival headliner across Illinois, Wisconsin, Indiana, Michigan, and Iowa.",
    venueMeta: "Midwest Mainstages • 5-State Tour",
    statMeta: "200+ Shows Every Year",
    imageSrc: "/images/hero/band-performance.webp",
    imageAlt: "7th Heaven headlining an outdoor Midwest stage",
    secondaryImageSrc: "/images/tour/fan-concert-photo.jpg",
    secondaryImageAlt: "Crowd hands raised at a 7th Heaven summer festival",
  },
  {
    id: "studio-era-1998",
    year: "1998",
    yearNum: 1998,
    decade: "1990s",
    theme: "discography",
    themeLabel: "Discography",
    title: "Independent Studio Catalog",
    shortCaption: "Original albums • Multi-part vocal harmonies",
    subtitle: "Original records bridging arena rock energy and pop-rock hooks",
    story:
      "Recording and releasing original albums independently, the band forged its unmistakable sound of soaring multi-part vocal harmonies and driving guitar anthems.",
    venueMeta: "Chicago Recording Studios",
    statMeta: "Independent Album Era",
    imageSrc: "/images/album/be-here.png",
    imageAlt: "7th Heaven Be Here studio album artwork",
    secondaryImageSrc: "/images/album/luminous.png",
    secondaryImageAlt: "7th Heaven Luminous album cover",
    videoSrc: "/movie/be-here-clip.mp4",
  },
  {
    id: "thirty-songs-2007",
    year: "2007",
    yearNum: 2007,
    decade: "2000s",
    theme: "live",
    themeLabel: "Live Stage",
    title: "30 Songs in 30 Minutes",
    shortCaption: "Nonstop stadium medley • Crowd chorus",
    subtitle: "The high-voltage medley that electrified festival mainstages",
    story:
      "Debuting the signature nonstop '30 Songs in 30 Minutes' medley, 7th Heaven turned massive outdoor crowds at Summerfest and Taste of Chicago into one continuous singalong.",
    venueMeta: "Summerfest & Taste of Chicago",
    statMeta: "30 Anthems • Zero Pauses",
    imageSrc: "/images/tour/fan-concert-photo.jpg",
    imageAlt: "7th Heaven festival crowd raising hands during 30 Songs in 30 Minutes",
    secondaryImageSrc: "/images/hero/hero-band-bg.png",
    secondaryImageAlt: "7th Heaven full band under purple stage lights",
    videoSrc: "/movie/fest1-clip.mp4",
  },
  {
    id: "billboard-2011",
    year: "2011",
    yearNum: 2011,
    decade: "2010s",
    theme: "discography",
    themeLabel: "Discography",
    title: "Billboard Midwest #1 Singles",
    shortCaption: "Better This Way • Sing • Color in Motion",
    subtitle: "Chart-topping independent singles across major Chicago radio",
    story:
      "Original releases including 'Better This Way', 'Sing', and 'Color in Motion' hit #1 on regional Billboard charts and earned heavy rotation on flagship Midwest stations.",
    venueMeta: "Billboard Regional Charts • Radio",
    statMeta: "#1 Midwest Singles",
    imageSrc: "/images/album/colot-in-motion.png",
    imageAlt: "7th Heaven Color in Motion album artwork",
    secondaryImageSrc: "/images/album/be-here.png",
    secondaryImageAlt: "7th Heaven Be Here artwork",
    videoSrc: "/movie/color-in-motion-clip.mp4",
  },
  {
    id: "rock-cruise-2016",
    year: "2016",
    yearNum: 2016,
    decade: "2010s",
    theme: "community",
    themeLabel: "Community",
    title: "7th Heaven Rock Cruise",
    shortCaption: "Annual Caribbean voyage • Open-ocean deck sets",
    subtitle: "Taking thousands of fans out to sea for a week of live rock",
    story:
      "Launching the annual 7th Heaven Rock Cruise across Cozumel, Grand Cayman, and CocoCay, uniting thousands of fans and the band on sun-drenched pool decks at sea.",
    venueMeta: "Caribbean Sea • Cozumel & CocoCay",
    statMeta: "Annual Sold-Out Fan Voyage",
    imageSrc: "/images/cruise/cruise-hero.png",
    imageAlt: "7th Heaven Caribbean cruise ship at sunset",
    secondaryImageSrc: "/images/cruise/cococay-beach-party.png",
    secondaryImageAlt: "7th Heaven CocoCay beach party celebration",
    videoSrc: "/movie/cruise-desktop.mp4",
  },
  {
    id: "wgn-4k-2021",
    year: "2021",
    yearNum: 2021,
    decade: "2020s",
    theme: "broadcast",
    themeLabel: "Broadcast",
    title: "WGN-TV & 4K Concert Films",
    shortCaption: "Live TV broadcasts • Multi-cam 4K specials",
    subtitle: "Capturing full theatre and stadium productions in 4K cinema",
    story:
      "From WGN Morning News and prime-time holiday specials to multi-camera 4K theatre concert films, 7th Heaven brought its live stage production to screens everywhere.",
    venueMeta: "WGN-TV Studios & Arcada Theatre 4K",
    statMeta: "Dozens of Live Broadcasts",
    imageSrc: "/images/hero/hero-desktop-poster.webp",
    imageAlt: "7th Heaven live television broadcast performance",
    secondaryImageSrc: "/images/album/be-here.png",
    secondaryImageAlt: "7th Heaven 4K concert film still",
    videoSrc: "/movie/loops/are-we-there-yet-30s.mp4",
  },
  {
    id: "forty-years-2026",
    year: "2026",
    yearNum: 2026,
    decade: "2020s",
    theme: "origins",
    themeLabel: "Origins",
    title: "40+ Years & 5,000 Concerts",
    shortCaption: "Four decades • 70-title archive vault",
    subtitle: "Four decades of anthems, arenas, and multi-generational fans",
    story:
      "Surpassing 5,000 live performances across four decades, 7th Heaven continues headlining major stages while preserving 70+ concert films and broadcasts in the vault.",
    venueMeta: "1985 — 2026 • Midwest & Beyond",
    statMeta: "5,000+ Concerts • 70 Vault Films",
    imageSrc: "/images/fans/fan-photo-featured.jpg",
    imageAlt: "7th Heaven and fans celebrating together at the stage barrier",
    secondaryImageSrc: "/images/cruise/cruise-hero.png",
    secondaryImageAlt: "7th Heaven cruise celebration at sunset",
    videoSrc: "/movie/loops/aint-that-just-beautiful-30s.mp4",
  },
];

export const STORIA_LAYOUTS: readonly StoriaLayoutDef[] = [
  {
    index: 0,
    code: "01",
    name: "Shallow Horizon",
    tagline: "Whisper-thin planetary arc, tangential years & single plumb drop",
  },
  {
    index: 1,
    code: "02",
    name: "Valley Cradle",
    tagline: "Open monumental headline floating above an inverted lower cradle arc",
  },
  {
    index: 2,
    code: "03",
    name: "Left Meridian",
    tagline: "Full-height left-edge meridian arc scrubbing all 42 years (1985–2026) & archival photography",
  },
  {
    index: 3,
    code: "04",
    name: "Right Meridian",
    tagline: "Right-aligned monumental headline linked by a hairline to a right curve",
  },
  {
    index: 4,
    code: "05",
    name: "Open Halo",
    tagline: "Centered thin circular wireframe halo with perimeter era markers",
  },
  {
    index: 5,
    code: "06",
    name: "Horizon Wire",
    tagline: "Single flat horizontal wire with 8 years & sliding vertical plumb line",
  },
  {
    index: 6,
    code: "07",
    name: "Plumb Thread",
    tagline: "Single center vertical thread with alternating quiet year ticks",
  },
  {
    index: 7,
    code: "08",
    name: "Split Axis",
    tagline: "Minimal left vertical year rail & leader line into open display type",
  },
  {
    index: 8,
    code: "09",
    name: "Diagonal Thread",
    tagline: "Clean 11° ascending hairline wire stepping eras across open space",
  },
  {
    index: 9,
    code: "10",
    name: "Crosshair Datum",
    tagline: "Full-stage X/Y hairline intersection locking the active year at center",
  },
  {
    index: 10,
    code: "11",
    name: "Whisper Giants",
    tagline: "Zero-line monumental active year flanked by ghosted prev & next eras",
  },
  {
    index: 11,
    code: "12",
    name: "Editorial Split",
    tagline: "Colossal outlined year numeral beside a 1px divider & open story head",
  },
  {
    index: 12,
    code: "13",
    name: "Stacked Index",
    tagline: "Borderless vertical typographic list blooming the active era in place",
  },
  {
    index: 13,
    code: "14",
    name: "Corner Reticle",
    tagline: "Four delicate 16px corner ticks framing open type & baseline years",
  },
  {
    index: 14,
    code: "15",
    name: "Offset Baseline",
    tagline: "Oversized flush-left year & flush-right title sharing a single baseline",
  },
  {
    index: 15,
    code: "16",
    name: "Crown Ticks",
    tagline: "Minimalist 120° upper degree-tick crown with zenith active year",
  },
  {
    index: 16,
    code: "17",
    name: "Caliper Span",
    tagline: "True-scale 1985–2026 proportional span bracket & gliding datum drop",
  },
  {
    index: 17,
    code: "18",
    name: "Pulse Dots",
    tagline: "Line-free row of 8 breathing points of light above open centered type",
  },
  {
    index: 18,
    code: "19",
    name: "Stepping Plateaus",
    tagline: "8 quiet ascending horizontal hairline steps rising across four decades",
  },
  {
    index: 19,
    code: "20",
    name: "Twin Brackets",
    tagline: "Left & right vertical hairline brackets flanking open centerpiece type",
  },
  {
    index: 20,
    code: "21",
    name: "Pendulum Drop",
    tagline: "Top-pivoted single hairline pointer tilting smoothly toward each year",
  },
  {
    index: 21,
    code: "22",
    name: "Horizon Reflection",
    tagline: "Monumental title above a center horizon line with hanging years below",
  },
  {
    index: 22,
    code: "23",
    name: "Sky Polyline",
    tagline: "8 quiet star-point nodes joined by a single gentle upper polyline",
  },
  {
    index: 23,
    code: "24",
    name: "Margin Ledger",
    tagline: "Expansive left display typography balanced by a narrow right year ledger",
  },
  {
    index: 24,
    code: "25",
    name: "Roman Chapters",
    tagline: "Minimal chapter numeral rule (I–VIII) over centered editorial type",
  },
  {
    index: 25,
    code: "26",
    name: "Diamond Wire",
    tagline: "Single rotated diamond hairline frame with perimeter year anchors",
  },
  {
    index: 26,
    code: "27",
    name: "Arch Portal",
    tagline: "Minimalist round-crown architectural arch framing open centered type",
  },
  {
    index: 27,
    code: "28",
    name: "Sine Thread",
    tagline: "Single low-amplitude harmonic wave carrying 8 clickable years",
  },
  {
    index: 28,
    code: "29",
    name: "Open Triptych",
    tagline: "Three airy borderless columns previewing prev, active & next eras",
  },
  {
    index: 29,
    code: "30",
    name: "Zenith Rays",
    tagline: "8 faint radial rays fanning from bottom center with active white beam",
  },
];

/**
 * Shortest signed cyclic offset in [-total/2, +total/2] so milestones wrap
 * continuously around circular Storia dials.
 */
export function getCyclicOffset(
  itemIdx: number,
  activeIdx: number,
  total: number
): number {
  let diff = itemIdx - activeIdx;
  const half = total / 2;
  while (diff > half) diff -= total;
  while (diff <= -half) diff += total;
  return diff;
}

/**
 * Gaussian wave intensity (0..1) for OSI Storia's fine tick-mark ruler.
 */
export function getGaussianTickWeight(
  tickRatio: number,
  activeRatio: number,
  sigma = 0.085
): number {
  const dist = (tickRatio - activeRatio) / sigma;
  return Math.exp(-0.5 * dist * dist);
}
