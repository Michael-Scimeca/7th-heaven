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

// Pixel mapping table
const pxMap = {
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
  "blur-3xl": "64px",
};

const backdropItems = [];
const elementItems = [];

// Regular expression to find blur references (ignoring onBlur)
// Matches Tailwind classes, CSS properties, inline styles, arbitrary values
const blurRegex = /(?:backdrop-blur(?:-(?:xs|sm|md|lg|xl|2xl|3xl|none|\[[^\]]+\]))?)|(?:(?<!on)blur(?:-(?:xs|sm|md|lg|xl|2xl|3xl|none|\[[^\]]+\]))?)|(?:backdrop-filter:\s*blur\([^)]+\))|(?:filter:\s*blur\([^)]+\))|(?:backdropFilter:\s*["'`]?blur\([^)]+\)["'`]?)|(?:filter:\s*["'`]?blur\([^)]+\)["'`]?)/gi;

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    // Ignore onBlur event handlers
    if (line.includes("onBlur") || line.includes("onBlur=")) return;

    let match;
    const lineRegex = new RegExp(blurRegex);
    while ((match = lineRegex.exec(line)) !== null) {
      const rawMatch = match[0].trim();
      
      // Classify as backdrop vs element
      let isBackdrop = rawMatch.includes("backdrop");
      let normalizedKey = rawMatch;
      let actualPx = "Unknown";

      // Strip prefixes like hover:, md:, sm:, etc. if caught
      const cleanClass = rawMatch.replace(/^[a-z0-9:-]+:/i, "");

      if (cleanClass.startsWith("backdrop-blur")) {
        isBackdrop = true;
        normalizedKey = cleanClass;
        if (cleanClass.includes("[")) {
          const m = cleanClass.match(/\[([^\]]+)\]/);
          actualPx = m ? m[1] : "Custom";
        } else {
          actualPx = pxMap[cleanClass] || "8px";
        }
      } else if (cleanClass.startsWith("blur")) {
        isBackdrop = false;
        normalizedKey = cleanClass;
        if (cleanClass.includes("[")) {
          const m = cleanClass.match(/\[([^\]]+)\]/);
          actualPx = m ? m[1] : "Custom";
        } else {
          actualPx = pxMap[cleanClass] || "8px";
        }
      } else if (cleanClass.includes("blur(")) {
        const m = cleanClass.match(/blur\(([^)]+)\)/);
        actualPx = m ? m[1] : "Custom";
        normalizedKey = isBackdrop ? `backdrop-filter: blur(${actualPx})` : `filter: blur(${actualPx})`;
      }

      // Determine element tag / context description
      let tagContext = "Element";
      if (line.includes("<header") || line.includes("<nav") || line.includes("header") || line.includes("nav")) tagContext = "Header / Navbar";
      else if (line.includes("<aside") || line.includes("drawer") || line.includes("sidebar")) tagContext = "Drawer / Sidebar";
      else if (line.includes("modal") || line.includes("dialog") || line.includes("popup")) tagContext = "Modal / Popup";
      else if (line.includes("card") || line.includes("tile") || line.includes("panel")) tagContext = "Card / Panel";
      else if (line.includes("bg-") && (line.includes("gradient") || line.includes("blob") || line.includes("circle") || line.includes("glow") || line.includes("pointer-events-none"))) tagContext = "Background Glow / Blob";
      else if (line.includes("<p") || line.includes("<span") || line.includes("<h")) tagContext = "Text / Label Container";
      else if (line.includes("<button")) tagContext = "Button";
      else if (line.includes("<div")) tagContext = "Div Container";

      const item = {
        file: filePath,
        line: lineNum,
        rawMatch,
        normalizedKey,
        actualPx,
        type: isBackdrop ? "Backdrop Blur" : "Element Blur",
        tagContext,
        lineContent: line.trim()
      };

      if (isBackdrop) {
        backdropItems.push(item);
      } else {
        elementItems.push(item);
      }
    }
  });
});

console.log("Backdrop Blur occurrences:", backdropItems.length);
console.log("Element Blur occurrences:", elementItems.length);

fs.writeFileSync("scripts/blur_audit.json", JSON.stringify({
  backdropItems,
  elementItems
}, null, 2));
