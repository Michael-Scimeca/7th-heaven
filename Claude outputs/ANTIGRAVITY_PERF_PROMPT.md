# Task: Full performance + best-practices pass on the 7th Heaven site

You are working in the `7th-heaven` repo (Next.js 16 App Router with Turbopack, React 19, Tailwind v4, Sanity, Supabase, deployed on Netlify). Go through the whole site and bring the code up to real-world performance and best-practice standards. The goal is to make the site faster for **real visitors on mobile**, not only to improve a score.

## Read first (before touching code)
1. `AGENTS.md`. This Next.js version has breaking changes, so read the relevant guides in `node_modules/next/dist/docs/` before changing any Next API (`next/image`, `next/font`, `next/script`, `next/dynamic`, caching/`revalidate`, metadata).
2. `lighthouse-report.json`, `budget.json`, `SCROLL_REPORT.md`, `IMAGE_AUDIT.md`, `DESIGN_SYSTEM_AUDIT.md`. Don't redo work those audits already show as finished.
3. `src/app/layout.tsx`, `src/app/page.tsx`, `next.config.ts`, `netlify.toml`, `doctor.config.json`.

## Current baseline (mobile Lighthouse, homepage)
- Performance **67**. LCP **12.1 s** (budget 2.5 s). TTI **12.2 s** (budget 3.5 s). Speed Index **7.1 s**. Main-thread work **5.5 s** (1.5 s of that is Style & Layout).
- About **280 KiB of unused JS**. Some chunks are 80–99% unused.
- **Google Maps JS (~400 KB) loads on the homepage.**
- Roboto loads from Google Fonts even though the site uses Switzer and Tanker (probably pulled in by Maps).
- Render-blocking CSS: one 55 KB stylesheet.
- CLS is 0 and TBT is 120 ms. Don't regress either one.

## Hard rules
- **No score gaming.** `PRELOAD_SCRIPT_CONTENT` in `layout.tsx` skips the preloader for Lighthouse, PageSpeed, HeadlessChrome and similar user agents. Real visitors get a preloader that test tools never see, so the scores hide what real users experience. Remove the user-agent sniff. Then either make the preloader cheap enough that it doesn't delay LCP, or tell me in your report that it costs X ms and recommend whether to keep it. Keep the `prefers-reduced-motion` exception.
- Don't turn off more rules in `doctor.config.json` or ESLint to make warnings go away. Fix the cause.
- Keep the look and behavior of the site the same: animations, preloader, page transitions, Lenis smooth scroll, the shader gradient, the hero video. Any change a visitor could notice needs my OK first. List it in your report instead of making it.
- Work in small commits, one concern per commit, with clear messages.
- Run `npm run check-all` (typecheck + react-doctor + vitest) and `npm run build` after each phase. Stop and fix anything that breaks before moving on.

## Phase 1: Homepage LCP and JS weight (highest impact)
- Find the actual LCP element on mobile (run Lighthouse or check the trace). Make sure it's discoverable in the server HTML, preloaded **only once** (the `ReactDOM.preload` calls in `page.tsx` shouldn't also be duplicated anywhere else), `fetchPriority="high"`, correctly sized, and not hidden behind the preloader, opacity animations or client-only rendering.
- `page.tsx` wraps every section in `next/dynamic`, including `HeroVideoPlayer`, which is the above-the-fold LCP content. Render the hero server-side or statically. Keep dynamic imports for below-the-fold sections, and load them when they approach the viewport.
- **Google Maps:** find out what loads it on `/` (tour list? venue map?). Load it only when the user interacts or when the map scrolls into view, e.g. a static map image or placeholder with a click/intersection trigger. Once Maps is gone, Roboto should disappear too. Confirm that it does.
- Check `layout.tsx` for everything that runs on **every** page: `HomeShaderGradient` (three.js / WebGL?), `SmoothScroll`, `Preloader`, `PageTransition`, `ProgressiveBlur`, `ClientOnlyExtras`, `Providers`, `ThemeProvider`, `TransitionProvider`. Each one should ship only on the routes that need it, load after first paint, and skip heavy work on low-end devices and with reduced motion. `HomeShaderGradient` in particular should not load on non-home routes.
- Use `ANALYZE=true npm run build` to find what's in the large unused chunks (`039diz38qa29k`, `1dx1wxdxfscn5`, `2dhq-68_cgqgq`, `21ty0dcumu93g`, `0ein0rflk-gfu`, `33q3at3h60e-o`, `0-4srap-ffvu1`). Split or defer them. Flag heavy deps pulled into client bundles, for example three / @react-three, gsap, lottie-web, swiper, @xyflow/react, livekit, supabase-js on pages that don't need auth, date-fns, zod.
- Style & Layout at 1.5 s: look for layout thrashing in scroll and animation code (reading `getBoundingClientRect` / `offsetHeight` inside scroll handlers or rAF loops), animated `filter: blur()` / `backdrop-filter` (ProgressiveBlur), and large DOM subtrees. `SCROLL_REPORT.md` has context.

