const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startIdx = content.indexOf("const renderCrewCreation =");
const endIdx = content.indexOf("const createAdmin =");

const body = content.substring(startIdx, endIdx);

let doubleQuotes = 0;
let singleQuotes = 0;
let backticks = 0;

for (let i = 0; i < body.length; i++) {
  if (body[i] === '"') doubleQuotes++;
  if (body[i] === "'") singleQuotes++;
  if (body[i] === '`') backticks++;
}

console.log(`renderCrewCreation quote counts:`);
console.log(`  double quotes: ${doubleQuotes} (${doubleQuotes % 2 === 0 ? 'EVEN (OK)' : 'ODD (MISMATCH ⚠️)'})`);
console.log(`  single quotes: ${singleQuotes} (${singleQuotes % 2 === 0 ? 'EVEN (OK)' : 'ODD (MISMATCH ⚠️)'})`);
console.log(`  backticks:     ${backticks} (${backticks % 2 === 0 ? 'EVEN (OK)' : 'ODD (MISMATCH ⚠️)'})`);
