# Task: Fix the bugs found in a live visitor test of the site

Repo: `7th-heaven` (Next.js 16, Supabase, Sanity, Netlify). Read `AGENTS.md` first. If any `*_REPORT.md` files exist from earlier tasks, read them and don't undo their changes.

Every issue below was found by testing **https://7thheavenband.netlify.app** in Chrome on Sept 30, 2026, signed in as a crew account. **Reproduce each one first** (locally with `npm run dev` and/or on a Netlify deploy preview), fix it, then verify. One issue per commit. Run `npm run check-all` + `npm run build` after each.

---

## Critical: fix first

### 1. The "MERCH" menu link goes to the test store, and the test store is broken
- `src/components/Header.tsx`: line ~29 `{ href: "/payment-test", label: "MERCH" }`, plus the button at ~657 and the mobile menu at ~909, all point to `/payment-test`.
- On `/payment-test`, visitors see:
  - a "🧪 TEST MODE — checkout using simulated TAC" banner
  - a "Credit Processing & Merchant System Setup" developer guide listing env var names and API routes (`/api/payment-test/north/tac`, `/result`)
  - "Store Features & Architecture" and "Manage Inventory" buttons
  - **"⚠️ Failed to load products."**, because `GET /api/payment-test/products` returns **500** `{"error":"Failed to load products."}`
- Fix:
  1. Point MERCH (desktop, button and mobile) at the real store, `/merch`, **unless** `/payment-test` is meant to become the store. If so, **stop and ask me**; don't guess.
  2. Find why `/api/payment-test/products` returns 500 in production (probably a missing env var or table; check the Netlify function logs). Make it return a proper error and a friendly empty state instead of a raw error.
  3. The test banner, setup guide, architecture panel and "Manage Inventory" must only ever render for admins (check on the server), never for the public. Verify signed out.

### 2. The crew calendar is public
- `GET /api/crew/calendar.ics` returns **572 events with email addresses in the descriptions** to anyone, with no login.
- Fix: require a signed, per-user secret token in the URL (calendar apps can't send cookies). Suggested format: `/api/crew/calendar.ics?token=<random 32+ char token stored on the crew member's profile>`. Allow regenerating the token from the crew dashboard. Anything without a valid token → 401. Strip email addresses and phone numbers from event descriptions unless they're essential.
- Check `/api/calendar/ics` (the public per-show "Add to calendar") too: it must only return public show info.

### 3. Every page tells Google its address is `localhost`
- `<link rel="canonical">` on the live site is `http://localhost:3000/contact` (and the same on the other pages). The canonical comes from `metadataBase` in `src/app/layout.tsx` → `NEXT_PUBLIC_SITE_URL`, which is evidently set to `http://localhost:3000` in the Netlify production environment.
- Fix: in code, ignore a `localhost` value in production and fall back to `https://7thheavenband.com` (or the Netlify URL until the domain switches over). Tell me in the report which Netlify env var to correct. Check that OG image URLs, the sitemap and robots use the same base URL.

### 4. Admin setup info is public
- `GET /api/admin/setup-status` returns, without login, which services are connected plus the Twilio phone number, the sending email, the LiveKit URL, the Shopify domain and the Sanity project ID.
- Fix: admin-only (server-side session + role check) → 401 otherwise. Audit **every** route under `src/app/api/admin/**` and `src/app/api/dev/**` for the same problem. `GET /api/dev/planner-dashboard-preview` is also publicly reachable in production; dev routes should return 404 when `NODE_ENV === "production"`. List every route you checked, with its auth status, in the report.

---

## High

### 5. Booking calendar (`/book`)
- a) **The month label doesn't update.** Click "Next": the grid shows October (31 days, starting Thursday), but the label still says **"September"**. Fix the label, and give each day button a full `aria-label` ("Friday, October 16, 2026"), plus a "booked"/"unavailable" state for screen readers.
- b) **Dates already booked show as available.** `/api/booking/availability` returns only `{"blockedDates":["2026-06-21","2026-05-17"]}`, but the band has shows on Oct 2, 3, 4, 10, 16, 17, 23 and 24 (from `/api/tour`). All of them are selectable and none use the red "Booked" style. Include confirmed tour dates (and confirmed bookings) in the blocked dates, **or** ask me if double-booking a day is intentionally allowed (e.g. afternoon + evening). Don't expose private show details.
- c) The page H1 is "Event Schedule & Format". Consider a clearer H1 such as "Book 7th Heaven", but **ask me before changing visible copy**.

