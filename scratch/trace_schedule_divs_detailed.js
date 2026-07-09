const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startIdx = content.indexOf("const renderCrewSchedule =");
const endIdx = content.indexOf("const renderAwardPicks =");

const body = content.substring(startIdx, endIdx);
const lines = body.split("\n");

let opens = 0;
let closes = 0;

console.log("Starting trace of renderCrewSchedule...");

for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim();
  const openMatches = lines[i].match(/<div(?![^>]*\/>)(?![^>]*\s*>[^<]*<\/div>)/g) || [];
  const closeMatches = lines[i].match(/<\/div>/g) || [];
  
  opens += openMatches.length;
  closes += closeMatches.length;
  
  const balance = opens - closes;
  
  // Print the first 150 lines and any line where balance becomes negative
  if (i < 150 || balance < 0) {
    if (openMatches.length > 0 || closeMatches.length > 0) {
      console.log(`Line ${i + 1} (actual line ${4119 + i}): balance=${balance} | "${trimmed.substring(0, 80)}"`);
    }
  }
}
