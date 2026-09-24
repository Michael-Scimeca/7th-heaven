const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync("scripts/blur_audit.json"));

const backdropCounts = {};
const elementCounts = {};

const backdropDetails = {};
const elementDetails = {};

data.backdropItems.forEach(item => {
  const key = item.normalizedKey;
  if (!backdropCounts[key]) {
    backdropCounts[key] = { key, actualPx: item.actualPx, count: 0, items: [] };
  }
  backdropCounts[key].count++;
  backdropCounts[key].items.push(item);
});

data.elementItems.forEach(item => {
  const key = item.normalizedKey;
  if (!elementCounts[key]) {
    elementCounts[key] = { key, actualPx: item.actualPx, count: 0, items: [] };
  }
  elementCounts[key].count++;
  elementCounts[key].items.push(item);
});

const sortedBackdrop = Object.values(backdropCounts).sort((a, b) => b.count - a.count);
const sortedElement = Object.values(elementCounts).sort((a, b) => b.count - a.count);

console.log("=== SUMMARY ===");
console.log(`Unique Backdrop Blurs (${sortedBackdrop.length}):`);
sortedBackdrop.forEach(b => console.log(`  - ${b.key} (${b.actualPx}): ${b.count} times`));

console.log(`\nUnique Element Blurs (${sortedElement.length}):`);
sortedElement.forEach(e => console.log(`  - ${e.key} (${e.actualPx}): ${e.count} times`));

fs.writeFileSync("scripts/blur_summary.json", JSON.stringify({
  uniqueBackdropCount: sortedBackdrop.length,
  uniqueElementCount: sortedElement.length,
  sortedBackdrop,
  sortedElement
}, null, 2));