### 6. Dev/test pages are public and some are in the sitemap
- These all return 200 to the public: `/hambuger`, `/textcolor`, `/preloaders`, `/firecanvas`, `/slideup`, `/style-guide`, `/features`, `/work/studio-d`, `/7hrrk`, `/rrk`, `/crew-abbie`, `/crew-michael` (and the other `crew-*` pages), `/payment-test/checkout`, `/sitemap/flows`.
- `sitemap.xml` (333 URLs) includes `/admin`, `/admin/emails`, `/admin/email-map` and `/features`.
- `robots.txt` doesn't disallow `/admin`, `/api`, `/studio` or `/crew`, and doesn't reference the sitemap.
- Fix: **don't delete pages.** Give me a list and a recommendation for each (`notFound()` in production, noindex, or keep). Remove admin, crew, studio, api and dev URLs from the sitemap now. Update robots to disallow private areas and add `Sitemap: https://…/sitemap.xml`.
- `/news` returns **404**. Check whether anything links to it (news cards, footer, Sanity links, old URLs). If yes, build the index page or redirect it (e.g. to the home news section).

---

## Medium

### 7. Each page's content is in the HTML twice
- On `/contact` (and most pages) there are **two `<h1>`s**. The second copy is inside a hidden `<div id="S:1" hidden>` (≈200 elements), and `<template id="B:…">` placeholders are still in the DOM. That's a streamed Suspense segment that React never swapped into place. It doubles the DOM and confuses crawlers and screen readers.
- Find the cause. Check the CSP (inline scripts/nonce for React's streaming `$RC` script), anything that edits the DOM before hydration (the `is-preloading` head script, `PageTransition`, `template.tsx`), Netlify HTML post-processing/snippet injection, and the `loading.tsx` / Suspense boundaries in the layout. After the fix, `document.querySelectorAll('div[id^="S:"] *').length === 0` and there's one `<h1>` per page.
- The homepage has two different H1s: "7th Heaven — Official Band Website" and "7th Heaven Band". Keep one.

### 8. Page titles
- The homepage `<title>` is "Home Page". `/payment-test` and `/notifications` fall back to the generic tagline. Give every public page a proper title and description (e.g. "7th Heaven — Chicago's #1 Rock Band | Official Site").

### 9. Fan dashboard
- `/fans` → `/fans/me` makes a Supabase `GET /rest/v1/profiles` request that returns **400**. Find the bad query (probably a column that doesn't exist or a malformed filter) and fix it.

### 10. Media page: a card goes black after closing a video
- On `/media`, open a video, then close it (Escape): that video's card stays black with no thumbnail or title. Restore the card after closing, and stop/unload the YouTube iframe.

### 11. Privacy and efficiency
- The homepage calls `/api/shows/notify-me?email=<signed-in user's email>`, which puts personal data in URLs (and so in logs and analytics). Use the session on the server or a POST body instead.
- The homepage fetches `/api/tour` twice. Dedupe it (shared fetch, cache, or React `cache()`).
- The homepage loads the Google Maps JS on page load (this is already covered in the performance prompt; don't duplicate that work if it's already done).

---

## Low (accessibility)
- `/cruise`: 12 round icon buttons (`seventh--btn`, 60×60) have no text or `aria-label`.
- FAQ accordion buttons have `aria-expanded` but no `aria-controls` / region `id`.
- `?bypass=true` (the animation-bypass switch) doesn't skip the preloader; make it hide the preloader too, since it's used for testing.

---

## Not covered by that test (please test these)
- **Signed out.** The test browser was signed in as crew, so crew-only UI (Studio link, Edit/Del buttons, "Edit in Sanity") was visible. Re-test every public page in a private window and confirm none of it shows.
- **Form submissions:** booking request, newsletter, fan uploads, show "notify me", login/PIN. They weren't submitted in that test. Test each one end-to-end on a deploy preview with test data.
- **Phone widths and Safari:** covered by the mobile/Safari prompt.

## Report
Write `VISITOR_BUGS_REPORT.md`: each issue number → fixed / needs my decision / couldn't reproduce, with the cause, the fix, the commit, and how you verified it. List the Netlify env vars I need to change.
