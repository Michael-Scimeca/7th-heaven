# Unused files report: 7th Heaven site

Nothing has been deleted. Each item was checked by searching the whole codebase (src, scripts, configs, `sw.js`, `_headers`) for its path, file name and import name.

**Before removing anything:** run `git status` and commit, so everything can be restored with git. Images in `public/` could still be referenced from **Sanity content** (fields that hold a `/images/...` path). Search Sanity for `/images/` before removing anything in `public/images`.

## Summary

| Group | Files | Approx. size | Confidence |
|---|---|---|---|
| A. Root junk (temp, test, report output) | 9 | ~4 MB | Safe |
| B. Old audit `.md` reports at the root | ~20 | ~0.5 MB | Safe once you've read them |
| C. Tool/output folders | 6 folders | ~20 MB+ | Safe |
| D. One-off audit scripts + JSON outputs in `scripts/` | ~30 | ~2 MB | Safe |
| E. Unused source files (nothing imports them) | ~50 | ~0.6 MB | Safe; run the build after |
| F. Unreferenced files in `public/` | 123 | **~52 MB** | Check first (Sanity) |
| G. Dev/test pages that go live as real URLs | ~20 routes | small | Your call |

---

## A. Root junk: safe to remove
- `.tmp_ccp.b64`, `.tmp_prod_push.b64`, `.tmp_pt_pull.b64`, `.tmp_pt_push.b64`, `.tmp_ptx.b64` (temp encodes)
- `button_width_test.png` (2.3 MB screenshot)
- `snapshot.txt`
- `lighthouse-report.json` (0.5 MB), `lh-home-1.json` (0.85 MB), `design-audit-localhost-2026-08-05.json`
- `deno.lock` (the project uses npm, not Deno)
- `schedules.json` (220 KB, not read by any code; keep it only if it's a data backup you want)
- `src/app/cruise/book_raw.html` (a raw copy, not a route)
- `.lighthouserc.json` and `budget.json`: keep these only if you still run Lighthouse CI

## B. Old audit reports at the root
These are notes from earlier tasks, not used by the site. Move them into one `docs/audits/` folder, or remove them:
CLASS_AUDIT, CSS_AUDIT (129 KB), DESIGN_SYSTEM_AUDIT, IMAGE_AUDIT, TYPOGRAPHY_AUDIT, UI_CONSISTENCY_AUDIT, SECTION_BUILD_AUDIT, SIMILAR_SECTIONS_AUDIT, SECTION_PATTERN_CHECKLIST, PADDING_INCONSISTENCIES, SCROLL_REPORT, PERF_BEST_PRACTICES_REPORT, MOBILE_SAFARI_REPORT, TITLE_GAP_REPORT, HOVER_TRANSITIONS_REPORT, HEADING_SCALE_REPORT, PAGE_PAUSE_REPORT, VISITOR_BUGS_REPORT, NOTIFICATIONS_REPORT.
**Keep** `NOTIFICATIONS_SETUP.md` (setup instructions), `README.md` and `AGENTS.md`.

## C. Folders: safe to remove
- `_unused-images/` (~16 MB, already set aside)
- `.clinic/` (Clinic.js profiling output)
- `.unlighthouse/`, `.lighthouse-reports/` (audit output)
- `test-results/` (Playwright output; it gets recreated)
- `my-video/`: a separate Remotion project. Remove it only if you're done making that video.
- `.devin/`, `.windsurf/`, `.impeccable/`: settings for other AI tools. Remove them if you don't use those tools.

## D. `scripts/`: one-off audit scripts and their outputs
`package.json` only uses `check-function-size.js`, `check-heading-classes.mjs`, `check-hover-transitions.mjs`, `generate-sitemap.js` and `optimize_images.js`. **Keep those.**

**Safe to remove** (one-time audits that have already run):
analyze_blurs.js, analyze_js_to_css.js, audit_blurs.js, audit_classnames_deep.js, audit_js_to_css.js, audit_motion.js, audit_section_pattern.js, build_full_report.js, clean_blur_audit.js, consolidate_blurs.js, execute_easy_swaps.js, fix_all_classnames.js, generate_post_blur_report.js, generate_report_data.js, group_motion_patterns.js, measure_spacing.js, refactor_motion_classes.js, refactor_motion_classes_v2.js, verify_section_pattern.js, auto-push.sh / .log / .err
+ the JSON outputs: after_spacing, before_spacing, audit_results, blur_audit, blur_summary, clean_blur_data, js_to_css_classified, js_to_css_findings, master_blur_report, motion_audit (684 KB), post_blur_report, report_data (~1.8 MB together)

**Keep, or move to `scripts/admin/`** (useful manual tools): seed-sanity-*, create-user-admin.js, delete-user.js, run-migrations.js, add-cruise-notifications-col.mjs, create-push-subscribers-table.mjs, scrape-and-sync-tour.js, update-seed-tourdates.js, extract-past-shows.js, test-emails.mjs, compress_videos.js, perf-audit.js, verify-otp.js.
**Remove only if you don't use the visual sitemap page:** capture-*.js, take-store-screenshots.js, update-merch-screenshots.js, update-shows-screenshot.js. These made the sitemap thumbnails.

## E. Source files nothing imports: safe to remove
Each was confirmed by searching for its import name. Run `npm run build` after removing them.

**src/components/**
AccomplishmentsLayouts, AdminFeedPost, Badge, BehindTheScenes, BioScrollReveal, CrewFeed, CrewHQ, CruiseHeroMaskEditor, CustomYTPlayer, DirectMessageChat, FeaturedTrack, FooterProximityAlerts, GradientText (.tsx + .css), HeaderMaskEditor, HeroAlbumPlayer, HeroLiveHub, HeroLiveThumbs, HeroUpcomingShows, HomeMerch, LiveShowFeed, LiveStatusSign, LiveStreamInlineSubscribe, NewsHeroLayouts, PagesPillDrawer, ProximityNotify, SlideUpReveal, VideoSection
- `components/admin/`: AdminDashboardSkeleton, InviteChallengePanel, ReferralProgramPanel
- `components/ui/`: index.ts, FormInput, LoadingSpinner, ModalDialog, StatusBadge (**keep** GlassCard, which is in use)

**src/app/**
- `admin/[username]/components/AdminSectionCrewSchedule.tsx` (**285 KB**), `adminDashboardShared`
- `planner/PlannerClient.tsx`

**Other**
- `src/hooks/`: index, useCopyToClipboard, useDebouncedSearch, useLocalStorageState, useModal (none are used)
- `src/data/north-shop-products.ts`
- `src/lib/`: curtainHideRef, storage, supportsViewTransition
- `src/lib/scheduleUtils`: used only by a test. Remove it together with its test, or keep both.
- `public/js/snippet.js`: only referenced from a commented-out line in `layout.tsx`. Remove both.

**Not unused** (they looked unused but aren't): the Sanity schemas (loaded through `sanity.config.ts`).

## F. Files in `public/` that no code references (~52 MB)
These are copied into every deploy. Highlights:
- **Test uploads:** `uploads/fans/*` test photos and `uploads/featured/*.mp3` + `test-song.mp3` (13 MB). Real fan uploads should live in Supabase Storage, not in the repo.
- **Unused videos:** `movie/deep.mp4` (7.5 MB), `movie/test-slice.mp4`, and the `ship-sea/port-desktop/mobile` variants. The code uses `ship-sea.mp4` / `ship-port.mp4`.
- **PNG originals of images that are served as .webp:** `images/members/desktop-*.png`, `*-mobile.png`
- **`images/mockups/*`:** 27 files, including `planner.png` (5.2 MB). Only `merch-hoodie.png` is used.
- **Unused sitemap thumbnails:** `sitemap-thumbs/fan-pin-verification.png` (4.2 MB) + 38 small ones
- **Other:** `assets/2027--staroftheseas-bookingformf.pdf` (2.9 MB; check whether Sanity or an email links to it), `images/7hrrk/7hrrk-characters-lineup.png` (2.3 MB), `allC.png`, `file.svg`, `font-inspector.js`, `sitemap.html` (static, old)

**Used but much too big** (shrink, don't remove): `sitemap-thumbs/pin-filled-modal.jpg` (6.7 MB), `cruise-pin-verify-v2.jpg` (3.5 MB), `images/members/frankie.png` / `adam.png` / `nick.png` (3–3.6 MB each; the avatars use these PNGs where `.webp` copies exist).

### Full list

**uploads  (11 files, 13.3 MB)**

- `public/uploads/featured/featured_1782056954555_llp1gh.mp3` (3.55 MB)
- `public/uploads/featured/featured_1782059564206_0_yp8m1p.mp3` (3.55 MB)
- `public/uploads/fans/full_band_wide.png` (0.99 MB)
- `public/uploads/fans/test_image_1.png` (0.97 MB)
- `public/uploads/fans/drummer_action.png` (0.88 MB)
- `public/uploads/fans/concert_stage_energy.png` (0.87 MB)
- `public/uploads/fans/crowd_phones.png` (0.86 MB)
- `public/uploads/fans/acoustic_intimate.png` (0.85 MB)
- `public/uploads/fans/guitar_solo_purple.png` (0.81 MB)
- `public/uploads/fans/fan_1777689859254_hc1wwu.png` (0.02 MB)
- `public/uploads/featured/test-song.mp3` (0.00 MB)

**movie  (6 files, 9.4 MB)**

- `public/movie/deep.mp4` (7.47 MB)
- `public/movie/ship-sea-desktop.mp4` (0.93 MB)
- `public/movie/test-slice.mp4` (0.53 MB)
- `public/movie/ship-port-desktop.mp4` (0.27 MB)
- `public/movie/ship-sea-mobile.mp4` (0.14 MB)
- `public/movie/ship-port-mobile.mp4` (0.04 MB)

**images/mockups  (27 files, 8.1 MB)**

- `public/images/mockups/planner.png` (5.23 MB)
- `public/images/mockups/video.png` (0.33 MB)
- `public/images/mockups/bio.png` (0.33 MB)
- `public/images/mockups/live.png` (0.32 MB)
- `public/images/mockups/home.png` (0.26 MB)
- `public/images/mockups/cruise_dashboard.png` (0.21 MB)
- `public/images/mockups/news.png` (0.17 MB)
- `public/images/mockups/music.png` (0.16 MB)
- `public/images/mockups/cruise.png` (0.14 MB)
- `public/images/mockups/privacy.png` (0.12 MB)
- `public/images/mockups/live_stream.png` (0.11 MB)
- `public/images/mockups/terms.png` (0.11 MB)
- `public/images/mockups/iphone-frame.png` (0.08 MB)
- `public/images/mockups/merch.png` (0.07 MB)
- `public/images/mockups/lounge.png` (0.07 MB)
- `public/images/mockups/cruise_cancel.png` (0.06 MB)
- `public/images/mockups/book.png` (0.05 MB)
- `public/images/mockups/store.png` (0.04 MB)
- `public/images/mockups/admin.png` (0.04 MB)
- `public/images/mockups/profile.png` (0.04 MB)
- `public/images/mockups/product.png` (0.04 MB)
- `public/images/mockups/crew.png` (0.03 MB)
- `public/images/mockups/checklist.png` (0.03 MB)
- `public/images/mockups/live_sammy.png` (0.03 MB)
- `public/images/mockups/live_ryan.png` (0.03 MB)
- `public/images/mockups/live_tony.png` (0.02 MB)
- `public/images/mockups/fans.png` (0.02 MB)

**sitemap-thumbs  (39 files, 4.8 MB)**

- `public/sitemap-thumbs/fan-pin-verification.png` (4.21 MB)
- `public/sitemap-thumbs/payment-test.jpg` (0.04 MB)
- `public/sitemap-thumbs/crew-dashboard.jpg` (0.03 MB)
- `public/sitemap-thumbs/news.jpg` (0.02 MB)
- `public/sitemap-thumbs/admin-cruise-roster.jpg` (0.02 MB)
- `public/sitemap-thumbs/members.jpg` (0.02 MB)
- `public/sitemap-thumbs/pin-verification-modal.jpg` (0.02 MB)
- `public/sitemap-thumbs/video.jpg` (0.02 MB)
- `public/sitemap-thumbs/fan-dashboard-rejected.jpg` (0.02 MB)
- `public/sitemap-thumbs/music.jpg` (0.02 MB)
- `public/sitemap-thumbs/ticker.jpg` (0.02 MB)
- `public/sitemap-thumbs/live-flash-sale.jpg` (0.02 MB)
- `public/sitemap-thumbs/live-flash-ship-success.jpg` (0.01 MB)
- `public/sitemap-thumbs/live-flash-checkout.jpg` (0.01 MB)
- `public/sitemap-thumbs/live-flash-ship-checkout.jpg` (0.01 MB)
- `public/sitemap-thumbs/show-page.jpg` (0.01 MB)
- `public/sitemap-thumbs/payment.jpg` (0.01 MB)
- `public/sitemap-thumbs/fan-upload-success.jpg` (0.01 MB)
- `public/sitemap-thumbs/fan-upload-scanning.jpg` (0.01 MB)
- `public/sitemap-thumbs/fan-upload-form.jpg` (0.01 MB)
- `public/sitemap-thumbs/store-cart.jpg` (0.01 MB)
- `public/sitemap-thumbs/store-checkout.jpg` (0.01 MB)
- `public/sitemap-thumbs/store-products.jpg` (0.01 MB)
- `public/sitemap-thumbs/logged-in-store.jpg` (0.01 MB)
- `public/sitemap-thumbs/store-detail.jpg` (0.01 MB)
- `public/sitemap-thumbs/email-upload-rejected.jpg` (0.01 MB)
- `public/sitemap-thumbs/bio.jpg` (0.01 MB)
- `public/sitemap-thumbs/store.jpg` (0.01 MB)
- `public/sitemap-thumbs/email-newsletter-blast.jpg` (0.01 MB)
- `public/sitemap-thumbs/payment-test-result.jpg` (0.01 MB)
- `public/sitemap-thumbs/email-crew-sms-alert-received.jpg` (0.01 MB)
- `public/sitemap-thumbs/payment-test-checkout.jpg` (0.01 MB)
- `public/sitemap-thumbs/email-upload-approved.jpg` (0.01 MB)
- `public/sitemap-thumbs/email-flash-shipping.jpg` (0.01 MB)
- `public/sitemap-thumbs/raffle-loss-preview.jpg` (0.01 MB)
- `public/sitemap-thumbs/lyrics-page.jpg` (0.01 MB)
- `public/sitemap-thumbs/logged-in-checkout.jpg` (0.01 MB)
- `public/sitemap-thumbs/fans.jpg` (0.01 MB)
- `public/sitemap-thumbs/live-flash-success.jpg` (0.01 MB)

**images/members  (9 files, 4.6 MB)**

- `public/images/members/richard.png` (0.86 MB)
- `public/images/members/desktop-frank.png` (0.80 MB)
- `public/images/members/desktop-nick.png` (0.74 MB)
- `public/images/members/desktop-mark.png` (0.67 MB)
- `public/images/members/desktop-adam.png` (0.64 MB)
- `public/images/members/frank-mobile.png` (0.26 MB)
- `public/images/members/mark-mobile.png` (0.24 MB)
- `public/images/members/adam-mobile.png` (0.20 MB)
- `public/images/members/dicky-mobile.png` (0.18 MB)

**images/events  (6 files, 3.2 MB)**

- `public/images/events/acoustic.png` (0.59 MB)
- `public/images/events/corporate.png` (0.56 MB)
- `public/images/events/bar.png` (0.53 MB)
- `public/images/events/private-party.png` (0.53 MB)
- `public/images/events/wedding.png` (0.51 MB)
- `public/images/events/festival.png` (0.50 MB)

**assets  (1 files, 2.9 MB)**

- `public/assets/2027--staroftheseas-bookingformf.pdf` (2.90 MB)

**images/7hrrk  (1 files, 2.3 MB)**

- `public/images/7hrrk/7hrrk-characters-lineup.png` (2.34 MB)

**images/venues  (3 files, 1.4 MB)**

- `public/images/venues/trellis.png` (0.53 MB)
- `public/images/venues/surf.png` (0.48 MB)
- `public/images/venues/hideaway.png` (0.44 MB)

**images/cruise  (9 files, 1.3 MB)**

- `public/images/cruise/concert.png` (0.51 MB)
- `public/images/cruise/ship/header.png` (0.39 MB)
- `public/images/cruise/d4.jpg` (0.12 MB)
- `public/images/cruise/ports/cococay1.jpg` (0.12 MB)
- `public/images/cruise/ship/basecamp.jpg` (0.04 MB)
- `public/images/cruise/ship/playmakers.jpg` (0.04 MB)
- `public/images/cruise/ship/boleros.jpg` (0.04 MB)
- `public/images/cruise/richard.jpg` (0.02 MB)
- `public/images/cruise/alan.jpg` (0.02 MB)

**(root)  (4 files, 0.6 MB)**

- `public/allC.png` (0.29 MB)
- `public/sitemap.html` (0.27 MB)
- `public/font-inspector.js` (0.01 MB)
- `public/file.svg` (0.00 MB)

**images/comics  (1 files, 0.1 MB)**

- `public/images/comics/Roy.png` (0.14 MB)

**images/hero  (1 files, 0.1 MB)**

- `public/images/hero/hero-banner.webp` (0.10 MB)

**images/album  (2 files, 0.0 MB)**

- `public/images/album/spectrum.png` (0.03 MB)
- `public/images/album/next.png` (0.02 MB)

**images/ui  (1 files, 0.0 MB)**

- `public/images/ui/hand.svg` (0.01 MB)

**images/svg  (2 files, 0.0 MB)**

- `public/images/svg/destination.svg` (0.00 MB)
- `public/images/svg/car.svg` (0.00 MB)

## G. Dev/test pages (they go live as public URLs)
`/hambuger`, `/textcolor`, `/preloaders`, `/firecanvas`, `/slideup`, `/payment-test`, `/style-guide`, `/sitemap` (visual sitemap), `/features`, `/work/*`, `/crew-abbie`, `/crew-michael`, `/crew-ryan`, `/crew-sam`, `/crew-tony`, `/live/live_*` (old copies of `/live/[name]`).
Remove them, or block them in production (e.g. `notFound()` unless `NODE_ENV==="development"`). `/payment-test` at least should not be public.

## Suggested way to do it
1. Commit first.
2. Move everything from groups A–E into one `_to_delete/` folder, then run `npm run build` and click through the site.
3. If all is fine for a few days, delete `_to_delete/`.
4. Do group F after checking Sanity for `/images/` and `/uploads/` paths.
