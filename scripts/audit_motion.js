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

const motionClassesRegex = /\b(transition(?:-\w+)?|duration-\d+|ease-\w+|delay-\d+|animate-\w+|hover:[^\s"'}]+|focus:[^\s"'}]+|focus-visible:[^\s"'}]+|active:[^\s"'}]+|group-hover:[^\s"'}]+|peer-[^\s"'}]+|disabled:[^\s"'}]+)\b/g;

const occurrences = [];
const patterns = {};
const durationNoTransition = [];
const durationCounts = {};

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const matches = line.match(motionClassesRegex);
    if (matches && matches.length > 0) {
      const uniqueMatches = [...new Set(matches)];
      const hasDuration = line.includes("duration-");
      const hasTransition = line.includes("transition");
      const hasAnimate = line.includes("animate-");

      if (hasDuration && !hasTransition && !hasAnimate) {
        durationNoTransition.push({ file: filePath, line: lineNum, snippet: line.trim() });
      }

      matches.forEach(m => {
        if (m.startsWith("duration-")) {
          durationCounts[m] = (durationCounts[m] || 0) + 1;
        }
      });

      occurrences.push({
        file: filePath,
        line: lineNum,
        matches: uniqueMatches,
        snippet: line.trim()
      });
    }
  });
});

console.log("Total files scanned:", files.length);
console.log("Total motion occurrences found:", occurrences.length);
console.log("Duration breakdown:", durationCounts);
console.log("Elements with duration-* but NO transition property:", durationNoTransition.length);

fs.writeFileSync("scripts/motion_audit.json", JSON.stringify({
  totalFiles: files.length,
  totalOccurrences: occurrences.length,
  durationCounts,
  durationNoTransitionCount: durationNoTransition.length,
  durationNoTransition: durationNoTransition.slice(0, 30),
  occurrences
}, null, 2));
