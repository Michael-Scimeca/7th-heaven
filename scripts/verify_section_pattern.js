import fs from "fs";
import path from "path";

// Mapping of routes to files as listed in SECTION_PATTERN_CHECKLIST.md
const routeMap = {
  "/": ["src/app/page.tsx", "src/components/LazySection.tsx"],
  "/admin/[username]": ["src/app/admin/[username]/components/AdminDashboardMain.tsx"],
  "/admin/shop-inventory": ["src/app/admin/shop-inventory/page.tsx"],
  "/book": ["src/app/book/BookClient.tsx", "src/components/PlannerDashboard.tsx"],
  "/book/[username]": ["src/components/PlannerDashboard.tsx"],
  "/book/cancel": ["src/app/book/cancel/page.tsx"],
  "/book/success": ["src/app/book/success/page.tsx"],
  "/claim/[pin]": ["src/app/claim/[pin]/page.tsx"],
  "/contact": ["src/app/contact/ContactClient.tsx"],
  "/crew": ["src/components/CrewDashboard/index.tsx"],
  "/crew/[slug]": ["src/components/CrewDashboard/index.tsx"],
  "/cruise": [
    "src/components/CruiseVideoGallery.tsx",
    "src/components/CruiseSnakeItinerary.tsx",
    "src/app/cruise/components/CruiseCabinsPricingSection.tsx",
    "src/app/cruise/components/CruiseHeroSection.tsx"
  ],
  "/cruise/[username]": [
    "src/app/cruise/[username]/page.tsx",
    "src/components/CruiseSnakeItinerary.tsx"
  ],
  "/cruise/preview": ["src/app/cruise/preview/page.tsx"],
  "/cruise/verify": ["src/app/cruise/verify/CruiseVerifyClient.tsx"],
  "/fan-media-wall": ["src/app/fan-photo-wall/FanPhotoWallClient.tsx"],
  "/fan-photo-wall": ["src/app/fan-photo-wall/FanPhotoWallClient.tsx"],
  "/fans/[username]": ["src/app/fans/[username]/page.tsx"],
  "/faq": ["src/app/faq/FaqClient.tsx"],
  "/features": ["src/app/features/page.tsx"],
  "/live": ["src/app/live/LiveHubClient.tsx"],
  "/media": ["src/app/media/MediaClient.tsx", "src/components/AudioPlayer.tsx"],
  "/merch": ["src/app/merch/page.tsx"],
  "/news/[slug]": ["src/app/news/[slug]/page.tsx"],
  "/notifications": ["src/app/notifications/page.tsx"],
  "/planner/verify": ["src/app/planner/verify/PlannerVerifyClient.tsx"],
  "/privacy": ["src/app/privacy/PrivacyClient.tsx"],
  "/returns": ["src/app/returns/ReturnsClient.tsx"],
  "/rock-and-roll-kids": ["src/app/rock-and-roll-kids/RockNRollKidsClient.tsx"],
  "/shows/past": ["src/components/PastShowsClient.tsx"],
  "/terms": ["src/app/terms/TermsClient.tsx"]
};

