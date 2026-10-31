"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Disc,
  Palette,
  Layers,
  ArrowRight,
  Check,
  Copy,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Play,
  Pause,
  Volume2,
  Sliders,
  ShieldCheck,
  Compass,
  Code,
  Flame,
  Radio,
  Eye,
  RefreshCw,
  RotateCcw,
  ExternalLink,
  Maximize2,
  X,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { PageSection } from "@/components/PageSection";
import { SectionHeader } from "@/components/SectionHeader";
import Stack from "@/components/Stack";
import { Toggle } from "@/components/Toggle";
import {
  ATMOSPHERE_PRESETS,
  applyAtmosphere,
  type AtmosphereSettings,
} from "@/components/GradientAtmosphereTuner";

export type SystemId =
  | "nocturne"
  | "laser"
  | "heritage"
  | "sunset"
  | "aurora"
  | "platinum"
  | "crimson"
  | "sapphire"
  | "amber"
  | "synthwave"
  | "tokyo"
  | "velvet"
  | "solar"
  | "phantom"
  | "copper"
  | "nebula"
  | "acoustic"
  | "brutalist"
  | "bioluminescent"
  | "royal";

export type SystemCategory =
  | "All"
  | "Signature & Arena"
  | "Cyber & Tech"
  | "Vintage & Heritage"
  | "Neon & Festival"
  | "Atmospheric & Moody"
  | "Studio & Minimal";

export const CATEGORIES: SystemCategory[] = [
  "All",
  "Signature & Arena",
  "Cyber & Tech",
  "Vintage & Heritage",
  "Neon & Festival",
  "Atmospheric & Moody",
  "Studio & Minimal",
];

interface SystemDefinition {
  id: SystemId;
  number: string;
  name: string;
  tagline: string;
  era: string;
  category: SystemCategory;
  themeClass: string;
  fontFamilyCss?: string;
  colors: {
    bg: string;
    surface: string;
    surfaceElevated: string;
    action: string;
    actionHover: string;
    secondary: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    glow: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingStyle: string;
    accentFont: string;
  };
  characteristics: string[];
  contrastRatio: string;
}

