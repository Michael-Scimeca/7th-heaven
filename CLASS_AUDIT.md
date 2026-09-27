# Class Audit — 7thHeaven

Generated from src/ using Tailwind v4's own class checker against src/app/globals.css (+ all src/**/*.css).
"Not real" = produces no CSS: not a Tailwind class and not defined in any CSS file.

## 1. Broken fragments (61 kinds) — left behind by earlier bulk scripts that stripped part of a class
Recover the original from git history (git log -S / git blame on the line) instead of guessing.
| Fragment | Uses | Where (first 3) |
|---|---|---|
| `hover:` | 43 | app/admin/[username]/components/AdminAuthGate.tsx:107, app/admin/[username]/components/AdminDashboardMain.tsx:9027, app/admin/[username]/components/AdminDashboardMain.tsx:9372 … |
| `placeholder:` | 57 | app/admin/[username]/components/AdminDashboardMain.tsx:812, app/admin/[username]/components/AdminDashboardMain.tsx:7138, app/admin/[username]/components/AdminDashboardMain.tsx:9275 … |
| `r` | 125 | app/admin/[username]/components/AdminDashboardMain.tsx:5315, app/admin/[username]/components/AdminDashboardMain.tsx:5730, app/admin/[username]/components/AdminDashboardMain.tsx:6653 … |
| `pr-` | 1 | app/admin/[username]/components/AdminDashboardMain.tsx:5783 |
| `/90` | 70 | app/admin/[username]/components/AdminDashboardMain.tsx:6566, app/admin/[username]/components/AdminDashboardMain.tsx:8185, app/admin/[username]/components/AdminDashboardMain.tsx:9925 … |
| `51,` | 6 | app/admin/[username]/components/AdminDashboardMain.tsx:6646, app/admin/[username]/components/AdminDashboardMain.tsx:14551, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2193 … |
| `group-hover:` | 26 | app/admin/[username]/components/AdminDashboardMain.tsx:6795, app/admin/[username]/components/AdminDashboardMain.tsx:13843, app/admin/[username]/components/AdminDashboardMain.tsx:13846 … |
| `dark:` | 16 | app/admin/[username]/components/AdminDashboardMain.tsx:7010, app/admin/[username]/components/AdminDashboardMain.tsx:7016, app/admin/[username]/components/AdminDashboardMain.tsx:7019 … |
| `!` | 43 | app/admin/[username]/components/AdminDashboardMain.tsx:7337, app/admin/[username]/components/AdminDashboardMain.tsx:7355, app/admin/[username]/components/FooterProximityAlerts.tsx:461 … |
| `md:` | 8 | app/admin/[username]/components/AdminDashboardMain.tsx:9010, app/admin/[username]/components/AdminDashboardMain.tsx:9027, components/CountdownTimer.tsx:114 … |
| `disabled:` | 6 | app/admin/[username]/components/AdminDashboardMain.tsx:9570, app/admin/[username]/components/AdminDashboardMain.tsx:9783, app/admin/[username]/components/AdminDashboardMain.tsx:10416 … |
| `-lg` | 1 | app/admin/[username]/components/AdminDashboardMain.tsx:9929 |
| `text-` | 5 | app/admin/[username]/components/AdminDashboardMain.tsx:10508, app/style-guide/page.tsx:2253, app/style-guide/page.tsx:2539 … |
| `drop-` | 11 | app/admin/[username]/components/AdminDashboardMain.tsx:13439, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:1024, components/BioParallaxSlider.tsx:2033 … |
| `/85` | 5 | app/admin/[username]/components/AdminDashboardMain.tsx:13614, app/admin/[username]/components/AdminDashboardMain.tsx:17449, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:1221 … |
| `/45` | 15 | app/admin/[username]/components/AdminDashboardMain.tsx:13645, app/admin/[username]/components/AdminDashboardMain.tsx:17359, app/admin/[username]/components/AdminDashboardMain.tsx:17442 … |
| `/80` | 8 | app/admin/[username]/components/AdminDashboardMain.tsx:14556, app/admin/[username]/components/AdminDashboardMain.tsx:15271, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2198 … |
| `/70` | 14 | app/admin/[username]/components/AdminDashboardMain.tsx:14929, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2575, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2968 … |
| `/35` | 5 | app/admin/[username]/components/AdminDashboardMain.tsx:15228, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2876, app/cruise/components/CruisePortsCatalogSection.tsx:294 … |
| `/95` | 3 | app/admin/[username]/components/AdminDashboardMain.tsx:15878, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:3551, components/FakeLiveStream/index.tsx:1685 |
| `selection:` | 3 | app/admin/[username]/components/AdminDashboardMain.tsx:17523, app/admin/legal/page.tsx:452, app/book/[username]/page.tsx:128 |
| `er` | 11 | app/admin/[username]/components/AdminDashboardMain.tsx:17979, app/not-found.tsx:13, app/not-found.tsx:21 … |
| `bg-` | 24 | app/admin/[username]/components/AdminSectionCrewSchedule.tsx:993, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2195, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2703 … |
| `purple-white/20` | 30 | app/admin/[username]/components/AdminSectionCrewSchedule.tsx:993, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2175, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2195 … |
| `.5` | 16 | app/admin/[username]/components/AdminSectionCrewSchedule.tsx:1169, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:3583, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:3921 … |
| `hover:bg-` | 6 | app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2175, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:2933, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:4201 … |
| `?` | 7 | app/admin/legal/page.tsx:521, app/style-guide/page.tsx:933, components/PlannerDashboard.tsx:1172 … |
| `:` | 2 | app/admin/legal/page.tsx:521, components/PlannerDashboard.tsx:1172 |
| `/40` | 4 | app/api/dev/planner-dashboard-preview/route.ts:74, app/api/dev/planner-dashboard-preview/route.ts:78, app/api/dev/planner-dashboard-preview/route.ts:82 … |
| `15` | 1 | app/book/BookClient.tsx:1263 |
| `132,` | 2 | app/claim/[pin]/page.tsx:291, app/claim/[pin]/page.tsx:362 |
| `sm:` | 30 | app/cruise/[username]/page.tsx:350, app/fans/[username]/page.tsx:1040, app/fans/[username]/page.tsx:1045 … |
| `[&_a]:` | 1 | app/cruise/[username]/page.tsx:1197 |
| `[&_p]:` | 1 | app/cruise/[username]/page.tsx:1197 |
| `[&_h1]:` | 1 | app/cruise/[username]/page.tsx:1197 |
| `[&_h2]:` | 1 | app/cruise/[username]/page.tsx:1197 |
| `[&_h3]:` | 1 | app/cruise/[username]/page.tsx:1197 |
| `[&_strong]:` | 1 | app/cruise/[username]/page.tsx:1197 |
| `[&_span]:` | 1 | app/cruise/[username]/page.tsx:1197 |
| `[&_li]:` | 1 | app/cruise/[username]/page.tsx:1197 |
| `[&_div]:` | 1 | app/cruise/[username]/page.tsx:1197 |
| `st` | 6 | app/cruise/components/CruiseCabinsPricingSection.tsx:861, app/fans/[username]/page.tsx:1027, app/fans/[username]/page.tsx:1081 … |
| `-` | 1 | app/cruise/components/CruisePortsCatalogSection.tsx:185 |
| `6` | 4 | app/cruise/components/CruisePortsCatalogSection.tsx:185, app/not-found.tsx:52, components/CruiseWidgets.tsx:204 … |
| `0` | 5 | app/fan-photo-wall/FanPhotoWallClient.tsx:452, app/notifications/page.tsx:339, app/planner/PlannerClient.tsx:392 … |
| `/15` | 10 | app/fan-photo-wall/FanPhotoWallClient.tsx:689, components/CrewHQ.tsx:1179, components/HomeMerch.tsx:314 … |
| `text-purple-400hover:` | 1 | app/payment/page.tsx:79 |
| `/50` | 1 | app/planner/PlannerClient.tsx:627 |
| `2` | 2 | app/preloaders/page.tsx:539, app/shows/[id]/ShowPageClient.tsx:723 |
| `not-` | 5 | app/privacy/PrivacyClient.tsx:309, app/style-guide/page.tsx:3883, app/style-guide/page.tsx:4047 … |
| `group-` | 6 | app/qr/merch/MerchQRClient.tsx:582, components/AccomplishmentsLayouts.tsx:432, components/CruiseVideoGallery.tsx:293 … |
| `[&::-webkit-slider-thumb]:` | 10 | app/style-guide/page.tsx:2036, app/style-guide/page.tsx:2074, app/style-guide/page.tsx:2113 … |
| `-400` | 1 | app/style-guide/page.tsx:5677 |
| `accent-` | 1 | app/style-guide/page.tsx:5688 |
| `-500` | 1 | app/style-guide/page.tsx:5688 |
| `]` | 2 | app/style-guide/page.tsx:6051, app/style-guide/page.tsx:6313 |
| `/65` | 1 | components/CosmicTrackCard.tsx:120 |
| `group-hover/item:` | 1 | components/CruiseWidgets.tsx:1157 |
| `Happening` | 1 | components/HeroUpcomingShows.tsx:206 |
| `Now` | 1 | components/HeroUpcomingShows.tsx:206 |
| `group-hover/venue:` | 1 | components/HeroUpcomingShows.tsx:234 |

