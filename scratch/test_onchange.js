const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const sourceText = fs.readFileSync(filePath, "utf8");
const lines = sourceText.split("\n");

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

// 1. Remove line 6333 (idx 6332)
const linesTest = [...lines];
linesTest[6332] = ""; // remove </div> on line 6333

// 2. Add an extra </div> at the end of renderCrewSchedule (right before section ends)
// Let's locate the end of renderCrewSchedule in the modified lines
// The end is:
//           </div>
//         </div>
//     </section>
// We will replace it with:
//           </div>
//         </div>
//       </div>
//     </section>

const modifiedText = linesTest.join("\n");
const targetOld = `          </div>
        </div>
    </section>`;

const targetNew = `          </div>
        </div>
      </div>
    </section>`;

if (modifiedText.includes(targetOld)) {
  const finalModified = modifiedText.replace(targetOld, targetNew);
  const diagnostics = checkSyntax(finalModified);
  console.log(`Found ${diagnostics.length} diagnostics with both changes:`);
  for (const diag of diagnostics) {
    const { line, character } = ts.getLineAndCharacterOfPosition(diag.file, diag.start);
    console.log(`Line ${line + 1}, Col ${character + 1}: ${diag.messageText}`);
  }
} else {
  console.log("Could not find targetOld block!");
}
