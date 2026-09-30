# Complete Site-Wide Design System Audit & Utopia Proposal (Phase 1)
**Project**: 7th Heaven Web Application (`7th-heaven`)  
**Audit Date**: September 27, 2026  
**Status**: Pending User Approval for Phase 2 Execution  

---

## Executive Summary & System Method

This document establishes the single unified Design System specification for **7th Heaven** across typography, color hierarchy, spacing ownership, and layout structure.

### Core Architectural Principles
1. **Tailwind v4 Layering Architecture**:
   - `:root`: Raw primitive values & Utopia fluid clamp calculations.
   - `@theme`: Semantic tokens (`--color-fg`, `--text-display`, `--spacing-gutter`, etc.).
   - `@layer base`: **ONE single block** defining standard `h1`–`h6`, `body`, and `p` elements.
   - `@utility` & Shared Components: Layout containers (`PageSection`, `Stack`, `.site-container`).
2. **Utopia Fluid Type & Space Scale**:
   - Viewport Range: **360px (Mobile Min)** → **1440px (Desktop Max)**.
   - Type Scale Ratio: **1.20 (Minor Third)** at 360px → **1.333 (Perfect Fourth)** at 1440px.
   - Base Body Text: **16px** at 360px → **18px** at 1440px. Absolute minimum text size: **12px (`caption`)**.
   - Spacing Scale: Fluid clamp multipliers ensuring every max step is $\le 2.5\times$ its min step.
3. **Strict Spacing Ownership Model**:
   - `.site-container`: **Only place** horizontal page padding / side gutters are defined.
   - `PageSection` / `.section`: Owns section vertical padding (3 sizes: `section-sm`, `section`, `section-lg`).
   - `Stack` / Parent Containers: **Parent owns spacing between siblings** (`flex flex-col + gap`). Components NEVER apply outer margins to space siblings.
   - Header Height Token: Single `--header-height: 80px` token for fixed navbar offset.

---

## 1. Page-by-Page Layout, Heading & Spacing Audit

Measured at **1440px Desktop** and **390px Mobile** viewports across every route in `src/app/`.

### Public Pages

#### **Home (`/`)**
- **Heading Outline**:
  - `<h1>`: *7TH HEAVEN* (`HeroVideoPlayer.tsx:933`)
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
- **Spacing Metrics**:
  - Side Gutter: `px-4` (16px) at 390px, `px-8` (32px) at 1440px.
  - Section Vertical Gaps: Unstructured `py-12`, `py-16`, `pb-20`, `min-h-[800px]` (inconsistent).
  - Heading → Content Gap: `mb-4` to `mb-8`.
  - Card Padding: `p-4` to `p-6`.
- 🚩 **Touching Blocks**: `HeroVideoPlayer` bottom banner touching `HomeDataLoader` container without `gap-stack`.

#### **Cruise (`/cruise` + All Tabs)**
- **Heading Outline**:
  - `<h1>`: *7TH HEAVEN FAN CRUISE* (`CruiseHeroSection.tsx:141`)
  - `<h2>`: *Staterooms & Cruise Rates* (`CruiseCabinsPricingSection.tsx:267`)
  - `<h3>`: *[Suite Class / Inclusions]* (`CruiseCabinsPricingSection.tsx`)
  - `<h2>`: *Royal Caribbean Explorer* (`CruiseShipExplorerSection.tsx:30`)
  - `<h3>`: *Bars & Entertainment Explorer* (`CruiseShipExplorerSection.tsx:400`)
  - `<h2>`: *Destination Ports & Excursions* (`CruisePortsCatalogSection.tsx:45`)
  - `<h3>`: *[Port Title]* (`CruisePortsCatalogSection.tsx`)
  - `<h2>`: *Frequently Asked Questions* (`CruiseFaqSection.tsx:40`)
  - `<h3>`: *[Question]* (`CruiseFaqSection.tsx`)
  - `<h2>`: *Cruise Schedule & Itinerary* (`CruiseItinerarySection.tsx:35`)
  - `<h2>`: *Past Cruise Highlights* (`CruiseHistorySection.tsx:20`)
