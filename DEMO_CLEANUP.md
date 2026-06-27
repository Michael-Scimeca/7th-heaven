# 🚀 Pre-Launch Cleanup Checklist

> **For the developer going live:** This file documents every piece of demo/placeholder content added
> for client review. Work through this list before launch and delete this file when done.

---

## 1. Fan Photo Wall — Seed Data

**File:** `data/fan-photos.json`

**Action:** Delete this entire file (or replace with an empty array `[]`).

The file contains 12 pre-approved demo photos pulled from 7th Heaven YouTube thumbnails. Real fan photos will be submitted through the upload form on `/fan-photo-wall` and approved via the admin panel.

```bash
rm data/fan-photos.json
```

---

## 2. Live Hub — Demo Stream Cards

**File:** `src/app/live/page.tsx`

**Action:** Delete the `DEMO_ROOMS` constant (~lines 29–35) and the two demo fallback blocks in `fetchRooms`.

Search for `// ── DEMO` to find all three blocks. The final `setActiveRooms` call should be:

```ts
// BEFORE (demo):
setActiveRooms(mapped.length > 0 ? mapped : DEMO_ROOMS);

// AFTER (production):
setActiveRooms(mapped);
```

Also delete the amber `⚠ DEMO MODE` banner `<div>` in the JSX return.

---

## 3. Live Hub — Demo Banner in UI

**File:** `src/app/live/page.tsx`

**Action:** Delete the entire `{/* ── DEMO BANNER — DELETE BEFORE GO-LIVE */}` block in the JSX.

---

## 4. Fan Dashboard — Demo Bypass Mode

**File:** `src/app/fans/page.tsx`

**Action:** Delete the 8-line `// ── DEMO MODE` block and the `effectiveMember` variable. Replace all `effectiveMember` references back to `member`.

Also delete the `{isDemoMode && (<div> ... ⚠ DEMO MODE ...)}` banner in the JSX.

After cleanup, the auth check should return to:
```ts
if (!isLoggedIn && !devBypass) { ... }
```

The fan dashboard is accessible at `/fans?demo=true` during demo review.

---

## 5. Homepage Merch Section — Demo Products

**File:** `src/components/HomeMerch.tsx`

**Action:** Delete the `DEMO_PRODUCTS` constant (~30 lines) and both fallback blocks. Restore the original early return:

```ts
// RESTORE THIS:
if (products.length === 0) {
  return null;
}
```

Also delete `displayProducts`, `isDemo`, and the amber banner JSX. Change all `displayProducts` back to `products` in the grid.

The merch section will show real products once Shopify has items tagged `featured`, `sale`, `homepage`, or `promo`.

---

## 6. Connect Real Backends

Once demo content is removed, configure and verify these services:

| Service | What to Configure | Env Var |
|---|---|---|
| **Sanity CMS** | Populate band members, tour dates, news posts, site settings | `NEXT_PUBLIC_SANITY_PROJECT_ID` |
| **Supabase** | Fan accounts, photo wall, live room state | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Shopify** | Tag merch items `featured` or `sale` for homepage | `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_TOKEN` |
| **LiveKit** | Stream token generation for crew | `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET` |
| **Resend** | Verify email domain for sending signup PINs & alerts | `RESEND_API_KEY` + `RESEND_FROM_EMAIL` |
| **Twilio** | Power geographical SMS show notifications & auto-blasts | `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_PHONE_NUMBER` |
| **Google Analytics** | Log traffic & user engagement analytics | `NEXT_PUBLIC_GA_ID` |
| **Stripe** | Process booking deposits, ticket sales & checkout flows | `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |

---

## Pages That Already Had Real/Hardcoded Fallback Data (No Action Needed)

These pages always had fallback data built-in and don't need cleanup:

- `/bio` — All 5 band members are hardcoded as `FALLBACK_MEMBERS`
- `/tour` — All 52 shows are hardcoded in `TourList.tsx` as `shows[]`
- `/news` — Has `FALLBACK_NEWS` constant
- `/video` — Fully populated from `public/data/videos.json`
- `/live/demo` — Standalone simulation page; keep as-is
- `/merch` — Already has `?demo=merch` bypass built in
- `/members` — Now redirects to `/bio`

---

## Quick Demo URLs for Client Review

| Page | URL | Notes |
|---|---|---|
| Homepage | `/` | Shows merch section with demo products |
| Band Members / Bio | `/bio` | All 5 members visible with full data |
| Tour Dates | `/tour` | 52 shows with interactive map |
| Videos | `/video` | 100+ real YouTube videos |
| News | `/news` | Shows fallback news posts |
| Fan Photo Wall | `/fan-photo-wall` | 12 pre-seeded fan photos |
| Live Hub | `/live` | Shows 4 demo crew streams |
| Fan Dashboard | `/fans?demo=true` | Full dashboard without login |
| Merch Table | `/merch?demo=merch` | Demo pickup queue + raffle |
| Live Demo | `/live/demo` | Full show simulation |
