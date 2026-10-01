# 7th Heaven Visual Hierarchy & Design Rules

This document defines the foundational design and visual hierarchy rules for the 7th Heaven web platform. Every screen must guide the visitor's eye within 3 seconds:
1. **Where am I?** (One clear page title)
2. **What's the most important thing here?** (One focal point)
3. **What should I do next?** (One primary action)

---

## 1. One Focal Point Per Screen
- Every viewport-height section has **one** dominant element: the largest, brightest, or highest-contrast element. Everything else steps down in visual weight.
- **The Squint Test**: When a viewport is blurred (e.g. `filter: blur(8px)`), the primary focal point must remain immediately recognizable. If two or more elements compete equally, demote all secondary elements.

---

## 2. Contrast Levels (Max 2 Tools Per Step)
Hierarchy transitions must use **at most 2 styling tools** per step (choosing from: size, weight, color/brightness, space, and position) — never all five at once.

| Level | Role / Element | Styling & Appearance |
| :--- | :--- | :--- |
| **Level 1** | Page Title / Hero Statement | Tag-sized `<h1>` (via heading scale), pure white (`#ffffff`) |
| **Level 2** | Section Titles | Tag-sized `<h2>` (via heading scale), pure white (`#ffffff`) |
| **Level 3** | Item Titles (Show, Member, Product) | Tag-sized `<h3>` / `<h4>`, white (`#ffffff`) |
| **Level 4** | Body / Descriptions | Secondary text gray (`--color-text-secondary: rgba(255, 255, 255, 0.72)`), normal weight |
| **Level 5** | Meta (Dates, Categories, Captions) | Muted text gray (`--color-text-muted: rgba(255, 255, 255, 0.55)`), smaller size |
| **Action** | Links, Buttons, Prices, Contact Info | Warm gold action accent (`--color-action: #f5b942`) or primary button styling |

### Core Principles
- **Brightness is the primary lever on a dark theme**: Pure white text is reserved exclusively for headings and critical titles. Body text at full white flattens hierarchy and creates eye fatigue.
- **Brand text vs. Copy**: Purple text is reserved for brand moments and subtle ambient accents. For readable purple text, use only high-contrast lavender (`#c084fc`, ≥ 7:1 contrast on dark backgrounds). Never use saturated dark purples for body or meta copy.

---

## 3. Button Hierarchy (Exactly Three Kinds Site-Wide)
Every interactive screen must adhere strictly to the 3-tier button taxonomy:

1. **Primary Button (`variant="primary"`)**:
   - **Limit**: Maximum **one** primary button per viewport/screen.
   - **Look**: Filled high-contrast styling (e.g., gold action background or solid high-contrast pill with bold text).
   - **Usage**: The single most important conversion step on the page ("Get Tickets", "Book Us", "Reserve Cabin").
2. **Secondary Button (`variant="secondary"`)**:
   - **Look**: Glass / outline / tinted soft surface (`border border-white/15 bg-white/5 hover:bg-white/10 text-white`).
   - **Usage**: Supporting actions alongside a primary CTA (e.g., "View Setlist", "Learn More").
3. **Tertiary Button (`variant="tertiary"`)**:
   - **Look**: Ghost / text link with underline or subtle hover cue (`text-action hover:text-action-hover underline-offset-4`).
   - **Usage**: Low-priority secondary routes, filters, inline navigational triggers.

*Rule: Never place two filled primary buttons side by side in the same component or section.*

---

## 4. Space as Hierarchy (Gestalt Proximity)
- **Grouping Rule**: The spacing between distinct groups must be **at least 2×** the spacing inside a group:
  $$\text{Space between groups} \ge 2 \times \text{Space within group}$$
- **8px Spacing Grid**: All layouts strictly use spacing tokens (4, 8, 12, 16, 24, 32, 48, 64, 96, 128px) and `title-group` spacing utilities.
- **Parent Gap Ownership**: Sibling spacing is owned exclusively by the parent container (`gap-*` or `<Stack>`). Components do not carry external margins (except `mx-auto` / `mt-auto`).

