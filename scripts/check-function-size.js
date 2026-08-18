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

// 3. Measure Netlify Function payload (serverless API & dynamic routes)
function getDirSize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    // Ignore static html/json pages that deploy to CDN edge
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

const apiAppSize = getDirSize(path.join(process.cwd(), ".next/server/app/api"));
const apiPagesSize = getDirSize(path.join(process.cwd(), ".next/server/pages/api"));
const netlifyFuncSize = getDirSize(path.join(process.cwd(), ".netlify/functions-internal"));

const functionPayloadSize = netlifyFuncSize > 0 
  ? netlifyFuncSize 
  : (apiAppSize + apiPagesSize);

const totalMb = functionPayloadSize / (1024 * 1024);

console.log(`📊 Measured Netlify Function Handler Payload: ${totalMb.toFixed(2)} MB`);

if (totalMb > 250) {
  console.error(`❌ FAIL: Server function payload ${totalMb.toFixed(2)} MB exceeds Netlify's 250 MB hard limit!`);
  process.exit(1);
} else {
  console.log(`🎉 SUCCESS: Server function payload (${totalMb.toFixed(2)} MB) is well within Netlify's 250 MB limit! Ready to deploy.`);
}
