# 7th Heaven — Free Notifications & PWA Setup Guide

This guide details the complete configuration for zero-cost alerts and emails for **Fans, Crew, Band, and Event Planners**, as well as the installable **7th Heaven Progressive Web App (PWA)**.

---

## 1. Environment Variables

Add the following environment variables to your local `.env.local` and your Netlify / production hosting environment:

```env
# ── Supabase Database & Auth ──
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── Email Service (Resend Free Tier) ──
RESEND_API_KEY=re_123456789
EMAIL_FROM="7th Heaven <notifications@7thheavenband.com>"
# If sending from an unverified domain during testing, use onboarding fallback:
# EMAIL_FROM="7th Heaven <onboarding@resend.dev>"
EMAIL_DAILY_LIMIT=100
EMAIL_MONTHLY_LIMIT=3000

# ── Web Push Notifications (VAPID) ──
# Generated via `npx web-push generate-vapid-keys`
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BA0R-Cg3zpKyTmnWjOf3-Qci37ibBA7rY3BDqRZ-8JPkHezdQOU5fSx_p7__FUqG4Tf0znMa5LpoObodxLpOuxc
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_SUBJECT="mailto:notifications@7thheavenband.com"

# ── ntfy Free Open Push Network ──
NEXT_PUBLIC_NTFY_SERVER="https://ntfy.sh"
NEXT_PUBLIC_NTFY_TOPIC_FANS="7thheaven_fans"
NEXT_PUBLIC_NTFY_TOPIC_CRUISE="7thheaven_cruise"
# Private topics for internal teams (must remain secret)
NEXT_PUBLIC_NTFY_TOPIC_CREW="7thheaven_crew_priv_98x"
NEXT_PUBLIC_NTFY_TOPIC_BAND="7thheaven_band_priv_84z"

# ── Scheduled Tasks (Cron Drain) ──
CRON_SECRET=your_random_cron_auth_secret_here

# ── Emergency Fallback Paid SMS (Twilio) ──
TWILIO_ACCOUNT_SID=AC89f2a...
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER="+18887476257"
```

---

## 2. Database Migration

Run `supabase/migration_022_notifications_and_pwa.sql` on your Supabase project:
- **`push_subscribers`**: Multi-audience browser push tokens (`audience: 'fan' | 'crew' | 'band' | 'planner' | 'cruise'`), geo-radius, and quiet hours (`quiet_hours_start`, `quiet_hours_end`).
- **`email_quota_logs`**: Tracks daily and monthly sends to stay strictly within the 100/day and 3,000/month Resend free limit.
- **`email_queue`**: Stores overflow emails queued for daily automatic batch drains.
- **`notification_broadcast_logs`**: Comprehensive audit log of all multi-channel broadcast dispatches.
- **`profiles.is_band`**: Boolean flag to differentiate band members from crew members.

---

## 3. Scheduled Daily Queue Drain

To automatically drain queued emails that exceed the daily quota:
1. **Netlify Scheduled Functions**: `netlify/functions/drain-email-queue.mts` runs daily at `00:05 UTC` (`@daily`).
2. **Next.js Cron API**: `GET /api/cron/drain-email-queue` with header `Authorization: Bearer <CRON_SECRET>`.

---

## 4. DNS & Deliverability Best Practices

For optimal email delivery:
1. **SPF Record**: `v=spf1 include:amazonses.com include:_spf.resend.com ~all`
2. **DKIM**: Add CNAME records generated in your Resend Dashboard for `7thheavenband.com`.
3. **DMARC**: `v=DMARC1; p=none; rua=mailto:dmarc-reports@7thheavenband.com`
4. **List-Unsubscribe**: Built automatically into `src/lib/email.ts` per RFC 8058 for 1-click unsubscribe.

---

## 5. Audience Setup & Subscriptions

| Audience | Channels | Description |
| :--- | :--- | :--- |
| **Fans** | Public ntfy (`7thheaven_fans`) + Web Push + Email (Queue-aware) | Self-service subscription via `/notifications` or footer proximity alert form. |
| **Crew** | Private ntfy (`7thheaven_crew_priv_98x`) + Web Push + Priority Email + Optional SMS | Managed through Admin Dashboard `Crew & Band Groups` and Crew Dashboard. |
| **Band** | Private ntfy (`7thheaven_band_priv_84z`) + Web Push + Priority Email + Optional SMS | Managed through Admin Dashboard and `/notifications` band channel. |
| **Event Planners** | Dedicated Web Push (`audience: planner`) + Direct Email | Targeted strictly to individual bookings (`bookingId`); **no** shared ntfy topic. |

---

## 6. Progressive Web App (PWA) Installation

- **Android / Chrome / Desktop**: 1-click install via `InstallAppButton` using native `beforeinstallprompt`.
- **iOS Safari**: 2-step instructional modal guiding user to tap **Share ⎋** → **Add to Home Screen ➕**.
- **Offline Mode**: Precached `/offline` branded page and assets cached via `sw.js` (v2.1.0).