## 2. Two classes glued together (missing space) — neither half works
| Token | Uses | Where |
|---|---|---|
| `hover:text-whitebg-black-80` | 1 | app/admin/[username]/components/AdminDashboardMain.tsx:158 |
| `hover:text-whitebg-red-600` | 1 | app/admin/[username]/components/AdminDashboardMain.tsx:179 |
| `text-purple-400shrink-0` | 7 | app/book/BookClient.tsx:2030, app/style-guide/page.tsx:6529, app/style-guide/page.tsx:6536 … |
| `bg-white/[0.04]backdrop-blur-xl` | 3 | app/payment/page.tsx:85, app/payment-test/checkout/page.tsx:99, app/payment-test/result/page.tsx:74 |
| `text-purple-400border` | 2 | app/qr/merch/MerchQRClient.tsx:474, components/AccomplishmentsLayouts.tsx:132 |
| `text-purple-400block` | 2 | app/qr/merch/MerchQRClient.tsx:496, components/NewsHeroLayouts.tsx:228 |
| `text-purple-400inline` | 1 | app/style-guide/page.tsx:6588 |
| `bg-[#14151f]/80backdrop-blur-xl` | 1 | app/style-guide/page.tsx:6742 |
| `bg-black/30backdrop-blur-xl` | 1 | app/style-guide/page.tsx:6799 |
| `border-white/10backdrop-blur-xl` | 3 | components/AccomplishmentsLayouts.tsx:102, components/AccomplishmentsLayouts.tsx:189, components/AccomplishmentsLayouts.tsx:291 |
| `border-white/8backdrop-blur-xl` | 1 | components/AccomplishmentsLayouts.tsx:370 |
| `pb-4flex-1` | 1 | components/CrewDashboard/index.tsx:4686 |
| `backdrop-blur-[16px` | 1 | components/CrewDashboard/index.tsx:4845 |
| `mb-2text-black` | 1 | components/CrewDashboard/index.tsx:5724 |
| `gap-3text-black` | 1 | components/CrewDashboard/index.tsx:5885 |
| `text-purple-400px-2` | 1 | components/CruiseChat.tsx:951 |
| `text-purple-400hover:text-red-400` | 1 | components/DevGuideLine.tsx:71 |
| `bg-[#090514]/95backdrop-blur-xl` | 1 | components/HeaderMaskEditor.tsx:93 |
| `bg-black/75backdrop-blur-xl` | 1 | components/HeroAlbumPlayer.tsx:88 |
| `bg-[#0c0817]/95backdrop-blur-xl` | 1 | components/InputStyleEditor.tsx:420 |
| `text-purple-400mb-2` | 1 | components/NewsHeroLayouts.tsx:171 |
| `bg-[#0c0915]/95backdrop-blur-xl` | 1 | components/StickyNotesOverlay.tsx:618 |
| `shadow-2xlbackdrop-blur-xl` | 2 | components/UserFlowMap.tsx:173, components/UserFlowMap.tsx:1621 |