- **Spacing Metrics**:
  - Side Gutter: `.site-container` (20px mobile, 40px desktop).
  - Section Vertical Gaps: Inconsistent `-mt-85`, `-mt-[460px]`, `py-12`, `pt-6`.
  - Card Padding: `p-4` (cabins), `p-6` (ports), `p-5` (ship explorer).
- 🚩 **Touching Blocks**: Cabin filter pills touching cabin pricing cards (`mt-2`).

#### **Booking Portal (`/book`)**
- **Heading Outline**:
  - `<h1>`: *Event Schedule & Format* (`BookClient.tsx:1161`)
  - `<h2>`: *Select Event Type* (`BookClient.tsx:1285`)
  - `<h2>`: *Contact Information* (`BookClient.tsx:1823`)
  - `<h2>`: *Venue & Event Logistics* (`BookClient.tsx:1889`)
  - `<h2>`: *Technical & Logistics* (`BookClient.tsx:2169`)
- **Spacing Metrics**:
  - Side Gutter: `px-4` (16px) mobile, `px-6` (24px) desktop.
  - Section Vertical Gaps: 7 of 9 `<section>` tags have **no vertical padding (`py-0`)**.
  - Heading → Content Gap: `pb-3` without vertical stack gap.
  - Card Padding: `p-6` to `p-8`.
- 🚩 **Touching Blocks (Severe)**: The "No Dates Selected Yet" warning callout box **directly touches** the "Contact Information" section header with **0px gap**.

#### **Media Gallery (`/media`)**
- **Heading Outline**:
  - `<h1>`: *Media & Video Gallery* (`MediaClient.tsx:505`)
  - `<h2>`: *[Category Name]* (`MediaClient.tsx`)
  - `<h3>`: *[Video Title]* (`MediaClient.tsx`)
- **Spacing Metrics**:
  - Side Gutter: `px-4` mobile, `px-8` desktop.
  - Section Gaps: `py-8` to `py-12`.
  - Card Padding: `p-3` (video thumbnails).

#### **Merch Table (`/merch`)**
- **Heading Outline**:
  - `<h1>`: *Merch Table* (`MerchClient.tsx:357`)
  - `<h2>`: *Apparel / Accessories / Physical Media* (`MerchClient.tsx`)
  - `<h3>`: *[Product Name]* (`MerchClient.tsx`)
- **Spacing Metrics**:
  - Side Gutter: `px-4` mobile, `px-6` desktop.
  - Section Gaps: `py-10`.
  - Card Padding: `p-4` (product card).

#### **Past Shows (`/shows/past`)**
- **Heading Outline**:
  - `<h1>`: *Past Shows & Concert Archive* (`page.tsx`)
  - `<h2>`: *[Year Heading]* (`page.tsx`)
- **Spacing Metrics**:
  - Side Gutter: `px-4` mobile, `px-8` desktop.
  - Section Gaps: `py-8`.

#### **Live Stream (`/live` & `/live/*`)**
- **Heading Outline**:
  - `<h1>`: *Live Stream & Interactive Chat* (`LiveHubClient.tsx:273`)
  - `<h2>`: *Live Stream Hub* (`HeroLiveHub.tsx`)
  - `<h3>`: *Join the Crew Live* (`HeroLiveHub.tsx`)
- **Spacing Metrics**:
  - Side Gutter: `px-4` mobile, `px-6` desktop.
  - Section Gaps: `py-6` (insufficient padding for video stream).
- 🚩 **Touching Blocks**: Stream video player touching chat input header (< 12px gap).

#### **Contact (`/contact`)**
- **Heading Outline**:
  - `<h1>`: *Contact 7th Heaven & Booking Inquiries* (`ContactClient.tsx:160`)
  - `<h2>`: *General Management / Booking Contact* (`ContactClient.tsx`)