// Evaluate each file
function evaluateSection(tagType, tagContent, lineNum, fullContent) {
  const issues = [];
  
  // 1. Check ID
  const idMatch = tagContent.match(/\bid=(?:\{`?([^`"'}]+)`?\}|"([^"]+)")/);
  const id = idMatch ? (idMatch[1] || idMatch[2]) : null;
  if (!id) {
    issues.push("no id");
  }

  // 2. Check Class
  const classMatch = tagContent.match(/\bclassName=(?:\{`?([^`"'}]+)`?\}|"([^"]+)")/);
  const className = classMatch ? (classMatch[1] || classMatch[2]) : "";
  const sizeMatch = tagContent.match(/\bsize=(?:\{`?([^`"'}]+)`?\}|"([^"]+)")/);
  const size = sizeMatch ? (sizeMatch[1] || sizeMatch[2]) : null;

  if (tagType === "section") {
    const classTokens = className.split(/\s+/).filter(Boolean);
    const hasSectionClass = classTokens.some(c => c === "section" || c === "section-sm" || c === "section-lg");
    if (!hasSectionClass) {
      issues.push("no section class");
    }
    const extraTokens = classTokens.filter(c => c !== "section" && c !== "section-sm" && c !== "section-lg" && c !== "relative" && !c.startsWith("scroll-mt"));
    if (extraTokens.length > 0) {
      issues.push(`extra classes: ${extraTokens.join(" ")}`);
    }
  } else if (tagType === "PageSection") {
    // PageSection generates section/section-sm/section-lg unless size="none"
    if (size === "none") {
      issues.push("no section class (size='none')");
    }
    const classTokens = className.split(/\s+/).filter(Boolean);
    const extraTokens = classTokens.filter(c => c !== "section" && c !== "section-sm" && c !== "section-lg" && c !== "relative" && !c.startsWith("scroll-mt") && c !== "w-full");
    if (extraTokens.length > 0) {
      issues.push(`extra classes: ${extraTokens.join(" ")}`);
    }
  }

  // 3. Check aria-labelledby
  const ariaLabelledbyMatch = tagContent.match(/\baria-labelledby=(?:\{`?([^`"'}]+)`?\}|"([^"]+)")/);
  const ariaLabelledby = ariaLabelledbyMatch ? (ariaLabelledbyMatch[1] || ariaLabelledbyMatch[2]) : null;
  const ariaLabelMatch = tagContent.match(/\baria-label=(?:\{`?([^`"'}]+)`?\}|"([^"]+)")/);

  if (!ariaLabelledby) {
    if (ariaLabelMatch) {
      issues.push("no aria-labelledby (has aria-label)");
    } else {
      issues.push("no aria-labelledby");
    }
  } else {
    // Verify target heading exists in fullContent
    // If dynamic template string like ${headingId}-heading, it's ok if headingId is in template
    if (!ariaLabelledby.includes("${")) {
      const headingPattern = new RegExp(`(?:id|titleId)=["'\`]${ariaLabelledby}["'\`]`);
      if (!headingPattern.test(fullContent)) {
        issues.push(`aria-labelledby→"${ariaLabelledby}" not found`);
      }
    }
  }

  // 4. Check inline style
  if (/\bstyle=\s*\{\{/.test(tagContent)) {
    issues.push("inline style");
  }

  return {
    lineNum,
    id,
    issues,
    isMatch: issues.length === 0
  };
}

function runAudit() {
  let grandTotal = 0;
  let grandMatches = 0;
  
  for (const [route, files] of Object.entries(routeMap)) {
    let routeSections = 0;
    let routeMatches = 0;
    const fileReports = [];

    for (const f of files) {
      if (!fs.existsSync(f)) continue;
      const content = fs.readFileSync(f, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/<(section|PageSection)\b/);
        if (match) {
          let tagContent = "";
          let j = i;
          while (j < lines.length) {
            tagContent += " " + lines[j];
            if (lines[j].includes(">")) break;
            j++;
          }
          const evalResult = evaluateSection(match[1], tagContent, i + 1, content);
          routeSections++;
          grandTotal++;
          if (evalResult.isMatch) {
            routeMatches++;
            grandMatches++;
            fileReports.push(`   ${path.relative(".", f)}:${evalResult.lineNum}  ✓ id=${evalResult.id}`);
          } else {
            fileReports.push(`   ${path.relative(".", f)}:${evalResult.lineNum}  → ${evalResult.issues.join("; ")}`);
          }
        }
      }
    }

    console.log(`${route}: ${routeMatches}/${routeSections} match`);
    fileReports.forEach(r => console.log(r));
    console.log();
  }

  console.log(`GRAND TOTAL: ${grandMatches}/${grandTotal} match`);
}

runAudit();
