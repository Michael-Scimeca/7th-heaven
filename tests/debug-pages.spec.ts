import { test, expect } from '@playwright/test';

test('debug page loading', async ({ page }) => {
  const routes = ['/fan-media-wall', '/cruise', '/contact', '/rock-and-roll-kids', '/rrk', '/7hrrk'];
  
  for (const route of routes) {
    const consoleLogs: string[] = [];
    const pageErrors: string[] = [];
    
    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => pageErrors.push(err.message));
    
    console.log(`\n============================`);
    console.log(`NAVIGATING TO: ${route}`);
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    console.log(`HTTP Status: ${response?.status()}`);
    
    await page.waitForTimeout(1500);
    
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    const isBlank = bodyText.length === 0;
    
    const mainStyles = await page.evaluate(() => {
      const el = document.querySelector('main') || document.querySelector('.content-area') || document.body;
      const s = window.getComputedStyle(el);
      return {
        opacity: s.opacity,
        visibility: s.visibility,
        display: s.display,
        height: el.clientHeight,
        width: el.clientWidth,
        transform: s.transform,
      };
    });
    
    console.log(`Body Length: ${bodyText.length}`);
    console.log(`Main Styles:`, mainStyles);
    console.log(`Snippet:`, bodyText.slice(0, 200).replace(/\s+/g, ' '));
    if (pageErrors.length > 0) console.log(`Page Errors:`, pageErrors);
    if (consoleLogs.filter(l => l.includes('error') || l.includes('Error')).length > 0) {
      console.log(`Console Errors:`, consoleLogs.filter(l => l.includes('error') || l.includes('Error')));
    }
  }
});
