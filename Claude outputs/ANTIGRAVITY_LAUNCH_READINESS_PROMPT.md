# Task: Make sure every piece of the 7th Heaven site is connected to Sanity or Supabase, and get it launch-ready

Repo: `7th-heaven` (Next.js 16, Sanity, Supabase, Resend, ntfy, web-push, Netlify). Read `AGENTS.md` first, then every `*_REPORT.md` and `NOTIFICATIONS_SETUP.md`, and don't undo any of that work. **Headings are sized by their tag only. Don't add size classes back to `<h1>`–`<h6>`** (`scripts/check-heading-classes.mjs` enforces this).

**Goal:** every piece of content a band member would ever want to change can be edited in **Sanity Studio** (`/studio`). Every piece of user or transactional data (accounts, bookings, signups, chat, alerts, orders) lives in **Supabase**. Nothing a visitor sees is fake, demo, or hard-coded in a `.ts` file. The site is ready to switch to the real domain.

**Rule for the whole task:** never delete real content. Move it into Sanity or Supabase first (with seed/migration scripts), verify it shows up, *then* remove the hard-coded copy.

---

## 1. Fake data visitors can see: fix first
1. **Made-up show dates.** `ensureUpcomingTourDates()` in `src/lib/tour-helpers.ts`: when every show is in the past, it **shifts all dates forward so the first show lands on today**. That invents show dates fans could drive to. Remove the date-shifting branch entirely. If there are no upcoming shows, return them as-is and let the UI show a "No upcoming shows. Check back soon / get alerts" empty state. It's used in `HomeDataLoader.tsx`, `HeroUpNextBanner.tsx`, `TourList.tsx` and `app/fans/[username]/page.tsx`.
2. **`FALLBACK_SHOWS`** in `HomeDataLoader.tsx` and `HeroUpNextBanner.tsx` is the *initial state* (e.g. a "2026-07-01 Arlington Heights" festival), so fake shows render before the real data arrives, and forever if `/api/tour` fails. Start with `[]` + a skeleton, fetch the real tour data (server-side where possible), and show the empty/error state on failure. Never show placeholder shows.
3. **`FALLBACK_NEWS`** (`app/news/[slug]/page.tsx`, `HomeNewsSection.tsx`): fake news posts show when Sanity returns nothing, and fake `/news/<slug>` pages resolve. Move any real posts into Sanity `newsPost` documents. Then: no posts → hide the section / 404 the slug.
4. **`FAKE_FANS`** (`app/live/LiveHubClient.tsx`, admin "users" tab) and the `/api/chat/simulate` + `FakeLiveStream` demo machinery: the moderation list must come from real chat participants in Supabase. Keep the simulator only behind `NODE_ENV !== "production"` or an admin-only "demo mode" toggle that's off by default, and make sure no visitor can see simulated chat or viewers.
5. Search the whole `src/` for other demo/placeholder data (`DEFAULT_*`, `FALLBACK_*`, `FAKE_*`, `MOCK_*`, `SAMPLE_*`, `demo`, `lorem`, `example.com`, `555-`, `TODO`) that renders for visitors, and list each one with how you handled it.

## 2. Hard-coded content → Sanity
These components render real band content from `.ts` files that Sanity can't edit. For each one: add or extend the Sanity schema (`src/sanity/schemas/`), write an idempotent seed script in `scripts/` (same style as the existing `seed-sanity-cruise.mjs` / `seed-sanity-contacts.mjs` / `seed-sanity-faq.mjs`) that copies the current hard-coded values into Sanity, read from Sanity in the component, then remove the hard-coded array (or keep it **only** as an empty-state/dev fallback, never shown in production):

