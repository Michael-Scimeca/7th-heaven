const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startIdx = content.indexOf("const renderRegistry =");
const endIdx = content.indexOf("const renderCrewCreation =");

const body = content.substring(startIdx, endIdx);
const lines = body.split("\n");

let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let lineOpens = 0;
  let lineCloses = 0;
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') {
      balance++;
      lineOpens++;
    }
    if (line[j] === '}') {
      balance--;
      lineCloses++;
    }
  }
  if (lineOpens > 0 || lineCloses > 0) {
    console.log(`Line ${i + 3694}: opens=${lineOpens}, closes=${lineCloses}, runningBalance=${balance} | "${line.trim()}"`);
  }
}