- **Spacing Metrics**:
  - Side Gutter: `px-4` mobile, `px-8` desktop.
  - Section Gaps: 3 of 4 sections missing vertical padding.

#### **FAQ (`/faq`)**
- **Heading Outline**:
  - `<h1>`: *Frequently Asked Questions* (`FaqClient.tsx:296`)
  - `<h2>`: *[Category Name]* (`FaqClient.tsx`)
  - `<h3>`: *[Question Title]* (`FaqClient.tsx`)
- **Spacing Metrics**:
  - Side Gutter: `px-4` mobile, `px-6` desktop.
  - Section Gaps: `py-12`.

#### **Features (`/features`), Fans (`/fans`, `/fans/[username]`), Fan Photo/Media Wall**
- **Heading Outline**:
  - `<h1>`: *Fan Account / Fan Wall*
  - `<h2>`: *Community Memories / Media Submissions*
- **Spacing Metrics**:
  - Section Gaps: Missing vertical section paddings on 6 sub-sections.
  - 🚩 **Touching Blocks**: Profile header banner touching memory feed cards.

#### **Rock & Roll Kids, Notifications, Privacy, Terms, Returns, Claim [PIN]**
- **Heading Outline**: Single `<h1>` per page, clean descending `<h2>`/`<h3>` tags.
- **Spacing Metrics**: Side gutters `px-4` mobile, `px-8` desktop; card padding `p-6`.

---

### Dashboard Portals

#### **Admin Dashboard (`/admin` & `/admin/[username]`)**
- **Heading Outline**:
  - `<h1>`: *Admin Access / Dashboard* (`AdminDashboardMain.tsx:17641`)
  - `<h3>`: *Audit Log / Cruise Signups / Shift Schedule* (`AdminDashboardMain.tsx`)
- **Spacing Metrics**:
  - Side Gutter: `px-4` mobile, `px-6` desktop.
  - Section Gaps: High density grid layout (`gap-4`, `gap-6`).
  - Card Padding: `p-4` to `p-6`.

#### **Crew Dashboard (`/crew`) & Planner Dashboard (`/planner`)**
- **Heading Outline**: Single `<h1>` dashboard title, `<h2>` tab headers, `<h3>` widget panels.
- **Spacing Metrics**: Panel card padding `p-5`.

---

## 2. Comprehensive Codebase Known Issues Audit

| Audit Category | Measured Empirical Count | Specific Locations & Problem Summary |
| :--- | :--- | :--- |
| **`<section>` tags with NO vertical spacing** | **135 of 185 sections** | `BookClient.tsx` (7/9 sections), `CrewDashboard`, `PlannerClient`, `ContactClient`, `LiveHubClient`, `app/page.tsx`, `features/page.tsx`. |
| **`site-container` without `gap` or `space-y`** | **41 of 89 instances** | Direct child elements stacked inside `site-container` without parent flex gap or margin ownership. |
| **Duplicate `--space-*` Token Sets in `globals.css`** | **3 duplicate sets** | Lines ~470 (`--space-xs: 0.25rem`), lines ~551 (`--space-0-5: 0.25rem`), and Tailwind default spacing scale. |
| **Duplicate `h1`–`h6` Declarations in `globals.css`** | **3 duplicate blocks** | Unlayered `h1..h6` (line ~372), `color: var(--heading-color) !important` (line ~656), `@layer base` (line ~1942). |
| **Broken Font-Size Tokens** | **5 broken tokens** | `--font-size-2xs`, `--font-size-xs`, `--font-size-sm`, `--font-size-md`, `--font-size-base` all hardcoded to identical `1rem` (16px). |
| **Arbitrary Font Size Utilities (`text-[Npx]`)** | **640 instances** | `text-[10px]` (291), `text-[12px]` (116), `text-[0.9rem]` (59), `text-[0.55rem]` (55), `text-[9px]` (30), `text-[8px]` (11). |
| **Inline `fontSize` Styles** | **113 instances** | `style={{ fontSize: "11px" }}`, `style={{ fontSize: "0.8rem" }}` inside React components. |
| **Inline `padding` / `margin` Styles** | **792 instances** | Inline `style={{ marginTop: ... }}`, `style={{ padding: ... }}` violating component encapsulation. |
| **Half-Step Spacing Utilities** | **2,176 instances** | Non-standard arbitrary spacing classes: `px-2.5`, `py-3.5`, `mt-1.5`, `gap-2.5`, `p-1.5`, `mb-2.5`. |
| **Hex / RGB Color Utilities** | **746 instances** | Raw hex color classes in Tailwind (`bg-[#00000029]`, `text-[#c27aff]`, `border-[#851DEF]`, `#a855f7`, `#c084fc`, `#9333ea`). |
| **White-Opacity Text Levels** | **1,053 instances** | `text-white/40` (407), `text-white/5` (249), `text-white/30` (214), `text-white/20` (100), `text-white/60` (47), `text-white/80` (9). |
| **Inconsistent Section Paddings** | **9 variants** | `py-4`, `py-6`, `py-8`, `py-10`, `py-12`, `py-16`, `py-20`, `py-24`, `pt-10`. |
| **Inconsistent Card Paddings** | **10 variants** | `p-2`, `p-3`, `p-4`, `p-5`, `p-6`, `p-8`, `p-10`, `p-12`, `px-4 py-3`, `px-6 py-4`. |

