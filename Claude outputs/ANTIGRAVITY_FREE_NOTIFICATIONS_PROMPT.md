# Task: Free notifications and email for crew and fans (SMS optional)

Repo: `7th-heaven` (Next.js 16, Supabase, Resend, ntfy, web-push, Twilio). Read `AGENTS.md` first.

**Goal:** the band can reach the **crew** and **fans** at no cost by default. Push notifications (ntfy + browser web push) and email are the main channels. SMS through Twilio costs money per message, so it becomes an opt-in extra for emergencies only.

## What exists today (verify before changing)
- `src/lib/ntfy.ts` publishes to topics set by `NTFY_TOPIC_CREW / FANS / ADMINS / CRUISE`. It's free and already used by `api/admin/crew-alert` and `api/admin/broadcast`.
- `src/lib/push-subscriptions.ts` + `api/web-push/subscribe` store browser push subscriptions (VAPID / `web-push`), but **nothing seems to send to them** from the admin broadcast. `broadcast/route.ts` says ntfy is "the one channel here that actually sends".
- `src/lib/email.ts` uses Resend. **Bug:** `getSendingFromEmail()` falls back to `onboarding@resend.dev` for Gmail/Yahoo/etc. senders. Resend's test domain only delivers to the Resend account owner, so emails to crew and fans are probably failing (403 "You can only send testing emails to your own email address").
- `api/admin/newsletter` sends **one Resend email per fan** in batches of 10. The Resend free plan allows **100 emails/day and 3,000/month**, so any fan list over 100 gets cut off silently.
- `api/sms/*` and `crew-alert` use Twilio (paid).

## 1. Email (free, and it has to actually arrive)
- Send from a verified domain address. Add `EMAIL_FROM` (e.g. `7th Heaven <news@7thheavenband.com>`) and `EMAIL_REPLY_TO` env vars, and remove the `onboarding@resend.dev` fallback **in production** (keep it for local dev only). Add both to `.env.local.example`, with a comment explaining that the domain must be verified in Resend (SPF/DKIM DNS records) and adding a DMARC record.
- Surface errors: return per-recipient success/failure from `sendEmail` and show "X sent / Y failed" in the admin UI. No more silent failures.
- **Respect the free quota.** Add a small usage counter (Supabase table or Upstash, both already in the project) for emails sent today and this month. Before a send, check `recipients <= remaining quota`. If it won't fit, don't send partially: show the admin how many would be sent now and let them choose "send the first N today, queue the rest", or cancel. Put the limits in env vars (`EMAIL_DAILY_LIMIT=100`, `EMAIL_MONTHLY_LIMIT=3000`) so they're easy to raise after a plan change.
- Crew emails go first (small list). Fan newsletters use the queue: a scheduled job (Netlify scheduled function) sends the next batch each day within the quota.
- Keep the existing unsubscribe link / CAN-SPAM footer. Add the `List-Unsubscribe` + `List-Unsubscribe-Post` headers for fan emails.
- Structure the code so a second provider can be added later (e.g. Brevo, whose free plan is 300/day), but **don't add one now**.

## 2. Push notifications (free and unlimited)
**ntfy**
- Crew: the private topic `NTFY_TOPIC_CREW` must be a long random string. Build a crew-only "Get alerts on your phone" card (in the crew dashboard) with: the ntfy app links (iOS/Android), a **QR code** and a one-tap subscribe link for the crew topic, and a "Send test alert" button. Only show it to logged-in crew. Never render the crew/admin topic names on public pages or in client bundles; fetch them from an authenticated API route.
- Fans: `NTFY_TOPIC_FANS` can be public. Add a "Get show alerts" option (app links + QR) to the existing fan alert/subscribe UI.

**Browser web push (VAPID)**
- Wire the stored subscriptions into sending: create `sendWebPushToGroup(group, payload)` in `push-subscriptions.ts` that sends in parallel with a concurrency limit and **deletes subscriptions that return 404/410**.
- Tag subscriptions by audience (`fan`, `crew`, `cruise`) using the logged-in user's role.
- iPhone: web push only works when the site is added to the Home Screen (iOS 16.4+). Detect iOS Safari outside standalone mode and show short "Add to Home Screen" steps instead of a subscribe button that silently does nothing. `manifest.json` must exist and be valid.
- Service worker: show the notification with title, body, icon and a URL, and open or focus that URL when tapped.

