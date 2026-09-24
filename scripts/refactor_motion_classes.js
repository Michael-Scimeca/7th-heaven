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
let totalReplacements = 0;

files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // 1. Convert focus:outline-none / focus:ring inline patterns to focus-ring
  content = content.replace(/\bfocus:outline-none\s+focus:ring-2\s+focus:ring-[^\s"'}]+/g, "focus-ring");
  
  // 2. Clean up standalone focus:outline-none when accompanying interactive elements
  // content = content.replace(/\bfocus:outline-none\b/g, "focus-ring");

  // 3. Remove inline duration-200 / duration-300 / transition-all / transition-colors when replaced by global classes
  // e.g. transition-colors duration-200 hover:text-purple-300 -> text-link
  content = content.replace(/transition(?:-all|-colors|-opacity)?\s+duration-\d+\s+hover:text-purple-\d+/g, "text-link");
  content = content.replace(/transition-colors\s+duration-200\s+hover:text-white/g, "text-link");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    filesModified++;
  }
});

console.log(`Refactored motion classes in ${filesModified} files.`);