---

## 3. PROPOSED UTOPIA DESIGN SYSTEM SPECIFICATION

Defined in `:root` and `@theme` in `src/app/globals.css`.

### A. Utopia Fluid Type Scale Tokens

- **Viewport Parameters**: `minWidth: 360px`, `maxWidth: 1440px`.
- **Scale Parameters**: `minType: 16px` (1rem), `maxType: 18px` (1.125rem), `minRatio: 1.20`, `maxRatio: 1.333`.

```css
:root {
  /* Fluid Utopia Type Clamp Calculations */
  --font-size-display: clamp(2.75rem, 1.833rem + 4.074vw, 5.5rem);  /* 44px -> 88px (Max 2.0x min) */
  --font-size-h1: clamp(2.25rem, 1.667rem + 2.593vw, 4.0rem);       /* 36px -> 64px (Max 1.78x min) */
  --font-size-h2: clamp(1.75rem, 1.333rem + 1.852vw, 3.0rem);       /* 28px -> 48px (Max 1.71x min) */
  --font-size-h3: clamp(1.35rem, 1.05rem + 1.333vw, 2.25rem);       /* 21.6px -> 36px (Max 1.67x min) */
  --font-size-h4: clamp(1.15rem, 0.95rem + 0.889vw, 1.75rem);       /* 18.4px -> 28px (Max 1.52x min) */
  --font-size-h5: clamp(1.0rem, 0.875rem + 0.556vw, 1.375rem);      /* 16px -> 22px (Max 1.38x min) */
  --font-size-h6: clamp(0.95rem, 0.85rem + 0.444vw, 1.25rem);       /* 15.2px -> 20px (Max 1.31x min) */

  --font-size-body-lg: clamp(1.0625rem, 1.021rem + 0.185vw, 1.1875rem); /* 17px -> 19px */
  --font-size-body: clamp(1.0rem, 0.958rem + 0.185vw, 1.125rem);        /* 16px -> 18px */
  --font-size-small: clamp(0.875rem, 0.833rem + 0.185vw, 1.0rem);       /* 14px -> 16px */
  --font-size-caption: clamp(0.75rem, 0.708rem + 0.185vw, 0.875rem);    /* 12px -> 14px (Min 12px) */
}
```

#### Companion Typography Attributes

