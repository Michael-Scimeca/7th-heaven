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

const findings = [];

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Pattern 1: MouseEnter/MouseLeave hover state for styling
    if (line.includes("onMouseEnter") || line.includes("onMouseLeave")) {
      findings.push({
        type: "hover-state",
        file: filePath,
        line: lineNum,
        snippet: line.trim(),
        description: "JS hover state (onMouseEnter/onMouseLeave) used for styling"
      });
    }

    // Pattern 2: window.innerWidth or resize listener for responsive layout
    if (line.includes("window.innerWidth") || (line.includes("addEventListener") && line.includes("resize"))) {
      findings.push({
        type: "responsive-js",
        file: filePath,
        line: lineNum,
        snippet: line.trim(),
        description: "window.innerWidth or resize listener used for responsive layout"
      });
    }

    // Pattern 3: scroll listener for sticky/scroll styling
    if (line.includes("addEventListener") && line.includes("scroll")) {
      findings.push({
        type: "scroll-js",
        file: filePath,
        line: lineNum,
        snippet: line.trim(),
        description: "Window scroll listener used for sticky positioning or scroll effects"
      });
    }

    // Pattern 4: JS aspect ratio calculation or inline style
    if (line.includes("aspectRatio") && line.includes("style=")) {
      findings.push({
        type: "aspect-ratio",
        file: filePath,
        line: lineNum,
        snippet: line.trim(),
        description: "JS inline style used for aspect-ratio"
      });
    }

    // Pattern 5: JS index checking for first/last/even/odd item styling
    if ((line.includes("idx === 0") || line.includes("index === 0") || line.includes("% 2 === 0")) && line.includes("className")) {
      findings.push({
        type: "nth-child",
        file: filePath,
        line: lineNum,
        snippet: line.trim(),
        description: "JS index check (first/even/odd) used inside className string"
      });
    }

    // Pattern 6: JS height calculation for accordion/collapsibles
    if (line.includes("scrollHeight") || (line.includes("getBoundingClientRect") && line.includes("height"))) {
      findings.push({
        type: "accordion-height",
        file: filePath,
        line: lineNum,
        snippet: line.trim(),
        description: "JS measuring scrollHeight / element height for collapsible expand animation"
      });
    }

    // Pattern 7: prefers-reduced-motion in JS
    if (line.includes("prefers-reduced-motion")) {
      findings.push({
        type: "reduced-motion",
        file: filePath,
        line: lineNum,
        snippet: line.trim(),
        description: "JS media query check for prefers-reduced-motion"
      });
    }
  });
});

console.log(`Audited ${files.length} files. Found ${findings.length} JS-to-CSS candidates.`);

fs.writeFileSync("scripts/js_to_css_findings.json", JSON.stringify(findings, null, 2));
