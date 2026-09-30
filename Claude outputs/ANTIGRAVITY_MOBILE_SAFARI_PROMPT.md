# Task: Make the 7th Heaven site excellent on mobile, and fix Safari / iOS bugs

Repo: `7th-heaven`, built with Next.js 16 (App Router, Turbopack), React 19 and Tailwind v4. Most fans visit on an iPhone, so **iOS Safari is the main browser to target**. This is a separate pass from the performance work. If `PERF_BEST_PRACTICES_REPORT.md` exists, read it first and don't undo anything it changed.

## Before changing anything: set up a way to reproduce Safari bugs
1. Add WebKit projects to `playwright.config.ts`: `webkit` desktop, plus `devices['iPhone 15']` and `devices['iPhone SE']`, which use WebKit. Keep the existing projects.
2. Write a Playwright smoke test that visits every public route on the iPhone projects and fails on console errors, page errors, horizontal overflow (`document.documentElement.scrollWidth > innerWidth`), and any tap target smaller than 44×44 px in the header, footer or main CTAs.
3. Do a manual check too, in the **Xcode iOS Simulator (Safari)** and desktop Safari. Playwright WebKit doesn't reproduce iOS toolbar/viewport behavior, fullscreen video or memory crashes. Record what you find in a short checklist before you start fixing.
4. `package.json` has a `browserslist` field **and** there's also a `.browserslistrc`. Browserslist can throw when both exist, and they may disagree. Keep one of them (Safari ≥ 15 minimum) and delete the other.

## Known issues I found in the code: fix these
**Viewport and the iOS toolbar**
- The `viewport` export in `src/app/layout.tsx` has no `viewportFit: "cover"`, and **nothing in the code uses `env(safe-area-inset-*)`**. Add `viewportFit: "cover"` and add safe-area padding to every fixed or sticky element: the header, bottom bars, drawers (`PagesPillDrawer`, `MemberFactSheetDrawer`, the `BioParallaxSlider` side panel), the cookie banner, `ScrollToTop`, chat input bars (`ChatInputBar`, `CruiseChat`, `DirectMessageChat`), and modals. Nothing should sit under the notch or the home indicator.
- `100vh` / `h-screen` / `min-h-screen` is used in 16 files. It's the most common iOS bug: the page jumps and the bottom gets cut off when the Safari toolbar shows or hides. Check each one:
  - Full-screen hero sections (`app/page.tsx` `!h-[calc(100vh)]`, `HeroYTBackground`, cruise hero) → `100svh`, so the size stays stable and doesn't jump while scrolling.
  - Full-screen overlays, lightboxes and drawers (`MediaClient` and `FanPhotoWallClient` lightbox `h-screen w-screen` and `h-[calc(100vh-3.5rem)]`, `BioParallaxSlider` panel, `CruiseChat` `h-[calc(100vh-12rem)]`) → `100dvh`.
  - `min-h-screen` page wrappers → `min-h-dvh`, or remove it if not needed. Also `globals.css` lines ~391 and ~654.
  - Keep `vh` as a fallback where Safari 15.0–15.3 matters.
- `100vw` / `w-screen` is used in 11 files. It causes horizontal scroll whenever there's a scrollbar. Replace it with `w-full` or `inset-0` unless there's a real reason for it.

**Scroll locking and modals**
- `ModalDialog` locks scroll with `document.body.style.overflow = "hidden"`. **That doesn't stop background scrolling on iOS Safari.** Build one shared `useScrollLock` hook that works on iOS (the `position: fixed` + saved `scrollY` + restore pattern, or `overscroll-behavior: contain` on the scroller with `touch-action` guards), and use it in **every** modal, drawer, lightbox and menu, including the mobile nav in `Header`, `LoginModal`, `PushSubscribeModal`, `PagesPillDrawer` and the lightboxes. Restore the scroll position exactly on close. The hook also has to work with the Lenis instance (`window.__lenis.stop()/start()`) on desktop.
- Check that modals trap focus, close with Escape and the Android back gesture where sensible, and don't jump when the iOS keyboard opens.

