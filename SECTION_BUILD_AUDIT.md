# Section Build Audit — 7thHeaven

How every `<section>` on each page is built (from the code). Columns: where the side gutter comes from (`site-container` on the section, on an inner div, or none = inherited from the page wrapper), what sets its vertical spacing, how its heading is made, and whether children are spaced with `gap` or with margins.

Target recipe: `<PageSection>` (or `<section class="section">` + inner `site-container`) → `<SectionHeader>` → children spaced with `gap`/`Stack`. Currently `PageSection` and `Stack` have **0 uses**, `SectionHeader` 15 uses in 5 files.

**120 sections scanned — 120 don't follow the target recipe.**

## / — 3 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| page.tsx:51 | none | none | none | - |  |
| c/LazySection.tsx:48 | none | none | none | - |  |
| c/LazySection.tsx:57 | none | none | none | - |  |

## /admin/[username] — 4 sections, 2 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| admin/[username]/c/AdminDashboardMain.tsx:10419 | none | none | none | - |  |
| admin/[username]/c/AdminDashboardMain.tsx:17755 | none | none | none | margins |  |
| admin/[username]/c/AdminDashboardMain.tsx:17874 | none | none | none | - |  |
| admin/[username]/c/AdminDashboardMain.tsx:17880 | none | none | h3 | gap |  |

## /admin/shop-inventory — 3 sections, 2 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| admin/shop-inventory/page.tsx:218 | none | none | none | - |  |
| admin/shop-inventory/page.tsx:222 | none | none | h2 | - |  |
| admin/shop-inventory/page.tsx:227 | none | none | h2 | - |  |

## /book — 11 sections, 1 build recipe for BookClient ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| book/BookClient.tsx:885 | PageSection | none | SectionHeader | gap |  |
| book/BookClient.tsx:1181 | PageSection | section-sm | SectionHeader | gap |  |
| book/BookClient.tsx:1311 | PageSection | section-sm | SectionHeader | gap |  |
| book/BookClient.tsx:1860 | PageSection | section-sm | SectionHeader | gap |  |
| book/BookClient.tsx:1932 | PageSection | section-sm | SectionHeader | gap |  |
| book/BookClient.tsx:2213 | PageSection | section-sm | SectionHeader | gap |  |
| book/BookClient.tsx:2321 | PageSection | section-sm | SectionHeader | gap |  |
| book/BookClient.tsx:2378 | PageSection | section-sm | SectionHeader | gap |  |
| c/PlannerDashboard.tsx:624 | none | none | Badge+h | gap |  |
| c/PlannerDashboard.tsx:901 | none | none | Badge+h | gap |  |
| c/PlannerDashboard.tsx:1104 | none | py-section-fluid | h3 | margins |  |

## /book/[username] — 3 sections, 2 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| c/PlannerDashboard.tsx:624 | none | none | Badge+h | gap |  |
| c/PlannerDashboard.tsx:901 | none | none | Badge+h | gap |  |
| c/PlannerDashboard.tsx:1104 | none | py-section-fluid | h3 | margins |  |

## /book/cancel — 2 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| book/cancel/page.tsx:46 | none | none | h1 | margins |  |
| book/cancel/page.tsx:68 | none | none | h1 | gap |  |

## /book/success — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| book/success/page.tsx:39 | none | none | h1 | margins |  |

## /claim/[pin] — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| claim/[pin]/page.tsx:248 | none | none | h2 | margins |  |

## /contact — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| contact/ContactClient.tsx:176 | none | none | h3 | gap |  |

## /crew — 5 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| c/CrewDashboard/index.tsx:3354 | none | none | h3 | gap |  |
| c/CrewDashboard/index.tsx:3872 | none | none | h3 | gap |  |
| c/CrewDashboard/index.tsx:3963 | none | none | h3 | gap |  |
| c/CrewDashboard/index.tsx:4264 | none | none | h3 | gap |  |
| c/CrewDashboard/index.tsx:4565 | none | none | h3 | gap |  |

