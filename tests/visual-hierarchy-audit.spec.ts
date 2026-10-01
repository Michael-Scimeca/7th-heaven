import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUDIT_DIR = path.join(process.cwd(), 'audit-screenshots');

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'cruise', path: '/cruise' },
  { name: 'book', path: '/book' },
  { name: 'media', path: '/media' },
  { name: 'merch', path: '/merch' },
  { name: 'contact', path: '/contact' },
  { name: 'faq', path: '/faq' },
  { name: 'live', path: '/live' },
  { name: 'fan-media-wall', path: '/fan-media-wall' },
  { name: 'rock-and-roll-kids', path: '/rock-and-roll-kids' },
  { name: 'shows-past', path: '/shows/past' },
  { name: 'news-article', path: '/news/2026-tour-dates-announced' },
  { name: 'privacy', path: '/privacy' },
  { name: 'terms', path: '/terms' },
  { name: 'returns', path: '/returns' },
  { name: 'fans-me', path: '/fans/complete-profile' },
  { name: 'crew-dashboard', path: '/crew' },
  { name: 'planner-dashboard', path: '/planner' },
];

test.beforeAll(() => {
  if (!fs.existsSync(AUDIT_DIR)) {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
  }
});

test.describe('Visual Hierarchy Audit Pass', () => {
  test('audit desktop (1440px)', async ({ browser }) => {
    test.setTimeout(180000);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const p of PAGES) {
      console.log(`Auditing Desktop: ${p.name} (${p.path})`);
      try {
        const url = p.path.includes('?') ? `${p.path}&bypass=true` : `${p.path}?bypass=true`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1500);

        // Capture normal desktop screenshot
        await page.screenshot({
          path: path.join(AUDIT_DIR, `${p.name}-1440-normal.png`),
          fullPage: false,
        });

        // Apply 8px blur for the Squint Test
        await page.evaluate(() => {
          document.body.style.filter = 'blur(8px)';
          document.body.style.transition = 'none';
        });
        await page.waitForTimeout(200);

        // Capture blurred desktop screenshot
        await page.screenshot({
          path: path.join(AUDIT_DIR, `${p.name}-1440-blurred.png`),
          fullPage: false,
        });

        // Collect DOM metrics
        const metrics = await page.evaluate(() => {
          const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
          const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim());
          const buttons = Array.from(document.querySelectorAll('button, a.btn, a[role="button"]')).map(b => (b as HTMLElement).innerText.trim());
          const filledButtons = Array.from(document.querySelectorAll('button, a')).filter(el => {
            const bg = window.getComputedStyle(el).backgroundColor;
            return bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && (el as HTMLElement).innerText.trim().length > 0;
          }).map(b => (b as HTMLElement).innerText.trim());
          const glows = Array.from(document.querySelectorAll('[class*="glow"], [class*="shadow-[0_0_"], [style*="box-shadow"], [style*="drop-shadow"]')).length;
          
          return {
            title: document.title,
            h1s,
            h2Count: h2s.length,
            topH2s: h2s.slice(0, 5),
            buttonCount: buttons.length,
            filledButtonCount: filledButtons.length,
            sampleFilledButtons: filledButtons.slice(0, 5),
            glows,
          };
        });
        
        fs.writeFileSync(
          path.join(AUDIT_DIR, `${p.name}-metrics.json`),
          JSON.stringify(metrics, null, 2)
        );

        // Reset filter
      } catch (err) {
        console.error(`Error auditing desktop ${p.name}:`, err);
      }
    }
    await context.close();
  });

  test('audit mobile (390px)', async ({ browser }) => {
    test.setTimeout(180000);
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    for (const p of PAGES) {
      console.log(`Auditing Mobile: ${p.name} (${p.path})`);
      try {
        const url = p.path.includes('?') ? `${p.path}&bypass=true` : `${p.path}?bypass=true`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1500);

        // Capture normal mobile screenshot
        await page.screenshot({
          path: path.join(AUDIT_DIR, `${p.name}-390-normal.png`),
          fullPage: false,
        });

        // Apply 8px blur for the Squint Test
        await page.evaluate(() => {
          document.body.style.filter = 'blur(8px)';
          document.body.style.transition = 'none';
        });
        await page.waitForTimeout(200);

        // Capture blurred mobile screenshot
        await page.screenshot({
          path: path.join(AUDIT_DIR, `${p.name}-390-blurred.png`),
          fullPage: false,
        });

        // Reset filter
        await page.evaluate(() => {
          document.body.style.filter = 'none';
        });
      } catch (err) {
        console.error(`Error auditing mobile ${p.name}:`, err);
      }
    }
    await context.close();
  });
});
