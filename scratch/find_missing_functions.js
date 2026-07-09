const fs = require('fs');

const transcriptPath = "/Users/michaelscimeca/.gemini/antigravity-ide/brain/b39cfa05-0624-4d5c-af19-e02b7f6e20b2/.system_generated/logs/transcript.jsonl";
const content = fs.readFileSync(transcriptPath, "utf8");
const lines = content.split("\n").filter(Boolean);

console.log("Searching transcript lines around steps 1100-1150...");

lines.forEach((line, idx) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index >= 1090 && data.step_index <= 1120) {
      console.log(`Step ${data.step_index}: Type: ${data.type}, Source: ${data.source}`);
      if (data.tool_calls) {
        console.log("  Tool Calls:", data.tool_calls.map(tc => tc.name));
        data.tool_calls.forEach(tc => {
          if (tc.arguments && tc.arguments.Instruction) {
            console.log("    Instruction:", tc.arguments.Instruction);
          }
          if (tc.arguments && tc.arguments.TargetContent) {
            console.log("    TargetContent snippet:", tc.arguments.TargetContent.substring(0, 100));
          }
        });
      }
    }
  } catch (err) {}
});
