# Typography & Color System Audit (Phase 1)
**Project**: 7th Heaven Web Application (`7th-heaven`)  
**Audit Date**: September 27, 2026  
**Status**: Pending User Approval for Phase 2 Execution  

---

## 1. Heading Outline Per Page & Structural Integrity Audit

Below is the heading outline (`<h1>` → `<h6>`) mapped across all primary routes in `src/app/`.

### Heading Outlines & Structural Flags

#### **Home (`/`)**
- `<h1>` (sr-only): *7th Heaven — Official Band Website & Tour Schedule* (`app/page.tsx:56`)
- `<h1>` (visual): *7TH HEAVEN* (`HeroVideoPlayer.tsx:340`)
- `<h2>`: *7th Heaven News* (`HomeNewsSection.tsx`)
- `<h3>`: *[News Item Title]* (`HomeNewsSection.tsx`)
- `<h2>`: *Video Vault & Live Performances* (`HomeVideoShowcase.tsx`)
- `<h2>`: *Upcoming Tour Schedule* (`TourList.tsx`)
- `<h3>`: *[Venue Name]* (`TourList.tsx`)
- `<h2>`: *Band Members* (`BioParallaxSlider.tsx`)
- `<h3>`: *[Member Name]* (`BioParallaxSlider.tsx`)
- `<h2>`: *Discography* (`DiscographySection.tsx`)
- `<h3>`: *[Album Title]* (`DiscographySection.tsx`)
- `<h4>`: *[Track Title]* (`CosmicTrackCard.tsx`)
- 🚩 **FLAG (Multiple `<h1>`)**: Home page renders **two `<h1>` tags** (`app/page.tsx` sr-only + `HeroVideoPlayer.tsx`).
- 🚩 **FLAG (Skipped Level)**: `CosmicTrackCard.tsx` renders `<h4>` directly under `<h2>` section container (skipping `<h3>`).

#### **Cruise (`/cruise`)**
- `<h1>`: *7TH HEAVEN FAN CRUISE* (`CruiseHeroSection.tsx:141`)
- `<h2>`: *Staterooms & Cruise Rates* (`CruiseCabinsPricingSection.tsx:267`)
- `<h3>`: *[Inclusions & Perks]* (`CruiseCabinsPricingSection.tsx`)
- `<h2>`: *Royal Caribbean Explorer* (`CruiseShipExplorerSection.tsx:30`)
- `<h3>`: *Bars & Entertainment Explorer* (`CruiseShipExplorerSection.tsx:400`)
- `<h2>`: *Destination Ports & Excursions* (`CruisePortsCatalogSection.tsx:45`)
- `<h3>`: *[Port Name]* (`CruisePortsCatalogSection.tsx`)
- `<h2>`: *Frequently Asked Questions* (`CruiseFaqSection.tsx:40`)
- `<h3>`: *[FAQ Question]* (`CruiseFaqSection.tsx`)
- `<h2>`: *Cruise Schedule & Itinerary* (`CruiseItinerarySection.tsx:35`)
- `<h2>`: *Past Cruise Highlights* (`CruiseHistorySection.tsx:20`)
- `<h2>`: *Cruise Video Vault* (`CruiseVideoVaultSection.tsx`)
- ✅ **Clean outline**: Single `<h1>`, structured descending order.

#### **Media (`/media`)**
- `<h1>`: *Media & Video Gallery* (`MediaClient.tsx:505`)
- `<h2>`: *Official Music Videos / Live Shows / TV Appearances* (`MediaClient.tsx`)
- `<h3>`: *[Video Title]* (`MediaClient.tsx`)
- ✅ **Clean outline**: Single `<h1>`, logical hierarchy.

#### **Merch (`/merch`)**
- `<h1>`: *Merch Table* (`MerchClient.tsx:357`)
- `<h2>`: *Apparel / Accessories / Music & Physical Media* (`MerchClient.tsx`)
- `<h3>`: *[Product Name]* (`MerchClient.tsx`)
- ✅ **Clean outline**: Single `<h1>`, logical hierarchy.

