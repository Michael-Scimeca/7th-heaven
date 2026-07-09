const fs = require("fs");
const path = require("path");

const fullPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/db788c89-e07f-48f3-bc24-5f424c20cc6a/.system_generated/logs/transcript_full.jsonl";
if (fs.existsSync(fullPath)) {
  const lines = fs.readFileSync(fullPath, "utf8").split("\n");
  lines.forEach(line => {
    if (line.includes("VIEW_FILE")) {
      try {
        const data = JSON.parse(line);
        if (data.step_index === 245) {
          console.log(`Found step 245!`);
          const fileContent = data.content;
          // We want to print lines 4910 to 5080.
          // Since the file has line numbers in the format "4910: content", we can look for that.
          const rows = fileContent.split("\n");
          const targetRows = rows.filter(row => {
            const m = row.match(/^(\d+):/);
            if (m) {
              const lineNum = parseInt(m[1]);
              return lineNum >= 4910 && lineNum <= 5080;
            }
            return false;
          });
          console.log(targetRows.join("\n"));
        }
      } catch (e) {}
    }
  });
}
