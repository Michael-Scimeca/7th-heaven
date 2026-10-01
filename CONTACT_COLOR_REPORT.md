# Contact Page Color Pass & Warm Action Accent Report

## 🎨 Color Architecture (60 / 30 / 10 Rule)
- **60% Base**: Deep near-black background (`--color-bg-base: #05030a`).
- **30% Atmosphere**: Signature brand purple (`--color-accent: #a855f7`, `@keyframes` ambient canvas and border glows).
- **10% Action Accent**: Complementary warm gold (`--color-action: #f5b942`), designated specifically for interactive links, primary CTAs, and actionable items.

---

## 1. Global Tokens Added in `globals.css`

Added to `@theme` and `:root`:
```css
/* ── Action accent: the ONLY warm color. Use for clickable contact info + primary CTAs ── */
--color-action: #f5b942;          /* 11.3:1 contrast on #05030a */
--color-action-hover: #ffd27a;    /* 14.1:1 contrast on #05030a */
--color-action-soft: rgba(245, 185, 66, 0.14);
--color-action-ring: rgba(245, 185, 66, 0.45);
```

### Unification of Secondary & Muted Text Grays
- Cleaned duplicate/inconsistent values (`0.78`, `0.5`, `0.58`) across `globals.css`.
- **`--color-text-secondary`**: Unified to `rgba(255, 255, 255, 0.72)`.
- **`--color-text-muted`**: Unified to `rgba(255, 255, 255, 0.55)`.

---

## 2. Contact Page (`src/app/contact/ContactClient.tsx`)

### Three-Level Hierarchy & Action Accents
1. **Level 1 — Name (`h2`)**: Full-strength white text (`#ffffff`), cleanly scaled by heading tag without ad-hoc utility overrides.
2. **Level 2 — Category & Company**: Small-caps styling with `uppercase tracking-wide text-sm text-[color:var(--color-text-secondary)]`, with category and company cleanly bullet-separated (`CATEGORY • COMPANY`).
3. **Level 3 — Action Links & Buttons**:
   - **Desktop**: Both email and phone links rendered in `text-action` with `text-action-hover` and `decoration-action/60` underline on hover.
   - **Icons**: Sized to 16px (`h-4 w-4`) in matching gold `text-action`, eliminating the mismatched green/purple icons.
   - **Keyboard Focus**: `focus-visible:ring-2 focus-visible:ring-action-ring focus-visible:text-action-hover focus-visible:underline`.
   - **Hover Dimming**: Inactive cards dim only the heading and category text (`opacity-75`), keeping gold action links at 100% brightness and full legibility.
   - **Mobile Stacked View**: Symmetrical paired buttons with `border border-action/40 bg-action-soft text-action hover:bg-action/20` and 16px gold icons.

### Valid HTML Structure
- Replaced the outer `<button>` container with an accessible semantic `<article>` using `onMouseEnter` and `onFocus` to trigger photo swapping.
- Removed invalid nested `<a>` inside `<button>` and eliminated unnecessary `e.stopPropagation()` handlers.

---

## 3. Lighting & Scrim Enhancements
- **Representative Spotlight**: Added `.contact-rep-stage::before` in `globals.css` with a subtle radial gradient (`rgba(245, 185, 66, 0.28)`) and `blur(40px)` behind the desktop photo cutout.
- **Desktop Left Scrim**: Added `#contact-page::before` on desktop with `linear-gradient(90deg, rgba(5,3,10,0.55) 0%, rgba(5,3,10,0.25) 35%, transparent 60%)` to ensure high contrast behind directory text.

---

## 4. Navigation Active State Resolution
- **Issue Investigated**: Both **MEDIA** and **CONTACT** appeared active simultaneously on `/contact`.
- **Root Cause**: `isNavActive` in `Header.tsx` was correctly returning `true` only for `/contact` and `false` for `/media`. However, in `globals.css`, `#nav-inner-card a:hover` and `#nav-inner-card a.active` both used the exact same text color (`#c084fc`), making a hovered link look identical to the active link.
- **Fix**: Added a permanent 2px rounded underline bar (`::after`) with glow to `#nav-inner-card a.active`. Active links now clearly display their underline bar, while hover states change text color only.

---

## 5. Contrast & Accessibility Verification

| Element | Background | Relative Luminance | Contrast Ratio | WCAG Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **`--color-action` (`#f5b942`)** | `#05030a` (Base Dark) | `0.528` vs `0.0011` | **11.31:1** | **AAA** (Pass) |
| **`--color-action` (`#f5b942`)** | Magenta Gradient Region (`#2d0f3c`) | `0.528` vs `0.012` | **9.32:1** | **AAA** (Pass) |
| **`--color-action-hover` (`#ffd27a`)** | `#05030a` (Base Dark) | `0.672` vs `0.0011` | **14.13:1** | **AAA** (Pass) |
| **Secondary Text (`rgba(255,255,255,0.72)`)** | `#05030a` (Base Dark) | `0.473` vs `0.0011` | **10.23:1** | **AAA** (Pass) |
| **Muted Text (`rgba(255,255,255,0.55)`)** | `#05030a` (Base Dark) | `0.274` vs `0.0011` | **6.34:1** | **AA** (Pass) |

---

## 6. Recommended Future Locations for `--color-action`
1. **Tour / Show Dates**: "GET TICKETS" / "RSVP" primary action buttons.
2. **Merch Store**: Price tags and "ADD TO CART" checkout buttons.
3. **Live Hub**: "LIVE NOW" broadcasting badge and active chat tipping actions.
4. **Cruise Booking**: "MAKE A PAYMENT" primary action button and cabin booking CTAs.
