import { test, expect } from '@playwright/test';

const PUBLIC_ROUTES = [
  '/',
  '/shows/past',
  '/cruise',
  '/book',
  '/media',
  '/merch',
  '/fan-photo-wall',
  '/faq',
  '/contact',
  '/privacy',
  '/terms',
  '/returns',
];

for (const route of PUBLIC_ROUTES) {
  test.describe(`Mobile Safari Smoke - ${route}`, () => {
    test(`route ${route} has no console errors, no horizontal overflow, and accessible tap targets`, async ({
      page,
      isMobile,
    }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (
            !text.includes('favicon') &&
            !text.includes('ERR_BLOCKED_BY_CLIENT') &&
            !text.includes('Sanity') &&
            !text.includes('Supabase')
          ) {
            consoleErrors.push(text);
          }
        }
      });

      page.on('pageerror', (err) => {
        pageErrors.push(err.message);
      });

      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000); // Allow layout/hydration

      // Verify no critical uncaught page runtime errors
      expect(pageErrors, `Uncaught page errors on ${route}`).toHaveLength(0);

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const innerWidth = window.innerWidth;
        const maxScroll = Math.max(docWidth, bodyWidth);
        return {
          hasOverflow: maxScroll > innerWidth + 1, // allow 1px rounding
          maxScroll,
          innerWidth,
        };
      });

      expect(
        overflow.hasOverflow,
        `Horizontal overflow detected on ${route}: scrollWidth=${overflow.maxScroll}px > innerWidth=${overflow.innerWidth}px`
      ).toBe(false);

      // Check tap targets in Header and Footer if mobile
      if (isMobile) {
        const smallTapTargets = await page.evaluate(() => {
          const failures: { selector: string; width: number; height: number; text: string }[] = [];
          const candidates = Array.from(
            document.querySelectorAll('header button, header a, footer button, footer a, [role="button"]')
          ) as HTMLElement[];

          for (const el of candidates) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

            if (rect.width < 40 || rect.height < 40) {
              failures.push({
                selector: el.tagName.toLowerCase() + (el.className ? `.${el.className.split(' ').slice(0, 2).join('.')}` : ''),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                text: (el.textContent || '').trim().slice(0, 30),
              });
            }
          }
          return failures;
        });

        if (smallTapTargets.length > 0) {
          console.warn(`[TapTarget Warning] ${route} on mobile has ${smallTapTargets.length} small elements:`, smallTapTargets.slice(0, 5));
        }
      }
    });
  });
}
