const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8");
const lines = content.split("\n");

let pCount = 0;
let bCount = 0;
let inString = false;
let stringChar = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    
    // Simple string escape logic
    if ((char === '"' || char === "'" || char === '`') && line[j - 1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === '(') pCount++;
      else if (char === ')') pCount--;
      else if (char === '{') bCount++;
      else if (char === '}') bCount--;
    }
  }
  
  if (pCount < 0 || bCount < 0) {
    console.log(`Line ${i + 1} went negative!`);
    console.log("Line content:", line);
    console.log("Balances -> Parentheses:", pCount, "Braces:", bCount);
    break;
  }
}

console.log("Finished check. Final: Parentheses:", pCount, "Braces:", bCount);
