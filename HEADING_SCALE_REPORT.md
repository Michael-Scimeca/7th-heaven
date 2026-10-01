# Heading Scale & Responsive Typography Unification Report

**Date**: September 30, 2026  
**Project**: 7th Heaven Web Application (`7th-heaven`)  
**Scope**: Unified Fluid Type Scale across all `<h1>`–`<h6>` elements in `src/**/*.tsx`  
**Status**: Completed & Verified  

---

## 1. Executive Summary

- **Core Rule**: *"The tag says what it is; the class says how big it looks."*
- **Scale Definition**: Unified fluid type scale tokens defined once in Tailwind v4 `@theme` in [`src/app/globals.css`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/globals.css), supporting responsive variants (e.g. `md:text-h2`, `lg:text-display`).
- **Headings Converted**: All **597 headings** across **124 modified TSX files** now use exactly one standard responsive size class (`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-h4`, `text-h5`, `text-h6`).
- **Base Styles Consolidated**: Three conflicting unlayered and layered base heading CSS blocks in `globals.css` were consolidated into a single clean base rule with fluid fallbacks:
  ```css
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-text-primary);
    margin: 0;
    text-wrap: balance;
  }
  ```
- **Automated Validation**: Added [`scripts/check-heading-classes.mjs`](file:///Users/michaelscimeca/Desktop/7thHeaven/scripts/check-heading-classes.mjs) (`npm run check-headings`), integrated into `npm run check-all`. Current violation count: **0**.
- **React Doctor Score**: Maintained at **100 / 100 Great** with 0 errors and 0 warnings.
- **Test Suite**: All 31 vitest tests pass.

---

## 2. Final Fluid Type Scale Specification Table

The fluid scale is defined directly in `@theme` in `src/app/globals.css`:

| Level / Token | Tailwind Class | Min Size (360px Viewport) | Max Size (1440px Viewport) | Font Weight | Line Height | Letter Spacing | Typical Semantic Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`display`** | `.text-display` | `44px` (`2.75rem`) | `88px` (`5.50rem`) | `900` | `0.95` | `-0.04em` | Main landing hero titles, massive display banners |
| **`h1`** | `.text-h1` | `36px` (`2.25rem`) | `64px` (`4.00rem`) | `900` | `1.05` | `-0.03em` | Primary page titles, hero headers (`PageHero`) |
| **`h2`** | `.text-h2` | `28px` (`1.75rem`) | `48px` (`3.00rem`) | `800` | `1.15` | `-0.02em` | Section headers (`SectionHeader`), major banners |
| **`h3`** | `.text-h3` | `21.6px` (`1.35rem`) | `36px` (`2.25rem`) | `700` | `1.20` | `-0.01em` | Sub-sections, card groups, drawers, modals |
| **`h4`** | `.text-h4` | `18.4px` (`1.15rem`) | `28px` (`1.75rem`) | `700` | `1.25` | `0.00em` | Card titles, panel titles, contact names, show venues |
| **`h5`** | `.text-h5` | `16.0px` (`1.00rem`) | `21.6px` (`1.35rem`) | `600` | `1.30` | `0.00em` | Compact card titles, item headers, cabin types |
| **`h6`** | `.text-h6` | `15.2px` (`0.95rem`) | `18.4px` (`1.15rem`) | `600` | `1.30` | `0.00em` | Dashboard badges, table headers, metric subtitles |

*Scale note: Maintained existing approved fluid token clamp formulas (`--font-size-display`, `--font-size-h1`..`--font-size-h6`) so rendered sizes remain smooth and consistent across screen sizes.*

---

## 3. Converted Headings Count by Area & File

Total TSX files scanned: **281** | Total headings converted: **597**

### A. Shared & Layout Components (`src/components/`)
- [`src/components/PageHero.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/PageHero.tsx) (2 headings) — Added `size` prop support (`display | h1 | h2 | h3 | h4 | h5 | h6`), removed competing `font-black tracking-tight`.
- [`src/components/SectionHeader.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/SectionHeader.tsx) (2 headings) — Added `size` prop support, removed competing `tracking-tight`.
- [`src/components/ui/ModalDialog.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/ui/ModalDialog.tsx) (1 heading) — Converted to `text-h3`.
- [`src/components/BioParallaxSlider.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/BioParallaxSlider.tsx) (10 headings) — Standardized band member name cards to `text-h3`.
- [`src/components/AccomplishmentsLayouts.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/AccomplishmentsLayouts.tsx) (21 headings) — Standardized achievement titles to `text-h2` / `text-h3` / `text-h4`.
- [`src/components/AudioPlayer.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/AudioPlayer.tsx) (5 headings) — Standardized album and playlist titles to `text-h3` / `text-h4`.
- [`src/components/BehindTheScenes.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/BehindTheScenes.tsx) (2 headings) — Converted to `text-h2` / `text-h3`.
- [`src/components/BioScrollReveal.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/BioScrollReveal.tsx) (2 headings) — Converted to `text-h2` / `text-h3`.
- [`src/components/CalendarPicker.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CalendarPicker.tsx) (2 headings) — Converted to `text-h4`.
- [`src/components/CookieConsentBanner.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CookieConsentBanner.tsx) (1 heading) — Converted to `text-h5`.
- [`src/components/CosmicTrackCard.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CosmicTrackCard.tsx) (1 heading) — Track card title converted to `text-h4`.
- [`src/components/FakeLiveStream/index.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/FakeLiveStream/index.tsx) (10 headings) — Converted stream headers and modal titles.
- [`src/components/FakeLiveStream/RaffleClaimModal.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/FakeLiveStream/RaffleClaimModal.tsx) (3 headings) — Converted to `text-h3` / `text-h4`.
- [`src/components/FanUploadForm.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/FanUploadForm.tsx) (2 headings) — Converted to `text-h2` / `text-h3`.
- [`src/components/FeaturedTrack.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/FeaturedTrack.tsx) (3 headings) — Converted to `text-h3` / `text-h4`.
- [`src/components/FooterProximityAlerts.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/FooterProximityAlerts.tsx) (1 heading) — Converted to `text-h4`.
- [`src/components/HeaderMaskEditor.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HeaderMaskEditor.tsx) (1 heading) — Converted to `text-h3`.
- [`src/components/HeroAlbumPlayer.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HeroAlbumPlayer.tsx) (1 heading) — Converted to `text-h3`.
- [`src/components/HeroLiveHub.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HeroLiveHub.tsx) (1 heading) — Converted to `text-h2`.
- [`src/components/HeroUpNextBanner.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HeroUpNextBanner.tsx) (2 headings) — Converted to `text-h2` / `text-h3`.
- [`src/components/HeroUpcomingShows.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HeroUpcomingShows.tsx) (1 heading) — Converted to `text-h2`.
- [`src/components/HeroVideoPlayer.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HeroVideoPlayer.tsx) (1 heading) — Main hero title converted to `text-display`.
- [`src/components/HomeLogosSection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HomeLogosSection.tsx) (1 heading) — Screen-reader heading converted to `text-h2 sr-only`.
- [`src/components/HomeMerch.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HomeMerch.tsx) (1 heading) — Product title converted to `text-h4`.
- [`src/components/HomeNewsSection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HomeNewsSection.tsx) (5 headings) — Section title to `text-h2`, news cards to `text-h3` / `text-h4`.
- [`src/components/HomeVideoShowcase.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/HomeVideoShowcase.tsx) (3 headings) — Section title to `text-h2`, video card titles to `text-h3`.
- [`src/components/InputStyleEditor.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/InputStyleEditor.tsx) (11 headings) — Panel titles to `text-h1` / `text-h3` / `text-h4`.
- [`src/components/InstallAppButton.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/InstallAppButton.tsx) (2 headings) — Prompt titles to `text-h4` / `text-h5`.
- [`src/components/LiveStreamInlineSubscribe.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/LiveStreamInlineSubscribe.tsx) (2 headings) — Converted to `text-h3` / `text-h4`.
- [`src/components/LoginModal.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/LoginModal.tsx) (2 headings) — Converted to `text-h2` / `text-h3`.
- [`src/components/MemberDashboard.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/MemberDashboard.tsx) (4 headings) — Converted to `text-h1` / `text-h4`.
- [`src/components/MemberFactSheetDrawer.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/MemberFactSheetDrawer.tsx) (5 headings) — Drawer headings to `text-h2` / `text-h3`.
- [`src/components/NewsHeroLayouts.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/NewsHeroLayouts.tsx) (12 headings) — Hero variants to `text-h1` / `text-h2`.
- [`src/components/PageNav.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/PageNav.tsx) (2 headings) — Navigation headers to `text-h3` / `text-h4`.
- [`src/components/PagesPillDrawer.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/PagesPillDrawer.tsx) (2 headings) — Drawer headers to `text-h2` / `text-h3`.
- [`src/components/PastShowsClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/PastShowsClient.tsx) (2 headings) — Year / show titles to `text-h2` / `text-h3`.
- [`src/components/PickAwardsSection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/PickAwardsSection.tsx) (4 headings) — Award headers to `text-h2` / `text-h3` / `text-h4`.
- [`src/components/ProfilePhotoUploader.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/ProfilePhotoUploader.tsx) (1 heading) — Converted to `text-h4`.
- [`src/components/ProximityNotify.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/ProximityNotify.tsx) (1 heading) — Converted to `text-h2`.
- [`src/components/PushAlertsCard.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/PushAlertsCard.tsx) (1 heading) — Card title to `text-h4`.
- [`src/components/PushSubscribeModal.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/PushSubscribeModal.tsx) (2 headings) — Modal titles to `text-h3`.
- [`src/components/SlideupSection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/SlideupSection.tsx) (4 headings) — Slide titles to `text-h1` / `text-h2` / `text-h3`.
- [`src/components/StickyNotesOverlay.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/StickyNotesOverlay.tsx) (1 heading) — Converted to `text-h4`.
- [`src/components/TourList.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/TourList.tsx) (5 headings) — Venue and tour section headers to `text-h2` / `text-h3` / `text-h4`.
- [`src/components/UserFlowMap.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/UserFlowMap.tsx) (5 headings) — Flow headers to `text-h2` / `text-h3` / `text-h4`.
- [`src/components/VideoSection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/VideoSection.tsx) (4 headings) — Video section and video item titles to `text-h2` / `text-h3`.

### B. Public Pages (`src/app/`)
- [`src/app/contact/ContactClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/contact/ContactClient.tsx) (2 headings) — Standardized contact personnel titles to `text-h3`.
- [`src/app/media/MediaClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/media/MediaClient.tsx) (1 heading) — Converted to `text-h2`.
- [`src/app/merch/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/merch/page.tsx) (3 headings) — Merch category headers to `text-h2`.
- [`src/app/faq/FaqClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/faq/FaqClient.tsx) (2 headings) — FAQ category headers to `text-h2` / `text-h3`.
- [`src/app/fans/[username]/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/fans/[username]/page.tsx) (10 headings) — Fan profile tabs and section titles to `text-h1` / `text-h2` / `text-h3`.
- [`src/app/fans/complete-profile/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/fans/complete-profile/page.tsx) (1 heading) — Converted to `text-h2`.
- [`src/app/features/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/features/page.tsx) (5 headings) — Feature category headers to `text-h2`.
- [`src/app/features/components/FeatureCardUI.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/features/components/FeatureCardUI.tsx) (2 headings) — Feature item titles to `text-h4`.
- [`src/app/rock-and-roll-kids/RockNRollKidsClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/rock-and-roll-kids/RockNRollKidsClient.tsx) (4 headings) — RRK program headers to `text-h2` / `text-h3`.
- [`src/app/privacy/PrivacyClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/privacy/PrivacyClient.tsx) (13 headings) — Legal sections to `text-h2` / `text-h3`.
- [`src/app/terms/TermsClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/terms/TermsClient.tsx) (14 headings) — Terms sections to `text-h2` / `text-h3`.
- [`src/app/returns/ReturnsClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/returns/ReturnsClient.tsx) (6 headings) — Return policy headers to `text-h2` / `text-h3`.
- [`src/app/claim/[pin]/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/claim/[pin]/page.tsx) (5 headings) — Claim flow headers to `text-h1` / `text-h2` / `text-h3`.
- [`src/app/qr/merch/MerchQRClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/qr/merch/MerchQRClient.tsx) (7 headings) — QR portal headers to `text-h2` / `text-h3`.
- [`src/app/shows/[id]/ShowPageClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/shows/[id]/ShowPageClient.tsx) (3 headings) — Individual show headers to `text-h2` / `text-h3`.
- [`src/app/news/[slug]/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/news/[slug]/page.tsx) (3 headings) — Article headers to `text-h1` / `text-h2`.

### C. Cruise Experience (`src/app/cruise/` & `src/components/Cruise*`)
- [`src/app/cruise/CruiseClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/CruiseClient.tsx) (2 headings)
- [`src/app/cruise/[username]/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/[username]/page.tsx) (4 headings)
- [`src/app/cruise/cancel/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/cancel/page.tsx) (4 headings)
- [`src/app/cruise/components/CruiseCabinsPricingSection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/components/CruiseCabinsPricingSection.tsx) (14 headings) — Stateroom category titles (`text-h3`) and cabin class titles (`text-h4`).
- [`src/app/cruise/components/CruiseHeroSection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/components/CruiseHeroSection.tsx) (1 heading) — Hero title (`text-display`).
- [`src/app/cruise/components/CruiseHistorySection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/components/CruiseHistorySection.tsx) (1 heading)
- [`src/app/cruise/components/CruiseItinerarySection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/components/CruiseItinerarySection.tsx) (1 heading)
- [`src/app/cruise/components/CruisePortsCatalogSection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/components/CruisePortsCatalogSection.tsx) (6 headings) — Port destination titles (`text-h3`).
- [`src/app/cruise/components/CruiseShipExplorerSection.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/components/CruiseShipExplorerSection.tsx) (4 headings) — Deck and amenity headers (`text-h3`).
- [`src/app/cruise/dashboard/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/dashboard/page.tsx) (3 headings)
- [`src/app/cruise/preview/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/preview/page.tsx) (3 headings)
- [`src/app/cruise/verify/CruiseVerifyClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/cruise/verify/CruiseVerifyClient.tsx) (1 heading)
- [`src/components/CruiseChat.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CruiseChat.tsx) (6 headings)
- [`src/components/CruiseHeroMaskEditor.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CruiseHeroMaskEditor.tsx) (1 heading)
- [`src/components/CruiseHistoryTimeline.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CruiseHistoryTimeline.tsx) (3 headings)
- [`src/components/CruiseSnakeItinerary.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CruiseSnakeItinerary.tsx) (4 headings)
- [`src/components/CruiseVideoGallery.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CruiseVideoGallery.tsx) (2 headings)
- [`src/components/CruiseWidgets.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CruiseWidgets.tsx) (12 headings)

### D. Booking Portal (`src/app/book/`)
- [`src/app/book/BookClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/book/BookClient.tsx) (5 headings) — Multi-step booking form headings (`text-h2` / `text-h3`).
- [`src/app/book/cancel/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/book/cancel/page.tsx) (5 headings)
- [`src/app/book/success/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/book/success/page.tsx) (1 heading)

### E. Admin Dashboard (`src/app/admin/`)
- [`src/app/admin/[username]/components/AdminDashboardMain.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/[username]/components/AdminDashboardMain.tsx) (56 headings) — Carefully updated heading class strings in the 800KB file without touching surrounding logic.
- [`src/app/admin/[username]/components/AdminSectionCrewSchedule.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/[username]/components/AdminSectionCrewSchedule.tsx) (11 headings)
- [`src/app/admin/[username]/components/AdminAuthGate.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/[username]/components/AdminAuthGate.tsx) (1 heading)
- [`src/app/admin/[username]/components/FooterProximityAlerts.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/[username]/components/FooterProximityAlerts.tsx) (1 heading)
- [`src/app/admin/email-map/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/email-map/page.tsx) (3 headings)
- [`src/app/admin/emails/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/emails/page.tsx) (2 headings)
- [`src/app/admin/legal/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/legal/page.tsx) (5 headings)
- [`src/app/admin/shop-inventory/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/shop-inventory/page.tsx) (7 headings)
- [`src/components/admin/InviteChallengePanel.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/admin/InviteChallengePanel.tsx) (1 heading)
- [`src/components/admin/ReferralProgramPanel.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/admin/ReferralProgramPanel.tsx) (1 heading)

### F. Crew Dashboard (`src/app/crew/` & `src/components/Crew*`)
- [`src/components/CrewDashboard/index.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CrewDashboard/index.tsx) (19 headings) — Tab panels and widget headings to `text-h3` / `text-h4`.
- [`src/app/crew/verify/CrewVerifyClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/crew/verify/CrewVerifyClient.tsx) (4 headings)
- [`src/components/CrewHQ.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CrewHQ.tsx) (4 headings)
- [`src/components/CrewFeed.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CrewFeed.tsx) (1 heading)
- [`src/components/CrewSetPasswordModal.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/CrewSetPasswordModal.tsx) (1 heading)

### G. Planner Portal (`src/app/planner/`)
- [`src/app/planner/PlannerClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/planner/PlannerClient.tsx) (9 headings)
- [`src/app/planner/verify/PlannerVerifyClient.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/planner/verify/PlannerVerifyClient.tsx) (1 heading)
- [`src/components/PlannerDashboard.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/PlannerDashboard.tsx) (8 headings)

### H. Style Guide & Dev Tuner
- [`src/app/style-guide/page.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/app/style-guide/page.tsx) (91 headings) — Added full "Unified Fluid Heading Hierarchy Scale" specimen table and live specimen cards.
- [`src/components/BlurTuner.tsx`](file:///Users/michaelscimeca/Desktop/7thHeaven/src/components/BlurTuner.tsx) — Added H1–H6 max size sliders live-editing `--font-size-h*` with CSS export.

---

## 4. Intentional Size Harmonizations

Before this refactor, identical UI card and section titles across different pages had inconsistent arbitrary font sizes. The following harmonizations were made:

| UI Element / Context | Before | After | Rationale |
| :--- | :--- | :--- | :--- |
| **Contact Personnel Names** (`ContactClient.tsx`) | `text-2xl sm:text-3xl font-black` | `text-h3` (21.6px → 36px) | Harmonized with card group hierarchy across the site |
| **Stateroom Class Cards** (`CruiseCabinsPricingSection.tsx`) | `text-xl md:text-2xl font-bold` | `text-h4` (18.4px → 28px) | Consistent with standard card title size |
| **News Cards** (`HomeNewsSection.tsx`) | `text-xl font-bold` | `text-h4` (18.4px → 28px) | Unified with news list layouts |
| **Tour List Venue Names** (`TourList.tsx`) | `text-lg sm:text-xl font-bold` | `text-h4` (18.4px → 28px) | Unified with upcoming shows cards |
| **Admin Metric Widgets** (`AdminDashboardMain.tsx`) | `text-sm font-semibold` | `text-h6` (15.2px → 18.4px) | Unified with dashboard micro-labels |
| **Modal Titles** (`ModalDialog.tsx`, `LoginModal.tsx`) | `text-xl font-bold tracking-tight` | `text-h3` (21.6px → 36px) | Standard modal header scale |

---

## 5. Heading-Level Outline Issues Noted for Visitor Bugs Prompt

As per task instructions, the following structural outline issues (duplicate `<h1>`s and skipped levels) were documented without altering component tree architecture:
1. **Home (`/`)**: Renders `<h1>` in `HeroVideoPlayer.tsx` and an sr-only `<h1>` in `app/page.tsx`.
2. **Admin (`/admin`)**: Duplicate `<h1>` in `app/admin/page.tsx` (sr-only) and `AdminDashboardMain.tsx`.
3. **Planner (`/planner`)**: Multiple `<h1>` instances across `planner/page.tsx` and `PlannerClient.tsx`.
4. **Live Stream (`/live`)**: Skips `<h3>`, transitioning directly from `<h2>` (Live Stream Hub) to `<h4>` (Stream Chat & Controls) in `HeroLiveHub.tsx`.
5. **CosmicTrackCard**: Renders `<h4>` inside an `<h2>` section container without an intermediate `<h3>`.

---

## 6. Verification Results

- `node scripts/check-heading-classes.mjs`: **0 violations found across 281 files (597 headings validated)**.
- `npx react-doctor@latest --scope changed`: **100 / 100 Great (0 errors, 0 warnings)**.
- `npm run check-hover-transitions`: **0 violations (100% compliant)**.
- `npm run typecheck`: **Clean (0 TS errors)**.
- `npm run test`: **31/31 vitest tests passed**.
- `npm run build`: **Next.js 16 Turbo production build succeeded**.
