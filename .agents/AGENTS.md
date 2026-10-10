# Project Agent Directives

## 🩺 React Doctor Auto-Check Rule (MANDATORY)

After modifying any React component, hook, or API route in `src/`:
1. **Always run**: `npx react-doctor@latest --scope changed`
2. **Verify score**: Ensure the React Doctor score does NOT regress from 100/100 and no new warnings/errors are introduced.
3. **Auto-fix before completing**: Immediately resolve any flagged issues (e.g. side-effects in state updaters, missing res.ok checks, unversioned localStorage keys, missing dependencies) BEFORE reporting completion to the user or running git commit.

## 🎨 No Static Inline Styles Rule (MANDATORY)

In this project, **never write static values** in `style={{...}}` or `element.style`.
- Use Tailwind v4 classes, `@theme` tokens, or `@utility` directives in `src/app/globals.css`.
- Inline `style` is allowed **only** to pass a CSS custom property (e.g. `style={{ '--var': value }}`) for dynamic runtime values.
- **Exceptions**: GSAP / Framer Motion / Lenis physics, canvas / shader / WebGL contexts, map pins (`TourMap`), visual editors (`HeaderMaskEditor`, `CruiseHeroMaskEditor`), and external email HTML strings.

## 🖼️ Image Storage & Naming Convention Rule (MANDATORY)

- **Location**: Always place new images inside `public/images/<section>/` (e.g. `public/images/cruise/`, `public/images/merch/`, `public/images/tour/`). **Never put images directly in the `public/` root**.
- **Naming**: Use **lowercase kebab-case** descriptive names (e.g. `band-stage-lighting.webp`, `tour-map-bg.png`).
- **No Raw IDs**: Never use camera IDs, Amazon seller IDs (e.g. `71tQzMjwGaL._SL1500_.jpg`), stock photo hashes, or raw IDs in image filenames.

## 🔤 Typography & Color Hierarchy Rule (MANDATORY)

Use only the type-scale and color tokens. No text-[Npx], no inline fontSize, no hex text colors. One h1 per page, no skipped heading levels.

## 📐 Section Heading & Spacing Rule (MANDATORY)

Every section heading uses `<SectionHeader>`. Sections are spaced by the parent's gap, never by margins on the heading.
Padding = inside boxes with a visible edge. Gap = between siblings (parent owns it). No margins on components except mt-auto / mx-auto.
All values on the 8px grid via spacing tokens (no off-grid values like 20px / py-5). Parent gap owns space between siblings; a child's padding must never add to the parent's gap.

## 🏗️ Page Structure Rule (MANDATORY)

Page structure: `<main>` → optional `<header>` with the `h1` → `<section>`s (each with a heading + `aria-labelledby`). Layout divs go inside sections, never beside them. Sidebars are `<aside>`. Form steps are sibling `<section>`s.

## 🔘 Unified Toggle Rule (MANDATORY)

All on/off switches across the site must use `<Toggle>`. Toggle styling lives only in the `TOGGLE` component block in `src/app/globals.css`. Never create hand-built toggle switches or write inline toggle styles. Use `size="sm"` for compact admin tables and dense cards, and `size="md"` for standard forms. Always ensure accessible labels are provided via `label`, or `hideLabel` with `aria-labelledby`.

## 📦 Standard Section Recipe Rule (MANDATORY)

Every section = `<PageSection>` + `<SectionHeader>` + `<Stack>`. No section spacing, gutter or heading styles written by hand. PageSection owns vertical spacing (`size="sm|md|lg"`) and gutter (`site-container`). SectionHeader handles badges, icons, subtitles, and headings. Stack owns spacing between siblings via `gap`.

## 🧩 Shared Components & Anti-Duplication Rule (MANDATORY)

Before building a section, check the style guide for an existing component (PageHero, LegalPage, FaqAccordion, VerifyFlow, StatusScreen, VideoGrid, ShowCard, Countdown, NotifyPrompt, ProductCard, PageSection). Never build a second version of an existing section type.

## 📑 Section Pattern Rule (MANDATORY)

Page sections = `<section id aria-labelledby className="section|section-sm|section-lg">` (or `<PageSection>`) stacked in a flex-col parent. Only the section size class on the `<section>`; layout/background/animation go inside. Heading id = `'<section-id>-heading'`.

## 🔲 Corner Radius Consistency Rule (MANDATORY)

Boxes use rounded-[var(--radius-box)] (20px) via the shared components; pills use rounded-full; media gets radius on an overflow-hidden wrapper. Never redefine radius tokens.

