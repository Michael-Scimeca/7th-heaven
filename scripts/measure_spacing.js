const puppeteer = require("puppeteer");

const PAGES = [
  { name: "/book", url: "http://localhost:3000/book" },
  { name: "/", url: "http://localhost:3000/" },
  { name: "/cruise", url: "http://localhost:3000/cruise" },
  { name: "/contact", url: "http://localhost:3000/contact" },
  { name: "/faq", url: "http://localhost:3000/faq" },
  { name: "/privacy", url: "http://localhost:3000/privacy" },
  { name: "/terms", url: "http://localhost:3000/terms" },
  { name: "/returns", url: "http://localhost:3000/returns" },
  { name: "/media", url: "http://localhost:3000/media" },
  { name: "/merch", url: "http://localhost:3000/merch?demo=merch" },
  { name: "/live", url: "http://localhost:3000/live" },
  { name: "/features", url: "http://localhost:3000/features" },
  { name: "/fans/[username]", url: "http://localhost:3000/fans/demo" },
  { name: "/rock-and-roll-kids", url: "http://localhost:3000/rock-and-roll-kids" },
  { name: "/notifications", url: "http://localhost:3000/notifications" },
  { name: "/claim", url: "http://localhost:3000/claim/123456" },
  { name: "/book/success", url: "http://localhost:3000/book/success" }
];

async function measure() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const results = {};

  for (const width of [1440, 390]) {
    results[width] = {};
    for (const p of PAGES) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900 });
      try {
        await page.goto(p.url, { waitUntil: "networkidle0", timeout: 15000 });
      } catch (e) {
        // If timeout, proceed anyway
      }

      const metrics = await page.evaluate(() => {
        const header = document.querySelector("header:not([aria-label*='cookie'])");
        const headerBottom = header ? header.getBoundingClientRect().bottom : 70;
        
        // First visible heading or first section content
        const headings = Array.from(document.querySelectorAll("h1, h2, h3, [id*='heading']"));
        const visibleHeadings = headings.filter(h => {
          const r = h.getBoundingClientRect();
          const style = window.getComputedStyle(h);
          return r.height > 0 && style.display !== "none" && style.visibility !== "hidden" && !h.classList.contains("sr-only");
        });
        const firstHeading = visibleHeadings[0];
        const topGap = firstHeading ? Math.round(firstHeading.getBoundingClientRect().top - headerBottom) : null;

        // Sections
        const sections = Array.from(document.querySelectorAll("main section, main > div > section"));
        const sectionGaps = [];
        for (let i = 0; i < sections.length - 1; i++) {
          const r1 = sections[i].getBoundingClientRect();
          const r2 = sections[i + 1].getBoundingClientRect();
          if (r1.height > 0 && r2.height > 0) {
            sectionGaps.push(Math.round(r2.top - r1.bottom));
          }
        }

        // Footer / bottom gap
        const footer = document.querySelector("footer");
        const main = document.querySelector("main");
        let bottomGap = null;
        if (footer && main) {
          const footerTop = footer.getBoundingClientRect().top;
          const mainChildren = Array.from(main.children);
          const lastChild = mainChildren[mainChildren.length - 1];
          const lastBottom = lastChild ? lastChild.getBoundingClientRect().bottom : main.getBoundingClientRect().bottom;
          bottomGap = Math.round(footerTop - lastBottom);
        }

        return {
          headerBottom: Math.round(headerBottom),
          topGap,
          sectionGaps,
          bottomGap,
          mainPt: main ? window.getComputedStyle(main).paddingTop : null,
          mainPb: main ? window.getComputedStyle(main).paddingBottom : null
        };
      });

      results[width][p.name] = metrics;
      await page.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

measure();
