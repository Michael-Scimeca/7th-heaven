const fs = require("fs");
const path = require("path");

const brainDir = "/Users/michaelscimeca/.gemini/antigravity-ide/brain";
const dirs = fs.readdirSync(brainDir);
dirs.forEach(dir => {
  const fullPath = path.join(brainDir, dir, ".system_generated/logs/transcript_full.jsonl");
  if (fs.existsSync(fullPath)) {
    const lines = fs.readFileSync(fullPath, "utf8").split("\n");
    lines.forEach(line => {
      if (line.includes("handleGoToToday") && line.includes("handlePrevWeek") && line.includes("<button")) {
        console.log(`Found in: ${dir}`);
        try {
          const data = JSON.parse(line);
          if (data.content) {
            console.log("Snippet content:\n", data.content.substring(0, 1500));
          }
        } catch (e) {}
      }
    });
  }
});