#### **Past Shows (`/shows/past`)**
- `<h1>`: *Past Shows & Concert Archive* (`app/shows/past/page.tsx`)
- `<h2>`: *[Year / Month Heading]* (`app/shows/past/page.tsx`)
- ✅ **Clean outline**.

#### **Live Stream (`/live`)**
- `<h1>`: *Live Stream & Interactive Chat* (`LiveHubClient.tsx:273`)
- `<h2>`: *Live Stream Hub* (`HeroLiveHub.tsx`)
- `<h4>`: *Stream Chat & Controls* (`HeroLiveHub.tsx`)
- 🚩 **FLAG (Skipped Level)**: `HeroLiveHub.tsx` jumps from `<h2>` directly to `<h4>`.

#### **Contact (`/contact`)**
- `<h1>`: *Contact 7th Heaven & Booking Inquiries* (`ContactClient.tsx:160`)
- `<h2>`: *General Contact / Management / Booking* (`ContactClient.tsx`)
- ✅ **Clean outline**.

#### **FAQ (`/faq`)**
- `<h1>`: *Frequently Asked Questions* (`FaqClient.tsx:296`)
- `<h2>`: *[Category Name]* (`FaqClient.tsx`)
- `<h3>`: *[Question Title]* (`FaqClient.tsx`)
- ✅ **Clean outline**.

#### **Book (`/book`)**
- `<h1>`: *Event Schedule & Format* (`BookClient.tsx:1161`)
- `<h2>`: *Booking Inquiry Form* (`BookClient.tsx`)
- 🚩 **FLAG (Multiple `<h1>` / Step Headers)**: Booking steps use `<h1>` in secondary views (`BookClient.tsx:1161` & `BookClient.tsx:1285`).

#### **Admin (`/admin`)**
- `<h1>` (sr-only): *7th Heaven Admin Portal* (`app/admin/page.tsx:297`)
- `<h1>` (visual): *{effectiveAdmin.name}* (`AdminDashboardMain.tsx:17641`)
- `<h3>`: *Audit Log* (`AdminDashboardMain.tsx`)
- `<h3>`: *Passenger Notice & Email Broadcast* (`AdminDashboardMain.tsx`)
- `<h4>`: *Live Dispatch Preview* (`AdminDashboardMain.tsx`)
- 🚩 **FLAG (Multiple `<h1>`)**: Admin page renders two `<h1>` tags (`page.tsx` + `AdminDashboardMain.tsx`).

#### **Fan Portal (`/fans`)**
- `<h1>` (sr-only): *7th Heaven Fan Portal* (`fans/page.tsx:45`)
- `<h1>`: *Fan Account* (`fans/[username]/page.tsx:538`)
- 🚩 **FLAG (Multiple `<h1>`)**: Fan Portal renders two `<h1>` tags across page wrapper and client view.

#### **Planner (`/planner`)**
- `<h1>` (sr-only): *7th Heaven Event Planner Portal* (`planner/page.tsx:34`)
- `<h1>`: *Planner Portal* (`PlannerClient.tsx:223`)
- `<h1>`: *{booking.eventName}* (`PlannerClient.tsx:350`)
- 🚩 **FLAG (Multiple `<h1>`)**: 3 `<h1>` tags rendered in `PlannerClient.tsx`.

---

### Fake Headings Audit (div / span / p with `text-3xl+`)
**Count**: **64 instances** across the codebase.
Examples of structural elements using non-heading tags for section titles:
1. `src/app/claim/[pin]/page.tsx:299`: `<span className="mb-5 block text-6xl">🏆</span>`
2. `src/app/cruise/[username]/page.tsx:804`: `<span className="mb-3 block text-4xl">...</span>`
3. `src/app/book/BookClient.tsx:1285`: `<span className="mb-6 block text-4xl">📅</span>`
4. `src/app/admin/[username]/components/AdminDashboardMain.tsx:17774`: `<span className="text-3xl">{metric.value}</span>`

---

## 2. Specificity & Cascade Conflicts in `src/app/globals.css`

`h1`–`h6` elements are styled **three separate times** across `globals.css`:

