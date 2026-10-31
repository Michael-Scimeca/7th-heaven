import type React from "react";
import type { VaultCategoryRow, VaultMediaCard } from "./PartnershipsMediaVault";

export type MediaFormatFilter = "all" | "video" | "photo";
export type EraFilter = "all" | "2024-2025" | "2020-2023" | "2010s" | "classic";
export type RuntimeFilter = "all" | "short" | "medium" | "long";
export type SortFilter = "curated" | "newest" | "oldest" | "az" | "duration";

export interface VaultFilterState {
  format: MediaFormatFilter;
  categories: string[];
  era: EraFilter;
  runtime: RuntimeFilter;
  search: string;
  sort: SortFilter;
  hdRecentOnly: boolean;
}

export const DEFAULT_VAULT_FILTER_STATE: VaultFilterState = {
  format: "all",
  categories: [],
  era: "all",
  runtime: "all",
  search: "",
  sort: "curated",
  hdRecentOnly: false,
};

export interface FilterLayoutMeta {
  id: number;
  number: string;
  name: string;
  family: string;
  desc: string;
}

export const TWENTY_FILTER_LAYOUTS: readonly FilterLayoutMeta[] = [
  {
    id: 1,
    number: "01",
    name: "Single-Row Command Toolbar",
    family: "INLINE TOOLBAR",
    desc: "All facets in one horizontal bar: segmented format capsule, live search input, era, runtime, and sort selectors.",
  },
  {
    id: 2,
    number: "02",
    name: "Left Faceted Sidebar Split",
    family: "2-COL LEFT SIDEBAR",
    desc: "Dedicated 260px sticky left facet sidebar with format counts, era radios, runtime buckets, 4K toggle, and category checklist.",
  },
  {
    id: 3,
    number: "03",
    name: "Right Studio Inspector Rail",
    family: "2-COL RIGHT CONSOLE",
    desc: "Vault rows on the left paired with a right-hand broadcast inspector featuring ratio meters, 2x2 era pads, and quick jumps.",
  },
  {
    id: 4,
    number: "04",
    name: "Natural Language Sentence Filter",
    family: "MAD-LIBS EDITORIAL",
    desc: "Interactive typographic sentence ('Exploring [All Media] from [Every Era] in [All Collections]...') with inline token menus.",
  },
  {
    id: 5,
    number: "05",
    name: "Slide-Out Off-Canvas Filter Sheet",
    family: "RIGHT DRAWER SHEET",
    desc: "Ultra-clean gallery header with active chips and a single Filters trigger that slides open a full-height off-canvas facet sheet.",
  },
  {
    id: 6,
    number: "06",
    name: "Collapsible 4-Column Mega-Tray",
    family: "ACCORDION MEGA-PANEL",
    desc: "Compact search strip with a 'Tune Filters' button that unfolds a 4-column structured facet matrix right above the rows.",
  },
  {
    id: 7,
    number: "07",
    name: "Visual Poster Tile Carousel",
    family: "THUMBNAIL RIBBON",
    desc: "Apple TV / Netflix style horizontal ribbon of visual artwork cards for all 11 collections with live item counts.",
  },
  {
    id: 8,
    number: "08",
    name: "40-Year Concert Timeline Scrubber",
    family: "CHRONOLOGICAL RULER",
    desc: "Interactive 1985–2025 horizontal timeline track with clickable decade milestone nodes connected by a glowing rail.",
  },
  {
    id: 9,
    number: "09",
    name: "Spotlight Command Palette (Cmd+K)",
    family: "KEYBOARD LAUNCHER",
    desc: "Minimal Spotlight launcher bar that opens a centered Raycast-style modal for instant search and one-click facet commands.",
  },
  {
    id: 10,
    number: "10",
    name: "Bento KPI Stat-Card Matrix",
    family: "METRIC CARDS",
    desc: "Four interactive Bento metric tiles (Full Archive, Video Reels, Photo Prints, 2024–25 Releases) that filter on click.",
  },
  {
    id: 11,
    number: "11",
    name: "Vinyl Record-Crate Divider Tabs",
    family: "FOLDER CRATE TABS",
    desc: "Physical record-store crate divider tabs flush on a bottom rail with a recessed utility bar for era, sort, and search.",
  },
  {
    id: 12,
    number: "12",
    name: "Floating Bottom Glass Island",
    family: "VIEWPORT DOCK",
    desc: "Leaves the vault header 100% pure typography and moves all filtering into an expandable floating bottom glass dock.",
  },
  {
    id: 13,
    number: "13",
    name: "Swiss Numbered Directory Matrix",
    family: "SWISS INDEX GRID",
    desc: "Monospace 3-column bordered index table (01–11) where numbered collection cells act as multi-select punch-cards.",
  },
  {
    id: 14,
    number: "14",
    name: "Multi-Tag Pill Cloud & Basket",
    family: "COLORED TAG CLOUD",
    desc: "Color-coded tag clusters for video reels, photo rolls, and eras paired with an active selection basket bar.",
  },
  {
    id: 15,
    number: "15",
    name: "3-Step Guided Drilldown Funnel",
    family: "STEPPER FUNNEL",
    desc: "Three connected progressive step cards guiding users from 01 Format -> 02 Era & Runtime -> 03 Collection & Sort.",
  },
  {
    id: 16,
    number: "16",
    name: "Multi-Popover Filter Chip Bar",
    family: "ANCHORED POPOVERS",
    desc: "Linear-style compact toolbar of anchored popover chips (+ Format, + Collections, + Era, + Runtime, + Sort) with checkmarks.",
  },
  {
    id: 17,
    number: "17",
    name: "Curated Mood & Smart Playlists",
    family: "ONE-CLICK PRESETS",
    desc: "Eight curated one-click collection cards (Billboard Hits, Full Stadiums, 30-in-30, Cruise At Sea, Fan Rail, Vintage Retro).",
  },
  {
    id: 18,
    number: "18",
    name: "Asset Manager Folder Tree Cockpit",
    family: "LEFT FOLDER TREE",
    desc: "Premiere / Finder style 2-column browser with a top LED transport bar and collapsible VIDEO REELS / PHOTO ARCHIVE folder tree.",
  },
  {
    id: 19,
    number: "19",
    name: "Luxury Hairline Tabs & Search Curtain",
    family: "EDITORIAL MINIMAL",
    desc: "High-fashion minimal hairline underline navigation with an expandable full-width typographic search curtain.",
  },
  {
    id: 20,
    number: "20",
    name: "Live Soundboard Mixing Rack",
    family: "STAGE CONSOLE",
    desc: "Touring mixing console with unified Toggle channel buses (Video Bus, Photo Bus, 4K Era, 25m+ Shows) and category solo pads.",
  },
  {
    id: 21,
    number: "21",
    name: "TBWA\\Hakuhodo VIEW ALL & Diagonal Index",
    family: "TBWA CANONICAL",
    desc: "Chamfered white VIEW ALL (7)(0) polygon bar, oversized marquee title with acid-lime glyph frame, Swiss metadata controls, and diagonal 01–11 staircase.",
  },
  {
    id: 22,
    number: "22",
    name: "TBWA Swiss Case-Study Metadata Ledger",
    family: "TBWA DOSSIER GRID",
    desc: "4-column agency specification ledger (\\ CATEGORY, \\ DATE & ERA, \\ FORMAT & RUNTIME, \\ INFORMATION & QUERY) with right/left credit-pair alignment.",
  },
  {
    id: 23,
    number: "23",
    name: "TBWA Acid-Lime Wireframe Blueprint Matrix",
    family: "TBWA WIREFRAME",
    desc: "Architectural grid canvas with 45° acid-lime vector rays, crosshair-framed \\01–\\11 collection coordinates, and chamfered VIEW ALL counter.",
  },
  {
    id: 24,
    number: "24",
    name: "TBWA Kinetic Marquee & Chamfered Curtain",
    family: "TBWA CURTAIN",
    desc: "Twin horizontal grotesk marquee banner paired with a chamfered white MENU \\\\ bar that unfolds a full-width agency filter index curtain.",
  },
  {
    id: 25,
    number: "25",
    name: "TBWA Diagonal Staircase 2-Column Split",
    family: "TBWA STAIRCASE 2-COL",
    desc: "Sticky left TBWA agency spine with backslash emblem, chamfered VIEW ALL reset bar, and diagonal-stepped 01–11 collection staircase beside live rows.",
  },
];

