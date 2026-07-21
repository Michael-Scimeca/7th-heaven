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
      if (b.textContent.trim().toLowerCase() === 'sign in') { b.click(); return b.textContent.trim(); }
    }
    return 'none';
  });
  console.log('Nav Sign In clicked:', navClicked);
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking FAN quick fill...');
  const quickFillClicked = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      const txt = b.textContent || '';
      if (txt.toLowerCase().includes('fan') && txt.includes('🔑')) { b.click(); return true; }
    }
    return false;
  });
  console.log('Quick fill clicked:', quickFillClicked);
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking modal SIGN IN submit...');
  const submitClicked = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.getAttribute('type') === 'submit' && b.textContent.trim().toLowerCase() === 'sign in') { b.click(); return b.textContent.trim(); }
    }
    return 'none';
  });
  console.log('Submit clicked:', submitClicked);
  
  console.log('Waiting 10 seconds for login & redirect...');
  await new Promise(r => setTimeout(r, 10000));
  console.log('Current URL after login wait:', page.url());
  
  if (!page.url().includes('/fans/super_fan')) {
    console.log('Redirect did not happen, navigating directly to super_fan dashboard...');
    await page.goto('http://localhost:3000/fans/super_fan', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log('Current URL before screenshot:', page.url());
  
  console.log('Scrolling down to Tour Memories section with sticky header offset...');
  const scrolled = await page.evaluate(() => {
    const headings = document.querySelectorAll('h3');
    for (const h of headings) {
      if (h.textContent.includes('Tour Memories')) {
        h.scrollIntoView({ block: 'start' });
        window.scrollBy(0, -120);
        return true;
      }
    }
    return false;
  });
  console.log('Scrolled successfully:', scrolled);
  
  // Wait for images to load
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Taking screenshot...');
  const outPath = '/Users/michaelscimeca/Desktop/7thHeaven/public/sitemap-screenshots/fan-dashboard-rejected.png';
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot successfully at:', outPath);
  
  await browser.close();
  console.log('Done!');
})().catch(e => {
  console.error('Error occurred:', e);
  process.exit(1);
});