| Content | Where it's hard-coded now | Sanity target |
|---|---|---|
| Cruise itineraries 2027/2028, cruise history, bands, extended FAQs, cabins/prices, ports, ship details | `app/cruise/cruiseData.ts` (`ITINERARY_2027`, `ITINERARY_2028`, `CRUISE_HISTORY`, `BANDS_DATA`, `FAQS_EXTENDED`, …), used as fallbacks across `app/cruise/components/*` | `pageContent` (key `cruise`) fields or new `cruiseYear` / `cruisePort` documents |
| Contact people + photos | `app/contact/page.tsx` `FALLBACK_CONTACTS`, `ContactClient.tsx` `ALL_PHOTOS` | `pageContent` (key `contact`) `contacts[]` (the seed script already exists, so check it ran) |
| Rock 'n' Roll Kids products + featured singles | `RockNRollKidsClient.tsx` `ALL_PRODUCTS`, `FEATURED_MUSIC_SINGLES` (also note it cycles fallback products to pad Sanity lists, so remove that padding) | `pageContent` (key `rock-and-roll-kids`) |
| Past shows archive (1985–present) | `src/data/past-shows.json` (600 KB, bundled into the page) | Sanity `tourDate` (past) **or** a Supabase `past_shows` table, whichever the admin dashboard already edits. Paginate/serve it from the server; don't ship 600 KB to the client |
| FAQ categories, past-show categories, notification group tabs | `FaqClient.tsx` `CATEGORIES`, `PastShowsClient.tsx` `CATEGORIES`, `notifications/page.tsx` `GROUP_TABS` | Category lists can stay in code **only if** they're UI structure, not content; decide per item and list it |
| Hero "up next" / tour data | already from `/api/tour`. Confirm the source of truth (Sanity `tourDate` vs Supabase `shows`, or both?) and that the admin dashboard edits **that** source. If there are two sources, pick one and document it | — |
| Merch | `/merch` reads Supabase; `/payment-test` (the store the MERCH nav pointed to) uses `src/data/north-shop-products.ts` + Supabase `north_shop_*`. **Ask me** which store is the real one before changing navigation or removing anything | — |

Also check every Sanity-backed page has its `pageContent` document: the keys used in code are `home, cruise, book, media, merch, contact, faq, live, fan-media-wall, fan-photo-wall, rock-and-roll-kids, past-shows, privacy, terms, returns, crew-verify, cruise-verify, planner-verify`. Write `scripts/check-sanity-content.mjs`, which queries Sanity for each key and each required field the components read, and prints ✅/❌. Seed any missing documents from the current fallback text. Make Studio easy to use: one "Pages" list with friendly titles, and singletons for Site Settings.

## 3. Supabase: schema, security, data
1. **Tables used in code with no `CREATE TABLE` in `supabase/`:** `client_notes`, `crew_notes`, `fan_picks`, `feed_posts`, `lotteries`, `lottery_entries`. Read their actual structure (Supabase dashboard / `information_schema`, or the `api/setup-db` / `api/setup-picks` routes that may create them at runtime) and add a migration file for each, so the database can be rebuilt from the repo. **Additive only. Don't apply to production; list them for me.**
2. Tables created in migrations but never queried in code: `email_queue`, `email_quota_logs`, `featured_tracks`, `feed_reactions`, `merch_pickups`, `show_invite_referrals`, `show_messages`. Check whether they're used another way (RPC, a variable table name, Netlify functions). If they're really unused, say so; don't drop them.
3. Put migrations in order: a single numbered sequence (there are duplicate prefixes like `003_`, `004_`, `005_`, `010_`, `014_`), plus `supabase/migrations/chat_bans.sql`. Add a `supabase/README.md` with the run order.
4. **Row Level Security:** list every table, its RLS status and its policies. Any table the browser reads with the anon key must have RLS on, with policies so a visitor can only read public rows and a user only their own. Tables only touched by API routes with the service role should have RLS on with no anon policies. Pay special attention to bookings, cruise signups, profiles, chat, push subscriptions, phone numbers and emails.
5. **Runtime setup/seed endpoints:** `api/setup-db`, `api/setup-picks`, `api/seed-content`, `api/seed-tours`, `api/admin/run-migration`, `api/sync-shows`. In production these must be admin-only (server-checked), or return 404. Seeding belongs in scripts, not public endpoints.
6. `/fans` → the Supabase `profiles` request that returned 400 in the visitor test: confirm it's fixed.

