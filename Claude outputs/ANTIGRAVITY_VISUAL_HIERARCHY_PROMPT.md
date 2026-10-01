# Task: Visual hierarchy pass, so every screen guides the eye

Repo: `7th-heaven` (Next.js 16, React 19, Tailwind v4, Sanity). Read `AGENTS.md` first, then every `*_REPORT.md` / `*_AUDIT.md` from earlier tasks (hover transitions, heading scale, title gap, contact color, page pause, mobile Safari…). **Build on them; don't undo them.**

## The goal
On every screen, a visitor should know within 3 seconds:
1. **Where am I?** (one clear page title)
2. **What's the most important thing here?** (one focal point)
3. **What should I do next?** (one primary action)

Right now many sections give everything the same weight: big white condensed headings, bright purple, glowing gradients and many accent colors all compete. When everything shouts, nothing is heard. This task is about **contrast between levels**, not adding decoration.

**Brand stays the same:** dark purple stage atmosphere, the condensed display headings, the animated gradient, and the gold "action" accent from `CONTACT_COLOR_REPORT.md` (if that task has run). This is a polish pass, not a redesign.

---

## Part 1: The rules (write them into `DESIGN_RULES.md` at the root first)

### 1. One focal point per screen
- Every viewport-height section has **one** dominant element: the biggest, brightest or highest-contrast thing. Everything else steps down.
- **Squint test:** blur a screenshot (CSS `filter: blur(8px)` or squint). The thing you still see should be the thing that matters. If two things tie, demote one.

### 2. Create levels with contrast, using **at most 2 tools per step**
The tools are size, weight, color/brightness, space, and position. A level change should use 1–2 of them, not all five.

| Level | What | Look |
|---|---|---|
| 1 | Page title / hero statement | Tag-sized heading (already handled by the heading scale), full white |
| 2 | Section titles | Heading scale, full white |
| 3 | Item titles (show, person, product) | Heading scale, white |
| 4 | Body / descriptions | `--color-text-secondary` (~72% white), normal weight |
| 5 | Meta (dates, categories, captions) | `--color-text-muted` (~55% white), smaller |
| Action | Links, buttons, prices, contact info | Gold accent (`--color-action`) or the primary button style |

- **Brightness is the main lever on a dark site.** Pure white should be rare: titles only. Body copy at full white makes everything the same level.
- Purple text is for brand moments, not for body or meta text. For readable purple text use only the light lavender (`#c084fc`, ≥ 7:1).

### 3. Button hierarchy: exactly three kinds, site-wide
- **Primary:** one per screen at most. Filled, the strongest color. Examples: "Get Tickets", "Book Us", "Reserve Cabin".
- **Secondary:** outline or ghost.
- **Tertiary:** text link.
- Audit every page for screens with 2+ filled buttons side by side, and demote all but one.
- Make **one** `Button` component (or reuse the existing one) with `variant="primary|secondary|tertiary"` and **use it everywhere**. List the one-off button styles you replaced.

### 4. Space is hierarchy (Gestalt proximity)
- Related things sit close together; unrelated groups are far apart. The rule: **space between groups ≥ 2× space inside a group.** Example: a name, its role and its email are tight; the next person is clearly separated.
- Use the existing spacing tokens / `title-group` gaps. **No new raw margins.**
- Spacing scale: pick the existing steps (e.g. 4, 8, 12, 16, 24, 32, 48, 64, 96, 128) and flag values off the scale.

### 5. Alignment and reading paths
- **One left edge per section.** Left-align text-heavy content; center only short hero statements and single CTAs. Don't mix centered headings with left-aligned body in the same block.
- Content-heavy pages (FAQ, news, privacy, shows list) follow the **F-pattern**: strong left edge, scannable headings, key words first.
- Landing sections (home hero, cruise hero, book) follow the **Z-pattern**: logo/nav, then a strong statement, diagonally across to the primary CTA.
- **Line length:** body text 45–75 characters (`max-w-[65ch]`). Fix any paragraph that runs the full width on desktop.

### 6. Imagery leads the eye
- People photos: the subject's gaze or body should point **into** the content, not off the page. Flip or reposition where it's clearly wrong.
- Text over images/video: guarantee contrast with a scrim (gradient behind the text), not by making the text bigger or adding glow.
- One hero image per section. Don't stack several equally strong images in one viewport.