## /crew/[slug] — 5 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| c/CrewDashboard/index.tsx:3354 | none | none | h3 | gap |  |
| c/CrewDashboard/index.tsx:3872 | none | none | h3 | gap |  |
| c/CrewDashboard/index.tsx:3963 | none | none | h3 | gap |  |
| c/CrewDashboard/index.tsx:4264 | none | none | h3 | gap |  |
| c/CrewDashboard/index.tsx:4565 | none | none | h3 | gap |  |

## /cruise — 4 sections, 4 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| c/CruiseVideoGallery.tsx:211 | on-section | py-section-fluid | h2 | gap | yes |
| c/CruiseSnakeItinerary.tsx:895 | on-section | none | h2 | gap |  |
| cruise/c/CruiseCabinsPricingSection.tsx:849 | on-section | py-section-fluid | SectionHeader | gap |  |
| cruise/c/CruiseHeroSection.tsx:82 | on-section | none | h1 | - |  |

## /cruise/[username] — 3 sections, 3 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| cruise/[username]/page.tsx:1063 | none | none | h2 | gap |  |
| cruise/[username]/page.tsx:1189 | none | pt-16 md:pt-24 | h2 | gap | yes |
| c/CruiseSnakeItinerary.tsx:895 | on-section | none | h2 | gap |  |

## /cruise/preview — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| cruise/preview/page.tsx:511 | on-section | none | h2 | gap |  |

## /cruise/verify — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| cruise/verify/CruiseVerifyClient.tsx:125 | none | none | h1 | gap |  |

## /fan-media-wall — 3 sections, 3 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| fan-photo-wall/FanPhotoWallClient.tsx:355 | on-section | none | h1 | gap |  |
| fan-photo-wall/FanPhotoWallClient.tsx:463 | on-section | py-section-fluid | h3 | gap |  |
| fan-photo-wall/FanPhotoWallClient.tsx:562 | on-section | py-section-fluid | h2 | gap |  |

## /fan-photo-wall — 3 sections, 3 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| fan-photo-wall/FanPhotoWallClient.tsx:355 | on-section | none | h1 | gap |  |
| fan-photo-wall/FanPhotoWallClient.tsx:463 | on-section | py-section-fluid | h3 | gap |  |
| fan-photo-wall/FanPhotoWallClient.tsx:562 | on-section | py-section-fluid | h2 | gap |  |

## /fans/[username] — 8 sections, 2 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| fans/[username]/page.tsx:792 | none | none | none | gap |  |
| fans/[username]/page.tsx:858 | none | none | h3 | gap |  |
| fans/[username]/page.tsx:960 | none | none | h3 | margins |  |
| fans/[username]/page.tsx:1056 | none | none | none | gap |  |
| fans/[username]/page.tsx:1317 | none | none | none | gap |  |
| fans/[username]/page.tsx:1406 | none | none | h3 | gap |  |
| fans/[username]/page.tsx:1484 | none | none | none | gap |  |
| fans/[username]/page.tsx:1665 | none | none | none | gap |  |

## /faq — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| faq/FaqClient.tsx:309 | none | none | none | gap |  |

## /features — 6 sections, 4 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| features/page.tsx:85 | none | pt-40 pb-28 | h1 | gap |  |
| features/page.tsx:178 | none | none | none | - |  |
| features/page.tsx:204 | none | py-24 | h2 | gap |  |
| features/page.tsx:225 | none | py-24 | h2 | gap |  |
| features/page.tsx:274 | none | py-24 | h2 | gap |  |
| features/page.tsx:304 | none | py-32 | h2 | gap |  |

## /live — 2 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| live/LiveHubClient.tsx:292 | none | none | none | gap |  |
| live/LiveHubClient.tsx:650 | none | none | none | gap |  |

## /media — 5 sections, 3 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| media/MediaClient.tsx:518 | none | pb-6 | none | - |  |
| media/MediaClient.tsx:522 | none | none | none | gap |  |
| media/MediaClient.tsx:582 | none | none | none | gap | yes |
| c/AudioPlayer.tsx:599 | on-section | none | h3 | gap |  |
| c/AudioPlayer.tsx:628 | none | none | none | gap |  |

## /merch — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| merch/page.tsx:373 | none | py-24 | h2 | margins |  |

