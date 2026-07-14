const puppeteer = require('puppeteer');
const path = require('path');

const SITE_URL = 'http://localhost:3000';
const OUTPUT_PATH = '/Users/michaelscimeca/.gemini/antigravity-ide/brain/9d2817ad-0756-49b3-857e-2100c7beac12/flowchart_screenshot.png';

(async () => {
  console.log('Capturing sitemap flowchart page...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto(`${SITE_URL}/sitemap/flowchart`, { waitUntil: 'networkidle2' });
    
    // Set a delay to let any canvas animations finish
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await page.screenshot({ path: OUTPUT_PATH, fullPage: true });
    console.log('Flowchart screenshot captured successfully at ' + OUTPUT_PATH);
  } catch (error) {
    console.error('Error capturing flowchart page:', error);
  } finally {
    await browser.close();
  }
})();
