"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { Toggle } from "@/components/Toggle";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
  Gauge,
  Palette,
  Eye,
  EyeOff,
  Split,
  Compass,
  Zap,
  Flame,
  Wind,
  Download,
  Upload,
  RefreshCw,
  Layers,
} from "lucide-react";
import { DotChevronRight } from "@/components/ui/DotArrow";

export type TransitionTargetMode = "page-only" | "full-veil";
export type NoiseAlgorithm = "classic" | "fbm" | "voronoi" | "warp";
export type ColorStyleMode = "solid" | "linear" | "radial" | "aurora" | "mask";
export type MaskMode = "standard" | "inverted" | "stencil";
export type MaskMatteStyle =
  | "black-hole"
  | "inverted-cutout"
  | "white-luma"
  | "stencil-contour"
  | "direct-dom";
export type MaskBlendMode = "normal" | "multiply" | "screen" | "difference";
export type DissolveDirection =
  | "uniform"
  | "left-to-right"
  | "right-to-left"
  | "bottom-to-top"
  | "top-to-bottom"
  | "radial-out";

export interface ElementScrubTargets {
  header: boolean; // true = dissolve/hide, false = persist/keep visible
  hero: boolean;
  controlStudio: boolean;
  cards: boolean;
  specs: boolean;
  background: boolean;
}

export interface WebGLTransitionConfig {
  targetMode: TransitionTargetMode;
  color: string; // Primary Color A / Mask Matte
  colorSecondary: string; // Secondary Color B (gradient stop 2)
  colorTertiary: string; // Tertiary Color C (gradient stop 3 / aurora)
  colorMode: ColorStyleMode; // "solid" | "linear" | "radial" | "aurora" | "mask"
  gradientAngle: number; // 0 to 360 deg
  maskMode: MaskMode; // "standard" | "inverted" | "stencil"
  maskMatteStyle?: MaskMatteStyle;
  maskBlendMode?: MaskBlendMode;
  duration: number; // 0.2 to 4.0s
  noiseScale: number; // 1.0 to 40.0
  edge: number; // 0.005 to 0.50
  ease: string; // Leave ease
  enterEase: string; // Enter ease
  maxAlpha: number; // 0.05 to 1.0 (transparency)
  displacementScale: number; // 10 to 150 (page-only)
  aspectCorrect: boolean;
  invert: boolean;
  holdDuration: number; // seconds to hold at peak (0 to 1.5s)
  speedMultiplier: number; // 0.25 to 2.0
  backdropBlur: "none" | "xs" | "sm" | "md" | "lg";
  // Advanced Procedural Shader Controls (Codrops About Extension)
  noiseType: NoiseAlgorithm; // classic | fbm | voronoi | warp
  octaves: number; // 1 to 5 (for FBM)
  warpStrength: number; // 0.0 to 2.0 domain warp
  direction: DissolveDirection; // sweep direction
  directionStrength: number; // 0.2 to 2.0
  edgeGlow: boolean; // burning dissolve perimeter
  edgeGlowColor: string; // glowing edge color
  edgeGlowIntensity: number; // 0.0 to 3.0
  edgeGlowWidth: number; // 0.01 to 0.25
  noiseSeed: number; // coordinate offset seed (0 to 100)
  // Granular control of what is scrubbed / hidden from page to page
  elementTargets: ElementScrubTargets;
  crossScrubSimulation: boolean; // Enables dual-page ghost comparison in scrubber
}

export interface TransitionPreset {
  id: string;
  label: string;
  tag: string;
  desc: string;
  config: Partial<WebGLTransitionConfig>;
}

export const GRADIENT_PRESETS: {
  label: string;
  colorA: string;
  colorB: string;
  colorC: string;
  angle: number;
  desc: string;
}[] = [
  {
    label: "Royal Purple & Magenta",
    colorA: "#8a1cfc",
    colorB: "#ec4899",
    colorC: "#3b82f6",
    angle: 135,
    desc: "7th Heaven signature royal violet to electric stage magenta",
  },
  {
    label: "Electric Violet & Laser Cyan",
    colorA: "#8a1cfc",
    colorB: "#06b6d4",
    colorC: "#3b82f6",
    angle: 45,
    desc: "Laser stage blue blending into electric violet",
  },
  {
    label: "Deep Midnight Velvet",
    colorA: "#2e1065",
    colorB: "#9333ea",
    colorC: "#c084fc",
    angle: 90,
    desc: "Rich saturated deep velvet violet to bright lavender",
  },
  {
    label: "Ultraviolet Sunset Blaze",
    colorA: "#701a75",
    colorB: "#f43f5e",
    colorC: "#f59e0b",
    angle: 120,
    desc: "Warm pyro stage explosion from dark magenta to rose red",
  },
  {
    label: "Synthwave Purple & Emerald",
    colorA: "#a855f7",
    colorB: "#10b981",
    colorC: "#06b6d4",
    angle: 60,
    desc: "Futuristic synthwave purple-to-emerald gradient",
  },
  {
    label: "Dark Obsidian & Purple Shadow",
    colorA: "#09090b",
    colorB: "#581c87",
    colorC: "#8a1cfc",
    angle: 180,
    desc: "Moody black obsidian to stage purple glow",
  },
];

export const MASK_PRESETS: {
  label: string;
  tag: string;
  desc: string;
  config: Partial<WebGLTransitionConfig>;
}[] = [
  {
    label: "Pitch Black Hole (Aperture)",
    tag: "Cutout Mask",
    desc: "Obsidian blackout mask that tears open via procedural noise",
    config: {
      colorMode: "mask",
      color: "#2c0b41",
      maskMode: "standard",
      maskMatteStyle: "black-hole",
      maskBlendMode: "normal",
      maxAlpha: 1.0,
      noiseScale: 8.5,
      edge: 0.45,
      octaves: 4,
      warpStrength: 1.25,
      invert: true,
      noiseSeed: 48,
      edgeGlow: false,
    },
  },
  {
    label: "Inverted Punch-Hole Window",
    tag: "Negative Stencil",
    desc: "Reveals next page through organic dissolving punch-holes",
    config: {
      colorMode: "mask",
      color: "#0a0a12",
      maskMode: "inverted",
      maskMatteStyle: "inverted-cutout",
      maskBlendMode: "normal",
      maxAlpha: 1.0,
      edgeGlow: true,
      edgeGlowColor: "#8a1cfc",
    },
  },
  {
    label: "White Luma Stencil",
    tag: "High Contrast",
    desc: "Pure white luminance matte for geometric contrast masking",
    config: {
      colorMode: "mask",
      color: "#ffffff",
      maskMode: "standard",
      maskMatteStyle: "white-luma",
      maskBlendMode: "normal",
      maxAlpha: 1.0,
      edgeGlow: false,
    },
  },
  {
    label: "Multiply Darkness Mask",
    tag: "Multiply Stencil",
    desc: "Blends directly into underlying elements using CSS multiply",
    config: {
      colorMode: "mask",
      color: "#000000",
      maskMode: "standard",
      maskBlendMode: "multiply",
      maxAlpha: 0.95,
      edgeGlow: false,
    },
  },
  {
    label: "Difference X-Ray Invert",
    tag: "Psychedelic Mask",
    desc: "Inverts colors and luminance of page elements dynamically",
    config: {
      colorMode: "mask",
      color: "#ffffff",
      maskMode: "standard",
      maskBlendMode: "difference",
      maxAlpha: 1.0,
      edgeGlow: false,
    },
  },
  {
    label: "Direct DOM Content Dissolve",
    tag: "No Veil / True Mask",
    desc: "Dissolves the page's HTML elements directly with zero overlay",
    config: {
      targetMode: "page-only",
      colorMode: "mask",
      maskMode: "standard",
      maskMatteStyle: "direct-dom",
      displacementScale: 80,
    },
  },
];

export const TRANSITION_PRESETS: TransitionPreset[] = [
  {
    id: "saved-obsidian-aperture",
    label: "Deep Obsidian Aperture (Saved Master)",
    tag: "Master Setup",
    desc: "100% opaque procedural blackout mask with 8.5 noise scale, 1.25 domain warping, and clean route protection",
    config: {
      targetMode: "full-veil",
      color: "#2c0b41",
      colorSecondary: "#06b6d4",
      colorTertiary: "#3b82f6",
      colorMode: "mask",
      gradientAngle: 45,
      maskMode: "standard",
      maskMatteStyle: "black-hole",
      maskBlendMode: "normal",
      duration: 0.38,
      noiseScale: 8.5,
      edge: 0.45,
      ease: "power2.out",
      enterEase: "power2.out",
      maxAlpha: 1.0,
      displacementScale: 65,
      aspectCorrect: true,
      invert: true,
      holdDuration: 0.03,
      speedMultiplier: 1.0,
      backdropBlur: "none",
      noiseType: "classic",
      octaves: 4,
      warpStrength: 1.25,
      direction: "uniform",
      directionStrength: 1.0,
      edgeGlow: false,
      edgeGlowColor: "#8a1cfc",
      edgeGlowIntensity: 1.6,
      edgeGlowWidth: 0.07,
      noiseSeed: 48,
      crossScrubSimulation: false,
    },
  },
  {
    id: "purple-gradient",
    label: "Royal Purple Gradient",
    tag: "Gradient",
    desc: "Lush 135° diagonal royal purple to electric magenta gradient with burning perimeter",
    config: {
      color: "#8a1cfc",
      colorSecondary: "#ec4899",
      colorTertiary: "#3b82f6",
      colorMode: "linear",
      gradientAngle: 135,
      maskMode: "standard",
      maxAlpha: 0.7,
      noiseScale: 6.0,
      noiseType: "classic",
      edge: 0.15,
      direction: "uniform",
      directionStrength: 1.0,
      edgeGlow: true,
      edgeGlowColor: "#fbcfe8",
      edgeGlowIntensity: 1.8,
      edgeGlowWidth: 0.07,
      duration: 1.1,
      ease: "power2.inOut",
      enterEase: "power2.out",
      aspectCorrect: true,
      invert: false,
      speedMultiplier: 1.0,
      holdDuration: 0.05,
    },
  },
  {
    id: "purple-mask",
    label: "Purple Inverted Mask",
    tag: "Mask Mode",
    desc: "Inverted stencil mask cutting directly through a rich violet gradient veil",
    config: {
      color: "#8a1cfc",
      colorSecondary: "#3b82f6",
      colorTertiary: "#ec4899",
      colorMode: "linear",
      gradientAngle: 45,
      maskMode: "inverted",
      maxAlpha: 0.85,
      noiseScale: 7.5,
      noiseType: "classic",
      edge: 0.08,
      direction: "radial-out",
      directionStrength: 0.9,
      edgeGlow: true,
      edgeGlowColor: "#c084fc",
      edgeGlowIntensity: 2.2,
      edgeGlowWidth: 0.06,
      duration: 1.0,
      ease: "power2.in",
      enterEase: "power2.out",
      aspectCorrect: true,
      invert: false,
      speedMultiplier: 1.0,
      holdDuration: 0.0,
    },
  },
  {
    id: "aurora-flow",
    label: "Purple Aurora Noise Flow",
    tag: "Aurora Flow",
    desc: "Tri-color purple, pink, and cyan gradient flowing along the procedural noise turbulence",
    config: {
      color: "#7c3aed",
      colorSecondary: "#ec4899",
      colorTertiary: "#06b6d4",
      colorMode: "aurora",
      gradientAngle: 90,
      maskMode: "standard",
      maxAlpha: 0.75,
      noiseScale: 5.5,
      noiseType: "warp",
      warpStrength: 0.45,
      edge: 0.18,
      direction: "bottom-to-top",
      directionStrength: 0.9,
      edgeGlow: true,
      edgeGlowColor: "#ffffff",
      edgeGlowIntensity: 1.5,
      edgeGlowWidth: 0.06,
      duration: 1.25,
      ease: "sine.inOut",
      enterEase: "sine.inOut",
      aspectCorrect: true,
      invert: false,
      speedMultiplier: 1.0,
      holdDuration: 0.05,
    },
  },
  {
    id: "radial-purple",
    label: "Radial Purple Core",
    tag: "Radial",
    desc: "Circular radial gradient expanding from royal violet center to deep velvet perimeter",
    config: {
      color: "#c084fc",
      colorSecondary: "#3b0764",
      colorTertiary: "#8a1cfc",
      colorMode: "radial",
      gradientAngle: 0,
      maskMode: "standard",
      maxAlpha: 0.8,
      noiseScale: 6.0,
      noiseType: "classic",
      edge: 0.12,
      direction: "radial-out",
      directionStrength: 1.0,
      edgeGlow: true,
      edgeGlowColor: "#f3e8ff",
      edgeGlowIntensity: 1.9,
      edgeGlowWidth: 0.07,
      duration: 1.0,
      ease: "power2.inOut",
      enterEase: "power2.out",
      aspectCorrect: true,
      invert: false,
      speedMultiplier: 1.0,
      holdDuration: 0.0,
    },
  },
  {
    id: "codrops-classic",
    label: "Codrops Classic 2019",
    tag: "Authentic",
    desc: "The original solid stone gray (#beb9b8) from the Codrops About demo with power1.in ease",
    config: {
      color: "#beb9b8",
      colorSecondary: "#beb9b8",
      colorMode: "solid",
      maskMode: "standard",
      maxAlpha: 1.0,
      noiseScale: 5.0,
      noiseType: "classic",
      edge: 0.185,
      direction: "uniform",
      directionStrength: 1.0,
      edgeGlow: false,
      warpStrength: 0.0,
      duration: 1.0,
      ease: "power1.in",
      enterEase: "power1.in",
      aspectCorrect: false,
      invert: false,
      speedMultiplier: 1.0,
      holdDuration: 0.0,
    },
  },
  {
    id: "crystal",
    label: "Frosted Crystal Glass",
    tag: "Transparent",
    desc: "Lightweight crystal noise letting the animated stage background canvas shine through",
    config: {
      color: "#ffffff",
      colorSecondary: "#ffffff",
      colorMode: "solid",
      maskMode: "standard",
      maxAlpha: 0.45,
      noiseScale: 5.0,
      noiseType: "classic",
      edge: 0.2,
      direction: "uniform",
      edgeGlow: false,
      warpStrength: 0.0,
      duration: 1.0,
      ease: "power1.in",
      enterEase: "power1.in",
      aspectCorrect: true,
      invert: false,
      speedMultiplier: 1.0,
      holdDuration: 0.0,
    },
  },
  {
    id: "molten-amber",
    label: "Molten Ember Shred",
    tag: "Fire Burn",
    desc: "Fluid warped amber gradient noise with an intense glowing white-hot burning perimeter",
    config: {
      color: "#d97706",
      colorSecondary: "#ef4444",
      colorTertiary: "#fbbf24",
      colorMode: "linear",
      gradientAngle: 90,
      maskMode: "standard",
      maxAlpha: 0.85,
      noiseScale: 8.5,
      noiseType: "warp",
      warpStrength: 0.6,
      edge: 0.065,
      direction: "bottom-to-top",
      directionStrength: 1.1,
      edgeGlow: true,
      edgeGlowColor: "#ffedd5",
      edgeGlowIntensity: 2.6,
      edgeGlowWidth: 0.05,
      duration: 0.95,
      ease: "power3.in",
      enterEase: "power3.out",
      aspectCorrect: true,
      invert: false,
      speedMultiplier: 1.0,
      holdDuration: 0.0,
    },
  },
  {
    id: "voronoi-shatter",
    label: "Voronoi Glass Shards",
    tag: "Cellular",
    desc: "Polygonal Voronoi cellular noise dissolving outward like shattered stage glass",
    config: {
      color: "#3b82f6",
      colorSecondary: "#8a1cfc",
      colorTertiary: "#93c5fd",
      colorMode: "linear",
      gradientAngle: 45,
      maskMode: "standard",
      maxAlpha: 0.75,
      noiseScale: 7.0,
      noiseType: "voronoi",
      edge: 0.08,
      direction: "radial-out",
      directionStrength: 0.9,
      edgeGlow: true,
      edgeGlowColor: "#93c5fd",
      edgeGlowIntensity: 1.7,
      edgeGlowWidth: 0.06,
      duration: 1.05,
      ease: "power2.in",
      enterEase: "power2.out",
      aspectCorrect: true,
      invert: false,
      speedMultiplier: 1.0,
      holdDuration: 0.0,
    },
  },
];

