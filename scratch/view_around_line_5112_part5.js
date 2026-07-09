const fs = require("fs");
const path = require("path");

const fullPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/db788c89-e07f-48f3-bc24-5f424c20cc6a/.system_generated/logs/transcript_full.jsonl";
if (fs.existsSync(fullPath)) {
  const lines = fs.readFileSync(fullPath, "utf8").split("\n");
  lines.forEach(line => {
    if (line.includes("VIEW_FILE")) {
      try {
        const data = JSON.parse(line);
        const fileContent = data.content;
        if (fileContent.includes("getWeekRangeLabel(currentWeekStart)")) {
          const rows = fileContent.split("\n");
          // Find the index of the row containing getWeekRangeLabel(currentWeekStart)
          const targetIdx = rows.findIndex(row => row.includes("getWeekRangeLabel(currentWeekStart)"));
          if (targetIdx !== -1) {
            console.log(`Found in step ${data.step_index}`);
            const start = Math.max(0, targetIdx - 10);
            const end = Math.min(rows.length - 1, targetIdx + 80);
            console.log(rows.slice(start, end).join("\n"));
            console.log("-----------------------------------------");
          }
        }
      } catch (e) {}
    }
  });
}
