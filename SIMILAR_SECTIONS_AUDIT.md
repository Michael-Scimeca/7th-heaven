# Similar Sections Audit — 7thHeaven

Sections that do the same job on different pages, and whether they share one component. From reading the code.

| # | Section type | Where it appears | Shared today? | Problem |
|---|---|---|---|---|
| 1 | **Page intro / hero header** (h1 + subtitle) | privacy, terms, returns, contact, faq, merch, rock-and-roll-kids, live, notifications, features, media, shows/past, fan walls | ✅ shared: `<PageHero />` | Unified under `<PageHero />` with design system tokens (`text-h1`, `text-body`), `SectionBadge` eyebrow support, `Stack` parent-owned spacing, responsive actions row/stack, and standardized left alignment. Added to `/style-guide`. |
| 2 | **Legal pages** | /privacy, /terms, /returns | ❌ 3 copies of the same file | Same header + section layout copy-pasted (332 / 370 / 184 lines); inner spacing mixes margins and gap differently in each. |
| 3 | **FAQ accordion** | /faq (FaqClient), /cruise (CruiseFaqSection) | ⚠️ partly — both use FaqChevronButton | Accordion item, open/close logic and layout written twice. |
| 4 | **Verify / code-entry screens** | /crew/verify (411 lines), /cruise/verify (279), /planner/verify (415), /admin login (616) | ❌ 4 separate builds | Same flow (enter email → enter code → success), 4 card styles: `max-w-md` plain vs `max-w-md rounded-2xl border bg-white/[0.04] p-8 backdrop-blur-xl`, different digit inputs. |
| 5 | **Success / cancel / confirmation screens** | /book/success, /book/cancel, /cruise/cancel | ❌ 3 builds | Different icon boxes (`h-16 w-16` rose vs purple), glow blobs only on success, different widths/alignment. |
| 6 | **Video grids / galleries** | VideoSection, CruiseVideoGallery, HomeVideoShowcase, MediaClient, BehindTheScenes, shows/[id], rock-and-roll-kids | ❌ 7 builds, 4 player types | Players: InlineYTPlayer, CustomVideoPlayer, CustomYTPlayer, raw `<iframe>`. Thumbnail ratios: `aspect-video`, `aspect-[16/10]`, `aspect-[3/4.2]`, `aspect-[1.2/1]`, `aspect-[3/4]`, `aspect-[4/3]`. |
| 7 | **Show / tour lists & cards** | TourList, PastShowsClient, HeroUpcomingShows, HeroUpNextBanner, fans/[username], CrewFeed, shows/[id] | ❌ each builds its own show row/card | Date formatting done differently in each; CalendarBadgeIcon component exists but none use it; venue links only in 2. |
| 8 | **Countdowns** | CountdownTimer component used in only 2 files (HeroUpcomingShows, HeroUpNextBanner) | ⚠️ | Countdown math re-written in BookClient, fans/[username], TourMap, HeroLiveHub, LiveShowFeed, TourList, CrewFeed, CruiseWidgets. |
| 9 | **Subscribe / alerts prompts** | PushSubscribeModal, PushAlertsCard, LiveStreamInlineSubscribe, ProximityNotify, ProximityPanel, FooterProximityAlerts | ❌ 6 components | Same "get notified" job, different layouts. **Two different files named FooterProximityAlerts.tsx** (components/ and admin/[username]/components/, ~80 lines differ). |
| 10 | **Merch / product cards** | HomeMerch, /merch, /qr/merch (MerchQRClient), claim/[pin] | ❌ 3–4 builds | `aspect-square bg-white/[0.03]` vs `aspect-square bg-black/60`; /merch has its own card. |
| 11 | **Page sections** (see SECTION_BUILD_AUDIT.md) | all pages | ❌ | PageSection/Stack exist, 0 uses. |
