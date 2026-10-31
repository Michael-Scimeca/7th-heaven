import React from "react";
import { Camera, Film } from "lucide-react";
import { MediaVaultItem } from "./MediaWeGoAgainClient";

export interface MediaLayoutProps {
  activeItem: MediaVaultItem;
  onSelectItem: (item: MediaVaultItem) => void;
  bandMedia: MediaVaultItem[];
  fanMedia: MediaVaultItem[];
  allMedia: MediaVaultItem[];
  activeTab: "all" | "band" | "fan";
  setActiveTab: (tab: "all" | "band" | "fan") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  videoPlayerRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  togglePlay: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  currentTime: number;
  duration: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSkip: (seconds: number) => void;
  toggleFullscreen: () => void;
  thumbFor: (item: MediaVaultItem) => string;
  formatSeconds: (sec: number) => string;
  onShare: () => void;
  copiedLink: boolean;
  onOpenSubmitModal?: () => void;
  onOpenLightbox?: (item: MediaVaultItem) => void;
  typographyPresetId?: number;
}

export function MediaFormatBadge({ item, className = "" }: { item: MediaVaultItem; className?: string }) {
  if (item.mediaFormat === "photo") {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/85 backdrop-blur-md border border-emerald-400/60 text-emerald-300 shadow-md ${className}`}>
        <Camera className="w-2.5 h-2.5 text-emerald-400" />
        <span>PHOTO</span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/85 backdrop-blur-md border border-purple-400/60 text-purple-300 shadow-md ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      <span>VIDEO</span>
    </span>
  );
}

export interface PageLayoutPreset {
  id: number;
  name: string;
  badge: string;
  desc: string;
  category:
    | "WGA Undisputed"
    | "Architectural"
    | "Broadcast"
    | "Experiential"
    | "Editorial"
    | "Curated Shelves"
    | "Broadcast Megagrid"
    | "Interactive Stages"
    | "Discovery & Filters"
    | "Single Column Master"
    | "Single Row Deck"
    | "Split Single Rail";
}

export const WHOLE_PAGE_LAYOUT_PRESETS: PageLayoutPreset[] = [
  {
    id: 1,
    name: "WGA Undisputed Case Study",
    badge: "WGA CANONICAL",
    desc: "Left editorial dossier with hairline dividers, floating central video player, and horizontal bottom poster cartouche drawer.",
    category: "WGA Undisputed",
  },
  {
    id: 2,
    name: "50/50 Monolithic Split Screen",
    badge: "50/50 SPLIT",
    desc: "Pure edge-to-edge 50vw/50vw split: left full-height sticky player, right independent scrollable narrative dossier.",
    category: "Architectural",
  },
  {
    id: 3,
    name: "21:9 Ultra-Wide Cinema Screen",
    badge: "21:9 CINEMA",
    desc: "Massive 21:9 widescreen theater player anchored at top, followed by 4-column categorized media catalog below.",
    category: "Architectural",
  },
  {
    id: 4,
    name: "Fullscreen Canvas & Bottom Dock",
    badge: "FLOATING DOCK",
    desc: "100% full-screen immersive video canvas with macOS/WGA style floating bottom glass dock with magnifying cards.",
    category: "Experiential",
  },
  {
    id: 5,
    name: "3-Column Production Switcher",
    badge: "DIRECTOR SUITE",
    desc: "Left tracklist navigation (20%), center primary stage monitor (55%), right technical production specs & credits (25%).",
    category: "Broadcast",
  },
  {
    id: 6,
    name: "Horizontal Filmstrip Carousel",
    badge: "CINE FILMSTRIP",
    desc: "Top 60vh spotlight video player with ambient bleed + bottom 40vh continuous horizontal snapping filmstrip slider.",
    category: "Experiential",
  },
  {
    id: 7,
    name: "Swiss Typographic Directory",
    badge: "SWISS EDITORIAL",
    desc: "Oversized bold numbered titles directory (65%) with hover video triggers and right floating sticky monitor (35%).",
    category: "Editorial",
  },
  {
    id: 8,
    name: "Darkroom Contact Sheet Wall",
    badge: "DARKROOM 35MM",
    desc: "Immersive 4-column photo-lab contact sheet wall with frame numbers, red grease marks, and top sticky player ribbon.",
    category: "Experiential",
  },
  {
    id: 9,
    name: "Asymmetric Modernist Magazine",
    badge: "Z-PATTERN",
    desc: "High-fashion editorial layout: offset video player, overlapping narrative pull-quote, and staggered media cards.",
    category: "Editorial",
  },
  {
    id: 10,
    name: "Multi-Cam Broadcast Control Room",
    badge: "OB TRUCK PGM",
    desc: "Live TV broadcast switcher: main PGM monitor flanked by 4 live preview feeds (CAM 1-3, FAN 1) and tally switcher.",
    category: "Broadcast",
  },
  {
    id: 11,
    name: "Minimalist Floating HUD Canvas",
    badge: "IMMERSIVE HUD",
    desc: "100% edge-to-edge video canvas with modular floating frosted glass HUD panels for telemetry, audio, and tracklist.",
    category: "Experiential",
  },
  {
    id: 12,
    name: "Dual-Screen Comparison Deck",
    badge: "PRO VS FAN",
    desc: "Synchronized dual-screen comparison: left Pro 4K Concert Multi-Cam, right Front-Row Fan Cam with live audio switcher.",
    category: "Broadcast",
  },
  {
    id: 13,
    name: "Vinyl Gatefold & Spinning Record",
    badge: "VINYL JACKET",
    desc: "Left 1:1 square vinyl jacket with sliding spinning record and video center label; right gatefold liner notes & setlist.",
    category: "Experiential",
  },
  {
    id: 14,
    name: "Vertical Story Reel Triptych",
    badge: "9:16 TRIPTYCH",
    desc: "3 vertical 9:16 smartphone-format concert reels side-by-side with synchronized audio and vertical swipe track rail.",
    category: "Architectural",
  },
  {
    id: 15,
    name: "Chronological Timeline Archive",
    badge: "ERA TIMELINE",
    desc: "Interactive 1977–2025 horizontal timeline ruler scrubbing through eras with connected video milestone node cards.",
    category: "Editorial",
  },
  {
    id: 16,
    name: "Classified Manila Case Dossier",
    badge: "CLASSIFIED",
    desc: "Archival Manila folder binder with tabbed dividers, typewriter courier text, stamp seals, and vintage CRT monitor.",
    category: "Editorial",
  },
  {
    id: 17,
    name: "Cyberpunk Telemetry Terminal",
    badge: "MATRIX CLI",
    desc: "Retro-futurist terminal dashboard: amber/green CRT scanlines, live audio waveform visualizer, and terminal CLI search.",
    category: "Broadcast",
  },
  {
    id: 18,
    name: "Scrollable Story & Bottom Cinema",
    badge: "STORY MAGAZINE",
    desc: "Long-form editorial magazine article that scrolls freely with active video permanently anchored in a docked bottom bar.",
    category: "Editorial",
  },
  {
    id: 19,
    name: "3D Perspective Stage Coverflow",
    badge: "3D COVERFLOW",
    desc: "Isometric 3D stage layout where video cards tilt dynamically in 3D perspective space with reflections.",
    category: "Experiential",
  },
  {
    id: 20,
    name: "Asymmetric Bento Box Matrix",
    badge: "BENTO MATRIX",
    desc: "Modern asymmetric bento-box grid with 2x2 featured player tile surrounded by interactive stats, setlist, and clips.",
    category: "Architectural",
  },
  {
    id: 21,
    name: "Cinema Wall Grid (Giant Cards)",
    badge: "GIANT WALL",
    desc: "Massive 2-column oversized video cards (600px+ wide) with sticky spotlight video header, format badges, and live playback.",
    category: "Broadcast Megagrid",
  },
  {
    id: 22,
    name: "Netflix-Style Categorized Shelves",
    badge: "STREAMING SHELVES",
    desc: "Categorized horizontal scrolling shelves (Official Concerts, Fan Media, Midwest Tour) with 420px wide thumbnail cards.",
    category: "Curated Shelves",
  },
  {
    id: 23,
    name: "Spotlight Marquee & Quick Chips",
    badge: "MARQUEE STRIP",
    desc: "Quick category filter chips with snapping ribbon of super-wide 16:10 video cards and instant playback drawer.",
    category: "Curated Shelves",
  },
  {
    id: 24,
    name: "Split Browser & Giant Catalog",
    badge: "SPLIT CATALOG",
    desc: "45% fixed sticky cinema stage on the left with a 55% scrolling 2-column catalog of oversized video tiles on the right.",
    category: "Architectural",
  },
  {
    id: 25,
    name: "Billboard Stack Panorama",
    badge: "21:9 BILLBOARDS",
    desc: "Full-width stacked panoramic 21:9 billboard cards with integrated video playback, venue stamps, and quick selection.",
    category: "Editorial",
  },
  {
    id: 26,
    name: "YouTube Mega Grid with Category Pills",
    badge: "YOUTUBE MEGA",
    desc: "Broadcasting grid with oversized 3-column cards, interactive top category pills, creator badges, and view metrics.",
    category: "Broadcast Megagrid",
  },
  {
    id: 27,
    name: "Category Drawer Deck",
    badge: "DRAWER DECK",
    desc: "Left categorized channel tabs ('All', 'Concerts', 'Fan Cam', 'Photos') with a right deck of high-impact video tiles.",
    category: "Curated Shelves",
  },
  {
    id: 28,
    name: "Infinite Cine-Stream Streamer",
    badge: "CINE STREAM",
    desc: "Asymmetric alternating 2-column large and extra-large video cards with quick format tags and auto-scrolling stage.",
    category: "Editorial",
  },
  {
    id: 29,
    name: "Festival Multi-Stage Strip",
    badge: "MULTI-STAGE",
    desc: "Multi-stage horizontal arena channels ('Main Arena Stage', 'Festival Circuit', 'Fan Pit Tapes') with large live feeds.",
    category: "Interactive Stages",
  },
  {
    id: 30,
    name: "Smooth Accordion Expander",
    badge: "ACCORDION CARDS",
    desc: "Full-width accordion cards that smoothly expand into oversized cinema players with rich setlist notes on click.",
    category: "Experiential",
  },
  {
    id: 31,
    name: "Giant Bottom Roller Deck",
    badge: "ROLLER DECK",
    desc: "Top 52vh cinema stage with bottom 45vh horizontal roller deck featuring oversized 480px video thumbnail cards.",
    category: "Interactive Stages",
  },
  {
    id: 32,
    name: "Concert Setlist Jukebox",
    badge: "SETLIST JUKEBOX",
    desc: "Concert jukebox interface with oversized numbered track tiles, stage lighting effects, and fast song selection.",
    category: "Experiential",
  },
  {
    id: 33,
    name: "Two-Tier Mega Carousel",
    badge: "TWO-TIER REEL",
    desc: "Two distinct tiers: Top tier for Official Band 4K Masters and bottom tier for Fan Media Wall with 520px cards.",
    category: "Curated Shelves",
  },
  {
    id: 34,
    name: "3D Giant Coverflow Reel",
    badge: "3D COVERFLOW XL",
    desc: "Coverflow perspective stage with huge 650px wide cards, 3D reflection floor, and instantaneous cinema switching.",
    category: "Experiential",
  },
  {
    id: 35,
    name: "Big-Card Masonry Pinboard",
    badge: "PINBOARD MASONRY",
    desc: "3-column masonry grid where every thumbnail is large, crisp, and enriched with badges, duration tags, and venues.",
    category: "Architectural",
  },
  {
    id: 36,
    name: "Filter Deck Cinema",
    badge: "FILTER DECK",
    desc: "High-speed interactive filter bar (search, category pills, format toggles) with sticky preview and oversized 2-col cards.",
    category: "Discovery & Filters",
  },
  {
    id: 37,
    name: "Multiview Mosaic Showcase",
    badge: "MOSAIC 3-FEED",
    desc: "3 large primary video quadrants on top with a massive bottom snapping picker track of 440px wide cards.",
    category: "Interactive Stages",
  },
  {
    id: 38,
    name: "Magazine Lookbook Full-Bleed",
    badge: "LOOKBOOK XL",
    desc: "High-fashion editorial layout with oversized panoramic 16:9 cards, bold typography, and rapid category switcher tabs.",
    category: "Editorial",
  },
  {
    id: 39,
    name: "Video Wall Matrix (2x3)",
    badge: "2x3 MATRIX",
    desc: "2-row x 3-column matrix of massive video cards with minimal chrome, deck switching (1-6, 7-12), and fast preview.",
    category: "Broadcast Megagrid",
  },
  {
    id: 40,
    name: "Ultimate Showcase & Discovery Deck",
    badge: "ULTIMATE SHOWCASE",
    desc: "Floating master stage + multi-lane infinite big-card ribbon with format badges, quick search, and fan submission modal.",
    category: "Discovery & Filters",
  },
  {
    id: 41,
    name: "Master Stage & Vertical Stack (1-Col)",
    badge: "1-COL STACK",
    desc: "Top giant open video stage + beneath it a pure single-column vertical stack of massive 16:9 cards.",
    category: "Single Column Master",
  },
  {
    id: 42,
    name: "Split Cinema & Right 1-Col Rail",
    badge: "RIGHT 1-COL",
    desc: "Left 65% sticky big video player + right 35% dedicated single-column vertical scroll rail.",
    category: "Split Single Rail",
  },
  {
    id: 43,
    name: "Left 1-Col Playlist & Right Cinema",
    badge: "LEFT 1-COL",
    desc: "Left 35% single-column tracklist queue + right 65% sticky big open theater screen.",
    category: "Split Single Rail",
  },
  {
    id: 44,
    name: "Master Stage & Single Snap Row",
    badge: "1-ROW SNAP",
    desc: "Top huge open video stage (60vh) + bottom strictly ONE horizontal snapping row of large 480px cards.",
    category: "Single Row Deck",
  },
  {
    id: 45,
    name: "Centered Cinema Floating 1-Row Shelf",
    badge: "1-ROW SHELF",
    desc: "Full-bleed centered cinema screen + floating bottom frosted shelf of strictly ONE row of video cards.",
    category: "Single Row Deck",
  },
  {
    id: 46,
    name: "YouTube Desktop Theater (1-Col)",
    badge: "YOUTUBE 1-COL",
    desc: "Left 70% large theater screen + right 30% strictly ONE single-column vertical queue with no multi-columns.",
    category: "Split Single Rail",
  },
  {
    id: 47,
    name: "Editorial 1-Col Archival Dossier",
    badge: "EDITORIAL 1-COL",
    desc: "Anchored top master cinema + long-form single-column story cards with rich blurbs and venue stamps.",
    category: "Single Column Master",
  },
  {
    id: 48,
    name: "Sticky PiP & 1-Col Video Stream",
    badge: "STICKY PIP 1-COL",
    desc: "Main video player sticks as floating PiP upon scrolling down a clean single-column video stream.",
    category: "Single Column Master",
  },
  {
    id: 49,
    name: "Single Horizontal Filmstrip Rail",
    badge: "FILMSTRIP 1-ROW",
    desc: "Upper half open cinema screen + lower half strictly ONE single horizontal continuous filmstrip track.",
    category: "Single Row Deck",
  },
  {
    id: 50,
    name: "Docked Drawer Single Row",
    badge: "DRAWER 1-ROW",
    desc: "Immersive edge-to-edge cinema stage + docked bottom drawer with strictly ONE single row of video cards.",
    category: "Single Row Deck",
  },
  {
    id: 51,
    name: "Up-Next Queue (Strictly 1-Col)",
    badge: "UP-NEXT 1-COL",
    desc: "Left 65% master stage player + right 35% strictly 1-column numbered concert up-next queue.",
    category: "Split Single Rail",
  },
  {
    id: 52,
    name: "21:9 Panoramic Stage & 1-Row Roller",
    badge: "21:9 1-ROW",
    desc: "Top 21:9 panoramic video stage + bottom single row of 480px wide cards with smooth left/right scrubbing.",
    category: "Single Row Deck",
  },
  {
    id: 53,
    name: "Jukebox 1-Col Illuminated Tracklist",
    badge: "JUKEBOX 1-COL",
    desc: "Vintage jukebox aesthetic: left CRT stage monitor + right 1-column illuminated playlist cards.",
    category: "Split Single Rail",
  },
  {
    id: 54,
    name: "Concert Setlist Single-Column Flow",
    badge: "SETLIST 1-COL",
    desc: "Chronological 1-column concert setlist: big open video at top, then numbered tracks down a single column.",
    category: "Single Column Master",
  },
  {
    id: 55,
    name: "Broadcast Studio Single-Row Feeds",
    badge: "STUDIO 1-ROW",
    desc: "Large PGM studio monitor on top + strictly ONE row of live multi-cam tally feeds at bottom.",
    category: "Single Row Deck",
  },
  {
    id: 56,
    name: "Full-Width Stacked Masterfeed",
    badge: "FULL-WIDTH 1-COL",
    desc: "Top master video player + beneath it full-width 1-column stacked cards that load on click.",
    category: "Single Column Master",
  },
  {
    id: 57,
    name: "Single-Row Ambient Carousel",
    badge: "AMBIENT 1-ROW",
    desc: "Large centered cinema screen + strictly ONE single horizontal carousel row below with ambient glow.",
    category: "Single Row Deck",
  },
  {
    id: 58,
    name: "Sidebar Accordion Single-Column",
    badge: "ACCORDION 1-COL",
    desc: "Left collapsible single-column accordion list + right large open video player with full specs.",
    category: "Split Single Rail",
  },
  {
    id: 59,
    name: "Horizontal Timeline Single-Row Track",
    badge: "TIMELINE 1-ROW",
    desc: "Era timeline on top (1977-2025), middle big open video player, and bottom strictly ONE row of matching era videos.",
    category: "Single Row Deck",
  },
  {
    id: 60,
    name: "Ultimate Single-Column Master Suite",
    badge: "ULTIMATE 1-COL",
    desc: "The definitive 1-column + big video layout: top grand cinema stage, followed by filter pills and a pure 1-column gallery.",
    category: "Single Column Master",
  },
  {
    id: 61,
    name: "JJettas Signature Moments [Athletic Arena & Gold Foil Cards]",
    badge: "JJETTAS SIGNATURE",
    desc: "Directly inspired by jjettas.com: Colossal watermarked purple 'SIGNATURE MOMENTS' title, floating 3D metallic gold foil cards, and arena yard markers.",
    category: "Experiential",
  },
  {
    id: 62,
    name: "JJettas Luxury Exhibit Canvas [Panoramic Multi-Card Bento]",
    badge: "EXHIBIT CANVAS",
    desc: "Exact 1:1 panoramic museum exhibit canvas: stone frontman hero card, purple signature moments, arena turf, origin narrative, and floating interactive dock over blurred video.",
    category: "Experiential",
  },
];
