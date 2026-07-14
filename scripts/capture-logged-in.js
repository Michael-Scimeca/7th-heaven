const puppeteer = require('puppeteer');
const OUT = '/Users/michaelscimeca/Desktop/7thHeaven/public/sitemap-screenshots';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1440, height: 800 } });
  const page = await browser.newPage();
  
  // Navigate to home
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Click SIGN IN in the nav
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.trim().includes('SIGN IN')) { b.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 3000));
  console.log('Opened login modal');
  
  // Click FAN quick fill
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.includes('FAN') && b.textContent.includes('🔑')) { b.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  console.log('Clicked FAN quick fill');
  
  // Click SIGN IN submit
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.trim() === 'SIGN IN') { b.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 8000));
  console.log('After login URL:', page.url());
  
  // Check if we see the fan dashboard or user name in nav
  const navText = await page.evaluate(() => {
    const nav = document.querySelector('nav') || document.querySelector('header');
    return nav ? nav.textContent.substring(0, 300) : 'no nav';
  });
  console.log('Nav text:', navText);
  
  // Navigate to store
  await page.goto('http://localhost:3000/store', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Check nav for logged-in state
  const storeNavText = await page.evaluate(() => {
    const header = document.querySelector('header') || document.querySelector('nav');
    return header ? header.textContent.substring(0, 200) : 'no header';
  });
  console.log('Store header:', storeNavText);
  
  // Take a screenshot
  await page.screenshot({ path: OUT + '/logged-in-store.png' });
  console.log('Saved logged-in-store.png');
  
  // Click BUY NOW
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.trim() === 'BUY NOW') { b.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 4000));
  
  // Take checkout screenshot
  await page.screenshot({ path: OUT + '/logged-in-checkout.png' });
  console.log('Saved logged-in-checkout.png');
  console.log('Final URL:', page.url());
  
  await browser.close();
  console.log('Done!');
})().catch(e => console.error(e));
