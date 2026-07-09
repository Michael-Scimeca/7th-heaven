const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");
const lines = sourceText.split("\n");

// Test C: Remove Notes container (lines 6411 to 6420, idx 6410 to 6419)
const linesC = [...lines];
for (let i = 6410; i <= 6419; i++) {
  linesC[i] = "";
}

const startLine = 5943;
const endLine = 6278;

const trace = [];
let pCount = 0;
let bCount = 0;

for (let i = startLine; i < endLine; i++) {
  const line = linesC[i];
  if (line === undefined) continue;
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '(') pCount++;
    else if (char === ')') pCount--;
    else if (char === '{') bCount++;
    else if (char === '}') bCount--;
  }
  
  if (line.trim()) {
    trace.push(`Line ${i + 1}: P = ${pCount}, B = ${bCount} | Text: ${line.trim().substring(0, 50)}`);
  }
}

console.log(trace.slice(-25).join("\n"));
