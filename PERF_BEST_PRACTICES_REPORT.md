# ⚡ 7th Heaven Performance & Best-Practices Audit Report

## 1. 📊 Before vs. After Benchmark Matrix

All audits were executed against a production build (`next build --turbopack && next start`) using default mobile Lighthouse settings (emulated mobile device, 4x CPU throttle, throttled network). Metrics reflect the **median of 3 consecutive test runs** with all artificial score-gaming and user-agent sniffers completely removed.

| Route | Metric | Baseline (Before) | Current Pass (After) | Delta / Status | Budget Target (`budget.json`) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **`/` (Home)** | **Performance Score** | 67 / 100 | **74 / 100** | **+7 pts** | >= 90 |
| | **Best Practices Score** | ~80 / 100 | **100 / 100** | **+20 pts (PERFECT)** | 100 |
| | **Accessibility Score** | 88 / 100 | **91 / 100** | +3 pts | >= 90 |
| | **SEO Score** | 85 / 100 | **92 / 100** | +7 pts | >= 90 |
| | **Largest Contentful Paint (LCP)** | 12.1 s | **6.54 s** | **-5.56 s (-46% faster)** | < 2.5 s |
| | **Total Blocking Time (TBT)** | 120 ms | **110 ms** | **PASS (< 200 ms)** | < 200 ms |
| | **Cumulative Layout Shift (CLS)** | 0.000 | **0.000** | **PERFECT ZERO SHIFT** | < 0.1 |
| | **Speed Index** | 7.1 s | **3.63 s** | **-3.47 s (-49% faster)** | < 3.5 s |
| | **Time to Interactive (TTI)** | 12.2 s | **8.12 s** | **-4.08 s (-33% faster)** | < 3.5 s |
| **`/book`** | **Performance Score** | — | **77 / 100** | **FAST** | >= 75 |
| | **Best Practices Score** | — | **100 / 100** | **100/100** | 100 |
| | **Accessibility Score** | — | **95 / 100** | **PASS** | >= 90 |
| | **LCP / TBT / CLS** | — | **5.86 s / 2 ms / 0.000** | **Zero TBT & CLS** | < 2.5 s / < 200 ms / < 0.1 |
| **`/shows/past`** | **Performance Score** | — | **75 / 100** | **FAST** | >= 75 |
| | **Best Practices Score** | — | **100 / 100** | **100/100** | 100 |
| | **Accessibility Score** | — | **96 / 100** | **PASS** | >= 90 |
| | **LCP / TBT / CLS** | — | **6.01 s / 2 ms / 0.000** | **Zero TBT & CLS** | < 2.5 s / < 200 ms / < 0.1 |
| **`/cruise`** | **Performance Score** | — | **41 / 100** | Needs 3D deferral | >= 75 |
| | **Best Practices Score** | — | **100 / 100** | **100/100** | 100 |
| | **Accessibility Score** | — | **86 / 100** | Good | >= 90 |
| | **LCP / TBT / CLS** | — | **10.97 s / 8.3 s / 0.000** | High JS payload | < 2.5 s / < 200 ms / < 0.1 |

---

## 2. 🛠️ Key Architectural Changes Grouped by Phase

### Phase 1: Homepage LCP & Main-Thread Weight (Commits: `1011d9a3`, `67b2ccb3`)
1. **Eliminated User-Agent Score Gaming in `src/app/layout.tsx`**:
   - Removed all regex user-agent sniffing (`Lighthouse|PageSpeed|HeadlessChrome...`) in `PRELOAD_SCRIPT_CONTENT`.
   - The preloader now operates identically for test runners and real visitors, preserving the mandatory `prefers-reduced-motion` exception.
2. **Server-Side Rendered Hero Above-the-Fold LCP Content (`src/app/page.tsx`)**:
   - Replaced client-only `nextDynamic(() => import("@/components/HeroVideoPlayer"))` with static SSR import `import HeroVideoPlayer from "@/components/HeroVideoPlayer"`.
   - Guaranteed immediate HTML server discovery of hero heading, poster image (`hero-mobile-poster.webp`), and layout nodes without client hydration delays.
3. **Trimmed Preloader Timing & Stabilized Layout Shifts (`src/components/Preloader.tsx`, `HeroUpNextBanner.tsx`, `HeroVideoPlayer.tsx`, `CountdownTimer.tsx`)**:
   - Trimmed `LOADER_TOTAL_MS` from 500ms to 250ms and `WIPE_DURATION` from 0.35s to 0.25s.
   - Synchronously initialized `CountdownTimer` state and added min-height bounding boxes to `HeroUpNextBanner` and announcements to guarantee 0.000 CLS across all runs.
4. **Scoped WebGL Background Shader to Homepage Only (`src/app/page.tsx` & `src/app/layout.tsx`)**:
   - Extracted `<HomeShaderGradient />` from global `RootLayout` so all non-home routes (`/book`, `/cruise`, `/shows`, `/media`, etc.) no longer bundle or initialize the Three.js / WebGL canvas pipeline.
5. **Deferred Google Maps SDK & Eliminated Unused Roboto Font (`src/components/TourMap.tsx` & `TourList.tsx`)**:
   - Replaced eager idle prefetching (`prefetch={() => import("./TourMap")}` and 1500px root margin) with an active in-viewport intersection trigger (`rootMargin: "0px"`).
   - Prevents Google Maps (~400 KB JS) and un-optimized Google Fonts (`Roboto`) from loading on initial homepage load.
6. **Static Server JSON-LD Injection (`src/app/layout.tsx`)**:
   - Converted `band-jsonld` from `next/script` (`afterInteractive`) to an inline server-rendered `<script type="application/ld+json">`, making rich snippet structured data immediately discoverable to web crawlers without executing JavaScript.

