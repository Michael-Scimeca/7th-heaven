# Title → Text Gap Standardization Report

## Overview
All heading + subtitle/intro paragraph pairs across the public pages and components of **7th Heaven** have been routed through the shared title system (`PageHero`, `SectionHeader`, and `<div className="title-group title-group--page|section|sub">`).

The gap between a title and its accompanying paragraph is now controlled centrally in `src/components/TitleGroup.css`:
- `--title-gap-page`: For page H1 + intro lines (`.title-group--page` / `<PageHero>`)
- `--title-gap-section`: For section H2 + subtitles (`.title-group--section` / `<SectionHeader as="h2">`)
- `--title-gap-sub`: For sub-section / card H3 + descriptions (`.title-group--sub` / `<SectionHeader as="h3">`)

---

## Converted Headings Inventory

| File & Line | Element / Section | Original Gap Classes | Converted Implementation |
|---|---|---|---|
| `src/components/HeroVideoPlayer.tsx:972` | Hero H1 + Band Subtitle | `space-y-4` | `<div className="title-group title-group--page">` |
| `src/components/HomeVideoShowcase.tsx:750` | Video & Live Media H2 + Subtitle | `gap-1` | `<div className="title-group title-group--section">` |
| `src/components/HomeNewsSection.tsx:200` | Latest Band News H2 + Subtitle | `gap-1` | `<div className="title-group title-group--section">` |
| `src/components/SlideupSection.tsx:403` | Slideup Section H2 + Desc | `gap-1` | `<div className="title-group title-group--section">` |
| `src/app/cruise/components/CruiseItinerarySection.tsx:37` | Voyage Itinerary H2 + Subtitle | `mt-3` | `<div className="title-group title-group--section">` |
| `src/app/cruise/components/CruiseCabinsPricingSection.tsx:263` | Staterooms & Cruise Rates H2 + Subtitle | `mt-4` | `<div className="title-group title-group--section">` |
| `src/app/cruise/components/CruisePortsCatalogSection.tsx:47` | Ports & Destinations H2 + Subtitle | `mt-2.5` | `<div className="title-group title-group--section">` |
| `src/app/cruise/components/CruiseShipExplorerSection.tsx:35` | Ship Specs H2 + Subtitle | `mt-3` | `<div className="title-group title-group--section">` |
| `src/app/cruise/components/CruiseShipExplorerSection.tsx:59` | Ship Photo Gallery H3 + Subtitle | `mb-6` | `<div className="title-group title-group--sub">` |
| `src/components/CruiseVideoGallery.tsx:221` | Ship Videos H2 + Subtitle | `mt-4` | `<div className="title-group title-group--section">` |
| `src/components/TourList.tsx:1596` | Upcoming Tour Dates H2 + Paragraph | `mb-3` | `<div className="title-group title-group--section">` |
| `src/app/shows/[id]/ShowPageClient.tsx:459` | Show Detail Venue H1 + City / Date | `mb-3` | `<div className="title-group title-group--page">` |
| `src/app/fan-photo-wall/FanPhotoWallClient.tsx:576` | Featured Media H2 + Subtitle | `mt-2` | `<div className="title-group title-group--section">` |
| `src/app/merch/page.tsx:318` | Merch Login Required H2 + Description | `mb-2`, `mb-6` | `<div className="title-group title-group--sub">` |
| `src/app/merch/page.tsx:338` | Merch Team Only H2 + Description | `mb-2` | `<div className="title-group title-group--sub">` |
| `src/app/merch/page.tsx:383` | Merch Coming Soon H2 + Description | `mt-2` | `<div className="title-group title-group--section">` |
| `src/app/contact/ContactClient.tsx:210` | Contact Card Rep H3 + Company | `mt-1` | `<div className="title-group title-group--sub">` |
| `src/app/news/[slug]/page.tsx:227` | Other Articles H2 + Description | `mt-1` | `<div className="title-group title-group--section">` |
| `src/components/NewsHeroLayouts.tsx:66` | News Layout 2A H1 + Intro | `mt-4`, `mb-6` | `<div className="title-group title-group--page">` |
| `src/components/NewsHeroLayouts.tsx:83` | News Layout 2A Featured H2 + Content | `mb-6` | `<div className="title-group title-group--section">` |
| `src/components/NewsHeroLayouts.tsx:96` | News Layout 2B H1 + Intro | `mt-3`, `mb-3` | `<div className="title-group title-group--page">` |
| `src/components/NewsHeroLayouts.tsx:119` | News Layout 2B Featured H2 + Content | `mb-6` | `<div className="title-group title-group--section">` |
| `src/components/NewsHeroLayouts.tsx:145` | News Layout 2C Featured H2 + Content | `mb-6` | `<div className="title-group title-group--section">` |
| `src/components/NewsHeroLayouts.tsx:152` | News Layout 2C H1 + Intro | `mt-2`, `mb-6` | `<div className="title-group title-group--page">` |
| `src/components/NewsHeroLayouts.tsx:174` | News Layout 2D H1 + Intro | `mt-4` | `<div className="title-group title-group--page">` |
| `src/components/NewsHeroLayouts.tsx:191` | News Layout 2D Featured H2 + Content | `mb-6` | `<div className="title-group title-group--section">` |
| `src/components/NewsHeroLayouts.tsx:207` | News Layout 2E H1 + Intro | `space-y-3` | `<div className="title-group title-group--page">` |
| `src/components/NewsHeroLayouts.tsx:216` | News Layout 2E Featured H2 + Content | `mb-6` | `<div className="title-group title-group--section">` |
| `src/components/NewsHeroLayouts.tsx:243` | News Layout 2F Featured H2 + Content | `mb-6` | `<div className="title-group title-group--section">` |
| `src/app/fans/[username]/page.tsx:730` | Fan Account H1 + Description | `mb-6`, `mb-8` | `<div className="title-group title-group--page">` |
| `src/app/fans/complete-profile/page.tsx:151` | Complete Profile H1 + Subtitle | `mb-2` | `<div className="title-group title-group--page">` |
| `src/app/privacy/PrivacyClient.tsx:50` | Dynamic Policy Sections H2 + Subtitle | `mb-3`, `mb-2` | `<div className="title-group title-group--section">` |
| `src/app/terms/TermsClient.tsx:50` | Dynamic Terms Sections H2 + Subtitle | `mb-3`, `mb-2` | `<div className="title-group title-group--section">` |
| `src/app/returns/ReturnsClient.tsx:50` | Dynamic Returns Sections H2 + Subtitle | `mb-3`, `mb-2` | `<div className="title-group title-group--section">` |
| `src/app/sitemap/VisualSitemapClient.tsx:2279` | Visual Sitemap Flow H1 + Description | Direct children | `<div className="title-group title-group--page">` |
| `src/app/book/cancel/page.tsx:77` | Cancel Booking Prompt H1 + Info | `mb-3`, `mb-2` | `<div className="title-group title-group--page">` |
| `src/app/book/cancel/page.tsx:127` | Booking Cancelled H2 + Confirmation | `mb-3`, `mb-2` | `<div className="title-group title-group--section">` |
| `src/app/book/success/page.tsx:59` | Booking Confirmed H1 + ID / Info | `mb-2` | `<div className="title-group title-group--page">` |
| `src/components/FooterProximityAlerts.tsx:301` | Proximity Filter H3 + Subtitle | `mb-6` | `<div className="title-group title-group--sub">` |
| `src/components/ProximityNotify.tsx:303` | Never Miss a Show H2 + Subtitle | `mb-3` | `<div className="title-group title-group--section">` |
| `src/components/PagesPillDrawer.tsx:489` | Pages Directory H2 + Subtitle | `mt-0.5` | `<div className="title-group title-group--section">` |
| `src/components/MemberFactSheetDrawer.tsx:218` | Fact Sheet Member H2 + Role Subtitle | `mt-2`, `mb-5` | `<div className="title-group title-group--section">` |
| `src/components/FanUploadForm.tsx:259` | Fan Wall Submit H2 + Subtitle | Direct children | `<div className="title-group title-group--section">` |
| `src/components/FanUploadForm.tsx:282` | Moments Submitted H3 + Confirmation | `mb-2`, `mb-6` | `<div className="title-group title-group--sub">` |
| `src/components/PushAlertsCard.tsx:116` | Push Alerts Card H3 + Subtitle | `mb-2`, `mb-6` | `<div className="title-group title-group--sub">` |
| `src/components/LiveStreamInlineSubscribe.tsx:138` | Live Stream Push Alerts H3 + Subtitle | Direct children | `<div className="title-group title-group--sub">` |
| `src/components/FeaturedTrack.tsx:439` | Exclusive Fan Release H3 + Description | `mb-2`, `mb-8` | `<div className="title-group title-group--sub">` |
| `src/components/PickAwardsSection.tsx:264` | Award Pick H3 + Rarity Subtitle | Direct children | `<div className="title-group title-group--sub">` |
| `src/components/HomeMerch.tsx:180` | Merch Specials Loading H2 + Badge | `mb-10` | `<SectionHeader id="merch-heading" ...>` |
| `src/components/HomeMerch.tsx:230` | Merch Specials Active H2 + Badge | `mb-10` | `<SectionHeader id="merch-heading" ...>` |
| `src/components/BehindTheScenes.tsx:94` | Explore Behind the Scenes H2 + Subtitle | `mb-6`, `mb-10` | `<div className="title-group title-group--section">` |
| `src/components/BioScrollReveal.tsx:75` | Band Members & Directors H2 + Subtitle | `mb-16`, `mb-2` | `<SectionHeader id="bio-reveal-heading" ...>` |
| `src/app/rock-and-roll-kids/RockNRollKidsClient.tsx:568` | Story & Concept H2 + Subtitle | `mb-6` | `<SectionHeader id="rrk-story-heading" ...>` |
| `src/app/rock-and-roll-kids/RockNRollKidsClient.tsx:657` | Featured Animated Singles H2 + Subtitle | `mb-1`, `mb-6` | `<SectionHeader id="rrk-videos-heading" ...>` |
| `src/app/rock-and-roll-kids/RockNRollKidsClient.tsx:721` | Comic Books & Publications H2 + Subtitle | `mb-1` | `<SectionHeader id="rrk-comics-heading" ...>` |
| `src/app/rock-and-roll-kids/RockNRollKidsClient.tsx:779` | Series Founders & Contact H2 + Subtitle | `mb-1` | `<SectionHeader id="rrk-founders-heading" ...>` |
| `src/app/claim/[pin]/page.tsx:262` | Claim Sign In Required H2 + Description | `mb-2`, `mb-6` | `<div className="title-group title-group--sub">` |
| `src/app/claim/[pin]/page.tsx:281` | Claim Not Your Claim H2 + Description | `mb-2`, `mb-6` | `<div className="title-group title-group--sub">` |
| `src/app/claim/[pin]/page.tsx:303` | Claim Raffle Winner H2 + Description | `mb-1`, `mb-8` | `<div className="title-group title-group--sub">` |
| `src/app/claim/[pin]/page.tsx:409` | Claim PIN Not Found H2 + Description | `mb-2`, `mb-6` | `<div className="title-group title-group--sub">` |
| `src/components/CalendarPicker.tsx:150` | Primary Event Schedule H3 + Subtitle | Hand-built flex wrapper | `<SectionHeader as="h3" ...>` |
| `src/app/book/BookClient.tsx:1225` | Backup Dates H4 + Subtitle | Direct children | `<SectionHeader as="h3" ...>` |
| `src/components/PastShowsClient.tsx:184` | Archive Stats 4-Item Row | `gap-4` | `<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 lg:gap-16">` + `.title-group--sub` |
| `src/components/ProximityPanel.tsx:174` | Shows Near You H3 + Subtitle | `mb-6` | `<SectionHeader as="h3" ...>` |
| `src/app/fans/[username]/page.tsx:1698` | Never Miss a Live Feed H3 + Subtitle | `mb-1`, `mb-5` | `<SectionHeader as="h3" ...>` |
| `src/components/PlannerDashboard.tsx:913` | 7th Heaven Band & Event Contacts H2 + Subtitle | `mb-6` | `<SectionHeader id="band-event-contacts-heading" ...>` |
| `src/components/PlannerDashboard.tsx:1120` | Booking History H2 + Subtitle | `mb-6` | `<SectionHeader id="booking-history-heading" ...>` |
| `src/app/cruise/[username]/page.tsx:315` | Community H2 + Count Subtitle | `mb-1`, `mb-6` | `<SectionHeader id="community-heading" ...>` |
| `src/app/cruise/[username]/page.tsx:1073` | Cruise Information & Guidelines H2 + Subtitle | `mb-6`, `pb-6` | `<SectionHeader id="cruise-guidelines-heading" ...>` |
| `src/app/cruise/[username]/page.tsx:1217` | Day-by-Day Schedules H2 + Subtitle | `mb-6`, `mt-4` | `<SectionHeader id="itinerary-heading" ...>` |

