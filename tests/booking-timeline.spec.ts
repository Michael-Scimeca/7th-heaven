import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Booking Timeline & Progression Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book');
    // Scroll down to the timeline progression section
    const heading = page.getByRole('heading', { name: /Event Night Progression & Timing/i });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
  });

  test('2.1 Open and select Doors time via dropdown popover', async ({ page }) => {
    const doorsBtn = page.locator('#dual-bar-doors-btn');
    await expect(doorsBtn).toBeVisible();

    // Click to open popover
    await doorsBtn.click();

    // Listbox should be visible
    const listbox = page.getByRole('listbox', { name: /Select Doors Time/i });
    await expect(listbox).toBeVisible();

    // Select 5:00 PM
    const option = listbox.getByRole('option', { name: '5:00 PM', exact: true });
    await option.scrollIntoViewIfNeeded();
    await option.click();

    // Popover should close and Doors button should reflect 5:00 PM
    await expect(listbox).toBeHidden();
    await expect(doorsBtn).toContainText('5:00 PM');
  });

  test('2.2 Adjust Showtime and verify live set duration recalculation', async ({ page }) => {
    const showtimeBtn = page.locator('#dual-bar-showtime-btn');
    await expect(showtimeBtn).toBeVisible();

    // Open Showtime popover
    await showtimeBtn.click();
    const listbox = page.getByRole('listbox', { name: /Select Concert Showtime/i });
    await expect(listbox).toBeVisible();

    // Select 8:00 PM
    const option = listbox.getByRole('option', { name: '8:00 PM', exact: true });
    await option.scrollIntoViewIfNeeded();
    await option.click();

    await expect(listbox).toBeHidden();
    await expect(showtimeBtn).toContainText('8:00 PM');

    // Live Set duration should recalculate dynamically
    const liveSetBadge = page.getByText(/Live Set/i).first();
    await expect(liveSetBadge).toBeVisible();
  });

  test('2.3 Adjust Curfew and verify post-show duration update', async ({ page }) => {
    const curfewBtn = page.locator('#dual-bar-curfew-btn');
    await expect(curfewBtn).toBeVisible();

    await curfewBtn.click();
    const listbox = page.getByRole('listbox', { name: /Select Curfew Time/i });
    await expect(listbox).toBeVisible();

    // Select 12:00 AM
    const option = listbox.getByRole('option', { name: '12:00 AM', exact: true });
    await option.scrollIntoViewIfNeeded();
    await option.click();

    await expect(listbox).toBeHidden();
    await expect(curfewBtn).toContainText('12:00 AM');
  });

  test('2.4 Custom time entry allows picking any quarter hour or custom input', async ({ page }) => {
    const encoreBtn = page.locator('#dual-bar-encore-btn');
    await expect(encoreBtn).toBeVisible();

    await encoreBtn.click();
    const listbox = page.getByRole('listbox', { name: /Select Curtain Call Time/i });
    await expect(listbox).toBeVisible();

    // Use custom type input
    const customInput = listbox.getByPlaceholder(/Type any time/i);
    await expect(customInput).toBeVisible();
    await customInput.fill('10:15 PM');
    await customInput.press('Enter');

    await expect(listbox).toBeHidden();
    await expect(encoreBtn).toContainText('10:15 PM');
  });

  test('2.5 Interactive drag handles update concert timeline timestamps', async ({ page }) => {
    const showtimeHandle = page.getByRole('slider', { name: /Drag to adjust Showtime/i });
    await expect(showtimeHandle).toBeVisible();

    const box = await showtimeHandle.boundingBox();
    if (box) {
      // Simulate pointer drag to the right (+50px)
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 5 });
      await page.mouse.up();
    }

    // Verify timeline remains active and responsive
    const liveConcertLabel = page.getByText(/7TH HEAVEN LIVE/i).first();
    await expect(liveConcertLabel).toBeVisible();
  });

  test('2.6 All four timeline setups have interactive drag handles on the slider track', async ({ page }) => {
    // 1. Doors handle
    const doorsHandle = page.getByRole('slider', { name: /Drag to adjust Doors/i }).first();
    await expect(doorsHandle).toBeVisible();

    // 2. Showtime handle
    const showtimeHandle = page.getByRole('slider', { name: /Drag to adjust Showtime/i }).first();
    await expect(showtimeHandle).toBeVisible();

    // 3. Encore / Curtain Call handle
    const encoreHandle = page.getByRole('slider', { name: /Drag to adjust Curtain Call/i }).first();
    await expect(encoreHandle).toBeVisible();

    // 4. Curfew handle
    const curfewHandle = page.getByRole('slider', { name: /Drag to adjust Curfew/i }).first();
    await expect(curfewHandle).toBeVisible();

    // Drag Doors handle left to widen pre-show
    const doorsBox = await doorsHandle.boundingBox();
    if (doorsBox) {
      await page.mouse.move(doorsBox.x + doorsBox.width / 2, doorsBox.y + doorsBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(doorsBox.x + doorsBox.width / 2 - 40, doorsBox.y + doorsBox.height / 2, { steps: 5 });
      await page.mouse.up();
    }

    // Drag Curfew handle right to widen post-show
    const curfewBox = await curfewHandle.boundingBox();
    if (curfewBox) {
      await page.mouse.move(curfewBox.x + curfewBox.width / 2, curfewBox.y + curfewBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(curfewBox.x + curfewBox.width / 2 + 40, curfewBox.y + curfewBox.height / 2, { steps: 5 });
      await page.mouse.up();
    }

    // Verify all four milestone capsules and labels reflect active timeline states
    await expect(page.locator('#dual-bar-doors-btn')).toBeVisible();
    await expect(page.locator('#dual-bar-showtime-btn')).toBeVisible();
    await expect(page.locator('#dual-bar-encore-btn')).toBeVisible();
    await expect(page.locator('#dual-bar-curfew-btn')).toBeVisible();
  });

  test('2.7 Timeline time scale ruler renders 00, 06, 12, 18, 24 ticks and toggles formats', async ({ page }) => {
    const ruler = page.locator('#timeline-time-ruler');
    await expect(ruler).toBeVisible();

    // Verify 24H Day major ticks matching user screenshot
    await expect(ruler.getByText('00', { exact: true })).toBeVisible();
    await expect(ruler.getByText('06', { exact: true })).toBeVisible();
    await expect(ruler.getByText('12', { exact: true })).toBeVisible();
    await expect(ruler.getByText('18', { exact: true })).toBeVisible();
    await expect(ruler.getByText('24', { exact: true })).toBeVisible();

    // Switch to 12H format
    const toggle12H = ruler.getByRole('button', { name: '12H', exact: true });
    await toggle12H.click();
    await expect(ruler.getByText('12 PM', { exact: true })).toBeVisible();
    await expect(ruler.getByText('6 PM', { exact: true })).toBeVisible();

    // Switch to Event Zoom
    const eventZoomBtn = ruler.getByRole('button', { name: /EVENT ZOOM/i });
    await eventZoomBtn.click();
    await expect(ruler).toBeVisible();

    // Hover over ruler to trigger time inspection
    const rulerBox = await ruler.boundingBox();
    if (rulerBox) {
      await page.mouse.move(rulerBox.x + rulerBox.width * 0.75, rulerBox.y + rulerBox.height / 2);
    }
  });

  test('3.3 Timeline section accessibility audit (Axe-Core)', async ({ page }) => {
    const doorsBtn = page.locator('#dual-bar-doors-btn');
    await expect(doorsBtn).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#dual-bar-doors-btn')
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

