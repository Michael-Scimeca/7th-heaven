const fs = require("fs");
const path = require("path");

const fullPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/db788c89-e07f-48f3-bc24-5f424c20cc6a/.system_generated/logs/transcript_full.jsonl";
if (fs.existsSync(fullPath)) {
  const lines = fs.readFileSync(fullPath, "utf8").split("\n");
  lines.forEach(line => {
    if (line.includes("VIEW_FILE")) {
      try {
        const data = JSON.parse(line);
        if (data.step_index === 1075) {
          const fileContent = data.content;
          const rows = fileContent.split("\n");
          const targetRows = rows.filter(row => {
            const m = row.match(/^(\d+):/);
            if (m) {
              const lineNum = parseInt(m[1]);
              return lineNum >= 5080 && lineNum <= 5220;
            }
            return false;
          });
          console.log(targetRows.join("\n"));
        }
      } catch (e) {}
    }
  });
}
