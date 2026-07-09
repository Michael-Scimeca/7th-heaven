const fs = require("fs");
const readline = require("readline");
const path = require("path");

const prevTranscriptPath = path.join(
  "/Users/michaelscimeca/.gemini/antigravity-ide/brain/db788c89-e07f-48f3-bc24-5f424c20cc6a/.system_generated/logs/transcript_full.jsonl"
);

if (!fs.existsSync(prevTranscriptPath)) {
  console.log("Previous transcript not found.");
  process.exit(1);
}

const rl = readline.createInterface({
  input: fs.createReadStream(prevTranscriptPath),
  crlfDelay: Infinity
});

let index = 0;

rl.on("line", (line) => {
  try {
    const data = JSON.parse(line);
    if (data.tool_calls && Array.isArray(data.tool_calls)) {
      data.tool_calls.forEach((tool, tIdx) => {
        if (
          (tool.name === "replace_file_content" || tool.name === "write_to_file" || tool.name === "multi_replace_file_content") &&
          tool.args &&
          tool.args.TargetFile &&
          tool.args.TargetFile.endsWith("src/app/admin/page.tsx")
        ) {
          console.log(`FOUND edit in previous conversation at step ${data.step_index}: ${tool.name}`);
          index++;
        }
      });
    }
  } catch (err) {}
});

rl.on("close", () => {
  console.log(`Finished. Found ${index} edits.`);
});
