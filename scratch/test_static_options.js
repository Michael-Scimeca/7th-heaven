const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");

const startIdx = sourceText.indexOf("Pick Tour Date");
if (startIdx === -1) {
  console.log("Could not find 'Pick Tour Date' label!");
  process.exit(1);
}

const selectStart = sourceText.indexOf("<select", startIdx);
const selectEnd = sourceText.indexOf("</select>", selectStart);

if (selectStart === -1 || selectEnd === -1) {
  console.log("Could not find select tags around Pick Tour Date!");
  process.exit(1);
}

const selectBlock = sourceText.substring(selectStart, selectEnd + "</select>".length);
console.log("Found select block:\n", selectBlock);

const staticSelectBlock = `<select
                            value={activeDropDay || ''}
                            onChange={(e) => {
                              const chosenDate = e.target.value;
                              if (!chosenDate) return;
                              setActiveDropDay(chosenDate);
                            }}
                            className="w-full appearance-none pr-8 px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold cursor-pointer"
                          >
                            <option value="" disabled>— Select a tour show —</option>
                            <option value="test">Test Show</option>
                          </select>`;

const modified = sourceText.replace(selectBlock, staticSelectBlock);

const sourceFile = ts.createSourceFile(
  filePath,
  modified,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

const diagnostics = sourceFile.parseDiagnostics || [];
console.log(`Found ${diagnostics.length} syntactic diagnostics with static select:`);
for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, diag.start);
  const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
  console.log(`Line ${line + 1}, Col ${character + 1}: [TS${diag.code}] ${message}`);
}