export const ERA_OPTIONS: readonly { value: EraFilter; label: string; short: string }[] = [
  { value: "all", label: "All Eras (1985–2025)", short: "All Years" },
  { value: "2024-2025", label: "2024–2025 (4K Tour Era)", short: "2024–25" },
  { value: "2020-2023", label: "2020–2023 (Stadium Return)", short: "2020–23" },
  { value: "2010s", label: "2010–2019 (Billboard Era)", short: "2010s" },
  { value: "classic", label: "1985–2009 (Classic Vault)", short: "85–09" },
];

export const RUNTIME_OPTIONS: readonly { value: RuntimeFilter; label: string; short: string }[] = [
  { value: "all", label: "Any Length", short: "Any" },
  { value: "short", label: "Singles & Clips (< 6m)", short: "< 6m" },
  { value: "medium", label: "Extended & TV (6–25m)", short: "6–25m" },
  { value: "long", label: "Full Concerts & 30-in-30 (25m+)", short: "25m+" },
];

export const SORT_OPTIONS: readonly { value: SortFilter; label: string }[] = [
  { value: "curated", label: "Curated Order" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "Title A–Z" },
  { value: "duration", label: "Longest Runtime" },
];

export interface SmartMoodPreset {
  id: string;
  title: string;
  tag: string;
  patch: VaultFilterState;
}