## 3. One "Send alert" flow for admins
- In the admin crew-alert and broadcast UIs (the "Crew SMS Alert & Group Setup", "Band Member SMS Text" and "SMS Proximity Blast" panels), replace the SMS-first wording with a channel picker:
  - ☑ Push (ntfy) — free, on by default
  - ☑ Web push — free, on by default
  - ☑ Email — free up to the daily limit (show the remaining quota)
  - ☐ SMS — **paid**. Off by default. Show an estimated cost (recipient count × a `SMS_COST_PER_MESSAGE` env var) and ask for confirmation before sending.
- Rename the panels so they don't say "SMS" when SMS is optional (e.g. "Crew Alerts", "Band Alerts", "Fan Proximity Alerts"). Keep the existing group/member selection.
- After sending, show a result per channel (sent, failed, skipped because not configured).
- Keep the existing rate limits. Log each broadcast (who, when, which channels, counts) to Supabase.

## Rules
- Don't remove the Twilio code; just make it opt-in.
- Server-only secrets (`RESEND_API_KEY`, VAPID private key, `SUPABASE_SERVICE_ROLE_KEY`, Twilio) must never reach client code.
- Small commits. Run `npm run check-all` and `npm run build` after each section.

## Verification
- Send a test crew alert with only the free channels on. It should arrive via the ntfy app, browser push (desktop Chrome + an iPhone with the site on the Home Screen) and email (to a Gmail address that is **not** the Resend account owner).
- Simulate a fan list of 250: the admin gets the quota warning, 100 go out today and 150 are queued. The queue job sends the rest on the following days.
- Write `NOTIFICATIONS_SETUP.md` covering: the env vars to set, the Resend domain DNS steps, how crew and fans subscribe, and what each channel costs.

---

# Part 2: Make the site install and feel like the "7th Heaven app" (PWA)

Do this after sections 1–3 above; web push depends on the service worker set up here, so test push end-to-end only once this part is done.

