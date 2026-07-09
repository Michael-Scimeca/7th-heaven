const fs = require('fs');

const transcriptPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/db788c89-e07f-48f3-bc24-5f424c20cc6a/.system_generated/logs/transcript_full.jsonl";
const content = fs.readFileSync(transcriptPath, "utf8");
const lines = content.split("\n").filter(Boolean);

lines.forEach((line) => {
  try {
    const data = JSON.parse(line);
    if (data.tool_calls) {
      data.tool_calls.forEach(tc => {
        const text = JSON.stringify(tc);
        if (text.includes("calendarRange")) {
          console.log(`Step ${data.step_index}: Type: ${data.type} | Tool: ${tc.name}`);
          console.log(`  Snippet:`, JSON.stringify(tc.args.ReplacementContent ? tc.args.ReplacementContent.substring(0, 150) : ""));
        }
      });
    }
  } catch (err) {}
});
