# Complete Site-Wide UI Component Consistency Audit & System Proposal (Phase 1)
**Project**: 7th Heaven Web Application (`7th-heaven`)  
**Audit Date**: September 27, 2026  
**Status**: Pending User Approval for Phase 2 Execution  

---

## 1. Buttons Audit & Proposed `SeventhButton` Unified API

### Empirical Codebase Metrics
- **Raw `<button>` Elements**: **1,024 instances** across `src/`.
- **`<SeventhButton>` Component Calls**: **132 instances**.
- **`btn-*` CSS Classes**: **55 instances** (`btn-primary`, `btn-pill-glass`, `btn-interactive`, `btn-secondary`, `btn-ghost`, `btn-danger`).

### Current Button Visual Categories
1. **Primary Accent Button**: Deep purple background (`#9333ea` / `#a855f7`), white text, purple shadow glow.
2. **Secondary / Outline Button**: `border border-white/20 bg-white/5 hover:bg-white/10`, white text.
3. **Ghost Button**: `bg-transparent text-white/70 hover:text-white hover:bg-white/5`.
4. **Pill Glass Button (`.btn-pill-glass`)**: `rounded-full border border-white/15 bg-white/10 backdrop-blur-md`.
5. **Icon-Only Button**: Square or circular `p-2` button containing an icon.
6. **Destructive / Danger Button**: `bg-rose-600 hover:bg-rose-500 text-white`.
7. **Link Button**: Text-only button with hover underline or color shift.

### Proposed Single `<SeventhButton>` Component API

```tsx
export interface SeventhButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "link" | "pill";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  as?: "button" | "a" | typeof Link;
  href?: string;
  children?: React.ReactNode;
}
```

#### Size Specifications
- **`sm`**: Height `32px`, padding `px-3 py-1`, text `text-small` (14px).
- **`md`**: Height `40px` (Default), padding `px-5 py-2`, text `text-body` (16px).
- **`lg`**: Height `48px`, padding `px-7 py-3`, text `text-body-lg` (18px).

---

## 2. Badges, Pills & Toggles Audit

### Current Overlapping Components (**8 components**)
1. `Badge` (`src/components/ui/Badge.tsx`)
2. `PillBadgeButton` (`src/components/PillBadgeButton.tsx`)
3. `SectionBadge` (`src/components/SectionBadge.tsx`)
4. `RoleBadge` (`src/components/RoleBadge.tsx`)
5. `MemberHeaderBadge` (`src/components/MemberHeaderBadge.tsx`)
6. `CalendarBadgeIcon` (`src/components/CalendarBadgeIcon.tsx`)
7. `GradientToggle` (`src/components/GradientToggle.tsx`)
8. `SquishyToggle` (`src/components/SquishyToggle.tsx`)

### Proposed Consolidation Plan
- **`SectionBadge`**: Retained for section category headers (e.g. `UPCOMING TOUR`, `CRUISE RATES`). Uses `rounded-full`, `bg-accent/15`, `text-accent`, `text-caption`.
- **Unified `Badge` Component**: Replaces `PillBadgeButton`, `RoleBadge`, `MemberHeaderBadge`, and `CalendarBadgeIcon`.
  - Variants: `default`, `active`, `outline`, `role`, `status`.
  - Sizes: `sm` (24px height), `md` (30px height).
- **Unified `Toggle` Component**: Consolidates `GradientToggle` and `SquishyToggle` with a `variant` prop (`gradient` | `squishy` | `switch`).

---

## 3. Border Radius System

### Codebase Metric Counts
- `rounded-lg` (8px): **441 instances** (Most prevalent across cards/containers)
- `rounded-full` (9999px): **285 instances** (Pills, badges, avatars)
- `rounded-2xl` (16px): **43 instances** (Modals, drawers)
- `rounded-none` (0px): **38 instances**
- `rounded-xl` (12px): **11 instances**
- `rounded-3xl` (24px): **3 instances**
- `rounded-sm` (4px): **2 instances**

