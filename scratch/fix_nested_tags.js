const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Normalize newlines to LF
content = content.replace(/\r\n/g, "\n");

console.log("Original content size:", content.length);

// Fix the activeDropDay && draggedCrewMemberId modal closing mismatch (change })()} to )})
const modalOld = `                      {editingShiftId && (
                        <button
                          onClick={() => {
                            deleteScheduleItem(editingShiftId);
                            setActiveDropDay(null);
                            setDraggedCrewMemberId(null);
                            setEditingShiftId(null);
                          }}
                          className="w-full py-2.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-200 hover:text-white font-black text-xs uppercase tracking-[0.2em] rounded-lg transition-all cursor-pointer"
                        >
                          Delete Shift
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              );
            })()}`;

const modalNew = `                      {editingShiftId && (
                        <button
                          onClick={() => {
                            deleteScheduleItem(editingShiftId);
                            setActiveDropDay(null);
                            setDraggedCrewMemberId(null);
                            setEditingShiftId(null);
                          }}
                          className="w-full py-2.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-200 hover:text-white font-black text-xs uppercase tracking-[0.2em] rounded-lg transition-all cursor-pointer"
                        >
                          Delete Shift
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}`;

if (content.includes(modalOld)) {
  console.log("Found Configure Shift modal closing mismatch. Repairing...");
  content = content.replace(modalOld, modalNew);
} else {
  console.log("Warning: Configure Shift modal closing mismatch pattern not found!");
}

const lines = content.split("\n");

// 2. Fix profiles end block extra closing div in renderRegistry
const credentialsLostIdx = lines.findIndex(l => l.includes("Credentials lost (Check browser history or re-create account)"));
if (credentialsLostIdx !== -1) {
  const tdCloseIdx = lines.findIndex((l, idx) => idx > credentialsLostIdx && l.includes("</td>"));
  if (tdCloseIdx !== -1) {
    console.log("Lines around tdCloseIdx inside renderRegistry:");
    for (let i = credentialsLostIdx + 1; i <= tdCloseIdx; i++) {
      console.log(`  Line ${i + 1}: "${lines[i]}"`);
    }
    // Remove the extra closing div
    for (let i = tdCloseIdx - 1; i > credentialsLostIdx; i--) {
      if (lines[i].trim() === "</div>") {
        console.log(`Removing extra closing div at line ${i + 1}: "${lines[i]}"`);
        lines[i] = "";
        break;
      }
    }
  }
} else {
  console.log("Warning: Credentials lost line not found!");
}

// 6. Fix renderCrewSms collapsible display div close
const crewSmsIdx = lines.findIndex(l => l.includes("const renderCrewSms ="));
if (crewSmsIdx !== -1) {
  const newsletterIdx = lines.findIndex(l => l.includes("const renderNewsletter ="));
  if (newsletterIdx !== -1) {
    for (let i = newsletterIdx - 1; i > crewSmsIdx; i--) {
      if (lines[i].includes("</section>")) {
        console.log(`Adding missing closing div for crewsms display container before </section> at line ${i + 1}`);
        lines[i] = "              </div>\n" + lines[i];
        break;
      }
    }
  }
} else {
  console.log("Warning: crewSmsIdx not found!");
}

fs.writeFileSync(filePath, lines.join("\n"), "utf8");
console.log("Dynamic scanner syntax patching complete!");