export const COLOR_PRESETS: {
  label: string;
  hex: string;
  desc: string;
  defaultAlpha: number;
}[] = [
  {
    label: "7th Heaven Royal Purple",
    hex: "#8a1cfc",
    desc: "Electric royal violet matching the band stage lights",
    defaultAlpha: 0.65,
  },
  {
    label: "Electric Stage Magenta",
    hex: "#ec4899",
    desc: "Vibrant neon stage magenta",
    defaultAlpha: 0.65,
  },
  {
    label: "Electric Stage Cyan",
    hex: "#06b6d4",
    desc: "High-voltage neon stage cyan",
    defaultAlpha: 0.6,
  },
  {
    label: "Frosted Crystal Glass",
    hex: "#ffffff",
    desc: "Translucent crystal noise letting the live background canvas show through",
    defaultAlpha: 0.45,
  },
  {
    label: "Codrops Classic Stone",
    hex: "#beb9b8",
    desc: "Original 2019 stone tone from the Codrops About transition demo",
    defaultAlpha: 1.0,
  },
  {
    label: "Molten Amber Sun",
    hex: "#d97706",
    desc: "Golden stage par-can tungsten",
    defaultAlpha: 0.75,
  },
  {
    label: "Deep Obsidian Mist",
    hex: "#111115",
    desc: "Translucent dark stage smoke",
    defaultAlpha: 0.85,
  },
  {
    label: "Emerald Laser Beam",
    hex: "#10b981",
    desc: "Laser scan matrix green",
    defaultAlpha: 0.6,
  },
];

export const EASE_PRESETS = [
  { label: "power1.in (Codrops Original)", value: "power1.in" },
  { label: "power2.inOut (Balanced & Cinematic)", value: "power2.inOut" },
  { label: "power3.in (Punchy Acceleration)", value: "power3.in" },
  { label: "power4.in (Aggressive Sudden Snap)", value: "power4.in" },
  { label: "sine.inOut (Gentle Liquid Wave)", value: "sine.inOut" },
  { label: "expo.in (Dramatic Velocity)", value: "expo.in" },
  { label: "circ.inOut (Curved Deceleration)", value: "circ.inOut" },
  { label: "none (Linear Continuous)", value: "none" },
];

export const ENTER_EASE_PRESETS = [
  { label: "power1.in (Codrops Original)", value: "power1.in" },
  { label: "power1.out (Soft Natural Unveil)", value: "power1.out" },
  { label: "power2.out (Smooth Finish)", value: "power2.out" },
  { label: "power3.out (Clean Stage Reveal)", value: "power3.out" },
  { label: "sine.out (Gentle Dissolve Away)", value: "sine.out" },
  { label: "expo.out (Fast Flash Open)", value: "expo.out" },
];

export const DEFAULT_CONFIG: WebGLTransitionConfig = {
  targetMode: "full-veil",
  color: "#2c0b41", // Obsidian deep violet matte
  colorSecondary: "#06b6d4",
  colorTertiary: "#3b82f6",
  colorMode: "mask", // Pure shader mask (no gradient)
  gradientAngle: 45,
  maskMode: "standard", // Standard full-veil procedural noise transition
  maskMatteStyle: "black-hole",
  maskBlendMode: "normal",
  duration: 0.38,
  noiseScale: 8.5,
  edge: 0.45,
  ease: "power2.out",
  enterEase: "power2.out",
  maxAlpha: 1.0, // Fully opaque so the veil completely masks the underlying page switch!
  displacementScale: 65,
  aspectCorrect: true,
  invert: true,
  holdDuration: 0.03, // Brief hold at apex so target page settles behind the solid veil
  speedMultiplier: 1.0,
  backdropBlur: "none",
  noiseType: "classic",
  octaves: 4,
  warpStrength: 1.25,
  direction: "uniform",
  directionStrength: 1.0,
  edgeGlow: false,
  edgeGlowColor: "#8a1cfc",
  edgeGlowIntensity: 1.6,
  edgeGlowWidth: 0.07,
  noiseSeed: 48,
  elementTargets: {
    header: false, // Default: header persists across pages (never hidden)
    hero: true, // Hero section dissolves
    controlStudio: false, // Control studio stays pinned so user can test without losing controls
    cards: true, // Content cards dissolve
    specs: true, // Tech specs dissolve
    background: false, // Background canvas remains 100% visible & animated
  },
  crossScrubSimulation: false,
};

interface WebGLTransitionContextValue {
  config: WebGLTransitionConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebGLTransitionConfig>>;
  navigateWithTransition: (targetHref: string) => Promise<void>;
  previewInPlace: () => Promise<void>;
  isTransitioning: boolean;
  // Scrubber controls
  isScrubbing: boolean;
  setIsScrubbing: (scrubbing: boolean) => void;
  isOscillating: boolean;
  setIsOscillating: (oscillating: boolean) => void;
  scrubProgress: number; // 1.50 down to -0.75
  setScrubProgress: (val: number) => void;
  resetToDefaults: () => void;
  resetToCodropsOriginal: () => void;
  copyConfigJson: () => Promise<boolean>;
  loadConfigJson: (jsonStr: string) => boolean;
  applyPreset: (presetId: string) => void;
  applyGradientPreset: (preset: (typeof GRADIENT_PRESETS)[number]) => void;
  // Element-level control
  setElementTarget: (key: keyof ElementScrubTargets, val: boolean) => void;
  applyElementPreset: (preset: "all" | "persist-chrome" | "cards-only" | "hero-only") => void;
}

const WebGLTransitionContext = createContext<WebGLTransitionContextValue | null>(
  null,
);

export function useWebGLTransition() {
  const ctx = useContext(WebGLTransitionContext);
  if (!ctx) {
    throw new Error(
      "useWebGLTransition must be used within a WebGLTransitionProvider",
    );
  }
  return ctx;
}

export function useOptionalWebGLTransition() {
  return useContext(WebGLTransitionContext);
}

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
varying vec2 vUv;
uniform float uProgress;
uniform vec3 uColor;
uniform vec3 uColorSecondary;
uniform vec3 uColorTertiary;
uniform float uColorMode; // 0: Solid, 1: Linear, 2: Radial, 3: Aurora
uniform float uGradientAngle; // 0 to 360 deg
uniform float uMaskMode; // 0: Standard, 1: Inverted Cutout, 2: Stencil
uniform vec3 uEdgeGlowColor;
uniform float uNoiseScale;
uniform float uEdge;
uniform float uAspect;
uniform float uMaxAlpha;
uniform float uAspectCorrect;
uniform float uInvert;
uniform float uNoiseType; // 0.0 = classic, 1.0 = fbm, 2.0 = voronoi, 3.0 = warp
uniform float uOctaves;
uniform float uWarpStrength;
uniform float uDirection; // 0: uniform, 1: L-R, 2: R-L, 3: B-T, 4: T-B, 5: Radial
uniform float uDirectionStrength;
uniform float uEdgeGlowIntensity;
uniform float uEdgeGlowWidth;
uniform vec2 uNoiseSeed;

// Classic 2D Value Noise (exact Codrops source by Patricio Gonzalez Vivo)
float rand(vec2 n) { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  
  float res = mix(
    mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
    mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );
  return res * res;
}

// Fractal Brownian Motion (FBM)
float fbm(vec2 p, float oct) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    if (float(i) >= oct) break;
    val += amp * noise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return val;
}

// Cellular / Voronoi Noise
float voronoi(vec2 p) {
  vec2 ip = floor(p);
  vec2 fp = fract(p);
  float minDist = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = vec2(rand(ip + neighbor), rand(ip + neighbor + vec2(3.1, 7.4)));
      vec2 diff = neighbor + point - fp;
      float dist = length(diff);
      minDist = min(minDist, dist);
    }
  }
  return minDist;
}

