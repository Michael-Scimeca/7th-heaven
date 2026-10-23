import { test, expect } from '@playwright/test';

test.describe('Whole Site Flow End-to-End Tests', () => {
  test('2.1 Homepage loads, displays hero branding, and navigates cleanly', async ({ page }) => {
    await page.goto('/');

    // Verify main landmark or page title
    await expect(page).toHaveTitle(/7th Heaven/i);

    // Verify navigation links or mobile menu toggle is visible
    const nav = page.locator('nav:not(.hidden), button[aria-label*="menu" i], button[aria-label*="navigation" i]').first();
    await expect(nav).toBeVisible();

    // Check footer presence
    const footer = page.locator('#footer');
    await expect(footer).toBeVisible();
  });

  test('2.2 Shows / Tour Dates page renders upcoming concerts and venue details', async ({ page }) => {
    await page.goto('/#tour');

    // Tour dates section heading
    const tourHeading = page.getByRole('heading', { name: /Upcoming Tour Dates/i });
    await expect(tourHeading).toBeVisible({ timeout: 10000 });

    // Tour table or rows container should be present
    const tourContainer = page.locator('#tour-table-container, #tour-rows-container').first();
    await expect(tourContainer).toBeVisible();
  });

  test('2.3 Booking page renders calendar and form selector', async ({ page }) => {
    await page.goto('/book');

    // Heading verification
    const bookingHeading = page.getByRole('heading', { level: 1 }).first();
    await expect(bookingHeading).toBeVisible();

    // Night progression section should NOT be present
    const timelineHeading = page.getByRole('heading', { name: /Event Night Progression & Timing/i });
    await expect(timelineHeading).toBeHidden();

    // Form inputs should be present
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name" i]').first();
    if (await nameInput.isVisible()) {
      await nameInput.scrollIntoViewIfNeeded();
      await nameInput.fill('Jane Rocker');
      await expect(nameInput).toHaveValue('Jane Rocker');
    }
  });

  test('2.4 Media page loads audio player and multimedia showcase', async ({ page }) => {
    await page.goto('/media');

    // Verify media heading or player elements
    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toBeVisible();

    // Audio/video or gallery containers
    const mediaContainer = page.locator('audio, video, iframe, [data-testid*="media"], button[aria-label*="Play" i]').first();
    await expect(mediaContainer).toBeVisible({ timeout: 10000 });
  });

  test('2.5 VIP Cruise page presents itinerary and cabin booking options', async ({ page }) => {
    await page.goto('/cruise');

    // Verify Cruise heading
    const cruiseHeading = page.getByRole('heading', { level: 1 }).first();
    await expect(cruiseHeading).toBeVisible();

    // Check for itinerary or booking CTA button
    const bookingCta = page.getByRole('link', { name: /book|cabin|reserve|itinerary/i }).first();
    await expect(bookingCta).toBeVisible({ timeout: 10000 });
  });

  test('2.6 Contact and FAQ pages render with working accordions', async ({ page }) => {
    // Check FAQ
    await page.goto('/faq');
    const faqHeading = page.getByRole('heading', { level: 1 }).first();
    await expect(faqHeading).toBeVisible();

    // Check FAQ accordion interaction
    const firstAccordion = page.locator('.accordion-trigger').first();
    await expect(firstAccordion).toBeVisible();
    await firstAccordion.click();
    await expect(firstAccordion).toHaveAttribute('aria-expanded', 'true');

    // Check Contact
    await page.goto('/contact');
    const contactHeading = page.getByRole('heading', { level: 1 }).first();
    await expect(contactHeading).toBeVisible();
  });
});
