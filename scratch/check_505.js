const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const brainDir = "/Users/michaelscimeca/.gemini/antigravity-ide/brain";

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

// Replay up to step 505 and 594 in memory to see their match status
execSync("git checkout -- " + targetFile);
let baseline = fs.readFileSync(targetFile, "utf8");

edits.forEach((edit, idx) => {
  const { name, args, step_index, tPath } = edit;
  
  if (tPath.startsWith("db788c89")) {
    if (step_index === 505 || step_index === 594) {
      console.log(`Checking [Edit ${idx + 1}] Step ${step_index} in db788c89:`);
      const target = args.TargetContent;
      console.log(`  Target exists in current baseline: ${baseline.includes(target)}`);
      // Print start snippet of target
      console.log(`  Target snippet:`, JSON.stringify(target.substring(0, 100)));
    }
  }
});
