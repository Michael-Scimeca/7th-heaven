const fs = require("fs");
const path = require("path");

const brainDir = "/Users/michaelscimeca/.gemini/antigravity-ide/brain";
const originalFile = path.join(__dirname, "../src/app/admin/page.tsx");

const transcriptFiles = [];
if (fs.existsSync(brainDir)) {
  const dirs = fs.readdirSync(brainDir);
  dirs.forEach(dir => {
    const fullPath = path.join(brainDir, dir, ".system_generated/logs/transcript_full.jsonl");
    const normalPath = path.join(brainDir, dir, ".system_generated/logs/transcript.jsonl");
    if (fs.existsSync(fullPath)) {
      transcriptFiles.push(fullPath);
    } else if (fs.existsSync(normalPath)) {
      transcriptFiles.push(normalPath);
    }
  });
}

const edits = [];

transcriptFiles.forEach(tPath => {
  const content = fs.readFileSync(tPath, "utf8");
  const lines = content.split("\n").filter(Boolean);
  const steps = lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);

  steps.forEach((step, index) => {
    if (step.type === "PLANNER_RESPONSE" && step.tool_calls && Array.isArray(step.tool_calls)) {
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
            edits.push({
              created_at: step.created_at || "2000-01-01T00:00:00Z",
              step_index: step.step_index,
              name: tool.name,
              args: tool.args,
              origin: path.basename(path.dirname(path.dirname(path.dirname(tPath))))
            });
          }
        });
      }
    }
  });
});

edits.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

console.log(`Total edits sorted: ${edits.length}`);

let fileContent = fs.readFileSync(originalFile, "utf8");
let successCount = 0;
let failCount = 0;

edits.forEach((edit, idx) => {
  const { name, args, created_at, step_index, origin } = edit;
  
  if (name === "replace_file_content") {
    const target = args.TargetContent;
    const replacement = args.ReplacementContent;
    if (!fileContent.includes(target)) {
      console.log(`FAIL [${created_at}] Step ${step_index} in ${origin} (${name}) -> Target not found`);
      failCount++;
    } else {
      fileContent = fileContent.replace(target, replacement);
      successCount++;
    }
  } else if (name === "multi_replace_file_content") {
    const chunks = args.ReplacementChunks || args.ReplacementContent;
    if (Array.isArray(chunks)) {
      let allChunksFound = true;
      chunks.forEach((chunk, cIdx) => {
        const target = chunk.TargetContent;
        const replacement = chunk.ReplacementContent;
        if (!fileContent.includes(target)) {
          allChunksFound = false;
        } else {
          fileContent = fileContent.replace(target, replacement);
        }
      });
      if (!allChunksFound) {
        console.log(`FAIL [${created_at}] Step ${step_index} in ${origin} (${name}) -> One or more chunks not found`);
        failCount++;
      } else {
        successCount++;
      }
    } else {
      console.log(`FAIL [${created_at}] Step ${step_index} in ${origin} (${name}) -> No chunks`);
      failCount++;
    }
  } else if (name === "write_to_file") {
    if (args.Overwrite) {
      fileContent = args.CodeContent;
      console.log(`SUCCESS [${created_at}] Step ${step_index} in ${origin} (${name}) -> Overwrote file`);
      successCount++;
    }
  }
});
