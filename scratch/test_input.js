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

// Replace the Notes container with a simple input-based container
const startIdx = sourceText.indexOf("Shift Instructions / Notes");
if (startIdx === -1) {
  console.log("Could not find 'Shift Instructions / Notes' label!");
  process.exit(1);
}

const divStart = sourceText.lastIndexOf("<div>", startIdx);
const divEnd = sourceText.indexOf("</div>", startIdx);

if (divStart === -1 || divEnd === -1) {
  console.log("Could not find div boundaries around Notes!");
  process.exit(1);
}

const notesBlock = sourceText.substring(divStart, divEnd + "</div>".length);
console.log("Found notes block:\n", notesBlock);

const simpleInputBlock = `<div>
                      <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">Notes</label>
                      <input
                        type="text"
                        value={dropNotes}
                        onChange={(e) => { setDropNotes(e.target.value); }}
                        className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold"
                      />
                    </div>`;

const modified = sourceText.replace(notesBlock, simpleInputBlock);

const diagnostics = checkSyntax(modified);
console.log(`Found ${diagnostics.length} diagnostics with simple input:`);
for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(diag.file, diag.start);
  console.log(`Line ${line + 1}, Col ${character + 1}: ${diag.messageText}`);
}
