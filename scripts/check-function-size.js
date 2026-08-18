const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Running Netlify Pre-Deploy Function & Size Check...\n");

// 1. Run TypeScript check
try {
  console.log("1️⃣ Checking TypeScript compilation...");
  execSync("npm run typecheck", { stdio: "inherit" });
  console.log("✔ TypeScript check passed.\n");
} catch {
  console.error("❌ TypeScript compilation failed!");
  process.exit(1);
}

// 2. Build Next.js
try {
  console.log("2️⃣ Building Next.js production bundle...");
  execSync("npx next build", { stdio: "inherit" });
  console.log("✔ Next.js build completed.\n");
} catch {
  console.error("❌ Next.js build failed!");
  process.exit(1);
}

// 3. Safety Net: Clean any client reference manifests carrying inlined CSS
let prunedManifestCount = 0;
function sanitizeManifests(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      sanitizeManifests(fullPath);
    } else if (entry.isFile() && entry.name.endsWith("_client-reference-manifest.js")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.length > 500000 && content.includes(".css")) {
        // Strip inlined CSS payloads if present
        const sanitized = content.replace(/inlinedCss:\[[\s\S]*?\],/g, "inlinedCss:[],");
        fs.writeFileSync(fullPath, sanitized, "utf-8");
        prunedManifestCount++;
      }
    }
  }
}
sanitizeManifests(path.join(process.cwd(), ".next"));
if (prunedManifestCount > 0) {
  console.log(`🛡 Safety Net: Purged inlined CSS from ${prunedManifestCount} manifest files.\n`);
}

// 4. Measure Server Function Payload
function getDirSize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    if (file.name.endsWith('.html') || file.name.endsWith('.json') || file.name.endsWith('.rsc')) {
      continue;
    }
    if (file.isDirectory()) {
      size += getDirSize(fullPath);
    } else if (file.isFile()) {
      size += fs.statSync(fullPath).size;
    }
  }
  return size;
}

const serverSize = getDirSize(path.join(process.cwd(), ".next/server"));
const totalMb = serverSize / (1024 * 1024);

console.log(`📊 Measured Netlify Function Handler Payload: ${totalMb.toFixed(2)} MB`);

if (totalMb > 250) {
  console.error(`❌ FAIL: Server function payload ${totalMb.toFixed(2)} MB exceeds Netlify's 250 MB hard limit!`);
  process.exit(1);
} else {
  console.log(`🎉 SUCCESS: Server function payload (${totalMb.toFixed(2)} MB) is well within Netlify's 250 MB limit! Ready to deploy.`);
}
