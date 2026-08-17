const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"';
const BASE_URL = "http://localhost:3000";

const PAGES = [
  { name: "home", path: "/" },
  { name: "shows", path: "/shows/past" },
  { name: "contact", path: "/contact" },
  { name: "book", path: "/book" },
  { name: "media", path: "/media" },
  { name: "faq", path: "/faq" },
  { name: "privacy", path: "/privacy" },
  { name: "merch", path: "/merch" },
  { name: "payment-test", path: "/payment-test" },
  { name: "fan-dashboard", path: "/fans" },
  { name: "picks", path: "/picks" },
  { name: "cruise-form-filled", path: "/cruise" },
  { name: "planner", path: "/planner" },
  { name: "live", path: "/live" },
  { name: "admin", path: "/admin" },
  { name: "crew-dashboard", path: "/crew" },
  { name: "style-guide", path: "/style-guide" },
];

async function captureAll() {
  const screenshotsDir = path.join(__dirname, "../public/sitemap-screenshots");
  const thumbsDir = path.join(__dirname, "../public/sitemap-thumbs");

  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

  console.log("📸 Starting full page screenshot capture via Headless Chrome...");

  for (const pageItem of PAGES) {
    const targetUrl = `${BASE_URL}${pageItem.path}`;
    const outPng = path.join(screenshotsDir, `${pageItem.name}.png`);
    const outJpg = path.join(thumbsDir, `${pageItem.name}.jpg`);

    console.log(` capturing: ${pageItem.name} (${targetUrl})`);

    try {
      const cmd = `${CHROME_PATH} --headless --disable-gpu --window-size=1400,900 --virtual-time-budget=3500 --screenshot="${outPng}" "${targetUrl}"`;
      execSync(cmd, { stdio: "ignore" });

      if (fs.existsSync(outPng)) {
        // Resample to fast 400x250 crisp thumbnail
        execSync(`sips -z 250 400 -s format jpeg "${outPng}" --out "${outJpg}"`, { stdio: "ignore" });
        console.log(`  ✓ Saved thumbnail: ${pageItem.name}.jpg`);
      }
    } catch (err) {
      console.error(`  ✕ Error capturing ${pageItem.name}:`, err.message);
    }
  }

  console.log("✨ All sitemap page screenshots fully captured & resampled!");
}

captureAll();
