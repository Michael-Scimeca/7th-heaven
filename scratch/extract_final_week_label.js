const fs = require("fs");
const path = require("path");

const fullPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/db788c89-e07f-48f3-bc24-5f424c20cc6a/.system_generated/logs/transcript_full.jsonl";
if (fs.existsSync(fullPath)) {
  const lines = fs.readFileSync(fullPath, "utf8").split("\n");
  lines.reverse().forEach(line => {
    if (line.includes("getWeekRangeLabel")) {
      try {
        const data = JSON.parse(line);
        if (data.type === "CODE_ACTION") {
          console.log(`Found CODE_ACTION at step ${data.step_index}`);
          console.log(data.content);
          console.log("=========================================");
        }
      } catch (e) {}
    }
  });
}