### Proposed 3-Token Radius Scale

```css
:root {
  --radius-sm: 6px;    /* Inputs, small buttons, tooltips */
  --radius-md: 12px;   /* Cards, panels, drawers, modals */
  --radius-full: 9999px; /* Pills, badges, filter chips, avatars */
}
```

---

## 4. Surface Levels, Shadows & Blur System

### Current Surface Issues
- **Backgrounds**: 14 non-standard opacity variants (`bg-white/10`, `bg-white/[0.02]`, `bg-black/30`, `bg-black/60`, `bg-black/80`, `bg-[#00000029]`).
- **Shadows**: **381 custom `shadow-[...]` definitions**.
- **Backdrop Blurs**: 6 distinct blur strength utility levels (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`).

### Proposed 3 Surface Levels

| Surface Level | Semantic Role | Background Token | Border Token | Shadow Token | Blur Token |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`surface-1`** | Page panels & background sections | `bg-black/40` | `border-white/10` | `shadow-none` | None |
| **`surface-2`** | Cards, containers, table rows | `bg-white/[0.03]` | `border-white/10` | `shadow-md` | `backdrop-blur-sm` (Desktop only) |
| **`surface-3`** | Popovers, dropdowns, modals, drawers | `bg-[#0f0f13]/90` | `border-purple-500/30` | `shadow-2xl` | `backdrop-blur-xl` (Desktop only) |

*Rule: Zero backdrop-blur applied to large surface areas on mobile viewports (< 768px) for maximum GPU rendering performance.*

---

## 5. Icon System & Sizing Scale

### Current Icon Audit
- **Inline `<svg>` Elements**: **294 instances** hardcoded in React JSX.
- **`lucide-react` Import Files**: **59 files**.
- **Icon Sizes**: Inconsistently range from `h-3` (12px) to `h-11` (44px).

### Proposed 4-Step Icon Scale & Policy
- **`xs`**: `12px` (`h-3 w-3`) — inline metadata, badge dots.
- **`sm`**: `16px` (`h-4 w-4`) — standard button icons, form input icons, table actions.
- **`md`**: `20px` (`h-5 w-5`) — section header icons, modal headers, navigation links.
- **`lg`**: `24px` (`h-6 w-6`) — hero feature cards, large CTA buttons.

*Policy: Replace all generic inline `<svg>` code with `lucide-react` icons. Retain custom inline SVGs ONLY for official band logos and custom brand graphics.*

---

## 6. Z-Index Layering Scale

### Current Issue
**37 distinct arbitrary z-index values** up to `z-[9999999]` causing overlay stacking conflicts.

### Proposed Named Z-Index Scale

```css
:root {
  --z-base: 0;       /* Standard content layers */
  --z-dropdown: 100; /* Custom dropdowns & popovers */
  --z-sticky: 200;   /* Sticky section headers / filter bars */
  --z-header: 300;   /* Top site navigation header */
  --z-drawer: 400;   /* Side drawers & slide-over panels */
  --z-modal: 500;    /* Dialogs, lightboxes & pop-ups */
  --z-toast: 600;    /* Notifications & toast alerts */
  --z-preloader: 999;/* Full-page page transition loaders */
}
```

---

## 7. Overlays & Shared Modal/Drawer/Dropdown Behavior

### Current Overlay Components
- **Modals**: `LoginModal`, `PushSubscribeModal`, `CrewSetPasswordModal`.
- **Drawers**: `MemberFactSheetDrawer`, `PagesPillDrawer`.
- **Dropdowns**: `Dropdown`, `CustomDropdown`, `GooeyDropdown`, `GooeyMessagesDropdown`.

### Shared Overlay Architecture

```
                 ┌─────────────────────────┐
                 │   BaseOverlayBehavior   │
                 └────────────┬────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
┌─────────┐              ┌──────────┐             ┌────────────┐
│  Modal  │              │  Drawer  │             │  Dropdown  │
└─────────┘              └──────────┘             └────────────┘
```

#### Shared Standards
1. **Backdrop**: `bg-black/75 backdrop-blur-md` with `fade-in` / `fade-out` 250ms animation.
2. **Keyboard Accessibility**: `Escape` key closes overlay; focus trapped inside active modal/drawer.
3. **Scroll Lock**: `document.body.style.overflow = "hidden"` while modal or drawer is active.
4. **Click-Outside**: Clicking backdrop automatically triggers `onClose()`.
5. **Close Button**: Standardized top-right `X` button using `lucide-react` (`X` icon, `p-2 hover:bg-white/10 rounded-full`).

---

## 8. Interactive Component States & Feedback

| State | Standardized Visual Treatment | Implementation Class |
| :--- | :--- | :--- |
| **Hover** | Light background tint + subtle border highlight | `hover:bg-white/10 hover:border-purple-400/40` |
| **Focus-Visible**| 2px purple focus ring with offset | `.focus-ring` (`box-shadow: 0 0 0 2px rgba(192, 132, 252, 0.5)`) |
| **Active** | 3% downscale effect | `active:scale-[0.97]` |
| **Disabled** | 40% opacity + pointer events disabled | `disabled:opacity-40 disabled:pointer-events-none` |
| **Loading** | `Loader2` rotating spinner icon | `<Loader2 className="h-4 w-4 animate-spin text-accent" />` |
| **Skeleton Loading**| Pulsing dark glass rectangle | `animate-pulse bg-white/5 rounded-lg` |
| **Error** | Red accent text & border | `text-danger border-danger/40 bg-danger/10` |
| **Success** | Emerald green accent text & border | `text-success border-success/40 bg-success/10` |

---

## 9. Motion & Transition System

### Tokens Defined in `globals.css`

```css
:root {
  --duration-fast: 150ms; /* Hover, focus, scale transitions */
  --duration-base: 250ms; /* Dropdowns, accordions, tabs */
  --duration-slow: 400ms; /* Modals, drawers, page transitions */

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Accessibility Requirement
All CSS animations and transitions automatically check `@media (prefers-reduced-motion: reduce)` to disable motion for users requiring reduced motion.

---

## 10. Content Formatting Helpers (`src/lib/formatters.ts`)

### Consolidated Formatting Utility Functions

```typescript
// Date Formatter: "October 26, 2026" or "Oct 26, 2026"
export function formatDate(date: string | Date, compact = false): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: compact ? "short" : "long",
    day: "numeric",
    year: "numeric",
  });
}