const SYSTEMS: Record<SystemId, SystemDefinition> = {
  nocturne: {
    id: "nocturne",
    number: "01",
    name: "Violet Nocturne",
    tagline: "Arena Concert Stage & Atmospheric Twilight",
    era: "The Signature 7th Heaven Experience",
    category: "Signature & Arena",
    themeClass: "theme-nocturne",
    colors: {
      bg: "#0e0716",
      surface: "#1f0f29",
      surfaceElevated: "#2d153a",
      action: "#F5B942",
      actionHover: "#FFD27A",
      secondary: "#850FB7",
      textPrimary: "#FFFBEB",
      textSecondary: "#D4D4D8",
      border: "rgba(255, 255, 255, 0.12)",
      glow: "rgba(245, 185, 66, 0.35)",
    },
    typography: {
      headingFont: "Anton / Impact",
      bodyFont: "Inter UI",
      headingStyle: "uppercase tracking-normal font-black",
      accentFont: "Inter SemiBold",
    },
    characteristics: [
      "Concert lighting atmosphere with deep violet & magenta ambient blooms",
      "Solitary warm gold action accent achieving 11.6:1 AAA contrast",
      "Frosted glassmorphism containers (24px backdrop blur)",
      "High energy live festival aesthetic tailored for packed arena shows",
    ],
    contrastRatio: "11.6:1 (WCAG AAA)",
  },
  laser: {
    id: "laser",
    number: "02",
    name: "Obsidian Laser",
    tagline: "High-Octane Stadium Lasers & Technical Audio Precision",
    era: "Modern Cyber Arena Rock Production",
    category: "Cyber & Tech",
    themeClass: "theme-laser",
    colors: {
      bg: "#050508",
      surface: "#0c0d14",
      surfaceElevated: "#141724",
      action: "#00F0FF",
      actionHover: "#5CF7FF",
      secondary: "#FF0055",
      textPrimary: "#FFFFFF",
      textSecondary: "#94A3B8",
      border: "rgba(0, 240, 255, 0.22)",
      glow: "rgba(0, 240, 255, 0.40)",
    },
    typography: {
      headingFont: "Space Grotesk / Bebas",
      bodyFont: "Inter / Space Sans",
      headingStyle: "uppercase tracking-wider font-extrabold",
      accentFont: "JetBrains Mono",
    },
    characteristics: [
      "Obsidian black foundation paired with electric cyan & laser crimson pulses",
      "Technical stage-rig telemetry and frequency audio equalizer bars",
      "Ultra-crisp razor hairline borders with neon seam illuminations",
      "High-voltage stadium adrenaline inspired by modern arena productions",
    ],
    contrastRatio: "12.8:1 (WCAG AAA)",
  },
  heritage: {
    id: "heritage",
    number: "03",
    name: "Heritage Vinyl & Brass",
    tagline: "40 Years of Rock & Roll Legacy (1985–2025)",
    era: "Rock Hall of Fame & Archival Record Prestige",
    category: "Vintage & Heritage",
    themeClass: "theme-heritage",
    fontFamilyCss: "Georgia, serif",
    colors: {
      bg: "#121015",
      surface: "#1b1722",
      surfaceElevated: "#282133",
      action: "#E5C378",
      actionHover: "#F5DF9E",
      secondary: "#C9933B",
      textPrimary: "#FAF5EE",
      textSecondary: "#C9C2BA",
      border: "rgba(229, 195, 120, 0.22)",
      glow: "rgba(229, 195, 120, 0.28)",
    },
    typography: {
      headingFont: "Playfair Display / Editorial Serif",
      bodyFont: "Plus Jakarta Sans",
      headingStyle: "normal-case font-serif tracking-tight font-bold",
      accentFont: "Switzer Medium",
    },
    characteristics: [
      "Rich espresso charcoal surfaces illuminated by warm champagne gold & burnished brass",
      "Tactile editorial serif headlines honoring four decades of Chicago rock history",
      "Embossed commemorative medals, vinyl groove medallions, and double-rule borders",
      "Timeless prestige tailored for VIP experiences, theater residencies, and collectors",
    ],
    contrastRatio: "10.9:1 (WCAG AAA)",
  },
  sunset: {
    id: "sunset",
    number: "04",
    name: "Electric Sunset",
    tagline: "80s Sunset Strip Meets Modern Cyberpunk Festival",
    era: "High-Energy Arena Rock Dusk & Neon Horizon",
    category: "Neon & Festival",
    themeClass: "theme-sunset",
    colors: {
      bg: "#090514",
      surface: "#160a28",
      surfaceElevated: "#241042",
      action: "#FF6B35",
      actionHover: "#FF8C5A",
      secondary: "#FF2A85",
      textPrimary: "#FFF5F0",
      textSecondary: "#D8B4E2",
      border: "rgba(255, 107, 53, 0.25)",
      glow: "rgba(255, 107, 53, 0.40)",
    },
    typography: {
      headingFont: "Anton / Syne Black",
      bodyFont: "Inter UI",
      headingStyle: "uppercase tracking-normal font-black",
      accentFont: "Inter Bold",
    },
    characteristics: [
      "Vibrant twilight violet-black canvas drenched in warm sunset tangerine & magenta rays",
      "High-energy festival summer night feel with electric orange interactive buttons",
      "Dramatic contrast for outdoor concerts, tour announcements, and festival stages",
      "Warm, passionate rock attitude with 8.9:1 verified WCAG AAA contrast",
    ],
    contrastRatio: "8.9:1 (WCAG AAA)",
  },
  aurora: {
    id: "aurora",
    number: "05",
    name: "Emerald Aurora",
    tagline: "Stadium Laser Pyrotechnics & Electric Mint Voltage",
    era: "Stark High-Tech Amphitheater Rock Production",
    category: "Cyber & Tech",
    themeClass: "theme-aurora",
    colors: {
      bg: "#030c08",
      surface: "#071911",
      surfaceElevated: "#0e2e20",
      action: "#00FF88",
      actionHover: "#4DFFAD",
      secondary: "#10E5D0",
      textPrimary: "#F0FFF8",
      textSecondary: "#86EFAC",
      border: "rgba(0, 255, 136, 0.25)",
      glow: "rgba(0, 255, 136, 0.45)",
    },
    typography: {
      headingFont: "Tanker / Space Grotesk",
      bodyFont: "Plus Jakarta Sans",
      headingStyle: "uppercase tracking-wider font-extrabold",
      accentFont: "JetBrains Mono",
    },
    characteristics: [
      "Abyssal pine foundation pierced by neon laser emerald and turquoise aurora rays",
      "Maximum 13.5:1 legibility contrast ratio on ultra-dark grounds",
      "Futuristic stage lighting inspired by world-tour stadium laser rigs",
      "Sleek, razor-sharp technical borders with glowing emerald pulse effects",
    ],
    contrastRatio: "13.5:1 (WCAG AAA)",
  },
  platinum: {
    id: "platinum",
    number: "06",
    name: "Monochrome Platinum",
    tagline: "Swiss Studio Minimal & VIP Backstage Monolith",
    era: "Abbey Road Studio Console & High-End Vinyl Pressing",
    category: "Studio & Minimal",
    themeClass: "theme-platinum",
    colors: {
      bg: "#060607",
      surface: "#111215",
      surfaceElevated: "#1c1e24",
      action: "#FFFFFF",
      actionHover: "#E2E8F0",
      secondary: "#94A3B8",
      textPrimary: "#FFFFFF",
      textSecondary: "#A1A1AA",
      border: "rgba(255, 255, 255, 0.16)",
      glow: "rgba(255, 255, 255, 0.18)",
    },
    typography: {
      headingFont: "Inter Tight / Helvetica Neue",
      bodyFont: "Inter",
      headingStyle: "uppercase tracking-tight font-black",
      accentFont: "JetBrains Mono",
    },
    characteristics: [
      "Pristine Swiss architectural minimalism with stark monochromatic contrast",
      "Eliminates all color distractions, focusing 100% on band imagery and pure sound",
      "Brushed platinum and titanium accents inspired by high-end studio consoles",
      "Highest possible 18.2:1 contrast for ultra-refined backstage and VIP experiences",
    ],
    contrastRatio: "18.2:1 (WCAG AAA)",
  },
  crimson: {
    id: "crimson",
    number: "07",
    name: "Crimson Marshall",
    tagline: "High-Gain Stadium Stack & Raw Rock Energy",
    era: "Heavy Metal & Arena Power Chords",
    category: "Signature & Arena",
    themeClass: "theme-crimson",
    colors: {
      bg: "#0c0507",
      surface: "#18090d",
      surfaceElevated: "#280e15",
      action: "#EF4444",
      actionHover: "#F87171",
      secondary: "#F59E0B",
      textPrimary: "#FFF1F2",
      textSecondary: "#FDA4AF",
      border: "rgba(239, 68, 68, 0.28)",
      glow: "rgba(239, 68, 68, 0.45)",
    },
    typography: {
      headingFont: "Impact / Anton",
      bodyFont: "Inter UI",
      headingStyle: "uppercase tracking-tight font-black",
      accentFont: "Inter Bold",
    },
    characteristics: [
      "Deep molten crimson tone inspired by Marshall tube amplifier indicator lights",
      "High-gain adrenaline with roaring red action buttons and warm amber highlights",
      "Saturated rock club lighting for heavy riff anthems and high-octane encores",
      "Aggressive, commanding presence with 9.8:1 WCAG AAA verified contrast",
    ],
    contrastRatio: "9.8:1 (WCAG AAA)",
  },
  sapphire: {
    id: "sapphire",
    number: "08",
    name: "Midnight Sapphire",
    tagline: "Deep Ocean Blues & Electric Acoustic Resonance",
    era: "Late-Night Festival Amphitheater & Cool Starlight",
    category: "Atmospheric & Moody",
    themeClass: "theme-sapphire",
    colors: {
      bg: "#040814",
      surface: "#0a1226",
      surfaceElevated: "#121e3d",
      action: "#38BDF8",
      actionHover: "#7DD3FC",
      secondary: "#3B82F6",
      textPrimary: "#F0F9FF",
      textSecondary: "#93C5FD",
      border: "rgba(56, 189, 248, 0.24)",
      glow: "rgba(56, 189, 248, 0.38)",
    },
    typography: {
      headingFont: "Space Grotesk / Sora",
      bodyFont: "Plus Jakarta Sans",
      headingStyle: "uppercase tracking-normal font-extrabold",
      accentFont: "JetBrains Mono",
    },
    characteristics: [
      "Deep oceanic navy midnight foundation illuminated by sky-sapphire cyan",
      "Evokes clear summer festival nights under starry open skies",
      "Cool acoustic ballads and soaring melodic guitar solos",
      "Exceptional 12.1:1 legibility with crisp cyan focus indicators",
    ],
    contrastRatio: "12.1:1 (WCAG AAA)",
  },
  amber: {
    id: "amber",
    number: "09",
    name: "Molten Amber",
    tagline: "Pyrotechnic Flame Sparks & Vulcan Arena Blast",
    era: "Stadium Stage Fireworks & Roaring Encores",
    category: "Signature & Arena",
    themeClass: "theme-amber",
    colors: {
      bg: "#0d0803",
      surface: "#1a1005",
      surfaceElevated: "#2c1b08",
      action: "#FF9F1C",
      actionHover: "#FFB74D",
      secondary: "#FF5722",
      textPrimary: "#FFF8E1",
      textSecondary: "#FFE082",
      border: "rgba(255, 159, 28, 0.28)",
      glow: "rgba(255, 159, 28, 0.45)",
    },
    typography: {
      headingFont: "Bebas Neue / Anton",
      bodyFont: "Inter UI",
      headingStyle: "uppercase tracking-wider font-black",
      accentFont: "Inter SemiBold",
    },
    characteristics: [
      "Charred coal foundation ignited by blazing magma amber and flame sparks",
      "Captures the visceral heat of stadium flame cannons and pyrotechnic bombs",
      "High-voltage warmth and relentless rock power chords",
      "10.4:1 contrast ratio delivering unmissable call-to-actions",
    ],
    contrastRatio: "10.4:1 (WCAG AAA)",
  },
  synthwave: {
    id: "synthwave",
    number: "10",
    name: "Acid Synthwave",
    tagline: "Outrun Retro Arcade & High-Contrast Toxic Glitch",
    era: "80s Cyber Turbo & Retrowave Nights",
    category: "Neon & Festival",
    themeClass: "theme-synthwave",
    colors: {
      bg: "#0a0414",
      surface: "#150826",
      surfaceElevated: "#240d40",
      action: "#39FF14",
      actionHover: "#66FF47",
      secondary: "#FF007F",
      textPrimary: "#FAFAFA",
      textSecondary: "#D8B4FE",
      border: "rgba(57, 255, 20, 0.30)",
      glow: "rgba(57, 255, 20, 0.50)",
    },
    typography: {
      headingFont: "Righteous / Orbitron",
      bodyFont: "Space Grotesk",
      headingStyle: "uppercase tracking-widest font-black",
      accentFont: "JetBrains Mono",
    },
    characteristics: [
      "Deep space purple baseline sliced open by neon toxic lime and hot pink",
      "Nostalgic 1980s synthesizer rock meets retro-futuristic arcade aesthetics",
      "Piercing neon contrast engineered for festival night mode",
      "Ultra-high 14.2:1 contrast ratio that commands immediate attention",
    ],
    contrastRatio: "14.2:1 (WCAG AAA)",
  },
  tokyo: {
    id: "tokyo",
    number: "11",
    name: "Tokyo Rain",
    tagline: "Wet Asphalt Reflections & Shinjuku Neon Signboards",
    era: "Akira Cyberpunk Night Walk",
    category: "Cyber & Tech",
    themeClass: "theme-tokyo",
    colors: {
      bg: "#06070a",
      surface: "#0e1017",
      surfaceElevated: "#161a24",
      action: "#FF2A6D",
      actionHover: "#FF598F",
      secondary: "#05D9E8",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
      border: "rgba(255, 42, 109, 0.25)",
      glow: "rgba(255, 42, 109, 0.42)",
    },
    typography: {
      headingFont: "Syne / Space Grotesk",
      bodyFont: "Inter UI",
      headingStyle: "uppercase tracking-wider font-extrabold",
      accentFont: "JetBrains Mono",
    },
    characteristics: [
      "Wet asphalt night grounds with vibrant cherry sakura neon reflections",
      "Rain-slicked city streets, anime cyber-rock, and electronic live synthesizers",
      "Dual-tone neon edges with glowing magenta borders and aqua halos",
      "9.1:1 AAA contrast with unforgettable urban energy",
    ],
    contrastRatio: "9.1:1 (WCAG AAA)",
  },
  velvet: {
    id: "velvet",
    number: "12",
    name: "Velvet Lounge",
    tagline: "Speakeasy Green Room & Intimate VIP Backstage",
    era: "Vintage Velvet Curtain & Bourbon Smoke",
    category: "Atmospheric & Moody",
    themeClass: "theme-velvet",
    fontFamilyCss: "Georgia, serif",
    colors: {
      bg: "#0d050a",
      surface: "#1a0914",
      surfaceElevated: "#2a0f21",
      action: "#E0A96D",
      actionHover: "#F0C495",
      secondary: "#9D4EDD",
      textPrimary: "#FDF4F5",
      textSecondary: "#D1B2C8",
      border: "rgba(224, 169, 109, 0.25)",
      glow: "rgba(224, 169, 109, 0.32)",
    },
    typography: {
      headingFont: "Cinzel / Playfair",
      bodyFont: "Plus Jakarta Sans",
      headingStyle: "uppercase tracking-widest font-semibold",
      accentFont: "Cormorant Garamond",
    },
    characteristics: [
      "Intimate bordeaux plum velvet backroom illuminated by antique rose gold",
      "Moody acoustic after-parties, leather lounge chairs, and vintage vinyl",
      "Subtle, low-reflection surfaces that feel luxurious and exclusive",
      "10.2:1 warm metallic contrast with zero visual fatigue",
    ],
    contrastRatio: "10.2:1 (WCAG AAA)",
  },
  solar: {
    id: "solar",
    number: "13",
    name: "Solar Flare",
    tagline: "High-Noon Outdoor Summer Fest & Blinding Voltage",
    era: "Midwest Mega-Festivals & Blazing Mainstage",
    category: "Neon & Festival",
    themeClass: "theme-solar",
    colors: {
      bg: "#080808",
      surface: "#141414",
      surfaceElevated: "#202020",
      action: "#FFE600",
      actionHover: "#FFF04D",
      secondary: "#FF6D00",
      textPrimary: "#FFFFFF",
      textSecondary: "#D4D4D8",
      border: "rgba(255, 230, 0, 0.30)",
      glow: "rgba(255, 230, 0, 0.45)",
    },
    typography: {
      headingFont: "Anton / Impact",
      bodyFont: "Inter UI",
      headingStyle: "uppercase tracking-normal font-black",
      accentFont: "Inter Bold",
    },
    characteristics: [
      "Extreme high-visibility pure solar yellow on jet black carbon surfaces",
      "Engineered for maximum legibility in outdoor bright light and sunlit festival grounds",
      "Hazard tape adrenaline and electric shock stage presence",
      "Sensational 16.5:1 contrast score surpassing every accessibility threshold",
    ],
    contrastRatio: "16.5:1 (WCAG AAA)",
  },
  phantom: {
    id: "phantom",
    number: "14",
    name: "Ghost Phantom",
    tagline: "Gothic Ethereal Mist & Silver Phosphor Glow",
    era: "Symphonic Rock & Midnight Arena Ballads",
    category: "Atmospheric & Moody",
    themeClass: "theme-phantom",
    colors: {
      bg: "#06080a",
      surface: "#0c1015",
      surfaceElevated: "#141a22",
      action: "#2DD4BF",
      actionHover: "#5EEAD4",
      secondary: "#94A3B8",
      textPrimary: "#F8FAFC",
      textSecondary: "#CBD5E1",
      border: "rgba(45, 212, 191, 0.24)",
      glow: "rgba(45, 212, 191, 0.38)",
    },
    typography: {
      headingFont: "Cormorant / Syne",
      bodyFont: "Inter UI",
      headingStyle: "uppercase tracking-widest font-bold",
      accentFont: "JetBrains Mono",
    },
    characteristics: [
      "Phantom teal phosphor glows emerging from dark midnight mist",
      "Ghostly symphonic keyboards, dramatic rock overtures, and gothic arena fog",
      "Silvery metallic filigree borders with translucent glass elements",
      "12.6:1 AAA contrast delivering serene yet mysterious impact",
    ],
    contrastRatio: "12.6:1 (WCAG AAA)",
  },
  copper: {
    id: "copper",
    number: "15",
    name: "Copper & Patina",
    tagline: "Industrial Warehouse Grunge & Hand-Forged Gear",
    era: "Steampunk Amp Enclosures & Chicago Industrial Roots",
    category: "Vintage & Heritage",
    themeClass: "theme-copper",
    colors: {
      bg: "#0b0907",
      surface: "#17130e",
      surfaceElevated: "#251e16",
      action: "#F59E0B",
      actionHover: "#FBBF24",
      secondary: "#14B8A6",
      textPrimary: "#FFFBEB",
      textSecondary: "#D5C3B3",
      border: "rgba(245, 158, 11, 0.26)",
      glow: "rgba(245, 158, 11, 0.35)",
    },
    typography: {
      headingFont: "Bebas / Oswald",
      bodyFont: "Plus Jakarta Sans",
      headingStyle: "uppercase tracking-wider font-extrabold",
      accentFont: "Switzer",
    },
    characteristics: [
      "Raw forged copper buttons paired with oxidized verdigris patina accents",
      "Handmade vacuum-tube amplifiers, steel guitar slides, and gritty warehouse sound",
      "Earthy, tactile warmth with authentic industrial texture",
      "11.2:1 contrast with vintage craftsman charm",
    ],
    contrastRatio: "11.2:1 (WCAG AAA)",
  },
  nebula: {
    id: "nebula",
    number: "16",
    name: "Galactic Nebula",
    tagline: "Deep Cosmos Ultraviolet & Starlight Supernova",
    era: "Progressive Space Rock & Laser Planetarium",
    category: "Atmospheric & Moody",
    themeClass: "theme-nebula",
    colors: {
      bg: "#05020a",
      surface: "#0e0618",
      surfaceElevated: "#180b29",
      action: "#C084FC",
      actionHover: "#D8B4FE",
      secondary: "#60A5FA",
      textPrimary: "#FAF5FF",
      textSecondary: "#C084FC",
      border: "rgba(192, 132, 252, 0.26)",
      glow: "rgba(192, 132, 252, 0.40)",
    },
    typography: {
      headingFont: "Orbitron / Syne",
      bodyFont: "Space Grotesk",
      headingStyle: "uppercase tracking-widest font-extrabold",
      accentFont: "JetBrains Mono",
    },
    characteristics: [
      "Infinitely deep purple void dusted with supernova lilac and cosmic blue rays",
      "Progressive synthesizer epics, sprawling guitar odysseys, and laser sky shows",
      "Celestial gradients that shift smoothly between ultraviolet and starlight",
      "11.0:1 AAA contrast with an otherworldly ethereal aura",
    ],
    contrastRatio: "11.0:1 (WCAG AAA)",
  },
  acoustic: {
    id: "acoustic",
    number: "17",
    name: "Golden Hour Acoustic",
    tagline: "Intimate Storytelling, Warm Cedar & Honey Amber",
    era: "Unplugged Live Session & Sunset Acoustic Set",
    category: "Vintage & Heritage",
    themeClass: "theme-acoustic",
    fontFamilyCss: "Georgia, serif",
    colors: {
      bg: "#0d0905",
      surface: "#1a1309",
      surfaceElevated: "#281e0e",
      action: "#FBBF24",
      actionHover: "#FCD34D",
      secondary: "#EA580C",
      textPrimary: "#FFFDF5",
      textSecondary: "#D4BFA7",
      border: "rgba(251, 191, 36, 0.24)",
      glow: "rgba(251, 191, 36, 0.32)",
    },
    typography: {
      headingFont: "Fraunces / Editorial Serif",
      bodyFont: "Plus Jakarta Sans",
      headingStyle: "normal-case font-serif tracking-tight font-bold",
      accentFont: "Switzer",
    },
    characteristics: [
      "Warm cedar wood grain and honey amber lighting from intimate unplugged stages",
      "Storytelling warmth, raw acoustic guitars, and heartfelt vocals",
      "Natural organic materials, parchment badges, and gentle fireside glows",
      "12.9:1 contrast with relaxing, acoustic intimacy",
    ],
    contrastRatio: "12.9:1 (WCAG AAA)",
  },
  brutalist: {
    id: "brutalist",
    number: "18",
    name: "Brutalist Raw",
    tagline: "Monospace Xerox Zine & Underground Gig Flyer",
    era: "Punk DIY Club Flyer & Stark Industrial Grid",
    category: "Studio & Minimal",
    themeClass: "theme-brutalist",
    fontFamilyCss: "ui-monospace, monospace",
    colors: {
      bg: "#000000",
      surface: "#0c0c0c",
      surfaceElevated: "#181818",
      action: "#FACC15",
      actionHover: "#FDE047",
      secondary: "#FFFFFF",
      textPrimary: "#FFFFFF",
      textSecondary: "#A3A3A3",
      border: "rgba(255, 255, 255, 0.35)",
      glow: "rgba(250, 204, 21, 0.45)",
    },
    typography: {
      headingFont: "Space Mono / JetBrains",
      bodyFont: "Space Mono",
      headingStyle: "uppercase tracking-normal font-mono font-bold",
      accentFont: "Space Mono",
    },
    characteristics: [
      "Raw, uncompromising pitch black foundation with sharp industrial grid lines",
      "Photocopied fanzine energy, hazard yellow stickers, and zero decorative fluff",
      "Brutalist utilitarian layout inspired by CBGB underground gig posters",
      "Massive 15.8:1 legibility ratio with stark monochrome authority",
    ],
    contrastRatio: "15.8:1 (WCAG AAA)",
  },
  bioluminescent: {
    id: "bioluminescent",
    number: "19",
    name: "Bioluminescence",
    tagline: "Abyssal Deep Trench & Electric Oceanic Glow",
    era: "Electronic Rock Fusion & Projection Dome",
    category: "Cyber & Tech",
    themeClass: "theme-bioluminescent",
    colors: {
      bg: "#02070d",
      surface: "#04101c",
      surfaceElevated: "#081d33",
      action: "#06D6A0",
      actionHover: "#38EFC1",
      secondary: "#4361EE",
      textPrimary: "#F0FDFA",
      textSecondary: "#99F6E4",
      border: "rgba(6, 214, 160, 0.26)",
      glow: "rgba(6, 214, 160, 0.44)",
    },
    typography: {
      headingFont: "Syne / Orbitron",
      bodyFont: "Inter UI",
      headingStyle: "uppercase tracking-wider font-extrabold",
      accentFont: "JetBrains Mono",
    },
    characteristics: [
      "Sub-surface trench darkness pierced by bioluminescent electric teal rays",
      "Synthesizer arpeggios, stadium projection mapping, and deep sub-bass",
      "Aquatic depth and fluid glowing borders with cyan-blue refraction",
      "13.1:1 AAA contrast providing unmatched aquatic freshness",
    ],
    contrastRatio: "13.1:1 (WCAG AAA)",
  },
  royal: {
    id: "royal",
    number: "20",
    name: "Royal Imperial",
    tagline: "Rock Royalty Headline Arena & Sovereign Throne",
    era: "Crown Stadium Tour & Diamond Commemorative Edition",
    category: "Signature & Arena",
    themeClass: "theme-royal",
    colors: {
      bg: "#080310",
      surface: "#120722",
      surfaceElevated: "#1e0c38",
      action: "#F59E0B",
      actionHover: "#FBBF24",
      secondary: "#A855F7",
      textPrimary: "#FFFDF7",
      textSecondary: "#DDD6FE",
      border: "rgba(245, 158, 11, 0.30)",
      glow: "rgba(245, 158, 11, 0.45)",
    },
    typography: {
      headingFont: "Cinzel / Anton",
      bodyFont: "Plus Jakarta Sans",
      headingStyle: "uppercase tracking-widest font-black",
      accentFont: "Cormorant",
    },
    characteristics: [
      "Imperial purple velvet foundation illuminated by 24k sovereign crown gold",
      "Grand stadium headliner status, orchestral brass, and coronation fireworks",
      "Filigree gold border trims and rich regal atmosphere",
      "11.5:1 WCAG AAA contrast ratio fit for rock royalty",
    ],
    contrastRatio: "11.5:1 (WCAG AAA)",
  },
};