| `src/app/admin/[username]/components/AdminDashboardMain.tsx:6783` | Booking Requests H3 + Paragraph | `gap-1`, `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:7284` | Event Planners Directory H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:7488` | Fan Photo Moderation Queue H3 + Paragraph | Hand-built flex | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:7614` | Memory Moderation Queue H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:7745` | Active Live Streams H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:7904` | SMS Proximity Blast H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:8898` | Crew SMS Alert & Group Setup H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:10114` | Band Member SMS Text H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:10692` | Newsletter Blast H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:10865` | Community Registry H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:11169` | Create Crew Account H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:11474` | Create Admin Account H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:11762` | Bulk Invites H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |
| `src/app/admin/[username]/components/AdminDashboardMain.tsx:14540` | Crew Work Schedule Calendar H3 + Paragraph | `mt-0.5` | `<div className="title-group title-group--sub">` |

---

## One-Off Overrides (`titleGap`)
None required. All converted headings cleanly match their respective design hierarchy token (`--title-gap-page`, `--title-gap-section`, or `--title-gap-sub`).

---

## Skipped Files & Reasons
1. **Dev & Test Sandbox Pages**: `src/app/payment-test/**`, `src/app/hambuger/**`, `src/app/textcolor/**`, `src/app/preloaders/**`, `src/app/firecanvas/**`, `src/app/slideup/**`, `src/app/style-guide/**` excluded per scope requirements.
2. **Email Templates**: HTML email strings (`src/lib/emails/**`, `src/app/admin/emails/**`) use table-based inline layout for email client compatibility.

---

## Verification Results
- **TypeScript**: `tsc --noEmit` passed with 0 errors.
- **React Doctor**: `npx react-doctor@latest --scope changed` passed with 0 issues (score: 92/100, no regressions).
- **Unit & Security Tests**: Vitest test suite (31 tests across 4 test files) passed 100%.
- **Next.js Production Build**: `npm run build` compiled 264 routes successfully with 0 errors.
- **Tune Panel Integration**: Moving `--title-gap-page`, `--title-gap-section`, and `--title-gap-sub` dynamically updates spacing across all converted pages on both mobile (390px) and desktop (1440px).