**Video on iPhone**
- `CruiseVideoGallery.tsx` has a `<video autoPlay muted controls>` **without `playsInline`**, so iPhones throw it into fullscreen. Add `playsInline`. Check every `<video>` element for `playsInline` + `muted` wherever autoplay is expected.
- The mobile hero video (`HeroVideoPlayer`, `/movie/hero-mobile.mp4`) uses `preload="auto"`, and so does the header video in `Header.tsx`. On a phone data connection that downloads the whole file before anything else. Use `preload="metadata"` or `"none"` and start playback after first paint. Respect `navigator.connection.saveData` and Low Power Mode: if `play()` rejects, keep the poster showing and don't leave an empty black box. Always handle the promise `video.play()` returns.
- Check the YouTube embeds (`CustomYTPlayer`, `InlineYTPlayer`, `CustomVideoPlayer`) on iOS: `playsinline=1` in playerVars, autoplay only when muted, a visible tap-to-play fallback, and working fullscreen.

**Heavy GPU effects: the likely cause of Safari scroll jank and tab crashes**
- `backdrop-blur` / `backdrop-filter` appears 125 times in 39 files, `filter: blur` 122 times, `clip-path` 105 times, `mask-image` 38 times, plus fixed `ProgressiveBlur`, a WebGL `HomeShaderGradient` that renders on every page, and `PixelFireplaceCanvas`. Stacked blurs on fixed or scrolling layers are the classic cause of iOS Safari jank and "A problem repeatedly occurred" reloads.
  - On iOS / small screens, limit it to **one** live backdrop blur on screen at a time (the header). Use a solid or semi-transparent background as the fallback elsewhere (`@supports` or a `@media (max-width) / (pointer: coarse)` rule). Desktop keeps the full effect.
  - Don't animate `filter: blur()`, `clip-path` or `mask` on large elements during scroll on mobile. Animate `transform` and `opacity` instead.
  - Check that `-webkit-backdrop-filter` and `-webkit-mask-image` are in the **built** CSS. Tailwind v4 / Lightning CSS should add the prefixes; verify in `.next` output, and add them where they're missing.
  - `HomeShaderGradient` and other canvases: pause when off-screen or the tab is hidden, cap `devicePixelRatio` at 1.5–2 on mobile, render a static gradient image if WebGL isn't available or `prefers-reduced-motion` is set, and free the WebGL context on unmount. Watch memory in Safari Web Inspector; it should stay flat while scrolling the whole homepage twice.
- `will-change` shows up 19 times. Remove the permanent ones and only apply it during an animation.

**Hover and touch**
- Tailwind v4's `hover:` is already wrapped in `@media (hover: hover)`, but **plain `:hover` rules in `globals.css` aren't**. On iPhone they cause sticky hover states and a "double tap to click" effect. Wrap them in `@media (hover: hover) and (pointer: fine)`.
- Anything that only shows on hover (tooltips, overlays on cards, video previews) needs a tap or focus equivalent on touch devices.
- Add `touch-action: manipulation` to buttons and links globally to remove the tap delay. Add `-webkit-tap-highlight-color: transparent` together with a visible `:focus-visible` style.
- Make all tap targets at least 44×44 px, and keep adjacent targets at least 8 px apart, especially the header icons, carousel dots, close buttons and the audio player controls.

