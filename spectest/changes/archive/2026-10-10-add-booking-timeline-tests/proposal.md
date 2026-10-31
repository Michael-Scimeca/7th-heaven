# Change: Add Booking Timeline & Progression Flow Tests

## Why
The `/book` page features a critical 4-stage event night progression system (Doors, Showtime, Encore, Curfew) with interactive duration calculations and draggable timeline rails. We need automated Playwright test coverage to guarantee that time selections, dropdown popovers, and live duration calculations stay rock-solid and never regress.

## What Changes
- Add comprehensive E2E test coverage for the `/book` page timeline section.
- Verify 4 milestone pills open their respective listbox popovers and update timestamps.
- Validate pre-show, live set, and post-show duration calculations.
- Validate that dragging or clicking updates the timeline without layout regressions.

## Impact
- Affected specs: `booking-timeline`
- Affected code: `src/components/CalendarPicker.tsx`, `src/components/ProgressionLayouts.tsx`, `src/components/DualBarTimelineSetups.tsx`
- Affected test files: `tests/booking-timeline.spec.ts`
