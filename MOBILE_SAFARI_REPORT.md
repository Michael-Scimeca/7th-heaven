# 📱 Mobile Safari & iOS Optimization Report

## 1. 📋 Baseline Discovery Checklist & Observations

### Device & Platform Testing Targets
- **WebKit Mobile Engines**: Playwright WebKit (`iPhone 15` [393×852], `iPhone SE` [320×568], Desktop WebKit Safari 26.6).
- **Desktop Safari**: Safari 18+ on macOS.
- **Minimum Target**: Safari ≥ 15 (iOS 15.0+).

### Initial Baseline Findings (Smoke Test)
| Issue | Affected Routes / Components | Root Cause | Planned Fix |
| :--- | :--- | :--- | :--- |
| **Horizontal Overflow** | `/cruise`, `/book` (on 320px & 393px) | Hardcoded min-widths / fixed width containers exceeding viewport | Responsive container widths, `max-w-full`, `overflow-x-clip` |
| **Missing Safe Area Insets** | Global `viewport`, `Header`, drawers, bottom bars, modals, chat | No `viewportFit: "cover"` in `src/app/layout.tsx` + no `env(safe-area-inset-*)` padding | Add `viewportFit: "cover"` and safe area utility tokens in `globals.css` |
| **`100vh` / `h-screen` Viewport Jumps** | 16 files (Hero, overlays, modals, page wrappers) | Classic iOS Safari URL bar expand/collapse jump | Migrate heroes to `100svh`, overlays/modals to `100dvh`, page wrappers to `min-h-dvh` with `vh` fallback |
| **`100vw` / `w-screen` Scrollbar Overflow** | 11 files | `100vw` includes scrollbar width causing horizontal jitter | Replace with `w-full` or `inset-0` |
| **Broken Body Scroll Locking** | `ModalDialog`, `LoginModal`, `PagesPillDrawer`, mobile menu, lightboxes | `overflow: hidden` on body is bypassed by iOS Safari touch scrolling | Implement unified `useScrollLock` hook with `position: fixed` + `scrollY` tracking + Lenis pause |
| **Video Fullscreen Hijack & Autoplay Rejection** | `CruiseVideoGallery`, `HeroVideoPlayer`, `Header` video | Missing `playsInline`, eager `preload="auto"`, unhandled `play()` promises | Add `playsInline`, `preload="metadata"`, handle rejection (Low Power Mode) |
| **GPU Blur Stacking & Tab Memory** | 125 `backdrop-blur` instances, `HomeShaderGradient` | Stacked live blurs on mobile cause Safari memory spikes & scroll jank | Fallback to solid/semi-transparent backgrounds on mobile / coarse pointer; pause WebGL off-screen |
| **Sticky Hover & Tap Delay** | `globals.css` plain `:hover` rules, buttons/links | Touch devices trigger sticky hover; 300ms double-tap delay | Wrap `:hover` in `@media (hover: hover) and (pointer: fine)`, add `touch-action: manipulation` |
| **Input Auto-Zoom** | Form inputs < 16px (`GlowInput`, `InputField`, `FormInput`, `SearchInput`) | iOS Safari zooms on focus if `font-size < 16px` | Ensure all inputs compute to ≥ 16px font-size on mobile without disabling zoom |
| **Safari Date Parsing Bugs** | `src/lib/tour-helpers.ts`, `src/lib/date-utils.ts` | `new Date("Oct 12th")` or `new Date("2026-10-12 19:00")` returns `Invalid Date` on Safari | Unify into `parseDateSafe` with regex matching and explicit date construction |
| **Unsafe `localStorage`** | Direct `localStorage` calls across 19 files | Safari Private Mode / ITP throws `SecurityError` or `QuotaExceededError` | Wrap all access in safe `try/catch` storage helper |

---

## 2. 🛠️ Phase-by-Phase Fixes & Verification Matrix

*(Will be continuously updated after each phase commit)*
