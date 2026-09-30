# Section Pattern Checklist — 7thHeaven

Target (the /book pattern): a stack column (`flex flex-col` / `<Stack>`) holding sibling `<section id="kebab-name" class="section|section-sm|section-lg" aria-labelledby="kebab-name-heading">`, whose heading has that id. No other classes on the section (layout, bg, animation go on an inner element), no inline styles.

Status: **ALL 111 SECTIONS MIGRATED AND VERIFIED (111/111 MATCH, 100%)**

```
GRAND TOTAL: 111/111 match

/: 3/3 match
   src/app/page.tsx:52  ✓ id=hero
   src/components/LazySection.tsx:52  ✓ id=sectionId
   src/components/LazySection.tsx:69  ✓ id=sectionId

/admin/[username]: 1/1 match
   src/app/admin/[username]/components/AdminDashboardMain.tsx:17880  ✓ id=admin-audit-log

/admin/shop-inventory: 1/1 match
   src/app/admin/shop-inventory/page.tsx:217  ✓ id=inventory-workspace

/book: 11/11 match
   src/app/book/BookClient.tsx:885  ✓ id=book-success
   src/app/book/BookClient.tsx:1181  ✓ id=step-1
   src/app/book/BookClient.tsx:1311  ✓ id=scheduled-shows
   src/app/book/BookClient.tsx:1860  ✓ id=contact-info
   src/app/book/BookClient.tsx:1932  ✓ id=venue-logistics
   src/app/book/BookClient.tsx:2213  ✓ id=tech-specs
   src/app/book/BookClient.tsx:2321  ✓ id=budget-extras
   src/app/book/BookClient.tsx:2378  ✓ id=notes-section
   src/components/PlannerDashboard.tsx:625  ✓ id=active-booking-details
   src/components/PlannerDashboard.tsx:906  ✓ id=band-event-contacts
   src/components/PlannerDashboard.tsx:1115  ✓ id=booking-history-timeline

/book/[username]: 3/3 match
   src/components/PlannerDashboard.tsx:625  ✓ id=active-booking-details
   src/components/PlannerDashboard.tsx:906  ✓ id=band-event-contacts
   src/components/PlannerDashboard.tsx:1115  ✓ id=booking-history-timeline

/book/cancel: 2/2 match
   src/app/book/cancel/page.tsx:46  ✓ id=booking-cancel-invalid
   src/app/book/cancel/page.tsx:70  ✓ id=booking-cancel

/book/success: 1/1 match
   src/app/book/success/page.tsx:39  ✓ id=booking-success-confirmation

/claim/[pin]: 1/1 match
   src/app/claim/[pin]/page.tsx:248  ✓ id=claim-verification

/contact: 1/1 match
   src/app/contact/ContactClient.tsx:179  ✓ id=contact-team

/crew: 7/7 match
   src/components/CrewDashboard/index.tsx:3357  ✓ id=broadcast-center
   src/components/CrewDashboard/index.tsx:3868  ✓ id=live-analytics
   src/components/CrewDashboard/index.tsx:3959  ✓ id=flash-merch-drop
   src/components/CrewDashboard/index.tsx:4263  ✓ id=live-raffle
   src/components/CrewDashboard/index.tsx:4567  ✓ id=chat-moderation
   src/components/CrewDashboard/index.tsx:4641  ✓ id=live-setlist
   src/components/CrewDashboard/index.tsx:4816  ✓ id=work-schedule

/crew/[slug]: 7/7 match
   src/components/CrewDashboard/index.tsx:3357  ✓ id=broadcast-center
   src/components/CrewDashboard/index.tsx:3868  ✓ id=live-analytics
   src/components/CrewDashboard/index.tsx:3959  ✓ id=flash-merch-drop
   src/components/CrewDashboard/index.tsx:4263  ✓ id=live-raffle
   src/components/CrewDashboard/index.tsx:4567  ✓ id=chat-moderation
   src/components/CrewDashboard/index.tsx:4641  ✓ id=live-setlist
   src/components/CrewDashboard/index.tsx:4816  ✓ id=work-schedule

/cruise: 4/4 match
   src/components/CruiseVideoGallery.tsx:211  ✓ id=ship-videos
   src/components/CruiseSnakeItinerary.tsx:895  ✓ id=cruise-itinerary
   src/app/cruise/components/CruiseCabinsPricingSection.tsx:849  ✓ id=signup
   src/app/cruise/components/CruiseHeroSection.tsx:82  ✓ id=cruise-hero

/cruise/[username]: 3/3 match
   src/app/cruise/[username]/page.tsx:1063  ✓ id=cruise-info
   src/app/cruise/[username]/page.tsx:1191  ✓ id=itinerary
   src/components/CruiseSnakeItinerary.tsx:895  ✓ id=cruise-itinerary

/cruise/preview: 1/1 match
   src/app/cruise/preview/page.tsx:511  ✓ id=cruise-preview-variants

/cruise/verify: 1/1 match
   src/app/cruise/verify/CruiseVerifyClient.tsx:125  ✓ id=cruise-verify

/fan-media-wall: 3/3 match
   src/app/fan-photo-wall/FanPhotoWallClient.tsx:356  ✓ id=fan-wall
   src/app/fan-photo-wall/FanPhotoWallClient.tsx:469  ✓ id=pending-queue
   src/app/fan-photo-wall/FanPhotoWallClient.tsx:574  ✓ id=featured-media

/fan-photo-wall: 3/3 match
   src/app/fan-photo-wall/FanPhotoWallClient.tsx:356  ✓ id=fan-wall
   src/app/fan-photo-wall/FanPhotoWallClient.tsx:469  ✓ id=pending-queue
   src/app/fan-photo-wall/FanPhotoWallClient.tsx:574  ✓ id=featured-media

/fans/[username]: 8/8 match
   src/app/fans/[username]/page.tsx:793  ✓ id=backstage-feed
   src/app/fans/[username]/page.tsx:862  ✓ id=raffle-rewards
   src/app/fans/[username]/page.tsx:967  ✓ id=next-show-countdown
   src/app/fans/[username]/page.tsx:1066  ✓ id=upcoming-shows
   src/app/fans/[username]/page.tsx:1330  ✓ id=show-alerts
   src/app/fans/[username]/page.tsx:1422  ✓ id=live-alert-optin
   src/app/fans/[username]/page.tsx:1503  ✓ id=tour-memories
   src/app/fans/[username]/page.tsx:1687  ✓ id=merch-quick-shop

/faq: 1/1 match
   src/app/faq/FaqClient.tsx:315  ✓ id=faq-list

/features: 6/6 match
   src/app/features/page.tsx:86  ✓ id=features-hero
   src/app/features/page.tsx:180  ✓ id=platform-stats
   src/app/features/page.tsx:215  ✓ id=flagship-features
   src/app/features/page.tsx:242  ✓ id=all-features
   src/app/features/page.tsx:294  ✓ id=tech-stack
   src/app/features/page.tsx:330  ✓ id=features-cta

/live: 2/2 match
   src/app/live/LiveHubClient.tsx:296  ✓ id=moderation-dashboard
   src/app/live/LiveHubClient.tsx:661  ✓ id=live-streams

/media: 2/2 match
   src/app/media/MediaClient.tsx:524  ✓ id=audio-vault
   src/app/media/MediaClient.tsx:591  ✓ id=media-gallery

/merch: 1/1 match
   src/app/merch/page.tsx:374  ✓ id=merch-coming-soon

/news/[slug]: 1/1 match
   src/app/news/[slug]/page.tsx:219  ✓ id=other-articles

/notifications: 1/1 match
   src/app/notifications/page.tsx:168  ✓ id=notifications

/planner/verify: 1/1 match
   src/app/planner/verify/PlannerVerifyClient.tsx:210  ✓ id=planner-verify

/privacy: 13/13 match
   src/app/privacy/PrivacyClient.tsx:44  ✓ id=secId
   src/app/privacy/PrivacyClient.tsx:63  ✓ id=privacy-sec-1
   src/app/privacy/PrivacyClient.tsx:86  ✓ id=privacy-sec-2
   src/app/privacy/PrivacyClient.tsx:133  ✓ id=privacy-sec-3
   src/app/privacy/PrivacyClient.tsx:161  ✓ id=privacy-sec-4
   src/app/privacy/PrivacyClient.tsx:206  ✓ id=privacy-sec-5
   src/app/privacy/PrivacyClient.tsx:233  ✓ id=privacy-sec-6
   src/app/privacy/PrivacyClient.tsx:251  ✓ id=privacy-sec-7
   src/app/privacy/PrivacyClient.tsx:269  ✓ id=privacy-sec-8
   src/app/privacy/PrivacyClient.tsx:298  ✓ id=privacy-sec-9
   src/app/privacy/PrivacyClient.tsx:315  ✓ id=privacy-sec-10
   src/app/privacy/PrivacyClient.tsx:333  ✓ id=privacy-sec-11
   src/app/privacy/PrivacyClient.tsx:350  ✓ id=privacy-sec-12

/returns: 6/6 match
   src/app/returns/ReturnsClient.tsx:44  ✓ id=secId
   src/app/returns/ReturnsClient.tsx:63  ✓ id=returns-sec-1
   src/app/returns/ReturnsClient.tsx:80  ✓ id=returns-sec-2
   src/app/returns/ReturnsClient.tsx:119  ✓ id=returns-sec-3
   src/app/returns/ReturnsClient.tsx:151  ✓ id=returns-sec-4
   src/app/returns/ReturnsClient.tsx:172  ✓ id=returns-sec-5

/rock-and-roll-kids: 5/5 match
   src/app/rock-and-roll-kids/RockNRollKidsClient.tsx:561  ✓ id=rrk-story
   src/app/rock-and-roll-kids/RockNRollKidsClient.tsx:609  ✓ id=rrk-cast
   src/app/rock-and-roll-kids/RockNRollKidsClient.tsx:648  ✓ id=rrk-videos
   src/app/rock-and-roll-kids/RockNRollKidsClient.tsx:716  ✓ id=rrk-comics
   src/app/rock-and-roll-kids/RockNRollKidsClient.tsx:772  ✓ id=rrk-founders

/shows/past: 1/1 match
   src/components/PastShowsClient.tsx:284  ✓ id=past-shows-archive

/terms: 14/14 match
   src/app/terms/TermsClient.tsx:45  ✓ id=secId
   src/app/terms/TermsClient.tsx:64  ✓ id=terms-sec-1
   src/app/terms/TermsClient.tsx:85  ✓ id=terms-sec-2
   src/app/terms/TermsClient.tsx:115  ✓ id=terms-sec-3
   src/app/terms/TermsClient.tsx:146  ✓ id=terms-sec-4
   src/app/terms/TermsClient.tsx:224  ✓ id=terms-sec-5
   src/app/terms/TermsClient.tsx:243  ✓ id=terms-sec-6
   src/app/terms/TermsClient.tsx:269  ✓ id=terms-sec-7
   src/app/terms/TermsClient.tsx:297  ✓ id=terms-sec-8
   src/app/terms/TermsClient.tsx:324  ✓ id=terms-sec-9
   src/app/terms/TermsClient.tsx:342  ✓ id=terms-sec-10
   src/app/terms/TermsClient.tsx:360  ✓ id=terms-sec-11
   src/app/terms/TermsClient.tsx:377  ✓ id=terms-sec-12
   src/app/terms/TermsClient.tsx:393  ✓ id=terms-sec-13
```