// Time Formatter: "8:00 PM"
export function formatTime(time: string | Date): string {
  if (typeof time === "string" && time.includes(":")) return time;
  const d = typeof time === "string" ? new Date(time) : time;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Price Formatter: "$2,499" (no cents if integer)
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
```

### Text Capitalization Standard
- **Headings & Buttons**: **Title Case** (`"Staterooms & Rates"`, `"Book Event"`).
- **Metadata & Input Labels**: **Sentence case** (`"Date signed"`, `"Directions for parking"`).

---

## 11. Visual Specification Mockups

### A. Buttons & Badges Specification
![Buttons & Badges Specification](file:///Users/michaelscimeca/.gemini/antigravity-ide/brain/4fe9bd48-4da3-4c6e-9134-4f599d473f6b/ui_buttons_badges_mockup_1790560343327.png)

### B. Surfaces & Overlay Architecture
![Surfaces & Overlay Architecture](file:///Users/michaelscimeca/.gemini/antigravity-ide/brain/4fe9bd48-4da3-4c6e-9134-4f599d473f6b/ui_surfaces_overlays_mockup_1790560361449.png)

### C. Component States, Icons & Motion System
![Component States, Icons & Motion System](file:///Users/michaelscimeca/.gemini/antigravity-ide/brain/4fe9bd48-4da3-4c6e-9134-4f599d473f6b/ui_states_icons_motion_mockup_1790560378258.png)

---

## Next Steps

Phase 1 complete. Awaiting user approval to proceed to **Phase 2 (Foundation & Component Standardization)**.
