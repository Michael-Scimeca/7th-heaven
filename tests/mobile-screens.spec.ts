import { test, expect } from '@playwright/test';

/**
 * iPhone visual + menu check.
 *   npm run test:iphone
 * Full-page screenshots land in mobile-screenshots/<device>/<page>.png
 * (?bypass=true skips the preloader and animations so captures are clean).
 */

const PAGES: { name: string; path: string }[] = [
  { name: 'home', path: '/' },
  { name: 'shows-past', path: '/shows/past' },
  { name: 'cruise', path: '/cruise' },
  { name: 'book', path: '/book' },
  { name: 'media', path: '/media' },
  { name: 'merch', path: '/merch' },
  { name: 'faq', path: '/faq' },
  { name: 'contact', path: '/contact' },
];

const withBypass = (p: string) => `${p}${p.includes('?') ? '&' : '?'}bypass=true`;

test.describe('iPhone screenshots', () => {
  // First visit to a page makes the dev server compile it; full-page captures of long pages are slow too.
  test.describe.configure({ timeout: 90_000 });
  for (const pg of PAGES) {
    test(`screenshot ${pg.name}`, async ({ page, isMobile }, testInfo) => {
      test.skip(!isMobile, 'iPhone projects only');
      await page.goto(withBypass(pg.path), { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1500); // fonts, images, hydration
      await page.screenshot({
        path: `mobile-screenshots/${testInfo.project.name.replace(/\s+/g, '-')}/${pg.name}.png`,
        fullPage: true,
      });
    });
  }
});

test.describe('iPhone menu', () => {
  test('guitar-pick menu opens, spins and closes', async ({ page, isMobile }, testInfo) => {
    test.skip(!isMobile, 'iPhone projects only');
    await page.goto(withBypass('/'), { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);

    const toggle = page.locator('#mobile-menu-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-label', 'Open menu');

    const box = await toggle.boundingBox();
    expect(box && box.width >= 40 && box.height >= 40, 'menu button should be at least 40×40 to tap').toBeTruthy();

    await toggle.tap();
    await expect(toggle).toHaveAttribute('aria-label', 'Close menu');
    await expect(page.locator('[data-menu-open="true"]')).toHaveCount(1);

    // Icon should be rotated while open (default --pick-spin is 135deg).
    const angle = await toggle.locator('svg').evaluate((el) => {
      const t = getComputedStyle(el).transform;
      if (!t || t === 'none') return 0;
      const [a, b] = t.replace(/^matrix\(|\)$/g, '').split(',').map(Number);
      return Math.round((Math.atan2(b, a) * 180) / Math.PI);
    });
    expect(angle, 'pick icon should be rotated when the menu is open').not.toBe(0);

    await page.screenshot({
      path: `mobile-screenshots/${testInfo.project.name.replace(/\s+/g, '-')}/menu-open.png`,
    });

    await toggle.tap();
    await expect(toggle).toHaveAttribute('aria-label', 'Open menu');
  });
});
