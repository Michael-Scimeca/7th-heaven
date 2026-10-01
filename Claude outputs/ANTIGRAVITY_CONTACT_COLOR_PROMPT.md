# Task: Contact page color pass + one gold accent for the site

Repo: `7th-heaven` (Next.js 16, React 19, Tailwind v4). Read `AGENTS.md` first. If any `*_REPORT.md` files exist from earlier tasks (hover transitions, heading scale, title gap, page pause…), read them and don't undo their changes.

## The idea (color theory to follow)
- **60 / 30 / 10.**
  - 60%: tinted near-black background (already `--color-bg-base: #05030a`).
  - 30%: purple atmosphere (the animated gradient blobs, borders, glows).
  - 10%: **one warm gold accent**, used **only for things people click or should act on** (contact links, primary CTAs, LIVE badges).
- Gold is purple's complement, so it's the strongest contrast the brand can have. It also matches the warm amber glow already in the background (that orange comes from the `hard-light` blend of the `.gradient-bg` blobs).
- **Each color has one job.** Purple = brand/mood. Gold = action. Green/red/amber = success/error/warning messages **only**, never decoration.

## 1. Add the accent tokens (global, once)
In `src/app/globals.css`, inside the main `@theme` block (next to the existing `--color-accent*` tokens):
```css
/* ── Action accent: the ONLY warm color. Use for clickable contact info + primary CTAs ── */
--color-action: #f5b942;          /* 11.6:1 on #05030a */
--color-action-hover: #ffd27a;
--color-action-soft: rgba(245, 185, 66, 0.14);
--color-action-ring: rgba(245, 185, 66, 0.45);
```
- This makes `text-action`, `bg-action-soft`, `decoration-action` etc. available as Tailwind utilities. Check that they appear in the built CSS.
- **Don't** apply gold site-wide in this task. Only the contact page uses it for now (step 2). Add a short note in the report listing other good places for it (primary CTAs, "Get Tickets", LIVE badge, prices) so I can decide.
- **Also fix the text gray tokens.** `--color-text-secondary` is defined as both `rgba(255,255,255,0.78)` (~line 66/803) and `0.5` (~line 1766). Pick **0.72** for secondary and **0.55** for muted, define each once, and remove the duplicates. Grep for uses first and list any that look visibly different afterward.

## 2. Contact page: `src/app/contact/ContactClient.tsx`
Set up a clear three-level text hierarchy and give contact actions the accent.

**Desktop list (the `lg:grid` view):**
1. **Name** (`h2`): white, as it is now.
2. **Category + company line:** `text-[color:var(--color-text-secondary)]`, small caps feel: `uppercase tracking-wide text-sm`. Separate company with ` • ` the same way category parts are separated (right now "Press • Media  NTD Records" is missing the dot).
3. **Email + phone links:** **both** use the gold accent, so they look like the same kind of thing:
   - text `text-action`; hover `text-action-hover` + underline (`underline-offset-4 decoration-action/60`)
   - icons (`Mail`, `Phone`) `text-action`, size 16px (currently 14px and nearly invisible). Remove the emerald phone icon and purple mail icon colors.
   - `focus-visible` gets the same look as hover, plus a `--color-action-ring` outline.
4. Inactive cards are `opacity-75`, which dims the gold too. Instead, dim only the name and category (`opacity` on those elements), and keep links at full color so they're always readable.

**Mobile stacked view:**
- The email button (`border-purple-500/40 bg-purple-950/60 text-purple-200`) and phone button (`bg-white/5 text-white/80`, emerald icon) should match each other:
  - `border border-action/40 bg-action-soft text-action hover:bg-action/20`
  - icon `text-action`
- Category/company text: same secondary style as desktop. The category `<span className="">` currently has no styling at all.

**Invalid HTML to fix while you're here:**
- In the desktop list, each card is a `<button>` that contains `<a>` links (and an `h2`). Links inside a button are invalid and confuse keyboard and screen-reader users.
- Change the wrapper to a `<div>` (or `<article>`) with `onMouseEnter` / `onFocus` (focus within) to set the active photo. Keep the links as normal links, and remove the `e.stopPropagation()` calls once they're no longer needed.

## 3. Contact page: warm light behind the photo, darker behind the text
Right now the amber glow floats in the empty middle of the page, and the text column sits over the brightest magenta area.

1. **Spotlight behind the rep photo.**
   - Add a page-specific layer inside `.contact-rep-stage` (`globals.css` ~line 474), behind the image, with **no** changes to the global `.gradient-bg` blobs:
     ```css
     .contact-rep-stage::before {
       content: "";
       position: absolute;
       inset: 10% -10% 0 10%;
       background: radial-gradient(ellipse at 60% 70%, rgba(245,185,66,0.28), rgba(245,185,66,0) 60%);
       filter: blur(40px);
       z-index: 0;
       pointer-events: none;
     }
     ```
   - Make sure `.contact-rep-stage` is `position: sticky` (it already is, so `::before` positions relative to it) and the photo sits above it (`z-index: 1`).
   - The goal is a warm rim light around the person's head and shoulders. Tune the opacity by eye; it should be subtle.
2. **Rim light on the photo itself (optional, if it looks good):** `filter: drop-shadow(0 0 40px rgba(245,185,66,0.18))` on `.contact-rep-stage-img`. Skip it if it makes the cutout edges look fake.
3. **Darken behind the text.** On `#contact-page` (desktop only, `lg:`), add a left-side scrim behind the content, not over it:
   `linear-gradient(90deg, rgba(5,3,10,0.55) 0%, rgba(5,3,10,0.25) 35%, transparent 60%)`. Use a pseudo-element or an absolutely positioned div with `pointer-events-none -z-0`, kept behind the text.
4. Don't change the animated background anywhere else on the site.

## 4. Bugs seen in the screenshot (check first, then fix)
1. **Two nav items highlighted.** On `/contact`, both **MEDIA** and **CONTACT** show the purple active color.
   - First check whether MEDIA was just hovered (the hover color equals the active color).
   - If MEDIA is really getting `.active` on `/contact`, fix `isNavActive` in `src/components/Header.tsx` (~line 326) so exactly one link is active per route.
   - **Either way:** make the active state visibly different from hover (e.g. active = the color + a 2px underline bar; hover = the color only), so this can't be confused again.
2. **Left edge looked cut off** ("ERCH", "ONTACT", "et in touch"). This is probably just my screenshot crop (the browser's bookmarks bar is cut off too), but verify at 1280, 1440 and 1920 widths that the page and header have their normal left padding and there's no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`).

## Don't touch
- `ProgressiveBlur.*`, `TitleGroup.css`, the hover-transition tokens, the heading sizes (headings are sized by tag now; don't add `text-*` size classes to them; `scripts/check-heading-classes.mjs` must stay at 0).
- The global animated gradient, page transitions, preloader.

## Verification
- Contrast:
  - gold links on the darkest and brightest parts of the contact background ≥ 4.5:1
  - secondary text ≥ 4.5:1

  Check with the browser's contrast tool and note the numbers.
- Desktop: hover each contact → photo swaps, links stay full gold, keyboard Tab reaches every email/phone link with a visible gold focus ring, and there are no button-inside-link warnings in the console.
- Mobile (390px): email and phone buttons look like a matching pair.
- Only one nav item is active on every main page.
- `npm run check-all` + `npm run build` pass.
- Write `CONTACT_COLOR_REPORT.md`: before/after screenshots (desktop + mobile), the contrast numbers, what the nav bug turned out to be, and the list of other places the gold accent could go.
