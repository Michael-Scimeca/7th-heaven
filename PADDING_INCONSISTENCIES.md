# Padding Inconsistencies — 7thHeaven

Found by reading the code of every page (and the components each page uses). Not measured in a browser, so confirm visually before fixing.

## The standard (what most pages use)
| What | Standard | Defined in |
|---|---|---|
| Space under the fixed header | `page-container` → 100px desktop / 85px ≤1024px | globals.css ~2304 |
| Side gutter + max width | `site-container` → max-width 1440px, padding `var(--spacing-gutter)` (both `!important`) | globals.css ~2262 |
| Section top/bottom padding | `py-section-fluid` (old, vw-based) **or** `.section` / `.section-sm` (new, `--spacing-section`) | globals.css ~3851 / ~2271 |

Note: there are also 3 different "header offset" tokens: `--header-height: 80px`, `page-container` 100/85px, `--page-top-offset: 120px`.

---

## 1. Space under the header (top offset) — 7 different values
| Page | Uses | Value |
|---|---|---|
| /book, /book/[username], /contact, /cruise, /faq, /live, /media, /news/[slug], /payment, /privacy, /returns, /terms, /rock-and-roll-kids, /shows/past, /fan-photo-wall, /fan-media-wall, /fans/[username], /admin/[username] | `page-container` ✅ | 100px / 85px |
| /merch | `pt-[123px]` (merch/page.tsx:347) | 123px |
| /shows/[id] | `pt-[123px]` (ShowPageClient.tsx:392) | 123px |
| /notifications | `pt-[var(--page-top-offset)]` (page.tsx:167) | 120px |
| /features | `pt-40` (features/page.tsx:85) | 160px |
| /cruise/dashboard | `pt-32` (page.tsx:171) | 128px |
| /admin/shop-inventory | `pt-32` (page.tsx:139, 159) | 128px |
| /cruise/[username] | `page-container` **plus** `pt-32` (page.tsx:789) and `pt-24` (:1190) | stacked / double |
| /admin/legal | `pt-28` (page.tsx:452) | 112px |
| /cruise/preview | `pt-28` (page.tsx:497) | 112px |
| /admin/email-map | `pt-24` (page.tsx:93) | 96px |
| /sitemap/flows | `pt-24` (page.tsx:13) | 96px |
| /admin/emails | `pt-[72px]` (page.tsx:79) | 72px |
| /cruise/cancel | `pt-[72px]` (page.tsx:123) | 72px |
| /crew (+ /crew-abbie, -michael, -ryan, -sam, -tony, /crew/[slug]), /planner, /sitemap | none found | 0 — check it doesn't sit under the header |
| /book/success, /book/cancel, /claim/[pin], /cruise/verify, /crew/verify, /planner/verify, /fans, /fans/complete-profile | full-screen centered (`min-h-screen items-center`) | OK if intended — but each is built differently |
| / (home), /live/* rooms | full-bleed hero | OK (intended) |

## 2. Side gutter / page width
### a) Width silently ignored (bug)
`site-container` sets `max-width: 1440px !important` and `padding: var(--spacing-gutter) !important`, so these narrower widths and extra padding **do nothing** — the content is wider than intended:
| Where | Intended | Actually |
|---|---|---|
| /payment (payment/page.tsx:75) | `max-w-xl px-6` | 1440px, standard gutter |
| /planner (PlannerClient.tsx:219) | `max-w-4xl px-4` | 1440px |
| /planner (PlannerClient.tsx:359) | `max-w-[1400px]` | 1440px |
| /admin/shop-inventory (page.tsx:160) | `max-w-5xl px-6` | 1440px |
| MemberDashboard.tsx:432 (fans/member pages) | `max-w-xl` | 1440px |
| BioScrollReveal.tsx:72 | `px-6` | standard gutter |
| (works, different approach) CrewFeed.tsx:230, 246 | `!max-w-[800px]` | 800px |

### b) Own container instead of `site-container` (own max-width + own px)
- /merch — 2 containers `mx-auto max-w-4xl px-4` (merch/page.tsx)
- /cruise — 1 custom container
- /cruise/[username] — 1 custom container
- /sitemap, /sitemap/flows — custom containers

### c) No `site-container` at all
/features, /claim/[pin], /cruise/verify, /cruise/dashboard, /cruise/cancel, /planner/verify, /admin/email-map, /admin/emails, /sitemap — each sets its own side padding (e.g. /features `px-6`), so the left edge doesn't line up with other pages.

## 3. Section top/bottom padding
### a) Sections with NO vertical padding (blocks touch each other — like the /book screenshot)
| Page | Sections with none | Other values on the same page |
|---|---|---|
| /fans/[username] | 8 of 8 | — |
| /book | 7 of 11 | mixes `section`, `section-sm`, `py-section-fluid` ×2 |
| /crew + all crew-* pages (CrewDashboard) | 5 of 5 | — |
| /media | 3 | `pb-6` |
| /admin/[username] | 3 | — |
| /cruise | 2 | `py-section-fluid` ×2 |
| /cruise/[username] | 2 | `pt-16 md:pt-24` |
| /shows/past | 2 | — |
| /contact, /live, /fan-photo-wall, /fan-media-wall, /news/[slug], /book/success, /planner/verify | 1 each | fan walls also use `py-section-fluid` ×2 |
| / (home) — SlideupSection | 1 | — |

### b) Different fixed values on one page
- /features — `pt-40 pb-28`, `py-24` ×3, `py-32` → three different section paddings on one page.

### c) Home page — uneven gaps between sections
Each home section sets its own spacing:
| Section | Spacing |
|---|---|
| HomeMerch, HomeNewsSection | `py-section-fluid` ✅ |
| HomeVideoShowcase | only `mb-6` inside |
| HomeLogosSection | `py-1.5`, `mb-6` |
| BioParallaxSlider | `mb-4 pb-3` |
| TourList | none on the wrapper |
| SlideupSection | none |

### d) Two section systems in use at once
Old `py-section-fluid` (vw-based, `!important`) and new `.section` / `.section-sm` (`--spacing-section`). /book already mixes both.

## 4. Pages that are consistent ✅
/rock-and-roll-kids (all sections `py-section-fluid` + page-container + site-container), /faq, /privacy, /terms, /returns, /payment (except the width bug above).