1. **Unlayered Rules (Line ~381)**:
   ```css
   h1 { font-size: clamp(2.25rem, 6vw, 4.5rem); line-height: 1; }
   h2 { font-size: clamp(1.5rem, 4vw, 2.5rem); line-height: 1.2; }
   h3 { font-size: clamp(1.25rem, 3vw, 1.75rem); line-height: 1.2; }
   h4 { font-size: clamp(1.125rem, 2.5vw, 1.5rem); line-height: 1.25; }
   h5 { font-size: clamp(1rem, 2vw, 1.25rem); line-height: 1.3; }
   h6 { font-size: clamp(0.875rem, 1.5vw, 1rem); line-height: 1.4; }
   ```
2. **Important Color Rule (Line ~656)**:
   ```css
   h1, h2, h3, h4, h5, h6 { color: var(--heading-color) !important; }
   ```
3. **`@layer base` Rules (Line ~1942)**:
   ```css
   h1, h2, h3, h4, h5, h6 {
     font-family: 'Switzer', sans-serif; /* Conflicts with --font-family-heading (Tanker) */
     margin: 0; z-index: 9;
   }
   h1 { font-size: var(--font-size-6xl); font-weight: 900; line-height: var(--leading-display, 0.95); letter-spacing: var(--tracking-display, -0.04em); }
   h2 { font-size: var(--font-size-5xl); font-weight: 800; ... }
   ```

### Which Rule Wins Today?
- In CSS Cascading & Inheritance Module Level 5, **unlayered CSS rules always override styles inside `@layer base` regardless of order**.
- Therefore, the unlayered rules at **Line ~381 (`clamp(2.25rem, 6vw, 4.5rem)`) WIN for font-size**, overriding `@layer base`'s `var(--font-size-6xl)`.
- However, Line ~1948 in `@layer base` sets `font-family: 'Switzer'`, which applies because line ~381 does not specify `font-family`. This causes headings to render in **Switzer instead of Tanker** (`--font-family-heading`).

### Actual Rendered Sizes (`h1`–`h6`) in Browser

| Heading | CSS Rule Winning | Calculated at **1440px** Viewport | Calculated at **390px** Viewport (Mobile) |
| :--- | :--- | :--- | :--- |
| **`h1`** | `clamp(2.25rem, 6vw, 4.5rem)` | **72px** (`4.5rem`) | **36px** (`2.25rem`) |
| **`h2`** | `clamp(1.5rem, 4vw, 2.5rem)` | **40px** (`2.5rem`) | **24px** (`1.5rem`) |
| **`h3`** | `clamp(1.25rem, 3vw, 1.75rem)` | **28px** (`1.75rem`) | **20px** (`1.25rem`) |
| **`h4`** | `clamp(1.125rem, 2.5vw, 1.5rem)` | **24px** (`1.5rem`) | **18px** (`1.125rem`) |
| **`h5`** | `clamp(1rem, 2vw, 1.25rem)` | **20px** (`1.25rem`) | **16px** (`1.0rem`) |
| **`h6`** | `clamp(0.875rem, 1.5vw, 1rem)` | **16px** (`1.0rem`) | **14px** (`0.875rem`) |

---

## 3. Token Problems & Redundancies in `globals.css`

1. **Broken Font Size Tokens (Lines 450–454)**:
   ```css
   --font-size-2xs: 1rem; /* 16px */
   --font-size-xs: 1rem;  /* 16px */
   --font-size-sm: 1rem;  /* 16px */
   --font-size-md: 1rem;  /* 16px */
   --font-size-base: 1rem;/* 16px */
   ```
   *`2xs`, `xs`, `sm`, `md`, and `base` are all hardcoded to identical `1rem` values, rendering small/caption tokens useless.*

2. **Duplicate Token Definitions with Conflicting Values**:
   - `--color-bg-surface` in `@theme` (Line 14): `#0f0f13` (solid dark navy/gray).
   - `--color-bg-surface` in `:root` (Line 425): `rgba(15, 5, 29, 0.55)` (semi-transparent purple/black).

