const fs = require("fs");
const readline = require("readline");
const path = require("path");

const transcriptPath = path.join(
  "/Users/michaelscimeca/.gemini/antigravity-ide/brain/b39cfa05-0624-4d5c-af19-e02b7f6e20b2/.system_generated/logs/transcript_full.jsonl"
);
const outputPath = path.join(__dirname, "restored_diff.diff");

const rl = readline.createInterface({
  input: fs.createReadStream(transcriptPath),
  crlfDelay: Infinity
});

let found = false;

rl.on("line", (line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index === 2300) {
      if (data.content) {
        fs.writeFileSync(outputPath, data.content, "utf8");
        console.log("SUCCESS: Extracted full git diff to scratch/restored_diff.diff!");
        found = true;
      }
    }
  } catch (err) {}
});

rl.on("close", () => {
  if (!found) {
    console.log("Could not find step_index 2300 in transcript.");
  }
});
