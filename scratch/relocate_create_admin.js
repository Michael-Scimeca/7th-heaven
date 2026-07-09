const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Normalize CRLF to LF
content = content.replace(/\r\n/g, "\n");

// 1. Locate and extract createAdmin
const startKey = "  const createAdmin = async () => {";
const startIdx = content.indexOf(startKey);

if (startIdx === -1) {
  console.log("Error: createAdmin declaration not found!");
  process.exit(1);
}

// Find the ending }; of createAdmin
let endIdx = -1;
let openBraces = 0;
for (let i = startIdx; i < content.length; i++) {
  if (content[i] === '{') openBraces++;
  if (content[i] === '}') {
    openBraces--;
    if (openBraces === 0) {
      // Find the next newline or semicolon
      endIdx = content.indexOf("\n", i) + 1;
      break;
    }
  }
}

if (endIdx === -1) {
  console.log("Error: Ending of createAdmin not found!");
  process.exit(1);
}

const createAdminBlock = content.substring(startIdx, endIdx);
console.log("Successfully extracted createAdminBlock:\n", createAdminBlock);

// Remove createAdminBlock from its current location
content = content.substring(0, startIdx) + content.substring(endIdx);

// 2. Locate the end of createCrew
const crewKey = "    setCrewLoading(false);\n  };";
const crewIdx = content.indexOf(crewKey);

if (crewIdx === -1) {
  console.log("Error: End of createCrew not found!");
  process.exit(1);
}

const insertIdx = crewIdx + crewKey.length;

// Insert createAdminBlock right after createCrew
content = content.substring(0, insertIdx) + "\n\n" + createAdminBlock.trim() + "\n" + content.substring(insertIdx);

fs.writeFileSync(filePath, content, "utf8");
console.log("Relocation of createAdmin complete!");
