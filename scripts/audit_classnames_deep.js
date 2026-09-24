const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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

const emptySafe = [];
const emptyRecentlyRemoved = [];
const extraSpaces = [];
const duplicateClasses = [];

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // 1. Check for empty classNames: className="", className=" ", className={""}, className={``}, className={" "}
    const emptyRegex = /className=(?:"\s*"|\{\s*""\s*\}|\{\s*``\s*\}|\{\s*"\s*"\s*\}|\{\s*`\s*`\s*\})/g;
    if (emptyRegex.test(line)) {
      // Check git history for this line
      let historyClasses = null;
      try {
        const logOutput = execSync(`git log -L ${lineNum},${lineNum}:"${filePath}"`, { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
        // Parse diff lines starting with '-' that contain className with content
        const linesDeleted = logOutput.split("\n").filter(l => l.startsWith("-") && l.includes("className="));
        for (const dl of linesDeleted) {
          const match = dl.match(/className=(?:"([^"]+)"|\{`([^`]+)`\}|\{"([^"]+)"\})/);
          if (match) {
            const cls = (match[1] || match[2] || match[3] || "").trim();
            if (cls && cls.length > 0) {
              historyClasses = cls;
              break;
            }
          }
        }
      } catch (err) {
        // Fallback to git log -p if line log failed
        try {
          const logOutput = execSync(`git log -p -n 15 -- "${filePath}"`, { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
          const linesDeleted = logOutput.split("\n").filter(l => l.startsWith("-") && l.includes("className="));
          for (const dl of linesDeleted) {
            const match = dl.match(/className=(?:"([^"]+)"|\{`([^`]+)`\}|\{"([^"]+)"\})/);
            if (match) {
              const cls = (match[1] || match[2] || match[3] || "").trim();
              if (cls && cls.length > 0) {
                historyClasses = cls;
                break;
              }
            }
          }
        } catch (e) {}
      }

      if (historyClasses) {
        emptyRecentlyRemoved.push({ file: filePath, line: lineNum, current: line.trim(), oldClasses: historyClasses });
      } else {
        emptySafe.push({ file: filePath, line: lineNum, current: line.trim() });
      }
    }

    // 2. Extra spaces / leading / trailing / double spaces
    const strClassRegex = /className=(?:"([^"]+)"|\{`([^`]+)`\})/g;
    let strMatch;
    while ((strMatch = strClassRegex.exec(line)) !== null) {
      const val = strMatch[1] !== undefined ? strMatch[1] : strMatch[2];
      if (/^\s|\s$|\s{2,}/.test(val) && val.trim().length > 0) {
        extraSpaces.push({ file: filePath, line: lineNum, value: val, lineContent: line.trim() });
      }

      // 3. Duplicate classes
      // Split on whitespace, exclude expressions like ${...}, ?, :
      const tokens = val.split(/\s+/).filter(w => w && !w.includes("${") && !w.includes("?") && !w.includes(":") && !w.includes("&&") && !w.includes("("));
      const seen = new Set();
      const dupes = new Set();
      for (const t of tokens) {
        if (seen.has(t)) {
          dupes.add(t);
        } else {
          seen.add(t);
        }
      }
      if (dupes.size > 0) {
        duplicateClasses.push({ file: filePath, line: lineNum, duplicates: Array.from(dupes), value: val, lineContent: line.trim() });
      }
    }
  });
});

console.log(JSON.stringify({
  emptySafeCount: emptySafe.length,
  emptyRecentlyRemovedCount: emptyRecentlyRemoved.length,
  extraSpacesCount: extraSpaces.length,
  duplicateClassesCount: duplicateClasses.length,
  emptySafe,
  emptyRecentlyRemoved,
  extraSpaces: extraSpaces.slice(0, 50), // first 50 sample or total
  duplicateClasses
}, null, 2));
