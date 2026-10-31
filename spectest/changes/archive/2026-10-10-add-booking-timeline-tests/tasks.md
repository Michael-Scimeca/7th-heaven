## 1. Planning
- [x] 1.1 Map interactive elements on `/book` timeline rail and dropdown pills
- [x] 1.2 Identify edge cases (midnight rollover, identical end times, rapid clicking)

## 2. Generation
- [x] 2.1 Generate Playwright test for opening and selecting Doors time
- [x] 2.2 Generate Playwright test for adjusting Showtime and verifying live set duration recalculation
- [x] 2.3 Generate Playwright test for Curfew selection and post-show duration update
- [x] 2.4 Generate test verifying drag handles update timeline timestamps

## 3. Execution & Verification
- [x] 3.1 Run tests with `npx playwright test tests/booking-timeline.spec.ts`
- [x] 3.2 Review HTML report and verify clean passing run
- [x] 3.3 Verify zero accessibility violations with `@axe-core/playwright`
