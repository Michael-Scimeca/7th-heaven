const fs = require("fs");
const path = require("path");

const fullPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/5b928c13-b0a2-435e-b7e0-d92d8b4f05e1/.system_generated/logs/transcript_full.jsonl";
if (fs.existsSync(fullPath)) {
  const lines = fs.readFileSync(fullPath, "utf8").split("\n");
  lines.forEach(line => {
    if (line.includes("CODE_ACTION")) {
      try {
        const data = JSON.parse(line);
        const content = data.content;
        if (content.includes("getWeekRangeLabel")) {
          console.log(`Found CODE_ACTION in step ${data.step_index}`);
          console.log(content);
          console.log("-----------------------------------------");
        }
      } catch (e) {}
    }
  });
}