3. **Identical Text Color Tokens (Lines 429–431)**:
   - `--color-text-secondary`: `rgba(255, 255, 255, 0.5)`
   - `--color-text-muted`: `rgba(255, 255, 255, 0.5)`
   - `--color-text-subtle`: `rgba(255, 255, 255, 0.5)`
   *No visual hierarchy exists between secondary, muted, and subtle text.*

---

## 4. Quantitative Codebase Audit Counts

| Category | Metric Count | Notes & Common Patterns |
| :--- | :--- | :--- |
| **Arbitrary Font Sizes (`text-[...px]`)** | **640 instances** | `text-[10px]` (291), `text-[12px]` (116), `text-[0.9rem]` (59), `text-[0.55rem]` (55), `text-[9px]` (30), `text-[8px]` (11) |
| **Inline `fontSize` Styles** | **113 instances** | E.g. `style={{ fontSize: "11px" }}`, `style={{ fontSize: "0.8rem" }}` |
| **Heading Size Overrides** | **57 instances** | E.g. `<h2 className="text-sm">`, `<h3 className="text-xs">`, `<h1 className="text-2xl">` |
| **Hex/RGB Color Classes** | **746 instances** | Tailwind utility classes with inline hex values (`bg-[#00000029]`, `text-[#c27aff]`, `border-[#851DEF]`) |
| **Purple Accent Color Variants** | **8 variants** | `#a855f7` (146), `#c084fc` (96), `#9333ea` (51), `#8a1cfc` (30), `#d946ef` (21), `#c27aff` (19), `#7e22ce` (10), `#e879f9` (7) |
| **White-Opacity Text Classes** | **1,053 instances** | `text-white/40` (407), `text-white/5` (249), `text-white/30` (214), `text-white/20` (100), `text-white/60` (47), `text-white/80` (9) |
| **Fake Headings (`text-3xl+` on div/span/p)** | **64 instances** | Sections using `<span className="text-5xl">` or `<div className="text-4xl">` instead of semantic `<h1..h4>` |

---

## 5. PROPOSED SYSTEM (Tailwind v4 `@theme` Specification)

### A. Unified Fluid Type Scale

Defined in `@theme` in `src/app/globals.css`. Uses `Tanker` for headings (`--font-family-heading`) and `Switzer` for body text (`--font-family-body`).

```css
@theme {
  /* Typography Families */
  --font-body: 'Switzer', sans-serif;
  --font-heading: 'Tanker', 'Switzer', sans-serif;

  /* Fluid Type Scale (clamp-based) */
  --font-size-display: clamp(2.75rem, 5vw + 1rem, 5.5rem);  /* 44px -> 88px */
  --font-size-h1: clamp(2.25rem, 4vw + 1rem, 4.0rem);       /* 36px -> 64px */
  --font-size-h2: clamp(1.75rem, 3vw + 0.75rem, 3.0rem);    /* 28px -> 48px */
  --font-size-h3: clamp(1.35rem, 2vw + 0.5rem, 2.25rem);    /* 21.6px -> 36px */
  --font-size-h4: clamp(1.15rem, 1.2vw + 0.5rem, 1.75rem);  /* 18.4px -> 28px */
  --font-size-h5: clamp(1.0rem, 0.8vw + 0.5rem, 1.35rem);   /* 16px -> 21.6px */
  --font-size-h6: clamp(0.95rem, 0.5vw + 0.5rem, 1.15rem);  /* 15.2px -> 18.4px */

  --font-size-body-lg: 1.125rem; /* 18px */
  --font-size-body: 1.0rem;      /* 16px (Minimum body size) */
  --font-size-small: 0.875rem;   /* 14px */
  --font-size-caption: 0.75rem;  /* 12px (Absolute minimum allowed size) */
}
```

#### Step Specification Table

