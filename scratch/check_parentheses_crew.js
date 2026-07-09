const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startIdx = content.indexOf("const renderCrewCreation =");
const endIdx = content.indexOf("const createAdmin =");

const body = content.substring(startIdx, endIdx);

let opens = 0;
let closes = 0;
for (let i = 0; i < body.length; i++) {
  if (body[i] === '(') opens++;
  if (body[i] === ')') closes++;
}

console.log(`renderCrewCreation parentheses: opens=${opens}, closes=${closes} (${opens === closes ? 'OK' : 'MISMATCH ⚠️'})`);