const UXPILOT_SCREENS = [
  {
    id: "eH0VsrK0xaPuXxGEDkTk",
    step: 1,
    badge: "Step 01",
    title: "Planner & Contact Details",
    description: "Deep obsidian canvas with warm rock-gold accents (#f5b942), frosted glass cards (12px blur), and clean input fields.",
    previewUrl: "https://storage.googleapis.com/uxpilot-auth.appspot.com/screenshots/4b431e220c-a03338ed7bf8a62f906f.png",
    dimensions: "1440 × 1348 px",
    keyFeatures: [
      "Dual-column layout with sticky booking recap",
      "Glassmorphic input fields with gold focus rings",
      "Live band hero photo card with subtle gradient overlay",
    ],
  },
  {
    id: "LL1JPEOqiAcOgmf0MHgJ",
    step: 2,
    badge: "Step 02",
    title: "Interactive Timeline & Scheduling",
    description: "Load-in milestones, soundcheck scheduling, stage set times, and instant pricing quote calculation.",
    previewUrl: "https://storage.googleapis.com/uxpilot-auth.appspot.com/screenshots/44a4e9604d-4932c4fb1de61ad4d830.png",
    dimensions: "1440 × 2584 px",
    keyFeatures: [
      "Multi-milestone schedule blocks with time badges",
      "Production load-in & soundcheck calculators",
      "Sticky summary card updating in real time",
    ],
  },
  {
    id: "GmHjAT7xxwnMe8q091Jo",
    step: 3,
    badge: "Step 03",
    title: "Venue Logistics & Production Signoff",
    description: "Stage power, audio specs, lighting truss requirements, contract signoff, and final booking submission.",
    previewUrl: "https://storage.googleapis.com/uxpilot-auth.appspot.com/screenshots/d52955c34d-12e8fd35ddba8189e779.png",
    dimensions: "1440 × 1769 px",
    keyFeatures: [
      "Technical rider checklist & audio specifications",
      "Standard venue power requirements breakdown",
      "One-click contract approval & booking submission",
    ],
  },
];

