const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../src/app/admin/page.tsx");
let content = fs.readFileSync(filePath, "utf8");
const lines = content.split("\n");

// 1. Delete duplicate handleBanCruiseUser function
// We find where the duplicate starts (line 1251 is roughly index 1250)
let dupStart = -1;
let dupEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const handleBanCruiseUser = async (senderName: string) => {")) {
    if (dupStart === -1) {
      dupStart = i;
    } else {
      // This is the second one
      dupStart = i;
      // Find where it ends (the matching close brace of the function)
      // Since it's exactly duplicated, let's count braces or look for the next function declaration or state
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].includes("const handleAdminLogin = async (e: React.FormEvent) => {")) {
          dupEnd = j;
          break;
        }
      }
      break;
    }
  }
}

if (dupStart !== -1 && dupEnd !== -1) {
  console.log(`Removing duplicate handleBanCruiseUser function from line ${dupStart + 1} to ${dupEnd}`);
  lines.splice(dupStart, dupEnd - dupStart);
}

// Write the file back to update line numbers for subsequent step checks
fs.writeFileSync(filePath, lines.join("\n"), "utf8");
content = fs.readFileSync(filePath, "utf8");
const lines2 = content.split("\n");

// 2. Fix the unclosed else block inside the calendar loader
// Let's find: if (currentSchedules.length === 0)
let scheduleIndex = -1;
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes("if (currentSchedules.length === 0) {")) {
    scheduleIndex = i;
    break;
  }
}
if (scheduleIndex !== -1) {
  // Look for the mock list closing bracket
  for (let j = scheduleIndex; j < lines2.length; j++) {
    if (lines2[j].trim() === "];" && lines2[j + 1].trim() === "}") {
      console.log(`Fixing unclosed else block at line ${j + 2}`);
      lines2.splice(j + 2, 0, "          }");
      break;
    }
  }
}

// 3. Remove/replace stray Collapsible tags, stray div, and CustomScrollbar
for (let i = 0; i < lines2.length; i++) {
  // Shopify render function collapsible
  if (lines2[i].includes("</Collapsible>") && i < 2600) {
    console.log(`Removing stray </Collapsible> at line ${i + 1}`);
    lines2[i] = "";
  }
  // Fan photo moderation collapsible
  if (lines2[i].includes("</Collapsible>") && i > 2800 && i < 3000) {
    console.log(`Replacing stray </Collapsible> with </div> at line ${i + 1}`);
    lines2[i] = "              </div>";
  }
  // Referral Program collapsible
  if (lines2[i].includes("</Collapsible>") && i > 3900 && i < 4100) {
    console.log(`Replacing stray </Collapsible> with </div> at line ${i + 1}`);
    lines2[i] = "              </div>";
  }
  // CustomScrollbar
  if (lines2[i].includes("</CustomScrollbar>")) {
    console.log(`Removing stray </CustomScrollbar> at line ${i + 1}`);
    lines2[i] = "";
  }
  // renderCrewSms stray fragment
  if (lines2[i].includes("</>}")) {
    console.log(`Removing stray </>} at line ${i + 1}`);
    lines2[i] = "";
  }
}

// 4. Close space-y-4 in renderSmsBlast and remove the extra closing div
// Let's locate the Proximity SMS send button closing tag
let smsSendIndex = -1;
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes("📡 Send Proximity Blast")) {
    smsSendIndex = i;
    break;
  }
}
if (smsSendIndex !== -1) {
  // Look for the end of the button/div containing it
  for (let j = smsSendIndex; j < lines2.length; j++) {
    if (lines2[j].includes("{/* Automated Crew Reminders Sub-section */}")) {
      console.log(`Closing space-y-4 before auto crew reminders at line ${j + 1}`);
      lines2.splice(j, 0, "                  </div>");
      break;
    }
  }
}

// Write the file back to update line numbers for subsequent step checks
fs.writeFileSync(filePath, lines2.join("\n"), "utf8");
content = fs.readFileSync(filePath, "utf8");
const lines3 = content.split("\n");

// Now find and remove the extra closing div in renderSmsBlast (now shifted due to insertions)
// Let's locate the end of renderSmsBlast
let smsBlastEnd = -1;
for (let i = 0; i < lines3.length; i++) {
  if (lines3[i].includes("const renderCrewSms = () => (")) {
    smsBlastEnd = i;
    break;
  }
}
if (smsBlastEnd !== -1) {
  // Look backwards for the closing div block
  for (let j = smsBlastEnd - 1; j > 0; j--) {
    if (lines3[j].includes("</div>") && lines3[j - 1].includes("</div>") && lines3[j - 2].includes("</div>")) {
      console.log(`Removing extra closing div at line ${j + 1}`);
      lines3.splice(j, 1);
      break;
    }
  }
}

// 5. Fix stray })()}` at the end of the shift configuration modal
let shiftConfigEnd = -1;
for (let i = 0; i < lines3.length; i++) {
  if (lines3[i].includes("const renderAwardPicks = () => (")) {
    shiftConfigEnd = i;
    break;
  }
}
if (shiftConfigEnd !== -1) {
  // Look backwards for })()}
  for (let j = shiftConfigEnd - 1; j > 0; j--) {
    if (lines3[j].includes("})()}")) {
      console.log(`Replacing })()} with )} at line ${j + 1}`);
      lines3[j] = lines3[j].replace("})()}", ")}");
      break;
    }
  }
}

fs.writeFileSync(filePath, lines3.join("\n"), "utf8");
console.log("Syntax fix script completed successfully!");
