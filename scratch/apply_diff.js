const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const diffPath = path.join(__dirname, "restored_diff.diff");
const cleanDiffPath = path.join(__dirname, "clean_diff.diff");

const content = fs.readFileSync(diffPath, "utf8");
const lines = content.split("\n");

const startIndex = lines.findIndex(l => l.startsWith("diff --git"));
if (startIndex === -1) {
  console.log("Could not find diff start in the file.");
  process.exit(1);
}

const cleanContent = lines.slice(startIndex).join("\n");
fs.writeFileSync(cleanDiffPath, cleanContent, "utf8");
console.log("Cleaned diff written to scratch/clean_diff.diff.");

try {
  execSync("git apply scratch/clean_diff.diff", { stdio: "inherit" });
  console.log("SUCCESS: Applied the restored diff back to src/app/admin/page.tsx!");
} catch (err) {
  console.error("git apply failed, trying patch...");
  try {
    execSync("patch -p1 < scratch/clean_diff.diff", { stdio: "inherit" });
    console.log("SUCCESS: Applied the restored patch back to src/app/admin/page.tsx!");
  } catch (err2) {
    console.error("Both git apply and patch failed:", err2.message);
  }
}