export const SMART_MOOD_PRESETS: readonly SmartMoodPreset[] = [
  {
    id: "all-vault",
    title: "Complete 40-Year Vault",
    tag: "70 ITEMS",
    patch: DEFAULT_VAULT_FILTER_STATE,
  },
  {
    id: "billboard-hits",
    title: "Billboard & Studio Hits",
    tag: "SINGLES",
    patch: { ...DEFAULT_VAULT_FILTER_STATE, format: "video", categories: ["official-music-videos"] },
  },
  {
    id: "full-stadiums",
    title: "Full Arena Concerts",
    tag: "25M+ LIVE",
    patch: { ...DEFAULT_VAULT_FILTER_STATE, format: "video", categories: ["full-concerts"] },
  },
  {
    id: "medley-marathons",
    title: "30-in-30 Speed Runs",
    tag: "30 SONGS",
    patch: { ...DEFAULT_VAULT_FILTER_STATE, format: "video", categories: ["medleys-marathons"] },
  },
  {
    id: "caribbean-cruise",
    title: "Caribbean Cruise Vault",
    tag: "AT SEA",
    patch: {
      ...DEFAULT_VAULT_FILTER_STATE,
      categories: ["caribbean-cruise-video", "caribbean-cruise-photos"],
    },
  },
  {
    id: "tv-press",
    title: "TV & National Press",
    tag: "BROADCAST",
    patch: { ...DEFAULT_VAULT_FILTER_STATE, format: "video", categories: ["tv-broadcasts"] },
  },
  {
    id: "fan-rail",
    title: "Front-Row Fan & Stage",
    tag: "PHOTOS",
    patch: {
      ...DEFAULT_VAULT_FILTER_STATE,
      format: "photo",
      categories: ["stage-lighting-photos", "fan-community-vault"],
    },
  },
  {
    id: "vintage-retro",
    title: "40-Year Retro & Backstage",
    tag: "ARCHIVE",
    patch: {
      ...DEFAULT_VAULT_FILTER_STATE,
      format: "photo",
      categories: ["retro-archives-history", "backstage-green-room"],
    },
  },
];

export function parseDurationToSeconds(duration?: string): number {
  if (!duration) return 0;
  const parts = duration.split(":").map((n) => Number(n));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  return parts.reduce((acc, val) => acc * 60 + val, 0);
}

export function parseItemYear(year?: number | string): number {
  if (typeof year === "number") return year;
  if (!year) return 2024;
  const match = String(year).match(/\d{4}/);
  return match ? Number(match[0]) : 2024;
}

