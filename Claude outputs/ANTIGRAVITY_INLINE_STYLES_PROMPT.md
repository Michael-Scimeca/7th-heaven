# Task: Remove inline `style={{ }}` from the site and use classes + tokens instead

Repo: `7th-heaven` (Next.js 16, React 19, Tailwind v4). Read `AGENTS.md` first, then the `*_REPORT.md` files from earlier tasks (hover transitions, heading scale, title gap, contact color, visual hierarchy…). **Don't undo them.**

## Why
Inline styles like this (from `src/components/FakeLiveStream/index.tsx` ~line 1647, the "TOP BAR" header):
```tsx
<header
  className="site-container flex shrink-0 items-center justify-between …"
  style={{
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  }}
>
```
cause problems:
- they skip the design tokens, so changing a token doesn't reach them
- they can't respond to hover, focus or screen size
- they beat almost any class, so later fixes "don't work"
- they hard-code the same glass/border/color values in dozens of places

## Size of the job (my scan; re-scan yourself first)
- **621** `style={{` across **101** `.tsx` files.
- After leaving out unused files and dev tools: **486 in 82 files**, of which **~240 are static** (fixed values only, easy to move to classes).
- Kinds:
  - ~240 static
  - ~160 real runtime values (positions, percentages, scroll/animation transforms)
  - ~50 ternaries that only pick between fixed values
  - ~20 `display: open ? undefined : "none"` toggles
  - ~15 CSS-variable setters (these are already fine)
- Biggest files:
  - `components/FakeLiveStream/index.tsx` (116, 68 static)
  - `admin/[username]/components/AdminDashboardMain.tsx` (46)
  - `BioParallaxSlider.tsx` (27, all dynamic)
  - `CrewSetPasswordModal.tsx` (19)
  - `FakeLiveStream/GoingLiveOverlay.tsx` (17)
  - `VinylHeroPlayer.tsx` (16)
  - `AudioPlayer.tsx` (15)
  - `CruiseHistoryTimeline.tsx` (14)
  - `app/admin/page.tsx` (13)
- The full list with file:line and each style is in **`Claude outputs/INLINE_STYLES_INVENTORY.md`**. Use it as a checklist, but confirm against the current code.
- Most-used static properties: `background` (92), `color` (82), `fontSize` (67), `border` (50), `height`/`width`, `backdropFilter` + `WebkitBackdropFilter` (20 pairs), `maskImage` (14), `padding`, `position`.

## How to convert each kind

### 1. Static styles → Tailwind classes using tokens
Examples:
- `backdropFilter: "blur(12px)"` + `WebkitBackdropFilter` → `backdrop-blur-md`. Tailwind adds the `-webkit-` prefix itself, so check the built CSS once.
- `borderBottom: "1px solid rgba(255,255,255,0.08)"` → `border-b border-white/[0.08]`, or a border token if one exists (`--color-border-main` etc.).
- `color: "rgba(255,255,255,0.25)"` → the closest **text level token** from the visual-hierarchy work (`text-[color:var(--color-text-muted)]`). Only use a raw `text-white/25` if no token fits, and list it.
- `background: "rgba(0,0,0,0.75)"` → `bg-black/75`.
- `fontSize: 11` → the type scale (`text-xs` etc.). **Never** on `<h1>`–`<h6>`; headings are sized by tag, and `scripts/check-heading-classes.mjs` must stay at 0.
- Brand hex values (`#851DEF`, `#a855f7`, `#9333ea`, orange/emerald/rose accents…) → the matching token (`--color-accent`, `--color-action`, success/warning/error). **Don't invent new one-off colors.** List any value that has no token.
- `maskImage` / `WebkitMaskImage` gradients → a named utility class in `globals.css` (`@layer components`), e.g. `.mask-fade-bottom`. Reuse the existing mask classes where they match.

