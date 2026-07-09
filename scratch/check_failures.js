const fs = require('fs');
const path = require('path');

const targetFile = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const brainDir = "/Users/michaelscimeca/.gemini/antigravity-ide/brain";

// Recreate the sorted edits array exactly like super_replay.js
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
  const lines = fs.readFileSync(tPath, "utf8").split("\n").filter(Boolean);
  lines.forEach((line) => {
    try {
      const data = JSON.parse(line);
      if (data.tool_calls) {
        data.tool_calls.forEach(tc => {
          const name = tc.name;
          const args = tc.args || {};
          const isTarget = args.TargetFile && (
            args.TargetFile.endsWith("admin/page.tsx") || 
            args.TargetFile === targetFile
          );
          if (isTarget && !args.ArtifactMetadata) {
            if (name === "replace_file_content" || name === "multi_replace_file_content" || name === "write_to_file") {
              edits.push({
                created_at: data.created_at || "2000-01-01T00:00:00Z",
                step_index: data.step_index,
                name,
                args,
                tPath: path.basename(path.dirname(path.dirname(path.dirname(tPath))))
              });
            }
          }
        });
      }
    } catch (err) {}
  });
});

edits.sort((a, b) => {
  const timeDiff = new Date(a.created_at) - new Date(b.created_at);
  if (timeDiff !== 0) return timeDiff;
  return a.step_index - b.step_index;
});

// Run replay in memory and track failures
let currentContent = fs.readFileSync(targetFile + ".orig", "utf8"); // start from orig backup just in case
let baselineContent = fs.readFileSync(targetFile, "utf8");

console.log("Analyzing edit failures chronologically...");

edits.forEach((edit, idx) => {
  const { name, args, step_index, tPath } = edit;
  let matched = false;
  
  if (name === "write_to_file") {
    matched = true;
  } else if (name === "replace_file_content") {
    matched = baselineContent.includes(args.TargetContent);
  } else if (name === "multi_replace_file_content") {
    matched = (args.ReplacementChunks || []).every(c => baselineContent.includes(c.TargetContent));
  }
  
  if (!matched) {
    console.log(`Edit ${idx + 1}/${edits.length} FAILED: Conv: ${tPath.substring(0, 8)} | Step ${step_index} | ${name}`);
    if (name === "replace_file_content") {
      console.log("  Target first line:", JSON.stringify(args.TargetContent.split("\n")[0]));
    }
  }
});
