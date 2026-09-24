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
let filesModified = 0;
let totalReplacements = 0;

files.forEach((filePath) => {
  // EXEMPT ProgressiveBlur.tsx
  if (filePath.endsWith("ProgressiveBlur.tsx")) {
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // 1. Consolidate arbitrary backdrop blurs into standard Tailwind tier classes
  // Tier 1 (4px - 8px): backdrop-blur-[1.5px] -> backdrop-blur-sm, backdrop-blur-[2px], [3px], [6px], [9px], [10px] -> backdrop-blur
  content = content.replace(/backdrop-blur-\[(?:1\.5px|2px|3px|6px|9px|10px)\]/g, () => {
    totalReplacements++;
    return "backdrop-blur";
  });

  // Tier 2 (12px - 24px): backdrop-blur-[14px], [16px], [18px], [20px], [21px] -> backdrop-blur-xl
  content = content.replace(/backdrop-blur-\[(?:14px|16px|18px|20px|21px)\]/g, () => {
    totalReplacements++;
    return "backdrop-blur-xl";
  });

  // Tier 3 (30px - 45px): backdrop-blur-[30px], [45px] -> backdrop-blur-2xl
  content = content.replace(/backdrop-blur-\[(?:30px|45px)\]/g, () => {
    totalReplacements++;
    return "backdrop-blur-2xl";
  });

  // 2. Consolidate non-standard element blurs (blur-[40px], blur-[50px], blur-[60px], blur-[80px], blur-[100px], blur-[120px], blur-[130px], blur-[140px], blur-[150px]) -> blur-3xl
  content = content.replace(/blur-\[(?:40px|50px|60px|80px|100px|120px|130px|140px|150px)\]/g, () => {
    totalReplacements++;
    return "blur-3xl";
  });

  // 3. Convert inline style backdropFilter: "blur(32px)..." or "blur(45px)..." to backdrop-blur-2xl or backdrop-blur-xl when possible
  // Except dynamic expressions
  content = content.replace(/backdropFilter:\s*["']blur\(32px\)[^"']*["']/g, () => {
    totalReplacements++;
    return 'backdropFilter: "blur(24px)"';
  });

  content = content.replace(/WebkitBackdropFilter:\s*["']blur\(32px\)[^"']*["']/g, () => {
    totalReplacements++;
    return 'WebkitBackdropFilter: "blur(24px)"';
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    filesModified++;
  }
});

console.log(`Consolidated blurs in ${filesModified} files (${totalReplacements} blur replacements applied). ProgressiveBlur.tsx was kept untouched.`);