## 4. Configuration that doesn't match the code
1. **Email sender:** `lib/email.ts` reads `RESEND_FROM_EMAIL` (falls back to `onboarding@resend.dev`), but `.env.local.example` documents `EMAIL_FROM`, `EMAIL_REPLY_TO`, `EMAIL_DAILY_LIMIT`, `EMAIL_MONTHLY_LIMIT`, and the code never reads them. Pick one set of names, make the code and the docs match, and **fail loudly in production** (log an error and show it in the admin setup status) if the sender is still the Resend test address.
2. **Private alert channels exposed:** `app/notifications/page.tsx` puts `NEXT_PUBLIC_NTFY_TOPIC_CREW` / `_BAND` / `_CRUISE` into the public page, with guessable defaults (`7thheaven_crew`, `7thheaven_band`). Anyone can subscribe to crew and band alerts. Only the fans topic may be public. Crew/band/cruise topics must come from the authenticated `api/admin/ntfy-topics` (or similar) route, never `NEXT_PUBLIC_*`, and have no default values. **Tell me to rotate those topic names**, since the defaults are now public.
3. **Undocumented env vars:** add these 29 to `.env.local.example`, with a comment on what each is for and whether it's required: `CRON_SECRET, HIVE_MODERATION_API_KEY, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, NEXT_PUBLIC_LIVEKIT_URL, MUX_TOKEN_ID, MUX_TOKEN_SECRET, NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, NEXT_PUBLIC_SANITY_API_VERSION, SANITY_API_TOKEN, SANITY_REVALIDATE_SECRET, SANITY_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN, NEXT_PUBLIC_DISABLE_SHOPIFY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, RESEND_FROM_EMAIL, NEXT_PUBLIC_SHOW_DEV_NAV, ANALYZE, NEXT_PUBLIC_ANALYZE` (+ the NTFY ones after the fix above). Remove documented names nothing uses, or wire them in.
4. **Startup env check:** add `src/lib/env.ts`, which validates the required server env vars once (zod is already a dependency) and logs a clear list of what's missing in production. Show the same list in the admin setup-status panel (admin-only).
5. **hCaptcha:** `NEXT_PUBLIC_HCAPTCHA_SITEKEY` is documented but no form uses it. Either add hCaptcha to the public forms that send emails/SMS or create records (booking request, newsletter, cruise signup, fan upload, notify-me, PIN requests), or remove the variables. **Ask me which.** At minimum, every one of those endpoints must be rate-limited.
6. **Sanity → site updates:** confirm the `/api/revalidate` webhook (from the page-pause work) covers every document type, and write the exact Sanity webhook settings (URL, secret, filter, projection) in the report for me to paste into sanity.io/manage.

## 5. Launch checklist (verify, then report status)
- `NEXT_PUBLIC_SITE_URL` = the real domain in Netlify, with canonical/OG/sitemap all correct.
- **Domain:** steps to point `7thheavenband.com` (currently the old site) at Netlify: DNS records, HTTPS certificate, `www` → apex redirect, and 301 redirects from the old site's main URLs (old `/tour`, `/store`, `/bio`, `/press`, etc.) to the new pages so search rankings and old links keep working. List the old URLs you found (from the old site's sitemap or nav).
- Resend domain verified (SPF/DKIM/DMARC), and test emails delivered to a Gmail that isn't the account owner.
- Netlify scheduled function (`drain-email-queue`) enabled, with `CRON_SECRET` set.
- `robots.txt` / sitemap only list public pages, and dev/test pages are `notFound()` or noindex in production.
- Error monitoring: a client + server error reporting path works (`/api/report-error` exists, so check where it sends errors and that someone gets notified).
- Supabase: Point-in-Time Recovery or daily backups enabled (tell me which plan feature is needed).
- `/api/health` returns OK, but **without** exposing internal details publicly.
- `npm run check-all`, `npm run build` and the WebKit Playwright suite all pass.

## Rules
- Small commits per area. Never drop tables or delete Sanity documents. Don't apply migrations to production; I'll do it.
- Visual design stays the same, except for empty states replacing fake data.

## Report
Write `LAUNCH_READINESS_REPORT.md`:
1. A table of every page/section → its data source (Sanity doc/field, Supabase table, or API) → status ✅ / needs content / needs my decision.
2. The seed scripts to run (in order), the migrations to apply, and the env vars to set in Netlify (name, where to get the value, required?).
3. The Sanity webhook settings, the DNS steps, and the old-URL redirect list.
4. **Decisions I need to make** (merch store, hCaptcha, demo mode, …) as a short list.