## What exists today (verify)
- `public/manifest.json` exists, but it's **injected by JavaScript** in `ClientOnlyExtras.tsx` after an 8s idle delay. iOS reads the manifest when the user taps "Add to Home Screen", so it's often missed there. All the icons are `purpose: "maskable"` only, and there's no `id`, `scope`, `screenshots` or `shortcuts`.
- `public/sw.js` handles `push` and `notificationclick`, but **nothing in `src/` ever registers it** (`navigator.serviceWorker.register` doesn't appear anywhere). So browser push can't work yet.
- `sw.js` uses `/favicon.ico` as the notification icon and badge. Android badges need a small monochrome PNG. The click handler compares the absolute `client.url` to a relative path, so it never focuses an open tab.
- The push subscriptions already store `zip`, `radius` and `selectedTypes`. Reuse them for the alert preferences.

## 1. Manifest
- Replace the JS-injected link with Next's built-in manifest (`src/app/manifest.ts`, per the docs in `node_modules/next/dist/docs/`), so it's in the server HTML on every page. Remove the injection from `ClientOnlyExtras.tsx` and delete `public/manifest.json` once the new one is served.
- Fields: `id: "/"`, `name: "7th Heaven"`, `short_name: "7th Heaven"`, `start_url: "/?source=pwa"`, `scope: "/"`, `display: "standalone"`, `background_color` and `theme_color` matching the site (dark background), `orientation: "portrait"`, `categories: ["music","entertainment"]`.
- Icons: provide **both** `purpose: "any"` and separate `purpose: "maskable"` PNGs (192 and 512; keep the logo inside the maskable safe zone), plus `apple-icon.png` 180×180 via the metadata `icons.apple`. Ask me for the source logo if there isn't a clean square version in `public/images/logos/`; don't stretch or crop the existing one.
- `shortcuts` (long-press on the app icon): "Tour dates" → `/#tour`, "Watch live" → `/live`, "Merch" → `/merch`.
- `screenshots`: one narrow (mobile) and one wide screenshot of the homepage, so Android shows the richer install dialog.

## 2. iPhone "app" polish
- In the root layout metadata, set `appleWebApp: { capable: true, title: "7th Heaven", statusBarStyle: "black-translucent" }` and `themeColor` in the viewport export. With a translucent status bar the header needs `env(safe-area-inset-top)` padding; coordinate with the mobile/Safari work.
- Apple splash screens: generate `apple-touch-startup-image` links for the current iPhone sizes (logo centered on the dark background). Use a script (e.g. `pwa-asset-generator`, run once as a dev tool; commit the images, not the dependency) so they can be regenerated later.
- When the app is opened from the home screen (`display-mode: standalone`), hide anything that only makes sense in a browser (e.g. "Add to Home Screen" prompts), and make sure there's always a way back/home, because there's no browser back button.

## 3. Service worker
- Register `/sw.js` from a tiny client component loaded in the root layout, after the page has loaded (never blocking first paint), with `scope: "/"`. Serve it with `Cache-Control: no-cache` and `Service-Worker-Allowed: /` (update `next.config.ts` headers / `public/_headers`) so updates roll out.
- **Push only, plus a small offline page.** No aggressive caching of pages or Next chunks (that's how PWAs end up showing stale sites). Precache only `/offline` (a simple branded "You're offline" page with the logo) and serve it for failed navigations.
- Notifications: use `icon-192.png` as the icon, a new monochrome 96×96 `badge.png`, `tag` so repeat alerts replace each other, an optional `image` for show posters, and the `url` from the payload. On click, focus an existing window on the same origin and navigate it, or open a new one. Compare using `new URL(url, self.location.origin).href`.
- Handle `pushsubscriptionchange`: re-subscribe and POST the new subscription to `/api/web-push/subscribe`.
- Bump a `SW_VERSION` constant on changes; call `skipWaiting()` + `clients.claim()`.

## 4. "Install the 7th Heaven app" button
- One `InstallAppButton` component, shown in the footer, the mobile menu, and after a fan signs up for alerts:
  - **Android/desktop Chrome/Edge:** capture `beforeinstallprompt`, show "Install the 7th Heaven app", and call `prompt()` on tap.
  - **iPhone/iPad Safari:** show a small sheet with 2 illustrated steps (Share icon → "Add to Home Screen").
  - **Already installed** (`display-mode: standalone` or `navigator.standalone`): hide the button.
- Don't nag: at most one gentle prompt per visit, only after the fan has scrolled or engaged, and remember a dismissal for 30 days (localStorage, wrapped in try/catch).
- Track installs (`appinstalled` event) and launches (`?source=pwa`) in GA.

## 5. Fan notification settings ("choose your alerts")
- An **Alerts** page (`/notifications`, which already exists; extend it) and a settings sheet reachable from the installed app:
  - Master "Allow notifications" switch. It only calls `Notification.requestPermission()` **after the fan taps it** (never on page load; iOS requires a tap).
  - Categories (toggles, stored in `selectedTypes`): **Shows near me**, **Livestreams**, **New music & videos**, **Merch drops**, **News**, and **Cruise updates** (only if they're a cruise guest).
  - "Near me": ZIP + radius (reuse the existing `zip` / `radius` fields; 25/50/100/250 miles).
  - Quiet hours (optional) are stored and respected by the sender.
  - A "Send me a test notification" button.
  - A clear "Turn off all alerts" option that unsubscribes and deletes the subscription.
- Signed-in fans: save the preferences on their profile so they follow them to a new phone. Signed-out: store them on the push subscription.
- Sending side: `sendWebPushToGroup` (section 2 of the first part) filters by category, and by distance for "shows near me" (reuse the existing venue coords / proximity logic). The admin "Send alert" screen gets a **category** picker, plus a preview of how many fans will receive it.

## Rules
- The site must behave exactly the same in a normal browser tab. The PWA is an addition, not a redesign.
- No new heavy dependencies at runtime. Keep the service worker plain JS with no framework, well under 10 KB.
- iOS: only ask for notification permission from a user tap, and only when running from the Home Screen.

## Verification
- Chrome DevTools → Application → Manifest shows no errors, and the site is installable. Lighthouse PWA / installability checks pass.
- Android phone: install from the button, open from the home screen (splash, no browser bar), receive a test push with the 7th Heaven icon on the lock screen, tap it → opens the right page.
- iPhone (iOS 16.4+): Add to Home Screen → splash screen → allow notifications from the Alerts page → receive a test push on the lock screen → tapping opens the right page.
- Toggle categories off and confirm those alerts stop. "Turn off all alerts" stops everything.
- Update `NOTIFICATIONS_SETUP.md` with install instructions for fans (iPhone and Android) that the band can post on social media.

---

# Part 3: Four audiences, one system: Fans, Crew, Band, Planners

Everything above (free push via ntfy + web push, email with the quota queue, optional paid SMS, the installable app, alert preferences) must work for **all four audiences**. Build **one** shared alert system; don't write four copies.

## Audiences (map them to the existing roles; verify in code and data)
| Audience | Who (existing data) | Typical alerts | Default channels |
|---|---|---|---|
| **Fans** | `profiles.role = "fan"` + `newsletter_subscribers` + anonymous web-push subscribers. Cruise guests (`role = "cruise"`) are a sub-group. | Shows near me, livestreams, new music/videos, merch drops, news, cruise updates | Web push, ntfy fans topic, email (queued within quota) |
| **Crew** | `role = "crew"` | Load-in times, schedule changes, emergencies, day-of notes | ntfy crew topic, web push, email. SMS optional for emergencies |
| **Band** | Check where the current "Band Member SMS Text" panel gets its recipients (`crew-alert` currently queries `role = "admin"`). If band = admins, add a **`band` audience** (a flag such as `profiles.is_band` or a `BAND_EMAILS` list in `role-config.ts`) so non-band admins aren't included. **Don't change anyone's permissions.** | Show notices, set times, travel, emergencies | ntfy band topic, web push, email. SMS optional |
| **Planners** | `role = "event_planner"`, linked to their bookings (`/book/[username]`, `PlannerDashboard`) | **Only about their own event**: booking confirmed/changed, day-of arrival, band en route, setlist posted, cancellations | Web push + email by default. Planners are external clients, so **no shared ntfy topic** (it would leak other clients' events) |

## Build
- **`src/lib/alerts.ts`**: one entry point, `sendAlert({ audience, recipients?, bookingId?, category, title, body, url, channels, urgent })`. It resolves recipients, respects each person's preferences and quiet hours (urgent crew/band alerts can override quiet hours), fans out to the channels, and returns per-channel results. `crew-alert`, `broadcast`, `newsletter`, the SMS proximity blast and booking events all call this instead of sending directly.
- **ntfy topics:** add `NTFY_TOPIC_BAND`. Crew, band and admin topics are private random strings, served only to logged-in members of that audience. Fans can use a public topic. Planners get no topic.
- **Web push:** tag each subscription with the user's audience (and `userId` when signed in) so `sendWebPushToGroup` can target crew, band, planners (by booking) or fans (by category and distance).
- **Automatic planner alerts:** fire on booking status changes, setlist posted and day-of reminders (e.g. the morning of the event and when the band is en route). Send only to the planner(s) on that booking. Include a link to their planner dashboard.
- **"Get alerts" setup card** in each dashboard (crew, band/admin, planner, fan Alerts page): install-app button, allow-notifications button, ntfy QR (crew/band only), email toggle, and a test button. Each card uses the same component with audience-specific text.
- **Preferences per audience:** fans pick categories (Part 2). Crew/band pick which alert types they get, but can't turn off **emergency** alerts. Planners pick push and/or email for their event updates.

## Admin UI (the panels in the screenshot)
Replace the three SMS-named panels with one **"Send Alert"** panel (or keep separate panels, but they must all be built on `sendAlert`):
1. **Audience:** Fans / Crew / Band / Planners (multi-select).
   - Fans: category + optional "near a venue" radius (this replaces "SMS Proximity Blast"; keep its Auto-Blast toggle, which now sends via push/email first).
   - Crew / Band: everyone, saved groups, or specific people (keep the existing group setup).
   - Planners: pick a booking/event → only that booking's planner(s).
2. **Message:** title, body, link, urgent flag.
3. **Channels:** push (ntfy + web push) and email on by default; SMS off by default with the cost estimate + confirmation (from the first part).
4. **Preview:** "This will reach 3 crew · 4 band · 212 fans (web push 180, email 100 today / 112 queued)", then **Send**, then per-channel results.
5. **History:** a list of past alerts with audience, channels and counts.

Panel titles: "Send Alert", "Crew & Band Groups", "Fan Proximity Alerts". Remove "SMS" from the titles.

## Rules
- Privacy: an audience never sees another audience's recipients, topics or messages. Planners only ever see their own event.
- Access: only admins (and whichever role currently may send crew alerts) can send. Check this on the server, not just in the UI.
- Keep the existing rate limits, CAN-SPAM unsubscribe for fan email, and the Twilio code (opt-in only).

## Verification (add to the checks above)
- Send one test alert to each audience with free channels only, and confirm each person gets it and nobody outside the audience does.
- Change a test booking's status → only that planner gets the push and email.
- A crew member with quiet hours on still gets an **urgent** alert; a fan with quiet hours doesn't get a non-urgent one until the quiet hours end.
- `NOTIFICATIONS_SETUP.md` gets a short "How to get alerts" section for each audience.