**Forms (booking, cruise, contact, login, chat)**
- iOS zooms in on any input with font-size under 16px. Make sure every `input`, `select` and `textarea` computes to **≥ 16px** on mobile, including custom components (`GlowInput`, `InputField`, `FormInput`, `SearchInput`, `CalendarPicker`, `MiniDatePicker`, `CustomDropdown`, `GooeyDropdown`). **Don't** fix this by disabling zoom in the viewport.
- Add proper `type`, `inputMode`, `autoComplete`, `enterKeyHint` and `autoCapitalize` values (email, tel, name, one-time-code for the PIN fields, etc.).
- When the keyboard opens, the focused field and the submit button must stay visible. Use `visualViewport` for chat input bars fixed to the bottom, and test in the Simulator with the keyboard up.
- Remove or guard `autoFocus` on mobile (8 cases), because it opens the keyboard unexpectedly.

**Scroll and navigation**
- `SmoothScroll` already skips Lenis on touch. Also check that `scrollIntoView({behavior:'smooth'})` / `window.scrollTo` (about 20 calls) behave correctly on iOS. Offset them with `scroll-margin-top` equal to the header height + safe area.
- `startViewTransition` / the `PageTransition` curtain (`clip-path`) must work on Safari 18+ and fall back cleanly on older versions. Test back/forward navigation (bfcache) in Safari: no stuck curtain, preloader or `is-preloading` class after going back.
- Check that `position: sticky` elements (21 uses) actually stick in Safari. Parents with `overflow: hidden` break sticky. Use `overflow: clip` where needed.
- Add `overscroll-behavior: contain` on inner scrollers (chat, drawers, carousels) so they don't scroll the page behind them.

**JavaScript that behaves differently in Safari**
- `new Date(\`${dateStr}, ${currentYear}\`)` in `lib/tour-helpers.ts` and `lib/date-utils.ts` (duplicated code, so merge the two), plus the `new Date(dateStr)` fallbacks. Safari's date parser is stricter than Chrome's and returns `Invalid Date` for formats like `"Oct 12th"`, `"10/12"` or `"2026-10-12 19:00"`. Write a unit test with every date format Sanity or Supabase actually return, run it under WebKit, and parse explicitly instead of relying on `Date` string parsing.
- `localStorage` is used directly in 19 files. Put all access through the existing `useLocalStorageState` / one try/catch helper, since Safari private mode and ITP can throw or clear storage.
- `requestIdleCallback`: already feature-checked. Confirm the fallback timings are sensible on iOS.
- Web Push only works on iOS after the site is added to the home screen (iOS 16.4+). `PushSubscribeModal` / `PushAlertsCard` should detect that and show "Add to Home Screen" instructions instead of failing silently.

## General mobile UX pass (390 px and 360 px wide)
- No horizontal scroll on any route.
- Readable type: body ≥ 16px, and no `8px`/`10px`/`11px` text for real content. `globals.css` has several of these.
- Headings don't overflow with long words (`overflow-wrap: anywhere` / `hyphens: auto` on the Tanker display font).
- Images sized for mobile (`sizes` attributes), and no layout shift when fonts or images load.
- Carousels and sliders (`BioParallaxSlider`, `LogoTicker`, `SlideupSection`) swipe smoothly, don't block vertical page scroll, and can be used without hover.
- The mobile menu opens and closes smoothly, locks scroll, and every link is reachable with a thumb.
- Add a proper web app manifest and `apple-touch-icon` + `theme-color` (light/dark) if they're missing, so "Add to Home Screen" looks right.

## Rules
- Visual design stays the same on desktop. On mobile, only change what's needed to fix a bug or a clear UX problem. List anything that changes the look, and wait for my OK before doing it.
- Don't disable zoom, don't use user-agent sniffing to hide problems, and don't turn off lint or doctor rules.
- Put shared fixes in one place: a `useScrollLock` hook, a safe-area utility, and one date parser.
- Small commits, one issue per commit. Run `npm run check-all`, `npm run build` and the new WebKit Playwright suite after each group.

## Report back
Create `MOBILE_SAFARI_REPORT.md` containing:
- Each bug: route, device, before/after, how you fixed it, and the commit.
- Screenshots from the iPhone Simulator for the home, cruise, book, shows and media pages, before and after.
- What you left alone and why, plus anything that needs my decision.
