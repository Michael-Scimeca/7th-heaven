# Task: Route every "title + paragraph under it" on the site through the shared title components

Repo: `7th-heaven` (Next.js 16, React 19, Tailwind v4). Read `AGENTS.md` first.

## Background
The gap between a heading and the text right under it is now controlled in one place:
- `src/components/TitleGroup.css` defines `--title-gap-page`, `--title-gap-section` and `--title-gap-sub`, plus a `.title-group` flex-column class that applies them.
- `PageHero` (page H1 + intro line) and `SectionHeader` (h2/h3 + subtitle) both wrap their title and subtitle in `.title-group`. Each one accepts an optional `titleGap` prop for a one-off override.
- The dev-only "Tune" panel (`BlurTuner.tsx`) edits these variables live.

Any heading that is hand-built directly in a page (for example an `<h1>`/`<h2>` followed by a `<p>` with its own `mt-*`, `mb-*` or `gap-*`) ignores these settings. Find them and move them onto the shared system.

## Steps
1. **Inventory.** Search every file in `src/app/**` and `src/components/**` for headings (`<h1>`–`<h3>`, and elements with the `text-h1` / `text-h2` / `text-h3` classes) that are directly followed by a subtitle, intro or description paragraph. Skip `src/app/admin/**`, `src/app/studio/**`, emails, and dev/test pages (`payment-test`, `hambuger`, `textcolor`, `preloaders`, `firecanvas`, `slideup`, `style-guide`). List each one as `file:line` together with its current gap classes before you change anything.
2. **Convert.**
   - Page-level title + intro → `<PageHero title subtitle badge actions align />`.
   - Section title + subtitle → `<SectionHeader as="h2" | "h3" title subtitle />`. Use `divider={false}` wherever the current design has no divider line.
   - Where the markup can't become one of those components (a heading inside a card, a hero with a custom layout), wrap only the heading + paragraph in `<div className="title-group title-group--section">` (or `--page` / `--sub`) and import `@/components/TitleGroup.css` if it isn't already loaded. Remove the old `mt-*` / `mb-*` / `gap-*` between the two elements.
3. **Keep the look.** For each conversion, check whether the old gap matched the token for its level. If it didn't and the difference was clearly intentional, keep it with `titleGap="…"` on that instance and list it in your report. Otherwise use the default token. Keep heading levels, `id`s, `aria-labelledby` links and the section pattern in `SECTION_PATTERN_CHECKLIST.md` intact.
4. **Don't touch** `PageHero.tsx`, `SectionHeader.tsx`, `TitleGroup.css`, `BlurTuner.tsx` or `ProgressiveBlur.*`, apart from fixing a real bug in them (explain it if you do).

## Verification
- `npm run check-all` and `npm run build` pass.
- Open the Tune panel (`npm run dev`, bottom-left). Moving each "Title → text gap" slider must visibly move the gap on every converted page: home, cruise, book, shows, media, merch, contact, faq, news, live, fans, privacy, terms and returns. Check at 390px and 1440px.
- Report in `TITLE_GAP_REPORT.md`: every converted heading as `file:line → component used`, every `titleGap` override and why, and anything you skipped.
