const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const lines = content.split("\n");

const block1 = lines.slice(143, 1141); // Lines 144 to 1141
const block2 = lines.slice(1141, 1915); // Lines 1142 to 1915

function getDecls(block, blockNum) {
  const decls = [];
  for (let i = 0; i < block.length; i++) {
    const line = block[i];
    const match = line.match(/^\s*(const|let|var)\s+(\[?[a-zA-Z0-9_, ]+\]?)\s*=/);
    if (match) {
      const nameStr = match[2].replace(/[\[\]]/g, '').trim();
      const names = nameStr.split(',').map(n => n.trim());
      names.forEach(name => {
        decls.push({ name, lineNum: 144 + (blockNum === 1 ? 0 : 998) + i, content: line.trim() });
      });
    }
  }
  return decls;
}

const decls1 = getDecls(block1, 1);
const decls2 = getDecls(block2, 2);

console.log(`Block 1 has ${decls1.length} declarations.`);
console.log(`Block 2 has ${decls2.length} declarations.`);

const names1 = new Set(decls1.map(d => d.name));
const duplicates = decls2.filter(d => names1.has(d.name));

console.log(`\nFound ${duplicates.length} duplicate declarations in Block 2:`);
duplicates.forEach(d => {
  const original = decls1.find(o => o.name === d.name);
  console.log(`- "${d.name}" declared at line ${d.lineNum} (Original at line ${original.lineNum})`);
  console.log(`    Orig: "${original.content}"`);
  console.log(`    Dup:  "${d.content}"`);
});
