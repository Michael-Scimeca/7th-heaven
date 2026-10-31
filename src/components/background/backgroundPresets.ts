export interface BackgroundViewPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "Concert Bleed" | "Editorial" | "Fluid Aurora" | "Stadium Lights" | "Minimal Luxury";
  badge: string;
  colors: string[];
  themeClass: string;
}

export const BACKGROUND_VIEW_PRESETS: BackgroundViewPreset[] = [
  {
    id: "arena-concert",
    name: "01. Arena Concert Bleed",
    tagline: "Live Stage Video Blur + 35mm Analog Film Grain",
    description: "Dynamic live arena concert performance bleeding across the page with 64px Gaussian blur, warm amber stage lighting, saturated violet stage accents, and fine 35mm analog film grain overlay.",
    category: "Concert Bleed",
    badge: "Rock Energy",
    colors: ["#2d0b4e", "#8b1538", "#eeac1a", "#07020d"],
    themeClass: "bg-view-arena",
  },
  {
    id: "jjettas-editorial",
    name: "02. JJettas Obsidian & Purple Aura",
    tagline: "High-Fashion Monolithic Typography & 49% Boundary Aura",
    description: "Inspired by jjettas.com/off-field: deep obsidian carbon canvas (#0B0A0F) with an atmospheric #4F2BAB purple aura concentrated in the upper viewport, tactile micro-noise, and clean card breathing room.",
    category: "Editorial",
    badge: "JJettas Style",
    colors: ["#0b0a0f", "#4f2bab", "#9e6de9", "#17093b"],
    themeClass: "bg-view-jjettas",
  },
  {
    id: "fluid-aurora",
    name: "03. Liquid Electric Aurora",
    tagline: "Swirling Multi-Chromatic Silk Mesh Gradients",
    description: "Velvety fluid mesh gradient blending royal violet, electric indigo, and warm sunset gold ribbons that gently breathe across the screen. Ultra-luxurious, modern, and soothing.",
    category: "Fluid Aurora",
    badge: "Fluid Luxury",
    colors: ["#0d0519", "#7c3aed", "#4338ca", "#d97706"],
    themeClass: "bg-view-aurora",
  },
  {
    id: "stadium-beams",
    name: "04. Stadium Spotlight Beams",
    tagline: "Volumetric Stage Lighting Cones & Atmospheric Haze",
    description: "Iconic concert lighting: subtle diagonal volumetric spotlight cones sweeping down from the arena ceiling, gentle concert haze smoke textures, and distant stardust motes.",
    category: "Stadium Lights",
    badge: "Arena Spectacle",
    colors: ["#050508", "#3b1261", "#f59e0b", "#1e1b4b"],
    themeClass: "bg-view-beams",
  },
  {
    id: "noir-gold",
    name: "05. Minimalist Noir & Gold",
    tagline: "Deep Matte Black with Warm Champagne Rim Light",
    description: "Pure typography-first minimalist luxury: ultra-deep matte noir (#060608) with a delicate warm gold (#EEAC1A) rim glow at the top horizon and crisp micro-grain. Maximum focus and contrast.",
    category: "Minimal Luxury",
    badge: "Clean & Crisp",
    colors: ["#060608", "#1a1622", "#eeac1a", "#0d0d12"],
    themeClass: "bg-view-noir",
  },
];
