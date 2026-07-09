const fs = require("fs");
const path = require("path");

const fullPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/db788c89-e07f-48f3-bc24-5f424c20cc6a/.system_generated/logs/transcript_full.jsonl";
if (fs.existsSync(fullPath)) {
  const lines = fs.readFileSync(fullPath, "utf8").split("\n");
  lines.forEach(line => {
    if (line.includes("wiw-scheduler-container") && line.includes("getWeekRangeLabel")) {
      try {
        const data = JSON.parse(line);
        if (data.content && data.content.includes("handleGoToToday")) {
          const idx = data.content.indexOf("wiw-scheduler-container");
          console.log("Snippet content:\n", data.content.substring(idx - 100, idx + 4500));
        }
      } catch (e) {}
    }
  });
}