## 3. Typos / invalid Tailwind
| Token | Uses | Where |
|---|---|---|
| `py-0.2` | 5 | app/admin/[username]/components/AdminDashboardMain.tsx:14278, app/admin/[username]/components/AdminDashboardMain.tsx:15619, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:1925 … |
| `rouned-lg` | 2 | app/admin/[username]/components/AdminDashboardMain.tsx:17995, components/admin/RoleEmailDirectory.tsx:465 |
| `justify-betweenr` | 1 | app/fans/[username]/page.tsx:1344 |
| `backdrop-blur-2xs` | 1 | app/fans/[username]/page.tsx:1542 |
| `cursor-pointe` | 1 | components/CrewDashboard/index.tsx:4774 |
| `bg=[#e1e6ff29]` | 1 | components/CruiseVideoGallery.tsx:249 |
| `transition-filter` | 1 | components/LogoTicker.tsx:136 |
| `group-hover:blur-0` | 1 | components/MemberDashboard.tsx:576 |
| `hover:white/20` | 1 | components/MemberFactSheetDrawer.tsx:204 |
| `whitespace-nowrap]` | 1 | components/TourList.tsx:1628 |
| `ld:gap-6` | 1 | components/TourList.tsx:1646 |
| `animate-all` | 1 | components/TourList.tsx:3275 |
| `select-none]` | 1 | components/admin/RoleEmailDirectory.tsx:419 |
| `shadow-x` | 1 | components/admin/RoleEmailDirectory.tsx:450 |

