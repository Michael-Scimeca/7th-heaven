# Change: Add Whole Site Flow End-to-End Tests

## Why
7th Heaven is a comprehensive band platform with multiple interconnected visitor journeys: tour date discovery, booking inquiry submission, audio/video media browsing, fan community interaction, and VIP cruise experiences. We need automated end-to-end tests covering the entire critical site flow to ensure visitors never hit broken pages, unhandled errors, or navigation dead ends.

## What Changes
- Add full end-to-end test suite for all primary user journeys across the site.
- Homepage flow: Hero section, quick tour dates, audio preview, and navigation routing.
- Shows flow (`/shows`): Tour listings, date filtering, ticket links, and venue map inspection.
- Booking flow (`/book`): Date selection, 4-stage night progression, format selection, and inquiry form submission.
- Media flow (`/media`, `/video`): Audio playback controls, video reel browsing, and fan photo gallery.
- VIP Cruise flow (`/cruise`): Cruise itinerary, cabin packages, and information modals.
- Contact & Legal flow (`/contact`, `/faq`, `/terms`, `/privacy`): General inquiries, FAQ accordions, and policy pages.

## Impact
- Affected specs: `site-flows`
- Affected code: `src/app/`, `src/components/`
- Affected test files: `tests/whole-site-flow.spec.ts`