export function matchesEra(yearVal: number | string | undefined, era: EraFilter): boolean {
  if (era === "all") return true;
  if (typeof yearVal === "string" && yearVal.includes("-") && era === "classic") {
    return true;
  }
  const y = parseItemYear(yearVal);
  if (era === "2024-2025") return y >= 2024;
  if (era === "2020-2023") return y >= 2020 && y <= 2023;
  if (era === "2010s") return y >= 2010 && y <= 2019;
  if (era === "classic") return y < 2010;
  return true;
}

export function matchesRuntime(item: VaultMediaCard, runtime: RuntimeFilter): boolean {
  if (runtime === "all") return true;
  if (item.type !== "video") return false;
  const secs = parseDurationToSeconds(item.duration);
  if (runtime === "short") return secs > 0 && secs < 360;
  if (runtime === "medium") return secs >= 360 && secs < 1500;
  if (runtime === "long") return secs >= 1500;
  return true;
}

export function sortMediaItems(items: VaultMediaCard[], sort: SortFilter): VaultMediaCard[] {
  if (sort === "curated") return items;
  const copy = [...items];
  if (sort === "newest") {
    copy.sort((a, b) => parseItemYear(b.year) - parseItemYear(a.year));
  } else if (sort === "oldest") {
    copy.sort((a, b) => parseItemYear(a.year) - parseItemYear(b.year));
  } else if (sort === "az") {
    copy.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "duration") {
    copy.sort((a, b) => parseDurationToSeconds(b.duration) - parseDurationToSeconds(a.duration));
  }
  return copy;
}

export function filterVaultCategories(
  allCategories: VaultCategoryRow[],
  state: VaultFilterState
): {
  rows: VaultCategoryRow[];
  totalItems: number;
  videoItems: number;
  photoItems: number;
  activeFilterCount: number;
} {
  const q = state.search.trim().toLowerCase();

  let activeFilterCount = 0;
  if (state.format !== "all") activeFilterCount += 1;
  if (state.categories.length > 0) activeFilterCount += state.categories.length;
  if (state.era !== "all") activeFilterCount += 1;
  if (state.runtime !== "all") activeFilterCount += 1;
  if (q.length > 0) activeFilterCount += 1;
  if (state.sort !== "curated") activeFilterCount += 1;
  if (state.hdRecentOnly) activeFilterCount += 1;

  const rows: VaultCategoryRow[] = [];
  let videoItems = 0;
  let photoItems = 0;
  const selectedCategorySet = new Set(state.categories);

  for (const cat of allCategories) {
    if (state.format !== "all" && cat.categoryType !== state.format) continue;
    if (selectedCategorySet.size > 0 && !selectedCategorySet.has(cat.id)) continue;

    const categoryMatchesQuery =
      q.length > 0 &&
      (cat.title.toLowerCase().includes(q) || cat.subtitle.toLowerCase().includes(q));

    const matchedItems = cat.items.filter((item) => {
      if (!matchesEra(item.year, state.era)) return false;
      if (!matchesRuntime(item, state.runtime)) return false;
      if (state.hdRecentOnly && parseItemYear(item.year) < 2023) return false;
      if (q.length > 0 && !categoryMatchesQuery) {
        const hay = `${item.title} ${item.venue ?? ""} ${item.caption ?? ""} ${item.year ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (matchedItems.length === 0) continue;

    const sortedItems = sortMediaItems(matchedItems, state.sort);
    if (cat.categoryType === "video") {
      videoItems += sortedItems.length;
    } else {
      photoItems += sortedItems.length;
    }

    rows.push({
      ...cat,
      itemsCount: sortedItems.length,
      items: sortedItems,
    });
  }

  return {
    rows,
    totalItems: videoItems + photoItems,
    videoItems,
    photoItems,
    activeFilterCount,
  };
}

export interface FilterLayoutRendererProps {
  allCategories: VaultCategoryRow[];
  filteredRows: VaultCategoryRow[];
  state: VaultFilterState;
  selectedCategorySet: ReadonlySet<string>;
  onChange: (patch: Partial<VaultFilterState>) => void;
  onToggleCategory: (categoryId: string) => void;
  onReset: () => void;
  totalItems: number;
  videoItems: number;
  photoItems: number;
  activeFilterCount: number;
  activeRowId: string;
  onSelectRow: (categoryId: string) => void;
  children: React.ReactNode;
}
