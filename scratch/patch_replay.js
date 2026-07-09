const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const originalFile = path.join(__dirname, "../src/app/admin/page.tsx");
const patchFile = path.join(__dirname, "temp.patch");

// Revert admin page to baseline clean commit
console.log("Reverting admin page to clean baseline...");
execSync(`git checkout "${originalFile}"`);

// We want to process the transcripts for:
// 1. db788c89-e07f-48f3-bc24-5f424c20cc6a (previous)
// 2. b39cfa05-0624-4d5c-af19-e02b7f6e20b2 (current)
const transcripts = [
  "/Users/michaelscimeca/.gemini/antigravity-ide/brain/db788c89-e07f-48f3-bc24-5f424c20cc6a/.system_generated/logs/transcript_full.jsonl",
  "/Users/michaelscimeca/.gemini/antigravity-ide/brain/b39cfa05-0624-4d5c-af19-e02b7f6e20b2/.system_generated/logs/transcript_full.jsonl"
];

// Extract all successful CODE_ACTION diffs
const patches = [];

transcripts.forEach(tPath => {
  if (!fs.existsSync(tPath)) {
    console.warn(`File not found: ${tPath}`);
    return;
  }
  const lines = fs.readFileSync(tPath, "utf8").split("\n").filter(Boolean);
  lines.forEach((line, lineNum) => {
    try {
      const data = JSON.parse(line);
      if (
        data.type === "CODE_ACTION" &&
        data.status === "DONE" &&
        data.content &&
        data.content.includes("src/app/admin/page.tsx") &&
        data.content.includes("[diff_block_start]")
      ) {
        // Extract diff block
        const startIdx = data.content.indexOf("[diff_block_start]");
        const endIdx = data.content.indexOf("[diff_block_end]");
        if (startIdx !== -1 && endIdx !== -1) {
          const diffContent = data.content
            .substring(startIdx + "[diff_block_start]".length, endIdx)
            .trim();
          
          // Reconstruct header for patch command
          const patchText = `--- a/src/app/admin/page.tsx\n+++ b/src/app/admin/page.tsx\n${diffContent}\n`;
          
          patches.push({
            created_at: data.created_at || "2000-01-01T00:00:00Z",
            step_index: data.step_index,
            patchText,
            origin: path.basename(path.dirname(path.dirname(path.dirname(tPath))))
          });
        }
      }
    } catch (err) {}
  });
});

// Sort patches by created_at time
patches.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

console.log(`Extracted ${patches.length} patches to apply.`);

patches.forEach((patch, idx) => {
  console.log(`[${idx + 1}/${patches.length}] Applying patch from step ${patch.step_index} in ${patch.origin}...`);
  fs.writeFileSync(patchFile, patch.patchText, "utf8");
  
  try {
    // Run the native patch utility. --fuzz=3 allows maximum fuzzy matching matching VS Code/Cursor
    execSync(`patch -p1 -F3 < "${patchFile}"`, { stdio: "inherit" });
  } catch (err) {
    console.error(`ERROR: Failed to apply patch at step ${patch.step_index} of ${patch.origin}!`);
    console.error("Patch content was:");
    console.error(patch.patchText);
    process.exit(1);
  }
});

// Clean up
if (fs.existsSync(patchFile)) {
  fs.unlinkSync(patchFile);
}

console.log("SUCCESS: Reconstructed admin page perfectly!");