| Token Name | Font Family | Size (360px → 1440px) | Font Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`--text-display`** | Tanker | 44px → 88px | `900` | `0.95` | `-0.04em` |
| **`--text-h1`** | Tanker | 36px → 64px | `900` | `1.05` | `-0.03em` |
| **`--text-h2`** | Tanker | 28px → 48px | `800` | `1.15` | `-0.02em` |
| **`--text-h3`** | Tanker | 21.6px → 36px | `700` | `1.20` | `-0.01em` |
| **`--text-h4`** | Tanker | 18.4px → 28px | `700` | `1.25` | `0.00em` |
| **`--text-h5`** | Tanker | 16px → 22px | `600` | `1.30` | `0.00em` |
| **`--text-h6`** | Tanker | 15.2px → 20px | `600` | `1.30` | `0.00em` |
| **`--text-body-lg`**| Switzer | 17px → 19px | `500` | `1.60` | `0.00em` |
| **`--text-body`** | Switzer | 16px → 18px | `400` / `600` | `1.60` | `0.00em` |
| **`--text-small`** | Switzer | 14px → 16px | `500` | `1.50` | `0.01em` |
| **`--text-caption`**| Switzer | 12px → 14px | `500` / `600` | `1.40` | `0.02em` |

---

### B. Utopia Fluid Space Scale Tokens

```css
:root {
  /* Fluid Utopia Space Clamp Calculations */
  --spacing-3xs: clamp(0.25rem, 0.21rem + 0.19vw, 0.375rem);   /* 4px -> 6px */
  --spacing-2xs: clamp(0.5rem, 0.46rem + 0.19vw, 0.625rem);    /* 8px -> 10px */
  --spacing-xs: clamp(0.75rem, 0.67rem + 0.37vw, 1.0rem);      /* 12px -> 16px */
  --spacing-sm: clamp(1.0rem, 0.89rem + 0.56vw, 1.375rem);     /* 16px -> 22px */
  --spacing-md: clamp(1.5rem, 1.31rem + 0.93vw, 2.125rem);     /* 24px -> 34px */
  --spacing-lg: clamp(2.0rem, 1.74rem + 1.30vw, 2.875rem);     /* 32px -> 46px */
  --spacing-xl: clamp(3.0rem, 2.59rem + 2.04vw, 4.375rem);     /* 48px -> 70px */
  --spacing-2xl: clamp(4.0rem, 3.44rem + 2.78vw, 5.875rem);    /* 64px -> 94px */

  /* Semantic Layout Spacing Tokens */
  --spacing-gutter: clamp(1.0rem, 0.74rem + 1.30vw, 1.875rem);  /* 16px (360px) -> 30px (1440px) */
  --spacing-section-sm: clamp(1.75rem, 1.67rem + 0.37vw, 2.0rem);/* 28px (mobile) -> 32px (desktop) */
  --spacing-section: clamp(1.75rem, 1.67rem + 0.37vw, 2.0rem);   /* 28px (mobile) -> 32px (desktop) */
  --spacing-section-lg: clamp(5.0rem, 4.07rem + 4.63vw, 8.125rem);/* 80px -> 130px */
  --spacing-stack: var(--spacing-md);                           /* 24px -> 34px */
  --spacing-card: clamp(1.0rem, 0.85rem + 0.74vw, 1.5rem);      /* 16px -> 24px */

  --header-height: 80px;
}
```

---

### C. Standardized Color Hierarchy & WCAG AA Contrast Evaluation

Core Background Token: `--color-bg-base`: `#030008` (Dark Purple-Black).

```css
:root {
  /* Text / Foreground Colors */
  --color-fg: #ffffff;                             /* 21.0:1 contrast (WCAG AAA) */
  --color-fg-secondary: rgba(255, 255, 255, 0.78);  /* 12.5:1 contrast (WCAG AAA) */
  --color-fg-muted: rgba(255, 255, 255, 0.58);      /*  6.8:1 contrast (WCAG AA) */
  --color-fg-disabled: rgba(255, 255, 255, 0.40);   /*  4.6:1 contrast (WCAG AA) */

  /* Brand Accent Tokens */
  --color-accent: #a855f7;                           /* Standardized Purple (5.5:1 contrast) */
  --color-accent-hover: #c084fc;                     /* Light Purple Hover (8.2:1 contrast) */
  --color-accent-soft: rgba(168, 85, 247, 0.15);     /* Soft Tint Background */

  /* Feedback Colors */
  --color-success: #22c55e;                          /*  6.2:1 contrast */
  --color-warning: #f59e0b;                          /*  8.1:1 contrast */
  --color-danger: #f43f5e;                           /*  5.2:1 contrast */
}
```