---

## 5. Alignment & Reading Paths
- **One Left Edge Per Section**: Text-heavy sections must maintain a strict, unified left-aligned vertical reading axis. Center alignment is restricted to short hero punchlines and standalone callouts.
- **Reading Patterns**:
  - **F-Pattern (Content-Heavy Pages)**: Applied to FAQ, News, Shows, Legal, and Press. Strong left anchor, prominent headings, scannable keywords first.
  - **Z-Pattern (Landing & Hero Pages)**: Applied to Home, Cruise Hero, and Booking headers. Logo/navigation top left $\rightarrow$ status top right $\rightarrow$ central hero statement $\rightarrow$ primary CTA bottom right.
- **Line Length Constriction**: Body text must never stretch across full desktop screens. Constrain paragraphs to 45–75 characters using `max-w-[65ch]` or structured multi-column grids.

---

## 6. Imagery Leads the Eye
- **Subject Gaze & Posture**: Cutouts and photos of band members/people must direct gaze and posture inward toward the page content, never outward off-screen.
- **Text Legibility Over Media**: Any text layered over video or imagery must be backed by a dedicated gradient scrim (`linear-gradient` / dark tint overlay) rather than relying on text shadows or font weight.
- **Single Focal Image**: Each viewport section should feature at most one dominant hero image or focal canvas.

---

## 7. Color Discipline (60 / 30 / 10 Architecture)
- **60% Base**: Deep near-black canvas (`--color-bg-base: #05030a`).
- **30% Atmosphere**: Signature brand purple (`--color-accent: #a855f7`, gradient shaders, ambient glass borders).
- **10% Action**: Warm gold accent (`--color-action: #f5b942`, `--color-action-hover: #ffd27a`), reserved strictly for actionable triggers, active tickets, and live indicators.
- **Functional Colors Only**: Emerald, rose, and amber are reserved strictly for system feedback states (success, error, warning). Decorative multi-color rainbow pills are prohibited.
- **Glow Constraint**: Maximum **one glow effect** per viewport. Glows represent visual focal anchors; multiple simultaneous glows destroy contrast.

---

## 8. Intentional Motion
- **Hero Entrance**: Exactly one orchestrated entry moment per page route. Sections lower on the page should render immediately or use subtle, low-latency reveals rather than obstructive multi-second slide delays.
- **Action-Driven Feedback**: Motion is used to communicate state transitions (hover states, modal open/close, cart confirmations, accordion expansion).
- **Accessibility**: Full compliance with `prefers-reduced-motion` across all GSAP, Framer Motion, and CSS transitions.

---

## 9. Avoid Template Tells
- **Meaningful Eyebrows Only**: Section badges/eyebrows are used only when conveying dynamic data (e.g. tour city, show date, live status). Remove generic, redundant eyebrow tags.
- **Sequential Numbering**: `01 / 02 / 03` numbering is reserved strictly for real sequential steps (e.g. booking flows, checkout steps, itinerary days).
- **Content-Specific Cards**: Differentiate visual card surfaces based on domain entity (shows have date-pill anchors, products highlight merchandise photography, band bios emphasize portrait hierarchy).
- **Intentional Decorators**: Avoid overuse of arrows (`→`), bullet dots, and arbitrary single-word gradient text highlights.

---

## 10. Accessibility as Hierarchy
- **Contrast Thresholds**:
  - Body & interactive text: $\ge 4.5:1$ on actual background (measured against animated gradient peaks).
  - Large titles & section headings: $\ge 3.0:1$.
- **Focus Rings**: Universal visible focus indicator (`--color-action-ring: rgba(245, 185, 66, 0.45)`) on all keyboard-navigable elements.
- **Touch Targets**: Minimum 44×44px hit areas on all mobile controls.
- **Semantic Structure**: Exactly one `<h1>` per page, strictly adhering to sequential heading levels (`<h1>` $\rightarrow$ `<h2>` $\rightarrow$ `<h3>`).