## /news/[slug] — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| news/[slug]/page.tsx:219 | none | none | h2 | gap |  |

## /notifications — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| notifications/page.tsx:167 | on-section | pt-[var pb-24 | h1 | gap |  |

## /planner/verify — 1 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| planner/verify/PlannerVerifyClient.tsx:210 | none | none | h1 | gap |  |

## /privacy — 13 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| privacy/PrivacyClient.tsx:40 | none | none | h2 | margins |  |
| privacy/PrivacyClient.tsx:57 | none | none | h2 | margins |  |
| privacy/PrivacyClient.tsx:76 | none | none | h2 | gap |  |
| privacy/PrivacyClient.tsx:119 | none | none | h2 | gap |  |
| privacy/PrivacyClient.tsx:143 | none | none | h2 | gap |  |
| privacy/PrivacyClient.tsx:184 | none | none | h2 | gap |  |
| privacy/PrivacyClient.tsx:207 | none | none | h2 | margins |  |
| privacy/PrivacyClient.tsx:221 | none | none | h2 | margins |  |
| privacy/PrivacyClient.tsx:235 | none | none | h2 | gap |  |
| privacy/PrivacyClient.tsx:260 | none | none | h2 | margins |  |
| privacy/PrivacyClient.tsx:273 | none | none | h2 | margins |  |
| privacy/PrivacyClient.tsx:287 | none | none | h2 | margins |  |
| privacy/PrivacyClient.tsx:300 | none | none | h2 | gap |  |

## /returns — 6 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| returns/ReturnsClient.tsx:40 | none | none | h2 | margins |  |
| returns/ReturnsClient.tsx:57 | none | none | h2 | margins |  |
| returns/ReturnsClient.tsx:70 | none | none | h2 | gap |  |
| returns/ReturnsClient.tsx:105 | none | none | h2 | gap |  |
| returns/ReturnsClient.tsx:133 | none | none | h2 | margins |  |
| returns/ReturnsClient.tsx:150 | none | none | h2 | gap |  |

## /rock-and-roll-kids — 5 sections, 3 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| rock-and-roll-kids/RockNRollKidsClient.tsx:558 | none | pb-section-fluid | h2 | gap |  |
| rock-and-roll-kids/RockNRollKidsClient.tsx:605 | none | py-section-fluid | Badge+h | gap |  |
| rock-and-roll-kids/RockNRollKidsClient.tsx:643 | none | py-section-fluid | h2 | gap |  |
| rock-and-roll-kids/RockNRollKidsClient.tsx:710 | none | py-section-fluid | h2 | gap |  |
| rock-and-roll-kids/RockNRollKidsClient.tsx:765 | none | py-section-fluid | Badge+h | gap |  |

## /shows/past — 2 sections, 2 different build recipes
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| c/PastShowsClient.tsx:184 | none | none | none | gap |  |
| c/PastShowsClient.tsx:283 | none | none | h2 | gap |  |

## /terms — 14 sections, 1 different build recipes ✅
| File:line | Container | Spacing | Heading | Children spaced by | Inline style |
|---|---|---|---|---|---|
| terms/TermsClient.tsx:41 | none | none | h2 | margins |  |
| terms/TermsClient.tsx:58 | none | none | h2 | margins |  |
| terms/TermsClient.tsx:75 | none | none | h2 | gap |  |
| terms/TermsClient.tsx:101 | none | none | h2 | gap |  |
| terms/TermsClient.tsx:128 | none | none | h2 | gap |  |
| terms/TermsClient.tsx:202 | none | none | h2 | margins |  |
| terms/TermsClient.tsx:217 | none | none | h2 | gap |  |
| terms/TermsClient.tsx:239 | none | none | h2 | gap |  |
| terms/TermsClient.tsx:263 | none | none | h2 | gap |  |
| terms/TermsClient.tsx:286 | none | none | h2 | margins |  |
| terms/TermsClient.tsx:300 | none | none | h2 | margins |  |
| terms/TermsClient.tsx:314 | none | none | h2 | margins |  |
| terms/TermsClient.tsx:327 | none | none | h2 | margins |  |
| terms/TermsClient.tsx:339 | none | none | h2 | gap |  |
