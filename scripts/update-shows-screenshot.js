const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
  console.log('Capturing shows screenshot...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 800 });
    // Navigate with bypass=true so dev features or auto-logins bypass if necessary
    await page.goto('http://localhost:3000/shows?bypass=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Settle delay
    await new Promise(r => setTimeout(r, 4000));
    
    const outputPath = path.resolve(__dirname, '../public/sitemap-screenshots/shows.png');
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Successfully updated shows screenshot at: ${outputPath}`);
  } catch (err) {
    console.error('Error capturing screenshot:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
