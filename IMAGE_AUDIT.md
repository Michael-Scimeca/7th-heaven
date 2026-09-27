# Comprehensive Project Image Audit Report

> **Audit Scope**: Every static image under `public/` (PNG, JPG, JPEG, WEBP, AVIF, GIF, SVG). Checked against references in `src/`, `data/`, `supabase/`, `next.config.ts`, `public/*.json`, `public/_headers`, and Sanity CMS content.

---

## 📊 Summary Category Counts

| Classification | Total Files | Description & Action Rule |
| :--- | :--- | :--- |
| **1. DO NOT TOUCH** | **148** | System files, favicons, app icons, og-image, runtime `uploads/`, and email template images. |
| **2. LOOSE FILES (MOVE)** | **7** | Files currently floating in `public/` root → Move to appropriate subfolder under `public/images/`. |
| **3. DUPLICATE GROUPS** | **158 groups** | Byte-identical files (matching MD5 hash). Includes confirmation of `ship_all/` duplicate directory. |
| **4. RENAME CANDIDATES** | **244** | Files with non-standard names (uppercase, spaces, underscores, Amazon IDs, camera/stock IDs) → Convert to lowercase kebab-case. |
| **5. UNUSED IMAGES** | **345** | Images with 0 references across source code, config, database, or CMS → Safe for deletion or cleanup. |
| **TOTAL AUDITED** | **739** | Total image assets analyzed under `public/`. |

---

## 1. 🛡️ DO NOT TOUCH (System & Protected Assets)

