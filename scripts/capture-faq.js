const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 1100 }
  });
  const page = await browser.newPage();
  
  console.log('Navigating to FAQ page...');
  await page.goto('http://localhost:3000/faq', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000)); // Wait for page assets and layout to render fully
  
  console.log('Taking screenshot...');
  const outPath = '/Users/michaelscimeca/.gemini/antigravity-ide/brain/0ce950cc-0276-4554-ab46-2a75b77d6a8e/faq-page.png';
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot successfully at:', outPath);
  
  await browser.close();
  console.log('Done!');
})().catch(e => {
  console.error('Error occurred:', e);
  process.exit(1);
});
