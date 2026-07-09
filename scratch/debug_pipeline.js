const fs = require('fs');
const { execSync } = require('child_process');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";

console.log("--- PIPELINE TRACE ---");

// Step 1: Restore
fs.copyFileSync(filePath + ".orig", filePath);
console.log("Restored. Occurrences of drawer closing pattern in page.tsx:");
printOccurrences();

// Step 2: Cleanup Duplicates
execSync("node scratch/cleanup_duplicates_and_fix_all_v2.js");
console.log("\nAfter cleanup_duplicates: Occurrences:");
printOccurrences();

// Step 3: Precise Fixes
execSync("node scratch/fix_precise.js");
console.log("\nAfter fix_precise: Occurrences:");
printOccurrences();

// Step 4: Layout
execSync("node scratch/fix_scheduler_layout.js");
console.log("\nAfter fix_scheduler_layout: Occurrences:");
printOccurrences();

// Step 5: Modals Relocation
execSync("node scratch/fix_scheduler_modals.js");
console.log("\nAfter fix_scheduler_modals: Occurrences:");
printOccurrences();

// Step 6: Relocate Admin
execSync("node scratch/relocate_create_admin.js");
console.log("\nAfter relocate_create_admin: Occurrences:");
printOccurrences();

// Step 7: Nested Tags
execSync("node scratch/fix_nested_tags.js");
console.log("\nAfter fix_nested_tags: Occurrences:");
printOccurrences();

function printOccurrences() {
  const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("})()}") || lines[i].includes("})()}")) {
      console.log(`  Line ${i + 1}: "${lines[i].trim()}"`);
      // Print 5 lines before it
      for (let j = Math.max(0, i - 5); j < i; j++) {
        console.log(`    Line ${j + 1}: "${lines[j].trim()}"`);
      }
    }
  }
}
