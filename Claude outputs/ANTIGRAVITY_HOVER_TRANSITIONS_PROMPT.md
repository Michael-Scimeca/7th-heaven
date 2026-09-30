# Task: Every hover effect uses the site's one global transition timing and easing

Repo: `7th-heaven` (Next.js 16, React 19, Tailwind v4). Read `AGENTS.md` first. If any `*_REPORT.md` files exist from earlier tasks, read them and don't undo their changes.

## Problem
Many hover effects on the site snap instantly or use their own random timing:
- About **390** `hover:` / `group-hover:` classes in `src/**/*.tsx` change `bg`, `scale`, `translate`, `shadow` or `border` with **no transition on the same element**. Some may get one from global CSS; many don't.
- Where transitions exist, they're inconsistent: `duration-300`, `duration-200`, `duration-[250ms]`, `duration-700`, `transition-all`, and the defaults. In `globals.css` alone there are 12+ different durations (0.08s–0.5s) and 9 different `cubic-bezier` curves.
- Some transition the **wrong property**. Example (already fixed): the fan media card overlay had `transition-opacity` but its hover changes `background-color`, so it snapped.
- **The tokens conflict with each other.** `globals.css` defines motion tokens twice:
  - `:root` (~line 92): `--duration-fast: 150ms; --duration-base: 300ms; --duration-slow: 500ms; --ease-out: cubic-bezier(0.16, 1, 0.3, 1); --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);`
  - `@theme` (~line 1925): `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1); --duration-fast: 200ms; --duration-normal: 300ms; …`
  - `--default-transition-duration` / `--default-transition-timing-function` are **not set**, so bare Tailwind `transition` / `transition-colors` classes use Tailwind's built-in 150ms default curve instead of the site's tokens.

## 1. One source of truth (do this first)
In `globals.css`, merge the two token sets into **one** block inside `@theme` (delete the duplicates in `:root`; keep every token name that's in use, and grep for them first):

```css
@theme {
  /* ── Motion: change these to retime every hover on the site ── */
  --duration-fast: 150ms;     /* tiny UI feedback (icon color, underline) */
  --duration-base: 300ms;     /* DEFAULT for hovers */
  --duration-slow: 500ms;     /* large surfaces, image zoom */
  --duration-normal: var(--duration-base);  /* legacy alias, keep if used */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);        /* DEFAULT easing */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-expo: var(--ease-out);                 /* legacy alias */

  --default-transition-duration: var(--duration-base);
  --default-transition-timing-function: var(--ease-out);
}
```
Setting `--default-transition-duration` / `--default-transition-timing-function` makes every Tailwind `transition`, `transition-colors`, `transition-opacity`, `transition-transform` etc. without its own `duration-*` / `ease-*` use the global timing automatically. **Check this in the built CSS** (Tailwind v4 docs are in `node_modules/tailwindcss`). If the project's Tailwind version names these variables differently, use the correct names.

Tell me in the report if 300ms feels slow for small things like nav links. I may want `--duration-fast` for those; don't decide it silently.

## 2. Fix every hover across the site
Go through **every** `.tsx` file in `src/` (including `components/`, `app/`, admin, crew, planner and cruise dashboards) and **every** `:hover` rule in `globals.css` and the other `.css` files:

1. **No transition at all** → add the right property-specific utility, with no duration or ease class, so it inherits the global:
   - background, text or border color changes → `transition-colors`
   - `scale` / `translate` / `rotate` → `transition-transform`
   - `opacity` → `transition-opacity`
   - `shadow` → `transition-shadow`
   - a mix → `transition-[background-color,color,border-color,box-shadow,transform]`, or plain `transition`, which covers colors + opacity + shadow + transform
2. **Wrong property** (like the example above) → transition what actually changes on hover.
3. **Hard-coded `duration-*` / `ease-*` on a hover** → remove them so the global applies. Keep a custom value **only** when it's clearly deliberate (a slow image zoom → `duration-[var(--duration-slow)]`; a long reveal animation). Use tokens, never raw numbers, and list every kept exception in the report.
4. **`transition-all`** → replace it with the specific properties. `transition-all` animates layout properties and hurts performance.
5. **`group-hover:` / `peer-hover:`** → the transition goes on the element that **changes**, not the group parent.
6. **CSS files** → every `:hover` rule's element gets `transition: <properties> var(--duration-base) var(--ease-out)`. Replace the raw `0.2s`, `250ms` and `cubic-bezier(...)` values used for hovers with the tokens. Keyframe animations and page transitions (preloader, curtain, `PageTransition`) are **not** hovers; leave their timing alone.
7. **Focus parity:** anything that changes on `hover:` gets the same change on `focus-visible:`, with the same transition, so keyboard users see it too.
8. **Touch devices:** Tailwind v4 `hover:` is already wrapped in `@media (hover: hover)`. Plain CSS `:hover` rules in `globals.css` should be wrapped in `@media (hover: hover) and (pointer: fine)` too, so they don't stick on phones. (If the mobile/Safari prompt already did this, skip.)
9. **Reduced motion:** add one global rule so movement is removed but color changes still show:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after { transition-duration: 1ms !important; scroll-behavior: auto !important; }
   }
   ```
   Check that this doesn't break the preloader or page-transition logic, which may wait for `transitionend`. Adjust if needed.

## 3. Don't touch
- Timing that isn't a hover: preloader, page transitions/curtain, scroll reveals, sliders, `ProgressiveBlur`, the `BlurTuner` panel, video players.
- Anything visual beyond timing: colors, sizes and hover styles stay exactly as they are. **Only how they animate changes.**

## 4. Optional, if quick
Add "Hover speed" (duration) and "Hover easing" (a few presets from the tokens) controls to the dev-only Tune panel (`src/components/BlurTuner.tsx`). They set `--duration-base` / `--ease-out` on `<html>` live, and "Copy CSS" includes them. It follows the same pattern as the existing blur and title-gap controls.

## Rules
- Small commits, grouped by area (header/nav, home, cruise, book, media/fan wall, admin, crew, planner, global CSS). `npm run check-all` + `npm run build` after each.
- Don't reformat whole files. `AdminDashboardMain.tsx` is ~800 KB, so only edit the class strings you need.

## Verification
- A script (commit it as `scripts/check-hover-transitions.mjs`) that scans `src/**/*.tsx` and reports any element whose class list has `hover:`/`group-hover:`/`focus-visible:` changing a visual property without a matching `transition*` class, plus any `transition-all`. It must report **0** at the end. Add it to `npm run check-all`.
- Manually hover the main interactive elements (nav links, buttons, cards, tour rows, media/fan cards, FAQ, footer links, admin tables) on desktop Chrome and Safari: everything eases the same way, and nothing snaps.
- Change `--duration-base` to `1000ms` temporarily and confirm **every** hover on the site slows down, then change it back.
- Report in `HOVER_TRANSITIONS_REPORT.md`: the number of hovers fixed per area, the deliberate exceptions (file:line + reason), and whether 300ms felt right.
