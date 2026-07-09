const fs = require('fs');

const transcriptPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/b39cfa05-0624-4d5c-af19-e02b7f6e20b2/.system_generated/logs/transcript_full.jsonl";
const content = fs.readFileSync(transcriptPath, "utf8");
const lines = content.split("\n").filter(Boolean);

lines.forEach((line) => {
  try {
    const data = JSON.parse(line);
    if (data.tool_calls) {
      data.tool_calls.forEach(tc => {
        const text = JSON.stringify(tc);
        if (text.includes("useState") && tc.name !== "write_to_file") {
          console.log(`Step ${data.step_index}: Type: ${data.type} | Tool: ${tc.name}`);
          console.log(`  Instruction: ${tc.args.Instruction}`);
          console.log(`  Snippet:`, JSON.stringify(tc.args.ReplacementContent ? tc.args.ReplacementContent.substring(0, 150) : ""));
        }
      });
    }
  } catch (err) {}
});