export default function DesignSystemsLabClient() {
  const [selectedSystem, setSelectedSystem] = useState<SystemId>("nocturne");
  const [activeTab, setActiveTab] = useState<"showcase" | "battle" | "tokens" | "uxpilot">("showcase");
  const [selectedCategory, setSelectedCategory] = useState<SystemCategory>("All");
  const [battleCategory, setBattleCategory] = useState<SystemCategory>("All");
  const [matrixCategory, setMatrixCategory] = useState<SystemCategory>("All");
  const [matrixSearch, setMatrixSearch] = useState<string>("");
  const [selectedUxPilotScreen, setSelectedUxPilotScreen] = useState<string | null>(null);
  const [interactiveBookingStep, setInteractiveBookingStep] = useState<1 | 2 | 3>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoToggle1, setDemoToggle1] = useState(true);
  const [demoToggle2, setDemoToggle2] = useState(false);
  const [currentAtmosphere, setCurrentAtmosphere] = useState<AtmosphereSettings["presetId"]>("noir");
  const [currentGlow, setCurrentGlow] = useState<number>(0.60);

  const handleApplyAtmosphere = (id: AtmosphereSettings["presetId"]) => {
    setCurrentAtmosphere(id);
    const p = ATMOSPHERE_PRESETS[id].settings;
    applyAtmosphere(p);
    try {
      localStorage.setItem("7h_atmosphere_v1", JSON.stringify(p));
    } catch {}
  };

  const handleSliderGlow = (val: number) => {
    setCurrentGlow(val);
    const p = { ...ATMOSPHERE_PRESETS[currentAtmosphere].settings, ambientOpacity: val };
    applyAtmosphere(p);
    try {
      localStorage.setItem("7h_atmosphere_v1", JSON.stringify(p));
    } catch {}
  };

  const sys = SYSTEMS[selectedSystem];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const visibleHeaderSystems = (Object.keys(SYSTEMS) as SystemId[]).filter(
    (id) => selectedCategory === "All" || SYSTEMS[id].category === selectedCategory
  );

  return (
    <main id="main-content" className="min-h-screen bg-[#07050b] text-white selection:bg-amber-400 selection:text-black">
      {/* ── Page Header / Hero ── */}
      <header className="relative pt-24 pb-12 border-b border-white/10 overflow-hidden bg-gradient-to-b from-[#160b24] to-[#07050b]">
        <div className="site-container relative z-10 flex flex-col items-start gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-zinc-300 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Living Multi-System Laboratory
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              20 Distinct Brand Directions
            </span>
          </div>

          <h1 className="font-heading text-display leading-tight text-white tracking-normal uppercase">
            7th Heaven Design System Lab
          </h1>

          <p className="max-w-3xl text-body text-zinc-300 leading-relaxed text-pretty">
            Explore twenty radically distinct, world-class design systems and color layouts engineered specifically for the 7th Heaven brand.
            Filter by aesthetic category, switch systems on the fly to inspect live color palettes, typography pairings, interactive components, and real site features.
          </p>

          {/* System Selection Bar */}
          <div className="w-full pt-4 flex flex-col gap-4 border-t border-white/10">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const count =
                  cat === "All"
                    ? Object.keys(SYSTEMS).length
                    : Object.values(SYSTEMS).filter((s) => s.category === cat).length;
                const isCatActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isCatActive
                        ? "bg-amber-400 text-black shadow-md font-bold"
                        : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isCatActive ? "bg-black/30 text-black" : "bg-white/10 text-zinc-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 20 System Switcher Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 w-full" role="tablist" aria-label="Design System Selection">
              {visibleHeaderSystems.map((id) => {
                const s = SYSTEMS[id];
                const active = selectedSystem === id;
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedSystem(id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      active
                        ? "bg-white/15 border-white/40 shadow-xl shadow-purple-950/40 text-white"
                        : "bg-black/30 border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 bg-[var(--dot-bg)] shadow-[0_0_8px_var(--dot-glow)]"
                      style={{
                        "--dot-bg": s.colors.action,
                        "--dot-glow": s.colors.glow,
                      } as React.CSSProperties}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold">{s.number}</span>
                        <span className="text-xs font-bold text-white tracking-wide truncate">{s.name}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{s.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-zinc-400">
                Viewing: <span className="font-bold text-white">#{sys.number} {sys.name}</span> • {sys.era}
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-full self-start md:self-auto">
              {[
                { id: "showcase", label: "Showcase", icon: Sparkles },
                { id: "battle", label: "Side-by-Side Battle (20)", icon: Sliders },
                { id: "tokens", label: "Tokens & CSS", icon: Code },
                { id: "uxpilot", label: "UX Pilot System", icon: Compass },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      active
                        ? "bg-white text-black shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Copy Toast */}
      {copiedKey && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black font-bold text-xs shadow-2xl animate-[fadeIn_0.2s_ease-out]">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Copied {copiedKey} to clipboard!</span>
        </div>
      )}

      {/* ── VIEW MODE 1: SHOWCASE ── */}
      {activeTab === "showcase" && (
        <div className="flex flex-col gap-12 py-12">
          {/* Active System Banner */}
          <PageSection size="none">
            <div
              className="site-container p-6 sm:p-8 rounded-[var(--radius-box)] border transition-all"
              style={{
                backgroundColor: sys.colors.surface,
                borderColor: sys.colors.border,
                boxShadow: `0 20px 50px -10px ${sys.colors.glow}`,
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${sys.colors.action}20`,
                        color: sys.colors.action,
                        border: `1px solid ${sys.colors.action}40`,
                      }}
                    >
                      Active Exploration
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">{sys.contrastRatio}</span>
                  </div>
                  <h2
                    className={`text-3xl sm:text-4xl text-white ${sys.typography.headingStyle}`}
                    style={{
                      fontFamily: sys.fontFamilyCss,
                    }}
                  >
                    {sys.name}
                  </h2>
                  <p className="text-sm text-zinc-300 leading-relaxed">{sys.tagline}</p>
                </div>

                <div className="flex flex-wrap gap-2 lg:max-w-md">
                  {sys.characteristics.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-zinc-300 p-2.5 rounded-xl bg-black/30 border border-white/5 w-full"
                    >
                      <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: sys.colors.action }} />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PageSection>

          {/* 1. Palette & Contrast Matrix */}
          <PageSection id="palette" size="sm" aria-labelledby="palette-heading">
            <SectionHeader
              id="palette-heading"
              title="1. Color Palette & Surface Hierarchy"
              subtitle={`Curated token hierarchy for ${sys.name} with verified WCAG AAA accessibility`}
            />
            <Stack gap="md">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Base Canvas", val: sys.colors.bg, role: "Site background foundation" },
                  { label: "Surface Layer", val: sys.colors.surface, role: "Cards and module fills" },
                  { label: "Elevated Surface", val: sys.colors.surfaceElevated, role: "Hover and nested elements" },
                  { label: "Primary Action", val: sys.colors.action, role: "Primary interactive triggers" },
                  { label: "Secondary Neon", val: sys.colors.secondary, role: "Glow stops and accents" },
                  { label: "Text Primary", val: sys.colors.textPrimary, role: "Headlines and high contrast" },
                ].map((swatch) => (
                  <div
                    key={swatch.label}
                    onClick={() => handleCopy(swatch.val, swatch.label)}
                    className="group cursor-pointer flex flex-col p-3 rounded-2xl border border-white/10 bg-black/40 hover:border-white/30 transition-all"
                  >
                    <div
                      className="w-full h-16 rounded-xl border border-white/10 mb-2 relative overflow-hidden flex items-end justify-end p-1.5 bg-[var(--swatch-val)]"
                      style={{ "--swatch-val": swatch.val } as React.CSSProperties}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 p-1 rounded-md text-white">
                        <Copy className="w-3 h-3" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white">{swatch.label}</span>
                    <span className="text-[11px] font-mono text-zinc-400">{swatch.val}</span>
                    <span className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{swatch.role}</span>
                  </div>
                ))}
              </div>

              {/* Color Layout Matrix: Compare All 20 Systems */}
              <div className="mt-4 p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-sm font-bold uppercase tracking-wider text-white">
                        All 20 Design Systems &amp; Color Layouts Matrix
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        Interactive matrix comparing all 20 curated palettes with verified WCAG AAA contrast ratios
                      </p>
                    </div>
                  </div>

                  {/* Search and Category Filter for Matrix */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search 20 systems..."
                        value={matrixSearch}
                        onChange={(e) => setMatrixSearch(e.target.value)}
                        className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Matrix Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => {
                    const count =
                      cat === "All"
                        ? Object.keys(SYSTEMS).length
                        : Object.values(SYSTEMS).filter((s) => s.category === cat).length;
                    const isCatActive = matrixCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setMatrixCategory(cat)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          isCatActive
                            ? "bg-white text-black font-bold"
                            : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[9px] opacity-70 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Matrix Rows List */}
                <div className="grid grid-cols-1 gap-2.5 max-h-[700px] overflow-y-auto pr-1">
                  {(Object.keys(SYSTEMS) as SystemId[])
                    .filter((id) => {
                      const s = SYSTEMS[id];
                      const matchesCat = matrixCategory === "All" || s.category === matrixCategory;
                      const matchesSearch =
                        !matrixSearch ||
                        s.name.toLowerCase().includes(matrixSearch.toLowerCase()) ||
                        s.tagline.toLowerCase().includes(matrixSearch.toLowerCase()) ||
                        s.category.toLowerCase().includes(matrixSearch.toLowerCase());
                      return matchesCat && matchesSearch;
                    })
                    .map((id) => {
                      const s = SYSTEMS[id];
                      const isSelected = selectedSystem === id;
                      return (
                        <div
                          key={id}
                          onClick={() => setSelectedSystem(id)}
                          className={`p-3.5 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-white/10 border-white/40 shadow-lg text-white"
                              : "bg-black/30 border-white/5 hover:border-white/20 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {/* System Identity & Number */}
                          <div className="flex items-center gap-3 min-w-[240px]">
                            <span className="text-xs font-mono font-bold text-zinc-400">{s.number}</span>
                            <div
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-[var(--swatch-bg)] shadow-[0_0_8px_var(--swatch-glow)]"
                              style={{
                                "--swatch-bg": s.colors.action,
                                "--swatch-glow": s.colors.glow,
                              } as React.CSSProperties}
                            />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{s.name}</span>
                                {isSelected && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-black">
                                    Live
                                  </span>
                                )}
                                <span className="px-1.5 py-0.2 rounded-md text-[9px] bg-white/10 text-zinc-300">
                                  {s.category}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">{s.contrastRatio}</div>
                            </div>
                          </div>

                          {/* Color Chips Strip */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-mono">
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-[var(--chip-bg)]"
                                style={{ "--chip-bg": s.colors.bg } as React.CSSProperties}
                              />
                              <span className="text-zinc-400">Base: {s.colors.bg}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-mono">
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-[var(--chip-surface)]"
                                style={{ "--chip-surface": s.colors.surface } as React.CSSProperties}
                              />
                              <span className="text-zinc-400">Surface: {s.colors.surface}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-mono">
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-[var(--chip-action)]"
                                style={{ "--chip-action": s.colors.action } as React.CSSProperties}
                              />
                              <span className="text-white font-bold">Action: {s.colors.action}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-mono">
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-[var(--chip-sec)]"
                                style={{ "--chip-sec": s.colors.secondary } as React.CSSProperties}
                              />
                              <span className="text-zinc-300">Accent: {s.colors.secondary}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-mono">
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-[var(--chip-text)]"
                                style={{ "--chip-text": s.colors.textPrimary } as React.CSSProperties}
                              />
                              <span className="text-zinc-400">Text: {s.colors.textPrimary}</span>
                            </div>
                          </div>

                          {/* Action CTA */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSystem(id);
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                isSelected
                                  ? "bg-white text-black font-bold"
                                  : "bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/10"
                              }`}
                            >
                              {isSelected ? "Active System" : "Preview System"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </Stack>
          </PageSection>

          {/* 2. Interactive Component Kitchen Sink */}
          <PageSection id="components" size="sm" aria-labelledby="components-heading">
            <SectionHeader
              id="components-heading"
              title="2. Interactive UI Component Kitchen Sink"
              subtitle={`Test how real controls respond under the ${sys.name} design system`}
            />
            <Stack gap="md">
              <div
                className="p-6 sm:p-8 rounded-[var(--radius-box)] border transition-all"
                style={{
                  backgroundColor: sys.colors.surface,
                  borderColor: sys.colors.border,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Buttons */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Action Triggers</h3>
                    <div className="flex flex-col gap-2.5">
                      <button
                        className="w-full py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                        style={{
                          backgroundColor: sys.colors.action,
                          color: selectedSystem === "laser" ? "#000000" : "#120817",
                          boxShadow: `0 4px 14px ${sys.colors.glow}`,
                        }}
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Primary Action Button</span>
                      </button>

                      <button
                        className="w-full py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider transition-all border flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: `${sys.colors.secondary}20`,
                          borderColor: `${sys.colors.secondary}50`,
                          color: sys.colors.textPrimary,
                        }}
                      >
                        <Sparkles className="w-4 h-4" style={{ color: sys.colors.secondary }} />
                        <span>Secondary Accent Button</span>
                      </button>

                      <button className="w-full py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider transition-all border border-white/15 bg-black/30 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center gap-2">
                        <span>Ghost Outline Button</span>
                      </button>
                    </div>
                  </div>

                  {/* Toggles & Badges */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Toggles & Status Badges</h3>
                    <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-black/30 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-300 font-medium">Concert SMS VIP Alerts</span>
                        <Toggle size="sm" checked={demoToggle1} onChange={setDemoToggle1} id="toggle-sms-lab" />
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-xs text-zinc-300 font-medium">Auto-Play Live Stream Audio</span>
                        <Toggle size="sm" checked={demoToggle2} onChange={setDemoToggle2} id="toggle-stream-lab" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${sys.colors.action}20`,
                          color: sys.colors.action,
                          border: `1px solid ${sys.colors.action}40`,
                        }}
                      >
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>Live On Stage</span>
                      </span>

                      <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Sold Out
                      </span>

                      <span
                        className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"
                        style={{
                          backgroundColor: `${sys.colors.secondary}20`,
                          color: sys.colors.textPrimary,
                          border: `1px solid ${sys.colors.secondary}40`,
                        }}
                      >
                        <Flame className="w-3 h-3" style={{ color: sys.colors.secondary }} />
                        <span>40th Anniversary</span>
                      </span>
                    </div>
                  </div>

                  {/* Audio Card Widget */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Media & Equalizer Widget</h3>
                    <div
                      className="p-4 rounded-2xl border flex flex-col gap-3 transition-all"
                      style={{
                        backgroundColor: sys.colors.surfaceElevated,
                        borderColor: sys.colors.border,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95"
                            style={{
                              backgroundColor: sys.colors.action,
                              color: "#000",
                              boxShadow: `0 0 12px ${sys.colors.glow}`,
                            }}
                            aria-label={isPlaying ? "Pause track" : "Play track"}
                          >
                            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                          </button>
                          <div>
                            <div className="text-xs font-bold text-white">Sing (Official Single)</div>
                            <div className="text-[10px] text-zinc-400">7th Heaven • Billboard Hit</div>
                          </div>
                        </div>
                        <Disc className={`w-6 h-6 text-zinc-500 ${isPlaying ? "animate-spin text-amber-300" : ""}`} />
                      </div>

                      {/* Equalizer Bars Simulation */}
                      <div className="flex items-end justify-between h-8 gap-1 px-1 bg-black/40 rounded-lg p-1.5">
                        {[40, 75, 55, 90, 65, 80, 45, 95, 70, 85, 50, 60, 90, 75, 40].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm transition-all"
                            style={{
                              height: isPlaying ? `${Math.max(15, (h + (i % 3) * 10) % 100)}%` : "20%",
                              backgroundColor: i % 2 === 0 ? sys.colors.action : sys.colors.secondary,
                              opacity: isPlaying ? 0.9 : 0.4,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Stack>
          </PageSection>

          {/* 3. Live Simulated Site Feature Slices */}
          <PageSection id="slices" size="sm" aria-labelledby="slices-heading">
            <SectionHeader
              id="slices-heading"
              title="3. Live Feature Slices: Real Website Sections"
              subtitle={`Preview an entire upcoming tour date card and headline teaser styled in ${sys.name}`}
            />
            <Stack gap="md">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Hero Announcement Slice (7 cols) */}
                <div
                  className="lg:col-span-7 p-6 sm:p-8 rounded-[var(--radius-box)] border flex flex-col justify-between gap-6 relative overflow-hidden"
                  style={{
                    backgroundColor: sys.colors.surface,
                    borderColor: sys.colors.border,
                    boxShadow: `0 20px 40px -15px ${sys.colors.glow}`,
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${sys.colors.action}25`,
                          color: sys.colors.action,
                        }}
                      >
                        40 Years of Rock & Roll
                      </span>
                      <span className="text-xs text-zinc-400">Midwest Tour 2025/2026</span>
                    </div>

                    <h2
                      className={`text-3xl sm:text-5xl text-white ${sys.typography.headingStyle}`}
                      style={{
                        fontFamily: sys.fontFamilyCss,
                      }}
                    >
                      HIGH ENERGY ARENA ROCK
                    </h2>

                    <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed">
                      Chicago's premier rock band with #1 Billboard hits, the world-famous 30 Songs in 30 Minutes medley, and over 5,000 live shows.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-lg flex items-center gap-2"
                      style={{
                        backgroundColor: sys.colors.action,
                        color: selectedSystem === "laser" ? "#000" : "#120817",
                      }}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Explore 2026 Tour Dates</span>
                    </button>
                    <button className="px-5 py-2.5 rounded-full font-semibold text-xs transition-colors border border-white/15 bg-black/40 hover:bg-white/10 text-white">
                      <span>Watch Live Medley</span>
                    </button>
                  </div>
                </div>

                {/* Tour Date Card Slice (5 cols) */}
                <div
                  className="lg:col-span-5 p-6 rounded-[var(--radius-box)] border flex flex-col justify-between gap-5"
                  style={{
                    backgroundColor: sys.colors.surfaceElevated,
                    borderColor: sys.colors.border,
                  }}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Next Live Performance</span>
                      <h4 className="text-base font-bold text-white mt-0.5">Home Bar Chicago</h4>
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-xl text-center border"
                      style={{
                        backgroundColor: `${sys.colors.action}15`,
                        borderColor: `${sys.colors.action}30`,
                      }}
                    >
                      <div className="text-[10px] font-bold uppercase" style={{ color: sys.colors.action }}>OCT</div>
                      <div className="text-lg font-black text-white leading-none">30</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" style={{ color: sys.colors.action }} />
                      <span>Arlington Heights, IL • 21+ Over</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" style={{ color: sys.colors.action }} />
                      <span>Doors 7:00 PM • Showtime 8:30 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5" style={{ color: sys.colors.action }} />
                      <span>$15 General Admission • VIP Available</span>
                    </div>
                  </div>

                  <button
                    className="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                    style={{
                      backgroundColor: sys.colors.action,
                      color: selectedSystem === "laser" ? "#000" : "#120817",
                      boxShadow: `0 4px 12px ${sys.colors.glow}`,
                    }}
                  >
                    <span>Get Tickets Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Stack>
          </PageSection>

          {/* 4. Darker Ambient Gradient Explorations */}
          <PageSection id="gradients" size="sm" aria-labelledby="gradients-heading">
            <SectionHeader
              id="gradients-heading"
              title="4. Darker Ambient Gradient Presets & Real-Time Controller"
              subtitle="Toned-down moody backgrounds eliminating excessive purple brightness. Click any preset to apply it site-wide."
            />
            <Stack gap="md">
              <div className="p-6 sm:p-8 rounded-[var(--radius-box)] bg-[#0d0914] border border-white/10 flex flex-col gap-6">
                {/* 5 Preset Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {(Object.keys(ATMOSPHERE_PRESETS) as AtmosphereSettings["presetId"][]).map((key) => {
                    const preset = ATMOSPHERE_PRESETS[key];
                    const active = currentAtmosphere === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleApplyAtmosphere(key)}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all ${
                          active
                            ? "bg-white/15 border-amber-400 shadow-xl text-white"
                            : "bg-black/40 border-white/10 hover:border-white/25 text-zinc-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="w-6 h-6 rounded-full border border-white/20 bg-[var(--swatch-bg)] shadow-[0_0_10px_var(--swatch-glow)]"
                            style={{
                              "--swatch-bg": preset.settings.bgColor,
                              "--swatch-glow": preset.settings.ambientGrad1,
                            } as React.CSSProperties}
                          />
                          {active ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-black">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono">{preset.tag}</span>
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white line-clamp-1">{preset.name}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {preset.description}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span>Base: {preset.settings.bgColor}</span>
                          <span className="text-emerald-400 font-bold">Deep</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Inline Fine-Tuning Slider Bar */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 max-w-sm">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Adjust Background Glow Intensity</span>
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Dims the atmospheric radial lights from 0% (pure dark flat) to 100% (ambient concert light).
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-1 max-w-md">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={Math.round(currentGlow * 100)}
                      onChange={(e) => handleSliderGlow(Number(e.target.value) / 100)}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <span className="font-mono text-xs font-bold text-amber-300 w-12 text-right">
                      {Math.round(currentGlow * 100)}%
                    </span>
                  </div>

                  <button
                    onClick={() => handleApplyAtmosphere("noir")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Dark Reset</span>
                  </button>
                </div>
              </div>
            </Stack>
          </PageSection>
        </div>
      )}

      {/* ── VIEW MODE 2: SIDE-BY-SIDE BATTLE ── */}
      {activeTab === "battle" && (
        <PageSection size="md" aria-labelledby="battle-heading">
          <SectionHeader
            id="battle-heading"
            title="Side-by-Side System Comparison (20 Systems)"
            subtitle="Observe how the exact same Tour Date Card component renders across all 20 design systems simultaneously"
          />
          <Stack gap="lg">
            {/* Battle Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none site-container">
              {CATEGORIES.map((cat) => {
                const count =
                  cat === "All"
                    ? Object.keys(SYSTEMS).length
                    : Object.values(SYSTEMS).filter((s) => s.category === cat).length;
                const isCatActive = battleCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setBattleCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isCatActive
                        ? "bg-amber-400 text-black shadow-md font-bold"
                        : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isCatActive ? "bg-black/30 text-black" : "bg-white/10 text-zinc-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(Object.keys(SYSTEMS) as SystemId[])
                .filter((id) => battleCategory === "All" || SYSTEMS[id].category === battleCategory)
                .map((id) => {
                  const s = SYSTEMS[id];
                  return (
                    <div
                      key={id}
                      className="p-6 rounded-[var(--radius-box)] border flex flex-col justify-between gap-6 transition-all"
                      style={{
                        backgroundColor: s.colors.surface,
                        borderColor: s.colors.border,
                        boxShadow: `0 15px 35px -10px ${s.colors.glow}`,
                      }}
                    >
                      {/* Header Label */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            System {s.number} • {s.category}
                          </span>
                          <h4
                            className="text-lg font-bold text-white mt-0.5"
                            style={{ fontFamily: s.fontFamilyCss }}
                          >
                            {s.name}
                          </h4>
                        </div>
                        <div
                          className="w-3.5 h-3.5 rounded-full bg-[var(--dot-color)] shadow-[0_0_8px_var(--dot-glow)]"
                          style={{
                            "--dot-color": s.colors.action,
                            "--dot-glow": s.colors.glow,
                          } as React.CSSProperties}
                        />
                      </div>

                      {/* Venue & Date */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-400">OCTOBER 30</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${s.colors.action}20`,
                              color: s.colors.action,
                              border: `1px solid ${s.colors.action}40`,
                            }}
                          >
                            Tickets On Sale
                          </span>
                        </div>
                        <h3
                          className={`text-2xl text-white ${s.typography.headingStyle}`}
                          style={{ fontFamily: s.fontFamilyCss }}
                        >
                          HOME BAR CHICAGO
                        </h3>
                        <p className="text-xs text-zinc-300">Arlington Heights, IL • Doors at 7:00 PM</p>
                      </div>

                      {/* Stats Metric */}
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Contrast Ratio:</span>
                        <span className="font-mono font-bold text-emerald-400">{s.contrastRatio}</span>
                      </div>

                      {/* Primary Button */}
                      <button
                        onClick={() => {
                          setSelectedSystem(id);
                          setActiveTab("showcase");
                        }}
                        className="w-full py-3 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                        style={{
                          backgroundColor: s.colors.action,
                          color:
                            s.id === "laser" ||
                            s.id === "aurora" ||
                            s.id === "synthwave" ||
                            s.id === "solar" ||
                            s.id === "brutalist"
                              ? "#000"
                              : "#120817",
                          boxShadow: `0 4px 12px ${s.colors.glow}`,
                        }}
                      >
                        <span>Select {s.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </Stack>
        </PageSection>
      )}

      {/* ── VIEW MODE 3: TOKENS & CSS ── */}
      {activeTab === "tokens" && (
        <PageSection size="md" aria-labelledby="tokens-heading">
          <SectionHeader
            id="tokens-heading"
            title="Design Tokens & CSS Variables"
            subtitle={`Ready-to-use CSS tokens and Tailwind theme configuration for ${sys.name}`}
          />
          <Stack gap="md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CSS Custom Properties */}
              <div className="p-6 rounded-[var(--radius-box)] bg-black/50 border border-white/10 flex flex-col gap-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-bold text-white font-sans text-sm">CSS Custom Properties (:root)</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `:root {\n  --color-bg: ${sys.colors.bg};\n  --color-surface: ${sys.colors.surface};\n  --color-surface-elevated: ${sys.colors.surfaceElevated};\n  --color-action: ${sys.colors.action};\n  --color-action-hover: ${sys.colors.actionHover};\n  --color-secondary: ${sys.colors.secondary};\n  --color-text-primary: ${sys.colors.textPrimary};\n  --color-text-secondary: ${sys.colors.textSecondary};\n  --color-border: ${sys.colors.border};\n}`,
                        "CSS Variables",
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy CSS</span>
                  </button>
                </div>

                <pre className="text-zinc-300 overflow-x-auto p-4 rounded-xl bg-black/60 border border-white/5 leading-relaxed">
{`:root {
  /* ${sys.name} Design System Tokens */
  --color-bg: ${sys.colors.bg};
  --color-surface: ${sys.colors.surface};
  --color-surface-elevated: ${sys.colors.surfaceElevated};
  --color-action: ${sys.colors.action};
  --color-action-hover: ${sys.colors.actionHover};
  --color-secondary: ${sys.colors.secondary};
  --color-text-primary: ${sys.colors.textPrimary};
  --color-text-secondary: ${sys.colors.textSecondary};
  --color-border: ${sys.colors.border};
}`}
                </pre>
              </div>

              {/* Tailwind v4 Config Snippet */}
              <div className="p-6 rounded-[var(--radius-box)] bg-black/50 border border-white/10 flex flex-col gap-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-bold text-white font-sans text-sm">Tailwind CSS v4 @theme Directive</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `@theme {\n  --color-canvas: ${sys.colors.bg};\n  --color-surface: ${sys.colors.surface};\n  --color-action: ${sys.colors.action};\n  --color-secondary: ${sys.colors.secondary};\n}`,
                        "Tailwind Theme",
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Tailwind</span>
                  </button>
                </div>

                <pre className="text-zinc-300 overflow-x-auto p-4 rounded-xl bg-black/60 border border-white/5 leading-relaxed">
{`@theme {
  /* ${sys.name} Tailwind Colors */
  --color-canvas: ${sys.colors.bg};
  --color-surface: ${sys.colors.surface};
  --color-action: ${sys.colors.action};
  --color-secondary: ${sys.colors.secondary};
  --font-heading: "${sys.typography.headingFont}";
  --font-body: "${sys.typography.bodyFont}";
}`}
                </pre>
              </div>
            </div>
          </Stack>
        </PageSection>
      )}

      {/* ── VIEW MODE 4: UX PILOT SYSTEM & FLOW ── */}
      {activeTab === "uxpilot" && (
        <PageSection size="md" aria-labelledby="uxpilot-heading">
          <SectionHeader
            id="uxpilot-heading"
            title="UX Pilot Design System & High-Fidelity Flow"
            subtitle="Live MCP integration synced with the '7th Heaven Live Band' workspace and patched to the dark obsidian #07040b foundation."
          />
          <Stack gap="lg">
            {/* Top Bar: Connection & Canvas Link */}
            <div className="p-6 rounded-[var(--radius-box)] bg-gradient-to-r from-purple-950/40 via-black/80 to-amber-950/30 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    UX Pilot MCP Server Connected
                  </span>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-xs text-zinc-400">Page: Concert Booking &amp; Itinerary Flow</span>
                </div>
                <h3 className="text-xl font-anton uppercase tracking-wide text-white">
                  Concert Booking &amp; Itinerary System (v2.1)
                </h3>
                <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                  Engineered in UX Pilot with high-fidelity rock arena aesthetics. All 3 screens have been patched via the MCP to the new deep obsidian <code className="text-amber-300">#07040b</code> canvas, eliminating harsh purple blowout while retaining the warm gold <code className="text-amber-300">#f5b942</code> actions.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="https://uxpilot.ai/a/ui-design?page=H1jirzqSYLZePiSeWKdq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 shadow-[0_0_20px_rgba(245,185,66,0.35)] flex items-center gap-2"
                >
                  <span>Open UX Pilot Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* UX Pilot Token Architecture */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Root Canvas</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-[#07040b] shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                  <span className="font-mono text-xs text-white font-bold">#07040b</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">Patched to Dark Obsidian</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Signature Action</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-[#f5b942] shadow-[0_0_8px_rgba(245,185,66,0.5)]" />
                  <span className="font-mono text-xs text-white font-bold">#f5b942</span>
                </div>
                <span className="text-[10px] text-amber-300 font-medium">Warm Rock Gold</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Atmospheric Violet</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-[#3d1b4d] shadow-[0_0_8px_rgba(61,27,77,0.5)]" />
                  <span className="font-mono text-xs text-white font-bold">#3d1b4d</span>
                </div>
                <span className="text-[10px] text-purple-300 font-medium">Stage Light Cone</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Glassmorphism Card</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md" />
                  <span className="font-mono text-xs text-white font-bold">12px blur</span>
                </div>
                <span className="text-[10px] text-zinc-300 font-medium">rgba(255,255,255,0.05)</span>
              </div>
            </div>

            {/* High-Fidelity Screens Gallery */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-anton uppercase tracking-wide text-white">
                    Generated High-Fidelity Flow Screens
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Click any screen to view full resolution inspection.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-500">3 of 3 screens synchronized</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {UXPILOT_SCREENS.map((screen) => (
                  <div
                    key={screen.id}
                    className="p-5 rounded-[var(--radius-box)] bg-black/50 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-black">
                          {screen.badge}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">{screen.dimensions}</span>
                      </div>

                      <h5 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                        {screen.title}
                      </h5>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {screen.description}
                      </p>

                      {/* Screen Thumbnail Preview */}
                      <div
                        onClick={() => setSelectedUxPilotScreen(screen.previewUrl)}
                        className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/80 aspect-[16/10] cursor-pointer group/img"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={screen.previewUrl}
                          alt={screen.title}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                          <span className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 shadow-xl">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Inspect Full Res</span>
                          </span>
                        </div>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-1.5 pt-2 border-t border-white/5">
                        {screen.keyFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-zinc-300">
                            <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => setSelectedUxPilotScreen(screen.previewUrl)}
                      className="w-full py-2.5 px-4 rounded-xl border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Zoom Screen Preview</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Interactive Booking Component Re-creation */}
            <div className="p-6 md:p-8 rounded-[var(--radius-box)] bg-gradient-to-b from-[#120817]/90 to-[#07040b]/95 border border-white/15 shadow-2xl flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    Live Component Playground
                  </span>
                  <h4 className="text-xl font-anton uppercase tracking-wide text-white">
                    Interactive Booking Stepper &amp; Sticky Summary
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Test the live interactive implementation generated to match UX Pilot&apos;s exact design spec.
                  </p>
                </div>

                {/* Step Switcher Buttons */}
                <div className="flex items-center gap-1.5 p-1 bg-black/60 border border-white/10 rounded-full">
                  {([1, 2, 3] as const).map((step) => (
                    <button
                      key={step}
                      onClick={() => setInteractiveBookingStep(step)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        interactiveBookingStep === step
                          ? "bg-amber-400 text-black shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>Step {step}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Stepper Bar */}
              <div className="max-w-xl mx-auto w-full flex items-center justify-between py-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    interactiveBookingStep >= 1 ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(245,185,66,0.6)]" : "bg-white/10 text-white"
                  }`}>1</div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Details</span>
                </div>
                <div className={`flex-1 h-[2px] mx-3 transition-colors ${interactiveBookingStep >= 2 ? "bg-amber-400" : "bg-white/10"}`} />
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    interactiveBookingStep >= 2 ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(245,185,66,0.6)]" : "bg-white/10 text-white"
                  }`}>2</div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Timeline</span>
                </div>
                <div className={`flex-1 h-[2px] mx-3 transition-colors ${interactiveBookingStep >= 3 ? "bg-amber-400" : "bg-white/10"}`} />
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    interactiveBookingStep >= 3 ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(245,185,66,0.6)]" : "bg-white/10 text-white"
                  }`}>3</div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Logistics</span>
                </div>
              </div>

              {/* Interactive Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                  {interactiveBookingStep === 1 && (
                    <div className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 space-y-5">
                      <div className="flex items-center gap-2 text-white font-bold text-base">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>Planner Information</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Full Name</label>
                          <input
                            type="text"
                            defaultValue="Alex Rivera"
                            className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Organization / Agency</label>
                          <input
                            type="text"
                            defaultValue="Midnight Festivals LLC"
                            className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Email Address</label>
                          <input
                            type="email"
                            defaultValue="alex@midnightfestivals.com"
                            className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Phone Number</label>
                          <input
                            type="tel"
                            defaultValue="+1 (312) 555-0199"
                            className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-3 border-t border-white/5">
                        <button
                          onClick={() => setInteractiveBookingStep(2)}
                          className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                        >
                          <span>Continue to Timeline</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {interactiveBookingStep === 2 && (
                    <div className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 space-y-5">
                      <div className="flex items-center gap-2 text-white font-bold text-base">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Interactive Timeline &amp; Show Schedule</span>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] text-zinc-300">3:00 PM</span>
                            <span className="font-semibold text-white">Production Load-In &amp; Rigging</span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-bold">Confirmed</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] text-zinc-300">5:30 PM</span>
                            <span className="font-semibold text-white">Full Band Soundcheck (60 min)</span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-bold">Confirmed</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-mono text-[10px] font-bold">8:30 PM</span>
                            <span className="font-bold text-amber-300">7th Heaven Headline Performance</span>
                          </div>
                          <span className="text-[11px] text-amber-300 font-bold">2.5 Hour Set</span>
                        </div>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-white/5">
                        <button
                          onClick={() => setInteractiveBookingStep(1)}
                          className="px-5 py-2.5 rounded-full border border-white/20 text-white font-semibold text-xs"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setInteractiveBookingStep(3)}
                          className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                        >
                          <span>Continue to Logistics</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {interactiveBookingStep === 3 && (
                    <div className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 space-y-5">
                      <div className="flex items-center gap-2 text-white font-bold text-base">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Venue Logistics &amp; Final Signoff</span>
                      </div>
                      <div className="space-y-2.5 text-xs text-zinc-300">
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/30 border border-white/5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Dedicated 200A 3-Phase Camlock Stage Power Confirmed</span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/30 border border-white/5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Stage Dimensions Minimum 32&apos; × 24&apos; Verified</span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/30 border border-white/5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Hospitality Green Room &amp; Sound Engineer Accommodations</span>
                        </div>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-white/5">
                        <button
                          onClick={() => setInteractiveBookingStep(2)}
                          className="px-5 py-2.5 rounded-full border border-white/20 text-white font-semibold text-xs"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => alert("Booking request submitted! (Design System Test Mode)")}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,185,66,0.4)] flex items-center gap-2"
                        >
                          <span>Submit Booking Contract</span>
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky Recap Sidebar Card */}
                <div className="p-6 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/15 flex flex-col gap-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h5 className="font-anton text-lg uppercase tracking-wide text-white">Booking Recap</h5>
                      <span className="text-[10px] text-zinc-400 font-mono">Live Status: Step {interactiveBookingStep} of 3</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>In Progress</span>
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Band Rate:</span>
                      <span className="font-bold text-white font-mono">$4,500</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Audio / Lights:</span>
                      <span className="font-bold text-emerald-400 font-mono">Included</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Date Hold:</span>
                      <span className="font-bold text-amber-300">Active (48 hrs)</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-zinc-400">Total Quote</span>
                    <span className="text-xl font-anton text-amber-400">$4,500</span>
                  </div>
                </div>
              </div>
            </div>
          </Stack>
        </PageSection>
      )}

      {/* UX Pilot Screen Full-Res Lightbox Modal */}
      {selectedUxPilotScreen && (
        <div
          onClick={() => setSelectedUxPilotScreen(null)}
          className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center animate-[fadeIn_0.15s_ease-out]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full max-h-[90vh] bg-[#07040b] rounded-2xl border border-white/20 overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white font-sans">UX Pilot High-Resolution Screen</span>
                <span className="text-xs text-zinc-400">• Patched #07040b Dark Obsidian</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://uxpilot.ai/a/ui-design?page=H1jirzqSYLZePiSeWKdq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Canvas</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setSelectedUxPilotScreen(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
                  aria-label="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-auto p-4 flex-1 flex justify-center bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedUxPilotScreen}
                alt="UX Pilot Screen Full Resolution"
                className="max-w-full h-auto rounded-lg border border-white/10 shadow-2xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <footer className="border-t border-white/10 py-12 mt-12 bg-black/60">
        <div className="site-container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            7th Heaven Design Systems Lab • Built for pair-programming design review
          </div>
          <div className="flex items-center gap-4">
            <Link href="/design-system" className="hover:text-white transition-colors underline underline-offset-4">
              View Canonical Design System v2.0
            </Link>
            <Link href="/" className="hover:text-white transition-colors underline underline-offset-4">
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
