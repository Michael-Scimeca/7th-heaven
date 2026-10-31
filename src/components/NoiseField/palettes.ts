/**
 * Per-route colors for the noise background: [background, color1, color2].
 * Hues come from the site's own gradient (#05030a base, navy #151150, purple #850FB7,
 * violet #611EBD, plum #4A1B6F, deep purple #600C7F, burnt orange #A43E17),
 * lifted a little so they read through the dark glass overlay.
 */
export type Palette = [string, string, string];

const PURPLE = "#a51ee3";
const VIOLET = "#7b3cf0";
const ORANGE = "#d4581e";
const NAVY = "#2a2399";
const PLUM = "#6a2a9e";
const DEEP = "#8a16b5";

export const DEFAULT_PALETTE: Palette = ["#07040d", PURPLE, ORANGE];

// first matching prefix wins
const ROUTES: [string, Palette][] = [
  ["/shows/past", ["#05030a", PLUM, NAVY]],
  ["/shows/", ["#08040c", ORANGE, DEEP]],
  ["/shows", ["#07040d", VIOLET, PURPLE]],
  ["/media", ["#05040e", NAVY, PURPLE]],
  ["/rock-and-roll-kids", ["#08040b", ORANGE, VIOLET]],
  ["/merch", ["#08040a", ORANGE, PLUM]],
  ["/cruise", ["#04040f", NAVY, VIOLET]],
  ["/live", ["#07030c", PURPLE, DEEP]],
  ["/fans", ["#07030c", PURPLE, DEEP]],
  ["/book", ["#06040d", VIOLET, ORANGE]],
  ["/contact", ["#05040e", NAVY, DEEP]],
  ["/news", ["#07040c", PLUM, ORANGE]],
  ["/faq", ["#06030c", DEEP, VIOLET]],
  ["/notifications", ["#05040d", VIOLET, NAVY]],
  ["/push-updates", ["#05040d", VIOLET, NAVY]],
  ["/crew", ["#05040a", NAVY, PLUM]],
  ["/privacy", ["#05030a", PLUM, NAVY]],
  ["/terms", ["#05030a", PLUM, NAVY]],
  ["/returns", ["#05030a", PLUM, NAVY]],
];

export function paletteFor(pathname: string): Palette {
  const p = (pathname || "/").split(/[?#]/)[0];
  if (p === "/" || p === "") return DEFAULT_PALETTE;
  for (const [prefix, pal] of ROUTES) {
    if (prefix.endsWith("/") ? p.startsWith(prefix) : p === prefix || p.startsWith(prefix + "/")) return pal;
  }
  return DEFAULT_PALETTE;
}
