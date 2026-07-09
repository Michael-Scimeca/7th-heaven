const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");

const targetOld = `                    <div>
                      <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">Shift Instructions / Notes</label>
                      <textarea
                        rows={3}
                        value={dropNotes}
                        onChange={e => setDropNotes(e.target.value)}
                        placeholder="e.g. Bring backup gear, report to backstage entrance"
                        className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold resize-none"
                      />
                    </div>`;

const targetNew = `                    <div>
                      <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">Shift Instructions / Notes</label>
                      <textarea
                        rows={3}
                        value={dropNotes}
                        onChange={(e) => setDropNotes(e.target.value)}
                        placeholder="e.g. Bring backup gear, report to backstage entrance"
                        className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold resize-none"
                      ></textarea>
                    </div>`;

let modified = sourceText;
if (modified.includes(targetOld)) {
  modified = modified.replace(targetOld, targetNew);
  console.log("Successfully replaced in memory!");
} else {
  // Try matching with different indentations
  console.log("targetOld not found exactly. Let's do a substring search.");
  const idx = modified.indexOf("Shift Instructions / Notes");
  if (idx !== -1) {
    console.log("Found Notes label at index:", idx);
  }
}

const sourceFile = ts.createSourceFile(
  filePath,
  modified,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

const diagnostics = sourceFile.parseDiagnostics || [];
console.log(`Found ${diagnostics.length} syntactic diagnostics with modified textarea:`);
for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, diag.start);
  const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
  console.log(`Line ${line + 1}, Col ${character + 1}: [TS${diag.code}] ${message}`);
}
