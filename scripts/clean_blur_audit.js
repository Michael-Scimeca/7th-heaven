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
    } else if (/\.(tsx|jsx|ts|js|css)$/.test(file)) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles("./src");

const backdropMap = {};
const elementMap = {};

function getPxValue(token) {
  if (token.includes("[")) {
    const m = token.match(/\[([^\]]+)\]/);
    if (m) return m[1];
  }
  if (token.includes("blur(")) {
    const m = token.match(/blur\(([^)]+)\)/);
    if (m) return m[1];
  }
  const stdMap = {
    "backdrop-blur-none": "0px",
    "backdrop-blur-xs": "2px",
    "backdrop-blur-sm": "4px",
    "backdrop-blur": "8px",
    "backdrop-blur-md": "12px",
    "backdrop-blur-lg": "16px",
    "backdrop-blur-xl": "24px",
    "backdrop-blur-2xl": "40px",
    "backdrop-blur-3xl": "64px",
    "blur-none": "0px",
    "blur-xs": "2px",
    "blur-sm": "4px",
    "blur": "8px",
    "blur-md": "12px",
    "blur-lg": "16px",
    "blur-xl": "24px",
    "blur-2xl": "40px",
    "blur-3xl": "64px"
  };
  return stdMap[token] || "8px";
}

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (line.includes("onBlur") || line.includes("onBlur=")) return;

    // Match Tailwind backdrop-blur
    const twBackdropRegex = /\b(?:hover:|md:|sm:|lg:|xl:|2xl:|group-hover:)?(backdrop-blur(?:-(?:xs|sm|md|lg|xl|2xl|3xl|none|\[[^\]]+\]))?)\b/g;
    let match;
    while ((match = twBackdropRegex.exec(line)) !== null) {
      const token = match[1];
      const px = getPxValue(token);
      if (!backdropMap[token]) backdropMap[token] = { token, px, count: 0, occurrences: [] };
      backdropMap[token].count++;
      backdropMap[token].occurrences.push({ file: filePath, line: lineNum, snippet: line.trim() });
    }

    // Match Tailwind element blur (ensure it's not backdrop-blur)
    const twElementRegex = /(?<!backdrop-)\b(?:hover:|md:|sm:|lg:|xl:|2xl:|group-hover:)?(blur(?:-(?:xs|sm|md|lg|xl|2xl|3xl|none|\[[^\]]+\]))?)\b/g;
    while ((match = twElementRegex.exec(line)) !== null) {
      const token = match[1];
      // Exclude standalone word "blur" if it's not a CSS class/prop
      if (token === "blur" && !line.includes("className") && !line.includes("class") && !line.includes("filter")) continue;
      const px = getPxValue(token);
      if (!elementMap[token]) elementMap[token] = { token, px, count: 0, occurrences: [] };
      elementMap[token].count++;
      elementMap[token].occurrences.push({ file: filePath, line: lineNum, snippet: line.trim() });
    }

    // Match CSS backdrop-filter: blur(...)
    const cssBackdropRegex = /backdrop-filter:\s*blur\([^)]+\)/gi;
    while ((match = cssBackdropRegex.exec(line)) !== null) {
      const token = match[0].trim();
      const px = getPxValue(token);
      if (!backdropMap[token]) backdropMap[token] = { token, px, count: 0, occurrences: [] };
      backdropMap[token].count++;
      backdropMap[token].occurrences.push({ file: filePath, line: lineNum, snippet: line.trim() });
    }

    // Match CSS filter: blur(...) (without backdrop)
    const cssElementRegex = /(?<!backdrop-)filter:\s*blur\([^)]+\)/gi;
    while ((match = cssElementRegex.exec(line)) !== null) {
      const token = match[0].trim();
      const px = getPxValue(token);
      if (!elementMap[token]) elementMap[token] = { token, px, count: 0, occurrences: [] };
      elementMap[token].count++;
      elementMap[token].occurrences.push({ file: filePath, line: lineNum, snippet: line.trim() });
    }

    // Match inline styles style={{ backdropFilter: "blur(...)" }}
    const inlineBackdropRegex = /backdropFilter:\s*["'`]?blur\([^)]+\)["'`]?/gi;
    while ((match = inlineBackdropRegex.exec(line)) !== null) {
      const token = match[0].trim();
      const px = getPxValue(token);
      if (!backdropMap[token]) backdropMap[token] = { token, px, count: 0, occurrences: [] };
      backdropMap[token].count++;
      backdropMap[token].occurrences.push({ file: filePath, line: lineNum, snippet: line.trim() });
    }
  });
});

const sortedBackdrop = Object.values(backdropMap).sort((a, b) => b.count - a.count);
const sortedElement = Object.values(elementMap).sort((a, b) => b.count - a.count);

console.log("Filtered Summary:");
console.log(`Backdrop Blurs: ${sortedBackdrop.length} unique variations`);
console.log(`Element Blurs: ${sortedElement.length} unique variations`);

fs.writeFileSync("scripts/clean_blur_data.json", JSON.stringify({
  backdropCount: sortedBackdrop.length,
  elementCount: sortedElement.length,
  sortedBackdrop,
  sortedElement
}, null, 2));
