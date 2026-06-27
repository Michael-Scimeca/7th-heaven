const fs = require("fs");
const path = require("path");

const pagePath = path.resolve(__dirname, "../src/app/admin/page.tsx");
const content = fs.readFileSync(pagePath, "utf8");

// Split by comments
const regex = /\{\/\*\s*──\s*([^-]+)\s*──\s*\*\/\}|\{\/\*\s*===([^=]+)===\s*\*\/\}|\{\/\*\s*Booking Requests Section\s*\*\/\}|\{\/\*\s*Crew Account Creation\s*\*\/\}/g;

const markers = [];
let match;
while ((match = regex.exec(content)) !== null) {
  const name = (match[1] || match[2] || match[0]).trim();
  markers.push({
    name: name,
    index: match.index,
    raw: match[0]
  });
}

markers.sort((a, b) => a.index - b.index);

console.log("Found markers:");
for (let i = 0; i < markers.length; i++) {
  const current = markers[i];
  const next = markers[i + 1];
  const startPos = current.index;
  const endPos = next ? next.index : content.length;
  
  const sectionText = content.substring(startPos, endPos).trim();
  console.log(`${i}: ${current.name} (starts at ${startPos}, length ${sectionText.length})`);
  
  // Write to file
  const filename = current.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  fs.writeFileSync(path.resolve(__dirname, `section-${filename}.txt`), sectionText);
}
