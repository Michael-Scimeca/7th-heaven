const fs = require("fs");
const path = require("path");

const transcriptPath = path.join(
  "/Users/michaelscimeca/.gemini/antigravity-ide/brain/b39cfa05-0624-4d5c-af19-e02b7f6e20b2/.system_generated/logs/transcript_full.jsonl"
);
const outputDir = path.join(__dirname, "admin_edits");

if (fs.existsSync(outputDir)) {
  fs.readdirSync(outputDir).forEach(file => {
    fs.unlinkSync(path.join(outputDir, file));
  });
} else {
  fs.mkdirSync(outputDir);
}

const lines = fs.readFileSync(transcriptPath, "utf8").split("\n").filter(Boolean);
const steps = lines.map(line => {
  try {
    return JSON.parse(line);
  } catch (err) {
    return null;
  }
}).filter(Boolean);

let savedCount = 0;

steps.forEach((step, index) => {
  if (step.type === "PLANNER_RESPONSE" && step.tool_calls && Array.isArray(step.tool_calls)) {
    // Check if the next step was an error
    const nextStep = steps[index + 1];
    const isError = nextStep && nextStep.type === "ERROR_MESSAGE";
    
    if (!isError) {
      step.tool_calls.forEach((tool, tIdx) => {
        if (
          (tool.name === "replace_file_content" || tool.name === "write_to_file" || tool.name === "multi_replace_file_content") &&
          tool.args &&
          tool.args.TargetFile &&
          tool.args.TargetFile.endsWith("src/app/admin/page.tsx")
        ) {
          const outName = `edit_${step.step_index}_tool_${tIdx}.json`;
          fs.writeFileSync(
            path.join(outputDir, outName),
            JSON.stringify({ step_index: step.step_index, name: tool.name, args: tool.args }, null, 2),
            "utf8"
          );
          console.log(`Saved successful edit: ${outName}`);
          savedCount++;
        }
      });
    } else {
      console.log(`Skipped failed edit at step ${step.step_index}`);
    }
  }
});

console.log(`Finished. Saved ${savedCount} successful edits.`);