## 4. Plugin classes with no plugin installed (do nothing)
prose/prose-invert need @tailwindcss/typography; animate-in / fade-in / slide-in-from-* need tw-animate-css. Neither is installed.
| Class | Uses | Where |
|---|---|---|
| `prose` | 2 | app/admin/[username]/components/CruiseLivePreview.tsx:42, app/admin/[username]/components/CruiseLivePreview.tsx:65 |
| `prose-invert` | 2 | app/admin/[username]/components/CruiseLivePreview.tsx:42, app/admin/[username]/components/CruiseLivePreview.tsx:65 |
| `animate-in` | 6 | app/qr/merch/MerchQRClient.tsx:725, components/CruiseVideoGallery.tsx:314, components/FakeLiveStream/index.tsx:1825 … |
| `fade-in` | 5 | app/qr/merch/MerchQRClient.tsx:725, components/CruiseVideoGallery.tsx:314, components/FakeLiveStream/index.tsx:1825 … |
| `slide-in-from-bottom-3` | 1 | components/HeaderMaskEditor.tsx:93 |
| `slide-in-from-right-8` | 1 | components/UserFlowMap.tsx:1621 |

## 5. Custom class names with NO CSS anywhere (78)
Either the CSS was deleted, or it was never written. Decide per class: restore the CSS (check git history), replace with Tailwind, or delete the class.
Admin section names like emergencybroadcast / smsblast were excluded — they look like section ids/anchors.
| Class | Uses | Where | Note |
|---|---|---|---|
| `hide-scrollbar` | 1 | app/admin/[username]/components/AdminDashboardMain.tsx:5263 |  |
| `inline-loadin-popover` | 1 | app/admin/[username]/components/AdminDashboardMain.tsx:6800 |  |
| `admin-crew-search-wrapper` | 2 | app/admin/[username]/components/AdminDashboardMain.tsx:15742, app/admin/[username]/components/AdminSectionCrewSchedule.tsx:3414 |  |
| `admin-section-header` | 1 | app/admin/[username]/components/AdminDashboardMain.tsx:17766 |  |
| `nmp` | 1 | app/admin/[username]/components/adminDashboardShared.tsx:177 |  |
| `lock-scroll-fullscreen` | 3 | app/admin/page.tsx:254, app/crew/verify/CrewVerifyClient.tsx:38, app/planner/verify/PlannerVerifyClient.tsx:12 |  |
| `btn-action-purple` | 4 | app/admin/page.tsx:401, components/TourList.tsx:2193, components/TourList.tsx:2210 … |  |
| `booking-grid` | 4 | app/cruise/CruiseClient.tsx:481, app/cruise/CruiseClient.tsx:584, app/cruise/CruiseClient.tsx:728 … |  |
| `booking-cell` | 17 | app/cruise/CruiseClient.tsx:482, app/cruise/CruiseClient.tsx:496, app/cruise/CruiseClient.tsx:510 … |  |
| `booking-input` | 20 | app/cruise/CruiseClient.tsx:493, app/cruise/CruiseClient.tsx:507, app/cruise/CruiseClient.tsx:523 … |  |
| `booking-section-container` | 2 | app/cruise/CruiseClient.tsx:691, app/style-guide/page.tsx:6338 |  |
| `booking-section-header` | 2 | app/cruise/CruiseClient.tsx:692, app/style-guide/page.tsx:6339 |  |
| `booking-signature-input` | 1 | app/cruise/CruiseClient.tsx:740 |  |
| `signature-font` | 1 | app/cruise/CruiseClient.tsx:740 |  |
| `accent-gradient-text` | 7 | app/cruise/[username]/page.tsx:1253, app/cruise/components/CruiseCabinsPricingSection.tsx:1386, app/cruise/components/CruiseItinerarySection.tsx:49 … |  |
| `hb-page` | 1 | app/hambuger/page.tsx:69 |  |
| `hb-blur-bg` | 1 | app/hambuger/page.tsx:70 |  |
| `hb-back` | 1 | app/hambuger/page.tsx:72 |  |
| `viewport` | 1 | app/hambuger/page.tsx:76 |  |
| `header` | 1 | app/hambuger/page.tsx:77 |  |
| `nav` | 1 | app/hambuger/page.tsx:81 |  |
| `nav__menu` | 1 | app/hambuger/page.tsx:85 |  |
| `nav__item` | 1 | app/hambuger/page.tsx:92 |  |
| `nav__link` | 1 | app/hambuger/page.tsx:95 |  |
| `nav__toggle` | 1 | app/hambuger/page.tsx:110 |  |
| `menuicon` | 1 | app/hambuger/page.tsx:117 |  |
| `menuicon__bar` | 4 | app/hambuger/page.tsx:126, app/hambuger/page.tsx:133, app/hambuger/page.tsx:140 … |  |
| `splash` | 1 | app/hambuger/page.tsx:158 |  |
| `main` | 1 | app/hambuger/page.tsx:163 |  |
| `gallery__item` | 1 | app/hambuger/page.tsx:169 |  |
| `btn-ghost` | 1 | app/media/MediaClient.tsx:768 |  |
| `prose-legal` | 3 | app/privacy/PrivacyClient.tsx:28, app/returns/ReturnsClient.tsx:28, app/terms/TermsClient.tsx:29 |  |
| `morph-pick` | 1 | app/style-guide/page.tsx:4877 |  |
| `booking-form-card` | 1 | app/style-guide/page.tsx:6318 |  |
| `booking-header-banner` | 1 | app/style-guide/page.tsx:6320 |  |
| `smooothy-img-container` | 1 | components/BioParallaxSlider.tsx:2158 |  |
| `glarer-mask` | 1 | components/BioParallaxSlider.tsx:2215 |  |
| `animate-scale-in` | 1 | components/CalendarPicker.tsx:319 |  |
| `gob-gradient` | 1 | components/CosmicTrackCard.tsx:111 |  |
| `btn-outline-hover` | 3 | components/CrewFeed.tsx:432, components/HeroUpcomingShows.tsx:286, components/HeroUpcomingShows.tsx:311 |  |
| `r3f-gpu-stats` | 2 | components/CruiseHistoryTimeline.tsx:844, components/CruiseSnakeItinerary.tsx:1671 |  |
| `snake-itinerary-canvas` | 1 | components/CruiseSnakeItinerary.tsx:1409 |  |
| `snake-itinerary-svg` | 1 | components/CruiseSnakeItinerary.tsx:1419 |  |
| `snake-itinerary-card` | 1 | components/CruiseSnakeItinerary.tsx:1640 | also used as a JS hook — keep name, just no CSS |
| `exo-text-reveal` | 1 | components/ExoTextReveal.tsx:25 |  |
| `exo-text-line-wrap` | 1 | components/ExoTextReveal.tsx:29 |  |
| `exo-text-line-inner` | 1 | components/ExoTextReveal.tsx:31 |  |
| `plus-button` | 1 | components/FanUploadForm.tsx:378 | also used as a JS hook — keep name, just no CSS |
| `squishy-thumb` | 2 | components/GradientToggle.tsx:81, components/SquishyToggle.tsx:108 |  |
| `hero-cal-dropdown-container` | 1 | components/HeroUpNextBanner.tsx:323 | also used as a JS hook — keep name, just no CSS |
| `btn-primary-hover` | 1 | components/HeroUpcomingShows.tsx:297 |  |
| `calendar-dropdown-container` | 3 | components/HeroUpcomingShows.tsx:303, components/TourList.tsx:1952, components/TourList.tsx:2222 | also used as a JS hook — keep name, just no CSS |
| `smooothy-parallax-media` | 1 | components/HomeVideoShowcase.tsx:46 |  |
| `smooothy-slide` | 1 | components/HomeVideoShowcase.tsx:812 |  |
| `exoape-snapshot-outer` | 1 | components/PageTransition.tsx:532 | also used as a JS hook — keep name, just no CSS |
| `exoape-snapshot-overlay` | 1 | components/PageTransition.tsx:552 |  |
| `exoape-page-inner` | 1 | components/PageTransition.tsx:933 |  |
| `preloader-content` | 1 | components/Preloader.tsx:317 |  |
| `su-bleed` | 1 | components/SlideupSection.tsx:344 |  |
| `su-intro` | 1 | components/SlideupSection.tsx:347 |  |
| `su-hint` | 1 | components/SlideupSection.tsx:354 |  |
| `su-stack` | 1 | components/SlideupSection.tsx:358 |  |
| `su-card` | 1 | components/SlideupSection.tsx:362 | also used as a JS hook — keep name, just no CSS |
| `su-card-inner` | 1 | components/SlideupSection.tsx:372 |  |
| `su-headline` | 1 | components/SlideupSection.tsx:374 |  |
| `su-desc` | 1 | components/SlideupSection.tsx:377 |  |
| `su-thumbs` | 1 | components/SlideupSection.tsx:379 |  |
| `su-thumb` | 1 | components/SlideupSection.tsx:393 |  |
| `su-thumb-yt` | 1 | components/SlideupSection.tsx:402 |  |
| `su-thumb-content` | 1 | components/SlideupSection.tsx:406 |  |
| `su-thumb-badge` | 1 | components/SlideupSection.tsx:408 |  |
| `su-thumb-title` | 1 | components/SlideupSection.tsx:412 |  |
| `sticky-note-card` | 1 | components/StickyNotesOverlay.tsx:618 |  |
| `sort-bar-bg` | 1 | components/TourList.tsx:1649 |  |
| `tour-row-item` | 2 | components/TourList.tsx:1798, components/TourList.tsx:2050 |  |
| `btn-icon-square` | 2 | components/TourList.tsx:2210, components/TourList.tsx:2232 |  |
| `custom-venue-marker-inner` | 1 | components/TourMap.tsx:1004 |  |
| `vinyl-swiper` | 1 | components/VinylHeroPlayer.tsx:875 |  |

