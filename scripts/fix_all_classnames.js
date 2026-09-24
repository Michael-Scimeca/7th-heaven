const fs = require("fs");
const path = require("path");

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (/\.(tsx|jsx|ts|js)$/.test(file)) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles("./src");
let totalEmptyRemoved = 0;
let totalSpacesCleaned = 0;
let totalDupesRemoved = 0;
let filesModified = 0;

files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // 1. Remove empty/whitespace-only classNames entirely
  // e.g., className="" className="   " className={""} className={`   `} className={"   "}
  // Also clean up trailing/leading space inside element tag, e.g. <p className="   "> -> <p>
  
  // Pattern 1: space before className="..." or className={...}
  const emptyAttrRegex = /\s+className=(?:"\s*"|\{\s*""\s*\}|\{\s*``\s*\}|\{\s*"\s*"\s*\}|\{\s*`\s*`\s*\})/g;
  const emptyMatches = content.match(emptyAttrRegex);
  if (emptyMatches) {
    totalEmptyRemoved += emptyMatches.length;
    content = content.replace(emptyAttrRegex, "");
  }

  // Pattern 2: standalone className="" without leading space (e.g. at line start)
  const emptyAttrRegex2 = /className=(?:"\s*"|\{\s*""\s*\}|\{\s*``\s*\}|\{\s*"\s*"\s*\}|\{\s*`\s*`\s*\})/g;
  const emptyMatches2 = content.match(emptyAttrRegex2);
  if (emptyMatches2) {
    totalEmptyRemoved += emptyMatches2.length;
    content = content.replace(emptyAttrRegex2, "");
  }

  // 2. Clean up extra spaces & duplicates inside static className="..."
  content = content.replace(/className="([^"]*)"/g, (match, p1) => {
    let cleaned = p1.replace(/\s+/g, " ").trim();
    if (!cleaned) {
      totalEmptyRemoved++;
      return "";
    }

    // Deduplicate static words
    const words = cleaned.split(" ");
    const uniqueWords = [];
    const seen = new Set();
    words.forEach((w) => {
      if (!seen.has(w)) {
        seen.add(w);
        uniqueWords.push(w);
      } else {
        totalDupesRemoved++;
      }
    });

    const finalVal = uniqueWords.join(" ");
    if (finalVal !== p1) {
      totalSpacesCleaned++;
    }
    return `className="${finalVal}"`;
  });

  // 3. Clean up extra spaces inside template literal className={`...`} or className="..."
  // Trim spaces around template string literals e.g. className={`  foo   bar  `} -> className={`foo bar`}
  content = content.replace(/className=\{`([^`]*)`\}/g, (match, p1) => {
    // If it is static template string without expressions
    if (!p1.includes("${")) {
      let cleaned = p1.replace(/\s+/g, " ").trim();
      if (!cleaned) {
        totalEmptyRemoved++;
        return "";
      }
      return `className="${cleaned}"`;
    }

    // Collapse multi-spaces outside of expressions
    // Replace 2+ spaces with 1 space
    let cleaned = p1.replace(/ {2,}/g, " ");
    if (cleaned !== p1) {
      totalSpacesCleaned++;
    }
    return `className={\`${cleaned}\`}`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    filesModified++;
  }
});

console.log(`Cleaned ${filesModified} files:`);
console.log(`- Empty classNames removed: ${totalEmptyRemoved}`);
console.log(`- Space formatting cleaned: ${totalSpacesCleaned}`);
console.log(`- Duplicate classes removed: ${totalDupesRemoved}`);
