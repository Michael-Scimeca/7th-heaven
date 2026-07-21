const puppeteer = require('puppeteer');

const templates = [
  { name: 'Newsletter Blast', filename: 'email-newsletter-blast.png' },
  { name: 'Crew Work Hours Summary', filename: 'email-crew-hours-summary.png' },
  { name: 'Schedule Change Alert', filename: 'email-schedule-change-alert.png' }
];

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 960 }
  });
  const page = await browser.newPage();
  
  // Log browser outputs for debugging
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  console.log('Navigating to home...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking SIGN IN in nav...');
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.trim().toLowerCase() === 'sign in') { b.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking ADMIN quick fill...');
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      const txt = b.textContent || '';
      if (txt.toLowerCase().includes('admin') && txt.includes('🔑')) { b.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking modal SIGN IN submit...');
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.getAttribute('type') === 'submit' && b.textContent.trim().toLowerCase() === 'sign in') { b.click(); return; }
    }
  });
  
  console.log('Waiting 10 seconds for login & redirect...');
  await new Promise(r => setTimeout(r, 10000));
  console.log('Current URL:', page.url());
  
  console.log('Navigating directly to admin emails previewer...');
  await page.goto('http://localhost:3000/admin/emails', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  console.log('Currently on:', page.url());

  for (const t of templates) {
    console.log(`Selecting email template: ${t.name}...`);
    const clicked = await page.evaluate((templateName) => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes(templateName)) {
          btn.click();
          return true;
        }
      }
      return false;
    }, t.name);
    
    console.log(`Selected ${t.name}:`, clicked);
    await new Promise(r => setTimeout(r, 3000)); // wait for iframe content to render
    
    console.log(`Taking screenshot for ${t.name}...`);
    const outPath = `/Users/michaelscimeca/Desktop/7thHeaven/public/sitemap-screenshots/${t.filename}`;
    await page.screenshot({ path: outPath });
    console.log(`Saved screenshot at: ${outPath}`);
  }
  
  await browser.close();
  console.log('All screenshots completed successfully!');
})().catch(e => {
  console.error('Error occurred:', e);
  process.exit(1);
});