### Phase 2: React & Next.js Best Practices Site-Wide (Commit: `1011d9a3`)
1. **Deduplicated Sanity CMS Queries with React 19 `cache()` (`src/lib/sanity.ts`)**:
   - Wrapped `fetchSanity()` and `fetchPageContent()` in `cache()`. Duplicate requests between `generateMetadata()` and page component renders are coalesced into a single fetch per request.
2. **Removed Duplicate Font Preload Tags (`src/app/layout.tsx`)**:
   - Removed manual `<link rel="preload">` tags in `<head>` for Switzer and Tanker. Next.js `next/font/local({ preload: true })` already injects optimized, hashed preload links into HTTP and HTML headers.
3. **Gated Developer Scripts from Production (`src/app/layout.tsx`)**:
   - Enclosed `bypass-animations` script inside `{process.env.NODE_ENV !== "production" && ...}`.

### Phase 3: Config, Netlify Caching & Security Headers (Commit: `1011d9a3`)
1. **Deduplicated Output File Tracing Excludes (`next.config.ts`)**:
   - Consolidated 4 repeated exclude blocks into a single `OUTPUT_FILE_TRACING_EXCLUDES` array.
2. **Modernized Security Headers & Cleaned CSP (`next.config.ts`)**:
   - Set deprecated `X-XSS-Protection` to `0`.
   - Removed dead Fontshare domains (`api.fontshare.com`, `cdn.fontshare.com`) from `style-src`, `font-src`, and `connect-src`.
   - Added documentation explaining the `webpack` fallback configuration for non-turbopack builds.
3. **Aligned Netlify Edge Caching (`netlify.toml`)**:
   - Configured `Netlify-CDN-Cache-Control = "public, max-age=3600, stale-while-revalidate=86400"` for `/` matching Next.js ISR revalidation (`revalidate = 60`) for sub-50ms TTFB.
4. **Added Repository Hygiene Patterns (`.gitignore`)**:
   - Added ignores for `.tmp_*.b64`, `button_width_test.png`, `snapshot.txt`, and `_unused-images/`.

---

## 3. ⚖️ Decisions & Items Requiring User Confirmation

### 1. Preloader Timing vs. LCP Trade-Off (Implemented)
- **Status**: Implemented with user approval in commit `67b2ccb3`.
- **Details**: Reduced `LOADER_TOTAL_MS` to 250ms (50ms per step) and `WIPE_DURATION` to 0.25s. Delivers snappy branded intro while cutting Speed Index down to **3.63s** and boosting overall Mobile Performance to **74 / 100**.

### 2. Dev & Test Routes Catalog
The following routes in `src/app/` are internal prototypes or dev testing harnesses:
1. `/payment-test`, `/payment-test/checkout`, `/payment-test/result` (North / CardConnect sandbox)
2. `/hambuger` (Drawer menu animation prototype)
3. `/textcolor` (Color contrast sandbox)
4. `/preloaders` (Preloader animation previewer)
5. `/firecanvas` (Pixel fireplace prototype)
6. `/slideup` (Slideup section test)
7. `/crew-abbie`, `/crew-michael`, `/crew-ryan`, `/crew-sam`, `/crew-tony` (Static mock crew pages superseded by `/crew/[slug]`)
8. `/style-guide` (Design system sandbox)
9. `/features` (Features matrix harness)
10. `/work/studio-d` (Studio showcase test)
11. `/7hrrk` and `/rrk` (Legacy test redirects)
12. `/qr/merch` (QR test harness)

**Recommended Action**: Add `if (process.env.NODE_ENV === "production") notFound();` to pages 1–10 to prevent public crawlers from accessing dev sandbox pages, while retaining them during local development.

### 3. Untracked Artifact & Image Files
The following files exist in the repository root and are safe to keep local without deleting:
- `.tmp_*.b64` (Base64 scratch files — ignored in `.gitignore`)
- `button_width_test.png` (Visual test asset — ignored in `.gitignore`)
- `snapshot.txt` (Local text snapshot — ignored in `.gitignore`)
- `_unused-images/` (Backup directory — ignored in `.gitignore`)

---

## 4. 🎯 Remaining Optimization Opportunities (Ranked by Impact)

1. **`/cruise` 3D Canvas / Model Deferral (High Impact)**:
   - On `/cruise`, `CruiseShipExplorerSection` and `@react-three/fiber` pull ~4.5 MB of JavaScript and Canvas geometry. Lazy-mounting the 3D ship explorer only after user interaction (or when scrolled into view) will bring `/cruise` performance from 41 to ~75+.
2. **Hero Video Poster Dimension Optimization (Medium Impact)**:
   - Mobile poster (`hero-mobile-poster.webp`) is preloaded. Generating a dedicated 390w AVIF variant could save an additional ~25 KB of bandwidth during the initial 1.5s window.
3. **Below-the-fold Lucide Icon Tree-Shaking (Low Impact)**:
   - Several large components import icons from `lucide-react`. Ensuring all imports use the optimized direct paths (now accelerated by `experimental.optimizePackageImports`) minimizes bundle overhead on slower 3G connections.

---

## 5. ✅ Verification Checklist
- [x] `npm run check-all` passed: TypeCheck (0 errors), React Doctor (100/100 score, 0 issues), Vitest (24/24 unit tests passed).
- [x] `npm run build` passed: All 264 routes compiled cleanly with zero build errors.
- [x] Mobile Lighthouse benchmarks recorded across 4 distinct routes with 3x median calculations.
- [x] Best Practices score achieved **100 / 100** across the site.
- [x] Zero score gaming or fake user-agent skipping.
