const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'public', 'sitemap-screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // ── 1. Capture Shift Coverage Email Template Preview ──
  console.log('📸 Capturing Email Shift Coverage Request...');
  await page.setViewport({ width: 700, height: 900 });
  try {
    await page.goto('http://localhost:3000/api/dev/email-preview?id=shift_coverage_request', { waitUntil: 'networkidle0', timeout: 15000 });
    await delay(1500);
    const emailPath = path.join(SCREENSHOTS_DIR, 'email-shift-coverage-request.png');
    await page.screenshot({ path: emailPath, fullPage: true });
    console.log(`  ✅ Saved email screenshot to ${emailPath}`);
  } catch (err) {
    console.error('❌ Failed to capture email preview:', err.message);
  }

  // ── 2. Capture Abbie's Crew Dashboard (with Coverage section) ──
  console.log('📸 Capturing Abbie Crew Dashboard...');
  await page.setViewport({ width: 1280, height: 900 });
  try {
    await page.goto('http://localhost:3000/crew-abbie', { waitUntil: 'networkidle0', timeout: 15000 });
    await delay(2000);
    
    const dashboardPath = path.join(SCREENSHOTS_DIR, 'crew-dashboard-coverage.png');
    await page.screenshot({ path: dashboardPath, fullPage: false });
    console.log(`  ✅ Saved dashboard screenshot to ${dashboardPath}`);
  } catch (err) {
    console.error('❌ Failed to capture crew dashboard:', err.message);
  }

  // ── 3. Capture Admin Dashboard ──
  console.log('📸 Capturing Admin Dashboard...');
  await page.setViewport({ width: 1280, height: 900 });
  try {
    await page.goto('http://localhost:3000/admin/admin_7h', { waitUntil: 'networkidle0', timeout: 15000 });
    await delay(2000);
    
    const adminPath = path.join(SCREENSHOTS_DIR, 'admin-coverage-indicator.png');
    await page.screenshot({ path: adminPath, fullPage: false });
    console.log(`  ✅ Saved admin screenshot to ${adminPath}`);
  } catch (err) {
    console.error('❌ Failed to capture admin dashboard:', err.message);
  }

  await browser.close();
  console.log('🎉 All Screenshots successfully updated!');
})();
