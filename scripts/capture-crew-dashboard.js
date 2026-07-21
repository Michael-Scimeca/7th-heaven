const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 960 }
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  
  console.log('Navigating to home...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking SIGN IN in nav...');
  const navClicked = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.trim().toLowerCase() === 'sign in') { b.click(); return true; }
    }
    return false;
  });
  console.log('Nav Sign In clicked:', navClicked);
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking CREW quick fill...');
  const quickFillClicked = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      const txt = b.textContent || '';
      if (txt.toLowerCase().includes('crew') && txt.includes('🔑')) { b.click(); return true; }
    }
    return false;
  });
  console.log('Crew quick fill clicked:', quickFillClicked);
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking modal SIGN IN submit...');
  const submitClicked = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.getAttribute('type') === 'submit' && b.textContent.trim().toLowerCase() === 'sign in') { b.click(); return true; }
    }
    return false;
  });
  console.log('Submit clicked:', submitClicked);
  
  console.log('Waiting 10 seconds for login & redirect...');
  await new Promise(r => setTimeout(r, 10000));
  console.log('Current URL after login wait:', page.url());
  
  if (!page.url().includes('/crew')) {
    console.log('Redirect did not happen, navigating directly to crew dashboard...');
    await page.goto('http://localhost:3000/crew', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log('Current URL before screenshot:', page.url());
  
  console.log('Waiting for crew portal loading screen to disappear...');
  await page.waitForFunction(() => {
    return !document.body.textContent.includes('CREW PORTAL — LOADING');
  }, { timeout: 15000 }).catch(() => console.log('Timeout waiting for loading text to disappear.'));
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Taking screenshot...');
  const outPath = '/Users/michaelscimeca/Desktop/7thHeaven/public/sitemap-screenshots/crew.png';
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot successfully at:', outPath);
  
  await browser.close();
  console.log('Done!');
})().catch(e => {
  console.error('Error occurred:', e);
  process.exit(1);
});