| File Path | Size | Reason / Protection Rule |
| :--- | :--- | :--- |
| `public/apple-icon.png` | 13.8 KB | System / App Icon / Favicon |
| `public/apple-touch-icon.png` | 13.8 KB | System / App Icon / Favicon |
| `public/favicon.ico` | 3.2 KB | System / App Icon / Favicon |
| `public/icon-192.png` | 15.2 KB | System / App Icon / Favicon |
| `public/icon-512.png` | 72.5 KB | System / App Icon / Favicon |
| `public/images/comics/adam.png` | 26.2 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/comics/nick.png` | 34.0 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/abbie.png` | 296.9 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/al.png` | 278.0 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/andrea.png` | 245.4 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/arjun.png` | 279.2 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/chris.png` | 295.1 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/daniel.png` | 233.5 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/dave_croke.png` | 292.1 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/dave_maas.png` | 296.6 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/david_xu.png` | 307.3 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/emily.png` | 255.5 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/emma.png` | 259.2 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/erin.png` | 228.1 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/francesca.png` | 267.1 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/john_doe.png` | 232.3 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/crew/john_wick.png` | 285.5 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/members/adam.png` | 3.04 MB | Referenced in Email Templates (Absolute URL) |
| `public/images/members/dicky.png` | 2.11 MB | Referenced in Email Templates (Absolute URL) |
| `public/images/members/frankie.png` | 3.46 MB | Referenced in Email Templates (Absolute URL) |
| `public/images/members/mark.png` | 2.33 MB | Referenced in Email Templates (Absolute URL) |
| `public/images/members/nick.png` | 2.84 MB | Referenced in Email Templates (Absolute URL) |
| `public/images/merch/hoodie.png` | 233.8 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/merch/logo-tee.png` | 259.5 KB | Referenced in Email Templates (Absolute URL) |
| `public/images/merch/vinyl.png` | 295.5 KB | Referenced in Email Templates (Absolute URL) |
| `public/sitemap-thumbs/admin-checklist.jpg` | 7.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/admin-cruise-roster.jpg` | 23.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/admin-emailmap.jpg` | 19.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/admin-emails.jpg` | 21.9 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/admin-inventory.jpg` | 12.1 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/admin-legal.jpg` | 23.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/admin.jpg` | 26.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/albums.jpg` | 24.1 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/bio.jpg` | 10.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/book.jpg` | 37.1 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/contact.jpg` | 2.31 MB | System / App Icon / Favicon |
| `public/sitemap-thumbs/crew-dashboard-v2.jpg` | 38.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/crew-dashboard.jpg` | 24.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/crew-sms-roles.jpg` | 15.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/crew.jpg` | 13.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/cruise-dashboard.jpg` | 33.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/cruise-form-filled.jpg` | 51.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/cruise-pin-verify-v2.jpg` | 3.30 MB | System / App Icon / Favicon |
| `public/sitemap-thumbs/cruise-verify.jpg` | 6.4 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/cruise.jpg` | 34.1 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-booking-admin.jpg` | 9.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-booking-cancelled-admin.jpg` | 7.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-booking-confirm.jpg` | 9.4 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-booking-status.jpg` | 9.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-crew-hours-summary.jpg` | 9.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-crew-sms-alert-received.jpg` | 9.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-crew-sms-dispatched-alert.jpg` | 9.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-cruise-admin-notify.jpg` | 12.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-cruise-blast.jpg` | 12.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-cruise-cancel.jpg` | 7.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-cruise-confirm.jpg` | 9.9 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-cruise-welcome.jpg` | 11.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-fan-invitation.jpg` | 20.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-flash-pickup.jpg` | 9.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-flash-shipping.jpg` | 8.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-new-account-admin-alert.jpg` | 9.3 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-newsletter-blast.jpg` | 10.1 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-pin-verification.jpg` | 29.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-schedule-change-alert.jpg` | 9.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-shift-coverage-request.jpg` | 9.3 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-upload-approved.jpg` | 9.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-upload-rejected.jpg` | 10.9 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-welcome-crew.jpg` | 10.4 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-welcome-fan.jpg` | 9.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/email-welcome-planner.jpg` | 10.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/event-detail.jpg` | 11.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/fan-dashboard-rejected.jpg` | 19.1 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/fan-dashboard.jpg` | 31.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/fan-photo-wall.jpg` | 50.9 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/fan-pin-verification.png` | 4.02 MB | System / App Icon / Favicon |
| `public/sitemap-thumbs/fan-upload-form.jpg` | 11.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/fan-upload-scanning.jpg` | 11.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/fan-upload-success.jpg` | 11.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/fans.jpg` | 7.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/faq.jpg` | 31.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/features.jpg` | 15.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/flowchart-sitemap.jpg` | 16.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/forgot-password.jpg` | 7.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/home.jpg` | 42.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/live-feed.jpg` | 25.4 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/live-flash-checkout.jpg` | 14.3 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/live-flash-sale.jpg` | 15.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/live-flash-ship-checkout.jpg` | 14.3 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/live-flash-ship-success.jpg` | 14.3 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/live-flash-success.jpg` | 7.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/live-michael-dark.png` | 25.4 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/live-shopify-checkout.jpg` | 7.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/live.jpg` | 61.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/logged-in-checkout-scrolled.jpg` | 7.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/logged-in-checkout.jpg` | 7.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/logged-in-store.jpg` | 11.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/login-modal.jpg` | 18.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/lyrics-page.jpg` | 7.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/media.jpg` | 32.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/members.jpg` | 20.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/merch.jpg` | 20.1 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/music.jpg` | 18.9 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/news.jpg` | 23.3 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/payment-test-checkout.jpg` | 9.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/payment-test-result.jpg` | 10.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/payment-test.jpg` | 43.1 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/payment.jpg` | 12.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/picks.jpg` | 25.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/pin-filled-modal.jpg` | 6.38 MB | System / App Icon / Favicon |
| `public/sitemap-thumbs/pin-verification-modal.jpg` | 19.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/planner-dashboard-signed-in.jpg` | 4.98 MB | System / App Icon / Favicon |
| `public/sitemap-thumbs/planner-dashboard-v2.jpg` | 4.98 MB | System / App Icon / Favicon |
| `public/sitemap-thumbs/planner-pin-filled-v3.png` | 6.38 MB | System / App Icon / Favicon |
| `public/sitemap-thumbs/planner-pin-modal.jpg` | 6.38 MB | System / App Icon / Favicon |
| `public/sitemap-thumbs/planner.jpg` | 4.98 MB | System / App Icon / Favicon |
| `public/sitemap-thumbs/privacy.jpg` | 30.6 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/proximity-demo.jpg` | 11.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/raffle-entry-preview.jpg` | 7.3 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/raffle-loss-preview.jpg` | 8.3 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/raffle-win-preview.jpg` | 9.4 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/returns.jpg` | 12.8 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/show-page.jpg` | 14.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/shows.jpg` | 33.1 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/signup-modal.jpg` | 18.5 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/store-cart.jpg` | 11.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/store-checkout.jpg` | 11.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/store-detail.jpg` | 10.9 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/store-products.jpg` | 11.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/store-purchase-success.jpg` | 11.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/store.jpg` | 10.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/style-guide.jpg` | 30.7 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/terms.jpg` | 11.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/ticker.jpg` | 18.2 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/verify-admin-funnel.jpg` | 8.0 KB | System / App Icon / Favicon |
| `public/sitemap-thumbs/video.jpg` | 19.3 KB | System / App Icon / Favicon |
| `public/uploads/fans/acoustic_intimate.png` | 832.6 KB | Runtime Fan Upload Directory (`public/uploads/`) |
| `public/uploads/fans/concert_stage_energy.png` | 847.5 KB | Runtime Fan Upload Directory (`public/uploads/`) |
| `public/uploads/fans/crowd_phones.png` | 835.5 KB | Runtime Fan Upload Directory (`public/uploads/`) |
| `public/uploads/fans/drummer_action.png` | 860.6 KB | Runtime Fan Upload Directory (`public/uploads/`) |
| `public/uploads/fans/fan_1777689859254_hc1wwu.png` | 15.0 KB | Runtime Fan Upload Directory (`public/uploads/`) |
| `public/uploads/fans/full_band_wide.png` | 968.3 KB | Runtime Fan Upload Directory (`public/uploads/`) |
| `public/uploads/fans/guitar_solo_purple.png` | 787.1 KB | Runtime Fan Upload Directory (`public/uploads/`) |
| `public/uploads/fans/test_image_1.png` | 949.9 KB | Runtime Fan Upload Directory (`public/uploads/`) |

---

## 2. 📂 MOVE (Loose Files in `public/` Root)

| Current Path | Size | Proposed Target Path | Rationale |
| :--- | :--- | :--- | :--- |
| `public/allC.png` | 285.3 KB | `public/images/merch/all-c.png` | Move to merch images & rename to kebab-case |
| `public/file.svg` | 0.4 KB | `public/images/icons/file.svg` | Move to icons directory |
| `public/map-bg.png` | 531.2 KB | `public/images/tour/map-bg.png` | Move to tour section images |
| `public/michaelscimeca.png` | 394.4 KB | `public/images/crew/michaelscimeca.png` | Move to crew directory |
| `public/vin1.png` | 156.9 KB | `public/images/vinyl/vin-1.png` | Move to vinyl hero assets & rename to kebab-case |
| `public/vin2.png` | 147.1 KB | `public/images/vinyl/vin-2.png` | Move to vinyl hero assets & rename to kebab-case |
| `public/vin3.png` | 155.5 KB | `public/images/vinyl/vin-3.png` | Move to vinyl hero assets & rename to kebab-case |

---

## 3. 👯 DUPLICATES (Byte-Identical MD5 Matches)

### 🔍 `ship_all/` Directory Audit Confirmation

> **Audit Confirmation**: `public/images/cruise/ship_all` contains **134 image files**, and **ALL 134 files are 100% byte-identical (matching MD5 hash)** to their counterparts in `public/images/cruise/ship/`!
> **Recommendation**: `public/images/cruise/ship_all` is an unreferenced duplicate folder and can be safely removed.

### Duplicate Groups List (Sample of Major Duplicate Sets)

| Group | MD5 Hash | File Count | Sample Duplicate Paths |
| :--- | :--- | :--- | :--- |
| Group 1 | `d11e6098cd` | 6 | `public/images/cruise/ship/rci_ic_202401_cc_nmorley_surfside_splashawaybay_8245_rt-crop-u34854.jpg`<br>`public/images/cruise/ship/rci_ic_202401_cc_nmorley_surfside_splashawaybay_8245_rt-crop-u35601.jpg`<br>`public/images/cruise/ship/rci_ic_202401_cc_nmorley_surfside_splashawaybay_8245_rt-crop-u37692.jpg`<br>`public/images/cruise/ship_all/rci_ic_202401_cc_nmorley_surfside_splashawaybay_8245_rt-crop-u34854.jpg`<br>*...and 2 more* |
| Group 2 | `e912d1fdf8` | 4 | `public/images/mockups/live_broadcast.png`<br>`public/images/mockups/live_michael.png`<br>`public/sitemap-thumbs/live-feed.jpg`<br>`public/sitemap-thumbs/live-michael-dark.png` |
| Group 3 | `4d45cad373` | 4 | `public/images/mockups/planner.png`<br>`public/sitemap-thumbs/planner-dashboard-signed-in.jpg`<br>`public/sitemap-thumbs/planner-dashboard-v2.jpg`<br>`public/sitemap-thumbs/planner.jpg` |
| Group 4 | `1ef19d1764` | 4 | `public/images/cruise/ship/rci_ic_202401_cc_nmorley_flowrider_2477_rt-crop-u34851.jpg`<br>`public/images/cruise/ship/rci_ic_202401_cc_nmorley_flowrider_2477_rt-crop-u36245.jpg`<br>`public/images/cruise/ship_all/rci_ic_202401_cc_nmorley_flowrider_2477_rt-crop-u34851.jpg`<br>`public/images/cruise/ship_all/rci_ic_202401_cc_nmorley_flowrider_2477_rt-crop-u36245.jpg` |
| Group 5 | `c2ed908d6e` | 4 | `public/images/cruise/ship/rci_ic_202401_cc_nmorley_surfside_watersedgepool_7194_ibt_rt-crop-u35594.jpg`<br>`public/images/cruise/ship/rci_ic_202401_cc_nmorley_surfside_watersedgepool_7194_ibt_rt-crop-u36301.jpg`<br>`public/images/cruise/ship_all/rci_ic_202401_cc_nmorley_surfside_watersedgepool_7194_ibt_rt-crop-u35594.jpg`<br>`public/images/cruise/ship_all/rci_ic_202401_cc_nmorley_surfside_watersedgepool_7194_ibt_rt-crop-u36301.jpg` |
| Group 6 | `09eba715d7` | 3 | `public/images/comics/71d2WbDeBHL._SL1360_.jpg`<br>`public/images/7hrrk/artbook.jpg`<br>`public/images/7hrrk/comicbook1.jpg` |
| Group 7 | `085b895584` | 3 | `public/images/cruise/d1_ocean_view_balcony.jpg`<br>`public/images/cruise/d4.jpg`<br>`public/images/cruise/i1_infinite_ocean_view_balcony.jpg` |
| Group 8 | `f984c88a78` | 3 | `public/images/cruise/ship/aquadome.jpg`<br>`public/images/cruise/ship/rci_ic_3drender_aquadome_cgi08_ret.jpg`<br>`public/images/cruise/ship_all/rci_ic_3drender_aquadome_cgi08_ret.jpg` |
| Group 9 | `56d74af304` | 3 | `public/images/cruise/ship/backtothefurure.jpg`<br>`public/images/cruise/ship/backtothefuture.jpg`<br>`public/images/cruise/ship_all/backtothefurure.jpg` |
| Group 10 | `70547a37cb` | 3 | `public/images/cruise/ship/cat6-waterpark.jpg`<br>`public/images/cruise/ship/rci_ic_202401_cc_nmorley_cat6waterpark_hurricanehunter_gopr0154_rt-crop-u35622.jpg`<br>`public/images/cruise/ship_all/rci_ic_202401_cc_nmorley_cat6waterpark_hurricanehunter_gopr0154_rt-crop-u35622.jpg` |
| Group 11 | `a4e0d643ca` | 3 | `public/images/cruise/ship/central-park.jpg`<br>`public/images/cruise/ship/rci_ic_202401_cc_nmorley_chillovercentralpark_7267_rt-crop-u34803.jpg`<br>`public/images/cruise/ship_all/rci_ic_202401_cc_nmorley_chillovercentralpark_7267_rt-crop-u34803.jpg` |
| Group 12 | `c4ffd5edd2` | 3 | `public/images/cruise/ship/family-townhouse.jpg`<br>`public/images/cruise/ship/rci_ic_202401_cc_ahendel_ultimatefamilytownhouse_e43a2011_rt-crop-u36238.jpg`<br>`public/images/cruise/ship_all/rci_ic_202401_cc_ahendel_ultimatefamilytownhouse_e43a2011_rt-crop-u36238.jpg` |
| Group 13 | `be0844548b` | 3 | `public/images/cruise/ship/hideaway-pool.jpg`<br>`public/images/cruise/ship/rci_ic_202402_cc_ahendel_thehideawaypool_img_6259_rt-crop-u35016.jpg`<br>`public/images/cruise/ship_all/rci_ic_202402_cc_ahendel_thehideawaypool_img_6259_rt-crop-u35016.jpg` |
| Group 14 | `510ae9fd60` | 3 | `public/images/cruise/ship/izumi-hibachi.jpg`<br>`public/images/cruise/ship/izumis-hibachi.jpg`<br>`public/images/cruise/ship_all/izumis-hibachi.jpg` |
| Group 15 | `5b90ffe391` | 3 | `public/images/cruise/ship/lime-and-coconut.jpg`<br>`public/images/cruise/ship/limecoconut.jpg`<br>`public/images/cruise/ship_all/limecoconut.jpg` |
| Group 16 | `d7894c062c` | 3 | `public/images/cruise/ship/rci_ic_20240219_brand_jgraham_aerial_sunset_0999_rt-crop-u34688.jpg`<br>`public/images/cruise/ship/star-aerial-sunset.jpg`<br>`public/images/cruise/ship_all/rci_ic_20240219_brand_jgraham_aerial_sunset_0999_rt-crop-u34688.jpg` |
| Group 17 | `1d9d8caf54` | 3 | `public/images/cruise/ship/rci_ic_20240222_brand_jgraham_aerial_evening_1095_rt-crop-u34676.jpg`<br>`public/images/cruise/ship/star-aerial-evening.jpg`<br>`public/images/cruise/ship_all/rci_ic_20240222_brand_jgraham_aerial_evening_1095_rt-crop-u34676.jpg` |
| Group 18 | `9d0ee929c4` | 3 | `public/images/cruise/ship/schooner-bar.jpg`<br>`public/images/cruise/ship/schoonerbar.jpg`<br>`public/images/cruise/ship_all/schoonerbar.jpg` |
| Group 19 | `a117aabd07` | 3 | `public/sitemap-thumbs/pin-filled-modal.jpg`<br>`public/sitemap-thumbs/planner-pin-filled-v3.png`<br>`public/sitemap-thumbs/planner-pin-modal.jpg` |
| Group 20 | `3c3d4a58b2` | 2 | `public/allC.png`<br>`public/images/comics/allc.png` |
| Group 21 | `dfa39312a7` | 2 | `public/apple-icon.png`<br>`public/apple-touch-icon.png` |
| Group 22 | `e93b1fed7a` | 2 | `public/images/comics/51Q94xAzn7L.jpg`<br>`public/images/7hrrk/coloring-book.jpg` |
| Group 23 | `c8f4e5e929` | 2 | `public/images/comics/61y6zQf1hCL._SL1500_.jpg`<br>`public/images/7hrrk/book7.jpg` |
| Group 24 | `dd4b177330` | 2 | `public/images/comics/719CbfCsqyL._SL1500_.jpg`<br>`public/images/7hrrk/book5.jpg` |
| Group 25 | `1d9fc3844f` | 2 | `public/images/comics/719L5F4iUyL._SL1500_.jpg`<br>`public/images/7hrrk/book4.jpg` |
| Group 26 | `cef1d5718a` | 2 | `public/images/comics/71OoJ1jhGXL._SL1360_.jpg`<br>`public/images/7hrrk/book3.jpg` |
| Group 27 | `ee1ea338a8` | 2 | `public/images/comics/71j5h9aU3iS._SL1500_.jpg`<br>`public/images/7hrrk/book1.jpg` |
| Group 28 | `a78120436b` | 2 | `public/images/comics/71mgiiwhIGL._SL1500_.jpg`<br>`public/images/7hrrk/book8.jpg` |
| Group 29 | `53ebd9d2d7` | 2 | `public/images/comics/71njNs9hT2L._SL1500_.jpg`<br>`public/images/7hrrk/book9.jpg` |
| Group 30 | `45de5f9516` | 2 | `public/images/comics/71tQzMjwGaL._SL1360_.jpg`<br>`public/images/7hrrk/book2.jpg` |

*Total duplicate groups found: 158 (containing 342 total duplicate files).*

---

## 4. 🏷️ RENAME (Non-Conforming File Names)

> **Naming Rules**: Lowercase kebab-case, descriptive names, no Amazon IDs (`71tQzMjwGaL...`), no camera/stock IDs (`rci_ic_202401_cc_nmorley_...`), no capital letters (`Roy.png`, `DUNLOP.svg`). Keep `-mobile` suffixes and matching `.png`/`.webp` pairs named identically.

| Current File Path | Proposed New Path | Reason |
| :--- | :--- | :--- |
| `public/allC.png` | `public/allc.png` | Uppercase letters |
| `public/images/album/Be-Here.png` | `public/images/album/be-here.png` | Uppercase letters |
| `public/images/comics/51Q94xAzn7L.jpg` | `public/images/comics/51q94xazn7l.jpg` | Uppercase letters |
| `public/images/comics/61y6zQf1hCL._SL1500_.jpg` | `public/images/comics/61y6zqf1hcl.-sl1500-.jpg` | Underscores / spaces |
| `public/images/comics/719CbfCsqyL._SL1500_.jpg` | `public/images/comics/719cbfcsqyl.-sl1500-.jpg` | Underscores / spaces |
| `public/images/comics/719L5F4iUyL._SL1500_.jpg` | `public/images/comics/719l5f4iuyl.-sl1500-.jpg` | Underscores / spaces |
| `public/images/comics/71OoJ1jhGXL._SL1360_.jpg` | `public/images/comics/71ooj1jhgxl.-sl1360-.jpg` | Underscores / spaces |
| `public/images/comics/71d2WbDeBHL._SL1360_.jpg` | `public/images/comics/71d2wbdebhl.-sl1360-.jpg` | Underscores / spaces |
| `public/images/comics/71j5h9aU3iS._SL1500_.jpg` | `public/images/comics/71j5h9au3is.-sl1500-.jpg` | Underscores / spaces |
| `public/images/comics/71mgiiwhIGL._SL1500_.jpg` | `public/images/comics/71mgiiwhigl.-sl1500-.jpg` | Underscores / spaces |
| `public/images/comics/71njNs9hT2L._SL1500_.jpg` | `public/images/comics/71njns9ht2l.-sl1500-.jpg` | Underscores / spaces |
| `public/images/comics/71tQzMjwGaL._SL1360_.jpg` | `public/images/comics/dunlop-guitar-picks-pack.jpg` | Amazon product ID |
| `public/images/comics/81yWx2cHMjL._SL1500_.jpg` | `public/images/comics/81ywx2chmjl.-sl1500-.jpg` | Underscores / spaces |
| `public/images/comics/Dicky.png` | `public/images/comics/dicky.png` | Uppercase letters |
| `public/images/comics/Frank.png` | `public/images/comics/frank.png` | Uppercase letters |
| `public/images/comics/Mark.png` | `public/images/comics/mark.png` | Uppercase letters |
| `public/images/comics/Roy.png` | `public/images/comics/roy.png` | Uppercase letters |
| `public/images/contact/Alan-contact-mobile.png` | `public/images/contact/alan-contact-mobile.png` | Uppercase letters |
| `public/images/contact/Alan-contact-mobile.webp` | `public/images/contact/alan-contact-mobile.webp` | Uppercase letters |
| `public/images/contact/Alan-contact.png` | `public/images/contact/alan-contact.png` | Uppercase letters |
| `public/images/contact/Alan-contact.webp` | `public/images/contact/alan-contact.webp` | Uppercase letters |
| `public/images/contact/Dickie-contact-mobile.png` | `public/images/contact/dickie-contact-mobile.png` | Uppercase letters |
| `public/images/contact/Dickie-contact-mobile.webp` | `public/images/contact/dickie-contact-mobile.webp` | Uppercase letters |
| `public/images/contact/Dickie-contact.png` | `public/images/contact/dickie-contact.png` | Uppercase letters |
| `public/images/contact/Dickie-contact.webp` | `public/images/contact/dickie-contact.webp` | Uppercase letters |
| `public/images/contact/Jeff-contact-mobile.png` | `public/images/contact/jeff-contact-mobile.png` | Uppercase letters |
| `public/images/contact/Jeff-contact-mobile.webp` | `public/images/contact/jeff-contact-mobile.webp` | Uppercase letters |
| `public/images/contact/Jeff-contact.png` | `public/images/contact/jeff-contact.png` | Uppercase letters |
| `public/images/contact/Jeff-contact.webp` | `public/images/contact/jeff-contact.webp` | Uppercase letters |
| `public/images/contact/Lenny-contact-mobile.png` | `public/images/contact/lenny-contact-mobile.png` | Uppercase letters |
| `public/images/contact/Lenny-contact-mobile.webp` | `public/images/contact/lenny-contact-mobile.webp` | Uppercase letters |
| `public/images/contact/Lenny-contact.png` | `public/images/contact/lenny-contact.png` | Uppercase letters |
| `public/images/contact/Lenny-contact.webp` | `public/images/contact/lenny-contact.webp` | Uppercase letters |
| `public/images/contact/Mary-contact-mobile.png` | `public/images/contact/mary-contact-mobile.png` | Uppercase letters |
| `public/images/contact/Mary-contact-mobile.webp` | `public/images/contact/mary-contact-mobile.webp` | Uppercase letters |
| `public/images/contact/Mary-contact.png` | `public/images/contact/mary-contact.png` | Uppercase letters |
| `public/images/contact/Mary-contact.webp` | `public/images/contact/mary-contact.webp` | Uppercase letters |
| `public/images/cruise/d1_ocean_view_balcony.jpg` | `public/images/cruise/d1-ocean-view-balcony.jpg` | Underscores / spaces |
| `public/images/cruise/i1_infinite_ocean_view_balcony.jpg` | `public/images/cruise/i1-infinite-ocean-view-balcony.jpg` | Underscores / spaces |
| `public/images/cruise/icon_ig_infinite_grand_suite_320x171.jpg` | `public/images/cruise/icon-ig-infinite-grand-suite-320x171.jpg` | Underscores / spaces |
| `public/images/cruise/ports/june_2024.jpg` | `public/images/cruise/ports/june-2024.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_cococay_cocobeachclubinfinitypool_ret.jpg` | `public/images/cruise/ports/rci-cococay-cocobeachclubinfinitypool-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_cococay_overwatercabana1_ret.jpg` | `public/images/cruise/ports/rci-cococay-overwatercabana1-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_cococay_overwatercabanas2.jpg` | `public/images/cruise/ports/rci-cococay-overwatercabanas2.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_pdc_032019_ssorace_balloon_dsc06089_ret.jpg` | `public/images/cruise/ports/rci-pdc-032019-ssorace-balloon-dsc06089-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_pdc_042019_daredevilstower_ret.jpg` | `public/images/cruise/ports/rci-pdc-042019-daredevilstower-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_pdc_042019_nfernandez_daredevilstower_2z4a1982_ret.jpg` | `public/images/cruise/ports/rci-pdc-042019-nfernandez-daredevilstower-2z4a1982-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_pdc_042019_splashawaybay_dji_0212-2_ret.jpg` | `public/images/cruise/ports/rci-pdc-042019-splashawaybay-dji-0212-2-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_pdc_052019_adamhendel_entrance_dji_0722_ret.jpg` | `public/images/cruise/ports/rci-pdc-052019-adamhendel-entrance-dji-0722-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_pdc_052019_ahendel_cococay_splashsummit_dji_0708_ret.jpg` | `public/images/cruise/ports/rci-pdc-052019-ahendel-cococay-splashsummit-dji-0708-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_pdc_052019_jetsettingfamily_splashawaybay_17_ret.jpg` | `public/images/cruise/ports/rci-pdc-052019-jetsettingfamily-splashawaybay-17-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_pdc_052019_jlisiewski_wavepool_573_ret.jpg` | `public/images/cruise/ports/rci-pdc-052019-jlisiewski-wavepool-573-ret.jpg` | Underscores / spaces |
| `public/images/cruise/ports/rci_pdc_052019_nmorley_pano_0444_ret.jpg` | `public/images/cruise/ports/rci-pdc-052019-nmorley-pano-0444-ret.jpg` | Underscores / spaces |
| `public/images/cruise/q2_interior_plus.jpg` | `public/images/cruise/q2-interior-plus.jpg` | Underscores / spaces |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_chillisland_hottub_2d8a2170_rt-crop-u34797.jpg` | `public/images/cruise/ship/ahendel-chillisland-hottub-2d8a2170-rt-crop-u34797.jpg` | Stock / camera asset ID |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_chillisland_hottub_e43a3756_rt-crop-u35531.jpg` | `public/images/cruise/ship/ahendel-chillisland-hottub-e43a3756-rt-crop-u35531.jpg` | Stock / camera asset ID |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_chillisland_hottub_e43a3798_rt-crop-u34839.jpg` | `public/images/cruise/ship/ahendel-chillisland-hottub-e43a3798-rt-crop-u34839.jpg` | Stock / camera asset ID |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_miadeptureinaug_dji_0367_rt-crop-u34716.jpg` | `public/images/cruise/ship/ahendel-miadeptureinaug-dji-0367-rt-crop-u34716.jpg` | Stock / camera asset ID |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_surfsideeatery_e43a3370_rt-crop-u36252.jpg` | `public/images/cruise/ship/ahendel-surfsideeatery-e43a3370-rt-crop-u36252.jpg` | Stock / camera asset ID |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_thepearl_2d8a5287_rt-crop-u35013.jpg` | `public/images/cruise/ship/ahendel-thepearl-2d8a5287-rt-crop-u35013.jpg` | Stock / camera asset ID |

*Total rename candidates: 244 files across public/.*

---

## 5. 🗑️ UNUSED IMAGES (0 References Found)

| File Path | Size | Search Status |
| :--- | :--- | :--- |
| `public/allC.png` | 285.3 KB | 0 references found in code, schemas, or configs |
| `public/file.svg` | 0.4 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/7hrrk-characters-lineup.png` | 2.23 MB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/artbook.jpg` | 199.9 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/book1.jpg` | 162.3 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/book2.jpg` | 236.7 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/book3.jpg` | 185.8 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/book4.jpg` | 136.1 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/book5.jpg` | 154.4 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/book6.jpg` | 266.9 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/book7.jpg` | 124.7 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/book8.jpg` | 177.3 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/book9.jpg` | 198.5 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/coloring-book.jpg` | 55.2 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/comicbook1.jpg` | 199.9 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/header.jpg` | 613.3 KB | 0 references found in code, schemas, or configs |
| `public/images/7hrrk/kids1.png` | 613.3 KB | 0 references found in code, schemas, or configs |
| `public/images/album/behere-local.jpg` | 24.7 KB | 0 references found in code, schemas, or configs |
| `public/images/album/covered-local.jpg` | 9.2 KB | 0 references found in code, schemas, or configs |
| `public/images/album/next.png` | 15.4 KB | 0 references found in code, schemas, or configs |
| `public/images/album/popmedley4-local.jpg` | 31.2 KB | 0 references found in code, schemas, or configs |
| `public/images/album/spectrum.png` | 32.6 KB | 0 references found in code, schemas, or configs |
| `public/images/comics/Roy.png` | 136.0 KB | 0 references found in code, schemas, or configs |
| `public/images/comics/allcharacters2024.png` | 530.6 KB | 0 references found in code, schemas, or configs |
| `public/images/contact/Alan-contact-mobile.png` | 216.3 KB | 0 references found in code, schemas, or configs |
| `public/images/contact/Jeff-contact-mobile.png` | 242.1 KB | 0 references found in code, schemas, or configs |
| `public/images/contact/Lenny-contact-mobile.png` | 258.0 KB | 0 references found in code, schemas, or configs |
| `public/images/contact/Mary-contact-mobile.png` | 260.2 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/alan.jpg` | 21.2 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/bookingbuttonsm.jpg` | 27.7 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/cruise-verify-bg.jpg` | 64.2 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/d4.jpg` | 119.6 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/hero-video-poster-mobile.jpg` | 15.7 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/icon_ig_infinite_grand_suite_320x171.jpg` | 7.7 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/coccocay4.jpg` | 103.3 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/cococay1.jpg` | 118.8 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/rci_cococay_overwatercabana1_ret.jpg` | 41.1 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/rci_pdc_032019_ssorace_balloon_dsc06089_ret.jpg` | 98.6 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/rci_pdc_042019_nfernandez_daredevilstower_2z4a1982_ret.jpg` | 54.6 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/rci_pdc_042019_splashawaybay_dji_0212-2_ret.jpg` | 121.9 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/rci_pdc_052019_adamhendel_entrance_dji_0722_ret.jpg` | 76.9 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/rci_pdc_052019_ahendel_cococay_splashsummit_dji_0708_ret.jpg` | 72.3 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/rci_pdc_052019_jetsettingfamily_splashawaybay_17_ret.jpg` | 84.4 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/rci_pdc_052019_jlisiewski_wavepool_573_ret.jpg` | 45.3 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ports/rci_pdc_052019_nmorley_pano_0444_ret.jpg` | 79.2 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/richard.jpg` | 22.5 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/2027-activities.png` | 8.0 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/2027-bar-clubs-lounges.png` | 16.7 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/2027-entertainment.png` | 11.8 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/2027-food-included.png` | 11.1 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/2027-food-with-fee.png` | 10.1 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/2027-kids-families.png` | 12.3 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/2027-ship.png` | 4.2 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/backtothefuture.jpg` | 33.6 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/basecamp.jpg` | 42.3 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/boleros.jpg` | 35.0 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/celebrationtable.jpg` | 36.9 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/coastalkitchen.jpg` | 35.5 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/cremedelacrepe.jpg` | 27.7 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/desserted.jpg` | 31.1 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/ellocofresh.jpg` | 30.5 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/escaperoom.jpg` | 37.1 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/facebook-icon-round.png` | 4.2 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/feta.jpg` | 29.7 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/giovannis.jpg` | 30.9 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/header.png` | 382.0 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/hookedseafood.jpg` | 29.5 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/instgram-icon-round.png` | 3.8 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/izumi-inthepark.jpg` | 39.3 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/izumis-hibachi.jpg` | 35.1 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/izumis-sushi.jpg` | 28.8 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/lacocinita.jpg` | 32.0 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/lincolnparksupperclub.jpg` | 27.5 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/livemusic.jpg` | 39.8 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/logo-web-small.png` | 15.1 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/maindiningroom.jpg` | 39.0 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/maithai.jpg` | 26.3 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/overlook-crop-u34842.jpg` | 38.3 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/parkcafe.jpg` | 30.6 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/pearlcafe.jpg` | 27.1 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/pier7.jpg` | 36.8 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/pigoutbbq.jpg` | 24.5 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/playmakers.jpg` | 36.2 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/pool1-crop-u35482.jpg` | 35.9 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/poolbar.jpg` | 32.6 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_chillisland_hottub_2d8a2170_rt-crop-u34797.jpg` | 34.2 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_chillisland_hottub_e43a3756_rt-crop-u35531.jpg` | 28.8 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_chillisland_hottub_e43a3798_rt-crop-u34839.jpg` | 27.6 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_miadeptureinaug_dji_0367_rt-crop-u34716.jpg` | 23.8 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_surfsideeatery_e43a3370_rt-crop-u36252.jpg` | 28.2 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_ahendel_thepearl_2d8a5287_rt-crop-u35013.jpg` | 32.9 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_jlisiewski_centralpark_0070_rt-crop-u34914.jpg` | 40.8 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_jlisiewski_crownsedge_055_rt-crop-u35496.jpg` | 21.1 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_jlisiewski_desserted_0265_rt-crop-u36315.jpg` | 33.0 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_nmorley_adrenalinepeak_6169_rt-crop-u36259.jpg` | 22.9 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_nmorley_casinoroyal_7568_rt-crop-u35489.jpg` | 40.9 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_nmorley_chill-island_hammock_9802_rt-crop-u36280.jpg` | 29.4 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_nmorley_chill-island_hottub_3370_rt-crop-u36266.jpg` | 26.7 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_nmorley_chillovercentralpark_7267_rt-crop-u34803.jpg` | 39.6 KB | 0 references found in code, schemas, or configs |
| `public/images/cruise/ship/rci_ic_202401_cc_nmorley_flowrider_2477_rt-crop-u34851.jpg` | 28.8 KB | 0 references found in code, schemas, or configs |

*Total unused images: 345 files (total size: 41.32 MB).*