void main() {
  vec2 uv = mix(vUv, vec2(vUv.x * uAspect, vUv.y), uAspectCorrect);
  vec2 p = uv * uNoiseScale + uNoiseSeed;

  // Domain warping
  if (uWarpStrength > 0.001) {
    vec2 q = vec2(noise(p + vec2(0.0, 0.0)), noise(p + vec2(5.2, 1.3)));
    p += q * uWarpStrength * 2.0;
  }

  // Calculate Noise based on selected algorithm
  float n = 0.0;
  if (uNoiseType < 0.5) {
    n = noise(p);
  } else if (uNoiseType < 1.5) {
    n = fbm(p, uOctaves);
  } else if (uNoiseType < 2.5) {
    n = voronoi(p);
  } else {
    n = noise(p + vec2(noise(p * 1.5), noise(p * 1.5 + 4.0)) * 1.5);
  }

  if (uInvert > 0.5) {
    n = 1.0 - n;
  }

  // Directional sweep offset
  float dirOffset = 0.0;
  if (uDirection > 0.5 && uDirection < 1.5) {
    dirOffset = (vUv.x - 0.5) * uDirectionStrength;
  } else if (uDirection >= 1.5 && uDirection < 2.5) {
    dirOffset = -(vUv.x - 0.5) * uDirectionStrength;
  } else if (uDirection >= 2.5 && uDirection < 3.5) {
    dirOffset = (vUv.y - 0.5) * uDirectionStrength;
  } else if (uDirection >= 3.5 && uDirection < 4.5) {
    dirOffset = -(vUv.y - 0.5) * uDirectionStrength;
  } else if (uDirection >= 4.5) {
    float d = length(vUv - vec2(0.5, 0.5));
    dirOffset = (d - 0.35) * uDirectionStrength;
  }

  float effectiveProg = uProgress - dirOffset;

  // Dissolve calculation (exact Codrops formula)
  float dissolve = smoothstep(1.0 - effectiveProg - uEdge, 1.0 - effectiveProg + uEdge, n);
  
  // Mask mode handling
  float alpha = (1.0 - dissolve);
  if (uMaskMode > 0.5 && uMaskMode < 1.5) {
    // Inverted Cutout Mask: cuts a window through the veil
    alpha = dissolve;
  } else if (uMaskMode >= 1.5) {
    // Stencil / Contour Mask: highlights the geometric boundary lines
    float contour = 1.0 - abs(dissolve * 2.0 - 1.0);
    alpha = contour;
  }
  alpha *= uMaxAlpha;

  // Base Color: Solid, Linear Gradient, Radial Gradient, Aurora Noise Flow, or Pure Mask
  vec3 baseColor = uColor;
  if (uColorMode > 0.5 && uColorMode < 1.5) {
    // Linear Gradient along uGradientAngle
    float rad = radians(uGradientAngle);
    vec2 dir = vec2(cos(rad), sin(rad));
    float t = clamp(dot(vUv - vec2(0.5), dir) + 0.5, 0.0, 1.0);
    baseColor = mix(uColor, uColorSecondary, t);
  } else if (uColorMode >= 1.5 && uColorMode < 2.5) {
    // Radial Gradient radiating from center outward
    float d = clamp(length(vUv - vec2(0.5)) * 1.414, 0.0, 1.0);
    baseColor = mix(uColor, uColorSecondary, d);
  } else if (uColorMode >= 2.5 && uColorMode < 3.5) {
    // Aurora Noise Flow Gradient: Color follows the procedural noise waves!
    float t = clamp(n * 1.25 + (vUv.x - 0.5) * 0.4, 0.0, 1.0);
    vec3 grad1 = mix(uColor, uColorSecondary, smoothstep(0.15, 0.65, t));
    baseColor = mix(grad1, uColorTertiary, smoothstep(0.55, 0.95, t));
  } else if (uColorMode >= 3.5) {
    // PURE SHADER MASK: Acts as a matte / stencil mask with ZERO gradient colors!
    baseColor = uColor;
  }

  // Edge glow / burn calculation
  vec3 finalColor = baseColor;
  if (uEdgeGlowIntensity > 0.01) {
    float glowDist = abs(n - (1.0 - effectiveProg));
    float glow = 1.0 - smoothstep(0.0, uEdgeGlowWidth, glowDist);
    finalColor = mix(baseColor, uEdgeGlowColor, clamp(glow * uEdgeGlowIntensity, 0.0, 1.0));
  }

  gl_FragColor = vec4(finalColor, alpha);
}
`;

function hexToRgbVector(hex: string): THREE.Vector3 {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  if (isNaN(num)) return new THREE.Vector3(1.0, 1.0, 1.0);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return new THREE.Vector3(r / 255, g / 255, b / 255);
}

function getScrubTargetElements(): { key: keyof ElementScrubTargets; el: HTMLElement }[] {
  if (typeof document === "undefined") return [];
  const definitions: { key: keyof ElementScrubTargets; selector: string }[] = [
    { key: "header", selector: '[data-scrub-target="header"], header' },
    { key: "hero", selector: '[data-scrub-target="hero"]' },
    { key: "controlStudio", selector: '[data-scrub-target="control-studio"]' },
    { key: "cards", selector: '[data-scrub-target="cards"]' },
    { key: "specs", selector: '[data-scrub-target="specs"]' },
  ];

  const results: { key: keyof ElementScrubTargets; el: HTMLElement }[] = [];
  definitions.forEach(({ key, selector }) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) results.push({ key, el });
  });
  return results;
}

export function LiveNextPageViewportPortal({
  target,
  normalizedProgress,
  onNavigate,
  onClose,
}: {
  target: "page-a" | "page-b";
  normalizedProgress: number;
  onNavigate: () => void;
  onClose: () => void;
}) {
  const percent = Math.round(normalizedProgress * 100);
  const radius = Math.min(160, Math.round(normalizedProgress * 145));

  if (normalizedProgress < 0.01) return null;

  return (
    <div
      aria-label="Live route transition preview"
      className="pointer-events-none fixed inset-0 z-[50] overflow-y-auto bg-linear-to-b from-purple-950/90 via-zinc-950/95 to-black backdrop-blur-2xl transition-none portal-aperture"
      style={
        {
          "--portal-radius": `${radius}%`,
        } as CSSProperties
      }
    >
      <div className="site-container py-12 flex flex-col gap-8 text-white max-w-5xl mx-auto">
        {/* Floating Portal HUD Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Next Page Stage &bull; Revealed Through Noise Aperture
              </span>
              <span className="text-[11px] text-emerald-300 font-mono">
                {target === "page-a" ? "Incoming Destination: Page A" : "Incoming Destination: Page B"} &bull; {percent}% Unveiled
              </span>
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
            >
              <span>Commit Route Swap &rarr;</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
            >
              Hide Portal
            </button>
          </div>
        </div>

        {target === "page-a" ? (
          <div className="flex flex-col gap-8 text-center items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/50 px-4 py-1.5 text-xs font-semibold text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Page A: Band Showcase &amp; Discography</span>
            </div>

            <h2 className="font-black text-white leading-tight">
              Page A: Band Showcase &amp; Discography
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              Experience the custom WebGL noise dissolve transition directly over the live background shader canvas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
              <div className="flex flex-col gap-2 p-6 rounded-2xl border border-white/15 bg-white/5 shadow-xl">
                <span className="text-3xl font-black text-purple-400">5,000+</span>
                <h4 className="font-bold text-white">Live Concerts Performed</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  From festival main stages to intimate arenas across the Midwest for over 30 years.
                </p>
              </div>

              <div className="flex flex-col gap-2 p-6 rounded-2xl border border-white/15 bg-white/5 shadow-xl">
                <span className="text-3xl font-black text-cyan-400">30+</span>
                <h4 className="font-bold text-white">Albums &amp; Original Hits</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Chart-topping melodic pop-rock singles and timeless festival fan favorites.
                </p>
              </div>

              <div className="flex flex-col gap-2 p-6 rounded-2xl border border-white/15 bg-white/5 shadow-xl">
                <span className="text-3xl font-black text-rose-400">Guinness</span>
                <h4 className="font-bold text-white">World Record Holders</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Extraordinary stamina and passionate devotion to their loyal fan community.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 text-center items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/50 px-4 py-1.5 text-xs font-semibold text-amber-300">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Page B: Concert Experience &amp; Tour Life</span>
            </div>

            <h2 className="font-black text-white leading-tight">
              Page B: Concert Experience &amp; Tour Life
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              You successfully transitioned into Page B using the WebGL noise dissolve shader directly over the live background canvas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
              <div className="flex flex-col gap-2 p-6 rounded-2xl border border-white/15 bg-white/5 shadow-xl">
                <span className="text-3xl font-black text-amber-400">Pyrotechnics</span>
                <h4 className="font-bold text-white">Synchronized Stage FX</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  High-speed flame bursts, CO2 jets, and dynamic atmospheric laser mapping.
                </p>
              </div>

              <div className="flex flex-col gap-2 p-6 rounded-2xl border border-white/15 bg-white/5 shadow-xl">
                <span className="text-3xl font-black text-purple-400">32-Channel</span>
                <h4 className="font-bold text-white">Spatial Sound Array</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Concert arena line-array acoustic precision delivering bone-rattling audio.
                </p>
              </div>

              <div className="flex flex-col gap-2 p-6 rounded-2xl border border-white/15 bg-white/5 shadow-xl">
                <span className="text-3xl font-black text-rose-400">30,000+</span>
                <h4 className="font-bold text-white">Arena Fan Energy</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  High-octane crowd sing-alongs and legendary festival headline performances.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function WebGLTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const [config, setConfig] = useState<WebGLTransitionConfig>(DEFAULT_CONFIG);
  const configRef = useRef(config);
  const isHydratedRef = useRef(false);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isOscillating, setIsOscillating] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(1.5); // 1.50 = clear, -0.75 = peak veil

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const oscillateAnimRef = useRef<number | null>(null);

  // Restore persisted config on client mount to eliminate SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("7h_webgl_transition_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    isHydratedRef.current = true;
  }, []);

  // Persist config to session storage only after initial client-side hydration
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      sessionStorage.setItem(
        "7h_webgl_transition_config",
        JSON.stringify(config),
      );
    } catch {}
  }, [config]);

  // Handle Oscillate Loop (Continuous live back-and-forth dissolve preview)
  useEffect(() => {
    if (!isOscillating) {
      if (oscillateAnimRef.current !== null) {
        cancelAnimationFrame(oscillateAnimRef.current);
        oscillateAnimRef.current = null;
      }
      return;
    }

    setIsScrubbing(true);
    const startTime = performance.now();
    const period = Math.max(800, (config.duration / (config.speedMultiplier || 1.0)) * 2200);

    const tick = (now: number) => {
      const elapsed = (now - startTime) % period;
      const phase = elapsed / period; // 0 to 1
      const wave = Math.sin(phase * Math.PI * 2); // -1 to 1
      // Map wave: center = 0.375, halfRange = 1.125 -> yields -0.75 to +1.50
      const progress = 0.375 + wave * 1.125;
      setScrubProgress(progress);
      oscillateAnimRef.current = requestAnimationFrame(tick);
    };

    oscillateAnimRef.current = requestAnimationFrame(tick);

    return () => {
      if (oscillateAnimRef.current !== null) {
        cancelAnimationFrame(oscillateAnimRef.current);
        oscillateAnimRef.current = null;
      }
    };
  }, [isOscillating, config.duration, config.speedMultiplier]);

  // Initialize Three.js full-screen WebGL overlay canvas on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialConfig = configRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Explicit 100% transparent clear color
    rendererRef.current = renderer;

    const canvas = renderer.domElement;
    canvas.id = "webgl-noise-transition-canvas";
    canvas.className =
      "pointer-events-none fixed inset-0 z-[99990] h-full w-full opacity-0 invisible bg-transparent webgl-noise-overlay";
    canvasRef.current = canvas;
    document.body.appendChild(canvas);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      uniforms: {
        uColor: { value: hexToRgbVector(initialConfig.color) },
        uColorSecondary: { value: hexToRgbVector(initialConfig.colorSecondary) },
        uColorTertiary: { value: hexToRgbVector(initialConfig.colorTertiary) },
        uColorMode: {
          value:
            initialConfig.colorMode === "solid"
              ? 0.0
              : initialConfig.colorMode === "linear"
                ? 1.0
                : initialConfig.colorMode === "radial"
                  ? 2.0
                  : initialConfig.colorMode === "aurora"
                    ? 3.0
                    : 4.0,
        },
        uGradientAngle: { value: initialConfig.gradientAngle },
        uMaskMode: {
          value:
            initialConfig.maskMode === "standard"
              ? 0.0
              : initialConfig.maskMode === "inverted"
                ? 1.0
                : 2.0,
        },
        uEdgeGlowColor: { value: hexToRgbVector(initialConfig.edgeGlowColor) },
        uProgress: { value: 1.5 },
        uNoiseScale: { value: initialConfig.noiseScale },
        uEdge: { value: initialConfig.edge },
        uAspect: { value: aspect },
        uMaxAlpha: { value: initialConfig.maxAlpha },
        uAspectCorrect: { value: initialConfig.aspectCorrect ? 1.0 : 0.0 },
        uInvert: { value: initialConfig.invert ? 1.0 : 0.0 },
        uNoiseType: {
          value:
            initialConfig.noiseType === "classic"
              ? 0.0
              : initialConfig.noiseType === "fbm"
                ? 1.0
                : initialConfig.noiseType === "voronoi"
                  ? 2.0
                  : 3.0,
        },
        uOctaves: { value: initialConfig.octaves },
        uWarpStrength: { value: initialConfig.warpStrength },
        uDirection: {
          value:
            initialConfig.direction === "uniform"
              ? 0.0
              : initialConfig.direction === "left-to-right"
                ? 1.0
                : initialConfig.direction === "right-to-left"
                  ? 2.0
                  : initialConfig.direction === "bottom-to-top"
                    ? 3.0
                    : initialConfig.direction === "top-to-bottom"
                      ? 4.0
                      : 5.0,
        },
        uDirectionStrength: { value: initialConfig.directionStrength },
        uEdgeGlowIntensity: {
          value: initialConfig.edgeGlow ? initialConfig.edgeGlowIntensity : 0.0,
        },
        uEdgeGlowWidth: { value: initialConfig.edgeGlowWidth },
        uNoiseSeed: {
          value: new THREE.Vector2(
            initialConfig.noiseSeed * 1.37,
            initialConfig.noiseSeed * 2.89,
          ),
        },
      },
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Continuous 60fps render loop for butter-smooth WebGL animation
    const renderLoop = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    renderer.setAnimationLoop(renderLoop);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (materialRef.current) {
        materialRef.current.uniforms.uAspect.value = w / h;
      }
    };
    window.addEventListener("resize", onResize);

    // Check if coming from a previous transition that needs Enter execution
    const hasPendingEnter = sessionStorage.getItem("7h_webgl_pending_enter");
    if (hasPendingEnter === "true") {
      sessionStorage.removeItem("7h_webgl_pending_enter");
      const effectiveDuration = Math.max(0.1, initialConfig.duration / (initialConfig.speedMultiplier || 1.0));

      if (initialConfig.targetMode === "page-only") {
        const contentEl = document.getElementById("transition-test-content");
        const dispEl = document.getElementById("page-noise-disp");
        const elements = getScrubTargetElements();

        if (contentEl && dispEl) {
          elements.forEach(({ key, el }) => {
            if (initialConfig.elementTargets[key]) {
              el.setAttribute("data-dissolve", "active");
            }
          });
          dispEl.setAttribute("scale", initialConfig.displacementScale.toFixed(1));

          const proxy = { scale: initialConfig.displacementScale };
          const tl = gsap.timeline({
            defaults: { duration: effectiveDuration, ease: initialConfig.enterEase || "power2.out" },
            onComplete: () => {
              elements.forEach(({ el }) => el.removeAttribute("data-dissolve"));
              dispEl.setAttribute("scale", "0");
              setIsTransitioning(false);
            },
          });
          activeTimelineRef.current = tl;

          tl.to(
            proxy,
            {
              scale: 0,
              onUpdate: () => {
                dispEl.setAttribute("scale", proxy.scale.toFixed(1));
              },
            },
            0,
          );
        }
      } else {
        // Full veil mode: Noise veil dissolves away to reveal target page (ZERO opacity fade!)
        material.uniforms.uProgress.value = -0.75;
        gsap.set(canvas, { autoAlpha: 1, visibility: "visible", pointerEvents: "none" });
        renderer.render(scene, camera);

        const tl = gsap.timeline({
          defaults: { duration: effectiveDuration, ease: initialConfig.enterEase || initialConfig.ease },
          onComplete: () => {
            gsap.set(canvas, {
              pointerEvents: "none",
              autoAlpha: 0,
              visibility: "hidden",
            });
            material.uniforms.uProgress.value = 1.5;
            setIsTransitioning(false);
          },
        });
        activeTimelineRef.current = tl;

        if (initialConfig.holdDuration > 0) {
          tl.to({}, { duration: initialConfig.holdDuration });
        }

        tl.to(material.uniforms.uProgress, {
          value: 1.5,
          onUpdate: () => {
            renderer.render(scene, camera);
          },
        });
      }
    }

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", onResize);
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []); // Run once on mount

  // Keep uniforms synced to config
  useEffect(() => {
    configRef.current = config;
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value = hexToRgbVector(config.color);
      materialRef.current.uniforms.uColorSecondary.value = hexToRgbVector(config.colorSecondary);
      materialRef.current.uniforms.uColorTertiary.value = hexToRgbVector(config.colorTertiary);
      materialRef.current.uniforms.uColorMode.value =
        config.colorMode === "solid"
          ? 0.0
          : config.colorMode === "linear"
            ? 1.0
            : config.colorMode === "radial"
              ? 2.0
              : config.colorMode === "aurora"
                ? 3.0
                : 4.0;
      materialRef.current.uniforms.uGradientAngle.value = config.gradientAngle;
      materialRef.current.uniforms.uMaskMode.value =
        config.maskMode === "standard"
          ? 0.0
          : config.maskMode === "inverted"
            ? 1.0
            : 2.0;

      if (canvasRef.current) {
        canvasRef.current.style.setProperty(
          "--canvas-blend-mode",
          config.colorMode === "mask" ? (config.maskBlendMode || "normal") : "normal"
        );
      }

      materialRef.current.uniforms.uEdgeGlowColor.value = hexToRgbVector(config.edgeGlowColor);
      materialRef.current.uniforms.uNoiseScale.value = config.noiseScale;
      materialRef.current.uniforms.uEdge.value = config.edge;
      materialRef.current.uniforms.uMaxAlpha.value = config.maxAlpha;
      materialRef.current.uniforms.uAspectCorrect.value = config.aspectCorrect ? 1.0 : 0.0;
      materialRef.current.uniforms.uInvert.value = config.invert ? 1.0 : 0.0;
      materialRef.current.uniforms.uNoiseType.value =
        config.noiseType === "classic"
          ? 0.0
          : config.noiseType === "fbm"
            ? 1.0
            : config.noiseType === "voronoi"
              ? 2.0
              : 3.0;
      materialRef.current.uniforms.uOctaves.value = config.octaves;
      materialRef.current.uniforms.uWarpStrength.value = config.warpStrength;
      materialRef.current.uniforms.uDirection.value =
        config.direction === "uniform"
          ? 0.0
          : config.direction === "left-to-right"
            ? 1.0
            : config.direction === "right-to-left"
              ? 2.0
              : config.direction === "bottom-to-top"
                ? 3.0
                : config.direction === "top-to-bottom"
                  ? 4.0
                  : 5.0;
      materialRef.current.uniforms.uDirectionStrength.value = config.directionStrength;
      materialRef.current.uniforms.uEdgeGlowIntensity.value = config.edgeGlow
        ? config.edgeGlowIntensity
        : 0.0;
      materialRef.current.uniforms.uEdgeGlowWidth.value = config.edgeGlowWidth;
      materialRef.current.uniforms.uNoiseSeed.value = new THREE.Vector2(
        config.noiseSeed * 1.37,
        config.noiseSeed * 2.89,
      );

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }

    const turbEl = document.getElementById("page-noise-turb");
    if (turbEl) {
      turbEl.setAttribute("baseFrequency", config.noiseScale.toString());
    }
  }, [config]);

  // Elevation of persisted elements above the WebGL veil (ONLY when NOT actively transitioning routes)
  useEffect(() => {
    const elements = getScrubTargetElements();
    elements.forEach(({ key, el }) => {
      const isTargetedToDissolve = config.elementTargets[key];
      // Keep persisted elements (like the navigation header) elevated above the transition canvas
      if (!isTargetedToDissolve) {
        el.classList.add("z-[100000]");
      } else {
        el.classList.remove("z-[100000]");
      }
    });
  }, [config.elementTargets, pathname]);

  // Handle live scrubbing (ZERO OPACITY FADES - 100% Noise Driven)
  useEffect(() => {
    const canvas = canvasRef.current;
    const material = materialRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const contentEl = document.getElementById("transition-test-content");
    const dispEl = document.getElementById("page-noise-disp");
    const elements = getScrubTargetElements();

    if (!isScrubbing) {
      if (canvas) {
        gsap.set(canvas, {
          pointerEvents: "none",
          autoAlpha: 0,
          visibility: "hidden",
        });
      }
      if (material) {
        material.uniforms.uProgress.value = 1.5;
      }
      if (contentEl) {
        contentEl.removeAttribute("data-dissolve");
      }
      if (dispEl) {
        dispEl.setAttribute("scale", "0");
      }
      elements.forEach(({ el }) => {
        el.removeAttribute("data-dissolve");
      });
      return;
    }

    // Kill any running GSAP navigation animation during manual scrub
    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
    }

    // Progress normalized: 1.50 = 0% dissolve (clear), -0.75 = 100% dissolve (peak)
    const normalized = Math.max(0, Math.min(1, (1.5 - scrubProgress) / 2.25));

    // Drive Full Veil WebGL overlay (noise plane)
    if (config.targetMode === "full-veil") {
      if (canvas && material && renderer && scene && camera) {
        gsap.set(canvas, {
          pointerEvents: "none",
          autoAlpha: 1,
          visibility: "visible",
        });
        material.uniforms.uProgress.value = scrubProgress;
        renderer.render(scene, camera);
      }
    } else {
      // Page-only SVG noise displacement shattering (ZERO opacity fade!)
      if (dispEl) {
        dispEl.setAttribute(
          "scale",
          (normalized * config.displacementScale).toFixed(1),
        );
      }
      elements.forEach(({ key, el }) => {
        if (config.elementTargets[key]) {
          el.setAttribute("data-dissolve", "active");
        } else {
          el.removeAttribute("data-dissolve");
        }
      });
    }
  }, [isScrubbing, scrubProgress, config]);

  // Navigate with the transition (ZERO OPACITY FADE)
  const navigateWithTransition = useCallback(
    async (targetHref: string) => {
      if (isTransitioning) return;
      if (isScrubbing) setIsScrubbing(false);
      if (isOscillating) setIsOscillating(false);
      setIsTransitioning(true);

      const contentEl = document.getElementById("transition-test-content");
      const dispEl = document.getElementById("page-noise-disp");
      const effectiveDuration = Math.max(0.1, config.duration / (config.speedMultiplier || 1.0));
      const elements = getScrubTargetElements();

      if (config.targetMode === "page-only" && contentEl && dispEl) {
        elements.forEach(({ key, el }) => {
          if (config.elementTargets[key]) {
            el.setAttribute("data-dissolve", "active");
          }
        });

        const proxy = { scale: 0 };
        await new Promise<void>((resolve) => {
          const tl = gsap.timeline({
            defaults: {
              duration: effectiveDuration,
              ease: config.ease,
            },
            onComplete: resolve,
          });
          activeTimelineRef.current = tl;

          tl.to(
            proxy,
            {
              scale: config.displacementScale,
              onUpdate: () => {
                dispEl.setAttribute("scale", proxy.scale.toFixed(1));
              },
            },
            0,
          );
        });

        try {
          sessionStorage.setItem("7h_webgl_pending_enter", "true");
        } catch {}

        router.push(targetHref);
        return;
      }

      // Full veil mode: WebGL noise plane sweeps over page (NO opacity fade!)
      const canvas = canvasRef.current;
      const material = materialRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;

      if (!canvas || !material || !renderer || !scene || !camera) {
        router.push(targetHref);
        setIsTransitioning(false);
        return;
      }

      // Ensure persisted elements (like the navigation header) remain elevated above the transition veil
      elements.forEach(({ key, el }) => {
        if (!config.elementTargets[key]) {
          el.classList.add("z-[100000]");
        } else {
          el.classList.remove("z-[100000]");
        }
      });

      // Ensure 100% full opacity during route transition so the page switch is completely shielded
      material.uniforms.uMaxAlpha.value = 1.0;
      material.uniforms.uMaskMode.value = 0.0;

      gsap.set(canvas, {
        pointerEvents: "none",
        autoAlpha: 1,
        visibility: "visible",
      });

      material.uniforms.uProgress.value = 1.5;
      renderer.render(scene, camera);

      await new Promise<void>((resolve) => {
        const tl = gsap.timeline({
          defaults: {
            duration: effectiveDuration,
            ease: config.ease,
          },
          onComplete: resolve,
        });
        activeTimelineRef.current = tl;

        tl.to(material.uniforms.uProgress, {
          value: -0.75,
          onUpdate: () => {
            renderer.render(scene, camera);
          },
        });

        const holdTime = Math.max(0.02, config.holdDuration);
        if (holdTime > 0) {
          tl.to({}, { duration: holdTime });
        }
      });

      try {
        sessionStorage.setItem("7h_webgl_pending_enter", "true");
      } catch {}

      router.push(targetHref);
    },
    [router, config, isTransitioning, isScrubbing, isOscillating],
  );

  // When pathname changes after navigation, trigger the Enter phase (reveal)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      const contentEl = document.getElementById("transition-test-content");
      const dispEl = document.getElementById("page-noise-disp");
      const effectiveDuration = Math.max(0.1, config.duration / (config.speedMultiplier || 1.0));
      const elements = getScrubTargetElements();

      if (config.targetMode === "page-only" && contentEl && dispEl) {
        if (activeTimelineRef.current) activeTimelineRef.current.kill();
        elements.forEach(({ key, el }) => {
          if (config.elementTargets[key]) {
            el.setAttribute("data-dissolve", "active");
          }
        });
        dispEl.setAttribute("scale", config.displacementScale.toFixed(1));

        const proxy = { scale: config.displacementScale };
        const tl = gsap.timeline({
          defaults: { duration: effectiveDuration, ease: config.enterEase || "power2.out" },
          onComplete: () => {
            elements.forEach(({ el }) => el.removeAttribute("data-dissolve"));
            dispEl.setAttribute("scale", "0");
            setIsTransitioning(false);
          },
        });
        activeTimelineRef.current = tl;

        tl.to(
          proxy,
          {
            scale: 0,
            onUpdate: () => {
              dispEl.setAttribute("scale", proxy.scale.toFixed(1));
            },
          },
          0,
        );
        return;
      }

      // Enter full-veil mode: WebGL noise veil peels back to reveal target page (ZERO opacity fade!)
      const canvas = canvasRef.current;
      const material = materialRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;

      if (canvas && material && renderer && scene && camera) {
        if (material.uniforms.uProgress.value <= 0.2) {
          if (activeTimelineRef.current) activeTimelineRef.current.kill();
          gsap.set(canvas, {
            pointerEvents: "none",
            autoAlpha: 1,
            visibility: "visible",
          });
          material.uniforms.uMaxAlpha.value = 1.0;
          material.uniforms.uMaskMode.value = 0.0;
          renderer.render(scene, camera);

          const tl = gsap.timeline({
            defaults: { duration: effectiveDuration, ease: config.enterEase || config.ease },
            onComplete: () => {
              gsap.set(canvas, {
                pointerEvents: "none",
                autoAlpha: 0,
                visibility: "hidden",
              });
              material.uniforms.uProgress.value = 1.5;
              material.uniforms.uMaxAlpha.value = config.maxAlpha;
              material.uniforms.uMaskMode.value =
                config.maskMode === "standard"
                  ? 0.0
                  : config.maskMode === "inverted"
                    ? 1.0
                    : 2.0;
              setIsTransitioning(false);
            },
          });
          activeTimelineRef.current = tl;

          const holdTime = Math.max(0.02, config.holdDuration);
          if (holdTime > 0) {
            tl.to({}, { duration: holdTime });
          }

          tl.to(material.uniforms.uProgress, {
            value: 1.5,
            onUpdate: () => {
              renderer.render(scene, camera);
            },
          });
        } else {
          setIsTransitioning(false);
          gsap.set(canvas, {
            pointerEvents: "none",
            autoAlpha: 0,
            visibility: "hidden",
          });
        }
      } else {
        setIsTransitioning(false);
      }
    }
  }, [pathname, config]);

  // Preview in-place (leave + enter without changing page - ZERO opacity fade!)
  const previewInPlace = useCallback(async () => {
    if (isTransitioning) return;
    if (isScrubbing) setIsScrubbing(false);
    if (isOscillating) setIsOscillating(false);
    setIsTransitioning(true);

    const contentEl = document.getElementById("transition-test-content");
    const dispEl = document.getElementById("page-noise-disp");
    const effectiveDuration = Math.max(0.1, config.duration / (config.speedMultiplier || 1.0));
    const halfDuration = effectiveDuration * 0.75;
    const elements = getScrubTargetElements();

    if (config.targetMode === "page-only" && contentEl && dispEl) {
      elements.forEach(({ key, el }) => {
        if (config.elementTargets[key]) {
          el.setAttribute("data-dissolve", "active");
        }
      });
      const proxy = { scale: 0 };

      await new Promise<void>((resolve) => {
        const tl = gsap.timeline({
          onComplete: resolve,
        });
        activeTimelineRef.current = tl;

        tl.to(
          proxy,
          {
            scale: config.displacementScale,
            duration: halfDuration,
            ease: config.ease,
            onUpdate: () => {
              dispEl.setAttribute("scale", proxy.scale.toFixed(1));
            },
          },
          0,
        );

        if (config.holdDuration > 0) {
          tl.to({}, { duration: config.holdDuration });
        }

        tl.to(
          proxy,
          {
            scale: 0,
            duration: halfDuration,
            ease: config.enterEase || "power2.out",
            onUpdate: () => {
              dispEl.setAttribute("scale", proxy.scale.toFixed(1));
            },
          },
          `+=${0.05}`,
        );
      });

      elements.forEach(({ el }) => el.removeAttribute("data-dissolve"));
      dispEl.setAttribute("scale", "0");
      setIsTransitioning(false);
      return;
    }

    // PREVIEW FULL VEIL: WebGL noise dissolves in then out (ZERO opacity fade!)
    const canvas = canvasRef.current;
    const material = materialRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (!canvas || !material || !renderer || !scene || !camera) {
      setIsTransitioning(false);
      return;
    }

    elements.forEach(({ key, el }) => {
      if (!config.elementTargets[key]) {
        el.classList.add("z-[100000]");
      } else {
        el.classList.remove("z-[100000]");
      }
    });

    gsap.set(canvas, {
      pointerEvents: "none",
      autoAlpha: 1,
      visibility: "visible",
    });

    material.uniforms.uMaxAlpha.value = 1.0;
    material.uniforms.uMaskMode.value = 0.0;
    material.uniforms.uProgress.value = 1.5;
    renderer.render(scene, camera);

    await new Promise<void>((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(canvas, {
            pointerEvents: "none",
            autoAlpha: 0,
            visibility: "hidden",
          });
          material.uniforms.uProgress.value = 1.5;
          material.uniforms.uMaxAlpha.value = config.maxAlpha;
          material.uniforms.uMaskMode.value =
            config.maskMode === "standard"
              ? 0.0
              : config.maskMode === "inverted"
                ? 1.0
                : 2.0;
          setIsTransitioning(false);
          resolve();
        },
      });
      activeTimelineRef.current = tl;

      // Noise curtain sweeps over page (leave)
      tl.to(material.uniforms.uProgress, {
        value: -0.75,
        duration: halfDuration,
        ease: config.ease,
        onUpdate: () => {
          renderer.render(scene, camera);
        },
      });

      const holdTime = Math.max(0.08, config.holdDuration);
      if (holdTime > 0) {
        tl.to({}, { duration: holdTime });
      }

      // Noise curtain peels back (enter reveal)
      tl.to(material.uniforms.uProgress, {
        value: 1.5,
        duration: halfDuration,
        ease: config.enterEase || config.ease,
        onUpdate: () => {
          renderer.render(scene, camera);
        },
      });
    });
  }, [config, isTransitioning, isScrubbing, isOscillating]);

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setIsScrubbing(false);
    setIsOscillating(false);
    setScrubProgress(1.5);
  }, []);

  const resetToCodropsOriginal = useCallback(() => {
    setConfig({
      targetMode: "full-veil",
      color: "#beb9b8",
      colorSecondary: "#beb9b8",
      colorTertiary: "#ffffff",
      colorMode: "solid",
      gradientAngle: 0,
      maskMode: "standard",
      duration: 1.0,
      noiseScale: 5.0,
      noiseType: "classic",
      octaves: 3,
      warpStrength: 0.0,
      edge: 0.185,
      ease: "power1.in",
      enterEase: "power1.in",
      maxAlpha: 1.0,
      displacementScale: 65,
      aspectCorrect: false,
      invert: false,
      holdDuration: 0.0,
      speedMultiplier: 1.0,
      backdropBlur: "none",
      direction: "uniform",
      directionStrength: 1.0,
      edgeGlow: false,
      edgeGlowColor: "#c084fc",
      edgeGlowIntensity: 1.5,
      edgeGlowWidth: 0.08,
      noiseSeed: 0,
      elementTargets: {
        header: true,
        hero: true,
        controlStudio: false,
        cards: true,
        specs: true,
        background: false,
      },
      crossScrubSimulation: false,
    });
    setIsScrubbing(false);
    setIsOscillating(false);
    setScrubProgress(1.5);
  }, []);

  const copyConfigJson = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      return true;
    } catch {
      return false;
    }
  }, [config]);

  const loadConfigJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      setConfig((prev) => ({ ...prev, ...parsed }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = TRANSITION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setConfig((prev) => ({ ...prev, ...preset.config }));
    if (preset.config.targetMode === "page-only") {
      setScrubProgress(1.5);
    }
  }, []);

  const applyGradientPreset = useCallback(
    (preset: (typeof GRADIENT_PRESETS)[number]) => {
      setConfig((prev) => ({
        ...prev,
        color: preset.colorA,
        colorSecondary: preset.colorB,
        colorTertiary: preset.colorC,
        colorMode: "linear",
        gradientAngle: preset.angle,
      }));
    },
    [],
  );

  const setElementTarget = useCallback(
    (key: keyof ElementScrubTargets, val: boolean) => {
      setConfig((prev) => ({
        ...prev,
        elementTargets: { ...prev.elementTargets, [key]: val },
      }));
    },
    [],
  );

  const applyElementPreset = useCallback(
    (preset: "all" | "persist-chrome" | "cards-only" | "hero-only") => {
      setConfig((prev) => {
        let targets: ElementScrubTargets = {
          header: true,
          hero: true,
          controlStudio: true,
          cards: true,
          specs: true,
          background: false,
        };
        if (preset === "persist-chrome") {
          targets = {
            header: false,
            hero: true,
            controlStudio: false,
            cards: true,
            specs: true,
            background: false,
          };
        } else if (preset === "cards-only") {
          targets = {
            header: false,
            hero: false,
            controlStudio: false,
            cards: true,
            specs: false,
            background: false,
          };
        } else if (preset === "hero-only") {
          targets = {
            header: false,
            hero: true,
            controlStudio: false,
            cards: false,
            specs: false,
            background: false,
          };
        }
        return { ...prev, elementTargets: targets };
      });
    },
    [],
  );

  const contextValue: WebGLTransitionContextValue = useMemo(
    () => ({
      config,
      setConfig,
      navigateWithTransition,
      previewInPlace,
      isTransitioning,
      isScrubbing,
      setIsScrubbing,
      isOscillating,
      setIsOscillating,
      scrubProgress,
      setScrubProgress,
      resetToDefaults,
      resetToCodropsOriginal,
      copyConfigJson,
      loadConfigJson,
      applyPreset,
      applyGradientPreset,
      setElementTarget,
      applyElementPreset,
    }),
    [
      config,
      navigateWithTransition,
      previewInPlace,
      isTransitioning,
      isScrubbing,
      isOscillating,
      scrubProgress,
      resetToDefaults,
      resetToCodropsOriginal,
      copyConfigJson,
      loadConfigJson,
      applyPreset,
      applyGradientPreset,
      setElementTarget,
      applyElementPreset,
    ],
  );

  return (
    <WebGLTransitionContext.Provider value={contextValue}>
      {/* SVG Displacement Filter for Page-Only Mode */}
      <svg
        id="webgl-noise-svg-filters"
        aria-hidden="true"
        className="pointer-events-none fixed -top-[9999px] -left-[9999px] h-0 w-0 opacity-0"
      >
        <defs>
          <filter
            id="page-noise-dissolve"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence
              id="page-noise-turb"
              type="fractalNoise"
              baseFrequency={config.noiseScale.toString()}
              numOctaves={config.octaves.toString()}
              result="noise"
            />
            <feDisplacementMap
              id="page-noise-disp"
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Live Next Page Target Portal (revealed through noise aperture during cross-scrub) */}
      {config.crossScrubSimulation && isScrubbing && (
        <LiveNextPageViewportPortal
          target={pathname === "/transition-test/page-a" ? "page-b" : "page-a"}
          normalizedProgress={Math.max(0, Math.min(1, (1.5 - scrubProgress) / 2.25))}
          onNavigate={() =>
            navigateWithTransition(
              pathname === "/transition-test/page-a"
                ? "/transition-test/page-b"
                : "/transition-test/page-a"
            )
          }
          onClose={() =>
            setConfig((c) => ({ ...c, crossScrubSimulation: false }))
          }
        />
      )}

      {children}
      <WebGLTransitionTuner />
    </WebGLTransitionContext.Provider>
  );
}

export function WebGLTransitionLink({
  href,
  children,
  className = "",
  activeClassName = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}) {
  const { navigateWithTransition, isTransitioning } = useWebGLTransition();
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <button
      type="button"
      onClick={() => {
        if (isActive || isTransitioning) return;
        navigateWithTransition(href);
      }}
      className={`${className} ${isActive ? activeClassName : ""}`}
      disabled={isTransitioning}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </button>
  );
}

export const ELEMENT_TARGET_INFO: {
  key: keyof ElementScrubTargets;
  label: string;
  selector: string;
  desc: string;
}[] = [
  {
    key: "header",
    label: "Top Navigation Header",
    selector: '[data-scrub-target="header"]',
    desc: "Fixed top bar with title, breadcrumbs, and page links. When Persisted, sits above the WebGL veil (z-[100000]) and never gets covered.",
  },
  {
    key: "hero",
    label: "Hero Showcase & Title",
    selector: '[data-scrub-target="hero"]',
    desc: "The primary h1 headline, pill badges, and direct navigation action buttons.",
  },
  {
    key: "controlStudio",
    label: "Transition Studio Section",
    selector: '[data-scrub-target="control-studio"]',
    desc: "The interactive control panel deck. Keep Persisted so controls stay firmly clickable under your cursor while scrubbing!",
  },
  {
    key: "cards",
    label: "Feature & Milestone Cards",
    selector: '[data-scrub-target="cards"]',
    desc: "Dense content grids, concert statistics, and band milestone highlight boxes.",
  },
  {
    key: "specs",
    label: "Detailed Specs & Guides",
    selector: '[data-scrub-target="specs"]',
    desc: "Lower body sections, GLSL code snippets, and testing recommendations.",
  },
  {
    key: "background",
    label: "Ambient Background Shader Canvas",
    selector: "canvas#home-shader-gradient",
    desc: "The fluid animated background canvas. When Persisted (recommended), background continues animating visibly through the noise.",
  },
];

/**
 * Full-featured interactive control deck component.
 * Can be embedded directly inside pages (e.g. Page A / Page B) for spacious, in-depth experimentation.
 */
export function WebGLControlDeck({ className = "" }: { className?: string }) {
  const {
    config,
    setConfig,
    navigateWithTransition,
    previewInPlace,
    isTransitioning,
    isScrubbing,
    setIsScrubbing,
    isOscillating,
    setIsOscillating,
    scrubProgress,
    setScrubProgress,
    resetToDefaults,
    resetToCodropsOriginal,
    copyConfigJson,
    loadConfigJson,
    applyPreset,
    applyGradientPreset,
    setElementTarget,
    applyElementPreset,
  } = useWebGLTransition();

  const [activeTab, setActiveTab] = useState<
    "color" | "shader" | "direction" | "motion" | "elements" | "presets"
  >("color");
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonError, setJsonError] = useState(false);
  const pathname = usePathname();

  const handleCopy = async () => {
    const ok = await copyConfigJson();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoadJson = () => {
    if (!jsonInput.trim()) return;
    const ok = loadConfigJson(jsonInput);
    if (ok) {
      setShowJsonModal(false);
      setJsonError(false);
      setJsonInput("");
    } else {
      setJsonError(true);
    }
  };

  const normalizedScrub = Math.round(
    Math.max(0, Math.min(1, (1.5 - scrubProgress) / 2.25)) * 100,
  );

  const stepScrub = (delta: number) => {
    if (!isScrubbing) setIsScrubbing(true);
    if (isOscillating) setIsOscillating(false);
    const currNorm = Math.max(0, Math.min(1, (1.5 - scrubProgress) / 2.25));
    const nextNorm = Math.max(0, Math.min(1, currNorm + delta));
    setScrubProgress(1.5 - nextNorm * 2.25);
  };

  const isPageA = pathname === "/transition-test/page-a";
  const otherPageRoute = isPageA
    ? "/transition-test/page-b"
    : "/transition-test/page-a";
  const otherPageLabel = isPageA
    ? "Page B (Concert Experience)"
    : "Page A (Band Showcase)";

  return (
    <div
      className={`relative z-20 rounded-[var(--radius-box)] border border-white/15 bg-black/40 p-6 md:p-8 shadow-2xl backdrop-blur-xl text-zinc-100 flex flex-col gap-6 ${className}`}
    >
      {/* Deck Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-xs font-semibold text-purple-300">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Codrops WebGL About Transition Studio</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Purple Gradient &bull; Shader Mask &bull; Pure Procedural</span>
            </div>
          </div>
          <h2 className="font-black text-white tracking-tight">
            Transition Parameters &amp; Shader Control Suite
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Full procedural control: Purple Linear &amp; Radial Gradients, Aurora Noise Flow, Cutout Stencil Masking, Grain Scaling, Burning Edge Glow, and Directional Sweeps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetToCodropsOriginal}
            title="Reset to 2019 Codrops Stone Gray (#beb9b8)"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 px-3 py-2 text-xs font-semibold text-purple-200 hover:border-purple-400 hover:text-white transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Codrops 2019 Original</span>
          </button>

          <button
            type="button"
            onClick={resetToDefaults}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-white/30 hover:text-white transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-white/30 hover:text-white transition active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Config Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowJsonModal((prev) => !prev)}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-white/30 hover:text-white transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {/* JSON Import Modal / Panel */}
      {showJsonModal && (
        <div className="rounded-2xl border border-purple-500/50 bg-black/80 p-5 flex flex-col gap-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-400" />
              <span>Import Config JSON</span>
            </span>
            <button
              type="button"
              onClick={() => setShowJsonModal(false)}
              className="text-xs text-zinc-400 hover:text-white transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Paste any WebGLTransitionConfig JSON to instantly load full shader parameters, colors, and timing:
          </p>
          <textarea
            rows={4}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"color": "#8a1cfc", "colorSecondary": "#ec4899", "colorMode": "linear", "maskMode": "standard" ...}'
            className="w-full rounded-xl border border-white/20 bg-zinc-950 p-3 font-mono text-xs text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
          />
          {jsonError && (
            <span className="text-xs text-rose-400 font-medium">
              Invalid JSON format. Please ensure valid JSON syntax.
            </span>
          )}
          <button
            type="button"
            onClick={handleLoadJson}
            className="self-end rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 active:scale-95 transition"
          >
            Apply Config JSON
          </button>
        </div>
      )}

      {/* Time Machine Interactive Scrubber & Live Oscillate Bar */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5 md:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOscillating
                    ? "animate-ping bg-emerald-400"
                    : isScrubbing
                      ? "animate-ping bg-purple-400"
                      : "bg-zinc-600"
                }`}
              />
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  isOscillating
                    ? "bg-emerald-500"
                    : isScrubbing
                      ? "bg-purple-500"
                      : "bg-zinc-500"
                }`}
              />
            </span>
            <h3 className="font-bold text-white tracking-wide">
              Time Machine (Live Scrubber &amp; Frame Inspector)
            </h3>
          </div>

          {/* Master Toggles: Scrub Mode & Live Oscillate Loop */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isOscillating ? "animate-spin text-emerald-400" : "text-zinc-400"
                  }`}
                />
                <span>Auto Loop:</span>
              </span>
              <Toggle
                size="sm"
                checked={isOscillating}
                onChange={(val) => setIsOscillating(val)}
                label={isOscillating ? "Active" : "OFF"}
              />
            </div>

            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xs text-zinc-300 font-medium">Scrub Mode:</span>
              <Toggle
                size="sm"
                checked={isScrubbing}
                onChange={(val) => {
                  if (!val && isOscillating) setIsOscillating(false);
                  setIsScrubbing(val);
                }}
                label={isScrubbing ? "Active (Frozen)" : "Inactive"}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-300">
          Turn on <strong>Auto Loop</strong> to watch the procedural dissolve cycle continuously while tweaking sliders, or use <strong>Scrub Mode</strong> to freeze time at any frame.
        </p>

        {/* Range slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">0% (Clear / Open)</span>
            <span className="rounded-md bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-purple-300 font-bold">
              Progress: {normalizedScrub}% &bull; uProgress: {scrubProgress.toFixed(3)}
            </span>
            <span className="text-zinc-400">100% (Peak Dissolve Veil)</span>
          </div>

          <input
            type="range"
            min="-0.75"
            max="1.50"
            step="0.005"
            value={scrubProgress}
            onChange={(e) => {
              if (isOscillating) setIsOscillating(false);
              if (!isScrubbing) setIsScrubbing(true);
              setScrubProgress(parseFloat(e.target.value));
            }}
            className="w-full accent-purple-500 cursor-pointer h-2.5 rounded-lg bg-zinc-800"
          />

          {/* Micro-Steps & Quick Scrub Jumps */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-400 mr-1">Micro Step:</span>
              <button
                type="button"
                onClick={() => stepScrub(-0.10)}
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 hover:border-white/25 active:scale-95 transition-colors duration-150"
              >
                &larr; -10%
              </button>
              <button
                type="button"
                onClick={() => stepScrub(-0.01)}
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 hover:border-white/25 active:scale-95 transition-colors duration-150"
              >
                -1%
              </button>
              <button
                type="button"
                onClick={() => stepScrub(+0.01)}
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 hover:border-white/25 active:scale-95 transition-colors duration-150"
              >
                +1%
              </button>
              <button
                type="button"
                onClick={() => stepScrub(+0.10)}
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 hover:border-white/25 active:scale-95 transition-colors duration-150"
              >
                +10% &rarr;
              </button>
            </div>

            {/* Quick Scrub Jumps */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-400 mr-1">Quick Jump:</span>
              {[
                { label: "0% (Clear)", val: 1.5 },
                { label: "25% (Onset)", val: 0.9375 },
                { label: "50% (Mid-Dissolve)", val: 0.375 },
                { label: "75% (Dense)", val: -0.1875 },
                { label: "100% (Peak)", val: -0.75 },
              ].map((jump) => (
                <button
                  key={jump.label}
                  type="button"
                  onClick={() => {
                    if (isOscillating) setIsOscillating(false);
                    if (!isScrubbing) setIsScrubbing(true);
                    setScrubProgress(jump.val);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-medium transition ${
                    Math.abs(scrubProgress - jump.val) < 0.05
                      ? "bg-purple-600 text-white font-bold"
                      : "bg-white/5 border border-white/10 text-zinc-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {jump.label}
                </button>
              ))}
            </div>

            {/* Cross-Scrub Dual Page Simulator Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-300 font-medium">
                Dual-Page Cross-Scrub Preview:
              </span>
              <Toggle
                size="sm"
                checked={config.crossScrubSimulation}
                onChange={(val) =>
                  setConfig((prev) => ({ ...prev, crossScrubSimulation: val }))
                }
                label={config.crossScrubSimulation ? "ON" : "OFF"}
              />
            </div>
          </div>
        </div>

        {/* Dual-Page Cross-Scrub Visualizer Card */}
        {config.crossScrubSimulation && (
          <div className="mt-2 rounded-xl border border-purple-500/40 bg-black/80 p-4 sm:p-5 flex flex-col gap-4 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Cross-Page Dissolve Stage (Zero Opacity Fades)
                </span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono">
                  {normalizedScrub}% Dissolved
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">
                  {isPageA ? "Page A (Showcase) → Page B (Arena)" : "Page B (Arena) → Page A (Showcase)"}
                </span>
                <button
                  type="button"
                  onClick={() => navigateWithTransition(otherPageRoute)}
                  className="rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-purple-500 transition cursor-pointer"
                >
                  Commit Route Swap &rarr;
                </button>
              </div>
            </div>

            {/* Visual Cross-Page Stage Composite */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Card 1: Outgoing Page */}
              <div className="flex flex-col gap-2.5 p-4 rounded-xl border border-white/10 bg-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Current Outgoing Page
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    {100 - normalizedScrub}% Intact
                  </span>
                </div>
                {/* heading-size-ok: preset title */}
                <h4 className="font-bold text-white">
                  {isPageA ? "Page A: Band Showcase & Discography" : "Page B: Concert Experience & Tour Life"}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {isPageA
                    ? "Currently actively mounted. Noise dissolve disintegrates this layout during leave phase."
                    : "Currently actively mounted. Noise dissolve disintegrates this layout during leave phase."}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>State:</span>
                  <span className="text-purple-300 font-bold">
                    {normalizedScrub < 25 ? "Full Display" : normalizedScrub < 75 ? "Disintegrating" : "Veiled"}
                  </span>
                </div>
              </div>

              {/* Card 2: Noise Mask / Dissolve Aperture */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 text-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-purple-400 flex items-center justify-center bg-black/60 shadow-lg">
                  <Layers className="w-5 h-5 text-purple-300 animate-spin" />
                </div>
                <span className="text-xs font-bold text-white">
                  Procedural Noise Aperture
                </span>
                <span className="text-[11px] font-mono text-purple-300">
                  uProgress: {scrubProgress.toFixed(3)}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {config.colorMode === "mask" ? "Pure Mask Cutout" : `${config.colorMode} Gradient`} &bull; {config.maskMode}
                </span>
              </div>

              {/* Card 3: Incoming Target Page (Live Mockup) */}
              <div className="flex flex-col gap-2.5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                    Incoming Target Page
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    {normalizedScrub}% Revealed
                  </span>
                </div>
                {/* heading-size-ok: preset title */}
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  {isPageA ? (
                    <>
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Page B: Concert Experience</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Page A: Band Showcase</span>
                    </>
                  )}
                </h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {isPageA
                    ? "Target Page B emerges through the noise aperture with pyrotechnics, spatial audio, and live arena energy."
                    : "Target Page A emerges through the noise aperture with 5,000+ concerts, 30+ albums, and Guinness record milestones."}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                    {normalizedScrub > 50 ? "Ready to Unveil" : "Behind Aperture"}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateWithTransition(otherPageRoute)}
                    className="text-[11px] text-emerald-300 font-bold hover:underline cursor-pointer"
                  >
                    Transition Now &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Studio Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-3">
        {[
          { id: "color", label: "Purple Gradient & Mask", icon: Palette },
          { id: "shader", label: "Shader & Noise Physics", icon: Gauge },
          { id: "direction", label: "Direction & Sweeps", icon: Compass },
          { id: "motion", label: "Timing & Easing", icon: Wind },
          { id: "elements", label: "Element Targets", icon: Eye },
          { id: "presets", label: "1-Click Presets Bank", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition active:scale-95 ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PURPLE GRADIENT & SHADER MASK */}
      {activeTab === "color" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Color Mode / Gradient Style */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>Color &amp; Gradient Style</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "linear", label: "Linear Gradient", desc: "Smooth directional multi-stop gradient" },
                { id: "radial", label: "Radial Gradient", desc: "Center glow radiating outwards" },
                { id: "aurora", label: "Aurora Noise Flow", desc: "Colors blend along noise turbulence" },
                { id: "solid", label: "Solid Color", desc: "Single solid or translucent color tone" },
                { id: "mask", label: "Shader Mask (No Gradient)", desc: "Acts purely as a mask/matte instead of colors" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      colorMode: m.id as ColorStyleMode,
                      // If switching to pure mask, default to black matte if color was bright purple
                      ...(m.id === "mask" && c.color === "#8a1cfc" ? { color: "#000000" } : {}),
                    }))
                  }
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition ${
                    m.id === "mask" ? "col-span-2 border-dashed" : ""
                  } ${
                    config.colorMode === m.id
                      ? "border-purple-500 bg-purple-950/40 text-white font-bold"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-semibold">{m.label}</span>
                  <span className="text-[10px] text-zinc-400">{m.desc}</span>
                </button>
              ))}
            </div>

            {/* Gradient Angle Slider (if Linear) */}
            {config.colorMode === "linear" && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-medium">Gradient Angle</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {config.gradientAngle}&deg;
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={config.gradientAngle}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      gradientAngle: parseInt(e.target.value, 10),
                    }))
                  }
                  className="accent-purple-500 cursor-pointer"
                />
              </div>
            )}

            {/* Mask Mode Status Callout */}
            {config.colorMode === "mask" && (
              <div className="flex flex-col gap-1 p-2 rounded-lg border border-purple-500/20 bg-purple-950/20 text-xs text-purple-200">
                <span className="font-semibold flex items-center gap-1.5 text-white">
                  <Layers className="w-3 h-3 text-purple-400" />
                  Pure Mask Mode Active
                </span>
                <span className="text-[11px] text-zinc-300">
                  Gradient colors are disabled. The shader acts as a monochrome aperture, cutout stencil, or matte mask.
                </span>
              </div>
            )}
          </div>

          {/* Color Stops Customizer OR Mask Matte Controls */}
          {config.colorMode === "mask" ? (
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-purple-500/30 bg-purple-950/10">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Mask Matte &amp; Stencil Controls</span>
              </span>

              {/* 1-Click Mask Archetypes */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-zinc-400">1-Click Mask Archetypes:</span>
                <div className="flex flex-col gap-1.5 max-h-[175px] overflow-y-auto pr-1">
                  {MASK_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, ...p.config }))}
                      className="flex items-center justify-between p-2 rounded-lg border border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-purple-950/30 text-left transition group"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white transition-colors duration-150 group-hover:text-purple-300">
                          {p.label}
                        </span>
                        <span className="text-[10px] text-zinc-400">{p.desc}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 text-zinc-400 font-mono whitespace-nowrap ml-2">
                        {p.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Matte Tone */}
              <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
                <span className="text-[11px] text-zinc-400">Mask Matte Tone</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, color: e.target.value }))
                    }
                    className="h-8 w-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.color}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, color: e.target.value }))
                    }
                    className="flex-1 rounded-lg border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-xs text-white uppercase focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mask Blend Mode */}
              <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
                <span className="text-[11px] text-zinc-400">Canvas Mix-Blend Mode</span>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                  {(["normal", "multiply", "screen", "difference"] as MaskBlendMode[]).map((bm) => (
                    <button
                      key={bm}
                      type="button"
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          maskBlendMode: bm,
                        }))
                      }
                      className={`py-1 rounded border capitalize transition ${
                        (config.maskBlendMode || "normal") === bm
                          ? "border-purple-500 bg-purple-950/60 text-white font-bold"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {bm}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Gradient Color Stops</span>
              </span>

              {/* Color Stop A */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-zinc-400">Stop 1 (Primary Purple)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, color: e.target.value }))
                    }
                    className="h-8 w-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.color}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, color: e.target.value }))
                    }
                    className="flex-1 rounded-lg border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-xs text-white uppercase focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Color Stop B */}
              {config.colorMode !== "solid" && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-zinc-400">Stop 2 (Secondary Color)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colorSecondary}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, colorSecondary: e.target.value }))
                      }
                      className="h-8 w-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colorSecondary}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, colorSecondary: e.target.value }))
                      }
                      className="flex-1 rounded-lg border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-xs text-white uppercase focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Color Stop C (For Aurora / Multi-Stop) */}
              {config.colorMode === "aurora" && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-zinc-400">Stop 3 (Aurora Accent)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colorTertiary}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, colorTertiary: e.target.value }))
                      }
                      className="h-8 w-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colorTertiary}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, colorTertiary: e.target.value }))
                      }
                      className="flex-1 rounded-lg border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-xs text-white uppercase focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Quick Purple Gradient Presets */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <span className="text-[11px] text-zinc-400">1-Click Purple Gradients:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {GRADIENT_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyGradientPreset(p)}
                      title={p.desc}
                      className="h-8 rounded-lg border border-white/20 p-0.5 hover:border-white/50 transition active:scale-95 flex items-center justify-center overflow-hidden"
                    >
                      <span
                        className="w-full h-full rounded-md bg-[linear-gradient(135deg,var(--grad-a),var(--grad-b))]"
                        style={
                          {
                            "--grad-a": p.colorA,
                            "--grad-b": p.colorB,
                          } as CSSProperties
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Masking Architecture & Alpha */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Shader Masking Architecture</span>
            </span>

            <div className="flex flex-col gap-2">
              {[
                {
                  id: "standard",
                  label: "Standard Dissolve Veil",
                  desc: "Noise curtain with gradient sweep covers page completely",
                },
                {
                  id: "inverted",
                  label: "Inverted Cutout Mask",
                  desc: "Punches a window hole through the veil to reveal target page",
                },
                {
                  id: "stencil",
                  label: "Luminance Contour Stencil",
                  desc: "Geometric high-contrast stencil line cutout mask",
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      maskMode: m.id as MaskMode,
                    }))
                  }
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                    config.maskMode === m.id
                      ? "border-purple-500 bg-purple-950/40 text-white font-bold"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-semibold">{m.label}</span>
                  <span className="text-[10px] text-zinc-400">{m.desc}</span>
                </button>
              ))}
            </div>

            {/* Veil Max Alpha / Transparency */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-medium">Veil Max Alpha</span>
                <span className="font-mono text-purple-300 font-bold">
                  {Math.round(config.maxAlpha * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={config.maxAlpha}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    maxAlpha: parseFloat(e.target.value),
                  }))
                }
                className="accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Burning Edge Glow Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Burning Edge Glow:</span>
              </span>
              <Toggle
                size="sm"
                checked={config.edgeGlow}
                onChange={(val) =>
                  setConfig((prev) => ({ ...prev, edgeGlow: val }))
                }
                label={config.edgeGlow ? "Glowing" : "Disabled"}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHADER & NOISE PHYSICS */}
      {activeTab === "shader" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Noise Algorithm Selection */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>Noise Generator Algorithm</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "classic", label: "Classic Codrops", desc: "Authentic 2D value noise" },
                { id: "fbm", label: "FBM Fractal", desc: "Multi-layered fractal brownian" },
                { id: "voronoi", label: "Voronoi Shards", desc: "Cellular glass polygon crystals" },
                { id: "warp", label: "Domain Warp", desc: "Swirling turbulent liquid ink" },
              ].map((algo) => (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      noiseType: algo.id as NoiseAlgorithm,
                    }))
                  }
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition ${
                    config.noiseType === algo.id
                      ? "border-purple-500 bg-purple-950/40 text-white font-bold"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-semibold">{algo.label}</span>
                  <span className="text-[10px] text-zinc-400">{algo.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Noise Grain Frequency */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Noise Grain Frequency (Scale)</span>
              <span className="font-mono text-purple-300 font-bold">
                {config.noiseScale.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="40.0"
              step="0.5"
              value={config.noiseScale}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  noiseScale: parseFloat(e.target.value),
                }))
              }
              className="accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400">
              Codrops original is 5.0. Lower = sweeping broad clouds. Higher = dense particle sand.
            </span>
          </div>

          {/* Edge Softness / Feathering */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Edge Softness / Feathering (uEdge)</span>
              <span className="font-mono text-purple-300 font-bold">
                {config.edge.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.45"
              step="0.005"
              value={config.edge}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  edge: parseFloat(e.target.value),
                }))
              }
              className="accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400">
              Codrops original is 0.185. 0.01 = razor sharp threshold stencil cut &bull; 0.45 = foggy cloud.
            </span>
          </div>

          {/* FBM Octaves (Only active if FBM) */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Fractal Octaves (FBM Layers)</span>
              <span className="font-mono text-purple-300 font-bold">
                {config.octaves} Octaves
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={config.octaves}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  octaves: parseInt(e.target.value, 10),
                }))
              }
              className="accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400">
              Adds recursive high-frequency noise layers for rich organic detail.
            </span>
          </div>

          {/* Domain Warp Turbulence */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Domain Warp Turbulence</span>
              <span className="font-mono text-purple-300 font-bold">
                {config.warpStrength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={config.warpStrength}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  warpStrength: parseFloat(e.target.value),
                }))
              }
              className="accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400">
              Warps the coordinate space to create swirling smoke and fluid distortions.
            </span>
          </div>

          {/* Noise Spatial Seed */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Spatial Offset Seed</span>
              <span className="font-mono text-purple-300 font-bold">
                Seed #{config.noiseSeed}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={config.noiseSeed}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  noiseSeed: parseInt(e.target.value, 10),
                }))
              }
              className="accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400">
              Generates a new noise pattern variation across the canvas.
            </span>
          </div>

          {/* Shading Switches */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-xs font-bold text-white">Projection Modifiers</span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">Aspect Ratio Correction:</span>
              <Toggle
                size="sm"
                checked={config.aspectCorrect}
                onChange={(val) =>
                  setConfig((prev) => ({ ...prev, aspectCorrect: val }))
                }
                label={config.aspectCorrect ? "Square Cells" : "Stretched"}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">Invert Noise Polarity:</span>
              <Toggle
                size="sm"
                checked={config.invert}
                onChange={(val) =>
                  setConfig((prev) => ({ ...prev, invert: val }))
                }
                label={config.invert ? "Inverted" : "Normal"}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIRECTION & SWEEPS */}
      {activeTab === "direction" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>Dissolve Sweep Pattern</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "uniform", label: "Omnidirectional", desc: "Everywhere at once (Codrops default)" },
                { id: "left-to-right", label: "Horizontal (L → R)", desc: "Sweeps left across to right" },
                { id: "right-to-left", label: "Horizontal (R → L)", desc: "Sweeps right across to left" },
                { id: "bottom-to-top", label: "Vertical (B → T)", desc: "Rises upward like stage smoke" },
                { id: "top-to-bottom", label: "Vertical (T → B)", desc: "Cascades downward like a curtain" },
                { id: "radial-out", label: "Radial Center Out", desc: "Expands outward from center viewport" },
              ].map((dir) => (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      direction: dir.id as DissolveDirection,
                    }))
                  }
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition ${
                    config.direction === dir.id
                      ? "border-purple-500 bg-purple-950/40 text-white font-bold"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-semibold">{dir.label}</span>
                  <span className="text-[10px] text-zinc-400">{dir.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Directional Gradient Intensity</span>
              <span className="font-mono text-purple-300 font-bold">
                {config.directionStrength.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={config.directionStrength}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  directionStrength: parseFloat(e.target.value),
                }))
              }
              className="accent-purple-500 cursor-pointer"
            />
            <p className="text-xs text-zinc-400 leading-relaxed">
              Higher values create a sharper directional wipe boundary between pages, while lower values blend the directional gradient softly into the procedural noise.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: TIMING & EASING */}
      {activeTab === "motion" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Duration */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Base Transition Duration</span>
              <span className="font-mono text-purple-300 font-bold">
                {config.duration.toFixed(2)}s
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="4.0"
              step="0.05"
              value={config.duration}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  duration: parseFloat(e.target.value),
                }))
              }
              className="accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400">
              Codrops original is 1.0s. Controls how long the noise takes to dissolve in and out.
            </span>
          </div>

          {/* Speed Multiplier */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-xs font-bold text-white">Speed Multiplier</span>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: "0.25x", val: 0.25 },
                { label: "0.5x", val: 0.5 },
                { label: "1.0x", val: 1.0 },
                { label: "1.5x", val: 1.5 },
                { label: "2.0x", val: 2.0 },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() =>
                    setConfig((c) => ({ ...c, speedMultiplier: s.val }))
                  }
                  className={`py-2 rounded-lg text-xs font-mono font-medium transition ${
                    config.speedMultiplier === s.val
                      ? "bg-purple-600 text-white font-bold"
                      : "bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-400">
              Use 0.25x for extreme slow-motion frame examination.
            </span>
          </div>

          {/* Hold Duration */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Hold Duration at Peak Veil</span>
              <span className="font-mono text-purple-300 font-bold">
                {config.holdDuration.toFixed(2)}s
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.05"
              value={config.holdDuration}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  holdDuration: parseFloat(e.target.value),
                }))
              }
              className="accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400">
              Pauses momentarily at full dissolve coverage before revealing target page.
            </span>
          </div>

          {/* Leave Easing */}
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-white/5">
            <label className="text-xs font-bold text-white">GSAP Leave Ease (Dissolve Onset)</label>
            <select
              value={config.ease}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, ease: e.target.value }))
              }
              className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-zinc-200 focus:border-purple-500 focus:outline-none"
            >
              {EASE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* Enter Easing */}
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-white/5">
            <label className="text-xs font-bold text-white">GSAP Enter Ease (Target Reveal)</label>
            <select
              value={config.enterEase}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, enterEase: e.target.value }))
              }
              className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-zinc-200 focus:border-purple-500 focus:outline-none"
            >
              {ENTER_EASE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* TAB 5: ELEMENT TARGETS */}
      {activeTab === "elements" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span>Element Scrub Targets &amp; Page-to-Page Visibility Rules</span>
              </span>
              <p className="text-xs text-zinc-400 mt-0.5">
                Choose which sections get covered by the noise veil vs which sections stay anchored above the noise.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyElementPreset("persist-chrome")}
                className="px-2.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 text-xs font-semibold text-purple-300 hover:bg-purple-900/50 transition active:scale-95"
              >
                Persist Chrome &amp; Controls (Recommended)
              </button>
              <button
                type="button"
                onClick={() => applyElementPreset("all")}
                className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:border-white/25 hover:text-white transition active:scale-95"
              >
                Dissolve All Elements
              </button>
              <button
                type="button"
                onClick={() => applyElementPreset("cards-only")}
                className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:border-white/25 hover:text-white transition active:scale-95"
              >
                Cards Only
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ELEMENT_TARGET_INFO.map((item) => {
              const isDissolving = config.elementTargets[item.key];
              return (
                <div
                  key={item.key}
                  className={`flex flex-col justify-between p-4 rounded-xl border transition ${
                    isDissolving
                      ? "border-purple-500/40 bg-purple-950/20"
                      : "border-emerald-500/30 bg-emerald-950/15"
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        {isDissolving ? (
                          <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{item.label}</span>
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isDissolving
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {isDissolving ? "Dissolves Under Noise" : "Persists (Above Noise)"}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
                    <span className="text-xs text-zinc-300 font-medium">
                      Dissolve with Noise:
                    </span>
                    <Toggle
                      size="sm"
                      checked={isDissolving}
                      onChange={(val) => setElementTarget(item.key, val)}
                      label={isDissolving ? "Dissolves" : "Persists"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: PRESETS BANK */}
      {activeTab === "presets" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>1-Click Curated Presets Bank</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TRANSITION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10 transition text-left group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400">
                    {preset.tag}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {preset.config.duration || 1.0}s
                  </span>
                </div>
                <span className="text-sm font-bold text-white transition-colors duration-150 group-hover:text-purple-200">
                  {preset.label}
                </span>
                <span className="text-xs text-zinc-400 leading-relaxed">
                  {preset.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Deck Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={isTransitioning}
            onClick={() => {
              if (isScrubbing) setIsScrubbing(false);
              if (isOscillating) setIsOscillating(false);
              previewInPlace();
            }}
            className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-purple-600/30 hover:bg-purple-500 active:scale-95 transition disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Preview Dissolve In-Place</span>
          </button>

          <WebGLTransitionLink
            href={otherPageRoute}
            className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/15 active:scale-95 transition disabled:opacity-50"
          >
            <span>Navigate to {otherPageLabel}</span>
            <DotChevronRight className="w-4 h-4" />
          </WebGLTransitionLink>
        </div>

        <div className="text-xs font-mono text-zinc-400 text-center sm:text-right">
          Color: <span className="text-purple-300 font-bold uppercase">{config.colorMode}</span> &bull; Mask:{" "}
          <span className="text-purple-300 font-bold uppercase">{config.maskMode}</span> &bull; Duration:{" "}
          <span className="text-white font-bold">
            {(config.duration / (config.speedMultiplier || 1.0)).toFixed(2)}s
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Floating bottom-right drawer studio for quick access anywhere across /transition-test.
 */
export function WebGLTransitionTuner() {
  const {
    config,
    setConfig,
    previewInPlace,
    isTransitioning,
    isScrubbing,
    setIsScrubbing,
    isOscillating,
    setIsOscillating,
    scrubProgress,
    setScrubProgress,
    resetToDefaults,
    resetToCodropsOriginal,
    copyConfigJson,
    applyPreset,
    applyGradientPreset,
  } = useWebGLTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "color" | "scrub" | "shader" | "motion" | "presets"
  >("color");
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const [hasTunerQuery, setHasTunerQuery] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("webgl-tuner=true")) {
      setHasTunerQuery(true);
    }
  }, []);

  // Only render floating tuner drawer when on /transition-test or when explicitly requested via ?webgl-tuner=true
  if (!pathname.startsWith("/transition-test") && !hasTunerQuery) {
    return null;
  }

  const otherPageRoute =
    pathname === "/transition-test/page-a"
      ? "/transition-test/page-b"
      : "/transition-test/page-a";
  const otherPageLabel =
    pathname === "/transition-test/page-a"
      ? "Page B (Concert)"
      : "Page A (Showcase)";

  const normalizedScrub = Math.round(
    Math.max(0, Math.min(1, (1.5 - scrubProgress) / 2.25)) * 100,
  );

  const handleCopy = async () => {
    const ok = await copyConfigJson();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside
      aria-label="WebGL Transition Controller"
      className="fixed bottom-6 right-6 z-[99990] flex flex-col items-end gap-3 select-none"
    >
      {/* Floating launcher pill button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2.5 rounded-full border border-white/20 bg-black/75 px-4 py-2.5 text-sm font-semibold text-white shadow-2xl backdrop-blur-2xl transition-[border-color,background-color] duration-200 hover:border-white/30 hover:bg-black/90 active:scale-95"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500" />
        </span>
        <span className="text-zinc-200 transition-colors duration-150 group-hover:text-white">
          Transition Studio
        </span>
        <span className="rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-xs text-purple-300 font-mono">
          {config.colorMode === "solid" ? "Solid" : "Purple Gradient"}
        </span>
        {isOpen ? (
          <Minimize2 className="w-3.5 h-3.5 text-zinc-400" />
        ) : (
          <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
        )}
      </button>

      {/* Control Drawer */}
      {isOpen && (
        <div className="w-[420px] max-w-[calc(100vw-32px)] max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 bg-black/95 p-5 shadow-2xl backdrop-blur-2xl text-zinc-100 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                {/* heading-size-ok: floating pill title */}
                <h2 className="font-bold text-white tracking-wide">
                  Codrops About Studio
                </h2>
                <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-mono">
                  {config.colorMode}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                example-2-transition &bull; {config.maskMode} mask
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetToCodropsOriginal}
                title="Codrops 2019 Stone Gray"
                className="rounded-lg p-1.5 text-purple-400 hover:bg-white/10 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetToDefaults}
                title="Reset to Defaults"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
                aria-label="Close Tuner"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
            {[
              { id: "color", label: "Gradient" },
              { id: "scrub", label: "Scrub" },
              { id: "shader", label: "Shader" },
              { id: "motion", label: "Motion" },
              { id: "presets", label: "Presets" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`py-1.5 rounded-lg transition ${
                  activeTab === t.id
                    ? "bg-purple-600 text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Quick Actions (Always Visible) */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isTransitioning}
              onClick={() => {
                if (isScrubbing) setIsScrubbing(false);
                if (isOscillating) setIsOscillating(false);
                previewInPlace();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-purple-600/30 hover:bg-purple-500 active:scale-98 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Preview Dissolve In-Place</span>
            </button>

            <WebGLTransitionLink
              href={otherPageRoute}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-200 hover:border-white/30 hover:text-white transition disabled:opacity-50"
            >
              <span>Navigate to {otherPageLabel} &rarr;</span>
            </WebGLTransitionLink>
          </div>

          {/* TAB: COLOR & GRADIENT */}
          {activeTab === "color" && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-400 font-semibold">Color Style Mode</span>
                <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                  {["linear", "radial", "aurora", "solid", "mask"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          colorMode: m as ColorStyleMode,
                          ...(m === "mask" && c.color === "#8a1cfc" ? { color: "#000000" } : {}),
                        }))
                      }
                      className={`py-1.5 rounded-lg border capitalize transition ${
                        m === "mask" ? "col-span-2 border-dashed" : ""
                      } ${
                        config.colorMode === m
                          ? "border-purple-500 bg-purple-600 text-white font-bold"
                          : "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {m === "mask" ? "Shader Mask (No Grad)" : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mask Controls OR Gradient Stops */}
              {config.colorMode === "mask" ? (
                <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-purple-500/30 bg-purple-950/20">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-purple-400" />
                    Mask Archetypes (Zero Gradient)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    {MASK_PRESETS.slice(0, 4).map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setConfig((c) => ({ ...c, ...p.config }))}
                        className="p-1.5 rounded border border-white/10 bg-white/5 hover:border-purple-500 text-left transition"
                      >
                        <span className="font-semibold block truncate text-zinc-200">
                          {p.label}
                        </span>
                        <span className="text-[9px] text-zinc-400">{p.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-zinc-400">Stop 1</span>
                    <input
                      type="color"
                      value={config.color}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, color: e.target.value }))
                      }
                      className="h-7 w-7 rounded-md border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.color}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, color: e.target.value }))
                      }
                      className="flex-1 rounded-md border border-white/15 bg-black/60 px-2 py-1 font-mono text-[11px] text-white uppercase focus:outline-none"
                    />
                  </div>

                  {config.colorMode !== "solid" && (
                    <div className="flex items-center gap-2">
                      <span className="w-14 text-zinc-400">Stop 2</span>
                      <input
                        type="color"
                        value={config.colorSecondary}
                        onChange={(e) =>
                          setConfig((c) => ({ ...c, colorSecondary: e.target.value }))
                        }
                        className="h-7 w-7 rounded-md border border-white/20 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.colorSecondary}
                        onChange={(e) =>
                          setConfig((c) => ({ ...c, colorSecondary: e.target.value }))
                        }
                        className="flex-1 rounded-md border border-white/15 bg-black/60 px-2 py-1 font-mono text-[11px] text-white uppercase focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Masking Mode */}
              <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
                <span className="text-zinc-400 font-semibold">Masking Architecture</span>
                <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                  {["standard", "inverted", "stencil"].map((mask) => (
                    <button
                      key={mask}
                      type="button"
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          maskMode: mask as MaskMode,
                        }))
                      }
                      className={`py-1 rounded-md border capitalize transition ${
                        config.maskMode === mask
                          ? "border-purple-500 bg-purple-600 text-white font-bold"
                          : "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {mask}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SCRUB */}
          {activeTab === "scrub" && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-300">Auto Oscillate Loop:</span>
                <Toggle
                  size="sm"
                  checked={isOscillating}
                  onChange={(val) => setIsOscillating(val)}
                  label={isOscillating ? "ON" : "OFF"}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-300">Freeze Scrub Mode:</span>
                <Toggle
                  size="sm"
                  checked={isScrubbing}
                  onChange={(val) => {
                    if (!val && isOscillating) setIsOscillating(false);
                    setIsScrubbing(val);
                  }}
                  label={isScrubbing ? "Frozen" : "Inactive"}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-mono text-[11px] text-zinc-400">
                  <span>uProgress: {scrubProgress.toFixed(3)}</span>
                  <span className="text-purple-300 font-bold">{normalizedScrub}%</span>
                </div>
                <input
                  type="range"
                  min="-0.75"
                  max="1.50"
                  step="0.005"
                  value={scrubProgress}
                  onChange={(e) => {
                    if (isOscillating) setIsOscillating(false);
                    if (!isScrubbing) setIsScrubbing(true);
                    setScrubProgress(parseFloat(e.target.value));
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB: SHADER */}
          {activeTab === "shader" && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Noise Scale</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {config.noiseScale.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="40.0"
                  step="0.5"
                  value={config.noiseScale}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      noiseScale: parseFloat(e.target.value),
                    }))
                  }
                  className="accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Edge Feather (uEdge)</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {config.edge.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.45"
                  step="0.005"
                  value={config.edge}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      edge: parseFloat(e.target.value),
                    }))
                  }
                  className="accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-300">Burning Edge Glow:</span>
                <Toggle
                  size="sm"
                  checked={config.edgeGlow}
                  onChange={(val) =>
                    setConfig((c) => ({ ...c, edgeGlow: val }))
                  }
                  label={config.edgeGlow ? "ON" : "OFF"}
                />
              </div>
            </div>
          )}

          {/* TAB: MOTION */}
          {activeTab === "motion" && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Duration</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {config.duration.toFixed(2)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.05"
                  value={config.duration}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      duration: parseFloat(e.target.value),
                    }))
                  }
                  className="accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 font-semibold">GSAP Ease</label>
                <select
                  value={config.ease}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, ease: e.target.value }))
                  }
                  className="rounded-lg border border-white/15 bg-black/60 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
                >
                  {EASE_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB: PRESETS */}
          {activeTab === "presets" && (
            <div className="flex flex-col gap-2 text-xs">
              <div className="grid grid-cols-2 gap-1.5">
                {TRANSITION_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10 transition text-left flex flex-col gap-0.5"
                  >
                    <span className="text-[10px] uppercase font-bold text-purple-400">
                      {p.tag}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-zinc-300 hover:border-white/30 hover:text-white transition mt-2"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Config JSON</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default WebGLTransitionProvider;
