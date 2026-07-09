const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");
const lines = sourceText.split("\n");

const startLine = 5943;
const endLine = 6278;

function checkSyntax(modifiedText) {
  const sourceFile = ts.createSourceFile(
    filePath,
    modifiedText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  return sourceFile.parseDiagnostics || [];
}

// Keep outer divs, but clear the inner content of the modal body
const linesCopy = [...lines];
const cleanInnerLines = linesCopy.slice(0, 5947);
cleanInnerLines.push("                  Hello World");
const afterModalLines = linesCopy.slice(6274);
const testText = cleanInnerLines.concat(afterModalLines).join("\n");

const diagnostics = checkSyntax(testText);
console.log("Syntactic diagnostics with cleared modal body:", diagnostics.length);
for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(diag.file, diag.start);
  console.log(`Line ${line + 1}, Col ${character + 1}: ${diag.messageText}`);
}
