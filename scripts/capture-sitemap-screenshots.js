const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.resolve(__dirname, '../public/sitemap-screenshots');
const BASE_URL = 'http://localhost:3000';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Map of screenshot filename -> route / URL or custom capture logic
const PAGE_TARGETS = [
  { name: 'home.png', url: '/' },
  { name: 'shows.png', url: '/shows' },
  { name: 'event-detail.png', url: '/shows/1' },
  { name: 'music.png', url: '/music' },
  { name: 'albums.png', url: '/music' },
  { name: 'lyrics-page.png', url: '/music' },
  { name: 'video.png', url: '/video' },
  { name: 'live.png', url: '/live' },
  { name: 'live-feed.png', url: '/live/live_michael' },
  { name: 'live-flash-sale.png', url: '/live/live_sammy' },
  { name: 'live-flash-checkout.png', url: '/live/live_sammy' },
  { name: 'live-flash-success.png', url: '/live/live_sammy' },
  { name: 'live-shopify-checkout.png', url: '/live/live_michael' },
  { name: 'live-flash-ship-checkout.png', url: '/live/live_sammy' },
  { name: 'live-flash-ship-success.png', url: '/live/live_sammy' },
  { name: 'bio.png', url: '/band' },
  { name: 'members.png', url: '/band' },
  { name: 'news.png', url: '/news' },
  { name: 'store.png', url: '/store' },
  { name: 'store-products.png', url: '/store' },
  { name: 'store-detail.png', url: '/store/vintage-tour-tee-2026' },
  { name: 'store-cart.png', url: '/store' },
  { name: 'store-checkout.png', url: '/store' },
  { name: 'logged-in-store.png', url: '/store' },
  { name: 'logged-in-checkout.png', url: '/store' },
  { name: 'logged-in-checkout-scrolled.png', url: '/store' },
  { name: 'store-purchase-success.png', url: '/store' },
  { name: 'merch.png', url: '/merch' },
  { name: 'fans.png', url: '/fans' },
  { name: 'fan-dashboard.png', url: '/fans/super_fan' },
  { name: 'fan-dashboard-rejected.png', url: '/fans/super_fan' },
  { name: 'fan-photo-wall.png', url: '/fan-photo-wall' },
  { name: 'fan-upload-form.png', url: '/fan-photo-wall' },
  { name: 'fan-upload-scanning.png', url: '/fan-photo-wall' },
  { name: 'fan-upload-success.png', url: '/fan-photo-wall' },
  { name: 'book.png', url: '/book' },
  { name: 'contact.png', url: '/contact' },
  { name: 'faq.png', url: '/faq' },
  { name: 'features.png', url: '/features' },
  { name: 'privacy.png', url: '/privacy' },
  { name: 'terms.png', url: '/terms' },
  { name: 'returns.png', url: '/returns' },
  { name: 'style-guide.png', url: '/style-guide' },
  { name: 'cruise.png', url: '/cruise' },
  { name: 'cruise-dashboard.png', url: '/cruise/dashboard' },
  { name: 'cruise-verify.png', url: '/cruise/verify' },
  { name: 'cruise-form-filled.png', url: '/cruise/form-a' },
  { name: 'crew.png', url: '/crew' },
  { name: 'crew-dashboard.png', url: '/crew/michael' },
  { name: 'crew-sms-roles.png', url: '/crew/michael' },
  { name: 'planner.png', url: '/planner' },
  { name: 'admin.png', url: '/admin' },
  { name: 'admin-checklist.png', url: '/admin/checklist' },
  { name: 'admin-emails.png', url: '/admin/emails' },
  { name: 'admin-emailmap.png', url: '/admin/email-map' },
  { name: 'admin-legal.png', url: '/admin/legal' },
  { name: 'admin-inventory.png', url: '/admin/features' },
  { name: 'admin-cruise-roster.png', url: '/admin/michael' },
  { name: 'login-modal.png', url: '/?showLogin=true' },
  { name: 'signup-modal.png', url: '/?showSignup=true' },
  { name: 'forgot-password.png', url: '/?forgot=true' },
  { name: 'flowchart-sitemap.png', url: '/sitemap/flowchart' },
  { name: 'proximity-demo.png', url: '/demo/proximity' },
];

async function captureAll() {
  console.log('🚀 Starting Sitemap Screenshot Capture...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  for (const target of PAGE_TARGETS) {
    try {
      const fullUrl = `${BASE_URL}${target.url}`;
      console.log(`📸 Capturing: ${target.name} (${target.url})`);
      
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {
        return page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
      });

      // Wait a moment for animations/fonts
      await page.waitForTimeout(1000);

      const filePath = path.join(OUTPUT_DIR, target.name);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`  ✓ Saved: ${target.name}`);
    } catch (err) {
      console.error(`  ❌ Failed capturing ${target.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('✨ All Sitemap Screenshots Captured Successfully!');
}

captureAll();
