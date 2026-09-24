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
let filesModified = 0;
let classReplacements = 0;

files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // Process className="..." and className={`...`}
  content = content.replace(/className=(?:"([^"]+)"|\{`([^`]+)`\})/g, (fullMatch, strVal, tmplVal) => {
    let val = strVal !== undefined ? strVal : tmplVal;
    let isTmpl = tmplVal !== undefined;

    // Check if contains inline motion or focus classes
    let hasMotion = /\b(transition(?:-\w+)?|duration-\d+|ease-\w+|delay-\d+)\b/.test(val);
    let hasFocus = /\bfocus:(?:outline-none|ring-\d+|border-\S+)\b/.test(val);

    if (!hasMotion && !hasFocus) return fullMatch;

    let tokens = val.split(/\s+/).filter(Boolean);
    let newTokens = [];
    let addedBtn = false;
    let addedCard = false;
    let addedFocus = false;

    for (let t of tokens) {
      if (/^(transition|transition-all|transition-colors|transition-transform|transition-opacity|duration-\d+|ease-\w+|delay-\d+)$/.test(t)) {
        // Remove individual motion utilities in favor of global class
        classReplacements++;
        continue;
      }
      if (/^focus:(outline-none|ring-2|ring-\S+|border-\S+)$/.test(t)) {
        if (!addedFocus) {
          newTokens.push("focus-ring");
          addedFocus = true;
        }
        classReplacements++;
        continue;
      }
      newTokens.push(t);
    }

    let finalVal = newTokens.join(" ");
    if (isTmpl) {
      return `className={\`${finalVal}\`}`;
    } else {
      return `className="${finalVal}"`;
    }
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    filesModified++;
  }
});

console.log(`Refactored motion classes in ${filesModified} files (${classReplacements} inline classes extracted).`);
