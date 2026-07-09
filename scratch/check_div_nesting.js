const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");

const sourceFile = ts.createSourceFile(
  filePath,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

function findRenderCrewSchedule(node) {
  if (ts.isVariableDeclaration(node) && node.name.text === 'renderCrewSchedule') {
    return node;
  }
  return ts.forEachChild(node, findRenderCrewSchedule);
}

const node = findRenderCrewSchedule(sourceFile);
if (!node) {
  console.log("Could not find renderCrewSchedule node!");
  process.exit(1);
}

console.log("Found renderCrewSchedule. Traversing JSX elements to check open/close tags...");

const tags = [];
function traverse(n) {
  if (ts.isJsxElement(n)) {
    const startTag = n.openingElement.tagName.getText(sourceFile);
    const endTag = n.closingElement.tagName.getText(sourceFile);
    const startLine = ts.getLineAndCharacterOfPosition(sourceFile, n.openingElement.getStart(sourceFile)).line + 1;
    const endLine = ts.getLineAndCharacterOfPosition(sourceFile, n.closingElement.getStart(sourceFile)).line + 1;
    
    tags.push({ tag: startTag, startLine, endLine });
  } else if (ts.isJsxSelfClosingElement(n)) {
    const tag = n.tagName.getText(sourceFile);
    const startLine = ts.getLineAndCharacterOfPosition(sourceFile, n.getStart(sourceFile)).line + 1;
    tags.push({ tag, startLine, endLine: startLine, selfClosing: true });
  }
  ts.forEachChild(n, traverse);
}

traverse(node);

// Sort by start line
tags.sort((a, b) => a.startLine - b.startLine);

console.log("JSX Elements List (ordered by start line):");
for (const t of tags) {
  if (t.selfClosing) {
    console.log(`Line ${t.startLine}: <${t.tag} />`);
  } else {
    console.log(`Lines ${t.startLine}-${t.endLine}: <${t.tag}> ... </${t.tag}>`);
  }
}
