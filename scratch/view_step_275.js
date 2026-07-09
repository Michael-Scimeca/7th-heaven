const fs = require('fs');

const transcriptPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/db788c89-e07f-48f3-bc24-5f424c20cc6a/.system_generated/logs/transcript_full.jsonl";
const content = fs.readFileSync(transcriptPath, "utf8");
const lines = content.split("\n").filter(Boolean);

lines.forEach((line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index === 275) {
      console.log("Step 275 Data:", JSON.stringify(data, null, 2));
    }
  } catch (err) {}
});
