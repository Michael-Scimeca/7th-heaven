# Hover Transitions Standardization Report

## Summary
All hover and focus transition timing, easing curves, and CSS properties across the `7th-heaven` codebase have been unified to use the site's global motion tokens. Hardcoded durations, conflicting `:root` vs `@theme` token definitions, bare `transition-all` declarations, and missing transitions have been eliminated.

An automated audit script (`scripts/check-hover-transitions.mjs`) was created and integrated into `npm run check-all` and CI to guarantee 0 regressions.

---

## 1. Single Source of Truth (`src/app/globals.css`)
- **Consolidated `@theme` Tokens**: Removed duplicate/conflicting `:root` motion definitions.
- **Default Transition Integration**: Configured `--default-transition-duration` and `--default-transition-timing-function` to automatically apply the global motion timing to bare Tailwind transition utilities (`transition`, `transition-colors`, `transition-transform`, `transition-opacity`, `transition-shadow`):
  ```css
  @theme {
    --duration-fast: 150ms;     /* tiny UI feedback (icon color, underline) */
    --duration-base: 300ms;     /* DEFAULT for hovers */
    --duration-slow: 500ms;     /* large surfaces, image zoom */
    --duration-slower: 700ms;
    --duration-slowest: 1000ms;
    --duration-normal: var(--duration-base);  /* legacy alias */
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);        /* DEFAULT easing */
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-out-expo: var(--ease-out);                 /* legacy alias */

    --default-transition-duration: var(--duration-base);
    --default-transition-timing-function: var(--ease-out);
  }
  ```
- **Accessibility & Reduced Motion**: Added a global `@media (prefers-reduced-motion: reduce)` rule ensuring instant feedback (1ms) without breaking transition event listeners.

---

## 2. Hovers Fixed by Area

Across **281 `.tsx` files** in `src/`, **177 files** were updated to add proper property-specific transitions and remove `transition-all` and hardcoded hover durations:

| Area / Directory | Files Updated | Key Fixes |
|---|---|---|
| **Header, Nav & Menus** (`src/components/Header.tsx`, `PageNav.tsx`, etc.) | 8 files | Added `transition-colors` to nav links, dropdown buttons, mobile drawer links; removed `duration-200`/`duration-300`. |
| **Home & Landing Components** (`src/components/Hero*.tsx`, `HomeNewsSection.tsx`, `HomeMerch.tsx`, `HomeVideoShowcase.tsx`) | 24 files | Replaced `transition-all` with `transition-colors` / `transition-transform` on cards, thumbnail buttons, CTA buttons, and badge pills. |
| **Cruise Dashboard & Pages** (`src/app/cruise/`, `src/components/Cruise*.tsx`) | 19 files | Added missing `transition-colors` and `transition-transform` on itinerary nodes, chat inputs, cabin cards, and modal buttons. |
| **Tour, Booking & Shows** (`src/components/TourList.tsx`, `TourMap.tsx`, `src/app/book/`, `src/app/shows/`) | 16 files | Standardized show date rows, ticket action buttons, filter tags, calendar date pickers. |
| **Media, Fan Wall & Memories** (`src/app/fan-media-wall/`, `FanUploadForm.tsx`, `VinylHeroPlayer.tsx`, etc.) | 12 files | Fixed media card overlay transitions (`transition-colors` instead of wrong property `transition-opacity`), standardized photo cards and audio controls. |
| **Admin Dashboard & Panels** (`src/components/admin/`, `src/app/admin/`) | 28 files | Cleaned up large tables, action icon buttons, tabs, modal forms in `AdminDashboardMain.tsx` and admin panels. Fixed custom class names (`opacity-transition`, `color-transition`). |
| **Crew & Planner Portals** (`src/components/Crew*.tsx`, `PlannerDashboard.tsx`, `src/app/crew/`, `src/app/planner/`) | 15 files | Standardized feed items, action chips, status badges, setlist accordions, and auth inputs. |
| **Shared UI & Components** (`src/components/ui/`, `Toggle.tsx`, `PageSection.tsx`, `Badge.tsx`, etc.) | 55 files | Replaced `transition-all` in generic cards, dialogs, buttons, tooltips, tags, and form fields. |

---

## 3. Deliberate Exceptions Kept
The following intentional, non-standard animations were retained with semantic tokens or dedicated animation classes:
1. **Bio Image Parallax / Slow Reveal** (`src/components/BioParallaxSlider.tsx:128`): Uses `duration-[var(--duration-slow)]` (500ms) for smooth large-surface image reveal.
2. **Preloader / Splash Curtains** (`src/components/PageTransition.tsx`, `src/app/preloaders/`): Retain orchestrated keyframes and page-curtain timing.
3. **Hero Parallax Customizer & Canvas Editors** (`src/components/HeaderMaskEditor.tsx`, `CruiseHeroMaskEditor.tsx`): Real-time canvas/pointer tracking handles its own animation frame loops.

---

## 4. Evaluation of `--duration-base: 300ms`
- **Assessment**: The 300ms duration with `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo) feels very smooth, natural, and modern across cards, buttons, table rows, and interactive surfaces. Because the out-expo curve is front-loaded (accelerating quickly in the first 50ms and easing out over the remainder), it does not feel sluggish.
- **Micro-feedback note**: If the team desires even snappier feedback on tight navigation links or underlines, `--duration-fast` (150ms) can be assigned. We also added live tuning controls in the dev panel so this can be tested and compared directly in the browser.

---

## 5. Dev-Only BlurTuner Live Controls
Added **Hover Speed** (slider 50ms–1000ms with 150ms, 200ms, 300ms, 500ms, 1000ms presets) and **Hover Easing** (Expo, In-Out, Quad, Linear) controls to `src/components/BlurTuner.tsx`.
- Modifies `--duration-base`, `--default-transition-duration`, `--ease-out`, and `--default-transition-timing-function` live on `<html>`.
- Included in the "Copy CSS" output.

---

## 6. Verification & Automated Guardrails
- **Automated Script**: `scripts/check-hover-transitions.mjs` scans all TSX files for elements with `hover:`, `group-hover:`, or `focus-visible:` visual changes lacking transition classes, as well as `transition-all` usages.
- **Audit Result**: `0 violations across 281 files`.
- **Integrated Scripts**:
  - `npm run check-hover-transitions`
  - `npm run check-all` (passes: typecheck + hover transitions + react-doctor + vitest)
  - `npm run build` (passes: Next.js 16.3 Turbopack production build with 0 errors)
