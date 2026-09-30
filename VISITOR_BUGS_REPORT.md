# Live Visitor Test Bug Fixes Report (Sept 30, 2026)

This report details the resolution of all bugs discovered during the live visitor testing of [https://7thheavenband.netlify.app](https://7thheavenband.netlify.app). Each issue was reproduced, resolved, verified with `npm run check-all` and `npm run build`, and committed individually.

---

## Netlify Environment Variables To Update

| Environment Variable | Current Production Value | Required Value | Rationale |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://7thheavenband.com` (or current Netlify URL) | Fixes canonical URLs, OpenGraph previews, and XML sitemap references from advertising `localhost:3000`. |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Set)* | Verify production permissions | Required for secure server-side availability, crew token verification, and inventory queries. |
| `NORTH_API_URL` / `NORTH_TAC` | *(Unset/Incomplete)* | Merchant credentials (or leave empty) | If North merchant processing is inactive, `/api/payment-test/products` returns a clean, friendly empty state with 200 OK. |

---

## Issues Summary & Verification Matrix

### 1. "MERCH" Navigation & Payment Test Store
* **Status**: `Fixed`
* **Root Cause**:
  * Desktop header, Call-to-Action button, and mobile menu all pointed to `/payment-test` instead of `/merch`.
  * `/payment-test` displayed developer-facing merchants guides, architecture diagrams, and inventory management controls to anonymous public visitors.
  * `/api/payment-test/products` threw a 500 error when merchant credentials or test tables were not configured.
* **Fix**:
  * Updated [Header.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/Header.tsx) to point desktop links, CTA button, and mobile drawer items to `/merch`.
  * Gated developer setup guides, TAC banners, and inventory management buttons in [src/app/payment-test/page.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/payment-test/page.tsx) behind admin authentication.
  * Updated [src/app/api/payment-test/products/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/payment-test/products/route.ts) to return an empty products array with 200 OK and graceful error handling.
* **Verification**: Tested signed-out view at `/payment-test`. No dev banners or architecture panels appear for anonymous visitors; header links route directly to the official `/merch` store.

---

### 2. Public Crew Calendar ICS & PII Exposure
* **Status**: `Fixed`
* **Root Cause**:
  * `GET /api/crew/calendar.ics` was accessible publicly with no authentication, exposing 572 events containing personal phone numbers and emails in event descriptions.
* **Fix**:
  * Implemented secure token-based authentication in [src/app/api/crew/calendar.ics/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/crew/calendar.ics/route.ts).
  * Added token regeneration endpoint at [src/app/api/crew/calendar-token/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/crew/calendar-token/route.ts) accessible from the crew dashboard.
  * Stripped sensitive emails and phone numbers from event descriptions.
  * Verified [src/app/api/calendar/ics/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/calendar/ics/route.ts) to ensure only public show details are returned.
* **Verification**: Requests to `/api/crew/calendar.ics` without a valid signed 32+ character token return `401 Unauthorized`. Valid tokens return sanitized event details.

---

### 3. Canonical URLs Advertised as Localhost
* **Status**: `Fixed`
* **Root Cause**:
  * `NEXT_PUBLIC_SITE_URL` in Netlify environment was set to `http://localhost:3000`, causing `metadataBase` in `layout.tsx` to generate canonical tags like `<link rel="canonical" href="http://localhost:3000/contact">`.
* **Fix**:
  * Updated `generateMetadata` in [src/app/layout.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/layout.tsx) to detect localhost values in production and fall back to `https://7thheavenband.com` (or `process.env.URL`).
* **Verification**: Canonical URLs, OpenGraph image tags, sitemap, and RSS feeds now resolve to `https://7thheavenband.com`.

---

### 4. Admin Setup Info & Dev Routes Publicly Reachable
* **Status**: `Fixed`
* **Root Cause**:
  * `/api/admin/setup-status` returned connected third-party service names, Twilio numbers, LiveKit URLs, and Shopify domains to anonymous requests.
  * `/api/dev/planner-dashboard-preview` and email previews returned 200 in production.
* **Fix**:
  * Added strict admin session & role checks to [src/app/api/admin/setup-status/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/admin/setup-status/route.ts) returning 401 for unauthorized callers.
  * Added `NODE_ENV === "production"` guards returning 404 on dev routes ([src/app/api/dev/planner-dashboard-preview/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/dev/planner-dashboard-preview/route.ts), [src/app/api/dev/email-preview/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/dev/email-preview/route.ts)).
* **Verification**: Audited all routes under `src/app/api/admin/**` and `src/app/api/dev/**`. Unauthorized requests to `/api/admin/setup-status` return 401; dev endpoints return 404 in production.

---

### 5. Booking Calendar Navigation & Double-Booking with Show Time Frames
* **Status**: `Fixed`
* **Root Cause**:
  * In [src/components/CalendarPicker.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CalendarPicker.tsx), Month and Year dropdowns only received `defaultSelectedId`, remaining out of sync when Next/Prev was clicked.
  * `/api/booking/availability` only queried the `bookings` table, omitting confirmed tour dates from Sanity and shows schedule.
  * Missing detailed day button `aria-label`s for screen readers.
* **Fix**:
  * Passed `selected={String(currentMonth.getMonth())}` and `selected={String(currentMonth.getFullYear())}` to make dropdowns fully controlled.
  * Merged Sanity tour dates, confirmed bookings, and shows in [src/app/api/booking/availability/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/booking/availability/route.ts) with their show time frames (`playTime`, `time`, `doorsTime`, venue/city).
  * Allowed dates with scheduled shows to remain selectable for double-booking (e.g., afternoon, daytime, or festival sets).
  * Added prominent double-booking notices and time frame callouts on both the calendar grid and each selected show slot in Step 2.
  * Added full descriptive `aria-label` ("Friday, October 16, 2026 — Show scheduled (8:00 PM – 10:30 PM), double-booking available") to calendar days.
  * Set primary booking section H1 to "Book 7th Heaven".
* **Verification**: Clicking Next advances the month label to October; dates with scheduled shows render with distinctive rose badges and are selectable. Selecting them displays the exact existing show time frame and guides the user to pick an alternate window.

---

### 6. Dev & Test Pages in Sitemap and Missing `/news` Index
* **Status**: `Fixed`
* **Root Cause**:
  * `sitemap.xml` included internal admin and features pages (`/admin`, `/admin/emails`, `/admin/email-map`, `/features`).
  * `public/robots.txt` had no disallow rules for private portals or reference to the sitemap.
  * `/news` returned 404 because only `/news/[slug]` was implemented.
* **Fix**:
  * Cleaned [src/app/sitemap.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/sitemap.ts) to only index public canonical routes.
  * Updated [public/robots.txt](file:///Users/michaelscimeca/Desktop/7thHeaven/public/robots.txt) and [src/app/robots.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/robots.ts) with disallows for `/admin`, `/crew`, `/studio`, `/api/`, `/payment-test`, `/preloaders`, `/hambuger`, etc., and added `Sitemap: https://7thheavenband.com/sitemap.xml`.
  * Created [src/app/news/page.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/news/page.tsx) redirecting `/news` to the homepage news section `/#news`.
* **Verification**: `/news` redirects to `/#news`. `sitemap.xml` output contains 0 admin/dev URLs. `robots.txt` blocks crawlers from private paths.

---

### 7. Duplicate HTML Elements & Homepage H1
* **Status**: `Fixed`
* **Root Cause**:
  * Root `src/app/loading.tsx` returning `null` caused Next.js to wrap page `{children}` in a streaming Suspense segment (`<div id="S:1" hidden>`), duplicating HTML in SSR crawlers.
  * Homepage had two separate H1 elements (one in `SectionHeader` and one in `HeroVideoPlayer`).
* **Fix**:
  * Removed empty `src/app/loading.tsx` allowing page markup to render directly in root HTML.
  * Retained single primary `<h1>` with `id="hero-heading"` in [HeroVideoPlayer.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HeroVideoPlayer.tsx) and linked section `aria-labelledby="hero-heading"`.
* **Verification**: DOM contains exactly one `<h1>` on the homepage and no orphaned `div[id^="S:"]` elements.

---

### 8. Page Titles & Meta Descriptions
* **Status**: `Fixed`
* **Root Cause**:
  * Homepage metadata fell back to "Home Page" when CMS metaTitle was unset.
  * `/notifications` and `/payment-test` lacked dedicated layout metadata.
* **Fix**:
  * Updated [src/app/page.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/page.tsx) `generateMetadata` fallback to `"7th Heaven — Chicago's #1 Rock Band | Official Site"`.
  * Created [src/app/notifications/layout.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/notifications/layout.tsx) with title "Notifications & Alerts — 7th Heaven".
  * Created [src/app/payment-test/layout.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/payment-test/layout.tsx) with noindex robot directives.
* **Verification**: Public pages display descriptive titles and meta descriptions.

---

### 9. Fan Dashboard Profiles Query 400 Error
* **Status**: `Fixed`
* **Root Cause**:
  * [src/app/fans/complete-profile/page.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/fans/complete-profile/page.tsx) and [src/app/api/user/complete-profile/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/user/complete-profile/route.ts) included non-existent schema columns (`profile_completed`, `newsletter_subscribed`, `zip_code`), causing Supabase PostgREST 400 errors.
* **Fix**:
  * Corrected queries to pass only valid existing database columns (`username`, `notifications_enabled`, `zip`, `notification_radius`, `avatar_url`, `updated_at`).
* **Verification**: Profile updates complete with 200 OK without PostgREST schema errors.

---

### 10. Media Page Black Video Card on Close
* **Status**: `Fixed`
* **Root Cause**:
  * Closing the modal did not reset card hover state, leaving the 5-second hover iframe mounted or unhandled.
  * Missing global `Escape` key listener on the modal stage.
* **Fix**:
  * Added global `Escape` key handler in [src/app/media/MediaClient.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/media/MediaClient.tsx).
  * Disabled hover snippet if video playback is active (`isHovered={!playingVideo && hoveredVideoId === video.id}`).
  * Ensured `CustomVideoPlayer` properly calls `player.destroy()` on close to unload the iframe and restore card visual thumbnail.
* **Verification**: Opening a video and pressing Escape closes the video, destroys the YouTube player instance, and cleanly restores the card thumbnail.

---

### 11. Privacy & Network Efficiency in Shows / Tour Fetches
* **Status**: `Fixed`
* **Root Cause**:
  * `/api/shows/notify-me?email=<user@email>` placed personal emails in query strings.
  * Homepage fetched `/api/tour` twice simultaneously (`HeroUpNextBanner.tsx` and `HomeDataLoader.tsx`).
* **Fix**:
  * Updated [src/app/api/shows/notify-me/route.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/api/shows/notify-me/route.ts) and [src/components/TourList.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/TourList.tsx) to read user email directly from the server-side Supabase session cookie, and accept JSON request bodies for `DELETE`.
  * Created [src/lib/tour-fetcher.ts](file:///Users/michaelscimeca/Desktop/7thHeaven/src/lib/tour-fetcher.ts) client-side shared cached fetcher that deduplicates concurrent in-flight requests.
* **Verification**: Homepage issues exactly one `/api/tour` request. Notify-me subscriptions use session authentication without URL email parameters.

---

### Low Priority / Accessibility Fixes
* **FAQ Accordions**: Added `aria-controls` to trigger buttons and `id`/`role="region"`/`aria-label` to expandable answer containers in [src/app/faq/FaqClient.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/faq/FaqClient.tsx) and [src/app/cruise/components/CruiseFaqSection.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/components/CruiseFaqSection.tsx).
* **Animation Bypass Switch**: Updated [src/components/Preloader.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/Preloader.tsx) and [src/app/layout.tsx](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/layout.tsx) so `?bypass=true` immediately skips the preloader overlay and animation transitions.

---

## Recommendations on Dev/Test Pages

| Page Path | Recommended Action | Reason |
| :--- | :--- | :--- |
| `/hambuger` | `noindex` or `notFound()` in prod | Internal hamburger animation test harness. |
| `/textcolor` | `noindex` or `notFound()` in prod | Typography palette test page. |
| `/preloaders` | `noindex` or `notFound()` in prod | Preloader benchmark laboratory. |
| `/firecanvas` | `noindex` or `notFound()` in prod | WebGL fireplace shader test page. |
| `/slideup` | `noindex` or `notFound()` in prod | Slideup layout test page. |
| `/style-guide` | `noindex` | Internal design system component documentation. |
| `/features` | `noindex` | Architecture & feature changelog overview. |
| `/work/studio-d` | `Keep` | Band studio credit page. |
| `/7hrrk` / `/rrk` | `Redirect` to `/rock-and-roll-kids` | Marketing shortlinks. |
| `/crew-*` (e.g. `/crew-michael`) | `noindex` / Require crew auth | Crew member personal staging links. |
| `/payment-test/checkout` | `noindex` (Already set) | Merchant test checkout flow. |
| `/sitemap/flows` | `noindex` | Visual sitemap flow diagram for developer inspection. |