## 6. CSS defined but never used (113) — safe-delete candidates
| Class | Defined at |
|---|---|
| `pill-btn` | app/globals.css:85 |
| `pill-btn-active` | app/globals.css:103 |
| `glass-card-hover` | app/globals.css:232 |
| `modal-backdrop` | app/globals.css:285 |
| `drawer-slide` | app/globals.css:289 |
| `font-display` | app/globals.css:413 |
| `heading-font` | app/globals.css:414 |
| `btn-neat` | app/globals.css:769 |
| `link-purple` | app/globals.css:829 |
| `link-accent` | app/globals.css:830 |
| `btn-card-glass` | app/globals.css:847 |
| `btn-action-edit` | app/globals.css:848 |
| `btn-action-del` | app/globals.css:849 |
| `search-input` | app/globals.css:1010 |
| `no-bg-arrow` | app/globals.css:1072 |
| `bg-none` | app/globals.css:1073 |
| `no-arrow` | app/globals.css:1075 |
| `form-input-purple-focus` | app/globals.css:1101 |
| `btn-sm` | app/globals.css:1287 |
| `btn-md` | app/globals.css:1295 |
| `btn-lg` | app/globals.css:1303 |
| `c-dusted` | app/globals.css:1933 |
| `site-container-left` | app/globals.css:2192 |
| `video-bleed-right` | app/globals.css:2212 |
| `media-category-stuck` | app/globals.css:2219 |
| `gooey-dropdown-scrollbar` | app/globals.css:2441 |
| `grain-overlay` | app/globals.css:2529 |
| `gradient-bg` | app/globals.css:2678 |
| `gradients-container` | app/globals.css:2687 |
| `g4` | app/globals.css:2732 |
| `g5` | app/globals.css:2745 |
| `preloader-cosmic-bg` | app/globals.css:2769 |
| `preloader-mark` | app/globals.css:2942 |
| `is-leaving` | app/globals.css:2942 |
| `preloader-logo` | app/globals.css:3328 |
| `preloader-logo-base` | app/globals.css:3335 |
| `preloader-logo-fill` | app/globals.css:3339 |
| `is-revealing` | app/globals.css:3485 |
| `preloader-overlay--out` | app/globals.css:3511 |
| `preloader-overlay__mark` | app/globals.css:3515 |
| `preloader-overlay--hold` | app/globals.css:3523 |
| `preloader-overlay__logo` | app/globals.css:3529 |
| `cursor-tail-circle` | app/globals.css:3887 |
| `cursor-pick-pos` | app/globals.css:3953 |
| `cursor-pick-spin` | app/globals.css:3965 |
| `is-spinning` | app/globals.css:3970 |
| `cursor-pick-row` | app/globals.css:3978 |
| `cursor-pick-track` | app/globals.css:3987 |
| `module-bg` | app/globals.css:4033 |
| `hvn-page-curtain__mark` | app/globals.css:4038 |
| `hvn-page-curtain__logo` | app/globals.css:4042 |
| `wiw-sticky-corner` | app/globals.css:4138 |
| `wiw-sticky-header-2` | app/globals.css:4149 |
| `wiw-sticky-corner-2` | app/globals.css:4159 |
| `info-tooltip-container` | app/globals.css:4214 |
| `info-tooltip` | app/globals.css:4220 |
| `site-header` | app/globals.css:4268 |
| `page-nav` | app/globals.css:4269 |
| `site-footer` | app/globals.css:4272 |
| `direct-message-chat` | app/globals.css:4274 |
| `msg-new` | app/globals.css:4645 |
| `hype-bar` | app/globals.css:4662 |
| `cv-auto` | app/globals.css:4975 |
| `btn-transition` | app/globals.css:5001 |
| `transition-interactive` | app/globals.css:5005 |
| `transition-color-fast` | app/globals.css:5009 |
| `transition-transform-smooth` | app/globals.css:5013 |
| `transform-transition` | app/globals.css:5025 |
| `hover-glow-purple` | app/globals.css:5029 |
| `hover-lift` | app/globals.css:5034 |
| `hover-bright` | app/globals.css:5038 |
| `hover-text-white` | app/globals.css:5042 |
| `hover-text-purple` | app/globals.css:5046 |
| `hover-bg-purple-light` | app/globals.css:5050 |
| `hover-bg-purple-dark` | app/globals.css:5054 |
| `hover-glow-accent` | app/globals.css:5067 |
| `hover-scale-sm` | app/globals.css:5072 |
| `hover-scale-md` | app/globals.css:5076 |
| `hover-bg-glass` | app/globals.css:5080 |
| `hover-text-cyan` | app/globals.css:5084 |
| `hover-text-emerald` | app/globals.css:5088 |
| `slow-transition` | app/globals.css:5092 |
| `fast-transition` | app/globals.css:5096 |
| `hover-bg-white-10` | app/globals.css:5100 |
| `hover-bg-white-20` | app/globals.css:5104 |
| `hover-border-white-30` | app/globals.css:5108 |
| `hover-border-purple-300` | app/globals.css:5112 |
| `hover-bg-purple-600` | app/globals.css:5116 |
| `hover-bg-purple-700` | app/globals.css:5120 |
| `hover-bg-red-500` | app/globals.css:5124 |
| `hover-bg-red-600` | app/globals.css:5128 |
| `hover-text-red-400` | app/globals.css:5132 |
| `hover-underline` | app/globals.css:5140 |
| `gooey-msg-svgDefs` | app/globals.css:5237 |
| `dm-chat-svgDefs` | app/globals.css:5238 |
| `gooey-msg-shapes` | app/globals.css:5246 |
| `dm-chat-shapes` | app/globals.css:5247 |
| `gooey-msg-buttonShape` | app/globals.css:5258 |
| `dm-chat-triggerShape` | app/globals.css:5259 |
| `gooey-drop-portalRoot` | app/globals.css:5274 |
| `gooey-msg-wrap` | app/globals.css:5619 |
| `gooey-msg-trigger` | app/globals.css:5625 |
| `gooey-msg-portalRoot` | app/globals.css:5644 |
| `gooey-msg-panelShape` | app/globals.css:5653 |
| `gooey-msg-panel` | app/globals.css:5662 |
| `dm-chat-panelShape` | app/globals.css:5684 |
| `sgb-generate-link` | app/globals.css:5818 |
| `btn-glass-play-pill` | app/globals.css:5860 |
| `py-section-3` | app/globals.css @utility |
| `pt-page` | app/globals.css @utility |
| `pt-stage-fluid` | app/globals.css @utility |
| `pt-section-fluid` | app/globals.css @utility |
| `pt-map-section-fluid` | app/globals.css @utility |

### Keep (applied at runtime by libraries, not by your code)
ql-toolbar, ql-snow, ql-container, ql-stroke, ql-fill, ql-picker, ql-picker-options, ql-picker-item, ql-selected, ql-blank, ql-picker-label, swiper-slide, swiper-slide-active, gm-style, gm-style-iw, gm-style-iw-c, gm-style-iw-t, gm-style-iw-tc, leaflet-container, leaflet-tooltip, leaflet-tooltip-top, gm-style-bg, gm-style-iw-d, gm-ui-hover-effect, gm-style-cc, react-flow__edge-path, react-flow__edge, react-flow
### Check before deleting (may be built dynamically, e.g. `card-${x}`)
card-hover, card-hover-effect, group-hover-scale-105, group-hover-opacity-100, snazzy-map-227862
