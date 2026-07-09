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
  const openMatches = lines[i].match(/<div(?![^>]*\/>)/gi) || [];
  const closeMatches = lines[i].match(/<\/div>/gi) || [];
  
  opens += openMatches.length;
  closes += closeMatches.length;
  
  const balance = opens - closes;
  if (balance < 0) {
    console.log(`First negative balance at line ${i + 1} (actual line ${4119 + i}): balance=${balance}`);
    console.log("Lines leading up to it:");
    for (let j = Math.max(0, i - 10); j <= i; j++) {
      console.log(`  Line ${j + 1} (actual line ${4119 + j}): "${lines[j].trim()}"`);
    }
    break;
  }
}
