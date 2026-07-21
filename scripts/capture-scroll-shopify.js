const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1440, height: 1200 } });
  const page = await browser.newPage();
  
  console.log('Navigating to admin page...');
  await page.goto('http://localhost:3000/admin/MikeyS', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Restoring dev bypass...');
  await page.evaluate(() => {
    localStorage.setItem('7h_dev_bypass', 'true');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Scrolling down past the calendar to view the top dynamic section...');
  await page.evaluate(() => {
    // Find the shopify section element and scroll to it
    const shopifySec = document.getElementById('admin-sec-shopify');
    if (shopifySec) {
      shopifySec.scrollIntoView({ block: 'start' });
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  
  console.log('Capturing screen...');
  await page.screenshot({ path: '/Users/michaelscimeca/Desktop/7thHeaven/public/shopify-scroll-view.png' });
  
  await browser.close();
  console.log('Finished scroll shopify verification script.');
})();
