# Task: Replace `ProgressiveBlur` with a layered progressive blur (desktop full, mobile light)

Repo: `7th-heaven` (Next.js 16, React 19, Tailwind v4). Read `AGENTS.md` first.

## Current state
- `src/components/ProgressiveBlur.tsx` renders one flat `backdrop-blur-md` strip. The top strip is 80px tall. The bottom strip is 110px tall and also has a dark gradient: `from-[#05030a]/90 via-[#05030a]/50 to-transparent`.
- It's rendered once in `src/app/layout.tsx` as `<ProgressiveBlur position="top" />`.
- `src/components/Header.tsx` imports it but never uses it. Remove that import.

## What to build
Replace the flat blur with a **stacked progressive blur**. Several fixed layers sit on top of each other. Each layer doubles the blur of the one before it and is masked to a narrower band closer to the edge. The result fades smoothly from sharp to blurred, with no hard edge.

Keep the component's public API the same (`position?: "top" | "bottom" | "both"`, `className?`), so `layout.tsx` doesn't need to change. Add an optional `tint?: boolean` prop that brings back the dark gradient the current bottom strip has. Default `tint` to `true` for bottom and `false` for top, so the site looks the same as now apart from the blur quality.

### Markup
```tsx
<div className="progressive-blur is-top" aria-hidden="true">
  <div className="progressive-blur__layer is--1" />
  … is--2 … is--5
</div>
```
Keep it a Server Component. It needs no state, so remove `"use client"`. Render the bottom strip with the class `is-bottom`. When `tint` is true, add a tint layer (`progressive-blur__tint`) as the last child, carrying the existing gradient colors.

### CSS
Put this in `globals.css` inside `@layer components`, or in a co-located CSS file. Use plain CSS, not Tailwind arbitrary values, so the `-webkit-` prefixes can be controlled.

```css
.progressive-blur {
  --pb-height: 10em;
  position: fixed; left: 0; bottom: 0;
  width: 100%; height: var(--pb-height);
  z-index: 40;
  pointer-events: none;
  isolation: isolate;
  contain: paint;
  overflow: hidden;
  transform: translateZ(0);
}
.progressive-blur.is-top    { top: -1px; bottom: auto; transform: rotate(180deg) translateZ(0); }
.progressive-blur.is-bottom { bottom: -1px; }

.progressive-blur__layer { position: absolute; inset: 0; }

.progressive-blur__layer.is--1 { -webkit-backdrop-filter: blur(0.09375em); backdrop-filter: blur(0.09375em);
  -webkit-mask: linear-gradient(transparent 50%, #000 62.5%, #000 75%, transparent 87.5%);
          mask: linear-gradient(transparent 50%, #000 62.5%, #000 75%, transparent 87.5%); }
.progressive-blur__layer.is--2 { -webkit-backdrop-filter: blur(0.1875em); backdrop-filter: blur(0.1875em);
  -webkit-mask: linear-gradient(transparent 62.5%, #000 75%, #000 87.5%, transparent 100%);
          mask: linear-gradient(transparent 62.5%, #000 75%, #000 87.5%, transparent 100%); }
.progressive-blur__layer.is--3 { -webkit-backdrop-filter: blur(0.375em); backdrop-filter: blur(0.375em);
  -webkit-mask: linear-gradient(transparent 75%, #000 87.5%, #000 100%);
          mask: linear-gradient(transparent 75%, #000 87.5%, #000 100%); }
.progressive-blur__layer.is--4 { -webkit-backdrop-filter: blur(0.75em); backdrop-filter: blur(0.75em);
  -webkit-mask: linear-gradient(transparent 82%, #000 92%, #000 100%);
          mask: linear-gradient(transparent 82%, #000 92%, #000 100%); }
.progressive-blur__layer.is--5 { -webkit-backdrop-filter: blur(1.5em); backdrop-filter: blur(1.5em);
  -webkit-mask: linear-gradient(transparent 88%, #000 100%);
          mask: linear-gradient(transparent 88%, #000 100%); }
```
Note: the top strip is the bottom strip rotated 180°, so both use the same masks. Keep that trick.

### Height
- The current top strip is 80px tall and sits under the header. Set `--pb-height` so the blur covers the header area plus a soft fade below it: start at the header height token (`--header-height`, 80px) × ~1.6, and adjust by eye. Add the safe-area inset on iOS: `calc(var(--pb-height) + env(safe-area-inset-top))`. For the bottom strip use `env(safe-area-inset-bottom)`.

### Mobile and Safari limits (required)
- **Touch devices and small screens** (`@media (max-width: 1023px), (pointer: coarse)`): hide layers `is--1` and `is--2` (`display: none`) so only 3 backdrop-filter layers render. Reduce `--pb-height` by about 30%. On mobile, render only the **top** strip even when `position="both"`.
- **No backdrop-filter support** (`@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`): hide the layers and show only a gradient fade in the page background color.
- **`prefers-reduced-transparency: reduce`**: same fallback as above.
- Never animate the blur values or the masks. If the strip needs to fade in, only animate `opacity` on the wrapper.

## Don't
- Don't change the header, the page layout or z-index stacking. The blur must stay **under** the header content and above the page (`z-40`). Check that the mobile menu, modals, the preloader and the page-transition curtain still sit above it.
- Don't add JavaScript for this effect.

## Verification
1. `npm run check-all` and `npm run build` pass.
2. Desktop Chrome, Firefox and Safari at 1440px: scroll the homepage, `/cruise` and `/media`. The fade from sharp to blurred should be smooth, with no visible band edge, no flicker, and header text still sharp.
3. iPhone Simulator (Safari) and a real iPhone if you have one: check scrolling stays smooth (Safari Web Inspector → Timelines, no long frames while scrolling), nothing sits under the notch, and the page doesn't reload itself while scrolling the full homepage twice.
4. Send before/after screenshots of the top edge on desktop and on iPhone.
