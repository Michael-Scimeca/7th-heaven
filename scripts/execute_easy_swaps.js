const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync("scripts/js_to_css_classified.json"));
const easySwaps = data.easySwap;

let filesModified = 0;
let totalChanges = 0;

// Group by file
const fileMap = {};
easySwaps.forEach(item => {
  if (!fileMap[item.file]) fileMap[item.file] = [];
  fileMap[item.file].push(item);
});

Object.keys(fileMap).forEach(filePath => {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // 1. Refactor index === 0 / idx === 0 ternaries
  content = content.replace(/className=\{`([^`]*)\$\{?\s*(?:idx|index)\s*===\s*0\s*\?\s*["']border-t-0["']\s*:\s*["']border-t["']\s*\}?([^`]*)`\}/g, (match, p1, p2) => {
    totalChanges++;
    return `className={\`${p1} border-t first:border-t-0 ${p2}\`}`;
  });

  content = content.replace(/className=(?:"([^"]*)"|\{`([^`]*)\`\})/g, (match, strVal, tmplVal) => {
    let val = strVal !== undefined ? strVal : tmplVal;
    if (val.includes("idx === 0") || val.includes("index === 0")) {
      let cleaned = val.replace(/\$\{\s*(?:idx|index)\s*===\s*0\s*\?\s*["'][^"']*["']\s*:\s*["'][^"']*["']\s*\}/g, "border-t first:border-t-0");
      totalChanges++;
      return match.startsWith('className="') ? `className="${cleaned}"` : `className={\`${cleaned}\`}`;
    }
    return match;
  });

  // 2. Refactor inline style aspectRatio
  content = content.replace(/style=\{\{\s*aspectRatio:\s*["']16\s*\/\s*9["']\s*\}\}/g, () => {
    totalChanges++;
    return `className="aspect-video"`;
  });
  content = content.replace(/style=\{\{\s*aspectRatio:\s*["']1\s*\/\s*1["']\s*\}\}/g, () => {
    totalChanges++;
    return `className="aspect-square"`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    filesModified++;
  }
});

console.log(`Executed Easy Swaps across ${filesModified} files (${totalChanges} changes applied).`);