**Repeated combinations become one class.** If the same group shows up 3+ times (e.g. glass bar: blur + dark background + hairline border, or a "pill badge"), make one component class in `globals.css` (`.glass-bar`, `.glass-panel`, `.pill`) and use it everywhere. List the new classes in the report.

### 2. Ternaries between fixed values → conditional classes
Use the existing `cn()` helper from `src/lib/utils.ts`:
```tsx
// before
style={{ color: isTop ? "#fff" : "rgba(255,255,255,0.7)" }}
// after
className={cn(isTop ? "text-white" : "text-white/70")}
```

### 3. `display` toggles → classes
`style={{ display: open ? undefined : "none" }}` → `className={cn(!open && "hidden")}`.

### 4. Real runtime values → CSS variables (keep a tiny `style`)
For values computed at runtime (percentages, pixel positions, per-item delays, colors chosen in the admin/DB), pass **only the value** as a CSS variable, and put the property in a class:
```tsx
// before
style={{ width: `${pct}%` }}
// after
className="w-[var(--pct)]" style={{ "--pct": `${pct}%` } as React.CSSProperties}
```
This counts as done: a `style` that only sets `--custom-properties` is allowed.

### 5. Leave these alone (allowed exceptions)
- **Per-frame animation/scroll transforms** set in JS (e.g. `BioParallaxSlider`, sliders, `PageTransition`, `CustomScrollbar`). Leave them as they are. If they re-render React every frame, setting them through a ref is better, but **only change that if it's simple and safe**.
- **`app/global-error.tsx`**: it replaces the root layout, so `globals.css` and Tailwind may not be loaded there. Keep its inline styles.
- **HTML email templates** (`src/lib/email-templates.ts` and any email components): emails **require** inline styles.
- **Dev-only tools:** `style-guide`, `SpacingInspector`, `BlurTuner`, and the dev test pages (`/hambuger`, `/textcolor`, `/preloaders`, `/firecanvas`, `/slideup`, `/payment-test`). Skip them.
- **Files listed as unused** in `Claude outputs/UNUSED_FILES_REPORT.md`: don't convert them. They're due to be removed.
- Third-party components that need a `style` prop (maps, video players, LiveKit) when there's no class alternative.

## Rules
- **The site must look exactly the same** (except where a hard-coded color is replaced by its token and the difference is tiny). This is a refactor, not a redesign.
- Order:
  1. `FakeLiveStream/*` (largest, and the header in the screenshot)
  2. Admin
  3. Crew/planner dashboards
  4. Players (`VinylHeroPlayer`, `AudioPlayer`, `HeroVideoPlayer`)
  5. Cruise
  6. Everything else
- One commit per area. Run `npm run check-all` + `npm run build` after each.
- `AdminDashboardMain.tsx` is ~800 KB, so edit only the lines with `style={{`. Don't reformat the file.
- Don't touch: `ProgressiveBlur.*`, `TitleGroup.css` values, hover timing tokens, heading sizes.

## Keep it that way
Add `scripts/check-inline-styles.mjs` and include it in `npm run check-all`. It scans `src/**/*.tsx` and **fails** on any `style={{ … }}` whose keys aren't all CSS custom properties (`"--…"`). Allowed:
- the excepted files/folders above (as an allowlist at the top of the script)
- a line marked `// inline-style-ok: <reason>` directly above it, for the per-frame animation cases

It should print `file:line` for each violation and report **0** at the end.

## Verification
- `check-inline-styles` reports 0. List every `inline-style-ok` exception with its reason.
- Before/after screenshots at 1440px and 390px of:
  - the live stream page (top bar, chat, overlays)
  - admin dashboard
  - crew dashboard
  - cruise
  - home hero/players

  Nothing should visibly change.
- Hover/focus still work on everything converted.
- `npm run check-all` + `npm run build` pass.
- Write `INLINE_STYLES_REPORT.md`:
  - count before/after per file
  - new component classes created (`.glass-bar` etc.) and where they're used
  - colors that had no token
  - the allowed exceptions