| Token Step | Font Family | Size Range (Min → Max) | Font Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`display`** | Tanker | 44px → 88px | 900 | 0.95 | `-0.04em` |
| **`h1`** | Tanker | 36px → 64px | 900 | 1.05 | `-0.03em` |
| **`h2`** | Tanker | 28px → 48px | 800 | 1.15 | `-0.02em` |
| **`h3`** | Tanker | 21.6px → 36px | 700 | 1.20 | `-0.01em` |
| **`h4`** | Tanker | 18.4px → 28px | 700 | 1.25 | `0.00em` |
| **`h5` / `h6`** | Tanker | 16px → 21.6px | 600 | 1.30 | `0.00em` |
| **`body-lg`** | Switzer | 18px (static) | 500 | 1.60 | `0.00em` |
| **`body`** | Switzer | 16px (static) | 400 / 600 | 1.60 | `0.00em` |
| **`small`** | Switzer | 14px (static) | 500 | 1.50 | `0.01em` |
| **`caption`** | Switzer | 12px (static min) | 500 / 600 | 1.40 | `0.02em` |

---

### B. Standardized 4-Level Text Color System

All text colors are evaluated against the core background token (`--color-bg-base`: `#030008` / `#05030a`) to ensure strict **WCAG AA (4.5:1+) compliance**:

```css
:root {
  /* Text Color Tokens */
  --color-text-primary: #ffffff;                    /* 21.0:1 contrast (WCAG AAA) */
  --color-text-secondary: rgba(255, 255, 255, 0.78); /* 12.5:1 contrast (WCAG AAA) */
  --color-text-muted: rgba(255, 255, 255, 0.58);     /*  6.8:1 contrast (WCAG AA) */
  --color-text-disabled: rgba(255, 255, 255, 0.40);  /*  4.6:1 contrast (WCAG AA) */

  /* Brand Accent Tokens */
  --color-accent: #a855f7;                          /* Standardized Purple (5.5:1 contrast) */
  --color-accent-hover: #c084fc;                    /* Light Purple Hover (8.2:1 contrast) */
  --color-accent-soft: rgba(168, 85, 247, 0.15);    /* Soft Tint Background */

  /* Semantic Feedback Tokens */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #f43f5e;
}
```

---

### C. Direct Codebase Mapping Table

| Current Legacy Pattern / Hex | New Token / Utility Class | Semantic Role |
| :--- | :--- | :--- |
| `text-[7px]`, `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[0.55rem]`, `text-[0.65rem]` | `.text-caption` / `text-caption` | Metadata, badges, fine print (12px min) |
| `text-[11px]`, `text-[12px]`, `text-xs` | `.text-small` / `text-small` | Secondary labels, timestamps, field hints (14px) |
| `text-[13px]`, `text-[14px]`, `text-[0.85rem]`, `text-[0.9rem]`, `text-sm` | `.text-small` / `text-small` | Form inputs, card metadata, table cells (14px) |
| `text-[16px]`, `text-[1rem]`, `text-base` | `.text-body` / `text-body` | Standard body paragraphs, form labels (16px) |
| `text-[18px]`, `text-[1.08rem]`, `text-lg` | `.text-body-lg` / `text-body-lg` | Lead paragraphs, modal intro text (18px) |
| `text-xl`, `text-[22px]`, `text-2xl` | `.text-h4` / `text-h4` | Card titles, modal headers (18.4px → 28px) |
| `text-3xl`, `text-4xl` | `.text-h2` / `.text-h3` | Section sub-headings, drawer titles |
| `text-5xl`, `text-6xl`, `text-7xl` | `.text-h1` / `.text-display` | Main hero titles, landing displays |
| `text-white/40`, `text-white/30`, `text-white/35` | `text-muted` | Non-critical notes, placeholders, disabled states |
| `text-white/50`, `text-white/60`, `text-white/70`, `text-white/75` | `text-secondary` | Secondary subtitles, table headers, descriptions |
| `text-white`, `text-white/90`, `text-white/100` | `text-primary` | Primary headings, active tab labels, body white |
| `text-white/5`, `text-white/10`, `text-white/20` | `text-disabled` / border tokens | Subtle borders, disabled icons, background fills |
| `#a855f7`, `#c084fc`, `#9333ea`, `#8a1cfc`, `#d946ef`, `#c27aff`, `#851DEF` | `text-accent`, `bg-accent`, `border-accent` | Unified 7th Heaven brand purple |

---

## Next Steps

Phase 1 complete. Awaiting user approval before proceeding to **Phase 2 (Base Styles Cleanup & Utility Classes)**.
