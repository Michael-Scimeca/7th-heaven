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
      // Precise line git log
      let historyClasses = null;
      try {
        const logOutput = execSync(`git log -p -L ${lineNum},${lineNum}:"${filePath}"`, { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
        const linesDeleted = logOutput.split("\n").filter(l => l.startsWith("-") && !l.startsWith("---") && l.includes("className="));
        for (const dl of linesDeleted) {
          const match = dl.match(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})/);
          if (match) {
            const cls = (match[1] || match[2] || match[3] || "").trim();
            if (cls && cls.length > 0) {
              historyClasses = cls;
              break;
            }
          }
        }
      } catch (err) {
        // Fallback file diff
        try {
          const logOutput = execSync(`git log -p -n 10 -- "${filePath}"`, { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
          const linesDeleted = logOutput.split("\n").filter(l => l.startsWith("-") && !l.startsWith("---") && l.includes("className="));
          for (const dl of linesDeleted) {
            const match = dl.match(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})/);
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

      const snippet = line.trim().substring(0, 80);
      if (historyClasses) {
        emptyRecentlyRemoved.push({ file: filePath, line: lineNum, snippet, oldClasses: historyClasses });
      } else {
        emptySafe.push({ file: filePath, line: lineNum, snippet });
      }
    }

    // 2. Extra spaces
    const strClassRegex = /className=(?:"([^"]+)"|\{`([^`]+)`\})/g;
    let strMatch;
    while ((strMatch = strClassRegex.exec(line)) !== null) {
      const val = strMatch[1] !== undefined ? strMatch[1] : strMatch[2];
      if (/^\s|\s$|\s{2,}/.test(val) && val.trim().length > 0) {
        extraSpaces.push({ file: filePath, line: lineNum, val, snippet: line.trim().substring(0, 80) });
      }

      // 3. Duplicate classes
      const tokens = val.split(/\s+/).filter(w => w && !w.includes("${") && !w.includes("?") && !w.includes(":") && !w.includes("&&") && !w.includes("(") && !w.includes(")") && !w.includes("[") && !w.includes("]"));
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
        duplicateClasses.push({ file: filePath, line: lineNum, duplicates: Array.from(dupes).join(", "), val, snippet: line.trim().substring(0, 80) });
      }
    }
  });
});

console.log("Empty Safe:", emptySafe.length);
console.log("Empty Recently Removed:", emptyRecentlyRemoved.length);
console.log("Extra Spaces:", extraSpaces.length);
console.log("Duplicates:", duplicateClasses.length);

fs.writeFileSync("scripts/report_data.json", JSON.stringify({
  emptySafe,
  emptyRecentlyRemoved,
  extraSpaces,
  duplicateClasses
}, null, 2));
