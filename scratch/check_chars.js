const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8");
const lines = content.split("\n");

const startLine = 6410; // 0-based index for line 6411
const endLine = 6420;

for (let i = startLine; i < endLine; i++) {
  const line = lines[i];
  console.log(`Line ${i + 1}:`);
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const code = char.charCodeAt(0);
    if (code > 127) {
      console.log(`  Char at index ${j}: '${char}' has code ${code}`);
    }
  }
}
