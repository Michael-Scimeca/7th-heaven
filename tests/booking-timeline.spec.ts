import { test, expect } from '@playwright/test';

test.describe('Booking Timeline Removal Verification', () => {
  test('Timeline progression section and slider ruler are not rendered on the booking page', async ({ page }) => {
    await page.goto('/book');

    // Verify main booking heading is visible
    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toBeVisible();

    // Verify timeline heading is not present
    const timelineHeading = page.getByRole('heading', { name: /Event Night Progression & Timing/i });
    await expect(timelineHeading).toBeHidden();

    // Verify timeline milestone buttons are not present
    await expect(page.locator('#dual-bar-doors-btn')).toBeHidden();
    await expect(page.locator('#dual-bar-showtime-btn')).toBeHidden();
    await expect(page.locator('#dual-bar-encore-btn')).toBeHidden();
    await expect(page.locator('#dual-bar-curfew-btn')).toBeHidden();

    // Verify timeline ruler is not present
    await expect(page.locator('#timeline-time-ruler')).toBeHidden();
  });

  test('Event timing and load-in logistics fields are located under Primary Event Schedule in Step 1', async ({ page }) => {
    await page.goto('/book');

    const step1 = page.locator('#step-1');
    await expect(step1).toBeVisible();

    // Verify timing fields exist within Step 1
    const eventStartTime = step1.locator('input[name="eventStartTime"]');
    const eventEndTime = step1.locator('input[name="eventEndTime"]');
    const bandStartTime = step1.locator('input[name="startTime"]');
    const bandEndTime = step1.locator('input[name="endTime"]');
    const loadInTime = step1.locator('input[name="loadInTime"]');

    await expect(eventStartTime).toBeVisible();
    await expect(eventEndTime).toBeVisible();
    await expect(bandStartTime).toBeVisible();
    await expect(bandEndTime).toBeVisible();
    await expect(loadInTime).toBeVisible();

    // Verify load-in unsure toggle
    const unsureToggle = step1.locator('#toggle-loadin-unsure');
    await expect(unsureToggle).toBeVisible();
  });
});