### 7. Color discipline (from the contact task)
- 60 / 30 / 10: dark background, purple atmosphere, gold for actions only.
- Remove decorative accent colors (emerald, pink, cyan, orange, rose, blue…) that don't mean anything. Keep green/red/amber only for success/error/warning.
- Glows and gradients are atmosphere. **Never put a glow on more than one element per screen.** A glow says "look here", so it can only be used once.

### 8. Motion only where it helps
- **One** orchestrated moment per page (e.g. the hero entrance). Remove the fade-and-slide-up from sections where it only delays content.
- Motion that answers an action is good: hover, open/close, add-to-cart confirmation.
- Respect `prefers-reduced-motion` (already set up by the hover task; don't break it).

### 9. Avoid "template" tells
- **Small all-caps "eyebrow" labels above every heading:** keep them only where they carry information (a date, a show city). Otherwise remove them.
- **`01 / 02 / 03` numbering:** only for real sequences (booking steps, itinerary days).
- **Identical rounded cards for every kind of content:** a show, a person and a product shouldn't all look like the same box. Vary the treatment by content type.
- **`→` on every link, middle dots (`A · B · C`) everywhere, one-word color accents inside headings:** use them only on purpose.

### 10. Accessibility is part of hierarchy
- Text contrast ≥ 4.5:1 (body) / 3:1 (large headings), measured on the **actual** background, including the brightest gradient spot.
- A visible focus ring (gold) on every interactive element, in the same order as the visual order.
- Tap targets ≥ 44px on mobile.
- One `<h1>` per page, headings in order. Fix this here if the heading task didn't.

---

## Part 2: Audit every page (before changing anything)
For each page, at **1440px and 390px**, take a normal screenshot and a blurred one (`filter: blur(8px)` on `<body>`).

**Pages:**
- Public: `/`, `/cruise`, `/book`, `/media`, `/merch` (and a product), `/contact`, `/faq`, `/live`, `/fan-media-wall`, `/rock-and-roll-kids`, `/shows/past`, `/news` (and one article), `/7hrrk`, `/privacy`, `/terms`, `/returns`
- Signed in: `/fans/me`, the crew dashboard, the planner dashboard

Score each page 1–5 on:

| | Focal point clear | Title → body → meta levels | One primary CTA | Spacing groups | Alignment | Contrast |
|---|---|---|---|---|---|---|

Also record for each page:
- the 3 biggest problems
- what you see first in the blurred version vs. what **should** be seen first

Put the scores in `VISUAL_HIERARCHY_REPORT.md` **before** making changes, and stop to show me the table plus the top 10 fixes ranked by impact. **Wait for my OK before Part 3.**

## Part 3: Fix (after my OK)
1. **Global first:**
   - text color tokens for the five levels
   - the `Button` variants
   - any spacing tokens that are missing
   - wire these into `PageHero`, `SectionHeader` and the card components so most pages improve without per-page edits
2. **Then per page,** in impact order: home → book → cruise → live → merch → media/fan wall → contact → shows/news → FAQ/legal → dashboards.
   - Small commits per page.
   - Run `npm run check-all` + `npm run build` after each.
3. Add a "Hierarchy" section to `src/app/style-guide/page.tsx`. It should show the five text levels, the three button kinds, and an example card with correct spacing, so future work copies it.

## Don't touch
- Heading font sizes (sized by tag; `scripts/check-heading-classes.mjs` must stay at 0)
- Hover timing tokens
- `ProgressiveBlur.*`
- `TitleGroup.css` gap values (use them, don't change them)
- Page transitions/preloader
- Sanity content structure: don't rename fields; if a fix needs new content, list it for me

## Verification
- Before/after normal + blurred screenshots for every page in the report. In the "after" blurred shot, the intended focal point is clearly what stands out.
- Every page scores ≥ 4 on all six criteria, or the report explains why not.
- No screen has more than one filled primary button or more than one glow.
- Contrast numbers for body, meta and action text on each page's brightest background.
- `npm run check-all` + `npm run build` pass.