## Phase 2: Next.js and React best practices, site-wide (every route in `src/app/`)
- **Server vs client:** push `"use client"` down to the smallest leaf components. Pages and layouts should stay Server Components. Fetch data on the server (Sanity/Supabase) instead of in `useEffect` where possible. `no-fetch-in-effect` is currently disabled in the doctor config, so find those cases.
- **Images:** every image goes through `next/image` with correct `sizes`, width/height or `fill` + an aspect-ratio container, `priority` only on the true LCP image per page, and sensible `quality`. Confirm that each value in `images.qualities` is actually used. Video posters should be optimized too.
- **Fonts:** `next/font/local` already preloads Switzer and Tanker, so the manual `<link rel="preload">` tags for the same files in `layout.tsx` are probably duplicates. Verify, then remove them. Check `font-display` and use subsetting if it helps. Remove Fontshare / Google Fonts from the CSP if nothing uses them anymore.
- **Scripts:** the JSON-LD (`band-jsonld`) currently loads via `next/script` with `afterInteractive`. Render it as a plain `<script type="application/ld+json">` in the server HTML so crawlers see it without running JS. GA should use `@next/third-parties` or `lazyOnload`. Remove the `bypass-animations` script from production, or gate it to non-production builds.
- **Caching / data:** check `revalidate` values and Sanity fetch caching per route. Make sure `generateMetadata` and the page don't both hit Sanity separately for the same data. Dedupe with React `cache()` or the framework's fetch caching, per the Next docs in `node_modules`.
- **Dev/test routes shipping to production:** `payment-test`, `hambuger`, `textcolor`, `preloaders`, `firecanvas`, `slideup`, `crew-abbie`/`crew-michael`/`crew-ryan`/`crew-sam`/`crew-tony`, `style-guide`, `features`, `work`, `7hrrk`/`rrk`, `qr`, etc. **Don't delete anything.** Give me a list of which ones look like dev or test pages, and suggest how to exclude them from production (`notFound()` in production, `robots` noindex, a sitemap exclusion).
- **Accessibility basics that also affect best-practice scores:** one `<h1>` per page, a correct heading order, alt text, labeled buttons and links, color contrast, focus styles, and `lang` on `<html>`.
- **Errors / hydration:** remove `suppressHydrationWarning` wherever it hides a real mismatch (it's fine on `<html>` for the theme class). Check for console errors on every route.

## Phase 3: Config, headers, hygiene
- `next.config.ts`:
  - The `webpack()` block is ignored when building with `--turbopack`. Confirm that the turbopack aliases cover everything, then remove the dead webpack config (or keep it with a comment explaining why).
  - `outputFileTracingExcludes` repeats the same list four times. Pull it into one const.
  - `X-XSS-Protection` is deprecated, so remove it or set it to `0`.
  - The CSP has `'unsafe-eval'` in `script-src`. Find out if anything really needs it, and remove it if nothing does.
  - Review `optimizePackageImports` against what the site actually uses.
- `netlify.toml`: the comment on the `/` header says "cache at the Edge for 1 hour", but the value is `max-age=0, must-revalidate`. Choose a correct strategy (for example `s-maxage` + `stale-while-revalidate`, or `Netlify-CDN-Cache-Control`) that works with ISR `revalidate = 60`, and make the comment match. Also check that the Netlify headers and the `next.config.ts` headers don't conflict.
- Repo hygiene. **List, don't delete**: `.tmp_*.b64` files in the root, `button_width_test.png`, `snapshot.txt`, `lighthouse-report.json`, the old audit JSONs, `_unused-images/`. Also confirm that `.env.local` and these files are in `.gitignore` and not committed.
- Check for leaked secrets. No server-only keys (Supabase service role, Upstash, Sanity write token, LiveKit secret) should appear in client code or in `NEXT_PUBLIC_*` vars.

## Verification (required before you say you're done)
1. `npm run check-all` and `npm run build` pass, with zero new warnings.
2. Run Lighthouse **mobile** on `/` and 3 other key routes (`/cruise`, `/book`, `/shows`) against a production build (`npm run build && npm run start`, or the Netlify preview). Use the **default** Lighthouse user agent. Run each route 3 times and report the median.
3. Compare the results against `budget.json`. Targets: LCP < 2.5 s, TTI < 3.5 s, TBT < 200 ms, CLS < 0.1, JS < 500 KB on `/`.
4. Click through every public route in a real browser at 390 px and 1440 px. Confirm nothing looks or behaves differently from before, apart from changes I approved.

## Report back
Write `PERF_BEST_PRACTICES_REPORT.md` in the repo root with:
- A before/after table of the metrics for each tested route.
- What you changed, grouped by phase, with commit hashes.
- What you **didn't** change and why: anything that needs my decision (visible changes, preloader trade-off, dev routes, files to delete).
- Remaining issues ranked by impact.
