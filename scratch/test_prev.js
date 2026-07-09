const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");

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
    return line >= 6440;
  });
}

const modified = sourceText.replace(
  "setShowRoleDropdown(prev => !prev);",
  "setShowRoleDropdown((prev) => !prev);"
);

const diagnostics = checkSyntax(modified);
console.log(`Found ${diagnostics.length} diagnostics with wrapped prev:`);
for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(diag.file, diag.start);
  console.log(`Line ${line + 1}, Col ${character + 1}: ${diag.messageText}`);
}
