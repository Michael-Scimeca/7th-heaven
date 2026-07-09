const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx.orig";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startIdx = content.indexOf("            {selectedShowCrewDate && (() => {");
const endIdx = content.indexOf("            {/* 👥 Create Group Modal Pop-up */}");
const body = content.substring(startIdx, endIdx);
const lines = body.split("\n");

let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  let pos = 0;
  let lineOpens = 0;
  let lineCloses = 0;
  
  while (true) {
    const idxOpen = line.indexOf("<div", pos);
    const idxClose = line.indexOf("</div>", pos);
    
    if (idxOpen === -1 && idxClose === -1) break;
    
    if (idxOpen !== -1 && (idxClose === -1 || idxOpen < idxClose)) {
      const tagEnd = line.indexOf(">", idxOpen);
      const tagStr = body.substring(body.indexOf(line) + idxOpen, body.indexOf(line) + tagEnd + 1);
      if (!tagStr.endsWith("/>")) {
        balance++;
        lineOpens++;
      }
      pos = idxOpen + 4;
    } else {
      balance--;
      lineCloses++;
      pos = idxClose + 6;
    }
  }
  
  if (lineOpens > 0 || lineCloses > 0) {
    console.log(`Line ${i + 3563}: opens=${lineOpens}, closes=${lineCloses}, runningBalance=${balance} | "${line.trim()}"`);
  }
}
