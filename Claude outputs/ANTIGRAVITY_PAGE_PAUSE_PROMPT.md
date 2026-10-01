# Task: Remove the pauses when clicking between pages

Repo: `7th-heaven` (Next.js 16, Sanity, Supabase, Netlify). Read `AGENTS.md` first, and the Next.js caching docs in `node_modules/next/dist/docs/`. If any `*_REPORT.md` files exist from earlier tasks, read them and don't undo their changes.

**Symptom:** when clicking between pages, some navigations sit on the curtain for a long time (~2.5 s or more) before the new page appears. Every navigation also has a smaller built-in delay.

## Cause 1: the curtain waits 2.5 s whenever the page ends up at a different URL than the link (the long pauses)
`src/components/PageTransition.tsx`, effect "2. Start the synchronized wipe animation…" (~line 618):
```ts
const targetPath = pathOf(pendingHref);
const isNewPageLoaded = pathname === targetPath || pathOf(pathname) === targetPath;
…
} else {
  fallbackTimer = setTimeout(() => { waitForNewPageContent(...).then(startAnimation) }, 2500);
}
```
If the destination **redirects** (server `redirect()`, a `next.config` redirect, or a client `router.replace`), `pathname` never equals the link's path. The curtain then only opens after the **2.5 s fallback** (and the watchdog is exitSpeed-based + 5 s). Confirmed example: the avatar/Fans link goes to `/fans`, which ends at `/fans/me`. Other likely examples: `/crew`, `/planner`, `/admin`, `/tour` → `/#tour`, trailing-slash differences, and any link whose `href` differs in case or has a query string.

**Fix:**
- Record the pathname at the moment the transition starts (`originPath`). Treat the new page as loaded when `pathname !== originPath` (any route change), **not** only when it equals the link's path. Keep the "same page" guard in `TransitionLink`.
- Also treat a navigation as finished when Next reports it's done even if the path is identical (e.g. only the search params changed). `useSearchParams` in the dependency list is enough.
- Lower the fallback from 2500 ms to ~800 ms, and log a `console.warn` in development when the fallback fires, with the link href and final pathname, so new mismatches show up.
- Audit every internal link: list the ones whose href redirects somewhere else, and point them straight at the final URL (e.g. link to `/fans/me` instead of `/fans`) where that's safe.

## Cause 2: every page is rendered from scratch on every click (the delay on every page)
Measured on the live site (Chrome, warm, signed in): **every public page** responds with `cache-control` no-store / private and a CDN **MISS**, taking **~400–850 ms** server time per navigation. `/`, `/cruise`, `/book`, `/media`, `/merch`, `/contact`, `/faq`, `/live`, `/fan-media-wall`, `/rock-and-roll-kids`, `/shows/past`, `/privacy`, `/terms` and `/returns` all do it, even though the pages set `export const revalidate = 60`. The curtain stays closed for that whole time. A Netlify cold start makes it much longer.

Main reason: `fetchPageContent()` in `src/lib/sanity.ts` (~line 300) fetches **uncached, from the non-CDN write client**:
```ts
const clientToUse = process.env.SANITY_API_TOKEN ? sanityWriteClient : sanityClient;
clientToUse.fetch(query, params, { cache: "no-store", next: { revalidate: 0 } })
```
`no-store` / `revalidate: 0` opts **the whole route** out of caching, so every visitor, on every page, waits for a live Sanity API round trip. (`/fan-media-wall` does two in a row.) There's also a 3 s timeout race, so a slow Sanity response can hold the page for up to 3 s.

**Fix:**
- Published content: use the **CDN client** (`useCdn: true`, no token) with `next: { revalidate: 60, tags: ["sanity", `page:${pageKey}`] }`. Drafts / preview: only when `draftMode()` is enabled, use the token client with `no-store`. Pass the draft flag in from the caller rather than reading `draftMode()` inside the shared cached function.
- Add **on-demand revalidation** so edits in Sanity still appear right away: a `POST /api/revalidate` route, protected with a secret and verified with Sanity's webhook signature, that calls `revalidateTag("page:<key>")` / `revalidateTag("sanity")`. Document the webhook setup in the report (URL, secret env var, which document types).
- Check the other server data fetches used by public pages for the same `no-store` (`getApprovedFanPhotos`, tour data, settings, `generateMetadata` in the root layout, etc.) and give them tags + revalidate as well.
- After the change, confirm with a production build (`next build` output shows the routes as static/ISR, not dynamic) and on the Netlify deploy: public pages return a cacheable `cache-control` and a CDN **HIT** on the second request. Anything still dynamic has to have a real reason (auth, per-user data); list it.
- Pages that must stay dynamic (`/fans/*`, `/crew/*`, `/admin/*`, `/planner/*`) get a light `loading.tsx` skeleton, so the new page appears immediately and fills in, instead of the curtain waiting.

## Smaller improvements
- `TransitionLink` only prefetches on hover/focus/touch. Let the main nav and footer links prefetch when they come into view too (Next's default `<Link prefetch>` behavior), so the RSC payload is usually ready before the click.
- `waitForNewPageContent` in `PageTransition.tsx` adds up to ~20 ms polls + 350 ms (images) + 300 ms (videos) + two double-RAFs before revealing. Keep the image wait for the hero image only (the LCP image), not every `<img>` in the container, and skip the video wait unless the video is the hero.
- Don't change the look of the curtain animation (speeds and easing stay as they are).

## Verification
- Record click-to-content time (from the click until the curtain starts opening) for every main nav link, before and after, on a Netlify deploy preview, signed out **and** signed in. Target: **< 300 ms** for public pages when prefetched, and **no navigation hits the fallback**.
- The dev-only fallback `console.warn` never fires while clicking through the whole nav.
- Edit a page in Sanity → the change is live within a few seconds (webhook) without a redeploy.
- `npm run check-all` + `npm run build` pass. Write `PAGE_PAUSE_REPORT.md` with the before/after timings table, the redirecting links found, and the routes that are still dynamic (and why).
