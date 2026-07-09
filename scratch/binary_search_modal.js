const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");
const lines = sourceText.split("\n");

const startLine = 6211; // 0-based idx 6210
const endLine = 6444;   // 0-based idx 6443

function checkSyntax(modifiedText) {
  const sourceFile = ts.createSourceFile(
    filePath,
    modifiedText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const diags = sourceFile.parseDiagnostics || [];
  return diags.filter(d => {
    const { line } = ts.getLineAndCharacterOfPosition(sourceFile, d.start);
    return line >= 6445; // only look at the end of modal errors
  });
}

console.log("Binary searching current modal body...");

const numChunks = 10;
const chunkSize = Math.ceil((endLine - startLine) / numChunks);

for (let c = 0; c < numChunks; c++) {
  const cStart = startLine + c * chunkSize;
  const cEnd = Math.min(endLine, cStart + chunkSize);
  
  const linesCopy = [...lines];
  for (let i = cStart; i < cEnd; i++) {
    linesCopy[i] = "";
  }
  
  const diag = checkSyntax(linesCopy.join("\n"));
  console.log(`Chunk ${c + 1} (lines ${cStart + 1} to ${cEnd}): ${diag.length} errors at end of modal`);
}
