# Test Project Context: 7th Heaven

## Purpose
Automated end-to-end and integration test suite for the **7th Heaven** rock band platform. Ensures high-reliability across the concert tour calendar, event booking inquiry flow (calendar picker, dynamic time progression rail, pricing calculation), audio/video media reels, VIP fan experiences, and contact forms.

## Tech Stack
- **E2E Testing**: Playwright (`@playwright/test` v1.63+)
- **Unit / Component Testing**: Vitest (`vitest` v4.1+) & `@testing-library/react`
- **Accessibility Testing**: `@axe-core/playwright`
- **Application Framework**: Next.js 16 (Turbopack, App Router)
- **UI & State**: React 19, Tailwind CSS v4, Framer Motion, GSAP, Lenis Smooth Scroll
- **Runtime & Language**: Node.js >= 24, TypeScript v5
- **Backend / Database**: Supabase (SSR & client), Upstash Redis, Resend

## Test Project Conventions

### Test Code Style
- **File Naming**: Kebab-case with `.spec.ts` suffix (e.g. `tests/booking-timeline.spec.ts`, `tests/mobile-safari.spec.ts`).
- **Locators Priority**:
  1. Accessible role queries: `page.getByRole('button', { name: '...' })`, `page.getByRole('listbox')`
  2. Label queries: `page.getByLabel('...')`
  3. Stable test IDs: `page.locator('[data-testid="..."]')`
  4. Avoid unstable CSS utility classes that can shift across design refactors.
- **Timing & Waiting**:
  - Always rely on Playwright auto-waiting, `waitFor({ state: 'visible' })`, or `waitForURL()`.
  - **Never use** `page.waitForTimeout()` or `sleep()`.
- **Quality Gates**:
  - `npx react-doctor@latest --scope changed` must score 100/100.
  - TypeScript zero-error compile (`npm run typecheck`).

### Test Architecture Patterns
- **Isolation**: Each test is self-contained with fresh context; tests can run in parallel without cross-contamination.
- **Arrange-Act-Assert**: Clear structural separation in every test.
- **Visual & Responsive Testing**: Validate across desktop (1280x800) and mobile (iPhone / Safari touch viewports).

### Testing Strategy
- **Framework**: Playwright + Vitest
- **Spec Format**: SpecTest (human-readable test specifications in `spectest/specs/`)
- **Proposals & Changes**: Spec-first proposals in `spectest/changes/[change-id]/` with required `#### Scenario:` deltas.
- **Execution & Reports**:
  - E2E: `npx playwright test` (generates HTML report in `playwright-report/` and failure artifacts in `test-results/`)
  - Unit/Integration: `npm test` (`vitest run`)

### Git Workflow
- Feature branches branched from `main`.
- Spec changes proposed in `spectest/changes/`, validated with `spectest validate <id> --strict`, and archived upon implementation with `spectest archive <id> --yes`.

## Domain Context
- **Booking Flow**: Multi-step booking request form on `/book` involving event date selection, blocked date detection, 4-stage night progression (Doors, Showtime, Encore, Curfew), and live duration calculations (pre-show, live set, post-show).
- **Tour Dates**: Interactive tour date listings with venue details, ticket links, map pins, and calendar integration.
- **Media Experience**: High-performance audio player, video reels, and photo galleries with custom Lottie/video loops.

## Important Constraints
- Turbopack dev server runs on `http://localhost:3000` (or `3001` if port occupied).
- Netlify serverless deployment size limits (< 50MB function bundles).
- Strict adherence to the `No Static Inline Styles Rule` in React components (use Tailwind classes or CSS custom properties for dynamic runtime values).
