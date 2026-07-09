const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");

// Parse only syntactic diagnostics
const sourceFile = ts.createSourceFile(
  filePath,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

const diagnostics = sourceFile.parseDiagnostics || [];

console.log(`Found ${diagnostics.length} syntactic diagnostics:`);
for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, diag.start);
  const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
  console.log(`Line ${line + 1}, Col ${character + 1}: [TS${diag.code}] ${message}`);
}
