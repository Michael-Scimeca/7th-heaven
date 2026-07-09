const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');

const targetDir = path.resolve(__dirname, '../public/images/mockups');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// ms to wait after navigation before taking screenshot (lets JS settle)
const SETTLE_DELAY = 3000;
// ms to wait for server before giving up
const SERVER_READY_TIMEOUT = 60_000;

const items = [
  // ── Pages ──
  { name: 'home', url: 'http://localhost:3000/?bypass=true', type: 'page' },
  { name: 'fans', url: 'http://localhost:3000/fans/Alex?bypass=true', type: 'page' },
  { name: 'profile', url: 'http://localhost:3000/fans/demo?bypass=true', type: 'page' },
  { name: 'photowall', url: 'http://localhost:3000/fan-photo-wall?bypass=true', type: 'page' },
  { name: 'store', url: 'http://localhost:3000/store?bypass=true', type: 'page' },
  { name: 'product', url: 'http://localhost:3000/store/classic-logo-tee?bypass=true', type: 'page' },
  { name: 'book', url: 'http://localhost:3000/book?bypass=true', type: 'page' },
  { name: 'booking_success', url: 'http://localhost:3000/book/success?bypass=true', type: 'page' },
  { name: 'planner', url: 'http://localhost:3000/planner?bypass=true', type: 'page' },
  { name: 'cruise', url: 'http://localhost:3000/cruise?bypass=true', type: 'page' },
  { name: 'cruise_gate', url: 'http://localhost:3000/cruise/verify?email=michael%40example.com', type: 'page' },
  { name: 'lounge', url: 'http://localhost:3000/cruise/demo?bypass=true', type: 'page' },
  { name: 'crew', url: 'http://localhost:3000/crew-michael?bypass=true', type: 'page' },
  { name: 'crew_portal', url: 'http://localhost:3000/crew?bypass=true', type: 'page' },
  { name: 'admin', url: 'http://localhost:3000/admin?bypass=true', type: 'page' },
  { name: 'checklist', url: 'http://localhost:3000/admin/features?bypass=true', type: 'page' },

  // ── Live Stream Pages ──
  { name: 'live_michael', url: 'http://localhost:3000/live/live_michael?bypass=true', type: 'page' },
  { name: 'live_ryan', url: 'http://localhost:3000/live/live_ryan?bypass=true', type: 'page' },
  { name: 'live_sammy', url: 'http://localhost:3000/live/live_sammy?bypass=true', type: 'page' },
  { name: 'live_tony', url: 'http://localhost:3000/live/live_tony?bypass=true', type: 'page' },

  // ── Modals ──
  { name: 'login_modal',       url: 'http://localhost:3000/?showLogin=true&bypass=true',    type: 'page' },
  { name: 'signup_modal',      url: 'http://localhost:3000/?showSignup=true&bypass=true',   type: 'page' },
  { name: 'crew_set_password', url: 'http://localhost:3000/crew-setup-preview',             type: 'page' },

  // ── Emails ──
  { name: 'email_auth_pin', url: 'http://localhost:3000/api/dev/email-preview?id=auth_pin', type: 'email' },
  { name: 'email_booking_confirmation', url: 'http://localhost:3000/api/dev/email-preview?id=booking_confirmation', type: 'email' },
  { name: 'email_cruise_confirmation', url: 'http://localhost:3000/api/dev/email-preview?id=cruise_confirmation', type: 'email' },
  { name: 'email_cruise_community', url: 'http://localhost:3000/api/dev/email-preview?id=cruise_community', type: 'email' },
  { name: 'email_welcome_fan', url: 'http://localhost:3000/api/dev/email-preview?id=welcome_fan', type: 'email' },
  { name: 'email_welcome_planner', url: 'http://localhost:3000/api/dev/email-preview?id=welcome_planner', type: 'email' },
  { name: 'email_welcome_crew', url: 'http://localhost:3000/api/dev/email-preview?id=welcome_crew', type: 'email' },
];

// ─── Wait for the dev server to be ready ────────────────────────────────────
function waitForServer(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    let attempt = 0;

    function tryOnce() {
      attempt++;
      process.stdout.write(`  ⏳ Waiting for server (attempt ${attempt})...\r`);
      const req = http.get(url, { timeout: 5000 }, (res) => {
        res.resume();
        console.log(`\n  ✅ Server is ready (HTTP ${res.statusCode})`);
        resolve();
      });
      req.on('error', retry);
      req.on('timeout', () => { req.destroy(); retry(new Error('timeout')); });
    }

    function retry(err) {
      if (Date.now() >= deadline) {
        reject(new Error(`Server not ready after ${timeoutMs}ms: ${err.message}`));
        return;
      }
      setTimeout(tryOnce, 2000);
    }

    tryOnce();
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function run() {
  console.log('📸 7thHeaven — Screenshot Capture Session (Puppeteer)');
  console.log(`   Capturing ${items.length} items → ${targetDir}\n`);

  await waitForServer('http://localhost:3000/sitemap.html', SERVER_READY_TIMEOUT);
  console.log('');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  let passed = 0;
  let failed = 0;

  for (const item of items) {
    const outputPath = path.join(targetDir, `${item.name}.png`);
    const width = item.type === 'email' ? 650 : 1280;
    const height = item.type === 'email' ? 800 : 800;

    process.stdout.write(`- [${item.type}] ${item.name} ... `);
    const page = await browser.newPage();
    try {
      await page.setViewport({ width, height });

      // Navigate; don't wait for networkidle — Next.js keeps WS open forever
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

      // Give JS a moment to paint
      await new Promise(r => setTimeout(r, SETTLE_DELAY));

      await page.screenshot({ path: outputPath, fullPage: false });
      console.log(`✓  ${outputPath}`);
      passed++;
    } catch (err) {
      console.log(`✗  ${err.message.split('\n')[0]}`);
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(`\n✅ Done — ${passed} captured, ${failed} failed.`);
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});