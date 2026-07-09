const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");

// Change the logical AND to a ternary condition
let modified = sourceText.replace(
  "{activeDropDay && draggedCrewMemberId && (",
  "{activeDropDay && draggedCrewMemberId ? ("
);

// Also replace the closing tag from:
//               </div>
//             )}
// to:
//               ) : null}

// Let's find the specific block to replace
const targetOld = `              </div>
            )}`;

const targetNew = `              ) : null}`;

if (modified.includes(targetOld)) {
  modified = modified.replace(targetOld, targetNew);
  console.log("Successfully replaced both in-memory!");
} else {
  console.log("Failed to find targetOld in memory!");
}

const sourceFile = ts.createSourceFile(
  filePath,
  modified,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

const diagnostics = sourceFile.parseDiagnostics || [];
console.log(`Found ${diagnostics.length} syntactic diagnostics with ternary:`);
for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, diag.start);
  const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
  console.log(`Line ${line + 1}, Col ${character + 1}: [TS${diag.code}] ${message}`);
}
