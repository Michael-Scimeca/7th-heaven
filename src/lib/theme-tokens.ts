import defaultThemeJson from "@/data/theme.json";

export interface ColorTokens {
  [key: string]: string;
}

export interface TypographyTokens {
  [key: string]: string;
}

export interface SpacingTokens {
  [key: string]: string;
}

export interface RadiusTokens {
  [key: string]: string;
}

export interface ShadowTokens {
  [key: string]: string;
}

export interface BreakpointTokens {
  [key: string]: string;
}

export interface ThemeTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radii: RadiusTokens;
  shadows: ShadowTokens;
  breakpoints: BreakpointTokens;
}

export const DEFAULT_THEME_TOKENS: ThemeTokens = defaultThemeJson as ThemeTokens;

/**
 * Returns a flat key-value map of all CSS variable names to their values.
 */
export function flattenThemeTokens(tokens: ThemeTokens): Record<string, string> {
  return {
    ...tokens.colors,
    ...tokens.typography,
    ...tokens.spacing,
    ...tokens.radii,
    ...tokens.shadows,
    ...tokens.breakpoints,
  };
}

/**
 * Generates a CSS string containing :root custom properties.
 */
export function generateCssVariablesString(tokens: ThemeTokens): string {
  const flat = flattenThemeTokens(tokens);
  const rules = Object.entries(flat)
    .map(([varName, val]) => `  ${varName}: ${val};`)
    .join("\n");

  return `:root {\n${rules}\n}`;
}

/**
 * Applies theme tokens directly to document.documentElement in browser runtime.
 */
export function applyThemeTokensToDocument(tokens: ThemeTokens): void {
  if (typeof document === "undefined") return;

  const flat = flattenThemeTokens(tokens);
  const root = document.documentElement;

  Object.entries(flat).forEach(([varName, value]) => {
    root.style.setProperty(varName, value);
  });
}

/**
 * Exports current tokens as a pretty formatted JSON string.
 */
export function exportTokensAsJson(tokens: ThemeTokens): string {
  return JSON.stringify(tokens, null, 2);
}

/**
 * Validates and merges an imported JSON payload into a ThemeTokens object.
 */
export function parseAndValidateThemeJson(jsonString: string): ThemeTokens | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== "object" || parsed === null) return null;

    const merged: ThemeTokens = {
      colors: { ...DEFAULT_THEME_TOKENS.colors, ...(parsed.colors || {}) },
      typography: { ...DEFAULT_THEME_TOKENS.typography, ...(parsed.typography || {}) },
      spacing: { ...DEFAULT_THEME_TOKENS.spacing, ...(parsed.spacing || {}) },
      radii: { ...DEFAULT_THEME_TOKENS.radii, ...(parsed.radii || {}) },
      shadows: { ...DEFAULT_THEME_TOKENS.shadows, ...(parsed.shadows || {}) },
      breakpoints: { ...DEFAULT_THEME_TOKENS.breakpoints, ...(parsed.breakpoints || {}) },
    };

    return merged;
  } catch {
    return null;
  }
}

/**
 * Converts any CSS color representation (HEX, RGB, RGBA) into a valid 6-digit #rrggbb string for HTML color inputs.
 */
export function colorToHex(colorStr: string): string {
  if (!colorStr) return "#9333ea";
  const trimmed = colorStr.trim();

  // Handle 6-digit hex
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle 3-digit hex (#abc -> #aabbcc)
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }

  // Handle 8-digit hex (#rrggbbaa -> #rrggbb)
  if (/^#[0-9a-fA-F]{8}$/.test(trimmed)) {
    return trimmed.slice(0, 7);
  }

  // Handle rgb(...) or rgba(...)
  const rgbaMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (rgbaMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbaMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbaMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbaMatch[3], 10)));
    const rHex = r.toString(16).padStart(2, "0");
    const gHex = g.toString(16).padStart(2, "0");
    const bHex = b.toString(16).padStart(2, "0");
    return `#${rHex}${gHex}${bHex}`;
  }

  return "#9333ea";
}

/**
 * Updates a color string from a color picker selection, preserving RGBA opacity if original was RGBA.
 */
export function updateColorFromPicker(originalColorStr: string, newHex: string): string {
  const trimmed = (originalColorStr || "").trim();
  const rgbaMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);

  if (rgbaMatch && rgbaMatch[4] !== undefined) {
    // Preserve opacity from original RGBA string
    const hex = newHex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const opacity = rgbaMatch[4];
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return newHex;
}