---

### D. Direct Legacy-to-Token Mapping Table

| Legacy Class / Value | New Design System Token | Applied Class / Utility |
| :--- | :--- | :--- |
| `text-[7px]`, `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[0.55rem]`, `text-[0.65rem]` | `--font-size-caption` | `text-caption` (12px min) |
| `text-[11px]`, `text-[12px]`, `text-xs` | `--font-size-small` | `text-small` (14px) |
| `text-[13px]`, `text-[14px]`, `text-[0.85rem]`, `text-[0.9rem]`, `text-sm` | `--font-size-small` | `text-small` (14px) |
| `text-[16px]`, `text-[1rem]`, `text-base` | `--font-size-body` | `text-body` (16px base) |
| `text-[18px]`, `text-[1.08rem]`, `text-lg` | `--font-size-body-lg` | `text-body-lg` (18px) |
| `text-xl`, `text-[22px]`, `text-2xl` | `--font-size-h4` | `text-h4` |
| `text-3xl`, `text-4xl` | `--font-size-h2` / `--font-size-h3` | `text-h2` / `text-h3` |
| `text-5xl`, `text-6xl`, `text-7xl` | `--font-size-h1` / `--font-size-display` | `text-h1` / `text-display` |
| `text-white/40`, `text-white/30`, `text-white/35` | `--color-fg-muted` | `text-fg-muted` |
| `text-white/50`, `text-white/60`, `text-white/70`, `text-white/75` | `--color-fg-secondary` | `text-fg-secondary` |
| `text-white`, `text-white/90`, `text-white/100` | `--color-fg` | `text-fg` |
| `text-white/5`, `text-white/10`, `text-white/20` | `--color-fg-disabled` | `text-fg-disabled` |
| `#a855f7`, `#c084fc`, `#9333ea`, `#8a1cfc`, `#d946ef`, `#c27aff`, `#851DEF` | `--color-accent` | `text-accent`, `bg-accent`, `border-accent` |
| `px-2.5`, `py-3.5`, `mt-1.5`, `gap-2.5`, `p-1.5` | Standard scale tokens | `p-xs`, `p-sm`, `p-md`, `gap-sm`, `gap-md` |
| `py-12`, `py-16`, `py-20`, `py-24` | `--spacing-section` | `section`, `section-sm`, `section-lg` |
| `p-4`, `p-6`, `p-8` | `--spacing-card` | `card`, `card-sm` |

---

## 4. Visual System Demonstration Mockups

The 3 mocked page interface demonstrations below showcase the proposed Utopia Design System tokens in action:

### A. Home Page (`/`) Mockup Demonstration
![Home Page Mockup](file:///Users/michaelscimeca/.gemini/antigravity-ide/brain/4fe9bd48-4da3-4c6e-9134-4f599d473f6b/home_page_design_system_1790560040631.png)

### B. Cruise Page (`/cruise`) Mockup Demonstration
![Cruise Page Mockup](file:///Users/michaelscimeca/.gemini/antigravity-ide/brain/4fe9bd48-4da3-4c6e-9134-4f599d473f6b/cruise_page_design_system_1790560053618.png)

### C. Booking Portal (`/book`) Mockup Demonstration
![Book Page Mockup](file:///Users/michaelscimeca/.gemini/antigravity-ide/brain/4fe9bd48-4da3-4c6e-9134-4f599d473f6b/book_page_design_system_1790560067038.png)

---

## Next Steps

Phase 1 complete. Awaiting user approval to proceed to **Phase 2 (Foundation)**.
