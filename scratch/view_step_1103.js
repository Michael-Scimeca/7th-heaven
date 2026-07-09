const fs = require('fs');

const transcriptPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/b39cfa05-0624-4d5c-af19-e02b7f6e20b2/.system_generated/logs/transcript_full.jsonl";
const content = fs.readFileSync(transcriptPath, "utf8");
const lines = content.split("\n").filter(Boolean);

lines.forEach((line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index === 1103) {
      console.log("Step 1103 Data:", JSON.stringify(data, null, 2));
    }
  } catch (err) {}
});
