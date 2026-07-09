const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startIdx = content.indexOf("const renderCrewSchedule =");
const endIdx = content.indexOf("const renderAwardPicks =");

const body = content.substring(startIdx, endIdx);
const lines = body.split("\n");

let opens = 0;
let closes = 0;

for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim();
  // Count simple opening div tags (ignoring self-closing ones)
  const openMatches = lines[i].match(/<div(?![^>]*\/>)(?![^>]*\s*>[^<]*<\/div>)/g) || [];
  const closeMatches = lines[i].match(/<\/div>/g) || [];
  
  opens += openMatches.length;
  closes += closeMatches.length;
  
  if (openMatches.length > 0 || closeMatches.length > 0) {
    console.log(`Line ${i + 1} (${trimmed.substring(0, 40)}): opens=${openMatches.length}, closes=${closeMatches.length}, runningBalance=${opens - closes}`);
  }
}

console.log(`Total opens: ${opens}, Total closes: ${closes}, Net: ${opens - closes}`);
