# Task: Every heading uses a standard responsive size class

Repo: `7th-heaven` (Next.js 16, React 19, Tailwind v4). Read `AGENTS.md`, `DESIGN_SYSTEM_AUDIT.md` and `TYPOGRAPHY_AUDIT.md` first. If any `*_REPORT.md` files exist from earlier tasks, read them and don't undo their changes.

## Goal
**The tag says what it is; the class says how big it looks.** Every `<h1>`–`<h6>` on the site gets exactly **one** size class from a single responsive scale: `text-display`, `text-h1` … `text-h6`. Changing one token resizes that level everywhere, on every screen size.

## What exists today (verify)
- `src/app/globals.css` already has the scale as fluid tokens (lines ~14–20):
  `--font-size-display`, `--font-size-h1` … `--font-size-h6` (all `clamp()`).
- It already has classes `.text-display`, `.text-h1` … `.text-h6` (~line 2314) that set the font family, size, weight, line-height and letter-spacing.
- **But only 3 of 284 headings use them.** The rest set their own sizes (`text-xl` ×13, `text-2xl` ×9, `text-3xl`, `text-6xl`, `text-7xl`, `text-8xl`, `text-lg`, `text-sm`, …) or rely on the base `h1`–`h6` rules.
- The base heading rules are defined **three times** (~lines 753, 989 and 2259) with different properties.
- The classes are plain CSS in a layer, so **responsive variants like `md:text-h2` don't work**.
- Most headings are in: `AdminDashboardMain.tsx` (56), `CrewDashboard/index.tsx` (19), `CruiseCabinsPricingSection.tsx` (16), `CruiseWidgets.tsx` (12), `AdminSectionCrewSchedule.tsx` (11), `BioParallaxSlider.tsx` (10), `PlannerDashboard.tsx` (8), `shop-inventory/page.tsx` (7), `CruiseChat.tsx`, `BookClient.tsx`, `HomeNewsSection.tsx`, `TourList.tsx`, `ContactClient.tsx` (the contact names, e.g. line ~215 `h3 text-2xl sm:text-3xl`).

## 1. One scale, defined once
- Keep the **current values** of `--font-size-display` and `--font-size-h1…h6` so nothing jumps in size. (If `DESIGN_SYSTEM_AUDIT.md`'s Utopia scale was approved and already applied, use that instead; say which in the report.)
- Turn the classes into real Tailwind v4 theme text sizes so they work with variants (`md:text-h2`, `lg:text-display`). In `@theme`:
  ```css
  --text-display: var(--font-size-display);
  --text-display--line-height: 0.95;
  --text-display--letter-spacing: -0.04em;
  --text-display--font-weight: 900;
  --text-h1: var(--font-size-h1);
  --text-h1--line-height: 1.05;
  --text-h1--letter-spacing: -0.03em;
  --text-h1--font-weight: 900;
  /* … h2–h6 with the values currently in the .text-h* classes */
  ```
  Check in the built CSS that `text-h1` and `md:text-h2` generate font-size + line-height + letter-spacing + weight. Remove the old `.text-h*` / `.text-display` class definitions once the theme versions work. **Also check for conflicts:** `--text-*` is Tailwind's font-size namespace, so make sure no color token is named `--color-h1`, etc.
- The font family: **one** base rule `h1,h2,h3,h4,h5,h6 { font-family: var(--font-heading); color: var(--color-text-primary); margin: 0; text-wrap: balance; }`. Merge the three existing base blocks into this and delete the other two. Keep per-level fallback sizes in the base rule (`h1 { font-size: var(--font-size-h1) }` …) so an unclassed heading still looks right, but the check below will still flag it.
- Put a short comment block above the tokens: a table of level → min size (at 360px) → max size (at 1440px) → typical use.

## 2. Apply it to every heading
For each of the ~284 headings in `src/**/*.tsx`:
1. Choose the size class by **visual role, not tag**. The tag stays correct for the page outline, e.g. a card title can be `<h3 className="text-h5">`:
   - page titles → `text-h1` (or `text-display` for big heroes)
   - section titles → `text-h2`
   - card, panel and item titles (contact names, show names, cabin names) → `text-h4` or `text-h5`
   - small labels inside dashboards → `text-h6`
   Match the current look as closely as possible: pick the scale step closest to today's rendered size at 1440px **and** 390px.
2. Remove the competing classes on that heading: `text-xs…text-9xl`, `text-[..px]`, `font-extrabold/black/bold`, `leading-*`, `tracking-*`, and inline `style={{ fontSize }}`. The size class now handles all of these. Keep only color, `uppercase`, alignment and truncation classes.
3. Responsive changes use variants of the scale (`text-h3 md:text-h2`), never raw sizes.
4. Headings built through `PageHero` / `SectionHeader` already use `text-h1` / `text-h2` / `text-h3`. Keep them, and add an optional `size` prop so a caller can override the visual size without changing the tag.
5. **Non-heading text that looks like a heading** (a `<p>` or `<span>` styled big and bold, acting as a title): if it's really a title, make it a proper heading at the right level; otherwise give it the matching `text-h*` class. List these in the report.
6. Don't fix heading **levels** here (skipped levels, duplicate H1s) unless it's trivial; list them in the report instead. (Duplicate H1s are already in the visitor-bugs prompt.)

## 3. Keep it that way
- Add `scripts/check-heading-classes.mjs`: it scans `src/**/*.tsx` and fails if any `<h1>`–`<h6>` lacks exactly one `text-display`/`text-h[1-6]` class (responsive variants allowed), or has a raw text size (`text-xl`, `text-[..]`) or a font-weight/leading/tracking override. Allow opting out with a `// heading-size-ok: <reason>` comment on the line above. Add it to `npm run check-all`.
- Add a "Headings" section to `src/app/style-guide/page.tsx` showing every level with its token values and the min/max sizes.
- Optional: add sliders for the h1–h6 max sizes to the dev-only Tune panel (`BlurTuner.tsx`), live-editing `--font-size-h*`, with "Copy CSS". It follows the same pattern as the blur and title-gap controls.

## Rules
- The site should look the same afterwards except where headings were inconsistent (the same kind of title at different sizes). List those intentional changes in the report, with before/after sizes.
- Don't touch `ProgressiveBlur.*`, `TitleGroup.css`, or the notification/table work.
- Commit by area (global CSS → shared components → public pages → cruise → book → admin → crew → planner). Run `npm run check-all` + `npm run build` after each.
- `AdminDashboardMain.tsx` is ~800 KB, so only edit the heading class strings.

## Verification
- `check-heading-classes` reports 0.
- Every public page at 390px and 1440px: headings scale smoothly between sizes, nothing overflows (long names wrap nicely with `text-wrap: balance`), and the same kinds of titles are the same size across pages (contact names, show titles, card titles).
- Temporarily set `--font-size-h4` to something huge: every `text-h4` heading on the site changes, and nothing else does.
- Report in `HEADING_SCALE_REPORT.md`: the final scale table, the headings converted per file, the intentional size changes, and the heading-level issues found.
